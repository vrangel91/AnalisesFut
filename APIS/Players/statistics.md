Statistics
Get players statistics.

This endpoint returns the players for whom the profile and statistics data are available. Note that it is possible that a player has statistics for 2 teams in the same season in case of transfers.

The statistics are calculated according to the team id, league id and season.

You can find the available seasons by using the endpoint players/seasons.

To get the squads of the teams it is better to use the endpoint players/squads.

The players id are unique in the API and players keep it among all the teams they have been in.

In this endpoint you have the rating field, which is the rating of the player according to a match or a season. This data is calculated according to the performance of the player in relation to the other players of the game or the season who occupy the same position (Attacker, defender, goal...). There are different algorithms that take into account the position of the player and assign points according to his performance.

To get the photo of a player you have to call the following url: https://media.api-sports.io/football/players/{player_id}.png

This endpoint uses a pagination system, you can navigate between the different pages with to the page parameter.

Pagination : 20 results per page.

Update Frequency : This endpoint is updated several times a week.

Recommended Calls : 1 call per day.

Tutorials :

HOW TO GET ALL TEAMS AND PLAYERS FROM A LEAGUE ID
query Parameters
id	
integer
The id of the player

team	
integer
The id of the team

league	
integer
The id of the league

season	
integer = 4 characters YYYY | Requires the fields Id, League or Team...
The season of the league

search	
string >= 4 characters Requires the fields League or Team
The name of the player

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
// Get all players statistics from one player {id} & {season}
get("https://v3.football.api-sports.io/players?id=19088&season=2018");

// Get all players statistics from one {team} & {season}
get("https://v3.football.api-sports.io/players?season=2018&team=33");
get("https://v3.football.api-sports.io/players?season=2018&team=33&page=2");

// Get all players statistics from one {league} & {season}
get("https://v3.football.api-sports.io/players?season=2018&league=61");
get("https://v3.football.api-sports.io/players?season=2018&league=61&page=4");

// Get all players statistics from one {league}, {team} & {season}
get("https://v3.football.api-sports.io/players?season=2018&league=61&team=33");
get("https://v3.football.api-sports.io/players?season=2018&league=61&team=33&page=5");

// Allows you to search for a player in relation to a player {name}
get("https://v3.football.api-sports.io/players?team=85&search=cavani");
get("https://v3.football.api-sports.io/players?league=61&search=cavani");
get("https://v3.football.api-sports.io/players?team=85&search=cavani&season=2018");



request get:
fetch("https://v3.football.api-sports.io/players?id=276&season=2019", {
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
  "get": "players",
  "parameters": {
    "id": "276",
    "season": "2019"
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
        "age": 28,
        "birth": {
          "date": "1992-02-05",
          "place": "Mogi das Cruzes",
          "country": "Brazil"
        },
        "nationality": "Brazil",
        "height": "175 cm",
        "weight": "68 kg",
        "injured": false,
        "photo": "https://media.api-sports.io/football/players/276.png"
      },
      "statistics": [
        {
          "team": {
            "id": 85,
            "name": "Paris Saint Germain",
            "logo": "https://media.api-sports.io/football/teams/85.png"
          },
          "league": {
            "id": 61,
            "name": "Ligue 1",
            "country": "France",
            "logo": "https://media.api-sports.io/football/leagues/61.png",
            "flag": "https://media.api-sports.io/flags/fr.svg",
            "season": 2019
          },
          "games": {
            "appearences": 15,
            "lineups": 15,
            "minutes": 1322,
            "number": null,
            "position": "Attacker",
            "rating": "8.053333",
            "captain": false
          },
          "substitutes": {
            "in": 0,
            "out": 3,
            "bench": 0
          },
          "shots": {
            "total": 70,
            "on": 36
          },
          "goals": {
            "total": 13,
            "conceded": null,
            "assists": 6,
            "saves": 0
          },
          "passes": {
            "total": 704,
            "key": 39,
            "accuracy": 79
          },
          "tackles": {
            "total": 13,
            "blocks": 0,
            "interceptions": 4
          },
          "duels": {
            "total": null,
            "won": null
          },
          "dribbles": {
            "attempts": 143,
            "success": 88,
            "past": null
          },
          "fouls": {
            "drawn": 62,
            "committed": 14
          },
          "cards": {
            "yellow": 3,
            "yellowred": 1,
            "red": 0
          },
          "penalty": {
            "won": 1,
            "commited": null,
            "scored": 4,
            "missed": 1,
            "saved": null
          }
        }
      ]
    }
  ]
}