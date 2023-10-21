import { io } from "socket.io-client";
import { useEffect, useState } from "react";

let socket = null

function App() {
  const [frameData, setFrameData] = useState(null);

  useEffect(() => {
      socket = io("localhost:5002/", {
        transports: ["websocket"],
        cors: {
          origin: "http://localhost:3000/",
        },
      });

      socket.on("connect", (data) => {
        // console.log(data);
        // console.log('hello');
        setFrameData(data.frame);


      });
    }, []);

  return (
    <div className="App">
      <h1>React/Flask App + socket.io</h1>
      {frameData && <img src={`data:image/jpeg;base64,${frameData}`} alt="Camera Feed" />}
      {frameData && <p>{frameData}</p>}


    </div>
  );
}

export default App;
