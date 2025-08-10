Mapping
Get the list of available fixtures id for the endpoint odds.

All fixtures, leagues id and date can be used in endpoint odds as filters.

This endpoint uses a pagination system, you can navigate between the different pages with to the page parameter.

Pagination : 100 results per page.

Update Frequency : This endpoint is updated every day.

Recommended Calls : 1 call per day.

query Parameters
page	
integer
Default: 1
Use for the pagination

header Parameters
x-rapidapi-key
required
string
Your Api-Key

request get:
fetch("https://v3.football.api-sports.io/odds/mapping", {
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
  "get": "odds/mapping",
  "parameters": [],
  "errors": [],
  "results": 129,
  "paging": {
    "current": 1,
    "total": 1
  },
  "response": [
    {
      "league": {
        "id": 106,
        "season": 2019
      },
      "fixture": {
        "id": 154507,
        "date": "2020-05-29T18:30:00+00:00",
        "timestamp": 1590777000
      },
      "update": "2020-05-15T09:52:28+00:00"
    },
    {
      "league": {
        "id": 106,
        "season": 2019
      },
      "fixture": {
        "id": 154508,
        "date": "2020-05-29T16:00:00+00:00",
        "timestamp": 1590768000
      },
      "update": "2020-05-15T09:52:28+00:00"
    },
    {
      "league": {
        "id": 271,
        "season": 2019
      },
      "fixture": {
        "id": 182450,
        "date": "2020-05-23T13:55:00+00:00",
        "timestamp": 1590242100
      },
      "update": "2020-05-15T09:51:45+00:00"
    },
    {
      "league": {
        "id": 271,
        "season": 2019
      },
      "fixture": {
        "id": 182564,
        "date": "2020-05-27T18:00:00+00:00",
        "timestamp": 1590602400
      },
      "update": "2020-05-15T09:52:17+00:00"
    }
  ]
}