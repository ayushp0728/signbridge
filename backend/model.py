import cv2
import matplotlib.pyplot as plt
import mediapipe as mp
import joblib  # Import joblib instead of pickle
import numpy as np
from PIL import Image
from fastapi import UploadFile
import warnings
import os

warnings.filterwarnings('ignore', category=UserWarning, module="google")

def model_pipeline(file: UploadFile):
    print("1")
    mp_hands = mp.solutions.hands
    hands = mp_hands.Hands(static_image_mode=True, max_num_hands=1, min_detection_confidence=.3)

    print("2")
    try:
        # Use joblib to load the model instead of pickle
        model = joblib.load('./Actual1_kNN_model.joblib')
        
        # Check if the model has a predict method
        if not hasattr(model, "predict"):
            raise ValueError("Loaded model does not have a predict method.")

        print(f"Model type: {type(model)}")
        if hasattr(model, "n_estimators"):
            print(f"Number of estimators: {model.n_estimators}")
    except Exception as e:
        print(str(e));
        raise ValueError(f"Error loading model: {str(e)}")

    print("3")
    # Read the file as bytes
    image_bytes = file.file.read()
    
    # Convert bytes to a NumPy array
    img_array = np.frombuffer(image_bytes, np.uint8)
    
    # Decode the image array into an OpenCV format
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)
    
    if img is None:
        raise ValueError("Could not decode the image.")
    
    print("We got img already")
    img_rgb = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    print("starting process")
    hand_processed = hands.process(img_rgb)
    data_aux = []

    print("4")
    if hand_processed.multi_hand_landmarks:
        for hand_landmarks in hand_processed.multi_hand_landmarks:
            for landmark in hand_landmarks.landmark:
                data_aux.append(landmark.x)
                data_aux.append(landmark.y)

    print("5")
    
    try:
        if not data_aux:
            raise ValueError("No hand landmarks detected.")

        flattened_data = np.array(data_aux).reshape(1, -1)
        print("Flattened landmarks for the image:", flattened_data)
        print("Shape of flattened_data:", flattened_data.shape)
    except e:
        print(str(e))

    print("6")
    try:
        # Create a dummy input array with the expected shape
        expected_number_of_features = model.n_features_in_ if hasattr(model, 'n_features_in_') else flattened_data.shape[1]
        dummy_input = np.random.rand(1, expected_number_of_features)
        dummy_prediction = model.predict(dummy_input)
        print("Dummy prediction successful:", dummy_prediction)

        prediction = model.predict(flattened_data)[0]
        print("7")
        print("Prediction:", prediction)
    except Exception as e:
        print(f"Error during prediction: {str(e)}")
        raise ValueError(f"Error during prediction: {str(e)}")

    return prediction
