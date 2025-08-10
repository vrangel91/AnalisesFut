Javascript
Fetch

var myHeaders = new Headers();
myHeaders.append("x-rapidapi-key", "XxXxXxXxXxXxXxXxXxXxXxXx");
myHeaders.append("x-rapidapi-host", "v3.football.api-sports.io");

var requestOptions = {
  method: 'GET',
  headers: myHeaders,
  redirect: 'follow'
};

fetch("https://v3.football.api-sports.io/leagues", requestOptions)
  .then(response => response.text())
  .then(result => console.log(result))
  .catch(error => console.log('error', error));
jQuery

var settings = {
  "url": "https://v3.football.api-sports.io/leagues",
  "method": "GET",
  "timeout": 0,
  "headers": {
    "x-rapidapi-key": "XxXxXxXxXxXxXxXxXxXxXxXx",
    "x-rapidapi-host": "v3.football.api-sports.io"
  },
};

$.ajax(settings).done(function (response) {
  console.log(response);
});
XHR

var xhr = new XMLHttpRequest();
xhr.withCredentials = true;

xhr.addEventListener("readystatechange", function() {
  if(this.readyState === 4) {
    console.log(this.responseText);
  }
});

xhr.open("GET", "https://v3.football.api-sports.io/leagues");
xhr.setRequestHeader("x-rapidapi-key", "XxXxXxXxXxXxXxXxXxXxXxXx");
xhr.setRequestHeader("x-rapidapi-host", "v3.football.api-sports.io");

xhr.send();