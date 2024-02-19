{
	"title": "Parsing Terraria's .wld Files (trust pt. 3)",
	"date": 1708364642136,
	"tags": ["trust", "rust", "binary"]
}
---

Welcome to part three of my journey through writing a Terraria game server in Rust. Since [part 2](/blog/trust-2), I've gotten the client to be able to enter a password and begin to connect.

## Protocol Recap

When a player first connects, they send the version identifier using a type 1 packet. It is a string with the length annotated by the first byte. `5265727261726961323739` is `Terraria279` in ASCII.

```
[c->s]: (1) 0b5465727261726961323739
```

If the server has a password, it sends a type 37 packet with no data to challenge the client.

```
[s->c]: (37) 
```

The client is prompted and sends back the password. This is once again a byte-annotated string. `70617373776f7264` is `password` in ASCII.

```
[c->s]: (38) 0870617373776f7264
```

If the password is incorrect, the server can send back text using a type 2 packet to refuse the connection. If the password is correct or there is no password, the server sends the player a type 3 packet. The first byte represents the player's ID on the server. The second is a boolean that is always set to false.

```
[s->c]: (3) 0000
```

After this, the client begins sending a whole bunch of data about their player. First is type 4, which represents the player's character details.

```
[c->s]: (4) 000000036c6f6c00000000d75a37ff7d5a695a4bafa58ca0b4d7ffe6afa0693c001000
```

