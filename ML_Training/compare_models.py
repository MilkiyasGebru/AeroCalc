from typing import List
import math
# import pandas as pd
import matplotlib.pyplot as plt
import joblib
import numpy as np
import torch
import torch.nn as nn

frequencies = []
delta_frequency = initial_frequency = 0.001
final_frequency = 5
while initial_frequency <= final_frequency:
    frequencies.append(initial_frequency)
    initial_frequency += delta_frequency


def CalculateK(index: float, numbers: List[List[float]], alpha_bd: float, alpha_h: float) -> float:
    return numbers[index][0] * math.pow(alpha_bd, numbers[index][1]) + numbers[index][2] * alpha_h ** numbers[index][
        3] + numbers[index][4];

# This calculates the actual psd response for a given building dimension
def CalculateAcrossPsdResponse(width: float, height: float, depth: float, frequencies: List[float]) -> List[float]:
    alpha_bd: float = width / depth;
    alpha_h: float = height / (math.sqrt(width * depth));

    numbers: List[List] = []

    if (alpha_h < 1):
        numbers = [

            [0.03, -5.84, 0.008, 0.22, -0.006],
            [0.06, -0.05, 0.28, 0.07, -0.25],
            [0.3, 1.19, -0.89, -1.12, 1.70],
            [-5.20, -6.30, -0.07, 0.97, 3.16]
        ]
    elif ((alpha_h >= 1) and (alpha_h < 3) and (alpha_bd < 2.5)):
        numbers = [
            [0.01, -5.8, 0.005, -3.2, 0.004],
            [-0.45, -0.27, -1.02, -0.04, 1.51],
            [0.22, -9.81, 1.14, -3.22, 0.60],
            [3.19, -0.05, 9.66, -0.08, -10.34]
        ]
    elif ((alpha_h >= 1) and (alpha_h < 3) and (alpha_bd >= 2.5)):
        numbers = [
            [0.003, -0.58, 0.000, 1.35, -0.001],
            [0.000, 6.83, -2.19, 0.000, 2.29],
            [0.32, 0.31, -0.73, 0.11, 0.76],
            [-1.14, 0.07, -0.013, 2.8, 4.65]
        ]
    elif ((alpha_h >= 3) and (alpha_bd < 2.5)):
        numbers = [
            [0.016, -1.24, 8.60, -8.56, -0.005],
            [-1.00, -0.02, 0.09, -1.8, 1.08],
            [-0.037, -8.28, -0.5, -0.08, -0.10],
            [0.38, 0.33, 7.03, -3.17, 1.41]
        ]
    elif ((alpha_h >= 3) and (alpha_bd >= 2.5)):
        numbers = [
            [0.001, -0.625, 0.000, 1.230, 0.000],
            [0.000, 7.71, -2.19, -0.012, 2.25],
            [0.39, 0.68, -0.85, 0.045, 0.69],
            [-1.4, 0.5, -0.00, 2.9, 4.96]
        ]

    K1: float = CalculateK(0, numbers, alpha_bd, alpha_h)
    K2: float = CalculateK(1, numbers, alpha_bd, alpha_h)
    K3: float = CalculateK(2, numbers, alpha_bd, alpha_h)
    K4: float = CalculateK(3, numbers, alpha_bd, alpha_h)

    across_psd = []
    for frequency in frequencies:
        value = K1 * (frequency / K2) ** (K4) / (((1 - (frequency / K2) ** 2) ** 2) + K3 ** 2 * (frequency / K2) ** 2)
        across_psd.append(value)
    return across_psd

# This loads the GBERT model that we trained
gbert_model = joblib.load("your_gbrt_model.pkl")

# This uses the sa
scaler = joblib.load("Your_actual_scalar_file.pkl")
neural_network_params = joblib.load("your_neural_network_hyperparameter.pkl")

neural_network_model = nn.Sequential(
    nn.Linear(3, neural_network_params["n_hidden"]),
    nn.SiLU(),
    nn.Dropout(neural_network_params["dropout_rate"]),
    nn.Linear(neural_network_params["n_hidden"], neural_network_params["n_hidden"]),
    nn.SiLU(),
    nn.Dropout(neural_network_params["dropout_rate"]),
    nn.Linear(neural_network_params["n_hidden"], neural_network_params["n_hidden"]),
    nn.SiLU(),
    nn.Linear(neural_network_params["n_hidden"], 1)
)
neural_network_model.load_state_dict(torch.load("dnn_psd_model_six.pth"))

interpolation_buildings = [
    {"width": 88, "depth": 26, "height": 75}, {"width": 90, "depth": 30, "height": 60},
    {"width": 77, "depth": 35, "height": 117}, {"width": 39, "depth": 25, "height": 117},
    {"width": 27, "depth": 24, "height": 113}, {"width": 65, "depth": 24, "height": 38},
    {"width": 92, "depth": 24, "height": 100},
]

