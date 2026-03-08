import pandas as pd
from typing import List
import math

frequencies = []
delta_frequency = initial_frequency = 0.001
final_frequency = 5
while initial_frequency <= final_frequency:
    frequencies.append(initial_frequency)
    initial_frequency += delta_frequency

df = pd.read_csv("experimental_data.csv")

def CalculateK(index : float, numbers: List[List[float]], alpha_bd: float, alpha_h: float) -> float:
    return numbers[index][0] * math.pow(alpha_bd, numbers[index][1]) + numbers[index][2]*alpha_h**numbers[index][3] + numbers[index][4];

def CalculateAcrossPsdResponse(width :float, height: float, depth:float, frequencies : List[float]) -> List[float]:
    alpha_bd: float = width / depth;
    alpha_h: float = height / (math.sqrt(width * depth));

    numbers: List[List] = []

    if (alpha_h < 1) :
        numbers = [

            [0.03, -5.84, 0.008, 0.22, -0.006],
            [0.06, -0.05, 0.28, 0.07, -0.25],
            [0.3, 1.19, -0.89, -1.12, 1.70],
            [-5.20, -6.30, -0.07, 0.97, 3.16]
        ]
    elif ((alpha_h >= 1) and (alpha_h < 3) and (alpha_bd < 2.5)) :
        numbers = [
            [0.01, -5.8, 0.005, -3.2, 0.004],
            [-0.45, -0.27, -1.02, -0.04, 1.51],
            [0.22, -9.81, 1.14, -3.22, 0.60],
            [3.19, -0.05, 9.66, -0.08, -10.34]
        ]
    elif ((alpha_h >= 1) and (alpha_h < 3) and (alpha_bd >= 2.5)) :
        numbers = [
            [0.003, -0.58, 0.000, 1.35, -0.001],
            [0.000, 6.83, -2.19, 0.000, 2.29],
            [0.32, 0.31, -0.73, 0.11, 0.76],
            [-1.14, 0.07, -0.013, 2.8, 4.65]
        ]
    elif ((alpha_h >= 3) and (alpha_bd < 2.5)) :
        numbers = [
            [0.016, -1.24, 8.60, -8.56, -0.005],
            [-1.00, -0.02, 0.09, -1.8, 1.08],
            [-0.037, -8.28, -0.5, -0.08, -0.10],
            [0.38, 0.33, 7.03, -3.17, 1.41]
        ]
    elif ((alpha_h >= 3) and (alpha_bd >= 2.5)) :
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

data_values = {
    "width": [],
    "depth": [],
    "height": [],
    "frequency": [],
    "acrosspsd": []
}

for _,value in df.iterrows():
    w = value["width"]
    h = value["height"]
    d = value["depth"]
    values = CalculateAcrossPsdResponse(w, h, d, frequencies)
    data_values["width"].extend([w for _ in range(len(frequencies))])
    data_values["height"].extend([h for _ in range(len(frequencies))])
    data_values["depth"].extend([d for _ in range(len(frequencies))])
    data_values["frequency"].extend(frequencies)
    data_values["acrosspsd"].extend(values)

data_df = pd.DataFrame(data_values)
data_df.to_csv('experimental_data.csv', index=False)

