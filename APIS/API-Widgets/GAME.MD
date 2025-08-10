Game
Display a specific fixture as well as events, statistics, lineups and players statistics if they are available.

The fixture is automatically updated according to the selected frequency data-refresh.

Example of the widget with the default theme image

query Parameters
data-host
required
string
Enum: "v3.football.api-sports.io" "api-football-v1.p.rapidapi.com"
data-key
required
string
Your Api Key

data-refresh	
integer >15
Number in seconds corresponding to the desired data update frequency. If you indicate 0 or leave this field empty the data will not be updated automatically

data-id	
integer
Fill in the desired fixture id

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
If true display teams logos and players images


HTML:
<div id="wg-api-football-game"
    data-host="v3.football.api-sports.io"
    data-key="Your-Api-Key-Here"
    data-id="718243"
    data-theme=""
    data-refresh="15"
    data-show-errors="false"
    data-show-logos="true">
</div>
<script
    type="module"
    src="https://widgets.api-sports.io/2.0.3/widgets.js">
</script>
