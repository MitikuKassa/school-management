import os
from django.db import migrations


def create_default_admin(apps, schema_editor):
    User = apps.get_model('users', 'User')
    if not User.objects.filter(username='admin').exists():
        admin = User.objects.create_superuser(
            username='admin',
            email='admin@school.com',
            password='admin123',
            role='admin',
        )
        admin.is_staff = True
        admin.is_superuser = True
        admin.save()


def reverse_func(apps, schema_editor):
    User = apps.get_model('users', 'User')
    User.objects.filter(username='admin').delete()


class Migration(migrations.Migration):
    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(create_default_admin, reverse_func),
    ]
