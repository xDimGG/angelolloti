{
	"title": "Finding Cheap Flight Tickets With Python",
	"date": 1706727822114,
	"tags": ["data", "scraping", "python"]
}
---

A story on how I beat every travel site to the punch to book the best round-trip flights to South Korea. [TL;DR](https://gist.github.com/xDimGG/eaf80e2dfac2e920ca023306b9e72437).

### Some Background

There is this relatively new airline called Air Premia that provides non-stop flights from four American airports to Incheon Airport in South Korea. As someone who lives near one of the four airports and is interested in visiting Korea, I wanted to capitalize on Air Premia's relatively cheap flight tickets.

### The Problem

Because of how new Air Premia was, it still wasn't on the radar of many travel sites like Kayak and Expedia. It is now, but it wasn't then.

### The Solution

Write a Python script to scrape data from Air Premia's site and go through that data to determine when the best time of year is to buy tickets and what tickets were cheapest.

## Getting Started

For starters, let me show you what searching for tickets on [Air Premia](https://www.airpremia.com/) looks like. First, you decide between Roundtrip and One-way. Next, you choose the airport you're departing form. Next, you choose the airport you're arriving at. Next, you click on the date. When clicking on the date, you get a brief loading screen followed by some calendar dates and a price for each applicable date.

![Air Premia calendar UI](/premia_1.png)

Wowie, that's a lot of prices at once! After a bit of testing, you can only book flights up to 9 months in advance. After that, no more prices are shown.

### What is Happening

Well, when we click on the date selector or click on the arrows to load the next month, our browser is probably making an API request to get the prices given our parameters (departing from terminal, arriving at terminal, etc.). We can confirm that this is a case by opening up our Chrome developer tools and going to the network tab. With this tool, we can see every request that the current tab makes. Refreshing the page and choosing the same options as before, we are able to capture the following request.

![Air Premia API request](/premia_2.png)

Okay, so our browser is making an HTTP GET request to `https://www.airpremia.com/pssapi/lowfare` with some query parameters. Let's format that URL so that we can actually read the parameters. *Note: you can see the same thing by going to the `Payload` tab of the request in Chrome.*

```
https://www.airpremia.com/pssapi/lowfare
	?origin=EWR
	&destination=ICN
	&tripType=RT
	&beginDate=2024-01-31
	&endDate=2024-02-29
	&loyalty=MonetaryOnly
	&fareTypes=FI
	&currency=USD
	&useCache=true
```

Let's also take a look at the `Response` tab to see what data we're getting back.

![Air Premia API response](/premia_3.png)

As far as APIs go, Air Premia is definitely on the easier side. All the parameters are clearly written out and the response is in neatly structured JSON data. There are still some guesses we have to make regarding the data that we can confirm by making more requests.

So, in our request we have the obvious parameters `origin=EWR` and `destination=ICN`, both of which use the IATA Location Identifiers (EWR for Newark Liberty International Airport and ICN for Incheon International Airport).

Then we have `tripType=RT`. We can guess that this means round-trip and verify this by selecting `One-Way` from the UI and seeing that the request the browser sends contains `tripType=OW` instead.

Next is `beginDate=2024-01-31` and `endDate=2024-02-29`. These are also pretty obvious, but it's worth making a note that the format of these dates is `YYYY-MM-DD`.

We have `currency=USD`, which should be very obvious. Since Air Premia travels to Korea, Thailand, Tokyo, and the U.S., the possible currencies are most likely `KWN`, `THB`, `JPY`, and `USD`. This was confirmed by selecting one-way tickets and changing the departure terminals to different countries.

Finally, we also have `loyalty`, `fareTypes`, and `useCache`. These don't seem very useful so I'll just leave them as they are.

### Now What?

Well, we figured out how the API works. Now, we need to write some code to make requests to these endpoints and store their data in some kind of data structure. I like working with [Jupyter Notebook](https://jupyter.org/) since it lets you hold onto variables while writing your code. Anyway, let's import requests, try making a get request to the endpoint with the same parameters as before, but just written out in a dict. `raise_for_status()` raises an error if our response has a bad status code. `json()` will just parse the response data in the JSON format.

```py
import requests

res = requests.get(
	'https://www.airpremia.com/pssapi/lowfare?loyalty=MonetaryOnly&fareTypes=FI&useCache=true',
	params={
		'tripType': 'RT',
		'origin': 'EWR',
		'destination': 'ICN',
		'beginDate': '2024-01-31',
		'endDate': '2024-02-29',
		'currency': 'USD',
	},
)
res.raise_for_status()
res.json()
```

Running this code, we get back `HTTPError: 400 Client Error`. Annoying but not surprising. Client requests often require additional headers/cookies in order to work. In this case, after some guess and check of removing and adding headers, it turns out all we need is the `X-Content-ID` header. It doesn't even have to be set to anything... it just has to exist.

```diff
...
		'currency': 'USD',
	},
+	headers={'X-Context-ID': ''},
)
res.raise_for_status()
...
```

Running that code again, we now get a JSON response that looks something like this (after being parsed).

```py
{'data': {'EWR-ICN': [{'date': '2024-01-31',
    'soldOut': False,
    'noFights': True,
		# ...
  'ICN-EWR': [{'date': '2024-01-31',
    'soldOut': False,
    'noFights': True,
		# ...
    'PE': None}]}}
```

Since we are using `tripType=RT`, the response includes the costs for EWR to ICN and ICN to EWR. Let's create a list of dates that we're interested in iterating over. To do this, I'm taking advantage of [python-dateutil](https://pypi.org/project/python-dateutil/), which provides some nice convenience methods for generating ranges of dates and mutating date objects.

```py
from datetime import date
from dateutil.rrule import rrule, MONTHLY
from dateutil.relativedelta import relativedelta

# Get today's date and replace the day with 1 to be at the beginning of the month
TODAY = date.today().replace(day=1)
# Starting from the current month, generate a range with 10 elements at a monthly frequency
dates = list(rrule(freq=MONTHLY, dtstart=TODAY, count=10))
# Set every other month's date to the last day of the month
for i in range(1, len(dates), 2):
	dates[i] += relativedelta(day=31)

# Format the dates in the format YYYY-MM-DD
dates = [m.strftime('%Y-%m-%d') for m in dates]
```

After running this code, our `dates` variable now contains this.

```py
['2024-01-01',
 '2024-02-29',
 '2024-03-01',
 '2024-04-30',
 '2024-05-01',
 '2024-06-30',
 '2024-07-01',
 '2024-08-31',
 '2024-09-01',
 '2024-10-31']
```

Would it have been faster to type these out by hand? Yes, but it wouldn't have been as fun.

With this done, let's start iterating over all the date ranges and getting flight data for all the possible dates. Mind you, we want to query two months at a time. This means that we will have `2024-01-01 through 2024-02-29`, `2024-03-01 through 2024-04-30`, and so on. We are matching every even indexed element with every odd indexed element. To do this, we may use Python's [zip](https://docs.python.org/3/library/functions.html#zip) function and [array slicing](https://www.w3schools.com/python/numpy/numpy_array_slicing.asp).

`dates[::2]` gives us every other element starting from 0 and `dates[1::2]` gives use every other element starting from 1. *Note: `dates[::2]` is implicitly `dates[0:len(dates):2]` and `dates[1::2]` is implicitly `dates[1:len(dates):2]`.* Now that we have these two iterators, we may merge them using `zip`. Let's just do `zip(dates[::2], dates[1::2])` and iterate over it to make sure everything works.

![testing our use of zip](/premia_4.png)

Pay attention to the `start, end` in our loop. Each value of `zip()` is returned as a tuple and we can use comma-separated variables to extract the tuple's individual parts. With this done, we may begin making our get requests. Let's just move our GET request to a function that takes some variables. If `trip_type` is RT, our method returns a tuple containg the flights to our destination and the return flights. If `trip_type` isn't RT, we return only flights going to our destination.

```py
import requests

def fetch(trip_type, origin, destination, start_date, end_date, currency='USD'):
	res = requests.get(
		'https://www.airpremia.com/pssapi/lowfare?loyalty=MonetaryOnly&fareTypes=FI&useCache=true',
		params={
			'tripType': trip_type,
			'origin': origin,
			'destination': destination,
			'beginDate': start_date,
			'endDate': end_date,
			'currency': currency,
		},
		headers={'X-Context-ID': ''},
	)
	res.raise_for_status()
	data = res.json()['data']
	going = data[f'{origin}-{destination}']

	return (going, data[f'{destination}-{origin}']) if trip_type == 'RT' else going
```

Now, let's write a function like `fetch` called `fetch_all` that takes `trip_type`, `origin`, `destination`, and `currency`, and returns every single available flight. Here, we take advantage of [concurrent.futures.ThreadPoolExecutor](https://docs.python.org/3/library/concurrent.futures.html#concurrent.futures.ThreadPoolExecutor) to concurrently request all date ranges and compile them all into one or two arrays (depending on if `trip_type` is `RT` or `OW`). *Note: this whole OW/RT and value/2-tuple business and is very annoying to write code for. If you know a better way of doing this in python, please advise.*

```py
from concurrent.futures import ThreadPoolExecutor

def fetch_all(trip_type, origin, destination, currency='USD'):
	going = []
	coming = []

	with ThreadPoolExecutor() as executor:
		for res in executor.map(
				lambda args: fetch(trip_type, origin, destination, *args, currency),
				zip(dates[::2], dates[1::2])):
			if trip_type == 'RT':
				going += res[0]
				coming += res[1]
			else:
				going += res

	return (going, coming) if trip_type == 'RT' else going
```

This blog post is already getting pretty long. Let me just briefly cover what the rest of the code does. Here, we are taking our arrays, filtering out days which don't have prices, flattening the data, and converting the data to `pandas.DataFrame` objects. The benefit of using pandas is that we get access to a lot of methods to assess our data. *Note: we are using 'E' to represent economy. I mean, who'd go to this extent to save money just to fly premium.*

```py
import pandas as pd
from dateutil.parser import parse

# c = 'E' or 'PE' (premium) economy
def to_clean_df(data, c='E'):
	clean = [{
		'date': parse(d['date']),
		'available': d[c]['availableCount'],
		'fare': d[c]['fareAmount'],
		'fees': d[c]['taxesAndFeesAmount'],
		'total': d[c]['fareAmount'] + d[c]['taxesAndFeesAmount'],
	} for d in data if d[c] is not None]
	
	return pd.DataFrame(clean).sort_values('date')

icn_ow = to_clean_df(ewr_icn_ow) # one-way ewr-icn
ewr_ow = to_clean_df(icn_ewr_ow) # one-way icn-ewr
icn_rt = to_clean_df(ewr_icn_rt) # round-trip price ewr-icn
ewr_rt = to_clean_df(icn_ewr_rt) # round-trip price icn-ewr

assert icn_ow.size == icn_rt.size
assert ewr_ow.size == ewr_rt.size
```

Let's write a bit of code to find the `n` cheapest trips given a date range we want the trip to be during, the minimum number of days the trip should be, and the maximum number of days the trip should be. This code could be optimized by avoiding a lot of unnecessary iteration and using a heap queue. *Note: `leaving` and `returning` are `pandas.DataFrame` objects, not lists.*

```py
def n_cheapest_trips(leaving, returning, after, before, min_days=1, max_days=270, n=10):
	after = parse(after)
	before = parse(before)
	# a quick lookup map of dates to total costs for returning flights
	r_map = {str(d): t for d, t in zip(returning['date'], returning['total'])}
	n_best = []

	# iterate over each leaving day
	for day in leaving.itertuples():
		# if the day is not within our date range, skip it
		if after > day.date or before < day.date:
			continue

		# iterate over each number of days in the min, max range (inclusive)
		for days in range(min_days, max_days + 1):
			# check if there is a returning flight available on current day + trip length
			d = day.date + relativedelta(days=days)
			if after > d or before < d or str(d) not in r_map:
				continue

			# sum of leaving and returning cost
			total_cost = day.total + r_map[str(d)]
			# update n best items, maintaining length <= n
			n_best += [(total_cost, day.date.strftime('%Y-%m-%d'), d.strftime('%Y-%m-%d'), days)]
			n_best = sorted(n_best, key=lambda x: x[0])
			n_best = n_best[:n]

	return n_best
```

With this function, we can finally do what our original goal was, which is to find the best priced tickets. Let's suppose I want a 10 to 20 day trip between March 1, 2024 and May 31, 2024. Here is the result of that, using our round-trip data as input.

![Air Premia best possible tickets given parameters](/premia_7.png)

It seems like we have quite a few options that are all $1,078. Let's see if we get a better price using our one-way data as input. Rather than buying both tickets together, you would have to purchase them separately.

![Air Premia best possible tickets given parameters with one-way data](/premia_8.png)

As it turns out, we can actually get tickets for $57 cheaper by just buying two one-way tickets instead of round-trip tickets. I had always assumed that round-trip tickets would be cheaper than two one-way tickets, but I guess that's not always the case.

Mission complete, I guess. I still would like to plot some data so that we can get a sense for when tickets are cheaper and maybe uncover some other interesting patterns.

Now, let's import [matplotlib](https://matplotlib.org/) so that we can do some data visualization. I'm changing the default pyplot size and DPI to make the output wider and higher resolution.

```py
from matplotlib import pyplot as plt
plt.rcParams['figure.figsize'] = (17, 4)
plt.rcParams['figure.dpi'] = 200
```

Let's start by showing the prices for different days. I'll split this into two charts. One for one-way trips and another for round-trips. Some of the bars will overlap one another but you can still see the general pattern which is what we're after. *Note: the code for round-trip tickets is almost identical.*

```py
plt.title('USD Cost of One-way Economy Tickets')
plt.bar(icn_ow['date'], icn_ow['total'], color='C0', label='EWR -> ICN')
plt.bar(ewr_ow['date'], ewr_ow['total'], color='C6', label='ICN -> EWR')
plt.legend()
plt.show()
```

![Air Premia USD Cost of One-way Economy Tickets](/premia_5.png)
![Air Premia USD Cost of Round-trip Economy Tickets](/premia_6.png)

Let's check out what the price difference between one-way and round-trip tickets for the same flight is. We will use the following code which computes `one way cost - round trip cost`. If this number is positive, that means one-way costs more. If it's negative, round-trip costs more. *Note: the code for tickets to Newark is almost identical.*

```py
plt.title('USD Price Difference Between One-way and Round-trip Tickets to Incheon')
plt.bar(icn_ow['date'], icn_ow['total'] - icn_rt['total'], color='C0')
plt.show()
```

![Air Premia USD Price Difference Between One-way and Round-trip Tickets to Incheon](/premia_9.png)
![Air Premia USD Price Difference Between One-way and Round-trip Tickets to Newark](/premia_10.png)

Well now that we have a graphical understanding of the price difference, let's get a numerical sense for it by taking the mean of the differences.

```py
(icn_ow['total'] - icn_rt['total']).mean(), (ewr_ow['total'] - ewr_rt['total']).mean()
```

The result of this is about `(104.19, -137.54)`. This means that on average, you are saving $104.19 on the tickets to your location by buying round-trip, but you are losing $138.54 on the return tickets. A pair of round-trip tickets is about $33.35 more expensive than two one-way tickets.

## Conclusion

Congratulations if you've made it this far. You must really like data scraping. I hope you've enjoyed and that you can take the data and create your own visualizations. As an aside, I did check if there was any price difference between currencies, but they all came out to about the same when converted to USD. Good luck and happy coding.
