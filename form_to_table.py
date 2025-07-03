import gspread
import os
import re
import uuid
import json
from google.oauth2.service_account import Credentials
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from datetime import datetime
from werkzeug.utils import secure_filename

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # Ограничение 50MB на запрос

# Конфигурация
SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
CREDS_FILE = 'credentials.json'
SPREADSHEET_ID = '1c1Y_ySgi6Nai7xd362ItLKqG0Ouf4msIIN79VPDL6TY'
CORS(app, origins=["http://localhost:3000"])

# Настройки локального хранилища
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
BASE_URL = 'http://localhost:8000/files'  # Измените на ваш домен в продакшене

# Авторизация Google Sheets
def get_sheet(sheet_name):
    creds = Credentials.from_service_account_file(CREDS_FILE, scopes=SCOPES)
    client = gspread.authorize(creds)
    return client.open_by_key(SPREADSHEET_ID).worksheet(sheet_name)

# Сохранение файла в локальную папку
def save_file_locally(file):
    if file.filename == '':
        return None
    
    # Генерируем уникальное имя файла
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4().hex}{file_ext}"
    secure_name = secure_filename(unique_filename)
    
    # Сохраняем файл
    file_path = os.path.join(UPLOAD_FOLDER, secure_name)
    file.save(file_path)
    
    return f"{BASE_URL}/{secure_name}"

@app.route('/submit-order', methods=['POST'])
def submit_lead():
    try:
        file_urls = []
        data = None
        
        if request.content_type.startswith('multipart/form-data'):
            data_str = request.form.get('data')
            if not data_str:
                return jsonify({"error": "Missing 'data' field"}), 400
            
            cleaned_data_str = data_str
            try:
                data = json.loads(cleaned_data_str)
            except json.JSONDecodeError as e:
                app.logger.error(f"JSON decode error: {e}")
                return jsonify({"error": "Invalid JSON in 'data' field"}), 400
            
            files = request.files.getlist('file')
            for file in files:
                file_url = save_file_locally(file)
                if file_url:
                    file_urls.append(file_url)
        
        elif request.content_type == 'application/json':
            data = request.json
        
        else:
            return jsonify({"error": "Unsupported Media Type"}), 415
        
        if not data:
            return jsonify({"error": "No data provided"}), 400
            
        required_fields = ['name', 'phone', 'email', 'material', 
                          'thickness', 'ownMaterial', 'cutRequired', 
                          'volume', 'designRequired']
        
        if missing := [field for field in required_fields if field not in data]:
            return jsonify({"error": f"Missing fields: {', '.join(missing)}"}), 400
        
        lead_id = str(uuid.uuid4())
        timestamp = datetime.now().strftime('%Y-%m-%d %H:%M:%S')
        
        material_ownership = "Материал заказчика" if data.get('material_ownership') == "TRUE" else "Наш материал"
        cutting_required = "Требуется раскрой" if data.get('cutting_required') == "TRUE" else "Не требуется раскрой"
        design_required = "Требуется дизайн" if data.get('design_required') == "TRUE" else "Дизайн не требуется"
        pisya = data.get('material', '') + ' ' + data.get('thickness','') + 'мм'
        row = [
            lead_id,
            timestamp,
            data.get('name', ''),
            data.get('phone', ''),
            data.get('email', ''),
            pisya,
            data.get('ownMaterial', ''),
            data.get('cutRequired', ''),
            data.get('volume', ''),
            data.get('designRequired', ''),
            data.get('comment', ''),
            # file_urls,
            'Новый',
            # ', '.join(file_urls) if file_urls else ''
        ]
        print(row)
        
        sheet = get_sheet('Лиды')

        print("fdfdfd")
        sheet.append_row(row)
        print("fdfdfd2")

        return jsonify({
            "success": True,
            "message": "Заявка успешно добавлена",
            "lead_id": lead_id,
            "file_urls": file_urls
        }), 200
    
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)