Events
Get the events from a fixture.

Available events

TYPE				
Goal	Normal Goal	Own Goal	Penalty	Missed Penalty
Card	Yellow Card	Red card		
Subst	Substitution [1, 2, 3...]			
Var	Goal cancelled	Penalty confirmed		
VAR events are available from the 2020-2021 season.
Update Frequency : This endpoint is updated every 15 seconds.

Recommended Calls : 1 call per minute for the fixtures in progress otherwise 1 call per day.

You can also retrieve all the events of the fixtures in progress with to the endpoint fixtures?live=all

Here is an example of what can be achieved

demo-events

query Parameters
fixture
required
integer
The id of the fixture

team	
integer
The id of the team

player	
integer
The id of the player

type	
string
The type

header Parameters
x-rapidapi-key
required
string
Your Api-Key


casos de uso:
// Get all available events from one {fixture}
get("https://v3.football.api-sports.io/fixtures/events?fixture=215662");

// Get all available events from one {fixture} & {team}
get("https://v3.football.api-sports.io/fixtures/events?fixture=215662&team=463");

// Get all available events from one {fixture} & {player}
get("https://v3.football.api-sports.io/fixtures/events?fixture=215662&player=35845");

// Get all available events from one {fixture} & {type}
get("https://v3.football.api-sports.io/fixtures/events?fixture=215662&type=card");

// It’s possible to make requests by mixing the available parameters
get("https://v3.football.api-sports.io/fixtures/events?fixture=215662&player=35845&type=card");
get("https://v3.football.api-sports.io/fixtures/events?fixture=215662&team=463&type=goal&player=35845");


