# Generated manually for creating superuser during deployment

from django.db import migrations
from django.contrib.auth import get_user_model


def create_superuser(apps, schema_editor):
    """
    Create a superuser for deployment
    """
    User = get_user_model()
    
    # Check if superuser already exists
    if not User.objects.filter(username='nvj').exists():
        User.objects.create_superuser(
            username='nvj',
            email='admin@nexcart.com',  # Default email since it's required
            password='0.123456789',
            first_name='Admin',
            last_name='User'
        )
        print("Superuser 'nvj' created successfully!")
    else:
        print("Superuser 'nvj' already exists, skipping creation.")


def remove_superuser(apps, schema_editor):
    """
    Remove the superuser if migration is reversed
    """
    User = get_user_model()
    
    try:
        user = User.objects.get(username='nvj')
        user.delete()
        print("Superuser 'nvj' removed successfully!")
    except User.DoesNotExist:
        print("Superuser 'nvj' does not exist, nothing to remove.")


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_user_avatar'),
    ]

    operations = [
        migrations.RunPython(
            create_superuser,
            remove_superuser,
            hints={'target_db': 'default'}
        ),
    ]
