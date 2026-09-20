# My Cloud – облачное хранилище
Веб-приложение для хранения файлов с возможностью загрузки, скачивания, переименования, комментирования и обмена специальными ссылками. Реализовано на Django (бэкенд) и React (фронтенд).

## Функционал
- Регистрация и аутентификация пользователей (логин, полное имя, email, пароль).
- Загрузка файлов с комментарием.
- Просмотр списка файлов (имя, размер, дата загрузки, дата последнего скачивания, комментарий).
- Скачивание файла с сохранением оригинального имени.
- Переименование файла.
- Изменение комментария.
- Удаление файла.
- Генерация специальной обезличенной ссылки для внешнего скачивания.
- Административная панель: управление пользователями (удаление, назначение администратором), просмотр их хранилищ.
- Администратор может управлять файлами любого пользователя.

## Технологии
- **Бэкенд:** Python 3.14, Django 6.1.1, Django REST Framework 3.18, PostgreSQL, Gunicorn, Nginx.
- **Фронтенд:** React 19.2.8, Redux Toolkit 2.12, React Router 7.18, Axios, Vite.
- **Дополнительно:** python-dotenv, django-cors-headers, psycopg2-binary.

## Структура проекта
my_cloud/  
├── backend/ # Django проект  
│ ├── api/ # API (сериализаторы, вьюхи, права)  
│ ├── files/ # приложение файлов  
│ ├── media/ # загруженные файлы (создаётся автоматически)  
│ ├── static/ # собранная статика (создаётся автоматически)  
│ ├── my_cloud/ # настройки  
│ ├── users/ # приложение пользователей  
│ ├── manage.py  
│ ├── requirements.txt  
│ └── .env # переменные окружения (не в репозитории)  
├── frontend/ # React приложение  
│ ├── public/  
│ ├── src/  
│ ├── package.json  
│ └── vite.config.js  
├── deploy/ # конфигурации для развёртывания  
│ ├── nginx.conf  
│ ├── gunicorn.service  
│ └── deploy.sh  
├── .gitignore  
└── README.md

## Локальный запуск (разработка)

### Предварительные требования
- Python 3.14
- Node.js 18+
- PostgreSQL 14+
- Git

### 1. Клонирование репозитория
```bash
git clone <URL_репозитория>
cd my_cloud
```

### 2. Настройка бэкенда
```bash
cd backend
python -m venv venv
source venv/bin/activate      # Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

Создайте файл .env в папке backend/ на основе .env.example:
``` env
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=mycloud_db
DB_USER=mycloud_user
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
```

Создайте базу данных и пользователя в PostgreSQL:
``` bash
sudo -u postgres psql
CREATE DATABASE mycloud_db;
CREATE USER mycloud_user WITH PASSWORD 'secure_password';
ALTER ROLE mycloud_user SET client_encoding TO 'utf8';
ALTER ROLE mycloud_user SET default_transaction_isolation TO 'read committed';
ALTER ROLE mycloud_user SET timezone TO 'UTC';
GRANT ALL PRIVILEGES ON DATABASE mycloud_db TO mycloud_user;
\c mycloud_db
GRANT ALL ON SCHEMA public TO mycloud_user;
GRANT CREATE ON SCHEMA public TO mycloud_user;
ALTER SCHEMA public OWNER TO mycloud_user;
\q
```

Примените миграции и создайте суперпользователя:
``` bash
python manage.py migrate
python manage.py createsuperuser
```

После создания суперпользователя установите ему флаг администратора:
``` bash
python manage.py shell
from users.models import User
admin = User.objects.get(username='admin')
admin.is_admin = True
admin.save()
exit()
```

Запустите сервер разработки:
``` bash
python manage.py runserver
```
Бэкенд будет доступен по адресу http://127.0.0.1:8000.

### 3. Настройка фронтенда
``` bash
cd ../frontend
npm install
npm run dev # локально, для Production введите: npm run build
```
Фронтенд будет доступен по адресу http://localhost:5173.

## Развёртывание на production (reg.ru)
Инструкция предполагает VPS с Ubuntu 26.04 LTS.

### 1. Подготовка сервера
``` bash
# Подключение к серверу
ssh root@ваш_ip_адрес 
# Обновление системы
sudo apt update && sudo apt upgrade -y
# Установка пакетов
sudo apt install -y python3-pip python3-venv nginx postgresql postgresql-contrib nodejs npm git curl ufw
# Настройка брандмауэра
sudo ufw allow ssh
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

### 2. Настройка PostgreSQL
Создайте БД и пользователя (аналогично локальному запуску).

### 3. Клонирование и настройка бэкенда
Создайте каталог и клонируйте репозиторий:
``` bash
sudo mkdir -p /var/www/mycloud
sudo chown $USER:$USER /var/www/mycloud
cd /var/www/mycloud
git clone https://github.com/Ksanr/my_cloud.git .
```
Настройте виртуальное окружение:
``` bash
cd /var/www/mycloud/backend
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
```

Создайте файл.env:
``` bash
nano /var/www/mycloud/backend/.env
```

Вставьте значения:
``` env
SECRET_KEY=your-production-secret-key
DEBUG=False
ALLOWED_HOSTS=your-domain.ru,www.your-domain.ru
DB_NAME=mycloud_db
DB_USER=mycloud_user
DB_PASSWORD=secure_password
DB_HOST=localhost
DB_PORT=5432
CORS_ALLOWED_ORIGINS=https://your-domain.ru
CSRF_TRUSTED_ORIGINS=https://ваш-домен.ru,https://www.ваш-домен.ru
```

