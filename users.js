const fetch = require('node-fetch');
const credentials = require('./myCredentials.json');
//User ID by Username
let username = "s1mple";
const url = "https://api.twitch.tv/helix/users?login=" + username;

//gets data from twitch
async function getData(url = '') { 
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'client-id': credentials.twitch.client_id, 
            'Authorization': credentials.twitch.Authorization,
        }
    });
    let data = await response.json();
    return data;
}

//logs data from user with username
getData(url)
    .then(data => console.log(data))
    .catch(err => console.log(err));