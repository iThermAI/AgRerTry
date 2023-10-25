import React, { useEffect, useRef } from 'react';
import JSMpeg from 'jsmpeg-player';
import './videoplayer.css';

const VideoPlayer = () => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const player = new JSMpeg.Player(`ws://localhost:9998`, {
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
