import cv2
import numpy as np
import base64
from PIL import Image
import io
import torch
from db import get_all_images
from net import model, device


def base64_to_numpy(base64_string):
    # Decode the base64 string
    image_bytes = base64.b64decode(base64_string)

    # Convert bytes to image
    image = Image.open(io.BytesIO(image_bytes))

    # Convert image to numpy array
    numpy_array = np.array(image)

    return numpy_array


def FeatureExtractionArray():
    images = get_all_images()
    if len(images) == 0:
        return np.zeros((127, 18))  # 👈 remove this in production
    return np.vstack(list(map(ExtractFeatureFromFrame, images)))


def ExtractFeatureFromFrame(dictImage):
    framebase64 = dictImage["image_rgb"]
    numpyImage = base64_to_numpy(framebase64)
    Feature = FeatureExtraction(numpyImage)
    return Feature


def FeatureExtraction(frame):
    window_propagation = 30
    threshold_transition = 70
    avg_temp = []
    # propagations = []
    frame_iter = 0
    features_thermal = []
    # frame = frame[100:400,:]
    gray_frame = cv2.cvtColor(frame.astype(np.uint8), cv2.COLOR_BGR2GRAY)
    # feature number 1 ---> avg temp
    mean_temp = np.mean(gray_frame)
    avg_temp.append(mean_temp)

    # feature number 2 ---> heat propagation. same as heating/cooling rate
    if frame_iter > window_propagation:
        temperature_diff = (
            avg_temp[frame_iter] - avg_temp[frame_iter - window_propagation]
        ) / window_propagation
    # propagations.append(temperature_diff)
    else:
        temperature_diff = 0
    # feature number 3 ---> transition point of average temp
    if mean_temp > threshold_transition:
        transition_points = 1
    else:
        transition_points = 0
    # feature number 4 ---> transition point above threshold
    num_temp_above = np.sum(gray_frame > threshold_transition)
    # feature number 5 ---> gradient
    gradients_x = np.sum(np.gradient(gray_frame, axis=1))
    gradients_y = np.sum(np.gradient(gray_frame, axis=0))
    # feature number 6 ---> statistical analysis
    std_temp = np.std(gray_frame)

    histogram, bins = np.histogram(gray_frame, bins=10)
    # (mean_temp,temperature_diff,transition_points,num_temp_above,gradients_x,gradients_y,std_temp,histogram)
    temp = np.array(
        [
            mean_temp,
            temperature_diff,
            transition_points,
            num_temp_above,
            gradients_x,
            gradients_y,
            std_temp,
            0,
        ]
    )
    resultFeature = np.concatenate((temp, histogram))
    return resultFeature


def ScoreEstimation(InputTimeSeriesFeature):
    ## Extraction of Critical Point
    # index = 30# 👈 t should be extracted from input series
    # Length = 1000# 👈 It should be changed
    # ## Estimation

    # input = torch.tensor(InputTimeSeriesFeature[index:index+Length].astype(float)).to(device).float()
    # Estimator1.eval()
    # target = Estimator1(input)
    # return float(target.cpu().detach().numpy())
    InputTimeSeriesFeatureTensor = torch.tensor(InputTimeSeriesFeature, device=device)
    Score = model(InputTimeSeriesFeatureTensor.float())
    return Score.item()


# def EstimatorResinRatio(Temprature,gpLearned,TempratureMin,TempratureMax,ResinMin,ResinMax):
#     gpLearnedCopy = copy.deepcopy(gpLearned)
#     x = np.linspace(TempratureMin,TempratureMax, 50)
#     y = np.linspace(ResinMin,ResinMax, 50)
#     x, y = np.meshgrid(x, y)
#     X = np.vstack([x.ravel(), y.ravel()]).T

#     index = np.where(np.abs(x[0]-Temprature)<np.abs(x[0][0]-x[0][1])/2)
#     index[0][0]

#     y_pred1 = 2*np.sum(X,axis=1)

#     Yestimation = y_pred1.reshape(x.shape)

#     ymaxindex = np.argmax(Yestimation[:,index[0][0]])

#     return y[ymaxindex,index[0][0]]

# def ScoreEstimation(InputTimeSeriesFeature,device,Estimator):
#     ## Extraction of Critical Point
#     # index = 30# 👈 t should be extracted from input series
#     # Length = 1000# 👈 It should be changed
#     # ## Estimation
#     # Estimator1 = copy.deepcopy(Estimator)
#     # input = torch.tensor(InputTimeSeriesFeature[index:index+Length].astype(float)).to(device).float()
#     # Estimator1.eval()
#     # target = Estimator1(input)
#     # return float(target.cpu().detach().numpy())
#     return 8

# def FeatureExtraction():
#     ## Make Query to Database get all data of the last experiment -> get list every things

#     ## Apply Feature Extraction method -> numpy array

#     return np.random.randn(1000,18)
