from sklearn.model_selection import train_test_split, KFold, cross_val_score
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.metrics import mean_squared_error
import pandas as pd
import numpy as np
import optuna
import joblib
import json


# Loads the Experimental Dataset
df = pd.read_csv('experimental_data.csv')

# Keep only rows where acrosspsd is strictly positive -- Remove those that give negative psds if they exist
df = df[df["acrosspsd"] > 0].copy()


# Creating the Across, and Side Ratios
df["alpha_bd"] = df["width"] / df["depth"]
df["alpha_h"] = df["height"] / np.sqrt(df["width"] * df["depth"])

# log the across psd and frequency values, to handle the wide dynamic range of PSD and frequency values
df['normalized_acrosspsd'] = np.log10(df["acrosspsd"])
df['normalized_frequency'] = np.log10(df["frequency"])

# This selects only the alpha_bd, alpha_h, and the normalized frequency, these are the inputs that we are going to feed our models
X = df[['alpha_bd', 'alpha_h', 'normalized_frequency']]

# This selects the normalized_acrosspsd
y = df['normalized_acrosspsd']

# This splits the dataset that we have train and test, with the test size being 20%
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42
)


'''
This objective trial is function that tunes the hyperparameters of a model. 
It includes like the number of trees ( also called n_estimators), learning_rate, the maximum depth of a tree.
'''
def objective(trial):
    # Suggesting hyperparameters for the Scikit-Learn version
    # Trial means the number of times it tries tune
    params = {
        "n_estimators": trial.suggest_int("n_estimators", 50, 600), # 50 - lower range 600 - upper range
        "learning_rate": trial.suggest_float("learning_rate", 0.001, 0.2, log=True), # log means the rate it changes
        "max_depth": trial.suggest_int("max_depth", 3, 10),
        "min_samples_split": trial.suggest_int("min_samples_split", 2, 20),
        "subsample": trial.suggest_float("subsample", 0.5, 1.0),
        "loss": "squared_error"  # Standard for regression
    }

    model = GradientBoostingRegressor(**params, random_state=42)

    # Use K-Fold to ensure the model generalizes well across different subsets of the training data
    kf = KFold(n_splits=10, shuffle=True, random_state=42)

    # Scikit-learn's cross_val_score uses 'negative' MSE because it follows the 'higher is better' convention
    scores = cross_val_score(model, X_train, y_train, cv=kf, scoring="neg_mean_squared_error", n_jobs=-1)

    return scores.mean()


# Create study: 'maximize' is used because we are optimizing 'negative' MSE (closer to 0 is better).
# TPESampler: Efficiently explores the search space using Bayesian optimization.
# MedianPruner: Stops poorly performing trials early to save computation time.
study = optuna.create_study(direction="maximize", sampler=optuna.samplers.TPESampler(),pruner=optuna.pruners.MedianPruner())
study.optimize(objective, n_trials=30)

# From the different trials that we had, we pick the best parameters
best_params = study.best_params

# This save the best hyperparametes to a json file
with open("original_gbert_hyperparameters.json", "w") as f:

    json.dump(best_params, f)

# This trains the model trains the model using the best parameters found during optimization
final_model = GradientBoostingRegressor(**best_params, random_state=42)

# Evaluate on the unseen test set to get an unbiased estimate of model performance
final_model.fit(X_train, y_train)
print("Saving the Gradient Boosting Model")
# This saves the trained model for a later use, so next time we can easily load it
joblib.dump(final_model, "original_gradient_boosting_psd_model.pkl")

# This makes the predicitions
predictions = final_model.predict(X_test)

# This calculates the Mean Squared Error
mse = mean_squared_error(y_test, predictions)


print(f"Mean Squared Error: {mse:.4f}")
