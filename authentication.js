const token_url = 'https://id.twitch.tv/oauth2/token?client_id=9f7ey5y14unht69khzr78l0t0dpret&client_secret=7m1iuiibfp63stt45ycvm6xy5gjvt5&grant_type=client_credentials';
//OAuth tokens
async function getToken(url = '') {
    const response = await fetch(url, {method: 'POST'});
    return response.json();
}
var token = getToken(token_url)
  .then(data => {console.log(data)})
  .catch(err => {console.log(err)});

console.log(token);