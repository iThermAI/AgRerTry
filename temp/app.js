// npm install socket.io-client

import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

const socket = io.connect('http://localhost:5000/video');

function App() {
  const [frameData, setFrameData] = useState(null);

  useEffect(() => {
    socket.on('frame', (data) => {
      setFrameData(data.image);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  return (
    <div className="App">
      {frameData && <img src={`data:image/jpeg;base64,${frameData}`} alt="Camera Feed" />}
    </div>
  );
}

export default App;
