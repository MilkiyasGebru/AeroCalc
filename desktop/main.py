import webview
import os
import numpy as np
from scipy import signal
import pathlib
import sys
class Api:
    def compute(self, M , width, depth,experimentalMeanSpeed, experimentalFrequency):
        # Called from React
        x  = 1000 * (M - np.mean(M) )
        print("The mean is ",np.mean(M))
        print( width, depth, experimentalMeanSpeed, experimentalFrequency)
        win = signal.windows.hamming(3000, sym=True)
        # print("X is ",x)
        f,pxx = signal.welch(x, fs=experimentalFrequency, window=win,nperseg=3000,nfft=4096,noverlap=1500,detrend=False,scaling='density')
        print("Unnormalizd frequency is ", f)
        # print(f[:5])
        print("Raw PSD Values",pxx[:5])
        normalizedFrequency = (f * width) / experimentalMeanSpeed
        denominator = (0.5 * 1.2929 * (experimentalMeanSpeed ** 2) * width * (depth ** 2)) ** 2
        pxx_normalized = (pxx * f) / denominator
        # print(normalizedFrequency.tolist()) 0.091562148576485
        return {"psd": pxx_normalized.tolist(), "pwelch_frequencies": f.tolist()}

api = Api()


def get_entry_path():
    # If running as a bundled EXE
    if getattr(sys, 'frozen', False):
        # sys._MEIPASS is where PyInstaller unzips files
        base_path = sys._MEIPASS
        # This assumes you used --add-data "frontend/dist;frontend/dist"
        path = os.path.join(base_path, "frontend", "dist", "index.html")
        return path
    else:
        # Running locally as a script
        base_dir = os.path.dirname(os.path.abspath(__file__))
        parent_dir = os.path.dirname(base_dir)
        path = os.path.join(parent_dir, "frontend", "dist", "index.html")
        print(path)
        return path
    # Use pathlib to create a clean URI (handles Windows backslashes)
    return pathlib.Path(path).as_uri()

base_dir = os.path.abspath(os.path.dirname(__file__))
parent_dir = os.path.dirname(base_dir)
index_path = os.path.join(parent_dir, "frontend", "dist", "index.html")
print(index_path)
index_path = get_entry_path()
webview.create_window(
    "AeroCalc Desktop",
    f"file://{index_path}",
    js_api=api,
    width=1200,
    height=800,
    resizable=True,
)

webview.start()

