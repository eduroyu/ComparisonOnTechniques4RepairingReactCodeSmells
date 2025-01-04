import matplotlib.pyplot as plt
import tensorflow as tf

def draw_graphs(history: tf.keras.callbacks.History) -> None:
    history_dict = history.history
    acc = history_dict['accuracy']
    val_acc = history_dict['val_accuracy']  # Métricas de precisión de validación
    loss = history_dict['loss']
    val_loss = history_dict['val_loss']  # Métricas de pérdida de validación
    epochs = range(1, len(acc) + 1)

    plt.figure()
    plt.plot(epochs, loss, 'b', label='Training loss')
    plt.plot(epochs, val_loss, 'r', label='Validation loss')
    plt.title('Training and validation loss')
    plt.xlabel('Epochs')
    plt.ylabel('Loss')
    plt.legend()
    plt.savefig('graphs/hist_loss.png')

    plt.figure()
    plt.plot(epochs, acc, 'b', label='Training accuracy')
    plt.plot(epochs, val_acc, 'r', label='Validation accuracy')
    plt.title('Training and validation accuracy')
    plt.xlabel('Epochs')
    plt.ylabel('Accuracy')
    plt.legend()
    plt.savefig('graphs/hist_acc.png')
