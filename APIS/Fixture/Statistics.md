Statistics
Get the statistics for one fixture.

Available statistics

Shots on Goal
Shots off Goal
Shots insidebox
Shots outsidebox
Total Shots
Blocked Shots
Fouls
Corner Kicks
Offsides
Ball Possession
Yellow Cards
Red Cards
Goalkeeper Saves
Total passes
Passes accurate
Passes %
Update Frequency : This endpoint is updated every minute.

Recommended Calls : 1 call every minute for the teams or fixtures who have at least one fixture in progress otherwise 1 call per day.

Here is an example of what can be achieved

demo-statistics

query Parameters
fixture
required
integer
The id of the fixture

team	
integer
The id of the team

type	
string
The type of statistics

half	
boolean
Default: false
Enum: "true" "false"
Add the halftime statistics in the response Data start from 2024 season for half parameter

header Parameters
x-rapidapi-key
required
string
Your Api-Key


caos de uso:
// Get all available statistics from one {fixture}
get("https://v3.football.api-sports.io/fixtures/statistics?fixture=215662");

// Get all available statistics from one {fixture} with Fulltime, First & Second Half data
get("https://v3.football.api-sports.io/fixtures/statistics?fixture=215662&half=true");

// Get all available statistics from one {fixture} & {type}
get("https://v3.football.api-sports.io/fixtures/statistics?fixture=215662&type=Total Shots");

// Get all available statistics from one {fixture} & {team}
get("https://v3.football.api-sports.io/fixtures/statistics?fixture=215662&team=463");



request get:
fetch("https://v3.football.api-sports.io/fixtures/statistics?fixture=215662&team=463", {
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
  "get": "fixtures/statistics",
  "parameters": {
    "team": "463",
    "fixture": "215662"
  },
  "errors": [],
  "results": 1,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
    {
      "team": {
        "id": 463,
        "name": "Aldosivi",
        "logo": "https://media.api-sports.io/football/teams/463.png"
      },
      "statistics": [
        {
          "type": "Shots on Goal",
          "value": 3
        },
        {
          "type": "Shots off Goal",
          "value": 2
        },
        {
          "type": "Total Shots",
          "value": 9
        },
        {
          "type": "Blocked Shots",
          "value": 4
        },
        {
          "type": "Shots insidebox",
          "value": 4
        },
        {
          "type": "Shots outsidebox",
          "value": 5
        },
        {
          "type": "Fouls",
          "value": 22
        },
        {
          "type": "Corner Kicks",
          "value": 3
        },
        {
          "type": "Offsides",
          "value": 1
        },
        {
          "type": "Ball Possession",
          "value": "32%"
        },
        {
          "type": "Yellow Cards",
          "value": 5
        },
        {
          "type": "Red Cards",
          "value": 1
        },
        {
          "type": "Goalkeeper Saves",
          "value": null
        },
        {
          "type": "Total passes",
          "value": 242
        },
        {
          "type": "Passes accurate",
          "value": 121
        },
        {
          "type": "Passes %",
          "value": null
        }
      ]
    }
  ]
}