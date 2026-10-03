#!/bin/bash
set -e

cd /var/www/mycloud

# 1. Обновить код
git pull origin main

# 2. Обновить зависимости бэкенда
cd backend
source .venv/bin/activate
pip install -r requirements.txt

# 3. Применить миграции
python manage.py migrate

# 4. Собрать статику Django
python manage.py collectstatic --noinput

# 5. Собрать фронтенд
cd ../frontend
npm install
npm run build

# 6. Скопировать собранный фронтенд поверх статики
cp -r dist/* ../backend/static/

# 7. Перезапустить Gunicorn
sudo systemctl restart gunicorn

# 8. Перезагрузить Nginx
sudo systemctl reload nginx

echo "Развертывание успешно завершено!"