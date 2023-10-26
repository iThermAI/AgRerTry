import { useState, useContext, useEffect } from 'react';
import "./dashboard.scss";
import {
    PlayCircleFilled as PlayCircleFilledIcon,
    Cancel as CancleIcon,
    Summarize as SummarizeIcon
} from "@mui/icons-material";
// import HeatMap from '../Charts/heatmap';
import GaugeChart from '../Charts/gauge';
// import BarChart from '../Charts/barChart';
import AreaChart from '../Charts/areaChart';
import "../sharedStyle.css";
import InformationContext from '../context/information';
import { Button } from "@mui/material";
import VideoPlayer from './videoplayer';
import axios from 'axios';

const Dashboard = () => {

    const {
        temp,
        cureSensorTemp,
        image,
        imageTH,
        status,
        catRatio,
        score,
        initialRoomTemp,
        initiateExp,
        startExp,
        finishExp,
        SummaryExp,
        StartOverExperiment,
        expCatRatio,
        setExpCatRatio
    } = useContext(InformationContext);

    // must implement a function to get the current ratio from api using experiment id or just get the last experiment ration
    useEffect(() => {
        (async () => {
            const { data: { ratio } } = await axios.get('/api/ratio')
            await setExpCatRatio(ratio)
        })()
    }, [])

    return (
        <>
            <div className="dashboard-container align-comp">
                <div className="sidebar" style={{ position: "relative", minWidth: "80px" }}>
                    <div style={{ position: "fixed" }}>
                        <ul>
                            <li className={`li-items ${status === "initiate" || status === "start" ? 'disabled' : ''}`}
                                onClick={status !== "initiate" && status !== "start" ? initiateExp : null}>
                                <PlayCircleFilledIcon sx={{ fontSize: "30px !important" }} />
                                <span className="sidebar-btn-txt" >Start Experiment</span>
                                <span className="sidebar-btn-txt-bottom">Start</span>
                            </li>
                            <li className={`li-items ${status === null || status === "initiate" || status === "finish" ? 'disabled' : ''}`}
                                onClick={status !== "null" ? finishExp : null}>
                                <CancleIcon sx={{ fontSize: "30px !important" }} />
                                <span className="sidebar-btn-txt" >Finish Experiment</span>
                                <span className="sidebar-btn-txt-bottom">Finish</span>
                            </li>
                            <li className={`li-items ${status === null || status === "initiate" || status === "start" ? 'disabled' : ''}`}
                                onClick={status !== "null" ? SummaryExp : null}>
                                <SummarizeIcon sx={{ fontSize: "30px !important" }} />
                                <span className="sidebar-btn-txt" >Summary of Expreriment</span>
                                <span className="sidebar-btn-txt-bottom">Summary</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="main-content" style={(status === null || status === "initiate") ? { height: '100vh' } : {}}>
                    <div className="dashboard-title">
                        VirtFuse Dashboard
                    </div>

                    {status === null && (
                        <div className={`info-box ${status === null ? 'fade-in' : 'fade-out'}`}>
                            <div>Click here to start your experiment.</div>
                            <div>
                                <Button variant="contained" onClick={initiateExp} sx={{
                                    background: "#f9dd3f",
                                    color: "black",
                                    fontSize: "1em",
                                    margin: "30px 0"
                                }}>Start Experiment</Button>
                            </div>
                        </div>
                    )}

                    {status === "initiate" && (
                        <div className={`warning-box ${status === "initiate" ? 'fade-in' : 'fade-out'}`}>
                            <div style={{ margin: "5px" }}>Best Catalyst/Resin Ratio is: <span className='catRatio-info'>{catRatio}</span></div>
                            <div style={{ margin: "10px 0" }}>
                                <label htmlFor="expCatRatio">Enter Catalyst/Resin Ratio: </label>
                                <input
                                    id="expCatRatio"
                                    type="number"
                                    onChange={(e) => { setExpCatRatio(e.target.value); }} // Assuming you have a state variable called resinRatio and a setter setResinRatio
                                />
                            </div>
                            <div>If you are ready, press next to go to dashboard.</div>
                            <div>
                                <Button className={`${expCatRatio === null ? 'disabled-button' : ''}`}
                                    variant="contained" onClick={() => startExp(expCatRatio)} sx={{
                                        background: "#f9dd3f",
                                        color: "black",
                                        fontSize: "1em",
                                        margin: "30px 0"
                                    }}>Next</Button>
                            </div>
                        </div>
                    )}

                    {(status === "start" || status === "finish") && (<div className={`dashboard-box ${(status === "start" || status === "finish") ? 'fade-in' : 'fade-out'}`}>
                        <div className="catRatio-box">
                            Current Catalyst/Resin Ratio:  <span className='catRatio-info'>{expCatRatio}</span>
                        </div>
                        {status === "finish" && <div className="catRatio-box" style={{ background: "#5a1010" }}>
                            Final Score of Infusion: <span className='catRatio-info' style={{ background: "#3f0000" }}>{score}</span>
                        </div>}
                        <div className="charts">
                            <div className="image-container" style={status === "finish" ? { flexDirection: 'row' } : { flexDirection: 'column' }}>
                                {
                                    (status === "start" || status === "finish") ? (
                                        <>
                                            {<VideoPlayer vidUrl="ws://localhost:9998" />}
                                            {<VideoPlayer vidUrl="ws://localhost:9999" />}
                                            {/* {<VideoPlayer />} */}
                                            {/* <img
                                                src={image}
                                                alt="Camera"
                                                className="camera-image"
                                                style={status === "finish" ? { width: '45%' } : { width: '100%' }}
                                            />

                                            <img
                                                src={imageTH}
                                                alt="Camera"
                                                className="camera-image"
                                                style={status === "finish" ? { width: '45%' } : { width: '100%' }}
                                            /> */}
                                        </>
                                    ) : <div style={{ width: '100%', height: '100%', background: "#1f263c" }} />
                                }
                            </div>
                            {status === "start" && <div className="gauge-container">
                                <div className="chart-info" style={{ minHeight: "40vh" }}>
                                    <div className="chart-info-title" style={{ margin: "15px 5px", fontSize: "20px", fontWeight: "bold" }}>
                                        More Information:
                                    </div>
                                    <ul>
                                        <li>Catalyst/Resin Ratio:<span style={{ color: "white" }}> {expCatRatio}</span></li>
                                        <li>Initial Room Temperature:<span style={{ color: "white" }}> {initialRoomTemp} </span></li>
                                    </ul>
                                </div>
                                <div className="gauge-chart" style={{ minHeight: "45vh" }}>
                                    <div className="chart-info-title" style={{ margin: "15px 5px", fontSize: "20px", fontWeight: "bold" }}>
                                        Room Temperature: {temp}
                                    </div>
                                    <GaugeChart />
                                </div>
                            </div>}
                        </div>
                        <div className="bar-charts-container">
                            <div className="area-chart">
                                <div className="chart-info-title" style={{ margin: "15px 5px", fontSize: "20px", fontWeight: "bold" }}>
                                    Room Temperature: {temp}
                                </div>
                                {image && <AreaChart index="resin" />}
                            </div>
                            <div className="area-chart">
                                <div className="chart-info-title" style={{ margin: "15px 5px", fontSize: "20px", fontWeight: "bold" }}>
                                    Curing Level: {cureSensorTemp}
                                </div>
                                {image && <AreaChart index="curingSensor" />}
                            </div>
                        </div>
                        {status === "finish" && <div style={{
                            width: "100%",
                            display: "flex",
                            justifyContent: "center",
                            fontSize: "x-large"
                        }}>
                            <Button variant="contained" onClick={StartOverExperiment} sx={{
                                background: "#f9dd3f",
                                color: "black",
                                fontSize: "1em",
                                margin: "30px 0"
                            }}>Start New Experiment</Button>
                        </div>}
                    </div>
                    )}
                </div>
            </div>
        </>
    );
}

export default Dashboard;