extrapolation_buildings = [
    {"width": 100, "depth": 20, "height": 30}, {"width": 100, "depth": 20, "height": 20},
    {"width": 100, "depth": 20, "height": 300}, {"width": 60, "depth": 30, "height": 300},
    {"width": 100, "depth": 20, "height": 150}, {"width": 100, "depth": 22, "height": 110},
    {"width": 100, "depth": 22, "height": 44}
]

training_buildings = [
    {"width": 96, "depth": 24, "height": 72}, {"width": 60, "depth": 24, "height": 120},
    {"width": 24, "depth": 24, "height": 72}, {"width": 48, "depth": 24, "height": 48},
    {"width": 96, "depth": 24, "height": 120}, {"width": 60, "depth": 24, "height": 36},
    {"width": 24, "depth": 24, "height": 36}
]

# [(buildings, "interpolation") for buildings in interpolation_buildings].extend
for building, test_type in ([(buildings, "interpolation") for buildings in interpolation_buildings] + [(buildings, "extrapolation") for buildings in extrapolation_buildings] + [(buildings, "training") for buildings in training_buildings]):
    width, depth, height = building["width"], building["depth"], building["height"]
    alpha_h = height / math.sqrt(depth * width)
    alpha_bd = width / depth

    # Generates the actual psds for the given building dimension
    actual_psds = CalculateAcrossPsdResponse(width, height, depth, frequencies)

    # For each building dimension, there is 5000 frequency point that we take. This generates the 5000 inputs
    X_testing = np.array([[alpha_bd, alpha_h, np.log10(f)] for f in frequencies])


    gbert_model_predicted_logs = gbert_model.predict(X_testing)
    # We are predicting the log, and to get the actual result we raise 10 to the value predicted
    gbert_model_predicted_psds = 10 ** gbert_model_predicted_logs

    # For the neural network, we need to scale the input first then transform it to tensor type before
    X_testing_scaled = scaler.transform(X_testing)
    X_testing_tensor = torch.tensor(X_testing_scaled, dtype=torch.float32)

    with torch.no_grad():
        # Pass all frequencies at once, convert result to numpy, and flatten to 1D
        neural_network_model_predicted_logs = neural_network_model(X_testing_tensor).numpy().flatten()

    neural_network_model_predicted_psds = 10 ** neural_network_model_predicted_logs

    # This converts it to numpy array to make calculation easier
    actual_psds_np = np.array(actual_psds)
    actual_logs = np.log10(actual_psds_np)

    # This calculates the root mean squared error on the actual values for the GBRT, and Neural Network
    gbert_rmse = np.sqrt(np.mean((actual_psds_np - gbert_model_predicted_psds) ** 2))
    nn_rmse = np.sqrt(np.mean((actual_psds_np - neural_network_model_predicted_psds) ** 2))

    # This calculates the root mean squared error on the actual values for the GBRT, and Neural Network
    gbert_log_rmse = np.sqrt(np.mean((actual_logs - gbert_model_predicted_logs) ** 2))
    nn_log_rmse = np.sqrt(np.mean((actual_logs - neural_network_model_predicted_logs) ** 2))

    # This calculates the relative mean error
    gbert_mre = np.mean(np.abs(actual_psds_np - gbert_model_predicted_psds) / actual_psds_np)
    nn_mre = np.mean(np.abs(actual_psds_np - neural_network_model_predicted_psds) / actual_psds_np)

    plt.figure(figsize=(8, 5))
    plt.loglog(frequencies, actual_psds, color='blue', label='Matlab Equation', linewidth=1)
    plt.loglog(frequencies, gbert_model_predicted_psds, color='red', label=f'GBERT (LogRMSE={gbert_log_rmse:.3f}, MRE={gbert_mre*100:.2f}%)',linewidth=1)
    plt.loglog(frequencies, neural_network_model_predicted_psds, color='black', label=f'DNN (LogRMSE={nn_log_rmse:.3f}, MRE={nn_mre*100:.2f}%)',linewidth=1)

    plt.title(f'{test_type} Plot')
    plt.xlabel('Frequency')
    plt.ylabel('Across PSD')
    plt.legend()
    plt.grid(True, linestyle='--', alpha=0.6)
    file_name = f"{test_type}_{width}_{depth}_{height}.png"
    plt.text(
        0.02, 0.95,
        f"Width = {width}\nDepth = {depth}\nHeight = {height}",
        transform=plt.gca().transAxes,
        fontsize=10,
        verticalalignment='top',
        bbox=dict(boxstyle="round", facecolor="white", alpha=0.8)
    )
    plt.savefig(file_name, dpi=300,bbox_inches='tight')

    plt.show()