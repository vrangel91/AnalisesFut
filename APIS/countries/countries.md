Countries
Get the list of available countries for the leagues endpoint.

The name and code fields can be used in other endpoints as filters.

To get the flag of a country you have to call the following url: https://media.api-sports.io/flags/{country_code}.svg

Examples available in Request samples "Use Cases".

All the parameters of this endpoint can be used together.

Update Frequency : This endpoint is updated each time a new league from a country not covered by the API is added.

Recommended Calls : 1 call per day.

query Parameters
name	
string
The name of the country

code	
string [ 2 .. 6 ] characters FR, GB-ENG, IT…
The Alpha code of the country

search	
string = 3 characters
The name of the country

header Parameters
x-rapidapi-key
required
string
Your Api-Key


request get: https://v3.football.api-sports.io/countries


request:
fetch("https://v3.football.api-sports.io/countries", {
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
  "get": "countries",
  "parameters": {
    "name": "england"
  },
  "errors": [],
  "results": 1,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
    {
      "name": "England",
      "code": "GB",
      "flag": "https://media.api-sports.io/flags/gb.svg"
    }
  ]
}