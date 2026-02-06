## README FOR SRC/Hooks/useCalculateBuildingResponse.ts
This code implements Structural Wind Engineering calculations to determine how a building vibrates under wind loads. It calculates the Power Spectral Density (PSD) for three primary components: Along-wind, Across-wind, and Torsional responses.

## 🏗️ Core Structural Logic


1. Calculate PSD: Determining the energy distribution of wind forces over those frequencies.

2. Mechanical Admittance: Applying the building's dynamic properties (mass, damping, stiffness).

3. RMS Integration: Calculating the Root Mean Square (RMS) acceleration and velocity.


# 1. Directional PSD Calculations

Across-Wind Response (**CalculateAcrossPsdResponse**) - This function calculates the across-wind response. It uses empirical "look-up" matrices based on the building's aspect ratios:

#### a. $\alpha_{bd}$: Width/Depth ratio.

#### b.$\alpha_h$: Aspect ratio (Height relative to the plan area).

Torsional Response (**CalculateTorsionPsdResponse**) - Calculates the twisting force. It uses three sub-functions to build the spectrum:

* **CalculateFB**: Background response.

* **CalculateFV** & **CalculateFW**: Resonant peaks modeled using Gaussian-style distributions to represent specific aerodynamic phenomena.

Along-Wind Response (**CalculateAlong**): This implements the **Kaimal Spectrum** model. It represents the turbulence in the direction of the wind.

# 2. Dynamic Analysis & Integration (**CalculateFD**)

This function transforms force spectra into actual building motion (acceleration/velocity).

Key Steps:

1. Modal Mass Calculation: Determines the generalized mass for each vibration mode based on total floors and building density.

2. Transfer Function: Uses the building's natural frequency (Tone) and damping to determine how much the building amplifies specific wind frequencies.

3. Integration (Trapezoidal Rule): To find the total RMS response, the code calculates the area under the PSD curve.

#