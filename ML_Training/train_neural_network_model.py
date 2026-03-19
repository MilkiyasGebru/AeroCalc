import json
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error
from torch.utils.data import DataLoader, TensorDataset
import pandas as pd
import numpy as np
import optuna
import joblib
import torch
import torch.nn as nn

# DATA PREPARATION
df = pd.read_csv('experimental_data.csv')
# Remove any rows that negative acrosspsd values
df = df[df["acrosspsd"] > 0].copy()

# Calculate the side, and aspect ratio
df["alpha_bd"] = df["width"] / df["depth"]
df["alpha_h"] = df["height"] / np.sqrt(df["width"] * df["depth"])

# log the across psd and frequency values, to handle the wide dynamic range of PSD and frequency values
df['normalized_acrosspsd'] = np.log10(df["acrosspsd"])
df['normalized_frequency'] = np.log10(df["frequency"])


# This selects only the alpha_bd, alpha_h, and the normalized frequency, these are the inputs that we are going to feed our models
X = df[['alpha_bd', 'alpha_h', 'normalized_frequency']]
y = df['normalized_acrosspsd']


# This splits the dataset that we have train and test, with the test size being 20%
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.20, random_state=42
)

#  FEATURE SCALING (The Scaler) -
# Neural Networks are sensitive to the scale of input data.
# If 'alpha_bd' is 0.1 and 'frequency' is 1000, the network will focus too much on frequency.
# StandardScaler shifts data to have a Mean of 0 and Standard Deviation of 1.
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)  # Learn Mean/Std from training data
X_test_scaled = scaler.transform(X_test)  # Use same Mean/Std for test data (prevents leaking info)

# Convert to PyTorch Tensors, this required to
X_train_t = torch.tensor(X_train_scaled, dtype=torch.float32)
y_train_t = torch.tensor(y_train.values, dtype=torch.float32).view(-1, 1)
X_test_t = torch.tensor(X_test_scaled, dtype=torch.float32)
y_test_t = torch.tensor(y_test.values, dtype=torch.float32).view(-1, 1)

# "tr" stands for "Training Subset" - used to train the model during the tuning phase
# "val" stands for "Validation Set" - used to check how well the model generalizes while tuning
X_tr, X_val, y_tr, y_val = train_test_split(
    X_train_t, y_train_t, test_size=0.2, random_state=42
)

# --- 3. DATALOADERS (Mini-Batch Gradient Descent) ---
# Instead of feeding the whole dataset at once (which is slow and memory-intensive),
# we feed small batches (128 rows at a time). This adds "noise" that helps the model escape local minima.
batch_size = 128
train_dataset_optuna = TensorDataset(X_tr, y_tr)
train_loader_optuna = DataLoader(train_dataset_optuna, batch_size=batch_size, shuffle=True)

train_dataset_final = TensorDataset(X_train_t, y_train_t)
train_loader_final = DataLoader(train_dataset_final, batch_size=batch_size, shuffle=True)


# Model Architecture
def create_model(n_hidden, dropout_rate):
    """
    n_hidden: Number of neurons per layer.
    dropout_rate: Randomly 'turns off' neurons during training to prevent Overfitting
                 (forcing the model not to rely on any single neuron).
    """
    return nn.Sequential(
        nn.Linear(3, n_hidden),
        nn.SiLU(),
        nn.Dropout(dropout_rate),
        nn.Linear(n_hidden, n_hidden),
        nn.SiLU(),
        nn.Dropout(dropout_rate),
        nn.Linear(n_hidden, n_hidden),
        nn.SiLU(),
        nn.Linear(n_hidden, 1)
    )


# OPTUNA HYPERPARAMETER TUNING ---
def objective(trial):
    # lr (Learning Rate): Controls how big of a step the optimizer takes when updating weights.
    lr = trial.suggest_float("lr", 5e-5, 5e-3, log=True)
    n_hidden = trial.suggest_categorical("n_hidden", [64, 128, 256, 512])

    # Weight Decay: A penalty for large weights (L2 Regularization).
    # It keeps the model simple and prevents it from over-fitting to noise.
    weight_decay = trial.suggest_float("weight_decay", 1e-6, 1e-2, log=True)
    dropout_rate = trial.suggest_float("dropout_rate", 0.0, 0.2)

    model = create_model(n_hidden, dropout_rate)
    optimizer = torch.optim.Adam(model.parameters(), lr=lr, weight_decay=weight_decay)
    criterion = nn.MSELoss()

    for epoch in range(100):
        model.train()
        for batch_X, batch_y in train_loader_optuna:
            optimizer.zero_grad()
            outputs = model(batch_X)
            loss = criterion(outputs, batch_y)
            loss.backward()
            optimizer.step()

        model.eval()
        with torch.no_grad():
            val_pred = model(X_val)
            val_loss = criterion(val_pred, y_val)

        # Early stopping logic (Pruning)
        trial.report(val_loss.item(), epoch)
        if trial.should_prune():
            raise optuna.exceptions.TrialPruned()

    return val_loss.item()


study = optuna.create_study(direction="minimize", sampler=optuna.samplers.TPESampler())
study.optimize(objective, n_trials=50)

#FINAL TRAINING ---
best = study.best_params
model = create_model(best["n_hidden"], best["dropout_rate"])
optimizer = torch.optim.Adam(model.parameters(), lr=best["lr"], weight_decay=best["weight_decay"])
criterion = nn.MSELoss()

for epoch in range(200):
    model.train()
    epoch_loss = 0
    for batch_X, batch_y in train_loader_final:
        optimizer.zero_grad()
        outputs = model(batch_X)
        loss = criterion(outputs, batch_y)
        loss.backward()
        optimizer.step()
        epoch_loss += loss.item()

    if epoch % 10 == 0:
        print(f"Epoch {epoch}, Loss: {epoch_loss / len(train_loader_final)}")

# Final Evaluation
model.eval()
with torch.no_grad():
    pred = model(X_test_t)
    mse = mean_squared_error(y_test_t.numpy(), pred.numpy())

print("Test MSE:", mse)

#EXPORTING
torch.save(model.state_dict(), "neural_network_trained_model.pth")
joblib.dump(scaler, "neural_network_scalar.pkl")
joblib.dump(study.best_params, "neural_network_best_hyperparameters.pkl")