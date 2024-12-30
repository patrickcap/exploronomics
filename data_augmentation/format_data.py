import pandas as pd

# Load the CSV file
def format_csv(input_file, output_file):
    # Read the CSV file
    df = pd.read_csv(input_file)

    # Process GDP to billions of USD and rename the column
    gdp_filter = df['Series Name'] == 'GDP (current US$)'
    df.loc[gdp_filter, '1999 [YR1999]':] = df.loc[gdp_filter, '1999 [YR1999]':].apply(pd.to_numeric, errors='coerce') / 1e9
    df.loc[gdp_filter, '1999 [YR1999]':] = df.loc[gdp_filter, '1999 [YR1999]':].round(3)
    df.loc[gdp_filter, 'Series Name'] = 'GDP (current US$B)'

    # Round all other numeric columns to 3 decimal places
    df.loc[:, '1999 [YR1999]':] = df.loc[:, '1999 [YR1999]':].apply(pd.to_numeric, errors='coerce').round(3)

    # Save the formatted CSV
    df.to_csv(output_file, index=False)

# Provide the file paths
input_file = 'world_economic_data_2023_1999.csv'  # Replace with your input file path
output_file = 'world_economic_data_2023_1999_formatted_output.csv'  # Replace with your desired output file path

# Format the CSV
format_csv(input_file, output_file)

print(f"Formatted CSV has been saved to {output_file}.")
