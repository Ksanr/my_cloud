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
│ ├── manage.py  
│ ├── my_cloud/ # настройки  
│ ├── users/ # приложение пользователей  
│ ├── files/ # приложение файлов  
│ ├── api/ # API (сериализаторы, вьюхи, права)  
│ ├── media/ # загруженные файлы (создаётся автоматически)  
│ ├── static/ # собранная статика (создаётся автоматически)  
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
- Python 3.10+
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
npm run dev # - локально, для Production: npm run build
```

Фронтенд будет доступен по адресу http://localhost:5173.

## Развёртывание на production (reg.ru)
Инструкция предполагает VPS с Ubuntu 26.04 LTS.

### 1. Подготовка сервера
``` bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y python3-pip python3-venv nginx postgresql postgresql-contrib nodejs npm git
```

### 2. Настройка PostgreSQL
Создайте БД и пользователя (аналогично локальному запуску).

### 3. Клонирование и настройка бэкенда
``` bash
cd /var/www
git clone <URL_репозитория> mycloud
cd mycloud/backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

Создайте .env с продакшн-настройками:
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
```

Примените миграции, соберите статику, создайте суперпользователя:
``` bash
python manage.py migrate
python manage.py collectstatic --noinput
python manage.py createsuperuser
```

### 4. Сборка фронтенда
``` bash
cd ../frontend
npm install
npm run build
```

Скопируйте собранные файлы в статику бэкенда (или настройте Nginx отдельно):
``` bash
cp -r build/* ../backend/static/
```

### 5. Настройка Gunicorn
Скопируйте deploy/gunicorn.service в /etc/systemd/system/gunicorn.service и отредактируйте пути:
``` ini
[Unit]
Description=gunicorn daemon for MyCloud
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/mycloud/backend
ExecStart=/var/www/mycloud/backend/venv/bin/gunicorn --workers 3 --bind unix:/var/www/mycloud/backend/mycloud.sock my_cloud.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target

Запустите и включите сервис:
bash

sudo systemctl start gunicorn
sudo systemctl enable gunicorn
```

### 6. Настройка Nginx
Скопируйте deploy/nginx.conf в /etc/nginx/sites-available/mycloud и отредактируйте server_name и пути:
``` nginx
server {
    listen 80;
    server_name your-domain.ru;

    location / {
        root /var/www/mycloud/backend/static;
        try_files $uri @proxy;
    }

    location @proxy {
        include proxy_params;
        proxy_pass http://unix:/var/www/mycloud/backend/mycloud.sock;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /media/ {
        alias /var/www/mycloud/backend/media/;
    }

    location /static/ {
        alias /var/www/mycloud/backend/static/;
    }
}
```

Активируйте сайт и перезапустите Nginx:
``` bash
sudo ln -s /etc/nginx/sites-available/mycloud /etc/nginx/sites-enabled
sudo nginx -t
sudo systemctl restart nginx
```

### 7. HTTPS (опционально)
``` bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.ru
```

### 8. Автоматизация деплоя

Используйте deploy/deploy.sh для обновления приложения:
``` bash
cd /var/www/mycloud
git pull origin main
chmod +x deploy/deploy.sh
./deploy/deploy.sh
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
Приложение будет развёрнуто по адресу: https://пока_не_знаю.ru