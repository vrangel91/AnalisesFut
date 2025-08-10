Teams
Returns the list of teams and seasons in which the player played during his career.

This endpoint requires at least one parameter.

Update Frequency : This endpoint is updated several times a week.

Recommended Calls : 1 call per week.

query Parameters
player
required
integer
The id of the player

header Parameters
x-rapidapi-key
required
string
Your Api-Key

casos de uso:
// Get all teams from one {player}
get("https://v3.football.api-sports.io/players/teams?player=276");



request get:
fetch("https://v3.football.api-sports.io/players/teams?player=276", {
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
  "get": "players/teams",
  "parameters": {
    "player": "276"
  },
  "errors": [],
  "results": 8,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
    {
      "team": {
        "id": 6,
        "name": "Brazil",
        "logo": "https://media.api-sports.io/football/teams/6.png"
      },
      "seasons": [
        2026,
        2023,
        2022,
        2021,
        2019,
        2018,
        2017,
        2016,
        2015,
        2014,
        2013,
        2012,
        2011,
        2010
      ]
    },
    {
      "team": {
        "id": 2932,
        "name": "Al-Hilal Saudi FC",
        "logo": "https://media.api-sports.io/football/teams/2932.png"
      },
      "seasons": [
        2024,
        2023
      ]
    },
    {
      "team": {
        "id": 85,
        "name": "Paris Saint Germain",
        "logo": "https://media.api-sports.io/football/teams/85.png"
      },
      "seasons": [
        2022,
        2021,
        2020,
        2019,
        2018,
        2017
      ]
    },
    {
      "team": {
        "id": 529,
        "name": "Barcelona",
        "logo": "https://media.api-sports.io/football/teams/529.png"
      },
      "seasons": [
        2016,
        2015,
        2014,
        2013
      ]
    },
    {
      "team": {
        "id": 10171,
        "name": "Brazil  U23",
        "logo": "https://media.api-sports.io/football/teams/10171.png"
      },
      "seasons": [
        2016,
        2012
      ]
    },
    {
      "team": {
        "id": 128,
        "name": "Santos",
        "logo": "https://media.api-sports.io/football/teams/128.png"
      },
      "seasons": [
        2012,
        2011,
        2010,
        2009
      ]
    },
    {
      "team": {
        "id": 16200,
        "name": "Brazil U20",
        "logo": "https://media.api-sports.io/football/teams/16200.png"
      },
      "seasons": [
        2011
      ]
    },
    {
      "team": {
        "id": 12502,
        "name": "Brazil U17",
        "logo": "https://media.api-sports.io/football/teams/12502.png"
      },
      "seasons": [
        2009
      ]
    }
  ]
}