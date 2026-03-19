## This Repository focus on training ML models

Steps to take to train models:
1. Install the python packages found in the requirements.txt file. To install, execute this command:

   `pip install -r requirements.txt`

2. Then prepare the dataset, place the dataset csv as experiment.csv file
3. Finally, execute the training scripts:
   1. To train the GBRT model, run the command: `python train_gbert_model.py`
      1. This is going to generate a original_gradient_boosting_psd_model.pkl file, which is the trained model.
         
   2. To train the Neural Network model, run the command: `python train_neural_network_model.py` and this going to genearate:
      1. `scalar.pkl` the scaling used by the neural network for transforming the model
      2. `neural_network_trained_model.pth` the trained model
      3. `neural_network_best_hyperparameters.pkl` the best hyperparameters for fitting the dataset