Games
Display the list of matches grouped by competition according to the parameters used.

The matches are automatically updated according to the selected frequency data-refresh.

You can find all the leagues ids on our Dashboard.

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

data-date	
stringYYYY-MM-DD
Fill in the desired date. If empty the current date is automatically applied

data-league	
integer
Fill in the desired league id

data-season	
integer = 4 characters YYYY
Fill in the desired season

data-theme	
string
If you leave the field empty, the default theme will be applied, otherwise the possible values are grey or dark

data-show-toolbar	
string
Enum: true false
Displays the toolbar allowing to change the view between the current, finished or upcoming fixtures and to change the date

data-show-logos	
string
Enum: true false
If true display teams logos

data-modal-game	
string
Enum: true false
If true allows to load a modal containing all the details of the game

data-modal-standings	
string
Enum: true false
If true allows to load a modal containing the standings

data-modal-show-logos	
string
Enum: true false
If true display teams logos and players images in the modal

data-show-errors	
string
Enum: true false
By default false, used for debugging, with a value of true it allows to display the errors



HTM:

<div id="wg-api-football-games"
     data-host="v3.football.api-sports.io"
     data-key="Your-Api-Key-Here"
     data-date=""
     data-league=""
     data-season=""
     data-theme=""
     data-refresh="15"
     data-show-toolbar="true"
     data-show-errors="false"
     data-show-logos="true"
     data-modal-game="true"
     data-modal-standings="true"
     data-modal-show-logos="true">
</div>
<script
    type="module"
    src="https://widgets.api-sports.io/2.0.3/widgets.js">
</script>



ENDPOINT GET: https://v3.football.api-sports.io/widgets/Games


