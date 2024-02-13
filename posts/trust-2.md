{
	"title": "Writing Sweet Rust Macros (trust pt. 2)",
	"date": 1707829348111,
	"tags": ["trust", "rust", "macros"]
}
---

There is something I haven't told you yet about trust in [part 1](/blog/trust-1). It is actually a project that I had thought of 2 years ago. Back then, I wanted to do the same thing as what I'm doing now, but I quit once I realized the actual scale of this project. As it turns out, this isn't an easy project. At the beginning, I found it strange that the Terraria server is just a headless client (meaning the server treats itself as an "invisible" player in the server). After really thinking about it, it makes plenty of sense. All of the game logic (mob spawning, water flowing, entity interactions) have to be fired off by some central authority — the server — and this means we need Terraria's logic, spawn rates, etc. all in our code. This is definitely a lot to implement and what halted my progress the first time. To put it short, I felt like I was about to open Pandora's box. I didn't like that feeling of uncertainty and rather than even begin to start, I gave up then and there. Alas, we are back and my mentality has greatly shifted since then.

> The struggle itself towards the heights is enough to fill a man's heart. One must imagine Sisyphus happy.

## Why a Macro?

Ok, so we have a fairly structured network protocol at this point. Each packet is structured like so.

| field | type | length |
| - | - | - |
| len | u16 | 2 |
| code | u8 | 1 |
| msg | bytes | len-3 |

Depending on `code`, `msg` may contain certain fields. For instance, if `code` is 3, we have a connection approval message whose fields are contained in `msg` like so.

| field | type | length |
| - | - | - |
| id | u8 | 1 |
| flag | bool | 1 |

`id` represents the ID that the server assigns the user and `flag` seems to represent a flag called `ServerWantsToRunCheckBytesInClientLoopThread`. If this is true, the client calls `NetMessage.CheckBytes()` inside `Main.InnerClientLoop()`. Don't ask me... all I know is that this is hardcoded to be `false` every time.

Let's take another example. If `code` is 5 and client-sent, the client is updating the server about a particular slot in their inventory. If `code` is 5 and broadcasted by the server, the server is notifying all players of a change in a player's inventory. *Note: internally, an inventory represents all a players items including their armor, dyes, pets, mounts, etc. Not just the items in the top left of their escape menu.*

| field | type | length |
| - | - | - |
| id | u8 | 1 |
| slot_id | i16 | 2 |
| amount | i16 | 2 |
| prefix | u8 | 1 |
| item_id | i16 | 2 |

You get the gist? Anyway, my goal was to be able to write a Rust enum representing each packet so we can use `match`. I also want it to be aware of the code of each packet to automatically parse and encode it. In the doc comment, I put the packet's code. Also, let's not create the read method for server-only packets and write for client-only packets. In the doc comment, `->` means send-only, `<-` means receive-only, and `<->` means bidirectional. That would mean our macro should be able to convert this.

```rs
#[our_cool_proc_macro]
pub enum Message<'a> {
	/// 3 ->
	ConnectionApprove {
		pub client_id: u8,
		pub flag: bool,
	},
	/// 5 <->
	PlayerInventorySlot {
		pub client_id: u8,
		pub slot_id: i16,
		pub amount: i16,
		pub prefix: u8,
		pub item_id: i16,
	},
}
```

into this

```rs
pub struct ConnectionApprove {
	pub client_id: u8,
	pub flag: bool,
}

pub struct PlayerInventorySlot {
	pub client_id: u8,
	pub slot_id: i16,
	pub amount: i16,
	pub prefix: u8,
	pub item_id: i16,
}

#[our_cool_proc_macro]
pub enum Message<'a> {
	ConnectionApprove(ConnectionApprove),
	PlayerInventorySlot(PlayerInventorySlot),
	Unknown(u8, &'a [u8]),
}

// let's assume the caller has already read the length of the packet and
// is giving us everything after the length
fn buffer_to_message(buf: &[u8]) -> Message {
	let r = Reader::new(buf); // create a byte reader
	let code = r.read_byte();
	match code {
		5 => Message::PlayerInventorySlot(PlayerInventorySlot {
			pub client_id: r.read_byte(),
			pub slot_id: r.read_i16(),
			pub amount: r.read_i16(),
			pub prefix: r.read_byte(),
			pub item_id: r.read_i16(),
		}),
		_ => Message::Unknown(code, &buf[1..])
	}
}

fn message_to_buffer(msg: Message) -> &[u8] {
	match Message {
		Message::ConnectionApprove(ca) => {
			let w = Writer::new(3);
			w.write_byte(client_id);
			w.write_bool(flag);
			w.finalize() // sets the first two bytes as the length and returns byte array
		}
		Message::PlayerInventorySlot(slot) => {
			let w = Writer::new(5);
			w.write_byte(slot.client_id);
			w.write_i16(slot.slot_id);
			w.write_i16(slot.amount);
			w.write_byte(slot.prefix);
			w.write_i16(slot.item_id);
			w.finalize()
		}
		_ => Message::Unknown(code, &buf[1..])
	}
}
```

