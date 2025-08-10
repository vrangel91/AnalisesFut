Bets
Get all available bets for pre-match odds.

All bets id can be used in endpoint odds as filters, but are not compatible with endpoint odds/live for in-play odds.

Update Frequency : This endpoint is updated several times a week.

Recommended Calls : 1 call per day.

query Parameters
id	
string
The id of the bet name

search	
string = 3 characters
The name of the bet

header Parameters
x-rapidapi-key
required
string
Your Api-Key


casos de uso:
// Get all available bets
get("https://v3.football.api-sports.io/odds/bets");

// Get bet from one {id}
get("https://v3.football.api-sports.io/odds/bets?id=1");

// Allows you to search for a bet in relation to a bets {name}
get("https://v3.football.api-sports.io/odds/bets?search=winner");



request get:
fetch("https://v3.football.api-sports.io/odds/bets", {
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
  "get": "odds/bets",
  "parameters": {
    "search": "under"
  },
  "errors": [],
  "results": 7,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
    {
      "id": 5,
      "name": "Goals Over/Under"
    },
    {
      "id": 6,
      "name": "Goals Over/Under First Half"
    },
    {
      "id": 26,
      "name": "Goals Over/Under - Second Half"
    },
    {
      "id": 45,
      "name": "Corners Over Under"
    },
    {
      "id": 57,
      "name": "Home Corners Over/Under"
    },
    {
      "id": 58,
      "name": "Away Corners Over/Under"
    },
    {
      "id": 74,
      "name": "10 Over/Under"
    }
  ]
}