import asyncio
import threading
from flask import Flask, jsonify
import threading
import numpy as np
from sklearn.gaussian_process import GaussianProcessRegressor
from sklearn.gaussian_process.kernels import RBF, ConstantKernel as C
import os
import logging
import urllib
from ai import EstimatorResinRatio
from sensors import CameraRGB, CameraThermal, reset
import pickle
from db import (
    last_sample,
    new_experiment,
    set_expermient_period,
    stop_experiment,
)
from image_processing import FeatureExtractionArray, ScoreEstimation
from globals import StartRun

logging.basicConfig(level=logging.DEBUG)

# temp = 0
# Thermal Cameral fram
## ControlVarible
# index = 0
# lastTime = 0


## Flask App
app = Flask(__name__)


# # create a loop in a new thread and keep a reference to it
# loop = asyncio.new_event_loop()
# thread = threading.Thread(target=start_loop, args=(loop,), daemon=True)
# thread.start()
# Loop
loop = None


## Gussian process
gp = None
InitialTemp = 20
CatallystAmount = 0


## Necessary Functions
async def main():
    loop = asyncio.get_running_loop()
    # Start the sensor client
    # on_sensor_con_lost = loop.create_future()
    # _, _ = await loop.create_connection(
    #     lambda: SensorClientProtocol(on_sensor_con_lost),
    #     '192.168.1.186', 25555)
    ## Cammera parameters
    username = "admin"
    password = "qwe!@#123"
    password = urllib.parse.quote(password)
    RTSP_RGB_URL = (
        f"rtsp://{username}:{password}@192.168.1.64:554/Streaming/Channels/101"
    )
    # RTSP_URL = f'rtsp://{username}:{password}@192.168.1.64:554/h264Preview_01_main'
    RTSP_THERMAL_URL = (
        f"rtsp://{username}:{password}@192.168.1.64:554/Streaming/Channels/102"
    )
    CameraRGB(RTSP_RGB_URL, loop).start()
    CameraThermal(RTSP_THERMAL_URL, loop).start()


# asyncio.run(main())
def start_loop(loop):
    asyncio.set_event_loop(loop)
    loop.run_forever()
    print("The Loop stoped and Thread is going to finish")


def stop_loop(loop):
    loop.call_soon_threadsafe(loop.stop)
    ## Close The Loop
    stop_experiment()


TempMax = 34
TempMin = 18

ResinMax = 300
ResinMin = 180


@app.route("/api/initiate", methods=["GET"])
def Initiate():
    global gp
    # data = request.json
    ## Load GP
    with open("GP.pkl", "rb") as f:
        gp = pickle.load(f)
    t = 25
    ## ResinRatio Estimation
    CatallystAmount = EstimatorResinRatio(
        t,
        gp,
        TempratureMin=TempMin,
        TempratureMax=TempMax,
        ResinMin=ResinMin,
        ResinMax=ResinMax,
    )

    returnObj = {
        "catRatio": CatallystAmount / ResinMax,
        "initialRoomTemp": t,
        "initialResinTemp": "83 C",
    }

    return jsonify(returnObj), 200


## Device Parameter
PartNumber = 0


@app.route("/api/start", methods=["GET"])
def start():
    global loop, StartRun, FlagStart
    # use loop.call_soon_threadsafe() to schedule tasks on the loop
    if not StartRun:
        StartRun = True
        ## Create Experiemts table
        reset()
        # index = 0
        # FlagStart = 1
        # lastTime = 0
        Experiment_id = new_experiment(PartNumber)
        idTable = str(Experiment_id)
        ## Create new loop
        loop = asyncio.new_event_loop()
        thread = threading.Thread(target=start_loop, args=(loop,), daemon=True)
        thread.start()
        loop.call_soon_threadsafe(loop.create_task, main())
        return jsonify({"id": idTable}), 200
    else:
        return "Running experiment already exists", 500


@app.route("/api/finish", methods=["GET"])
def stop():
    global loop, StartRun, device, gp, InitialTemp, CatallystAmount
    # use loop.call_soon_threadsafe() to stop the loop
    # loop.call_soon_threadsafe(loop.stop)
    if StartRun:
        StartRun = False
        stop_loop(loop)
        # ## Feature Extraction
        # Features = FeatureExtraction()
        # ## Input to AI model
        # score = ScoreEstimation(Features,device=device,Estimator=SelfAttentionModel)

        ## Score Estimation
        ### Make InputFeature from database
        FeatureArray = FeatureExtractionArray()
        ### Feed Feature to the model
        score = ScoreEstimation(FeatureArray)

        ## Update GP and save GP
        gp_new = GaussianProcessRegressor(kernel=gp.kernel_)
        X_new = np.zeros(1, 2)
        X_new[0, 0] = InitialTemp
        X_new[0, 1] = CatallystAmount
        gp_new.fit(X_new, score)
        with open("GP.pkl", "wb") as f:
            pickle.dump(gp_new, f)

        ## Calculate and save Experiment Period
        LastDataSample = last_sample()
        ExperimentPeriod = LastDataSample["Time"]

        set_expermient_period(ExperimentPeriod)
        stop_experiment()

        returnObj = {"score": score}
        return jsonify(returnObj), 200
    else:
        return "There is no experiement running"


@app.route("/test", methods=["GET"])
def test():
    app.logger.debug("in test")
    return "hi"


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    host = "0.0.0.0"  # it should change to backend server address
    app.logger.debug(port)
    app.run(debug=True, host=host, port=port)
