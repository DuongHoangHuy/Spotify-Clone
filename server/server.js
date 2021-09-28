const express = require('express')
const app = express()
const SpotifyWebApi = require('spotify-web-api-node');
const cors = require('cors')
const lyricsFinder = require("lyrics-finder")
require('dotenv').config()

app.use(cors())
app.use(express.urlencoded({extended: true }))
app.use(express.json())

app.post('/refresh', (req, res)=>{
    const refreshToken = req.body.refreshToken
    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URL,
        refreshToken
    });

    // clientId, clientSecret and refreshToken has been set on the api object previous to this call.
    spotifyApi.refreshAccessToken()
        .then((data)=>{
            res.json({
                expiresIn: data.body['expires_in'],
                accessToken: data.body['access_token']
            })
        })
        .catch((err)=> {
            console.log('Error in refresh token', err.message)
            res.sendStatus(500)
        })
})

// credentials are optional
app.post('/login', (req, res)=>{
    const code = req.body.code
    const spotifyApi = new SpotifyWebApi({
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        redirectUri: process.env.REDIRECT_URL,
    });
    spotifyApi.authorizationCodeGrant(code)
        .then((data)=>{
            res.json({
                expiresIn: data.body['expires_in'],
                accessToken: data.body['access_token'],
                refreshToken: data.body['refresh_token']
            })
        })
        .catch(err => {
            console.log('Something went wrong', err.message)
            res.sendStatus(500)
        })    
})

app.get("/lyrics", async (req, res) => {
    const lyrics =
      (await lyricsFinder(req.query.artist, req.query.track)) || "No Lyrics Found"
    res.json({ lyrics })
})

const port = 3001
app.listen(port, ()=>{
    console.log('Listening port '+ port)
})