import os
from django.core.management.base import BaseCommand
from users.models import User, UserProfile


class Command(BaseCommand):
    help = 'Create default admin superuser for production'

    def handle(self, *args, **options):
        username = os.environ.get('ADMIN_USERNAME', 'admin')
        password = os.environ.get('ADMIN_PASSWORD', 'admin123')
        email = os.environ.get('ADMIN_EMAIL', 'admin@school.com')

        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.SUCCESS(f'User "{username}" already exists.'))
            return

        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            role='admin',
        )
        self.stdout.write(self.style.SUCCESS(f'Superuser "{username}" created successfully.'))
