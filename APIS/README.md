

1. Configure a API Key:
   - A API key já está configurada no arquivo `src/services/api.js`
   - API Key: `723269d925a86ea56e8311e812380c97`



Odds (In-Play)
odds/live
This endpoint returns in-play odds for fixtures in progress.

Fixtures are added between 15 and 5 minutes before the start of the fixture. Once the fixture is over they are removed from the endpoint between 5 and 20 minutes. No history is stored. So fixtures that are about to start, fixtures in progress and fixtures that have just ended are available in this endpoint.

Update Frequency : This endpoint is updated every 5 seconds.*

* This value can change in the range of 5 to 60 seconds

INFORMATIONS ABOUT STATUS

"status": {
    "stopped": false, // True if the fixture is stopped by the referee for X reason
    "blocked": false, // True if bets on this fixture are temporarily blocked
    "finished": false // True if the fixture has not started or if it is finished
},
INFORMATIONS ABOUT VALUES

When several identical values exist for the same bet the main field is set to True for the bet being considered, the others will have the value False.

The main field will be set to True only if several identical values exist for the same bet.

When a value is unique for a bet the main value will always be False or null.

Example below :

"id": 36,
"name": "Over/Under Line",
"values": [
    {
        "value": "Over",
        "odd": "1.975",
        "handicap": "2",
        "main": true, // Bet to consider
        "suspended": false // True if this bet is temporarily suspended
    },
    {
        "value": "Over",
        "odd": "3.45",
        "handicap": "2",
        "main": false, // Bet to no consider
        "suspended": false
    },
]
query Parameters
fixture	
integer
The id of the fixture

league	
integer (In this endpoint the "season" parameter is ...Show pattern
The id of the league

bet	
integer
The id of the bet

header Parameters
x-rapidapi-key
required
string
Your Api-Key

Responses
200 OK
204 No Content
499 Time Out
500 Internal Server Error

get
/odds/live

Request samples
Use CasesPhpPythonNodeJavaScriptCurlRuby

Copy
fetch("https://v3.football.api-sports.io/odds/live?bet=1&league=39", {
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
Response samples
200204499500
Content type
application/json

Copy
Expand allCollapse all
{
"get": "odds/live",
"parameters": {
"fixture": "721238"
},
"errors": [ ],
"results": 1,
"paging": {
"current": 1,
"total": 1
},
"response": [
{}
]
}
odds/live/bets
Get all available bets for in-play odds.

All bets id can be used in endpoint odds/live as filters, but are not compatible with endpoint odds for pre-match odds.

Update Frequency : This endpoint is updated every 60 seconds.

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

Responses
200 OK
204 No Content
499 Time Out
500 Internal Server Error

get
/odds/live/bets

Request samples
Use CasesPhpPythonNodeJavaScriptCurlRuby

Copy
// Get all available bets
get("https://v3.football.api-sports.io/odds/live/bets");

// Get bet from one {id}
get("https://v3.football.api-sports.io/odds/live/bets?id=1");

// Allows you to search for a bet in relation to a bets {name}
get("https://v3.football.api-sports.io/odds/live/bets?search=winner");
Response samples
200204499500
Content type
application/json

Copy
Expand allCollapse all
{
"get": "odds/live/bets",
"parameters": [ ],
"errors": [ ],
"results": 137,
"paging": {
"current": 1,
"total": 1
},
"response": [
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{}
]
}
Odds (Pre-Match)
Odds
Get odds from fixtures, leagues or date.

This endpoint uses a pagination system, you can navigate between the different pages with to the page parameter.

Pagination : 10 results per page.

We provide pre-match odds between 1 and 14 days before the fixture.

We keep a 7-days history (The availability of odds may vary according to the leagues, seasons, fixtures and bookmakers)

Update Frequency : This endpoint is updated every 3 hours.

Recommended Calls : 1 call every 3 hours.

query Parameters
fixture	
integer
The id of the fixture

league	
integer
The id of the league

season	
integer = 4 characters YYYY
The season of the league

date	
stringYYYY-MM-DD
A valid date

timezone	
string
A valid timezone from the endpoint Timezone

page	
integer
Default: 1
Use for the pagination

bookmaker	
integer
The id of the bookmaker

bet	
integer
The id of the bet

header Parameters
x-rapidapi-key
required
string
Your Api-Key

Responses
200 OK
204 No Content
499 Time Out
500 Internal Server Error

get
/odds

Request samples
Use CasesPhpPythonNodeJavaScriptCurlRuby

Copy
// Get all available odds from one {fixture}
get("https://v3.football.api-sports.io/odds?fixture=164327");

// Get all available odds from one {league} & {season}
get("https://v3.football.api-sports.io/odds?league=39&season=2019");

// Get all available odds from one {date}
get("https://v3.football.api-sports.io/odds?date=2020-05-15");

// It’s possible to make requests by mixing the available parameters
get("https://v3.football.api-sports.io/odds?bookmaker=1&bet=4&league=39&season=2019");
get("https://v3.football.api-sports.io/odds?bet=4&fixture=164327");
get("https://v3.football.api-sports.io/odds?bookmaker=1&league=39&season=2019");
get("https://v3.football.api-sports.io/odds?date=2020-05-15&page=2&bet=4");
Response samples
200204499500
Content type
application/json

Copy
Expand allCollapse all
{
"get": "odds",
"parameters": {
"fixture": "326090",
"bookmaker": "6"
},
"errors": [ ],
"results": 1,
"paging": {
"current": 1,
"total": 1
},
"response": [
{}
]
}
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

Responses
200 OK
204 No Content
499 Time Out
500 Internal Server Error

get
/odds/mapping

Request samples
PhpPythonNodeJavaScriptCurlRuby

Copy
$client = new http\Client;
$request = new http\Client\Request;

$request->setRequestUrl('https://v3.football.api-sports.io/odds/mapping');
$request->setRequestMethod('GET');
$request->setHeaders(array(
	'x-rapidapi-host' => 'v3.football.api-sports.io',
	'x-rapidapi-key' => 'XxXxXxXxXxXxXxXxXxXxXxXx'
));

$client->enqueue($request)->send();
$response = $client->getResponse();

echo $response->getBody();
Response samples
200204499500
Content type
application/json

Copy
Expand allCollapse all
{
"get": "odds/mapping",
"parameters": [ ],
"errors": [ ],
"results": 129,
"paging": {
"current": 1,
"total": 1
},
"response": [
{},
{},
{},
{}
]
}
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

Responses
200 OK
204 No Content
499 Time Out
500 Internal Server Error

get
/odds/bookmakers

Request samples
Use CasesPhpPythonNodeJavaScriptCurlRuby

Copy
// Get all available bookmakers
get("https://v3.football.api-sports.io/odds/bookmakers");

// Get bookmaker from one {id}
get("https://v3.football.api-sports.io/odds/bookmakers?id=1");

// Allows you to search for a bookmaker in relation to a bookmakers {name}
get("https://v3.football.api-sports.io/odds/bookmakers?search=Betfair");
Response samples
200204499500
Content type
application/json

Copy
Expand allCollapse all
{
"get": "odds/bookmakers",
"parameters": [ ],
"errors": [ ],
"results": 15,
"paging": {
"current": 1,
"total": 1
},
"response": [
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{},
{}
]
}
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

Responses
200 OK
204 No Content
499 Time Out
500 Internal Server Error

