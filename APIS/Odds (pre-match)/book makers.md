Bookmakers
Get all available bookmakers.

All bookmakers id can be used in endpoint odds as filters.

Update Frequency : This endpoint is updated several times a week.

Recommended Calls : 1 call per day.

query Parameters
id	
integer
The id of the bookmaker

search	
string = 3 characters
The name of the bookmaker

header Parameters
x-rapidapi-key
required
string
Your Api-Key


casos de uso:
// Get all available bookmakers
get("https://v3.football.api-sports.io/odds/bookmakers");

// Get bookmaker from one {id}
get("https://v3.football.api-sports.io/odds/bookmakers?id=1");

// Allows you to search for a bookmaker in relation to a bookmakers {name}
get("https://v3.football.api-sports.io/odds/bookmakers?search=Betfair");


request get:
fetch("https://v3.football.api-sports.io/odds/bookmakers", {
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
  "get": "odds/bookmakers",
  "parameters": [],
  "errors": [],
  "results": 15,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
    {
      "id": 1,
      "name": "10Bet"
    },
    {
      "id": 2,
      "name": "Marathonbet"
    },
    {
      "id": 3,
      "name": "Betfair"
    },
    {
      "id": 4,
      "name": "Pinnacle"
    },
    {
      "id": 5,
      "name": "Sport Betting Online"
    },
    {
      "id": 6,
      "name": "Bwin"
    },
    {
      "id": 7,
      "name": "William Hill"
    },
    {
      "id": 8,
      "name": "Bet365"
    },
    {
      "id": 9,
      "name": "Dafabet"
    },
    {
      "id": 10,
      "name": "Ladbrokes"
    },
    {
      "id": 11,
      "name": "1xBet"
    },
    {
      "id": 12,
      "name": "BetFred"
    },
    {
      "id": 13,
      "name": "188Bet"
    },
    {
      "id": 15,
      "name": "Interwetten"
    },
    {
      "id": 16,
      "name": "Unibet"
    }
  ]
}