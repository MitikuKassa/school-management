from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model


class Command(BaseCommand):
    help = 'Creates a default admin superuser if none exists'

    def handle(self, *args, **options):
        User = get_user_model()
        if not User.objects.filter(username='admin').exists():
            User.objects.create_superuser(
                username='admin',
                email='admin@school.com',
                password='admin123',
                role='admin',
            )
            self.stdout.write(self.style.SUCCESS('Default admin user created (admin / admin123)'))
        else:
            self.stdout.write('Admin user already exists')
