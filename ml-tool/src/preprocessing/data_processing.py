import pandas as pd
import tensorflow as tf

from typing import Tuple
from utils.constants import constants

def preprocess_data() -> Tuple[tf.data.Dataset, tf.data.Dataset, tf.data.Dataset]:
    datos = pd.read_csv(constants.TRAINING_DATA_PATH)

    # Dividir los datos en características (codes) y labels
    codes = datos["code"].values
    labels = datos["label"].values

    # Convertir las codes y las labels a tensores TensorFlow
    codes_tensor = tf.convert_to_tensor(codes, dtype=tf.string)
    labels_tensor = tf.convert_to_tensor(labels, dtype=tf.float32)

    # Crear un conjunto de datos TensorFlow
    dataset = tf.data.Dataset.from_tensor_slices((codes_tensor, labels_tensor))

    # Mezclar y dividir el conjunto de datos en entrenamiento y prueba (80-20 split)
    num_ejemplos = len(datos)
    train_size = int(0.8 * num_ejemplos)

    dataset = dataset.shuffle(num_ejemplos)
    train_data = dataset.take(train_size)
    validation_data = dataset.skip(train_size)

    return dataset, train_data, validation_data

def prepare_new_data() -> tf.Tensor:
    nuevos_datos = pd.read_csv("data/prompts.csv")
    nuevos_codigos = nuevos_datos["code"].values
    return nuevos_codigos
