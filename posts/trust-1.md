{
	"title": "Exploring Terraria's Server Protocol (trust pt. 1)",
	"date": 1707490172482,
	"tags": ["trust", "python", "tcp", "reverse-engineering"]
}
---

Greetings, traveler. Welcome to my series on attempting to implement a game server for [Terraria](https://store.steampowered.com/app/105600/Terraria/), my personal favorite game.

## Motivation

I played Terraria on my X-Box 360 in 2013, on my PC in 2015, and on my phone in 2016. The numbers might not be perfectly accurate, but it's safe to say that I really like the game. I purchased it three times, after all. Since 2018, I've gradually become more interested in servers and reverse engineering.

[TShock](https://github.com/Pryaxis/TShock) is a dedicated Terraria server that uses [Open Terraria API](https://github.com/SignatureBeef/Open-Terraria-API), which rewrites and hooks into the original Terraria server binary to expose the internal Terraria C# API. It works well and is not a Terraria server written from scratch, but rather an extension to the original server.

After a bit of searching, it appears that no one has actually fully written a Terraria server from scratch. Perhaps that's for a good reason and I'm doing something stupid here. I wouldn't be surprised if someone has successfully done this before.

I'm still learning Rust, and I'm quite far from basic competency, but I'd like to reverse engineer the server protocol and create a _🚀⚡blazing fast 🚀⚡_ vanilla game server in Rust that I can connect to with the native Terraria client.

Basically, I'm doing this because I like Terraria. I like reverse engineering things. And I want to get better at Rust. I'm not sure how I'll manage discussing implementation details, since most of it is pretty boring. I will try my best to make the content interesting. If you want to see the code, the repository will always be [here](https://github.com/xDimGG/trust).

## Choosing Our Method

We have two main ways that we can approach this.

1. We can decompile the server executable that is shipped with the Steam game and figure out how it does everything.
2. We can create a man-in-the-middle proxy server to capture the raw data being sent between client and server.

Before jumping straight to a disassembler, we should check out what language Terraria is written in. If we google "what is terraria written in", we can see that it's written in C#. C# can be decompiled by a variety of software, but my personal favorite is [dotPeek](https://www.jetbrains.com/decompiler/), a free .NET decompiler and assembly browser.

## Decompiling Executables

If we navigate to Steam, right click on Terraria, go to Properties, go to Local Files, and click Browse, Terraria's folder will open up. There exist two files of interest: `Terraria.exe` and `TerrariaServer.exe`. Let's go ahead and open up the latter in dotPeek. Expanding the Terraria element, we see a plethora of classes and namespaces. I prefer working in VS Code so I exported the project and opened up the folder in there.

![vs code screenshot](/trust-1-1.png)

At least they're human readable. In here, there are two files that concern us. `MessageBuffer.cs` and `NetMessage.cs`. `NetMessage.cs` has a `SendData` method which takes some parameters and produces a binary message to be sent over the wire. `MessageBuffer.cs` has a `GetData` which uses its internal buffer to parse a binary message.

Hold on. How did I pluck out these two methods out of the mess that is 100+ C# files? A lot of poking around is how. I skimmed through a few files and noticed that a lot of them were making calls to `NetMessage.SendData` whenever some the client performs an action. After opening up the file, I found a huge switch statement, so I figured that this method probably had something to do with encoding. I found `MessageBuffer.GetData` through more poking around. The name seemed important and it also had a huge switch statement. Anyway, here's a snippet of what `NetMessage.SendData` looks like:

```cs
public static void SendData(
	int msgType,
	int remoteClient = -1,
	int ignoreClient = -1,
	NetworkText text = null,
	int number = 0,
	/* 3 more floats and 3 more ints */
	) {
		// ...
		// index to our own writer
		int index1 = 256;
		// if we are server and are sending to some particular client, use their writer index
		if (Main.netMode == 2 && remoteClient >= 0)
			index1 = remoteClient;

		lock (NetMessage.buffer[index1]) {
			BinaryWriter writer = NetMessage.buffer[index1].writer; // get the writer for this 
			if (writer == null) {
				NetMessage.buffer[index1].ResetWriter();
				writer = NetMessage.buffer[index1].writer;
			}
			long position1 = writer.BaseStream.Position; // get our current position
			writer.BaseStream.Position += 2L; // skip the first two bytes
			writer.Write((byte) msgType); // write a byte containing the message type
			switch (msgType) { // perform the rest of the encoding based on the message type
				case 1:
					writer.Write("Terraria" + (object) 279);
					break;
				case 2:
					// ... all the way up to 147 as of Terraria 1.4.4.9
			}
			int position2 = (int) writer.BaseStream.Position; // get the current length of our data
			writer.BaseStream.Position = position1; // set our buffer position to the start
			writer.Write((ushort) position2); // write our length as the first two bytes
			writer.BaseStream.Position = (long) position2; // move our cursor back to the end
			// ...
		}
	}
```

If we go back to `NetMessage`, we can find the following line defining `buffer`.

```cs
public BinaryWriter writer;
```

`BinaryWriter` is just a standard .NET class whose documentation can be found [here](https://learn.microsoft.com/en-us/dotnet/api/system.io.binarywriter.write). If we read the documentation, we see that numbers are written using [little endian byte ordering](https://betterexplained.com/articles/understanding-big-and-little-endian-byte-order/). That's enough C# for now. Let's create a man-in-the-middle proxy server.

## Making an MITM Proxy to Decode Messages

For those who are not familiar, man-in-the-middle means we will have a server that sits between the client and the server and handles communication. Proxy means we're just passing the information down. What we'll have to do to get this working is start up a legitimate Terraria server on some port, say 7778, and start our proxy server on some other port, say 7777, and have the Terraria client conect to our proxy on port 7777. The proxy will receive data from the client and send it to the server and vice versa.

While the packet is in transit, we can log it to see what kind of interesting packets are being sent. This gives us a high-level view of the protocol and will make it easier to figure out what to look for in the C# files. *Spoiler: we may also modify the packet while it is in transit to produce some interesting behavior on the client and server.*

For this part, I'll just be using Python. It's a good language for prototyping this kinda of thing. First off, let's define our ports and hosts. Everything we're doing will be on localhost so I'm just using one constant to represent both.

```py
HOST = '127.0.0.1' # localhost
PORT = 7777  # Port to listen on (non-privileged ports are > 1023)
REAL_PORT = 7778 # Port on which the actual Terraria server is already running
```

Now, let's create a TCP server that can handle multiple clients. Handling multiple clients won't be necessary for a while, but it's nice to have.

```py
import socket
from threading import Thread

def start_proxy(client):
	try:
		with client:
			with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as server:
				server.connect((HOST, REAL_PORT))

				threads = [ # we will define copy() in a moment
					Thread(target=copy, args=(client, server, '[c->s]:')),
					Thread(target=copy, args=(server, client, '[s->c]:')),
				]
				for t in threads: t.start()
				for t in threads: t.join()

		print(f'Client has disconnected or true server stopped')
	except:
		pass

with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
	s.bind((HOST, PORT))
	s.listen()
	print(f'Proxy started on port {PORT}')

	while True:
		conn, addr = s.accept()
		print(f'Client {addr} has connected')
		t = Thread(target=start_proxy, args=(conn, ))
		t.start()
```

What is the code doing? Well, we're creating a `socket.socket` as `s`. We pass in `socket.AF_INET` since we are using IPv4 and `socket.SOCK_STREAM` since we are using TCP. Based on what I know about game servers, it is likely that Terraria uses TCP. We could make sure of it by using Wireshark, but this is most likely the case.

Next, we are binding to 127.0.0.1:7777 and calling listen since we are a server. Then we enter an loop where we try to accept incoming connections. `accept` is blocking so nothing happens until someone connects. When someone has connected, we may start a thread for them and pass the connection as an argument. We don't join this thread since we want to be ready for the next client.

The `start_proxy` function takes a client connection and creates the "real" connection with the Terraria server. Our process is now acting as a client, and we can forward messages to and from the server by using the copy() function which we are about to define. *Note: `try: ... except: pass` is used so that our process doesn't crash when someone disconnects or the real server shuts down.*

```py
def copy(src, dst, prefix):
	try:
		while True:
			# try getting the bytes representing the length of the packet
			data_size = src.recv(2)
			if not data_size:
				break

			# parse the bytes to an int using LE ordering
			# minus 2 since we're excluding the first two bytes we read
			size = int.from_bytes(data_size, 'little') - 2
			# try getting the rest of the packet
			data = src.recv(size)
			if not data:
				break

			# data[0] is our message code
			# data[1:] is the encoded message
			print(f'{prefix} ({data[0]}) {data[1:].hex()}')
			# forward the message to the receiver
			dst.sendall(data_size + data)
	except:
		pass
```

With that in place and running, we can now start a real Terraria server on port 7778 and connect with the Terraria client to port 7777. The game looks and plays as it normally does, but in the background we are now logging all of the packets being transmitted. Here's what the console looks like:

```
Proxy started on port 7777
Client ('127.0.0.1', 51183) has connected
[c->s]: (1) 0b5465727261726961323739
[s->c]: (37) 
[c->s]: (38) 0870617373776f7264
[s->c]: (3) 0100
[c->s]: (4) 0103890364696d00000000fbfbfaf57f5e421c32e5cfd6eadbf6b2bbb8e0abfd001000
[c->s]: (68) 2430336439363837622d623631372d346435642d396161322d623739316461356332346233
[c->s]: (16) 0190019001
[c->s]: (42) 0114001400
...
```

So, the client starts by send a type 1 message with some data after it. Let's recall the C# we looked at earlier.

```cs
case 1:
	writer.Write("Terraria" + (object) 279);
	break;
```

It seems that the message contains Terraria279. I'm guessing `0b` is the length of the string and `5465727261726961323739` is the string (after being hex encoded). `Terraria279` is 11 digits long and 11 in hex is B so that checks out. Using [this site](https://www.rapidtables.com/convert/number/hex-to-ascii.html), you can convert the hex string to ASCII and see the result. Go on, give it a shot.

Okay, so the client first tells the server what version they're running and if it's compatible, the server responds with a type 37 message. Let's look at the logic for when the server reads a type 1 message from the client. *Remember, message decoding is done by `MessageBuffer.GetData`.*

```cs
case 1:
	// If we are not a server, ignore this packet.
	if (Main.netMode != 2) break;
	// Check if this player is IP banned
	if (Main.dedServ && Netplay.IsBanned(Netplay.Clients[this.whoAmI].Socket.GetRemoteAddress())) {
		// Send the player a localization key informing them they are banned
		NetMessage.TrySendData(2, this.whoAmI, text: Lang.mp[3].ToNetworkText());
		break;
	}
	// If this client is not on the state 0
	if (Netplay.Clients[this.whoAmI].State != 0) break;
	if (this.reader.ReadString() == "Terraria" + (object) 279) {
		// If there is no server password, send the client packet 3 and set their state to 1
		if (string.IsNullOrEmpty(Netplay.ServerPassword)) {
			Netplay.Clients[this.whoAmI].State = 1;
			NetMessage.TrySendData(3, this.whoAmI);
			break;
		}
		// If there is a password, set the client's state to -1 and send them packet 37
		Netplay.Clients[this.whoAmI].State = -1;
		NetMessage.TrySendData(37, this.whoAmI);
		break;
	}
	// If the version doesn't match, send them this string
	NetMessage.TrySendData(2, this.whoAmI, text: Lang.mp[4].ToNetworkText());
	break;
```

Something I haven't mentioned quite yet is that the Terraria server and client code is merged into one. The server is the same as the client but with `Main.dedServer = true`. This differentiation is made throughout the network code by checking if `Main.netMode` is 2. As far as I can tell 1 means client and 2 means server. There is also sometimes 0, which I believe represents a client that is not actively in a world? I'm not exactly sure and it doesn't seem to matter to us.

I have set a password for the server, so it should be sending a type 37 packet, which it does. The client responds with 38 which presumably contains the password I inputted in Terraria. See if you can figure out what the string contains in the line `[c->s]: (38) 0870617373776f7264`.

I think that's enough of explaining the protocol for now. There are so many different packets being sent, so I'll leave the explanation there for now.

## Exploiting the Server

Earlier, I did hint at changing the packet data while in transit. Well, an interesting one to change is the packet for putting an item in a chest. When the client puts an item in a chest, the following packet is received and handled by the server like so.

```cs
case 32:
	int index28 = (int) this.reader.ReadInt16();
	int index29 = (int) this.reader.ReadByte();
	int num42 = (int) this.reader.ReadInt16();
	int prefixWeWant2 = (int) this.reader.ReadByte();
	int type6 = (int) this.reader.ReadInt16();
	// ... some sanity checks ...
	Main.chest[index28].item[index29].netDefaults(type6);
	Main.chest[index28].item[index29].Prefix(prefixWeWant2);
	Main.chest[index28].item[index29].stack = num42;
	Recipe.FindRecipes(true);
	break;
```

Maybe we can change the value of `stack` while in transit to put more items in the chest? Let's try it out by writing the following in our Python method from earlier.

```py
if data[0] == 32:
	# make data a bytearray so we can mutate it
	data = bytearray(data)
	# note: message type byte + i16 + byte = 4 bytes
	# we want to overwrite bytes 4 and 5 with the new stack number
	data[4:6] = int(999).to_bytes(2, 'little')
```

And that's it! Let's see what happens in-game.

<video src="/trust-1-2.mp4" type="video/mp4" controls></video>

Exiting and re-entering a chest gives us 999 of what we put in, even if the item isn't stackable. In general, the Terraria server seems to not do any anti-cheat prevention, so modifying packets works pretty often. The Terraria server does have a lot of anti-spam code to prevent clients from rapidly sending messages, projectiles, attack commands, placing blocks, and so on. I assume this is mainly to prevent other clients from crashing.

## Recap

- Terraria uses plain old TCP with no encryption.
- Terraria is written in C#, for which there are many high-quality disassembly tools available.
  - dotPeek is pretty good.
- A Terraria server can't have more than 255 players since each player is represented by a byte identifier.
- `Terraria.exe` and `TerrariaServer.exe` are very similar. One is just `Main.dedServer = true;` and the other is not.
- Cheating is fine but crashing other clients is not.

## Conclusion

We have a lot of work cut out for us. We have to handle [world (.wld) files](https://fileformat.fandom.com/wiki/WLD). We may even have to implement world generation! Or copy it if we're lazy. We may have to parse user files. We have a lot of different packet types to implement. Maybe even fluid simulation. Did you think this would be easy?? Anyway, thanks for reading. See you in [part 2](/blog/trust-2).
