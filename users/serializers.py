from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.db.models import Sum
from .models import (
    User, UserProfile, AcademicYear, TeacherAssignment, Enrollment,
    AssessmentType, StudentAssessment, GradeScheme, Attendance
)


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = [
            'id', 'first_name', 'father_name', 'grand_father_name',
            'date_of_birth', 'gender', 'nationality', 'phone_number',
            'address', 'profile_picture',
        ]


class UserProfileWriteSerializer(serializers.Serializer):
    first_name = serializers.CharField(max_length=100)
    father_name = serializers.CharField(max_length=100)
    grand_father_name = serializers.CharField(max_length=100)
    date_of_birth = serializers.DateField(required=False, allow_null=True)
    gender = serializers.ChoiceField(choices=[('M', 'Male'), ('F', 'Female')])
    nationality = serializers.CharField(max_length=50, required=False, default='')
    phone_number = serializers.CharField(max_length=20, required=False, default='')
    address = serializers.CharField(required=False, default='')


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'role', 'profile', 'full_name', 'is_active', 'date_joined']
        read_only_fields = ['id', 'date_joined']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class UserCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=150)
    password = serializers.CharField(write_only=True, min_length=6)
    email = serializers.EmailField(required=False, default='')
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES)
    profile = UserProfileWriteSerializer()

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("Username already exists.")
        return value

    def create(self, validated_data):
        profile_data = validated_data.pop('profile')
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)
        user.save()
        UserProfile.objects.create(user=user, **profile_data)
        return user


class UserUpdateSerializer(serializers.Serializer):
    email = serializers.EmailField(required=False, default='')
    role = serializers.ChoiceField(choices=User.ROLE_CHOICES, required=False)
    is_active = serializers.BooleanField(required=False)
    profile = UserProfileWriteSerializer(required=False)

    def update(self, instance, validated_data):
        profile_data = validated_data.pop('profile', None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        if profile_data and hasattr(instance, 'profile'):
            profile = instance.profile
            for attr, value in profile_data.items():
                setattr(profile, attr, value)
            profile.save()
        return instance


class ChangePasswordSerializer(serializers.Serializer):
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=6)

    def validate_old_password(self, value):
        user = self.context['request'].user
        if not user.check_password(value):
            raise serializers.ValidationError("Old password is incorrect.")
        return value


class AcademicYearSerializer(serializers.ModelSerializer):
    class Meta:
        model = AcademicYear
        fields = ['id', 'year', 'is_active', 'is_registration_open', 'is_grading_open']

    def validate(self, data):
        if data.get('is_active'):
            qs = AcademicYear.objects.filter(is_active=True)
            if self.instance:
                qs = qs.exclude(pk=self.instance.pk)
            if qs.exists():
                raise serializers.ValidationError({"is_active": "Only one academic year can be active at a time."})
        return data


class TeacherAssignmentSerializer(serializers.ModelSerializer):
    teacher_name = serializers.CharField(source='teacher.get_full_name', read_only=True)
    teacher_username = serializers.CharField(source='teacher.username', read_only=True)
    academic_year_display = serializers.CharField(source='academic_year.year', read_only=True)

    class Meta:
        model = TeacherAssignment
        fields = ['id', 'teacher', 'teacher_name', 'teacher_username', 'subject', 'grade', 'section', 'academic_year', 'academic_year_display']
        read_only_fields = ['id']


class EnrollmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_username = serializers.CharField(source='student.username', read_only=True)
    academic_year_display = serializers.CharField(source='academic_year.year', read_only=True)

    class Meta:
        model = Enrollment
        fields = ['id', 'student', 'student_name', 'student_username', 'academic_year', 'academic_year_display', 'grade', 'section', 'enrolled_at']
        read_only_fields = ['id', 'enrolled_at']

    def get_student_name(self, obj):
        profile = getattr(obj.student, 'profile', None)
        if profile:
            return f"{profile.first_name} {profile.father_name}"
        return obj.student.get_full_name() or obj.student.username


class AssessmentTypeSerializer(serializers.ModelSerializer):
    course_display = serializers.SerializerMethodField()

    class Meta:
        model = AssessmentType
        fields = ['id', 'name', 'max_score', 'course', 'course_display']
        read_only_fields = ['id']

    def get_course_display(self, obj):
        return f"{obj.course.subject} - Grade {obj.course.grade}{obj.course.section}"


class StudentAssessmentSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    assessment_name = serializers.CharField(source='assessment.name', read_only=True)
    max_score = serializers.DecimalField(source='assessment.max_score', max_digits=5, decimal_places=2, read_only=True)

    class Meta:
        model = StudentAssessment
        fields = ['id', 'enrollment', 'assessment', 'assessment_name', 'score', 'max_score', 'student_name', 'recorded_by', 'recorded_at']
        read_only_fields = ['id', 'recorded_at', 'recorded_by']

    def get_student_name(self, obj):
        profile = getattr(obj.enrollment.student, 'profile', None)
        if profile:
            return f"{profile.first_name} {profile.father_name}"
        return obj.enrollment.student.get_full_name() or obj.enrollment.student.username


class GradeSchemeSerializer(serializers.ModelSerializer):
    class Meta:
        model = GradeScheme
        fields = ['id', 'letter', 'min_percent']
        read_only_fields = ['id']


class AttendanceSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    student_username = serializers.CharField(source='enrollment.student.username', read_only=True)

    class Meta:
        model = Attendance
        fields = ['id', 'enrollment', 'date', 'status', 'student_name', 'student_username', 'recorded_by', 'created_at']
        read_only_fields = ['id', 'recorded_by', 'created_at']

    def get_student_name(self, obj):
        profile = getattr(obj.enrollment.student, 'profile', None)
        if profile:
            return f"{profile.first_name} {profile.father_name}"
        return obj.enrollment.student.get_full_name() or obj.enrollment.student.username


class AttendanceBulkSerializer(serializers.Serializer):
    date = serializers.DateField()
    attendance = serializers.ListField(
        child=serializers.DictField(
            child=serializers.CharField()
        )
    )

    def validate_attendance(self, value):
        if not value:
            raise serializers.ValidationError("Attendance list cannot be empty.")
        for entry in value:
            if 'enrollment_id' not in entry or 'status' not in entry:
                raise serializers.ValidationError("Each entry must have 'enrollment_id' and 'status'.")
            if entry['status'] not in ('present', 'absent', 'late'):
                raise serializers.ValidationError(f"Invalid status: {entry['status']}. Must be present, absent, or late.")
        return value


class StudentResultSerializer(serializers.Serializer):
    subject = serializers.CharField()
    assessment_name = serializers.CharField()
    max_score = serializers.DecimalField(max_digits=5, decimal_places=2)
    score = serializers.DecimalField(max_digits=5, decimal_places=2)
    percentage = serializers.SerializerMethodField()

    def get_percentage(self, obj):
        if obj['max_score'] > 0:
            return round(float(obj['score']) / float(obj['max_score']) * 100, 2)
        return 0


class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['role'] = user.role
        token['username'] = user.username
        token['email'] = user.email or ''
        return token
