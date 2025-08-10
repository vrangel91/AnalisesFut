Profiles
Returns the list of all available players.

It is possible to call this endpoint without parameters, but you will need to use the pagination to get all available players.

To get the photo of a player you have to call the following url: https://media.api-sports.io/football/players/{player_id}.png

This endpoint uses a pagination system, you can navigate between the different pages with to the page parameter.

Pagination : 250 results per page.

Update Frequency : This endpoint is updated several times a week.

Recommended Calls : 1 call per week.

query Parameters
player	
integer
The id of the player

search	
string >= 3 characters
The lastname of the player

page	
integer
Default: 1
Use for the pagination

header Parameters
x-rapidapi-key
required
string
Your Api-Key


casos de uso:
// Get data from one {player}
get("https://v3.football.api-sports.io/players/profiles?player=276");

// Allows you to search for a player in relation to a player {lastname}
get("https://v3.football.api-sports.io/players/profiles?search=ney");

// Get all available Players (limited to 250 results, use the pagination for next ones)
get("https://v3.football.api-sports.io/players/profiles");
get("https://v3.football.api-sports.io/players/profiles?page=2");
get("https://v3.football.api-sports.io/players/profiles?page=3");


get request:
fetch("https://v3.football.api-sports.io/players/profiles?player=276", {
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
  "get": "players/profiles",
  "parameters": {
    "player": "276"
  },
  "errors": [],
  "results": 1,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
    {
      "player": {
        "id": 276,
        "name": "Neymar",
        "firstname": "Neymar",
        "lastname": "da Silva Santos Júnior",
        "age": 32,
        "birth": {
          "date": "1992-02-05",
          "place": "Mogi das Cruzes",
          "country": "Brazil"
        },
        "nationality": "Brazil",
        "height": "175 cm",
        "weight": "68 kg",
        "number": 10,
        "position": "Attacker",
        "photo": "https://media.api-sports.io/football/players/276.png"
      }
    }
  ]
}