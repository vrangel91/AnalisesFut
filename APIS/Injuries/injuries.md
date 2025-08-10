Injuries
Get the list of players not participating in the fixtures for various reasons such as suspended, injured for example.

Being a new endpoint, the data is only available from April 2021.

There are two types:

Missing Fixture : The player will not play the fixture.
Questionable : The information is not yet 100% sure, the player may eventually play the fixture.
Examples available in Request samples "Use Cases".

All the parameters of this endpoint can be used together.

This endpoint requires at least one parameter.

Update Frequency : This endpoint is updated every 4 hours.

Recommended Calls : 1 call per day.

query Parameters
league	
integer
The id of the league

season	
integer = 4 characters YYYY
The season of the league, required with league, team and player parameters

fixture	
integer
The id of the fixture

team	
integer
The id of the team

player	
integer
The id of the player

date	
stringYYYY-MM-DD
A valid date

ids	
stringMaximum of 20 fixtures ids
Value: "id-id-id"
One or more fixture ids

timezone	
string
A valid timezone from the endpoint Timezone

header Parameters
x-rapidapi-key
required
string
Your Api-Key


casos de uso:

// Get all available injuries from one {league} & {season}
get("https://v3.football.api-sports.io/injuries?league=2&season=2020");

// Get all available injuries from one {fixture}
get("https://v3.football.api-sports.io/injuries?fixture=686314");

// Get all available injuries from severals fixtures {ids} 
get("https://v3.football.api-sports.io/injuries?ids=686314-686315-686316-686317-686318-686319-686320");

// Get all available injuries from one {team} & {season}
get("https://v3.football.api-sports.io/injuries?team=85&season=2020");

// Get all available injuries from one {player} & {season}
get("https://v3.football.api-sports.io/injuries?player=865&season=2020");

// Get all available injuries from one {date}
get("https://v3.football.api-sports.io/injuries?date=2021-04-07");

// It’s possible to make requests by mixing the available parameters
get("https://v3.football.api-sports.io/injuries?league=2&season=2020&team=85");
get("https://v3.football.api-sports.io/injuries?league=2&season=2020&player=865");
get("https://v3.football.api-sports.io/injuries?date=2021-04-07&timezone=Europe/London&team=85");
get("https://v3.football.api-sports.io/injuries?date=2021-04-07&league=61");



