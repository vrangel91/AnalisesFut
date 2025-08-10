Venues
Get the list of available venues.

The venue id are unique in the API.

To get the image of a venue you have to call the following url: https://media.api-sports.io/football/venues/{venue_id}.png

Examples available in Request samples "Use Cases".

All the parameters of this endpoint can be used together.

This endpoint requires at least one parameter.

Update Frequency : This endpoint is updated several times a week.

Recommended Calls : 1 call per day.

query Parameters
id	
integer
The id of the venue

name	
string
The name of the venue

city	
string
The city of the venue

country	
string
The country name of the venue

search	
string >= 3 characters
The name, city or the country of the venue

header Parameters
x-rapidapi-key
required
string
Your Api-Key


casos de uso:
// Get one venue from venue {id}
get("https://v3.football.api-sports.io/venues?id=556");

// Get one venue from venue {name}
get("https://v3.football.api-sports.io/venues?name=Old Trafford");

// Get all venues from {city}
get("https://v3.football.api-sports.io/venues?city=manchester");

// Get venues from {country}
get("https://v3.football.api-sports.io/venues?country=england");

// Allows you to search for a venues in relation to a venue {name}, {city} or {country}
get("https://v3.football.api-sports.io/venues?search=trafford");
get("https://v3.football.api-sports.io/venues?search=manches");
get("https://v3.football.api-sports.io/venues?search=England");



request get:
fetch("https://v3.football.api-sports.io/venues?id=556", {
	"method": "GET",
	"headers": {
		"x-rapidapi-host": "v3.football.api-sports.io",
		"x-rapidapi-key": "XxXxXxXxXxXxXxXxXxXxXxXx"
	}
})
.then(response => {
	console.log(response);
})
.catch(err => {
	console.log(err);
});



response:
{
"get": "venues",
"parameters": {
"id": "556"
},
"errors": [ ],
"results": 1,
"paging": {
"current": 1,
"total": 1
},
"response": [
{}
]
}