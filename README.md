# My Cloud – облачное хранилище

## Структура проекта
- `/backend` – Django бэкенд
- `/frontend` – React фронтенд
- `/deploy` – конфигурации для развертывания

## Локальный запуск (разработка)
1. Бэкенд:
``` bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env # заполнить
python manage.py migrate
python manage.py runserver
```
2. Фронтенд:
``` bash
cd frontend
npm install
npm run dev
```
Приложение будет доступно по адресу http://localhost:5173.

## Развертывание на production (reg.ru)
См. раздел `deploy/` и файл deploy.sh.

## API документация
Доступна по адресу `/api/` (для авторизованных пользователей).

## Технологии
- Django 4.2 + DRF
- PostgreSQL
- React 18 + Redux Toolkit
- Nginx + Gunicorn