In case you're wondering why I don't want to write the structs outside of the enum myself, it's because if I do, then this macro will be much more complicated as it won't just be completely contained within one enum.

## Binary Reader and Writer

For starters, let's implement our `Reader` and `Writer`. Our reader will look like this,

```rs
impl<'a> Reader<'a> {
	pub fn new(buf: &'a [u8]) -> Self {
		Self { buf, cur: 0 }
	}

	pub fn read_bytes(&mut self, amount: usize) -> &[u8] {
		self.cur += amount;
		&self.buf[(self.cur - amount)..self.cur]
	}

	pub fn read_byte(&mut self, amount: usize) -> u8 {
		self.read_bytes(1)[0]
	}

	pub fn read_i16(&mut self) -> i16 {
		i16::from_le_bytes(self.read_bytes(2).try_into().unwrap())
	}

	// add methods as needed
}
```

and our writer will look like this,

```rs
impl Writer {
	pub fn new(code: u8) -> Self {
		Self { buf: vec![0, 0, code] } // start the buffer with two empty bytes and the message code
	}

	// method to be called when a packet is done being constructed
	pub fn finalize(mut self) -> Vec<u8> {
		let [a, b] = (self.buf.len() as u16).to_le_bytes(); // convert the length of the buffer to 2 bytes
		self.buf[0] = a; // replace the first two bytes with the length of the array
		self.buf[1] = b;
		self.buf
	}

	pub fn write_bytes(mut self, bytes: &[u8]) -> Self {
		self.buf.append(&mut bytes.to_vec());
		self
	}

	pub fn write_byte(mut self, byte: u8) -> Self {
		self.buf.push(byte);
		self
	}

	pub fn write_i16(self, num: i16) -> Self {
		self.write_bytes(&num.to_le_bytes())
	}

	// add methods as needed
}
```

Makes sense? I'm just trying to get through this quickly since this is mostly boilerplate for the real difficulty which is writing a procedural macro.

As per The Rust Reference,
> Procedural macros allow you to run code at compile time that operates over Rust syntax, both consuming and producing Rust syntax. You can sort of think of procedural macros as functions from an AST to another AST.

## Set Up a Project for the Macro

So, we want to parse the AST and generate our own AST. Let's create a new cargo project called macros (`cargo init macros --lib`) and include in our main project (which actually hasn't been established yet) by adding `macros = { path = "macros" }` to `Cargo.toml`. In the `macros` project, we want to add this to `Cargo.toml`.

```toml
[dependencies]
syn = { version = "2.0", features = ["full"] }
proc-macro2 = "1.0"
quote = "1.0"

[lib]
proc-macro = true
```

