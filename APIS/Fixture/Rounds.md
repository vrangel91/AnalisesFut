Rounds
Get the rounds for a league or a cup.

The round can be used in endpoint fixtures as filters

Examples available in Request samples "Use Cases".

Update Frequency : This endpoint is updated every day.

Recommended Calls : 1 call per day.

query Parameters
league
required
integer
The id of the league

season
required
integer = 4 characters YYYY
The season of the league

current	
boolean
Enum: "true" "false"
The current round only

dates	
boolean
Default: false
Enum: "true" "false"
Add the dates of each round in the response

timezone	
string
A valid timezone from the endpoint Timezone

header Parameters
x-rapidapi-key
required
string
Your Api-Key

casos de uso:
// Get all available rounds from one {league} & {season}
get("https://v3.football.api-sports.io/fixtures/rounds?league=39&season=2019");

// Get all available rounds from one {league} & {season} With the dates of each round
get("https://v3.football.api-sports.io/fixtures/rounds?league=39&season=2019&dates=true");

// Get current round from one {league} & {season}
get("https://v3.football.api-sports.io/fixtures/rounds?league=39&season=2019&current=true");


request get:
fetch("https://v3.football.api-sports.io/fixtures/rounds?season=2019&league=61", {
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
  "get": "fixtures/rounds",
  "parameters": {
    "league": "39",
    "season": "2019"
  },
  "errors": [],
  "results": 38,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
    "Regular Season - 1",
    "Regular Season - 2",
    "Regular Season - 3",
    "Regular Season - 4",
    "Regular Season - 5",
    "Regular Season - 6",
    "Regular Season - 7",
    "Regular Season - 8",
    "Regular Season - 9",
    "Regular Season - 10",
    "Regular Season - 11",
    "Regular Season - 12",
    "Regular Season - 13",
    "Regular Season - 14",
    "Regular Season - 15",
    "Regular Season - 16",
    "Regular Season - 17",
    "Regular Season - 18",
    "Regular Season - 18",
    "Regular Season - 19",
    "Regular Season - 20",
    "Regular Season - 21",
    "Regular Season - 22",
    "Regular Season - 23",
    "Regular Season - 24",
    "Regular Season - 25",
    "Regular Season - 26",
    "Regular Season - 27",
    "Regular Season - 28",
    "Regular Season - 29",
    "Regular Season - 30",
    "Regular Season - 31",
    "Regular Season - 32",
    "Regular Season - 33",
    "Regular Season - 34",
    "Regular Season - 35",
    "Regular Season - 36",
    "Regular Season - 37",
    "Regular Season - 38"
  ]
}