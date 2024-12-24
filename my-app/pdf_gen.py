import pymysql
import pandas as pd

# Database connection
def fetch_model_inference():
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='Bharat@1947',
        database='aiims'
    )
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM model_inference;")  # Fetch all columns
    rows = cursor.fetchall()
    # Fetch column names for the DataFrame
    column_names = [desc[0] for desc in cursor.description]
    cursor.close()
    connection.close()
    return rows, column_names

# Create Excel function
def create_excel(data, columns):
    # Create a pandas DataFrame
    df = pd.DataFrame(data, columns=columns)

    # Save the DataFrame to an Excel file
    excel_file = "model_inference.xlsx"
    df.to_excel(excel_file, index=False)

    print(f"Excel file saved as {excel_file}")

# Main function to monitor updates and regenerate Excel file
def main():
    existing_data = None
    while True:
        data, columns = fetch_model_inference()
        if data != existing_data:  # Check if there are new entries
            create_excel(data, columns)
            existing_data = data

if __name__ == "__main__":
    main()
