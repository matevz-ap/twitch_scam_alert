//Usre ID by Username
getData('https://api.twitch.tv/helix/users?login=s1mple')
    .then(data => console.log(data))
    .catch(err => console.log(err));