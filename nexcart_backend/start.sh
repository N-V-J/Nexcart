#!/bin/bash

# NexCart Backend Startup Script
echo "Starting NexCart Backend..."

# Wait for database to be ready
echo "Waiting for database..."
python -c "
import os
import time
import psycopg2
from urllib.parse import urlparse

if os.environ.get('DATABASE_URL'):
    url = urlparse(os.environ['DATABASE_URL'])
    for i in range(30):
        try:
            conn = psycopg2.connect(
                host=url.hostname,
                port=url.port,
                user=url.username,
                password=url.password,
                database=url.path[1:]
            )
            conn.close()
            print('Database is ready!')
            break
        except:
            print(f'Database not ready, waiting... ({i+1}/30)')
            time.sleep(2)
    else:
        print('Database connection failed after 30 attempts')
        exit(1)
else:
    print('No DATABASE_URL found, using SQLite')
"

# Run database migrations
echo "Running database migrations..."
python manage.py migrate --noinput

# Create superuser if it doesn't exist
echo "Creating superuser..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='nvj').exists():
    User.objects.create_superuser('nvj', 'nvj@nexcart.com', '0.123456789')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
"

# Collect static files (in case they changed)
echo "Collecting static files..."
python manage.py collectstatic --noinput

# Start the application
echo "Starting Gunicorn server..."
exec gunicorn --bind 0.0.0.0:8000 --workers 3 nexcart_backend.wsgi:application
