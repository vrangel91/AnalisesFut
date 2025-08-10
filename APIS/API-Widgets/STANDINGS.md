Standings
Display the ranking of a competition or a team according to the parameters used.

You can find all the leagues and teams ids on our Dashboard.

Example of the widget with the available themes image

query Parameters
data-host
required
string
Enum: "v3.football.api-sports.io" "api-football-v1.p.rapidapi.com"
data-key
required
string
Your Api Key

data-league	
integer
Fill in the desired league id

data-team	
integer
Fill in the desired team id

data-season
required
integer = 4 characters YYYY
Fill in the desired season

data-theme	
string
If you leave the field empty, the default theme will be applied, otherwise the possible values are grey or dark

data-show-errors	
string
Enum: true false
By default false, used for debugging, with a value of true it allows to display the errors

data-show-logos	
string
Enum: true false
If true display teams logos


endpoint get: https://v3.football.api-sports.io/widgets/standings



html:
<div id="wg-api-football-standings"
    data-host="v3.football.api-sports.io"
    data-key="Your-Api-Key-Here"
    data-league="39"
    data-team=""
    data-season="2021"
    data-theme=""
    data-show-errors="false"
    data-show-logos="true"
    class="wg_loader">
</div>
<script
    type="module"
    src="https://widgets.api-sports.io/2.0.3/widgets.js">
</script>
