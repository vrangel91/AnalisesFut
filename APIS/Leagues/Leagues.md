Leagues
Get the list of available leagues and cups.

The league id are unique in the API and leagues keep it across all seasons

To get the logo of a competition you have to call the following url: https://media.api-sports.io/football/leagues/{league_id}.png

This endpoint also returns the coverage of each competition, which makes it possible to know what is available for that league or cup.

The values returned by the coverage indicate the data available at the moment you call the API, so for a competition that has not yet started, it is normal to have all the features set to False. This will be updated once the competition has started.

You can find all the leagues ids on our Dashboard.

Example :

"coverage": {
  "fixtures": {
      "events": true,
      "lineups": true,
      "statistics_fixtures": false,
      "statistics_players": false
  },
  "standings": true,
  "players": true,
  "top_scorers": true,
  "top_assists": true,
  "top_cards": true,
  "injuries": true,
  "predictions": true,
  "odds": false
}
In this example we can deduce that the competition does not have the following features: statistics_fixtures, statistics_players, odds because it is set to False.

The coverage of a competition can vary from season to season and values set to True do not guarantee 100% data availability.

Some competitions, such as the friendlies, are exceptions to the coverage indicated in the leagues endpoint, and the data available may differ depending on the match, including livescore, events, lineups, statistics and players.

Competitions are automatically renewed by the API when a new season is available. There may be a delay between the announcement of the official calendar and the availability of data in the API.

For Cup competitions, fixtures are automatically added when the two participating teams are known. For example if the current phase is the 8th final, the quarter final will be added once the teams playing this phase are known.

Examples available in Request samples "Use Cases".

Most of the parameters of this endpoint can be used together.

Update Frequency : This endpoint is updated several times a day.

Recommended Calls : 1 call per hour.

query Parameters
id	
integer
The id of the league

name	
string
The name of the league

country	
string
The country name of the league

code	
string [ 2 .. 6 ] characters FR, GB-ENG, IT…
The Alpha code of the country

season	
integer = 4 characters YYYY
The season of the league

team	
integer
The id of the team

type	
string
Enum: "league" "cup"
The type of the league

current	
string Return the list of active seasons or the las...Show pattern
Enum: "true" "false"
The state of the league

search	
string >= 3 characters
The name or the country of the league

last	
integer <= 2 characters
The X last leagues/cups added in the API

header Parameters
x-rapidapi-key
required
string
Your Api-Key


casos de uso:

// Allows to retrieve all the seasons available for a league/cup
get("https://v3.football.api-sports.io/leagues?id=39");

// Get all leagues from one league {name}
get("https://v3.football.api-sports.io/leagues?name=premier league");

// Get all leagues from one {country}
// You can find the available {country} by using the endpoint country
get("https://v3.football.api-sports.io/leagues?country=england");

// Get all leagues from one country {code} (GB, FR, IT etc..)
// You can find the available country {code} by using the endpoint country
get("https://v3.football.api-sports.io/leagues?code=gb");

// Get all leagues from one {season}
// You can find the available {season} by using the endpoint seasons
get("https://v3.football.api-sports.io/leagues?season=2019");

// Get one league from one league {id} & {season}
get("https://v3.football.api-sports.io/leagues?season=2019&id=39");

// Get all leagues in which the {team} has played at least one match
get("https://v3.football.api-sports.io/leagues?team=33");

// Allows you to search for a league in relation to a league {name} or {country}
get("https://v3.football.api-sports.io/leagues?search=premier league");
get("https://v3.football.api-sports.io/leagues?search=England");

// Get all leagues from one {type}
get("https://v3.football.api-sports.io/leagues?type=league");

// Get all leagues where the season is in progress or not
get("https://v3.football.api-sports.io/leagues?current=true");

// Get the last 99 leagues or cups added to the API
get("https://v3.football.api-sports.io/leagues?last=99");

// It’s possible to make requests by mixing the available parameters
get("https://v3.football.api-sports.io/leagues?season=2019&country=england&type=league");
get("https://v3.football.api-sports.io/leagues?team=85&season=2019");
get("https://v3.football.api-sports.io/leagues?id=61¤t=true&type=league");



request geT:
fetch("https://v3.football.api-sports.io/leagues", {
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
  "get": "leagues",
  "parameters": {
    "id": "39"
  },
  "errors": [],
  "results": 1,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
    {
      "league": {
        "id": 39,
        "name": "Premier League",
        "type": "League",
        "logo": "https://media.api-sports.io/football/leagues/2.png"
      },
      "country": {
        "name": "England",
        "code": "GB",
        "flag": "https://media.api-sports.io/flags/gb.svg"
      },
      "seasons": [
        {
          "year": 2010,
          "start": "2010-08-14",
          "end": "2011-05-17",
          "current": false,
          "coverage": {
            "fixtures": {
              "events": true,
              "lineups": true,
              "statistics_fixtures": false,
              "statistics_players": false
            },
            "standings": true,
            "players": true,
            "top_scorers": true,
            "top_assists": true,
            "top_cards": true,
            "injuries": true,
            "predictions": true,
            "odds": false
          }
        },
        {
          "year": 2011,
          "start": "2011-08-13",
          "end": "2012-05-13",
          "current": false,
          "coverage": {
            "fixtures": {
              "events": true,
              "lineups": true,
              "statistics_fixtures": false,
              "statistics_players": false
            },
            "standings": true,
            "players": true,
            "top_scorers": true,
            "top_assists": true,
            "top_cards": true,
            "injuries": true,
            "predictions": true,
            "odds": false
          }
        }
      ]
    }
  ]
}