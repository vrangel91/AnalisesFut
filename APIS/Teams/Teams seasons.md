Teams seasons
Get the list of seasons available for a team.

Examples available in Request samples "Use Cases".

This endpoint requires at least one parameter.

Update Frequency : This endpoint is updated several times a week.

Recommended Calls : 1 call per day.

query Parameters
team
required
integer
The id of the team

header Parameters
x-rapidapi-key
required
string
Your Api-Key


casos de uso:
// Get all seasons available for a team from one team {id}
get("https://v3.football.api-sports.io/teams/seasons?team=33");


request geT: https://v3.football.api-sports.io/teams/seasons


request:
fetch("https://v3.football.api-sports.io/teams/seasons?team=33", {
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
  "get": "teams/seasons",
  "parameters": {
    "team": "33"
  },
  "errors": [],
  "results": 1,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
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
    2020,
    2021
  ]
}