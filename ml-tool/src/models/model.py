import tensorflow as tf
import tensorflow_hub as hub
import tf_keras as keras

from utils.constants import constants

def build_model() -> tf.keras.Model:
    # Definir el embedding
    embedding = "https://tfhub.dev/google/nnlm-en-dim128/2"
    hub_layer = hub.KerasLayer(embedding, input_shape=[], dtype=tf.string, trainable=True)

    # Crear un modelo secuencial
    model = keras.Sequential([
        # Capa de embedding
        hub_layer,
        # Capa densa 1
        keras.layers.Dense(32, activation='relu'),
        # Capa densa 2
        keras.layers.Dense(32, activation='relu'),
        # Capa de salida
        keras.layers.Dense(1, activation='sigmoid')
    ])

    # Compilar el modelo
    model.compile(optimizer='adam',
                  loss=keras.losses.BinaryCrossentropy(from_logits=True),
                  metrics=['accuracy', keras.metrics.AUC(), keras.metrics.F1Score(), keras.metrics.Recall(), keras.metrics.Precision()])

    return model


def train_model(model: tf.keras.Model, train_data: tf.data.Dataset, validation_data: tf.data.Dataset) -> tf.keras.callbacks.History:
    history = model.fit(
        train_data.shuffle(10000).batch(constants.BATCH),
        validation_data=validation_data.batch(constants.BATCH),
        epochs=constants.EPOCHS,
        verbose=1
    )

    # Guarda los pesos calculados en un fichero
    model.save_weights('path_to_my_weights.h5')

    return history


def evaluate_model(model: tf.keras.Model, test_data: tf.data.Dataset) -> list:
    results = model.evaluate(test_data.batch(constants.BATCH), verbose=2)
    return results

def predict(model: tf.keras.Model, data: tf.Tensor) -> tf.Tensor:
    predicciones = model.predict(data)
    clases_predichas = (predicciones > 0.5).astype("int32")
    return clases_predichas
