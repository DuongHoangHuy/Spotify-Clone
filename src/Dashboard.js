import {useState, useEffect} from 'react';
import useAuth from './useAuth'
import {Container, Form} from 'react-bootstrap'
import SpotifyWebApi from 'spotify-web-api-node';
import TrackResult from './TrackResult'
import Player from './Player'
import axios from 'axios'

const spotifyApi = new SpotifyWebApi({
    clientId: '0d07daa78db84ec6b1102c1628568ee6'
})

function Dashboard({code}) {
    const accessToken = useAuth(code) //Change when api return result
    const [search, setSearch] = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [playingTrack, setPlayingTrack] = useState(null)
    const [lyrics, setLyrics] = useState('')

    function chooseTrack(track){
        setPlayingTrack(track)
        setSearch('') // Hide the list when choose the song
        setLyrics('') // Reset the previous
    }

    useEffect(()=>{
        if(!accessToken) return
        spotifyApi.setAccessToken(accessToken)
    }, [accessToken])

    useEffect(()=>{
        if(!search) return setSearchResults([]) // Hide the list when choose the song
        if(!accessToken) return
        let cancel = false
        spotifyApi.searchTracks(search)
            .then(data => {
                if(cancel) return
                setSearchResults(data.body.tracks.items.map(track => {
                    const smallestImage = track.album.images.reduce((prev, cur)=>{
                        if(prev.height < cur.height) return prev
                        return cur
                    })
                    return {
                        artist: track.artists[0].name,
                        title: track.name,
                        uri: track.uri,
                        image: smallestImage.url
                    }
                }))
            })
        return ()=> cancel = true // set cancel for the prev request(not processed yet)
    }, [search, accessToken])

    useEffect(() => {
        if (!playingTrack) return
    
        axios
          .get("http://localhost:3001/lyrics", {
            params: {
              track: playingTrack.title,
              artist: playingTrack.artist,
            },
          })
          .then(res => {
            setLyrics(res.data.lyrics)
          })
      }, [playingTrack])

    return (
        <Container className="d-flex flex-column py-2 vh-100">
            <Form.Control 
            type="search"
            value={search}
            placeholder="Search Songs/Artists"
            onChange={(e)=> setSearch(e.target.value)}
            />
            <div className="flex-grow-1 my-2" style={{overflowY:"auto"}}>
                {searchResults.map(track => 
                    <TrackResult track={track} key={track.uri} chooseTrack={chooseTrack}/> 
                )}

                {(searchResults.length === 0 && playingTrack) && ( // When the list disapppear
                <div className="text-center" style={{ whiteSpace: "pre" }}>
                    <h3>{playingTrack.title}</h3>
                    {lyrics ? lyrics : 'Load lyrics...'}
                </div>
                )}

            </div>

            <div>
                <Player accessToken={accessToken} trackUri={playingTrack?.uri}/>
            </div>
        </Container>
    )

}

export default Dashboard;