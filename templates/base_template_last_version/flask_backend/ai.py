import numpy as np


import copy


def EstimatorResinRatio(
    Temprature, gpLearned, TempratureMin, TempratureMax, ResinMin, ResinMax
):
    gpLearnedCopy = copy.deepcopy(gpLearned)
    x = np.linspace(TempratureMin, TempratureMax, 50)
    y = np.linspace(ResinMin, ResinMax, 50)
    x, y = np.meshgrid(x, y)
    X = np.vstack([x.ravel(), y.ravel()]).T

    index = np.where(np.abs(x[0] - Temprature) < np.abs(x[0][0] - x[0][1]) / 2)
    index[0][0]

    y_pred1, sigma = gpLearned.predict(X, return_std=True)

    ## Create Mean Guassia Process
    Yestimation = y_pred1.reshape(x.shape)

    ymaxindex = np.argmax(Yestimation[:, index[0][0]])

    return y[ymaxindex, index[0][0]]