get request:
fetch("https://v3.football.api-sports.io/injuries?fixture=686314", {
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
  "get": "injuries",
  "parameters": {
    "fixture": "686314"
  },
  "errors": [],
  "results": 13,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
    {
      "player": {
        "id": 865,
        "name": "D. Costa",
        "photo": "https://media.api-sports.io/football/players/865.png",
        "type": "Missing Fixture",
        "reason": "Broken ankle"
      },
      "team": {
        "id": 157,
        "name": "Bayern Munich",
        "logo": "https://media.api-sports.io/football/teams/157.png"
      },
      "fixture": {
        "id": 686314,
        "timezone": "UTC",
        "date": "2021-04-07T19:00:00+00:00",
        "timestamp": 1617822000
      },
      "league": {
        "id": 2,
        "season": 2020,
        "name": "UEFA Champions League",
        "country": "World",
        "logo": "https://media.api-sports.io/football/leagues/2.png",
        "flag": null
      }
    },
    {
      "player": {
        "id": 510,
        "name": "S. Gnabry",
        "photo": "https://media.api-sports.io/football/players/510.png",
        "type": "Missing Fixture",
        "reason": "Illness"
      },
      "team": {
        "id": 157,
        "name": "Bayern Munich",
        "logo": "https://media.api-sports.io/football/teams/157.png"
      },
      "fixture": {
        "id": 686314,
        "timezone": "UTC",
        "date": "2021-04-07T19:00:00+00:00",
        "timestamp": 1617822000
      },
      "league": {
        "id": 2,
        "season": 2020,
        "name": "UEFA Champions League",
        "country": "World",
        "logo": "https://media.api-sports.io/football/leagues/2.png",
        "flag": null
      }
    },
    {
      "player": {
        "id": 496,
        "name": "R. Hoffmann",
        "photo": "https://media.api-sports.io/football/players/496.png",
        "type": "Missing Fixture",
        "reason": "Knee Injury"
      },
      "team": {
        "id": 157,
        "name": "Bayern Munich",
        "logo": "https://media.api-sports.io/football/teams/157.png"
      },
      "fixture": {
        "id": 686314,
        "timezone": "UTC",
        "date": "2021-04-07T19:00:00+00:00",
        "timestamp": 1617822000
      },
      "league": {
        "id": 2,
        "season": 2020,
        "name": "UEFA Champions League",
        "country": "World",
        "logo": "https://media.api-sports.io/football/leagues/2.png",
        "flag": null
      }
    },
    {
      "player": {
        "id": 521,
        "name": "R. Lewandowski",
        "photo": "https://media.api-sports.io/football/players/521.png",
        "type": "Missing Fixture",
        "reason": "Knee Injury"
      },
      "team": {
        "id": 157,
        "name": "Bayern Munich",
        "logo": "https://media.api-sports.io/football/teams/157.png"
      },
      "fixture": {
        "id": 686314,
        "timezone": "UTC",
        "date": "2021-04-07T19:00:00+00:00",
        "timestamp": 1617822000
      },
      "league": {
        "id": 2,
        "season": 2020,
        "name": "UEFA Champions League",
        "country": "World",
        "logo": "https://media.api-sports.io/football/leagues/2.png",
        "flag": null
      }
    },
    {
      "player": {
        "id": 514,
        "name": "J. Martinez",
        "photo": "https://media.api-sports.io/football/players/514.png",
        "type": "Missing Fixture",
        "reason": "Knock"
      },
      "team": {
        "id": 157,
        "name": "Bayern Munich",
        "logo": "https://media.api-sports.io/football/teams/157.png"
      },
      "fixture": {
        "id": 686314,
        "timezone": "UTC",
        "date": "2021-04-07T19:00:00+00:00",
        "timestamp": 1617822000
      },
      "league": {
        "id": 2,
        "season": 2020,
        "name": "UEFA Champions League",
        "country": "World",
        "logo": "https://media.api-sports.io/football/leagues/2.png",
        "flag": null
      }
    },
    {
      "player": {
        "id": 162037,
        "name": "M. Tillman",
        "photo": "https://media.api-sports.io/football/players/162037.png",
        "type": "Missing Fixture",
        "reason": "Knee Injury"
      },
      "team": {
        "id": 157,
        "name": "Bayern Munich",
        "logo": "https://media.api-sports.io/football/teams/157.png"
      },
      "fixture": {
        "id": 686314,
        "timezone": "UTC",
        "date": "2021-04-07T19:00:00+00:00",
        "timestamp": 1617822000
      },
      "league": {
        "id": 2,
        "season": 2020,
        "name": "UEFA Champions League",
        "country": "World",
        "logo": "https://media.api-sports.io/football/leagues/2.png",
        "flag": null
      }
    },
    {
      "player": {
        "id": 519,
        "name": "C. Tolisso",
        "photo": "https://media.api-sports.io/football/players/519.png",
        "type": "Missing Fixture",
        "reason": "Tendon Injury"
      },
      "team": {
        "id": 157,
        "name": "Bayern Munich",
        "logo": "https://media.api-sports.io/football/teams/157.png"
      },
      "fixture": {
        "id": 686314,
        "timezone": "UTC",
        "date": "2021-04-07T19:00:00+00:00",
        "timestamp": 1617822000
      },
      "league": {
        "id": 2,
        "season": 2020,
        "name": "UEFA Champions League",
        "country": "World",
        "logo": "https://media.api-sports.io/football/leagues/2.png",
        "flag": null
      }
    },
    {
      "player": {
        "id": 258,
        "name": "J. Bernat",
        "photo": "https://media.api-sports.io/football/players/258.png",
        "type": "Missing Fixture",
        "reason": "Knee Injury"
      },
      "team": {
        "id": 85,
        "name": "Paris Saint Germain",
        "logo": "https://media.api-sports.io/football/teams/85.png"
      },
      "fixture": {
        "id": 686314,
        "timezone": "UTC",
        "date": "2021-04-07T19:00:00+00:00",
        "timestamp": 1617822000
      },
      "league": {
        "id": 2,
        "season": 2020,
        "name": "UEFA Champions League",
        "country": "World",
        "logo": "https://media.api-sports.io/football/leagues/2.png",
        "flag": null
      }
    },
    {
      "player": {
        "id": 769,
        "name": "A. Florenzi",
        "photo": "https://media.api-sports.io/football/players/769.png",
        "type": "Missing Fixture",
        "reason": "Illness"
      },
      "team": {
        "id": 85,
        "name": "Paris Saint Germain",
        "logo": "https://media.api-sports.io/football/teams/85.png"
      },
      "fixture": {
        "id": 686314,
        "timezone": "UTC",
        "date": "2021-04-07T19:00:00+00:00",
        "timestamp": 1617822000
      },
      "league": {
        "id": 2,
        "season": 2020,
        "name": "UEFA Champions League",
        "country": "World",
        "logo": "https://media.api-sports.io/football/leagues/2.png",
        "flag": null
      }
    },
    {
      "player": {
        "id": 216,
        "name": "M. Icardi",
        "photo": "https://media.api-sports.io/football/players/216.png",
        "type": "Missing Fixture",
        "reason": "Muscle Injury"
      },
      "team": {
        "id": 85,
        "name": "Paris Saint Germain",
        "logo": "https://media.api-sports.io/football/teams/85.png"
      },
      "fixture": {
        "id": 686314,
        "timezone": "UTC",
        "date": "2021-04-07T19:00:00+00:00",
        "timestamp": 1617822000
      },
      "league": {
        "id": 2,
        "season": 2020,
        "name": "UEFA Champions League",
        "country": "World",
        "logo": "https://media.api-sports.io/football/leagues/2.png",
        "flag": null
      }
    },
    {
      "player": {
        "id": 263,
        "name": "L. Kurzawa",
        "photo": "https://media.api-sports.io/football/players/263.png",
        "type": "Missing Fixture",
        "reason": "Calf Injury"
      },
      "team": {
        "id": 85,
        "name": "Paris Saint Germain",
        "logo": "https://media.api-sports.io/football/teams/85.png"
      },
      "fixture": {
        "id": 686314,
        "timezone": "UTC",
        "date": "2021-04-07T19:00:00+00:00",
        "timestamp": 1617822000
      },
      "league": {
        "id": 2,
        "season": 2020,
        "name": "UEFA Champions League",
        "country": "World",
        "logo": "https://media.api-sports.io/football/leagues/2.png",
        "flag": null
      }
    },
    {
      "player": {
        "id": 271,
        "name": "L. Paredes",
        "photo": "https://media.api-sports.io/football/players/271.png",
        "type": "Missing Fixture",
        "reason": "Suspended"
      },
      "team": {
        "id": 85,
        "name": "Paris Saint Germain",
        "logo": "https://media.api-sports.io/football/teams/85.png"
      },
      "fixture": {
        "id": 686314,
        "timezone": "UTC",
        "date": "2021-04-07T19:00:00+00:00",
        "timestamp": 1617822000
      },
      "league": {
        "id": 2,
        "season": 2020,
        "name": "UEFA Champions League",
        "country": "World",
        "logo": "https://media.api-sports.io/football/leagues/2.png",
        "flag": null
      }
    },
    {
      "player": {
        "id": 273,
        "name": "M. Verratti",
        "photo": "https://media.api-sports.io/football/players/273.png",
        "type": "Missing Fixture",
        "reason": "Illness"
      },
      "team": {
        "id": 85,
        "name": "Paris Saint Germain",
        "logo": "https://media.api-sports.io/football/teams/85.png"
      },
      "fixture": {
        "id": 686314,
        "timezone": "UTC",
        "date": "2021-04-07T19:00:00+00:00",
        "timestamp": 1617822000
      },
      "league": {
        "id": 2,
        "season": 2020,
        "name": "UEFA Champions League",
        "country": "World",
        "logo": "https://media.api-sports.io/football/leagues/2.png",
        "flag": null
      }
    }
  ]
}