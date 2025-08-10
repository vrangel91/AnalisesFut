Players statistics
Get the players statistics from one fixture.

Update Frequency : This endpoint is updated every minute.

Recommended Calls : 1 call every minute for the fixtures in progress otherwise 1 call per day.

query Parameters
fixture
required
integer
The id of the fixture

team	
integer
The id of the team

header Parameters
x-rapidapi-key
required
string
Your Api-Key


casos de uso:
// Get all available players statistics from one {fixture}
get("https://v3.football.api-sports.io/fixtures/players?fixture=169080");

// Get all available players statistics from one {fixture} & {team}
get("https://v3.football.api-sports.io/fixtures/players?fixture=169080&team=2284");


response:
{
  "get": "fixtures/players",
  "parameters": {
    "fixture": "169080"
  },
  "errors": [],
  "results": 2,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
    {
      "team": {
        "id": 2284,
        "name": "Monarcas",
        "logo": "https://media.api-sports.io/football/teams/2284.png",
        "update": "2020-01-13T16:12:12+00:00"
      },
      "players": [
        {
          "player": {
            "id": 35931,
            "name": "Sebastián Sosa",
            "photo": "https://media.api-sports.io/football/players/35931.png"
          },
          "statistics": [
            {
              "games": {
                "minutes": 90,
                "number": 13,
                "position": "G",
                "rating": "6.3",
                "captain": false,
                "substitute": false
              },
              "offsides": null,
              "shots": {
                "total": 0,
                "on": 0
              },
              "goals": {
                "total": null,
                "conceded": 1,
                "assists": null,
                "saves": 0
              },
              "passes": {
                "total": 17,
                "key": 0,
                "accuracy": "68%"
              },
              "tackles": {
                "total": null,
                "blocks": 0,
                "interceptions": 0
              },
              "duels": {
                "total": null,
                "won": null
              },
              "dribbles": {
                "attempts": 0,
                "success": 0,
                "past": null
              },
              "fouls": {
                "drawn": 0,
                "committed": 0
              },
              "cards": {
                "yellow": 0,
                "red": 0
              },
              "penalty": {
                "won": null,
                "commited": null,
                "scored": 0,
                "missed": 0,
                "saved": 0
              }
            }
          ]
        }
      ]
    }
  ]
}