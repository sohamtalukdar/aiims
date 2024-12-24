import pymysql
from fpdf import FPDF
import os

# Database connection
def fetch_model_inference():
    connection = pymysql.connect(
        host='localhost',
        user='root',
        password='Bharat@1947',
        database='aiims'
    )
    cursor = connection.cursor()
    cursor.execute("SELECT * FROM model_inference;")
    rows = cursor.fetchall()
    cursor.close()
    connection.close()
    return rows

# Create PDF function
def create_pdf(data):
    pdf = FPDF()
    pdf.set_auto_page_break(auto=True, margin=15)
    pdf.add_page()
    pdf.set_font("Arial", size=12)

    # Add table header
    pdf.cell(10, 10, "ID", 1)
    pdf.cell(40, 10, "Patient ID", 1)
    pdf.cell(40, 10, "Audio Result", 1)
    pdf.cell(40, 10, "Video Result", 1)
    pdf.cell(50, 10, "Timestamp", 1)
    pdf.ln()

    # Add rows
    for row in data:
        pdf.cell(10, 10, str(row[0]), 1)
        pdf.cell(40, 10, row[1], 1)
        pdf.cell(40, 10, str(row[2]) if row[2] else "NULL", 1)
        pdf.cell(40, 10, str(row[3]) if row[3] else "NULL", 1)
        pdf.cell(50, 10, str(row[4]), 1)
        pdf.ln()

    # Save the PDF locally
    pdf_file = "model_inference.pdf"
    pdf.output(pdf_file)
    print(f"PDF saved as {pdf_file}")

# Main function to monitor updates and regenerate PDF
def main():
    existing_data = None
    while True:
        data = fetch_model_inference()
        if data != existing_data:  # Check if there are new entries
            create_pdf(data)
            existing_data = data

if __name__ == "__main__":
    main()
