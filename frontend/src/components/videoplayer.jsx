import React, { useEffect, useRef } from 'react';
import JSMpeg from 'jsmpeg-player';
import './videoplayer.css';

const VideoPlayer = ({ vidUrl }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const player = new JSMpeg.Player(vidUrl, {
            canvas: canvasRef.current,
            autoplay: true,
        });

        return () => {
            if (player) {
                player.destroy();
            }
        };
    }, []);

    return (
        <div className='videoContainer'><canvas ref={canvasRef} className='videoCanvas'> </canvas></div>
    );
}

export default VideoPlayer;
