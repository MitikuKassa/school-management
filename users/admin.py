from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import (
    User, UserProfile, AcademicYear, TeacherAssignment, Enrollment,
    AssessmentType, StudentAssessment, GradeScheme, Attendance, PasswordResetToken
)


class CustomUserAdmin(UserAdmin):
    fieldsets = UserAdmin.fieldsets + (
        ('Role Info', {'fields': ('role', 'is_email_verified')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Role Info', {'fields': ('role',)}),
    )
    list_display = ('username', 'email', 'role', 'is_email_verified', 'is_active', 'date_joined')
    list_filter = ('role', 'is_active', 'is_email_verified')
    search_fields = ('username', 'email', 'first_name', 'last_name')


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('user', 'first_name', 'father_name', 'grand_father_name', 'gender', 'nationality')
    list_filter = ('gender', 'nationality')
    search_fields = ('first_name', 'father_name', 'user__username')


@admin.register(AcademicYear)
class AcademicYearAdmin(admin.ModelAdmin):
    list_display = ('year', 'is_active', 'is_registration_open', 'is_grading_open')
    list_filter = ('is_active', 'is_registration_open')


@admin.register(TeacherAssignment)
class TeacherAssignmentAdmin(admin.ModelAdmin):
    list_display = ('teacher', 'subject', 'grade', 'section', 'academic_year')
    list_filter = ('academic_year', 'grade', 'section')
    search_fields = ('teacher__username', 'subject')


@admin.register(Enrollment)
class EnrollmentAdmin(admin.ModelAdmin):
    list_display = ('student', 'grade', 'section', 'academic_year', 'enrolled_at')
    list_filter = ('academic_year', 'grade', 'section')
    search_fields = ('student__username', 'student__profile__first_name')


@admin.register(AssessmentType)
class AssessmentTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'max_score', 'course')
    list_filter = ('course__academic_year',)


@admin.register(StudentAssessment)
class StudentAssessmentAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'assessment', 'score', 'recorded_by', 'recorded_at')
    list_filter = ('assessment', 'enrollment__academic_year')


@admin.register(GradeScheme)
class GradeSchemeAdmin(admin.ModelAdmin):
    list_display = ('letter', 'min_percent')
    ordering = ['-min_percent']


@admin.register(Attendance)
class AttendanceAdmin(admin.ModelAdmin):
    list_display = ('enrollment', 'date', 'status', 'recorded_by')
    list_filter = ('status', 'date')
    search_fields = ('enrollment__student__username',)


@admin.register(PasswordResetToken)
class PasswordResetTokenAdmin(admin.ModelAdmin):
    list_display = ('user', 'is_used', 'created_at')
    list_filter = ('is_used',)


admin.site.register(User, CustomUserAdmin)
