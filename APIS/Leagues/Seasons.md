Seasons
Get the list of available seasons.

All seasons are only 4-digit keys, so for a league whose season is 2018-2019 like the English Premier League (EPL), the 2018-2019 season in the API will be 2018.

All seasons can be used in other endpoints as filters.

This endpoint does not require any parameters.

Update Frequency : This endpoint is updated each time a new league is added.

Recommended Calls : 1 call per day.

header Parameters
x-rapidapi-key
required
string
Your Api-Key


request geT: https://v3.football.api-sports.io/leagues/seasons



request:
fetch("https://v3.football.api-sports.io/leagues/seasons", {
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
  "get": "leagues/seasons",
  "parameters": [],
  "errors": [],
  "results": 12,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
    2008,
    2010,
    2011,
    2012,
    2013,
    2014,
    2015,
    2016,
    2017,
    2018,
    2019,
    2020
  ]
}