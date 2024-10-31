{
	"title": "Thermostatic Crypto Mining Rig/Space Heater",
	"date": 1730039691972,
	"tags": ["crypto", "mining", "hvac", "microcontroller"]
}
---

Let me start this off by saying I really dislike electric space heaters. They use a ridiculous amount of electricity for the amount of heat that they produce. That might seem strange if you consider the fact that a space heater is nearly 100% efficient. Well, that depends on what metric you use. If your metric of efficiency is electricity to heat, a 1,000-Watt space heater generates exactly 1,000 Watts of heat. 1,000 Watts of heat is also equivalent to 5,120 BTU/hr. Surely, we can't get above 100% efficiency, right? Well, we actually can.

### Heat Pumps
This is where a heat pump comes into play. Nowadays, many AC systems on the market will come with "heat pump" mode. What does a heat pump do? Basically a heat pump is a reverse AC. Normally, an AC will cool a space by pulling the heat into its refrigerant, carrying the hot refrigerant outside, and rejecting the heat into the environment. We are not creating cool air. We are simply moving hot air outside. A heat pump does the opposite. It pulls whatever heat it can from outside and "rejects" it into the space we are trying to heat. According to [this article](https://www.technologyreview.com/2023/02/14/1068582/everything-you-need-to-know-about-heat-pumps/), a heat pump by the same efficiency metric that we used before is 300% to 400% efficient. Awesome!

However, this blog post is not to talk about heat pumps. They are great pieces of technology which I would recommend over a space heater (although obviously a space heater is a lot smaller and cheaper than a heat pump AC system).

### Motivation
My girlfriend lives in a rented bedrooom. She has asked the landlord increase the heat, but he refuses, saying it will get too hot upstairs for the other tenants. He mentioned that she may get an electric space heater for her room. Her utility bill is the same every month, so she may spend as much electricity as she wants in her room. Luckily, I have a space heater that I bought when I lived in a college dorm.

![crypto mining rig](/crypto_1.jpg)

Yup, one of my biggest mistakes. Now, why do I call it an electric space heater? Well, it draws about 1,500 Watts, and any device that uses electricity produces heat. This means that this guy produces about 7,680 BTU/hr, which is enough to heat up a single bedroom. In fact, I used to run this in my dorm and would leave the windows open in the middle of an upstate New York winter to get the room down to a bearable temperature.

By the way, don't actually call it a space heater. The majority of campuses and lease agreements do not allow electric space heaters. A crypto mining rig is basically just a computer, which almost all campuses and lease agreements allow. Unless they make direct mention of crypto mining, it's all good.

### Problem
I was able to endure the ridiculously high temperatures that my dorm reached because I knew the rig was making me money. Unfortunately, crypto mining is far less profitable now, and I don't want to turn my girlfriend's room into an oven. This means I need to control just how hot the room gets. I thought about using just an Arduino and a [thermistor](https://en.wikipedia.org/wiki/Thermistor) to do this, but since I want her to be able to easily interface with it, I decided to purchase a [used Honeywell thermostat](https://www.amazon.com/dp/B018A3DHJY?ref=ppx_yo2ov_dt_b_fed_asin_title) for $15.81 after tax.

The idea is to have the mining rig continuously run until the room reaches the set point on the thermostat. Once the set point is reached, the miner should stop. Once the room temperature drops a few degrees, the miner will start again.

### Using the Thermostat
So we have this thermostat and this mining rig. How do we make them work together? All we need to know is what terminals to use on our thermostat for heating. The back of the thermostat looks like this.

Almost all thermostats across all brands follow the same color/letter scheme. A Google search will tell us that R means power and W means heating. When the measured temperature is less than the set point, the thermostat closes a switch between R and W using a [relay](https://en.wikipedia.org/wiki/Relay), allowing the flow of current. To determine whether the thermostat is calling for heating using an Arduino, we would need one of our digital read pins going to W and the R terminal going to ground. If the pin measures high, that means we have a call for heating.

![wiring between thermostat and arduino](/crypto_3.jpg)

At this point, we have a couple of ways we could control the mining rig. However, I would like to do it using serial communication via USB. When the Arduino detects the thermostat is either calling for heating or not, it will send that information on the serial line. At this point, the mining rig will have a script running on it to receive information from the Arduino.

Since I am using [HiveOS](https://hiveon.com/knowledge-base/guides/what_is_hive/), a free operating system for crypto mining, I can just execute the bash commands `miner start` and `miner stop` to control the miner.

#### Caveats
- Because the thermostat uses a mechanical relay that electrically isolates the coil side from the load side, a +5V DC signal from an Arduino will work just fine. If we were using a thermostat that internally uses a [FET](https://en.wikipedia.org/wiki/Field-effect_transistor) and only expects 24V AC, we may run into issues.
- Depending on the thermostat that is used, it may be more likely to short cycle. This means we will be constantly starting and stopping and the miner. If the thermostat that is used tends to short cycle, then that will have to be prevented in code.
- When communicating over serial, the same baud rate must be used on the device that is sending and the device that is receiving.

### Arduino Code
First, let's establish the pin that we will connect W to and store it in a constant `W_PIN`.

```cpp
#define W_PIN 2
```

Next, we write our setup code. All we need to do is make the `W_PIN` an input with a pull-up resistor. Doing this allows the pin to read `HIGH` when the circuit is open and `LOW` when the thermostat closes the circuit between `R` and `W`. We also need to establish the serial communication baud rate using `Serial.begin`. A baud rate of `9600` must also be used on the receiving end.

```cpp
void setup() {
  pinMode(W_PIN, INPUT_PULLUP);
  Serial.begin(9600);
}
```

Finally, let's get the state of the `W_PIN`. If we use digitalRead, the only possible results are `HIGH` and `LOW`. Let's send 1 for `LOW` and 0 for `HIGH` since `LOW` would mean the thermostat is calling for heating.

```cpp
void loop() {
  Serial.write(digitalRead(W_PIN) == LOW ? 1 : 0);
}
```

That's all the Arduino code. I would like to keep it minimal since any other logic can be done in a script running on the rig.

### Miner Code
The following Python code can be used to read the serial port at a baud rate of 9600.

```py
import serial

ser = serial.Serial('<<DEVICE PATH HERE>>', 9600)
while True:
	print(ser.read())
```

To determine the device's serial port path, you can use the following command on HiveOS.

```
root@rig2D4AFF:~# ls /dev/serial/by-id/
usb-Arduino__www.arduino.cc__0043_7503530313035130B1C1-if00
```

So, the path to my Arduino is `/dev/serial/by-id/usb-Arduino__www.arduino.cc__0043_7503530313035130B1C1-if00`.

Running the script with this path, it will print 1's when there is a call for heating and 0's when there is not.

Let's modify our code to actually send the appropriate commands to the miner. We also want this script automatically retry whenever it encounters an error such as Arduino not being plugged in. This is because I plan to have this script run at startup and hopefully never crash.

```py
from serial import Serial
from subprocess import call
from time import sleep

while True:
	try:
		ser = Serial('<<DEVICE PATH HERE>>', 9600) # may need to change device path
		prev_val = None # start out as none so we either start or stop the miner on the first iteration

		while True:
			val = ser.read()[0]
			if val == prev_val: # nothing changed; do nothing
				continue
			if val == 1:
				call(['miner', 'start']) # execute shell command "miner start"
			elif val == 0:
				call(['miner', 'stop'])
			else:
				print('device should only send 1 or 0; got', val)
			prev_val = val

	except:
		print('arduino not found, retrying in 5 seconds')
		sleep(5)
```

Now, let's make this script run at startup in the background. I was trying to get this working using Systemctl, but I simply could not. I turned to [this book](https://github.com/thagrol/Guides/blob/main/boot.pdf) which provides an incredibly simple way to use cron for this task. 

![how to schedule a boot script with crontab](crypto_2.png)

After all that, I restarted the rig and it worked as intended. Short cycling turned out not to be a problem. This is because even after the miner stops running, the card still holds a lot of thermal energy. Since the card regulates its fans at all times, the card's fans will continue to run for a few minutes, allowing the room to get just a little bit hotter even after the miner has stopped. Additionally, this rig still uses ~400W at idle, which is a pretty good amount to maintain the room's temperature.

And voila. I tried to make it look as nice as possible using the hardware I had available to me. I jammed a piece of cardboard behind the Arduino to make sure none of the pins would accidentally short out agains the metal plate.

![finished product](/crypto_4.jpg)
