API-SPORTS Account
If you decided to subscribe directly on our site, you have a dashboard at your disposal at the following url: dashboard

It allows you to:

To follow your consumption in real time
Manage your subscription and change it if necessary
Check the status of our servers
Test all endpoints without writing a line of code.
You can also consult all this information directly through the API by calling the endpoint status.

This call does not count against the daily quota.

get("https://v3.football.api-sports.io/status");

// response
{
    "get": "status",
    "parameters": [],
    "errors": [],
    "results": 1,
    "response": {
        "account": {
            "firstname": "xxxx",
            "lastname": "XXXXXX",
            "email": "xxx@xxx.com"
        },
        "subscription": {
            "plan": "Free",
            "end": "2020-04-10T23:24:27+00:00",
            "active": true
        },
        "requests": {
            "current": 12,
            "limit_day": 100
        }
    }
}
Headers sent as response
When consuming our API, you will always receive the following headers appended to the response:

x-ratelimit-requests-limit: The number of requests allocated per day according to your subscription.
x-ratelimit-requests-remaining: The number of remaining requests per day according to your subscription.
X-RateLimit-Limit: Maximum number of API calls per minute.
X-RateLimit-Remaining: Number of API calls remaining before reaching the limit per minute.
Dashboard
dashboard

Requests
requests

Live tester
requests

RAPIDAPI Account
All information related to your subscription are available on the rapidApi developer dashboard.

The RapidAPI developer dashboard is where you can see all of your apps, locate API keys, view analytics, and manage billing settings.

To access the dashboard, simply login to RapidAPI and select 'My Apps' in the top-right menu. Alternatively, you can head directly to https://rapidapi.com/developer/dashboard.

In the main dashboard, you will see account-wide analytics and account information. To get more detailed information, you can select tabs on the left-hand side of the screen.

App Specific Analytics
Using the RapidAPI dashboard, you can also view analytics specific to each app in your account. To do so, switch over to the 'Analytics' tab of your application in the dashboard.

On the top of the page, you'll be able to see a chart with all the calls being made to all the APIs your app is connected to. You'll also be able to see a log with all the request data. You are also able to filter these analytics to only show certain APIs within the app.

In each graph, you can view the following metrics:

API Calls: how many requests are being made
Error rates: how many requests are error some
Latency: how long (on average) requests take to execute
You may change the time period you're looking at by clicking the calendar icon and choosing a time range.

Headers sent as response
When consuming our API, you will always receive the following headers appended to the response:

server: The current version of the API proxy used by RapidAPI.
x-ratelimit-requests-limit: The number of requests the plan you are currently subscribed to allows you to make, before incurring overages.
x-ratelimit-requests-remaining: The number of requests remaining before you reach the limit of requests your application is allowed to make, before experiencing overage charges.
X-RapidAPI-Proxy-Response: This header is set to true when the RapidAPI proxy generates the response, (i.e. the response is not generated from our servers)