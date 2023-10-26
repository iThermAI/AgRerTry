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
        expCat1,
        setExpCat1,
        expCat2,
        setExpCat2,
        expAcc,
        setExpAcc,
    } = useContext(InformationContext);

    // must implement a function to get the current ratio from api using experiment id or just get the last experiment ration
    // change this. TODO
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
                        AgRerTry Dashboard
                    </div>

                    {status === null && (
                        <div className={`info-box ${status === null ? 'fade-in' : 'fade-out'}`}>
                            <div>Enter resin weight for your experiment and Click Start Experiment.</div>
                            <div className='input-container'>
                                <label htmlFor="resin">Enter Resin weight in kg: </label>
                                <input
                                    className='input'
                                    id="resin"
                                    type="number"
                                    onChange={(e) => setResin(e.target.value)}
                                />
                                <Button className={`${(resin === null || resin === "") ? 'disabled-button' : ''}`}
                                    variant="contained" onClick={initiateExp} sx={{
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
                            <div style={{ margin: "5px" }}>Best Catalyst1 or trig93 weight in grams is: <span className='catRatio-info'>{(cat1 * resin / 24)}</span></div>
                            <div style={{ margin: "5px" }}>Best Catalyst2 or trig524 weight in grams is: <span className='catRatio-info'>{(cat2 * resin / 24)}</span></div>
                            <div style={{ margin: "5px" }}>Best Accelerator or cob 6% weight in grams is: <span className='catRatio-info'>{(acc * resin / 24)}</span></div>
                            <div style={{ marginTop: "10px" }}>If you are ready, press next to go to dashboard.</div>
                            <div>
                                <Button 
                                    variant="contained" onClick={() => startExp(expCat1, expCat2, expAcc)} sx={{
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
                            recommended Catalyst1/Catalyst2/Acc/resin weights:  <span className='catRatio-info'>{cat1 ? cat1 * resin / 24 : 0},{cat2 ? cat2 * resin / 24 : 0},{acc? acc * resin / 24 : 0},{resin? resin : 0}</span>
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
                                        <li>Resin weight:<span style={{ color: "white" }}> {resin}</span></li>
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