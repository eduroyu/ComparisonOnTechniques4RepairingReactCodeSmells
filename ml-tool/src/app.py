import os
import streamlit as st

from generation.generator import get_response
from models.model import build_model, predict, train_model
from preprocessing.data_processing import prepare_new_data, preprocess_data
from utils.constants import constants
from utils.csv_utils import write_on_csv
from utils.resources import resources


###########################
#  Functions Definition   #
###########################

def prepare_detection_model():
    # Preprocesar datos
    _, train_data, validation_data = preprocess_data()

    # Construir el modelo
    model = build_model()

    # Cargar pesos del modelo o entrenar el modelo
    if os.path.exists(constants.MODEL_SAVE_PATH):
        # Cargar pesos del modelo
        model.load_weights(constants.MODEL_SAVE_PATH)
    else:
        # Construir y entrenar el modelo
        train_model(model, train_data, validation_data)
    
    return model


def clear_chat_history():
    st.session_state.messages = [{"role": "assistant", "content": resources.GREETINGS_QUOTE}]



def generate_response(prompt_input, smell_prompt):
    for dict_message in st.session_state.messages:
        if dict_message["role"] == "user":
            smell_prompt += "User: " + dict_message["content"] + "\n\n"
        else:
            smell_prompt += "Assistant: " + dict_message["content"] + "\n\n"

    return get_response(llm, smell_prompt, prompt_input, max_length)





###########################
#        Start APP        #
###########################

prediction = []

model = prepare_detection_model()

# Titulo de la web
st.set_page_config(page_title=resources.PAGE_TITLE)


# Creacion de la sidebar y comprobacion de API key
with st.sidebar:
    st.title(resources.PAGE_TEXT_H1)
    if 'REPLICATE_API_TOKEN' in st.secrets:
        st.success(resources.API_KEY_PROVIDED_TEXT, icon='✅')
        replicate_api = st.secrets['REPLICATE_API_TOKEN']
    else:
        replicate_api = st.text_input(resources.API_KEY_REQUEST_TEXT, type='password')
        if not (replicate_api.startswith('r8_') and len(replicate_api)==40):
            st.warning(resources.API_KEY_ERROR, icon='⚠️')
        else:
            st.success(resources.API_KEY_SUCCESS_TEXT, icon='👉')
    os.environ['REPLICATE_API_TOKEN'] = replicate_api


# Texto principal
st.subheader(resources.PAGE_TEXT_H2)


# Selector para elegir el modelo a usar
selected_model = st.sidebar.selectbox(resources.CHOOSE_MODEL_TEXT, ['Llama2-70B', 'Llama2-7B'], key='selected_model')

if selected_model == 'Llama2-7B':
    llm = 'a16z-infra/llama7b-v2-chat:4f0a4744c7295c024a1de15e1a63c880d3da035fa1f49bfd344fe076074c8eea'
elif selected_model == 'Llama2-70B':
    llm = 'replicate/llama70b-v2-chat:e951f18578850b652510200860fc4ea62b3b16fac280f83ff32282f87bbd2e48'


# Selector para elegir el smell a corregir
selected_smell = st.sidebar.selectbox(resources.CHOOSE_SMELL_TEXT, ['Props-in-initial-state'], key='selected_smell')

if selected_smell == 'Props-in-initial-state':
    smell_prompt = resources.PROMPT_PROPS_IN_INITIAL_STATE


# Selector para modificar la longitud de la respuesta
max_length = st.sidebar.slider('max_length', min_value=32, max_value=2500, value=2500, step=8)


# Boton para limpiar el historial
st.sidebar.button(resources.CLEAR_BUTTON_TEXT, on_click=clear_chat_history)


# Almacena las respuestas generadas
if "messages" not in st.session_state.keys():
    st.session_state.messages = [{"role": "assistant", "content": resources.GREETINGS_QUOTE}]


# Muestra los mensajes en el estado
for message in st.session_state.messages:
    with st.chat_message(message["role"]):
        st.write(message["content"])


# Prompt del usuario
if prompt := st.chat_input(disabled=not replicate_api):
    st.session_state.messages.append({"role": "user", "content": prompt})

    with st.chat_message("user"):
        st.write(prompt)

    # Escribir el prompt en formato csv para la compresion del modelo predictivo
    write_on_csv(prompt)

    # Preprocesar nuevos datos y hacer predicciones
    prediction_data = prepare_new_data()
    prediction = predict(model, prediction_data)


# Si hay prediccion continua y si no mostrar un mensaje de error
if len(prediction) > 0:
    # Si hay smell generar correccion y si no mostrar un mensaje default
    if prediction[0] == [1]:
        if st.session_state.messages[-1]["role"] != "assistant":
            with st.chat_message("assistant"):
                with st.spinner(resources.THINKING_TEXT):
                    response = generate_response(prompt, smell_prompt)
                    placeholder = st.empty()
                    full_response = ''
                    for item in response:
                        full_response += item
                        placeholder.markdown(full_response)
                    placeholder.markdown(full_response)
            message = {"role": "assistant", "content": full_response}
            st.session_state.messages.append(message)
    else:
        default_message = resources.NO_SMELL_TEXT
        with st.chat_message("assistant"):
            st.write(default_message)
        message = {"role": "assistant", "content": default_message}
        st.session_state.messages.append(message)

