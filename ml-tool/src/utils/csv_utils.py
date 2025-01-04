def write_on_csv(text):
    csv_filename = "data/prompts.csv"

    header_code = "code\n"
    with open(csv_filename, 'w') as file:
        file.write(header_code)
        file.write(f'\"{text}\"\n')