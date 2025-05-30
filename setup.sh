#!/bin/bash

echo "NexCart Setup Script"
echo "==================="

echo "Setting up backend..."
cd nexcart_backend

echo "Creating virtual environment..."
python3 -m venv venv
source venv/bin/activate

echo "Installing backend dependencies..."
pip install -r requirements.txt

echo "Setting up database..."
python manage.py migrate

echo "Creating superuser..."
python manage.py createsuperuser

echo "Setting up frontend..."
cd ../nexcart-frontend-new

echo "Installing frontend dependencies..."
npm install

echo "Setup complete!"
echo "To run the backend: cd nexcart_backend && source venv/bin/activate && python manage.py runserver"
echo "To run the frontend: cd nexcart-frontend-new && npm run dev"