[syn](https://docs.rs/syn/latest/syn/), [proc-macro2](https://docs.rs/proc-macro2/latest/proc_macro2/), and [quote](https://docs.rs/quote/latest/quote/) seem to be the essentials for creating a proc macro. We want to replace our primary enum with a new enum, more structs, and some `impl`s. To do this replacement, we use an attribute macro. To get started using an attribute macro, we write the method as follows.

```rs
#[proc_macro_attribute]
pub fn message_encoder_decoder(_: TokenStream, input: TokenStream) -> TokenStream {
	// draw the rest of the owl
}
```

Now what? For simplicity's sake, I'll just be talking about the sending half of this macro. The code for the receiving half is predictably similar. Let's use syn to create a syntax tree from this token stream. To do that, we can do this.

```rs
let input = parse_macro_input!(input as ItemEnum);
```

Now, let's start to build the that `match` statement that we had talked about earlier. To do this, let's store all the cases and finally construct the `match` inside of a `TryFrom`.

```rs
let mut cases = Vec::new();

for variant in input.variants {
	let name = variant.ident;
	// Skip over the Unknown variant since it's a special case
	if name.to_string() == "Unknown" {
		continue;
	}

	// Get the text contained within our /// comment (i.e. doc = "/// 5 <->")
	let doc = variant.attrs.first().unwrap().span().source_text().unwrap();
	// If we don't have a ->, we're not sending so skip
	if !doc.contains("->") {
		continue;
	}

	// Get the packet code from the comment 
	let code: u8 = doc.split_whitespace().skip(1).next().unwrap().parse().unwrap();
}
```

In rust there are three kinds of enum variant fields, `Named`, `Unnamed`, and `Unit`. Named means that the variant contains named fields (i.e. `X { a: i32, b: f64 }`). Unnamed means that the variant is represented by a tuple (i.e. `Y(i32, f64, bool)`). `Unit` means the variant doesn't store any values (i.e. `None`). For now, we only have `Named` fields so let's deal with that.

```rs
for variant in input.variants {
	// ...

	if let Fields::Named(field) = variant.fields {
		// Store the array of the methods we are calling
		let mut fns = Vec::new();

		// Iterate over each named field
		for field in fields.named {
			let name = field.ident.as_ref().unwrap();
			if let Type::Path(ty) = &field.ty {
				// Remember, we made Writer chainable so we can just join these
				let method = match ty.path.segments.first().unwrap().ident.to_string().as_str() {
					"bool" => quote! { .write_bool(data.#name) },
					"u8" => quote! { .write_byte(data.#name) },
					"i16" => quote! { .write_i16(data.#name) },
					ty => quote! { compile_error!("Unknown type: {}", #ty) },
				}
				// Add the method
				fns.push(method)
			}
		}

		// # embeds the variable and #(#fns)* repeats fns
		cases.push(quote! { Message::#name(data) => Ok(Writer::new(#code)#(#fns)*.finalize()) })
	}
}
```

Cool. What is `quote!` doing, you may ask. It is taking the Rust code and converting it into a token stream. We now have our cases for each server-sent packet. Let's finally wrap them up in a match statement and get this show on the road. After our for loop, we are going to have this.


```rs
let sendable_from = TokenStream::from(quote! {
	impl<'a> TryFrom<Message<'a>> for Vec<u8> {
		type Error = &'static str;

		fn try_from(msg: Message) -> Result<Self, Self::Error> {
			match msg {
				#(#cases),*, // Join each case by a comma
				// Our beloved special case
				Message::Unknown(code, buf) => Ok(Writer::new(code).write_bytes(buf).finalize()),
				_ => Err("Unserializable message. Consider using Message::Unknown"),
			}
		}
	}
});
```

At this point, we are pretty much done. We just have to take our named fields and convert them to unnamed fields with the struct defined somewhere else. The rest of the code is just this.

```rs
let mut structs = Vec::new();
let mut variants = Vec::new();

for variant in input.variants {
	if let Fields::Named(fields) = variant.fields {
		let fields = fields.named.iter(); // get the fields
		let name = variant.ident; // get the name of the variant
		structs.push(quote! {
			#[derive(Debug, Clone)]
			// construct a struct of the same name and fields
			pub struct #name {
				#(#fields),*
			}
		});
		variants.push(quote! { #name(#name) }) // the new variant
	} else {
		variants.push(quote! { #variant }) // nothing changes if it's not named
	}
}

TokenStream::from(quote! {
	#(#structs)* // iterate over all our structs
	#[derive(Debug, Clone)]
	pub enum Message<'a> {
		#(#variants),* // include all our variants
	}
	#sendable_from // include our impl TryFrom
})
```

There is, of course, much more to this. There are more types besides u8, i16, and bool. There's also more code for handling the client-sent readable packets. All of that is pretty much just doing what we did here but slightly differently. If you are interested in the full code for the [macro](https://github.com/xDimGG/trust/blob/main/macros/src/lib.rs), the [reader](https://github.com/xDimGG/trust/blob/main/src/binary/reader.rs), and the [writer](https://github.com/xDimGG/trust/blob/main/src/binary/writer.rs), it's all in the [repository](https://github.com/xDimGG/trust).

## Closing Notes
Macro code can be hard to understand. I created this macro two years ago, and when I came back to it, I couldn't believe that I wrote it. The whole thing just seemed like gibberish. As a matter of fact, I had no intention to even touch the macro! However, when I tried compiling this project that I haven't touched in two years with a modern version of Rust, I received the following error.

```
error[E0512]: cannot transmute between types of different sizes, or dependently-sized types
   --> C:\Users\Dim\.cargo\registry\src\index.crates.io-6f17d22bba15001f\socket2-0.3.12\src\sockaddr.rs:176:9
    |
176 |         mem::transmute::<SocketAddrV4, sockaddr_in>(v4);
    |         ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
    |
    = note: source type: `SocketAddrV4` (48 bits)
    = note: target type: `SOCKADDR_IN` (128 bits)

For more information about this error, try `rustc --explain E0512`.
```

After a Google search, [this error](https://users.rust-lang.org/t/error-compiling-old-rust-project/83840) meant that one of my dependencies is outdated. That dependency turned out to be syn. I was on v1 and needed v2. I upgraded syn to v2, only to find out that the API has slightly changed so some lines were erroring. Because of that, I more or less had to re-understand my entire macro code again, which I really didn't want to do. Anyway, I did that and fixed it.

However, this got me to thinking. Is there a way I could have made this code more readable? Well, not really. I think proc macros are generally quite hard to read without comments. I could and should probably add a bunch of comments to the code so that future me who was to re-visit this has at least a clue of what's going on... nahhh. Comments are for chumps.

Anyway, that's all for now. Until we meet again in part 3.
