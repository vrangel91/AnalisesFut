Lineups
Get the lineups for a fixture.

Lineups are available between 20 and 40 minutes before the fixture when the competition covers this feature. You can check this with the endpoint leagues and the coverage field.

It's possible that for some competitions the lineups are not available before the fixture, this can be the case for minor competitions

Available datas

Formation
Coach
Start XI
Substitutes
Players' positions on the grid *

X = row and Y = column (X:Y)

Line 1 X being the one of the goal and then for each line this number is incremented. The column Y will go from left to right, and incremented for each player of the line.

* As a new feature, some irregularities may occur, do not hesitate to report them on our public Roadmap

Update Frequency : This endpoint is updated every 15 minutes.

Recommended Calls : 1 call every 15 minutes for the fixtures in progress otherwise 1 call per day.

Here are several examples of what can be done

demo-lineups

demo-lineups

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

caos de uso:
// Get all available lineups from one {fixture}
get("https://v3.football.api-sports.io/fixtures/lineups?fixture=592872");

// Get all available lineups from one {fixture} & {team}
get("https://v3.football.api-sports.io/fixtures/lineups?fixture=592872&team=50");

// Get all available lineups from one {fixture} & {player}
get("https://v3.football.api-sports.io/fixtures/lineups?fixture=215662&player=35845");

// Get all available lineups from one {fixture} & {type}
get("https://v3.football.api-sports.io/fixtures/lineups?fixture=215662&type=startXI");

// It’s possible to make requests by mixing the available parameters
get("https://v3.football.api-sports.io/fixtures/lineups?fixture=215662&player=35845&type=startXI");
get("https://v3.football.api-sports.io/fixtures/lineups?fixture=215662&team=463&type=startXI&player=35845");


