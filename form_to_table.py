import gspread
from google.oauth2.service_account import Credentials
from flask import Flask, request, jsonify

app = Flask(__name__)

# Конфигурация
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
CREDS_FILE = 'credentials.json'  
SPREADSHEET_ID = '1c1Y_ySgi6Nai7xd362ItLKqG0Ouf4msIIN79VPDL6TY'  

# Авторизация
def get_sheet():
    creds = Credentials.from_service_account_file(CREDS_FILE, scopes=SCOPES)
    client = gspread.authorize(creds)
    return client.open_by_key(SPREADSHEET_ID).sheet1

@app.route('/submit-order', methods=['POST'])
def submit_order():
    try:
        data = request.json
        
        # Валидация
        required_fields = ['company_name', 'phone', 'material', 
                          'material_ownership', 'cutting_required', 
                          'quantity', 'design_required']
        
        if not all(field in data for field in required_fields):
            return jsonify({"error": "Missing required fields"}), 400
        
        # Подготовка данных
        row = [
            data['company_name'],
            data['phone'],
            data.get('email'),
            data['material'],
            data['material_ownership'],
            data['cutting_required'],
            data['quantity'],
            data['design_required']
        ]
        
        # Запись в таблицу
        sheet = get_sheet()
        sheet.append_row(row)
        
        return jsonify({"success": True}), 200
    
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)