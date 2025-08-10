Timezone
Get the list of available timezone to be used in the fixtures endpoint.

This endpoint does not require any parameters.

Update Frequency : This endpoint contains all the existing timezone, it is not updated.

Recommended Calls : 1 call when you need.

header Parameters
x-rapidapi-key
required
string
Your Api-Key


api get: https://v3.football.api-sports.io/timezone

request:
fetch("https://v3.football.api-sports.io/timezone", {
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
  "get": "timezone",
  "parameters": [],
  "errors": [],
  "results": 425,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
    "Africa/Abidjan",
    "Africa/Accra",
    "Africa/Addis_Ababa",
    "Africa/Algiers",
    "Africa/Asmara"
  ]
}