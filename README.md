# twitch_scam_alert
Aplication that finds scaming streams in CS:GO category on Twitch

## Files

### index.js
Executes every 15min when ran with node index.js. It looks at top 20 streams for category and checks their followers. If the follower to view ratio is too big, it saves the stream and makes a tweet with the stream picture and other data (number of views, uptime).

### authentication.js
Generates tokes for Twitch, so you can get data from the website. They expire after a period of time so you need to update them. Wotking on automating this porcess.

### users.js
Finds a user_id by username of a streamer.

### credentials.json
This JSON file holds all of your credentials. All you need for Twitch and Twitter can be found on your API account (if you dont have one you need to sign up)

### NPMs
- image-to-base64
- node-schedule
- node-fetch
- twit
