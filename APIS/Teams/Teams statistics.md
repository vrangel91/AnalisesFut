Teams statistics
Returns the statistics of a team in relation to a given competition and season.

It is possible to add the date parameter to calculate statistics from the beginning of the season to the given date. By default the API returns the statistics of all games played by the team for the competition and the season.

Update Frequency : This endpoint is updated twice a day.

Recommended Calls : 1 call per day for the teams who have at least one fixture during the day otherwise 1 call per week.

Here is an example of what can be achieved

demo-teams-statistics

query Parameters
league
required
integer
The id of the league

season
required
integer = 4 characters YYYY
The season of the league

team
required
integer
The id of the team

date	
stringYYYY-MM-DD
The limit date

header Parameters
x-rapidapi-key
required
string
Your Api-Key


casos de uso:
// Get all statistics for a {team} in a {league} & {season}
get("https://v3.football.api-sports.io/teams/statistics?league=39&team=33&season=2019");

//Get all statistics for a {team} in a {league} & {season} with a end {date}
get("https://v3.football.api-sports.io/teams/statistics?league=39&team=33&season=2019&date=2019-10-08");



request get:
fetch("https://v3.football.api-sports.io/teams/statistics?season=2019&team=33&league=39", {
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
  "get": "teams/statistics",
  "parameters": {
    "league": "39",
    "season": "2019",
    "team": "33"
  },
  "errors": [],
  "results": 11,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": {
    "league": {
      "id": 39,
      "name": "Premier League",
      "country": "England",
      "logo": "https://media.api-sports.io/football/leagues/39.png",
      "flag": "https://media.api-sports.io/flags/gb-eng.svg",
      "season": 2019
    },
    "team": {
      "id": 33,
      "name": "Manchester United",
      "logo": "https://media.api-sports.io/football/teams/33.png"
    },
    "form": "WDLDWLDLDWLWDDWWDLWWLWLLDWWDWDWWWWDWDW",
    "fixtures": {
      "played": {
        "home": 19,
        "away": 19,
        "total": 38
      },
      "wins": {
        "home": 10,
        "away": 8,
        "total": 18
      },
      "draws": {
        "home": 7,
        "away": 5,
        "total": 12
      },
      "loses": {
        "home": 2,
        "away": 6,
        "total": 8
      }
    },
    "goals": {
      "for": {
        "total": {
          "home": 40,
          "away": 26,
          "total": 66
        },
        "average": {
          "home": "2.1",
          "away": "1.4",
          "total": "1.7"
        },
        "minute": {
          "0-15": {
            "total": 4,
            "percentage": "6.06%"
          },
          "16-30": {
            "total": 17,
            "percentage": "25.76%"
          },
          "31-45": {
            "total": 11,
            "percentage": "16.67%"
          },
          "46-60": {
            "total": 13,
            "percentage": "19.70%"
          },
          "61-75": {
            "total": 10,
            "percentage": "15.15%"
          },
          "76-90": {
            "total": 8,
            "percentage": "12.12%"
          },
          "91-105": {
            "total": 3,
            "percentage": "4.55%"
          },
          "106-120": {
            "total": null,
            "percentage": null
          }
        },
        "under_over": {
          "0.5": {
            "over": 30,
            "under": 8
          },
          "1.5": {
            "over": 20,
            "under": 18
          },
          "2.5": {
            "over": 11,
            "under": 27
          },
          "3.5": {
            "over": 4,
            "under": 34
          },
          "4.5": {
            "over": 1,
            "under": 37
          }
        }
      },
      "against": {
        "total": {
          "home": 17,
          "away": 19,
          "total": 36
        },
        "average": {
          "home": "0.9",
          "away": "1.0",
          "total": "0.9"
        },
        "minute": {
          "0-15": {
            "total": 6,
            "percentage": "16.67%"
          },
          "16-30": {
            "total": 3,
            "percentage": "8.33%"
          },
          "31-45": {
            "total": 7,
            "percentage": "19.44%"
          },
          "46-60": {
            "total": 9,
            "percentage": "25.00%"
          },
          "61-75": {
            "total": 3,
            "percentage": "8.33%"
          },
          "76-90": {
            "total": 5,
            "percentage": "13.89%"
          },
          "91-105": {
            "total": 3,
            "percentage": "8.33%"
          },
          "106-120": {
            "total": null,
            "percentage": null
          }
        },
        "under_over": {
          "0.5": {
            "over": 25,
            "under": 13
          },
          "1.5": {
            "over": 10,
            "under": 28
          },
          "2.5": {
            "over": 1,
            "under": 37
          },
          "3.5": {
            "over": 0,
            "under": 38
          },
          "4.5": {
            "over": 0,
            "under": 38
          }
        }
      }
    },
    "biggest": {
      "streak": {
        "wins": 4,
        "draws": 2,
        "loses": 2
      },
      "wins": {
        "home": "4-0",
        "away": "0-3"
      },
      "loses": {
        "home": "0-2",
        "away": "2-0"
      },
      "goals": {
        "for": {
          "home": 5,
          "away": 3
        },
        "against": {
          "home": 2,
          "away": 3
        }
      }
    },
    "clean_sheet": {
      "home": 7,
      "away": 6,
      "total": 13
    },
    "failed_to_score": {
      "home": 2,
      "away": 6,
      "total": 8
    },
    "penalty": {
      "scored": {
        "total": 10,
        "percentage": "100.00%"
      },
      "missed": {
        "total": 0,
        "percentage": "0%"
      },
      "total": 10
    },
    "lineups": [
      {
        "formation": "4-2-3-1",
        "played": 32
      },
      {
        "formation": "3-4-1-2",
        "played": 4
      },
      {
        "formation": "3-4-2-1",
        "played": 1
      },
      {
        "formation": "4-3-1-2",
        "played": 1
      }
    ],
    "cards": {
      "yellow": {
        "0-15": {
          "total": 5,
          "percentage": "6.85%"
        },
        "16-30": {
          "total": 5,
          "percentage": "6.85%"
        },
        "31-45": {
          "total": 16,
          "percentage": "21.92%"
        },
        "46-60": {
          "total": 12,
          "percentage": "16.44%"
        },
        "61-75": {
          "total": 14,
          "percentage": "19.18%"
        },
        "76-90": {
          "total": 21,
          "percentage": "28.77%"
        },
        "91-105": {
          "total": null,
          "percentage": null
        },
        "106-120": {
          "total": null,
          "percentage": null
        }
      },
      "red": {
        "0-15": {
          "total": null,
          "percentage": null
        },
        "16-30": {
          "total": null,
          "percentage": null
        },
        "31-45": {
          "total": null,
          "percentage": null
        },
        "46-60": {
          "total": null,
          "percentage": null
        },
        "61-75": {
          "total": null,
          "percentage": null
        },
        "76-90": {
          "total": null,
          "percentage": null
        },
        "91-105": {
          "total": null,
          "percentage": null
        },
        "106-120": {
          "total": null,
          "percentage": null
        }
      }
    }
  }
}