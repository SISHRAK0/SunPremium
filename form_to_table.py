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
    
    return "uploads/" + secure_name  # Возвращаем только имя файла

@app.route('/submit-order', methods=['POST'])
def submit_lead():
    try:
        file_name = None  # Будем хранить только имя файла
        data = None
        
        if request.content_type.startswith('multipart/form-data'):
            data_str = request.form.get('data')
            if not data_str:
                return jsonify({"error": "Missing 'data' field"}), 400
            
            try:
                data = json.loads(data_str)
            except json.JSONDecodeError as e:
                app.logger.error(f"JSON decode error: {e}")
                return jsonify({"error": "Invalid JSON in 'data' field"}), 400
            
            # Обрабатываем первый файл (если есть)
            if 'file' in request.files:
                file = request.files['file']
                if file.filename != '':
                    file_name = save_file_locally(file)
        
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
        
        material_ownership = "Материал заказчика" if data.get('ownMaterial') == "TRUE" else "Наш материал"
        cutting_required = "Требуется раскрой" if data.get('cutRequired') == "TRUE" else "Не требуется раскрой"
        design_required = "Требуется дизайн" if data.get('designRequired') == "TRUE" else "Дизайн не требуется"
        material_with_thickness = f"{data.get('material', '')} {data.get('thickness','')}мм"
        phone = data.get('phone', '')
        for s in phone:
            if s == '+':
                phone = phone.replace(s, '')
            if s == '-':
                phone = phone.replace(s, '')
            if s == ' ':
                phone = phone.replace(s, '')
            if s == '7':
                phone = phone.replace(s, '')
        
        row = [
            lead_id,
            timestamp,
            data.get('name', ''),
            phone,
            data.get('email', ''),
            material_with_thickness,
            material_ownership,
            cutting_required,
            data.get('volume', ''),
            design_required,
            data.get('comment', ''),
            file_name if file_name else '',  
            'Новый'
        ]
        
        sheet = get_sheet('Лиды')
        sheet.append_row(row)

        return jsonify({
            "success": True,
            "message": "Заявка успешно добавлена",
            "lead_id": lead_id,
            "file_name": file_name  # Возвращаем только имя файла
        }), 200
    
    except Exception as e:
        app.logger.error(f"Unexpected error: {str(e)}")
        return jsonify({"error": "Internal server error"}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000, debug=True)