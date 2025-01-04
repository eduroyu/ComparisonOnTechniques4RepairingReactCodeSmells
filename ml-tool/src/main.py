import os

from models.model import build_model, train_model, evaluate_model, predict
from preprocessing.data_processing import preprocess_data, prepare_new_data
from utils.graphs_drawer import draw_graphs

# Preprocesar datos
dataset, train_data, validation_data = preprocess_data()

# Construir el modelo
model = build_model()

# Cargar pesos del modelo o entrenar el modelo
if os.path.exists("path_to_my_weights.h5"):
    # Cargar pesos del modelo
    model.load_weights('path_to_my_weights.h5')
else:
    # Construir y entrenar el modelo
    history = train_model(model, train_data, validation_data)

    # Graficar la evolución de la precisión y la pérdida
    draw_graphs(history)

# Evaluar el modelo en el conjunto de prueba
results = evaluate_model(model, validation_data)
print("Evaluation results:", results)

# Preprocesar nuevos datos y hacer predicciones
nuevos_codigos = prepare_new_data()

clases_predichas = predict(model, nuevos_codigos)
print("Predictions:", clases_predichas)
