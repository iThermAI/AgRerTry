import Navbar from "./components/navbar";
import FirstView from "./components/firstView";
import Dashboard from "./components/dashboard";
import Login from "./components/login";
import Logout from "./components/logout";
import "./App.css";
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Route, Switch } from 'react-router-dom';
import { useState, useEffect, useRef } from "react";
import Protect from "./components/protect";
import InformationContext from "./context/information";
import axios from "axios";
import useWebSocket from 'react-use-websocket';

// import { socket } from './main'

export default function App() {
  const theme = createTheme({
    palette: {
      primary: {
        main: '#1f263c', // dark blue
      }
    },
  });
  const [auth, setAuth] = useState(localStorage.getItem('token') ? false : true);
  const onAuthentication = (value) => {
    setAuth(value)
  }
  const [isOpen, setIsOpen] = useState(false);
  const handleButtonClick = () => {
    setIsOpen(prevState => !prevState);
  }
  const [logoutTimer, setLogoutTimer] = useState(null);
  const onChangeLogoutTimer = (value) => {
    setLogoutTimer(value)
  }
  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location = "/login";
    setAuth(false);

    clearTimeout(logoutTimer);
    setLogoutTimer(null);
  }
  // Get the value from backend
  const [resin, setResin] = useState(0);
  const [temp, setTemp] = useState(null);
  const [cureSensorTemp, setCureSensorTemp] = useState(null);
  const [time, setTime] = useState([]);
  const [image, setImage] = useState(null);
  const [imageTH, setImageTH] = useState(null);
  const [resinFlow, setResinFlow] = useState(false);
  const toggleResinFlow = () => {
    setResinFlow(!resinFlow);
  }
  const [parts, setParts] = useState([]); // returns data of sensors


  const [requestInterval, setRequestInterval] = useState(null);
  const [status, setStatus] = useState(localStorage.getItem('status') ? localStorage.getItem('status') : null);
  // const [catRatio, setCatRatio] = useState(localStorage.getItem('catRatio') ? localStorage.getItem('catRatio') : null);
  const [cat1, setCat1] = useState(localStorage.getItem('cat1') ?? 0);
  const [cat2, setCat2] = useState(localStorage.getItem('cat2') ?? 0);
  const [acc, setAcc] = useState(localStorage.getItem('acc') ?? 0);
  const [initialRoomTemp, setInitialRoomTemp] = useState(localStorage.getItem('initialRoomTemp') ? localStorage.getItem('initialRoomTemp') : 0);
  const [id, setId] = useState(null);
  const [score, setScore] = useState(null);
  const previousTimeRef = useRef(null);
  // const [expCatRatio, setExpCatRatio] = useState(null);

  // const socket = new WebSocket();
  // socket.addEventListener('message', )
  const formatNumber = (num) => {
    if (num >= 1000000000000) {
      return (num / 1000000000000).toFixed(3) + 'T';
    } else if (num >= 1000000000) {
      return (num / 1000000000).toFixed(3) + 'G';
    }
    else {
      return (num / 1000000).toFixed(3) + 'M';
    }
  }

  useWebSocket('ws://localhost:9997', {
    onMessage: (event) => {
      setParts(event.data.replace(/\r/g, ' ').replace(/[a-zA-Z\n]/g, '').split(' '));
      // setTemp(prevTemp => [...prevTemp, parseFloat(parts[0])]);
      parseFloat(parts[0]) && setTemp(parseFloat(parts[0]));
      // TODO: learn how to calculate R from sensor data???
      // const curing = 3 * 1000000 * parseFloat(parts[1]) * parseFloat(parts[2])
      const curing = 1000000 * parseFloat(parts[2])

      // setCureSensorTemp(prevCureTemp => [...prevCureTemp, parseFloat(parts[2])]);
      setCureSensorTemp(formatNumber(curing));
    }
  })

  const initiateExp = (resinW) => {
    localStorage.setItem("status", "initiate");
    setStatus("initiate");
    // this should return the best cat1,...
    axios.post("/api/initiate", { resinW }).then((res) => {
      console.log(res.data);
      const data = {
        cat1W: parseFloat(res.data.cat1W),
        cat2W: parseFloat(res.data.cat2W),
        accW: parseFloat(res.data.accW),
        temp: parseFloat(res.data.temp),

      }
      // setCatRatio(res.data.catRatio);
      setCat1(data.cat1W);
      setCat2(data.cat2W);
      setAcc(data.accW);
      setInitialRoomTemp(data.temp)

      // localStorage.setItem("catRatio", data.catRatio);
      localStorage.setItem("cat1", data.cat1W);
      localStorage.setItem("cat2", data.cat2W);
      localStorage.setItem("acc", data.accW);
      localStorage.setItem("initialRoomTemp", data.temp)
    }).catch((err) => {
      console.log(err);
    });
  }


  const startExp = async () => { // cat1,cat2,cat3
    clearInterval(requestInterval);
    localStorage.setItem("status", "start");
    setStatus("start");

    await axios.get("/api/start").then((res) => {
      console.log(res);
      setId(res.data.id);
    }).catch((err) => {
      console.log(err);
    });
  }



  // useEffect(() => {
  //   axios.post("/node/createTable",
  //     {
  //       id: id
  //     })
  //     .then(res => {
  //       console.log(res);
  //       const interval = setInterval(() => {
  //         axios.get("/node/getInfo")
  //           .then((res) => {
  //             if (res.data.Time && res.data.Time !== previousTimeRef.current) {
  //               setTime(prevTime => [...prevTime, res.data.Time.toFixed(1)]);
  //               setTemp(prevTemp => [...prevTemp, res.data.resinTemp]);
  //               setCureSensorTemp(prevTime => [...prevTime, res.data.cureTemp]);
  //             }
  //             console.log("info", res.data.Time, previousTimeRef.current);
  //             previousTimeRef.current = res.data.Time;

  //             setImage('data:image/jpeg;base64,' + res.data.image_rgb);
  //             setImageTH('data:image/jpeg;base64,' + res.data.image_th);
  //           })
  //           .catch(err => {
  //             console.log(err);
  //           });


  //       }, 1000);
  //       setRequestInterval(interval);
  //     })
  //     .catch(err => {
  //       console.log(err);
  //     });

  // }, [id]);

  // useEffect(() => {
  //   if (temp.length === 1) {
  //     setInitialRoomTemp(temp[0]);
  //     localStorage.setItem("initialRoomTemp", temp[0]);

  //   }
  //   console.log(temp);
  // }, [temp]);


  const finishExp = () => {
    localStorage.setItem("status", "finish");
    setStatus("finish");
    clearInterval(requestInterval);
    axios.get("/api/finish").then((res) => {
      setScore(res.data.score);
    }).catch((err) => {
      console.log(err);
    });
  }

  const SummaryExp = () => {
    // !!!
    clearInterval(requestInterval);
    axios.get("/api/finish").then((res) => {
      console.log(res.data);
    }).catch((err) => {
      console.log(err);
    });
  }

  const StartOverExperiment = async () => {
    localStorage.removeItem('status');
    // localStorage.removeItem('catRatio');
    localStorage.removeItem('cat1');
    localStorage.removeItem('cat2');
    localStorage.removeItem('acc');
    localStorage.removeItem('initialRoomTemp');
    setStatus(null);
    clearInterval(requestInterval);
    await setTemp(null);
    await setCureSensorTemp(null);
    await setTime([]);
    axios.get("/api/finish").then((res) => {
      console.log(res.data);
    }).catch((err) => {
      console.log(err);
    });
  }

  useEffect(() => {
    function resetLogoutTimer() {
      console.log("resetLogoutTimer");
      if (logoutTimer === null) return;
      clearTimeout(logoutTimer);
      const timer = setTimeout(() => {
        localStorage.removeItem('token');
        window.location = "/login";
        setAuth(false);

        clearTimeout(logoutTimer);
        setLogoutTimer(null);
      }, 3600 * 1000);
      setLogoutTimer(timer);
    }
    window.addEventListener('click', resetLogoutTimer);
    return () => {
      window.removeEventListener('click', resetLogoutTimer);
    };
  }, [logoutTimer]);

  return (
    <>
      <ThemeProvider theme={theme}>
        <Navbar auth={auth} handleButtonClick={handleButtonClick} />
        <Switch>
          <Route exact path='/' render={(props) => <FirstView {...props} auth={auth} />} />
          <Route path='/login' render={(props) => <Login {...props}
            onAuthentication={onAuthentication}
            auth={auth}
            onChangeLogoutTimer={onChangeLogoutTimer}
            handleLogout={handleLogout}
          />} />
          <Route path='/logout' component={Logout} />
          <InformationContext.Provider value={{
            temp,
            cureSensorTemp,
            time,
            image,
            imageTH,
            resinFlow,
            toggleResinFlow,
            status,
            score,
            initialRoomTemp,
            initiateExp,
            startExp,
            finishExp,
            SummaryExp,
            StartOverExperiment,
            resin,
            setResin,
            cat1,
            setCat1,
            cat2,
            setCat2,
            acc,
            setAcc,
          }}>
            <Protect path='/dashboard' component={Dashboard} />
          </InformationContext.Provider>
        </Switch >
      </ThemeProvider>

    </>
  );
}
