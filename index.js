
const imageToBase64 = require('image-to-base64');
const schedule = require('node-schedule');
const fetch = require("node-fetch");
const Twit = require('twit');

let streamers = require('./streamers.json');
//require credentials with your personal credentials 
let credentials = require('./myCredentials.json');

//gameId from which you want to get streamers
const gameId = "32399";
//number of top streams
const number_of_streams = "20";
//urls for getting data from Twitch
const data_url = "https://api.twitch.tv/helix/streams?game_id=" + 
    gameId + "&first=" + number_of_streams; 
const follower_url = 'https://api.twitch.tv/helix/users/follows?to_id=<ID>';

const T = new Twit({
    consumer_key: credentials.twitter.consumer_key,
    consumer_secret: credentials.twitter.consumer_secret,
    access_token: credentials.twitter.access_token,
    access_token_secret: credentials.twitter.access_token_secret,
})

//saves all the scaming streams for the session
let scammer_list = [];

async function getData(url = '') { //gets data from twitch
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

//loops through top n streams 
async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index]);
    }
}

//calculates how long the stream has been onlyne for
function getTime(startTime) { 
    var d1 = new Date();
    var d2 = new Date(startTime);
    return Math.floor((d1 - d2) / 60e3);
}

function checkStream(number_of_followers, id) { 
    let min_followers = 10;
    for(var i = 0; i < scammer_list.length; i++) {
        if(scammer_list[i] == id) return true;
    }
    if(number_of_followers < min_followers) {
        scammer_list.push(id);
        return true;
    }
    else return false;
}

//get picture from stream and ad it to Tweet
function makeTweet(stream) {
    var imageUrl = (stream.thumbnail_url.replace("{width}", "1280")).replace("{height}", "720");
    imageToBase64(imageUrl) 
        .then((response) => {return tweet(stream, response)})
        .catch((error) => {console.log(error)})
}

function tweet(stream, image) {
    T.post('media/upload', { media_data: image}, function (err, data, response) {
        var mediaIdStr = data.media_id_string
        var altText = "Stream thumbnail."
        var meta_params = { media_id: mediaIdStr, alt_text: { text: altText } }
                                
        T.post('media/metadata/create', meta_params, function (err, data, response) {
            if (!err) {
                var params = { 
                    status: stream.user_name + ' has been streaming for ' + getTime(stream.started_at) + ' minutes with ' + stream.viewer_count + ' viewers. #Twitch', 
                    media_ids: [mediaIdStr] 
                }
                T.post('statuses/update', params, function (err, data, response) {
                    console.log(data.text)
                })
            }
        })
    })
}

schedule.scheduleJob('*/15 * * * *', function() { //checks the game every 15 min
  var streams = getData(data_url)
    .then(data => {
        asyncForEach(data.data, function(stream){
            let followers = follower_url.replace("<ID>", stream.user_id);
            getData(followers)
            .then(data => {
                if(checkStream(data.total, stream.user_id)) {
                    console.log(stream);
                    console.log(scammer_list.length + ' scammers today');
                    makeTweet(stream);
                }
            })
            .catch(err => console.log(err))
        });
    })
    .catch(err => {console.log(err)});
});