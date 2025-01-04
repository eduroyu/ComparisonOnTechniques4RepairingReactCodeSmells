import replicate

def get_response(llm, system_prompt, user_prompt, max_length):
    output = replicate.run(llm, input={"prompt": f"{system_prompt} {user_prompt} Assistant: ",
                                  "temperature":0.9, "top_p":0.7, "max_length":max_length, "repetition_penalty":1})
    return output
