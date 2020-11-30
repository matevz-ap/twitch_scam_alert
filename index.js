
const imageToBase64 = require('image-to-base64');
const schedule = require('node-schedule');
const fetch = require("node-fetch");
const Twit = require('twit');

var json = require('./streamers.json');

//urls for getting data from Twitch
const data_url = 'https://api.twitch.tv/helix/streams?game_id=32399&first=20';
const follower_url = 'https://api.twitch.tv/helix/users/follows?to_id=<ID>';

var T = new Twit({
    consumer_key: 'gvqwvFTkP2a91V6wxBxcNCfWi',
    consumer_secret: 'Tpv66ROJAndhYvKJosymkGzbqM3mUzLwpMhu0V5C8bdv6oq9Xw',
    access_token: '2765489543-o5fmVKyCWKmMpuRsDz78VKCmFaajd3XbKauudGl',
    access_token_secret: 'oQSpqXPkMuoDIJcjffbWdGi5cVscTTjYl3fxbWA4VW0ma',
})

//saves all the scaming streams for the session
let scammer_list = [];

async function getData(url = '') { //gets data from twitch
    let response = await fetch(url, {
        method: 'GET',
        headers: {
            'client-id': '9f7ey5y14unht69khzr78l0t0dpret', 
            'Authorization': 'Bearer okts1yk0c5cwjgq5b5k33kdz375osp',
        }
    });
    let data = await response.json();
    return data;
}

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
      await callback(array[index]);
    }
}

function getTime(startTime) { //calculates how long the stream has been onlyne for
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