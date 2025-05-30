#!/bin/bash

# Render Build Script for NexCart Backend
echo "Starting NexCart Backend build process..."

# Navigate to backend directory
cd nexcart_backend

# Install Python dependencies
echo "Installing Python dependencies..."
pip install -r requirements.txt

# Collect static files
echo "Collecting static files..."
python manage.py collectstatic --noinput

echo "Build process completed successfully!"
