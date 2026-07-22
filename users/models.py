import secrets
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.conf import settings
from django.core.exceptions import ValidationError


class User(AbstractUser):
    ROLE_CHOICES = (
        ('admin', 'Admin'),
        ('registrar', 'Registrar'),
        ('teacher', 'Teacher'),
        ('student', 'Student'),
    )
    role = models.CharField(max_length=20, choices=ROLE_CHOICES)
    is_email_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.get_full_name() or self.username} ({self.get_role_display()})"


class UserProfile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='profile')
    first_name = models.CharField(max_length=100)
    father_name = models.CharField(max_length=100)
    grand_father_name = models.CharField(max_length=100)
    date_of_birth = models.DateField(null=True, blank=True)
    gender = models.CharField(max_length=10, choices=[('M', 'Male'), ('F', 'Female')])
    nationality = models.CharField(max_length=50, blank=True, default='')
    phone_number = models.CharField(max_length=20, blank=True, default='')
    address = models.TextField(blank=True, default='')
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.father_name} {self.grand_father_name}"


class AcademicYear(models.Model):
    year = models.CharField(max_length=9, unique=True)
    is_registration_open = models.BooleanField(default=False)
    is_grading_open = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return self.year

    def clean(self):
        if self.is_active:
            qs = AcademicYear.objects.filter(is_active=True).exclude(pk=self.pk)
            if qs.exists():
                raise ValidationError("Only one academic year can be active at a time.")

    class Meta:
        ordering = ['-year']


class TeacherAssignment(models.Model):
    teacher = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'teacher'}, related_name='teacher_assignments')
    subject = models.CharField(max_length=100)
    grade = models.CharField(max_length=10)
    section = models.CharField(max_length=5)
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='teacher_assignments')

    def __str__(self):
        return f"{self.teacher.get_full_name() or self.teacher.username} - {self.subject} (Grade {self.grade}{self.section})"

    class Meta:
        unique_together = ('teacher', 'subject', 'grade', 'section', 'academic_year')
        ordering = ['grade', 'section', 'subject']


class Enrollment(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, limit_choices_to={'role': 'student'}, related_name='enrollments')
    academic_year = models.ForeignKey(AcademicYear, on_delete=models.CASCADE, related_name='enrollments')
    grade = models.CharField(max_length=10)
    section = models.CharField(max_length=5)
    enrolled_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.student.get_full_name() or self.student.username} - Grade {self.grade}{self.section} ({self.academic_year})"

    class Meta:
        unique_together = ('student', 'academic_year')
        ordering = ['grade', 'section', 'student__username']


class AssessmentType(models.Model):
    name = models.CharField(max_length=50)
    max_score = models.DecimalField(max_digits=5, decimal_places=2)
    course = models.ForeignKey(TeacherAssignment, on_delete=models.CASCADE, related_name='assessments')

    def __str__(self):
        return f"{self.name} ({self.course.subject})"

    class Meta:
        ordering = ['name']


class StudentAssessment(models.Model):
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='assessments')
    assessment = models.ForeignKey(AssessmentType, on_delete=models.CASCADE, related_name='student_scores')
    score = models.DecimalField(max_digits=5, decimal_places=2)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='recorded_grades')
    recorded_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.enrollment.student.username} - {self.assessment.name}: {self.score}"

    class Meta:
        unique_together = ('enrollment', 'assessment')
        ordering = ['enrollment', 'assessment']


class GradeScheme(models.Model):
    letter = models.CharField(max_length=3)
    min_percent = models.DecimalField(max_digits=5, decimal_places=2)

    def __str__(self):
        return f"{self.letter} (>= {self.min_percent}%)"

    class Meta:
        ordering = ['-min_percent']


class Attendance(models.Model):
    STATUS_CHOICES = (
        ('present', 'Present'),
        ('absent', 'Absent'),
        ('late', 'Late'),
    )
    enrollment = models.ForeignKey(Enrollment, on_delete=models.CASCADE, related_name='attendances')
    date = models.DateField()
    status = models.CharField(max_length=10, choices=STATUS_CHOICES)
    recorded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='recorded_attendances')
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.enrollment.student.username} - {self.date}: {self.status}"

    class Meta:
        unique_together = ('enrollment', 'date')
        ordering = ['-date', 'enrollment__student__username']


class PasswordResetToken(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='reset_tokens')
    token = models.CharField(max_length=64, unique=True, default=secrets.token_hex)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def __str__(self):
        return f"Reset token for {self.user.username}"

    class Meta:
        ordering = ['-created_at']
