const fetch = require("node-fetch");
const credentials = require('./myCredentials.json');

console.log(credentials.twitch);

const client_id = credentials.twitch.client_id;
const client_secret = credentials.twitch.client_secret;
const token_url = "https://id.twitch.tv/oauth2/token?client_id=" +
    client_id + "&client_secret=" + 
    client_secret + "&grant_type=client_credentials";

//OAuth tokens
async function getToken(url = '') {
    const response = await fetch(url, {method: 'POST'});
    return response.json();
}

let token = getToken(token_url)
  .then(data => {console.log(data)})
  .catch(err => {console.log(err)});

console.log(token);
credentials.twitch.Authorization = "Bearer " + token;