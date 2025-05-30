#!/usr/bin/env python
"""
Database connection test utility for NexCart
This script tests the database connection using the current Django settings.
"""

import os
import sys
import django
from pathlib import Path

# Add the project directory to Python path
BASE_DIR = Path(__file__).resolve().parent
sys.path.append(str(BASE_DIR))

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'nexcart_backend.settings')
django.setup()

from django.db import connection
from django.core.management.color import make_style
from django.conf import settings

style = make_style()

def test_database_connection():
    """Test database connection and display connection info"""
    
    print(style.HTTP_INFO("=" * 50))
    print(style.HTTP_INFO("NexCart Database Connection Test"))
    print(style.HTTP_INFO("=" * 50))
    
    try:
        # Get database configuration
        db_config = settings.DATABASES['default']
        
        print(style.NOTICE("Database Configuration:"))
        print(f"  Engine: {db_config.get('ENGINE', 'Not specified')}")
        print(f"  Name: {db_config.get('NAME', 'Not specified')}")
        print(f"  Host: {db_config.get('HOST', 'Not specified')}")
        print(f"  Port: {db_config.get('PORT', 'Not specified')}")
        print(f"  User: {db_config.get('USER', 'Not specified')}")
        
        # Test connection
        print(style.NOTICE("\nTesting database connection..."))
        
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            
        print(style.SUCCESS("✓ Database connection successful!"))
        print(f"  PostgreSQL Version: {version}")
        
        # Test basic operations
        print(style.NOTICE("\nTesting basic database operations..."))
        
        with connection.cursor() as cursor:
            # Test table listing
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            
        print(style.SUCCESS(f"✓ Found {len(tables)} tables in the database"))
        
        if tables:
            print("  Tables:")
            for table in tables[:10]:  # Show first 10 tables
                print(f"    - {table[0]}")
            if len(tables) > 10:
                print(f"    ... and {len(tables) - 10} more tables")
        
        # Test Django ORM
        print(style.NOTICE("\nTesting Django ORM..."))
        
        from django.contrib.auth import get_user_model
        User = get_user_model()
        
        user_count = User.objects.count()
        print(style.SUCCESS(f"✓ Django ORM working! Found {user_count} users"))
        
        # Check for superuser
        superuser_exists = User.objects.filter(is_superuser=True).exists()
        if superuser_exists:
            superuser = User.objects.filter(is_superuser=True).first()
            print(style.SUCCESS(f"✓ Superuser found: {superuser.username}"))
        else:
            print(style.WARNING("⚠ No superuser found. You may need to run migrations."))
        
        print(style.HTTP_INFO("\n" + "=" * 50))
        print(style.SUCCESS("Database connection test completed successfully!"))
        print(style.HTTP_INFO("=" * 50))
        
        return True
        
    except Exception as e:
        print(style.ERROR(f"✗ Database connection failed: {str(e)}"))
        print(style.HTTP_INFO("\n" + "=" * 50))
        print(style.ERROR("Database connection test failed!"))
        print(style.HTTP_INFO("=" * 50))
        
        # Provide troubleshooting tips
        print(style.NOTICE("\nTroubleshooting tips:"))
        print("1. Check if DATABASE_URL environment variable is set correctly")
        print("2. Verify database credentials and connection details")
        print("3. Ensure the database server is running and accessible")
        print("4. Check firewall settings and network connectivity")
        print("5. Verify that the database exists and user has proper permissions")
        
        return False

if __name__ == "__main__":
    test_database_connection()