The packet is represented by the following struct. For more information on what each bit in the flags signifies, check the [code comments](https://github.com/xDimGG/trust/blob/48271674c6bb3636baf524f058809722af0a64c9/src/network/messages.rs#L105-L129).

```rs
/// 4 <->
PlayerDetails {
	client_id: u8,
	skin_variant: u8,
	hair: u8,
	name: String,
	hair_dye: u8,
	hide_accessory: u16,
	hide_misc: u8,
	hair_color: RGB,
	skin_color: RGB,
	eye_color: RGB,
	shirt_color: RGB,
	undershirt_color: RGB,
	pants_color: RGB,
	shoe_color: RGB,
	flags_1: u8,
	flags_2: u8,
	flags_3: u8,
},
```

The Terraria server does a couple of checks here.

1. The character name does not match someone else's name on the server.
2. The name is no more than 20 characters long.
3. The name is not empty (`name != ""`).
4. The player and world are both [journey mode](https://terraria.fandom.com/wiki/Journey_Mode) or both not journey mode.

If everything is good, the player's character details are emitted to all the other players in the server.

Next up is the player's UUID. This is again just a string. `38663037383932632d663363302d346433332d613966392d616435313932356462393532` represents `8f07892c-f3c0-4d33-a9f9-ad51925db952` in ASCII. The server doesn't actually have to do anything with this.

```
[c->s]: (68) 2438663037383932632d663363302d346433332d613966392d616435313932356462393532
```

Next is the player's health and mana. Only the health has to be broadcasted to other players.

```
[c->s]: (16) 0064006400
[c->s]: (42) 0014001400
```

```rs
/// 16 <->
PlayerHealth {
	client_id: u8,
	current: i16,
	maximum: i16,
},

/// 42 <-
PlayerMana {
	client_id: u8,
	current: i16,
	maximum: i16,
},
```

Next is any buffs the player has active. This gets broadcasted.

```
[c->s]: (50) 0000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000
```

```rs
/// 50 <->
PlayerBuffs {
	client_id: u8,
	buffs: [u16; MAX_BUFFS],
},
```

Next is the player's active loadout. As of Terraria 1.4.4, player's can have different armor loadouts so this packet notifies the server of which loadout the player has active and what accessories to hide. This gets broadcasted.

```
[c->s]: (147) 00000000
```

```rs
/// 147 <->
PlayerLoadout {
	client_id: u8,
	index: u8,
	hide_accessory: u16,
},
```

Next, the player sends a whole bunch of type 5 packets. It represents each item the player has on their character. This includes not just inventory items, but also armor, ammo, other loadouts, and more. This gets broadcasted.

```rs
/// 5 <->
PlayerInventorySlot {
	client_id: u8,
	slot_id: i16,
	amount: i16,
	prefix: u8,
	item_id: i16,
},
```

Finally, the player sends an empty packet with type 6, which triggers the server to send metadata about the world. After that is received, the client send a type 8 packet which makes the server send back even more world data, which includes some tile data. All the packets until now have been quite simple to implement, but now the client is expecting world data and our program doesn't hold a world.

## Parsing .wld Files

In order to get some world data, we should probably parse the .wld file that Terraria store's world data in. I googled around a bit and it seems that others have already figured out, documented, and written parsers for it in the past. Notably, there is [Terraria Map Editor](https://github.com/TEdit/Terraria-Map-Editor), which provides a UI for editing Terraria world files and updating lots of tiles at once with Microsoft Paint-like tools. It's a neat tool and could be a good reference point to work off. However, after exploring the decompiled code some more, there is a `WorldFile` class which contains a `LoadWorld` method. It's actually not that hard to read, so I'm just going to work off that.

For starters, where does Terraria store `.wld` file? On Windows, it's in `Documents > My Games > Terraria > Worlds`. On macOS, it's in `~/Library/Application Support/Terraria/Worlds`. Let's get the contents of the file and pass it to the reader that was created in [part 2](/blog/trust-2).

```rs
let contents = fs::read("Courtyard_of_Grasshoppers.wld").unwrap();
let mut reader = Reader::new(contents.as_slice());
```

In the decompiled code, the first thing done on the reader is ReadInt32(), and `WorldFile._versionNumber` is set to that number. Similarly, in our code, we can write the following.

```rs
let version = reader.read_i32();
println!("File version: {}", version);
```

Running this, we get:

```
File version: 279
```

Nice. It's the same as the Terraria version from earlier. At this point, there is a branch in the code. Before version 88, we call `WorldFile.LoadWorld_Version1_Old_BeforeRelease88`. Starting from version 88, `WorldFile.LoadWorld_Version2` is called. Let's go ahead and just implement `WorldFile.LoadWorld_Version2`. We can always support older versions later. Within `LoadWorld_Version2`, the first function called is `LoadFileFormatHeader`, which looks like so.

```cs
public static bool LoadFileFormatHeader(BinaryReader reader, out bool[] importance, out int[] positions) {
	importance = (bool[]) null;
	positions = (int[]) null;
	if ((WorldFile._versionNumber = reader.ReadInt32()) >= 135) {
		try {
			Main.WorldFileMetadata = FileMetadata.Read(reader, FileType.World);
		}
		catch (FormatException ex) {
			Console.WriteLine(Language.GetTextValue("Error.UnableToLoadWorld"));
			Console.WriteLine((object) ex);
			return false;
		}
	}
	else
		Main.WorldFileMetadata = FileMetadata.FromCurrentSettings(FileType.World);
	short length1 = reader.ReadInt16();
	positions = new int[(int) length1];
	for (int index = 0; index < (int) length1; ++index)
		positions[index] = reader.ReadInt32();
	ushort length2 = reader.ReadUInt16();
	importance = new bool[(int) length2];
	byte num1 = 0;
	byte num2 = 128;
	for (int index = 0; index < (int) length2; ++index) {
		if (num2 == (byte) 128) {
			num1 = reader.ReadByte();
			num2 = (byte) 1;
		}
		else
			num2 <<= 1;
		if (((int) num1 & (int) num2) == (int) num2)
			importance[index] = true;
	}
	return true;
}
```

Ok, so a call to `FileMetadata.Read` is made. We can navigate to `FileMetadata` and find that the `Read` method looks like this.

```cs
private void Read(BinaryReader reader) {
	long num1 = (long) reader.ReadUInt64();
	if ((num1 & 72057594037927935L) != 27981915666277746L)
		throw new FormatException("Expected Re-Logic file format.");
	byte num2 = (byte) ((ulong) num1 >> 56 & (ulong) byte.MaxValue);
	FileType fileType = FileType.None;
	FileType[] values = (FileType[]) Enum.GetValues(typeof (FileType));
	for (int index = 0; index < values.Length; ++index) {
		if (values[index] == (FileType) num2) {
			fileType = values[index];
			break;
		}
	}
	this.Type = fileType != FileType.None ? fileType : throw new FormatException("Found invalid file type.");
	this.Revision = reader.ReadUInt32();
	this.IsFavorite = ((long) reader.ReadUInt64() & 1L) == 1L;
}
```

If we convert `72057594037927935` to binary, it's just 56 `1`s. If we convert `27981915666277746` to hexadecimal and use an online hex to ASCII tool, we get `cigoler`. That's `relogic` backwards. `Re-Logic` is the name of the company that made Terraria. This seems to be a magic number for Re-Logic files. The reason it's backwards is that we are using little endian encoding. Let's go ahead and add a check for this magic number.

```rs
let magic = reader.read_bytes(7);
if magic != "relogic".as_bytes() {
	panic!("not a relogic file")
}
```

After this, we can read the `fileType` as 1 byte.
```rs
let file_type = reader.read_byte()?;
```

Running the code, we get this.
```
File type: 2
```

The code corresponds to this enum.

```cs
public enum FileType : byte {
	None,
	Map,
	World,
	Player,
}
```

Since we are dealing with a world file, the value 2 makes sense. Next is `this.Revision = reader.ReadUInt32();` and `this.IsFavorite = ((long) reader.ReadUInt64() & 1L) == 1L;`.

```rs
let revision = reader.read_u32();
println!("Revision: {}", revision);
let favorite = reader.read_u64() & 1 == 1;
println!("Is favorite: {}", favorite);
```

Now, we get this output.

```
File version: 279
File type: 2
Revision: 3
Is favorite: false
```

Looks pretty good. Back to the parent function, `LoadFileFormatHeader`, we read the positions like so.

```cs
short length1 = reader.ReadInt16();
positions = new int[(int) length1];
for (int index = 0; index < (int) length1; ++index)
	positions[index] = reader.ReadInt32();
```

Let's go ahead and do that in Rust.

```rs
let mut positions = Vec::with_capacity(reader.read_i16() as usize);
for _ in 0..positions.capacity() {
	positions.push(reader.read_i32());
}
println!("File positions: {:?}", positions);
```

With this in place, we get this in our console:

```
File positions: [159, 3413, 6618450, 6656473, 6656475, 6656542, 6656546, 6656550, 6656554, 6656576, 6656607]
```

What the Terraria world parser does is that after reading each section of data, it checks that the cursor is at the correct position before proceeding. This turns out to be _really_ useful when reading the file myself. It prevents me from accidentally reading loads of garbage without realizing and provides checkpoints for me as I'm writing the parser. If we parsed some block but the cursor doesn't match, it's a sign that we did something wrong.

Next up is the code for getting the "importance" of things. At this point it's not clear what this is for, but becomes apparent when reading the tiles. "important" tiles contain extra data.

```rs
let mut importance = vec![false; reader.read_u16() as usize];
let mut byte = 0;
let mut mask = 128;
for i in &mut importance {
	if mask == 128 {
		byte = reader.read_byte();
		mask = 1;
	} else {
		mask <<= 1;
	}

	if (byte & mask) == mask {
		*i = true;
	}
}
println!("Importance count: {}", importance.len());
```

All that this code is doing is reading the individual bits of the reader as booleans. Running this spits out:

```
Importance count: 693
```

We may also check our `reader.cur` at this point and see that it is `159`, which matches the first position in our positions array.

You can imagine how the rest of this goes. It's basically just writing a bunch of [structs and enums](https://github.com/xDimGG/trust/blob/main/src/world/types.rs) and lots of calls to the [reader](https://github.com/xDimGG/trust/blob/main/src/world/reader.rs). Writing it all out in a blog post would take a very long time and be quite boring. I'll just tell you the most interesting part.

## Parsing Strings, Revisited

Once I finished writing the parser, my world file was working just fine. However, I tried downloading someone else's world file and got an error from `str::from_utf8`. For some reason, the string wasn't being parsed correctly. At first, I thought that maybe Terraria files don't use UTF-8 strings, so I poked around the decompiled code a bit and couldn't figure out what was wrong. I tried checking the C# documentation for information on how [WriteString](https://learn.microsoft.com/en-us/uwp/api/windows.storage.streams.datawriter.writestring?view=winrt-22621) encodes the string, however, the only thing the page says is `Writes a string value to the output stream.`. Very helpful, Microsoft. I walked away from my computer a bit and that's when it hit me that maybe the strings I'm reading are just too long. Up to this point, I parsed strings by reading the first byte as the length and the rest as the string, which means that I could only support strings of length less than 256. As it turns out, this is not what the C# `DataWriter` does. In fact, it uses a varying-length integer, similar to UTF-8. What this means is that the first bit represents whether there is still more data about the length.

Suppose we have a string of length 64. Its length will just be encoded as `01000000`. If our string's length is 300, which is `100101100` in binary. The first byte will contain the least seven bits of the number, `0101100`. The most significant bit will be set to `1` to signify that there are still more bits to read. The second byte will contain the remaining bits, `10`, with the most significant bit set to `0` to signify that there are no more bits. In the end, our `300` becomes `10101100 00000010`. Two bytes. Until now, I've treated the string length as just 1 byte, which means we actually couldn't support any string whose length is greater than 127, since the first bit is reserved.

Our updated `read_string` function looks like this now.

```rs
pub fn read_length(&mut self) -> usize {
	let mut length = self.read_byte() as usize;
	let mut shift = 7;
	while length & (1 << shift) != 0 {
		length &= !(1 << shift);
		length |= (self.read_byte() as usize) << shift;
		shift += 7;
	}

	length
}

pub fn read_string(&mut self) -> String {
	let length = self.read_length();
	std::str::from_utf8(self.read_bytes(length)).unwrap_or("").to_string()
}
```

On the write side, it looks like this.

```rs
pub fn write_length(&mut self, mut len: usize) {
	while len >= (1 << 7) {
		self.write_byte((len & 0b1111111) as u8 | (1 << 7));
		len >>= 7;
	}

	self.write_byte(len as u8)
}

pub fn write_string(&mut self, string: String) {
	self.write_length(string.len());
	self.write_bytes(string.as_bytes().to_vec())
}
```

## Up and Running

Anyway, with that figured out, the World file parser is done! It has an annoyingly large number of fields, but it works. This means that now, we can begin to send world data to the player.

![connecting to trust server](/trust-3.png)

It works! For some reason, Re-Logic decided to make world tile packets zlib-compressed, which meant I had to dig into [DotNetZip](https://github.com/DinoChiesa/DotNetZip) to figure out exactly what parameters were being used. It turns out that the way Terraria uses the library ends up removing the zlib header and trailing checksum. It was quite tricky to figure out, but using the proxy made it easier. As a bonus, I added this to the proxy:

```py
disp_data = data[1:]
if data[0] == 10:
	disp_data = zlib.decompress(disp_data, wbits=-15)
print(f'{prefix} ({data[0]}) {disp_data.hex()}')
```

which decompresses any packets containing tile data.

## Closing Notes

So, we have our world and we can move around in it. We can even break blocks, but breaking stuff doesn't drop anything. In fact, everything we're doing is only on the client side. In order to support block-breaking and whatnot, we'll need to mutate the world object. We'll also have to be able to save the world, which means doing everything we just did in reverse. We've come a lot further than what I though would be possible! Everything from here should be smooth sailing. See you again in part 4!