request get:
fetch("https://v3.football.api-sports.io/fixtures/events?fixture=215662", {
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
  "get": "fixtures/events",
  "parameters": {
    "fixture": "215662"
  },
  "errors": [],
  "results": 18,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
    {
      "time": {
        "elapsed": 25,
        "extra": null
      },
      "team": {
        "id": 463,
        "name": "Aldosivi",
        "logo": "https://media.api-sports.io/football/teams/463.png"
      },
      "player": {
        "id": 6126,
        "name": "F. Andrada"
      },
      "assist": {
        "id": null,
        "name": null
      },
      "type": "Goal",
      "detail": "Normal Goal",
      "comments": null
    },
    {
      "time": {
        "elapsed": 33,
        "extra": null
      },
      "team": {
        "id": 442,
        "name": "Defensa Y Justicia",
        "logo": "https://media.api-sports.io/football/teams/442.png"
      },
      "player": {
        "id": 5936,
        "name": "Julio González"
      },
      "assist": {
        "id": null,
        "name": null
      },
      "type": "Card",
      "detail": "Yellow Card",
      "comments": null
    },
    {
      "time": {
        "elapsed": 33,
        "extra": null
      },
      "team": {
        "id": 463,
        "name": "Aldosivi",
        "logo": "https://media.api-sports.io/football/teams/463.png"
      },
      "player": {
        "id": 6126,
        "name": "Federico Andrada"
      },
      "assist": {
        "id": null,
        "name": null
      },
      "type": "Card",
      "detail": "Yellow Card",
      "comments": null
    },
    {
      "time": {
        "elapsed": 36,
        "extra": null
      },
      "team": {
        "id": 442,
        "name": "Defensa Y Justicia",
        "logo": "https://media.api-sports.io/football/teams/442.png"
      },
      "player": {
        "id": 5931,
        "name": "Diego Rodríguez"
      },
      "assist": {
        "id": null,
        "name": null
      },
      "type": "Card",
      "detail": "Yellow Card",
      "comments": null
    },
    {
      "time": {
        "elapsed": 39,
        "extra": null
      },
      "team": {
        "id": 442,
        "name": "Defensa Y Justicia",
        "logo": "https://media.api-sports.io/football/teams/442.png"
      },
      "player": {
        "id": 5954,
        "name": "Fernando Márquez"
      },
      "assist": {
        "id": null,
        "name": null
      },
      "type": "Card",
      "detail": "Yellow Card",
      "comments": null
    },
    {
      "time": {
        "elapsed": 44,
        "extra": null
      },
      "team": {
        "id": 463,
        "name": "Aldosivi",
        "logo": "https://media.api-sports.io/football/teams/463.png"
      },
      "player": {
        "id": 6262,
        "name": "Emanuel Iñiguez"
      },
      "assist": {
        "id": null,
        "name": null
      },
      "type": "Card",
      "detail": "Yellow Card",
      "comments": null
    },
    {
      "time": {
        "elapsed": 46,
        "extra": null
      },
      "team": {
        "id": 442,
        "name": "Defensa Y Justicia",
        "logo": "https://media.api-sports.io/football/teams/442.png"
      },
      "player": {
        "id": 35695,
        "name": "D. Rodríguez"
      },
      "assist": {
        "id": 5947,
        "name": "B. Merlini"
      },
      "type": "subst",
      "detail": "Substitution 1",
      "comments": null
    },
    {
      "time": {
        "elapsed": 62,
        "extra": null
      },
      "team": {
        "id": 463,
        "name": "Aldosivi",
        "logo": "https://media.api-sports.io/football/teams/463.png"
      },
      "player": {
        "id": 6093,
        "name": "Gonzalo Verón"
      },
      "assist": {
        "id": null,
        "name": null
      },
      "type": "Card",
      "detail": "Yellow Card",
      "comments": null
    },
    {
      "time": {
        "elapsed": 73,
        "extra": null
      },
      "team": {
        "id": 442,
        "name": "Defensa Y Justicia",
        "logo": "https://media.api-sports.io/football/teams/442.png"
      },
      "player": {
        "id": 5942,
        "name": "A. Castro"
      },
      "assist": {
        "id": 6059,
        "name": "G. Mainero"
      },
      "type": "subst",
      "detail": "Substitution 2",
      "comments": null
    },
    {
      "time": {
        "elapsed": 74,
        "extra": null
      },
      "team": {
        "id": 463,
        "name": "Aldosivi",
        "logo": "https://media.api-sports.io/football/teams/463.png"
      },
      "player": {
        "id": 6561,
        "name": "N. Solís"
      },
      "assist": {
        "id": 35845,
        "name": "H. Burbano"
      },
      "type": "subst",
      "detail": "Substitution 1",
      "comments": null
    },
    {
      "time": {
        "elapsed": 75,
        "extra": null
      },
      "team": {
        "id": 463,
        "name": "Aldosivi",
        "logo": "https://media.api-sports.io/football/teams/463.png"
      },
      "player": {
        "id": 6093,
        "name": "G. Verón"
      },
      "assist": {
        "id": 6396,
        "name": "N. Bazzana"
      },
      "type": "subst",
      "detail": "Substitution 2",
      "comments": null
    },
    {
      "time": {
        "elapsed": 79,
        "extra": null
      },
      "team": {
        "id": 463,
        "name": "Aldosivi",
        "logo": "https://media.api-sports.io/football/teams/463.png"
      },
      "player": {
        "id": 6474,
        "name": "G. Gil"
      },
      "assist": {
        "id": 6550,
        "name": "F. Grahl"
      },
      "type": "subst",
      "detail": "Substitution 3",
      "comments": null
    },
    {
      "time": {
        "elapsed": 79,
        "extra": null
      },
      "team": {
        "id": 442,
        "name": "Defensa Y Justicia",
        "logo": "https://media.api-sports.io/football/teams/442.png"
      },
      "player": {
        "id": 5936,
        "name": "J. González"
      },
      "assist": {
        "id": 70767,
        "name": "B. Ojeda"
      },
      "type": "subst",
      "detail": "Substitution 3",
      "comments": null
    },
    {
      "time": {
        "elapsed": 84,
        "extra": null
      },
      "team": {
        "id": 442,
        "name": "Defensa Y Justicia",
        "logo": "https://media.api-sports.io/football/teams/442.png"
      },
      "player": {
        "id": 6540,
        "name": "Juan Rodriguez"
      },
      "assist": {
        "id": null,
        "name": null
      },
      "type": "Card",
      "detail": "Yellow Card",
      "comments": null
    },
    {
      "time": {
        "elapsed": 85,
        "extra": null
      },
      "team": {
        "id": 463,
        "name": "Aldosivi",
        "logo": "https://media.api-sports.io/football/teams/463.png"
      },
      "player": {
        "id": 35845,
        "name": "Hernán Burbano"
      },
      "assist": {
        "id": null,
        "name": null
      },
      "type": "Card",
      "detail": "Yellow Card",
      "comments": null
    },
    {
      "time": {
        "elapsed": 90,
        "extra": null
      },
      "team": {
        "id": 442,
        "name": "Defensa Y Justicia",
        "logo": "https://media.api-sports.io/football/teams/442.png"
      },
      "player": {
        "id": 5912,
        "name": "Neri Cardozo"
      },
      "assist": {
        "id": null,
        "name": null
      },
      "type": "Card",
      "detail": "Yellow Card",
      "comments": null
    },
    {
      "time": {
        "elapsed": 90,
        "extra": null
      },
      "team": {
        "id": 463,
        "name": "Aldosivi",
        "logo": "https://media.api-sports.io/football/teams/463.png"
      },
      "player": {
        "id": 35845,
        "name": "Hernán Burbano"
      },
      "assist": {
        "id": null,
        "name": null
      },
      "type": "Card",
      "detail": "Red Card",
      "comments": null
    },
    {
      "time": {
        "elapsed": 90,
        "extra": null
      },
      "team": {
        "id": 463,
        "name": "Aldosivi",
        "logo": "https://media.api-sports.io/football/teams/463.png"
      },
      "player": {
        "id": 35845,
        "name": "Hernán Burbano"
      },
      "assist": {
        "id": null,
        "name": null
      },
      "type": "Card",
      "detail": "Yellow Card",
      "comments": null
    }
  ]
}