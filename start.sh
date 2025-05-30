#!/bin/bash

# Render Start Script for NexCart Backend
echo "Starting NexCart Backend..."

# Navigate to backend directory
cd nexcart_backend

# Run database migrations
echo "Running database migrations..."
python manage.py migrate

# Create superuser if it doesn't exist (from migration)
echo "Ensuring superuser exists..."
python manage.py shell -c "
from django.contrib.auth import get_user_model
User = get_user_model()
if not User.objects.filter(username='nvj').exists():
    User.objects.create_superuser('nvj', 'nvj@nexcart.com', '0.123456789')
    print('Superuser created successfully')
else:
    print('Superuser already exists')
"

# Start the application with Gunicorn
echo "Starting Gunicorn server..."
exec gunicorn --bind 0.0.0.0:$PORT --workers 3 nexcart_backend.wsgi:application