request get:
fetch("https://v3.football.api-sports.io/fixtures/lineups?fixture=592872", {
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
  "get": "fixtures/lineups",
  "parameters": {
    "fixture": "592872"
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
        "id": 50,
        "name": "Manchester City",
        "logo": "https://media.api-sports.io/football/teams/50.png",
        "colors": {
          "player": {
            "primary": "5badff",
            "number": "ffffff",
            "border": "99ff99"
          },
          "goalkeeper": {
            "primary": "99ff99",
            "number": "000000",
            "border": "99ff99"
          }
        }
      },
      "formation": "4-3-3",
      "startXI": [
        {
          "player": {
            "id": 617,
            "name": "Ederson",
            "number": 31,
            "pos": "G",
            "grid": "1:1"
          }
        },
        {
          "player": {
            "id": 627,
            "name": "Kyle Walker",
            "number": 2,
            "pos": "D",
            "grid": "2:4"
          }
        },
        {
          "player": {
            "id": 626,
            "name": "John Stones",
            "number": 5,
            "pos": "D",
            "grid": "2:3"
          }
        },
        {
          "player": {
            "id": 567,
            "name": "Rúben Dias",
            "number": 3,
            "pos": "D",
            "grid": "2:2"
          }
        },
        {
          "player": {
            "id": 641,
            "name": "Oleksandr Zinchenko",
            "number": 11,
            "pos": "D",
            "grid": "2:1"
          }
        },
        {
          "player": {
            "id": 629,
            "name": "Kevin De Bruyne",
            "number": 17,
            "pos": "M",
            "grid": "3:3"
          }
        },
        {
          "player": {
            "id": 640,
            "name": "Fernandinho",
            "number": 25,
            "pos": "M",
            "grid": "3:2"
          }
        },
        {
          "player": {
            "id": 631,
            "name": "Phil Foden",
            "number": 47,
            "pos": "M",
            "grid": "3:1"
          }
        },
        {
          "player": {
            "id": 635,
            "name": "Riyad Mahrez",
            "number": 26,
            "pos": "F",
            "grid": "4:3"
          }
        },
        {
          "player": {
            "id": 643,
            "name": "Gabriel Jesus",
            "number": 9,
            "pos": "F",
            "grid": "4:2"
          }
        },
        {
          "player": {
            "id": 645,
            "name": "Raheem Sterling",
            "number": 7,
            "pos": "F",
            "grid": "4:1"
          }
        }
      ],
      "substitutes": [
        {
          "player": {
            "id": 50828,
            "name": "Zack Steffen",
            "number": 13,
            "pos": "G",
            "grid": null
          }
        },
        {
          "player": {
            "id": 623,
            "name": "Benjamin Mendy",
            "number": 22,
            "pos": "D",
            "grid": null
          }
        },
        {
          "player": {
            "id": 18861,
            "name": "Nathan Aké",
            "number": 6,
            "pos": "D",
            "grid": null
          }
        },
        {
          "player": {
            "id": 622,
            "name": "Aymeric Laporte",
            "number": 14,
            "pos": "D",
            "grid": null
          }
        },
        {
          "player": {
            "id": 633,
            "name": "İlkay Gündoğan",
            "number": 8,
            "pos": "M",
            "grid": null
          }
        },
        {
          "player": {
            "id": 44,
            "name": "Rodri",
            "number": 16,
            "pos": "M",
            "grid": null
          }
        },
        {
          "player": {
            "id": 931,
            "name": "Ferrán Torres",
            "number": 21,
            "pos": "F",
            "grid": null
          }
        },
        {
          "player": {
            "id": 636,
            "name": "Bernardo Silva",
            "number": 20,
            "pos": "M",
            "grid": null
          }
        },
        {
          "player": {
            "id": 642,
            "name": "Sergio Agüero",
            "number": 10,
            "pos": "F",
            "grid": null
          }
        }
      ],
      "coach": {
        "id": 4,
        "name": "Guardiola",
        "photo": "https://media.api-sports.io/football/coachs/4.png"
      }
    },
    {
      "team": {
        "id": 45,
        "name": "Everton",
        "logo": "https://media.api-sports.io/football/teams/45.png",
        "colors": {
          "player": {
            "primary": "070707",
            "number": "ffffff",
            "border": "66ff00"
          },
          "goalkeeper": {
            "primary": "66ff00",
            "number": "000000",
            "border": "66ff00"
          }
        }
      },
      "formation": "4-3-1-2",
      "startXI": [
        {
          "player": {
            "id": 2932,
            "name": "Jordan Pickford",
            "number": 1,
            "pos": "G",
            "grid": "1:1"
          }
        },
        {
          "player": {
            "id": 19150,
            "name": "Mason Holgate",
            "number": 4,
            "pos": "D",
            "grid": "2:4"
          }
        },
        {
          "player": {
            "id": 2934,
            "name": "Michael Keane",
            "number": 5,
            "pos": "D",
            "grid": "2:3"
          }
        },
        {
          "player": {
            "id": 19073,
            "name": "Ben Godfrey",
            "number": 22,
            "pos": "D",
            "grid": "2:2"
          }
        },
        {
          "player": {
            "id": 2724,
            "name": "Lucas Digne",
            "number": 12,
            "pos": "D",
            "grid": "2:1"
          }
        },
        {
          "player": {
            "id": 18805,
            "name": "Abdoulaye Doucouré",
            "number": 16,
            "pos": "M",
            "grid": "3:3"
          }
        },
        {
          "player": {
            "id": 326,
            "name": "Allan",
            "number": 6,
            "pos": "M",
            "grid": "3:2"
          }
        },
        {
          "player": {
            "id": 18762,
            "name": "Tom Davies",
            "number": 26,
            "pos": "M",
            "grid": "3:1"
          }
        },
        {
          "player": {
            "id": 2795,
            "name": "Gylfi Sigurðsson",
            "number": 10,
            "pos": "M",
            "grid": "4:1"
          }
        },
        {
          "player": {
            "id": 18766,
            "name": "Dominic Calvert-Lewin",
            "number": 9,
            "pos": "F",
            "grid": "5:2"
          }
        },
        {
          "player": {
            "id": 2413,
            "name": "Richarlison",
            "number": 7,
            "pos": "F",
            "grid": "5:1"
          }
        }
      ],
      "substitutes": [
        {
          "player": {
            "id": 18755,
            "name": "João Virgínia",
            "number": 31,
            "pos": "G",
            "grid": null
          }
        },
        {
          "player": {
            "id": 766,
            "name": "Robin Olsen",
            "number": 33,
            "pos": "G",
            "grid": null
          }
        },
        {
          "player": {
            "id": 156490,
            "name": "Niels Nkounkou",
            "number": 18,
            "pos": "D",
            "grid": null
          }
        },
        {
          "player": {
            "id": 18758,
            "name": "Séamus Coleman",
            "number": 23,
            "pos": "D",
            "grid": null
          }
        },
        {
          "player": {
            "id": 138849,
            "name": "Kyle John",
            "number": 48,
            "pos": "D",
            "grid": null
          }
        },
        {
          "player": {
            "id": 18765,
            "name": "André Gomes",
            "number": 21,
            "pos": "M",
            "grid": null
          }
        },
        {
          "player": {
            "id": 1455,
            "name": "Alex Iwobi",
            "number": 17,
            "pos": "F",
            "grid": null
          }
        },
        {
          "player": {
            "id": 18761,
            "name": "Bernard",
            "number": 20,
            "pos": "F",
            "grid": null
          }
        }
      ],
      "coach": {
        "id": 2407,
        "name": "C. Ancelotti",
        "photo": "https://media.api-sports.io/football/coachs/2407.png"
      }
    }
  ]
}