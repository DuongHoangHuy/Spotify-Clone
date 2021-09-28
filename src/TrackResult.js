import React from 'react';

function TrackResult({track, chooseTrack}) {
    function handlePlay(){
        chooseTrack(track)
    }
    return (
        <div 
            className="d-flex m-2 align-items-center" // default flex row 
            style={{cursor: "pointer"}}
            onClick={handlePlay}
        >
            <img src={track.image} style={{width:"64px", height:"64px"}} />
            <div className="ms-3">
                <div>{track.title}</div>
                <div className="text-muted">{track.artist}</div>
            </div>
        </div>
    );
}

export default TrackResult;