Создайте папку для медиафайлов и задайте права:
``` bash
mkdir -p /var/www/mycloud/backend/media
sudo chown -R www-data:www-data /var/www/mycloud/backend/media
sudo chmod -R 755 /var/www/mycloud/backend/media
```

Примените миграции, соберите статику:
``` bash
python manage.py migrate
python manage.py collectstatic --noinput
```

Создайте суперпользователя:
``` bash
python manage.py createsuperuser
python manage.py shell
from users.models import User
admin = User.objects.get(username='admin')  # или ваш логин
admin.is_admin = True
admin.save()
exit()
```

### 4. Сборка фронтенда
``` bash
cd /var/www/mycloud/frontend
npm install
npm run build
```

Скопируйте собранные файлы в статику бэкенда (или настройте Nginx отдельно):
``` bash
cp -r /var/www/mycloud/frontend/dist/* /var/www/mycloud/backend/static/
```

### 5. Настройка Gunicorn
Создайте systemd-сокет для Gunicorn:
``` bash
sudo nano /etc/systemd/system/gunicorn.socket
```

Вставьте:
``` ini
[Unit]
Description=gunicorn socket

[Socket]
ListenStream=/run/gunicorn.sock
SocketUser=www-data

[Install]
WantedBy=sockets.target
```

Создайте сервис Gunicorn:
``` bash
sudo nano /etc/systemd/system/gunicorn.service
```

Вставьте:
``` ini
[Unit]
Description=gunicorn daemon for MyCloud
Requires=gunicorn.socket
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/mycloud/backend
ExecStart=/var/www/mycloud/backend/.venv/bin/gunicorn \
    --access-logfile - \
    --workers 3 \
    --bind unix:/run/gunicorn.sock \
    my_cloud.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

Запустите и включите:
``` bash
sudo systemctl daemon-reload
sudo systemctl start gunicorn.socket
sudo systemctl enable gunicorn.socket
sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

### 6. Настройка Nginx
Создайте конфигурацию:
``` bash
sudo nano /etc/nginx/sites-available/mycloud
```

Вставьте (замените ваш-домен.ru на ваш домен):
``` nginx
upstream django {
    server unix:/run/gunicorn.sock fail_timeout=0;
}

server {
    listen 80;
    server_name ваш-домен.ru www.ваш-домен.ru;

    # Максимальный размер загружаемого файла
    client_max_body_size 100M;

    location = /favicon.ico { access_log off; log_not_found off; }

    # Статика Django (admin, DRF, собранный фронтенд)
    location /static/ {
        alias /var/www/mycloud/backend/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Медиафайлы (загруженные пользователями)
    location /media/ {
        alias /var/www/mycloud/backend/media/;
        expires 30d;
        add_header Cache-Control "public";
    }

    # API и аутентификация → Django
    location ~ ^/(api|admin|login|logout|test)/ {
        proxy_pass http://django;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_redirect off;
    }

    # SPA: всё остальное отдаём как index.html
    location / {
        root /var/www/mycloud/backend/static;
        try_files $uri $uri/ /index.html;
    }
}
```

Активируйте сайт и перезапустите Nginx:
``` bash
sudo ln -s /etc/nginx/sites-available/mycloud /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 7. HTTPS (опционально)
Получите бесплатный SSL-сертификат:
``` bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.ru
```

### 8. Автоматизация деплоя

Создайте скрипт deploy.sh для обновления приложения:
``` bash
nano /var/www/mycloud/deploy.sh
```

Вставьте:
``` bash
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
```
Сделайте исполняемым:
``` bash
chmod +x /var/www/mycloud/deploy.sh
```

Для обновления проекта:
``` bash
cd /var/www/mycloud
git pull origin main
./deploy.sh
```

## API
Все эндпоинты доступны по префиксу /api/. Аутентификация – сессионная (cookie sessionid). Для доступа к защищённым эндпоинтам необходимо выполнить вход.

| Метод  | URL                           | Описание                                              |  
|--------|-------------------------------|-------------------------------------------------------|  
| POST   | /login/                       | Вход (логин, пароль) - Публичный                      |
| POST   | /logout/                      | Выход - Публичный (требует аутентификации)            |
| POST   | /api/users/                   | Регистрация                                           |
| GET    | /api/users/                   | Список пользователей (админ)                          |
| PATCH  | /api/users/{id}/              | Изменение пользователя (админ)                        |
| DELETE | /api/users/{id}/              | Удаление пользователя (админ)                         |
| GET    | /api/users/me/                | Текущий пользователь                                  |
| GET    | /api/files/                   | Список файлов (свой или ?user_id= для админа)         |
| POST   | /api/files/                   | Загрузка файла (multipart: file, comment)             |
| DELETE | /api/files/{id}/              | Удаление файла                                        |
| POST   | /api/files/{id}/rename/       | Переименование (new_name)                             |
| POST   | /api/files/{id}/set_comment/  | Изменение комментария (comment)                       |
| GET    | /api/files/{id}/download/     | Скачивание                                            | 
| GET    | /api/files/{id}/special_link/ | Получить специальную ссылку                           |
| GET    | /api/files/shared/{token}/    | Скачивание по специальной ссылке (без аутентификации) |

## Дополнительные инструменты
* python-dotenv – загрузка переменных окружения.
* django-cors-headers – настройка CORS.
* psycopg2-binary – драйвер PostgreSQL.

## Лицензия
Проект создан в учебных целях.

## Демо
Приложение развёрнуто по адресу: http://89.104.69.210/