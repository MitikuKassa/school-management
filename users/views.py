from django.db.models import Q
from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView
from django.contrib.auth import get_user_model
from django.shortcuts import get_object_or_404

from .models import (
    User, UserProfile, AcademicYear, TeacherAssignment, Enrollment,
    AssessmentType, StudentAssessment, GradeScheme, Attendance
)
from .serializers import (
    UserSerializer, UserCreateSerializer, UserUpdateSerializer,
    AcademicYearSerializer, TeacherAssignmentSerializer, EnrollmentSerializer,
    AssessmentTypeSerializer, StudentAssessmentSerializer, GradeSchemeSerializer,
    AttendanceSerializer, AttendanceBulkSerializer, MyTokenObtainPairSerializer,
    ChangePasswordSerializer, UserProfileSerializer, UserProfileWriteSerializer
)
from .permissions import (
    IsAdmin, IsRegistrar, IsTeacher, IsStudent,
    IsAdminOrRegistrar, IsAdminOrTeacher, IsAdminOrRegistrarOrTeacher
)

User = get_user_model()


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


class RegisterView(APIView):
    permission_classes = [IsAdmin]

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "User created successfully."}, status=status.HTTP_201_CREATED)


class UserProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        serializer = UserSerializer(user)
        return Response(serializer.data)

    def put(self, request):
        user = request.user
        profile_data = request.data.get('profile', {})
        if profile_data:
            profile = user.profile
            for attr, value in profile_data.items():
                if hasattr(profile, attr):
                    setattr(profile, attr, value)
            profile.save()
        return Response(UserSerializer(user).data)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        request.user.set_password(serializer.validated_data['new_password'])
        request.user.save()
        return Response({"message": "Password changed successfully."})


class AdminStaffViewSet(viewsets.ModelViewSet):
    queryset = User.objects.filter(role__in=['teacher', 'registrar'])
    permission_classes = [IsAdmin]

    def get_serializer_class(self):
        if self.action in ('create',):
            return UserCreateSerializer
        if self.action in ('update', 'partial_update'):
            return UserUpdateSerializer
        return UserSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"message": "Staff created successfully."}, status=status.HTTP_201_CREATED)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=kwargs.get('partial', False))
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(UserSerializer(instance).data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.is_active = False
        instance.save()
        return Response({"message": "Staff deactivated."})


class AcademicYearViewSet(viewsets.ModelViewSet):
    queryset = AcademicYear.objects.all()
    serializer_class = AcademicYearSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [IsAuthenticated()]
        return [IsAdmin()]


class TeacherAssignmentViewSet(viewsets.ModelViewSet):
    queryset = TeacherAssignment.objects.select_related('teacher', 'academic_year').all()
    serializer_class = TeacherAssignmentSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [IsAuthenticated()]
        return [IsAdmin()]

    def get_queryset(self):
        qs = super().get_queryset()
        academic_year_id = self.request.query_params.get('academic_year')
        if academic_year_id:
            qs = qs.filter(academic_year_id=academic_year_id)
        return qs


class StudentListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAdminOrRegistrar]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        grade = self.request.query_params.get('grade', '')
        section = self.request.query_params.get('section', '')
        qs = User.objects.filter(role='student').select_related('profile')
        if query:
            qs = qs.filter(
                Q(username__icontains=query) |
                Q(profile__first_name__icontains=query) |
                Q(profile__father_name__icontains=query) |
                Q(profile__grand_father_name__icontains=query)
            )
        if grade:
            qs = qs.filter(enrollments__grade=grade)
        if section:
            qs = qs.filter(enrollments__section=section)
        return qs.distinct()


class StudentSearchView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        query = self.request.query_params.get('q', '')
        if not query:
            return User.objects.none()
        return User.objects.filter(
            Q(role='student') & (
                Q(profile__first_name__icontains=query) |
                Q(profile__father_name__icontains=query) |
                Q(profile__grand_father_name__icontains=query) |
                Q(username__icontains=query)
            )
        ).select_related('profile').distinct()[:20]


class StudentAdmissionView(APIView):
    permission_classes = [IsAdminOrRegistrar]

    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save(role='student')

        active_year = AcademicYear.objects.filter(is_active=True).first()
        if not active_year:
            return Response(
                {"error": "No active academic year found. Set one in the admin panel."},
                status=status.HTTP_400_BAD_REQUEST
            )

        grade = request.data.get('grade', '')
        section = request.data.get('section', '')
        if not grade or not section:
            return Response(
                {"error": "Grade and section are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        enrollment, created = Enrollment.objects.get_or_create(
            student=user,
            academic_year=active_year,
            defaults={'grade': grade, 'section': section}
        )
        if not created:
            return Response(
                {"error": "Student is already enrolled in the active academic year."},
                status=status.HTTP_400_BAD_REQUEST
            )

        return Response({"message": "Student registered and enrolled successfully."}, status=status.HTTP_201_CREATED)


class EnrollmentViewSet(viewsets.ModelViewSet):
    serializer_class = EnrollmentSerializer

    def get_permissions(self):
        return [IsAuthenticated()]

    def get_queryset(self):
        user = self.request.user
        qs = Enrollment.objects.select_related('student', 'student__profile', 'academic_year').all()

        if user.role == 'student':
            return qs.filter(student=user)

        academic_year_id = self.request.query_params.get('academic_year')
        grade = self.request.query_params.get('grade')
        section = self.request.query_params.get('section')

        if academic_year_id:
            qs = qs.filter(academic_year_id=academic_year_id)
        if grade:
            qs = qs.filter(grade=grade)
        if section:
            qs = qs.filter(section=section)

        return qs

    def create(self, request, *args, **kwargs):
        student_id = request.data.get('student_id')
        grade = request.data.get('grade')
        section = request.data.get('section')

        active_year = AcademicYear.objects.filter(is_active=True).first()
        if not active_year or not active_year.is_registration_open:
            return Response({"error": "Registration is closed."}, status=status.HTTP_403_FORBIDDEN)

        student = get_object_or_404(User, id=student_id, role='student')

        if Enrollment.objects.filter(student=student, academic_year=active_year).exists():
            return Response(
                {"error": "Student is already enrolled for this academic year."},
                status=status.HTTP_400_BAD_REQUEST
            )

        enrollment = Enrollment.objects.create(
            student=student,
            academic_year=active_year,
            grade=grade,
            section=section
        )
        return Response(EnrollmentSerializer(enrollment).data, status=status.HTTP_201_CREATED)


class TeacherAssignmentView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        assignments = TeacherAssignment.objects.filter(teacher=request.user).select_related('academic_year')
        serializer = TeacherAssignmentSerializer(assignments, many=True)
        return Response(serializer.data)


class TeacherStudentListView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        assignments = TeacherAssignment.objects.filter(teacher=request.user)
        if not assignments.exists():
            return Response([])

        enrollments = Enrollment.objects.filter(
            grade__in=assignments.values_list('grade', flat=True),
            section__in=assignments.values_list('section', flat=True),
            academic_year__is_active=True
        ).select_related('student', 'student__profile', 'academic_year')

        serializer = EnrollmentSerializer(enrollments, many=True)
        return Response(serializer.data)


class AssessmentTypeCreateView(APIView):
    permission_classes = [IsTeacher]

    def post(self, request):
        assignment_id = request.data.get('assignment_id')
        if not assignment_id:
            assignment = TeacherAssignment.objects.filter(teacher=request.user).first()
        else:
            assignment = get_object_or_404(TeacherAssignment, id=assignment_id, teacher=request.user)

        if not assignment:
            return Response({"error": "No course assigned."}, status=status.HTTP_400_BAD_REQUEST)

        name = request.data.get('name', '').strip()
        max_score = request.data.get('max_score')

        if not name or not max_score:
            return Response({"error": "Name and max_score are required."}, status=status.HTTP_400_BAD_REQUEST)

        try:
            max_score = float(max_score)
            if max_score <= 0:
                raise ValueError
        except (ValueError, TypeError):
            return Response({"error": "Invalid max_score."}, status=status.HTTP_400_BAD_REQUEST)

        assessment = AssessmentType.objects.create(
            name=name, max_score=max_score, course=assignment
        )
        return Response(AssessmentTypeSerializer(assessment).data, status=status.HTTP_201_CREATED)


class TeacherAssessmentListView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        assignment_id = request.query_params.get('assignment_id')
        if assignment_id:
            assessments = AssessmentType.objects.filter(course_id=assignment_id, course__teacher=request.user)
        else:
            assessments = AssessmentType.objects.filter(course__teacher=request.user)
        serializer = AssessmentTypeSerializer(assessments, many=True)
        return Response(serializer.data)


class AssessmentViewSet(viewsets.ModelViewSet):
    serializer_class = AssessmentTypeSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'teacher':
            return AssessmentType.objects.filter(course__teacher=user)
        return AssessmentType.objects.all()

    def perform_create(self, serializer):
        assignment_id = self.request.data.get('assignment_id')
        if not assignment_id:
            assignment = TeacherAssignment.objects.filter(teacher=self.request.user).first()
        else:
            assignment = get_object_or_404(TeacherAssignment, id=assignment_id, teacher=self.request.user)
        serializer.save(course=assignment)


class BulkGradingView(APIView):
    permission_classes = [IsTeacher]

    def post(self, request):
        assessment_id = request.data.get('assessment_id')
        scores = request.data.get('scores', [])

        if not assessment_id or not scores:
            return Response({"error": "assessment_id and scores are required."}, status=status.HTTP_400_BAD_REQUEST)

        assessment = get_object_or_404(AssessmentType, id=assessment_id)

        if assessment.course.teacher != request.user:
            return Response({"error": "You do not own this assessment."}, status=status.HTTP_403_FORBIDDEN)

        created = 0
        updated = 0
        for entry in scores:
            enrollment_id = entry.get('enrollment_id')
            score_val = entry.get('score')

            if enrollment_id is None or score_val is None:
                continue

            try:
                score_val = float(score_val)
            except (ValueError, TypeError):
                continue

            if score_val < 0 or score_val > float(assessment.max_score):
                continue

            obj, was_created = StudentAssessment.objects.update_or_create(
                enrollment_id=enrollment_id,
                assessment=assessment,
                defaults={'score': score_val, 'recorded_by': request.user}
            )
            if was_created:
                created += 1
            else:
                updated += 1

        return Response({"message": f"Grades saved: {created} created, {updated} updated.", "created": created, "updated": updated})


class SubmitResultView(APIView):
    permission_classes = [IsTeacher]

    def post(self, request):
        enrollment_id = request.data.get('enrollment_id')
        assessment_id = request.data.get('assessment_id')
        score = request.data.get('score')

        if not all([enrollment_id, assessment_id, score is not None]):
            return Response(
                {"error": "enrollment_id, assessment_id, and score are required."},
                status=status.HTTP_400_BAD_REQUEST
            )

        assessment = get_object_or_404(AssessmentType, id=assessment_id)
        enrollment = get_object_or_404(Enrollment, id=enrollment_id)

        if assessment.course.teacher != request.user:
            return Response({"error": "You do not own this assessment."}, status=status.HTTP_403_FORBIDDEN)

        try:
            score_val = float(score)
        except (ValueError, TypeError):
            return Response({"error": "Invalid score."}, status=status.HTTP_400_BAD_REQUEST)

        if score_val < 0 or score_val > float(assessment.max_score):
            return Response(
                {"error": f"Score must be between 0 and {assessment.max_score}."},
                status=status.HTTP_400_BAD_REQUEST
            )

        obj, created = StudentAssessment.objects.update_or_create(
            enrollment=enrollment,
            assessment=assessment,
            defaults={'score': score_val, 'recorded_by': request.user}
        )

        return Response({
            "message": "Grade saved.",
            "id": obj.id,
            "created": created
        }, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


class CalculateFinalGradeView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        enrollment_id = request.data.get('enrollment_id')
        enrollment = get_object_or_404(Enrollment, id=enrollment_id)

        total_obtained = StudentAssessment.objects.filter(
            enrollment=enrollment
        ).aggregate(total=Sum('score'))['total'] or 0

        assignments = TeacherAssignment.objects.filter(
            grade=enrollment.grade,
            section=enrollment.section,
            academic_year=enrollment.academic_year
        )

        total_possible = AssessmentType.objects.filter(
            course__in=assignments
        ).aggregate(total=Sum('max_score'))['total'] or 1

        percentage = (float(total_obtained) / float(total_possible)) * 100

        grade_scheme = GradeScheme.objects.filter(min_percent__lte=percentage).first()

        return Response({
            "enrollment_id": enrollment_id,
            "percentage": round(percentage, 2),
            "grade": grade_scheme.letter if grade_scheme else "F",
            "total_obtained": float(total_obtained),
            "total_possible": float(total_possible),
        })


class GradeSchemeViewSet(viewsets.ModelViewSet):
    queryset = GradeScheme.objects.all()
    serializer_class = GradeSchemeSerializer

    def get_permissions(self):
        if self.action in ('list', 'retrieve'):
            return [IsAuthenticated()]
        return [IsAdmin()]


class MarkAttendanceView(APIView):
    permission_classes = [IsTeacher]

    def post(self, request):
        serializer = AttendanceBulkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        date = serializer.validated_data['date']
        attendance_data = serializer.validated_data['attendance']

        created = 0
        updated = 0
        for entry in attendance_data:
            enrollment_id = entry['enrollment_id']
            status_val = entry['status']

            enrollment = get_object_or_404(Enrollment, id=enrollment_id)

            assignments = TeacherAssignment.objects.filter(teacher=request.user)
            valid = assignments.filter(
                grade=enrollment.grade,
                section=enrollment.section,
                academic_year=enrollment.academic_year
            ).exists()
            if not valid:
                continue

            obj, was_created = Attendance.objects.update_or_create(
                enrollment=enrollment,
                date=date,
                defaults={
                    'status': status_val,
                    'recorded_by': request.user,
                }
            )
            if was_created:
                created += 1
            else:
                updated += 1

        return Response({
            "message": f"Attendance saved: {created} recorded, {updated} updated.",
            "created": created,
            "updated": updated
        })


class TeacherAttendanceListView(APIView):
    permission_classes = [IsTeacher]

    def get(self, request):
        date = request.query_params.get('date')
        assignments = TeacherAssignment.objects.filter(teacher=request.user)

        enrollments = Enrollment.objects.filter(
            grade__in=assignments.values_list('grade', flat=True),
            section__in=assignments.values_list('section', flat=True),
            academic_year__is_active=True
        )

        attendance = Attendance.objects.filter(
            enrollment__in=enrollments
        ).select_related('enrollment', 'enrollment__student', 'enrollment__student__profile')

        if date:
            attendance = attendance.filter(date=date)

        serializer = AttendanceSerializer(attendance, many=True)
        return Response(serializer.data)


class StudentDashboardView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        user = request.user
        active_year = AcademicYear.objects.filter(is_active=True).first()
        enrollment = None
        if active_year:
            enrollment = Enrollment.objects.filter(student=user, academic_year=active_year).first()

        if not enrollment:
            return Response({
                "enrollment": None,
                "results": [],
                "attendance_summary": {"total": 0, "present": 0, "absent": 0, "late": 0, "percentage": 0},
                "grades": [],
            })

        assessments = StudentAssessment.objects.filter(
            enrollment=enrollment
        ).select_related('assessment', 'assessment__course')

        results = []
        for sa in assessments:
            pct = (float(sa.score) / float(sa.assessment.max_score) * 100) if sa.assessment.max_score > 0 else 0
            results.append({
                "subject": sa.assessment.course.subject,
                "assessment": sa.assessment.name,
                "score": float(sa.score),
                "max_score": float(sa.assessment.max_score),
                "percentage": round(pct, 2),
            })

        attendance_records = Attendance.objects.filter(enrollment=enrollment)
        total = attendance_records.count()
        present = attendance_records.filter(status='present').count()
        absent = attendance_records.filter(status='absent').count()
        late = attendance_records.filter(status='late').count()
        att_pct = (present / total * 100) if total > 0 else 0

        subject_totals = {}
        for sa in assessments:
            subj = sa.assessment.course.subject
            if subj not in subject_totals:
                subject_totals[subj] = {'obtained': 0, 'possible': 0}
            subject_totals[subj]['obtained'] += float(sa.score)
            subject_totals[subj]['possible'] += float(sa.assessment.max_score)

        grades = []
        for subj, data in subject_totals.items():
            pct = (data['obtained'] / data['possible'] * 100) if data['possible'] > 0 else 0
            gs = GradeScheme.objects.filter(min_percent__lte=pct).first()
            grades.append({
                "subject": subj,
                "percentage": round(pct, 2),
                "grade": gs.letter if gs else "F",
                "total_score": data['obtained'],
                "total_possible": data['possible'],
            })

        return Response({
            "enrollment": EnrollmentSerializer(enrollment).data,
            "results": results,
            "attendance_summary": {
                "total": total,
                "present": present,
                "absent": absent,
                "late": late,
                "percentage": round(att_pct, 2),
            },
            "grades": grades,
        })


class StudentAttendanceView(APIView):
    permission_classes = [IsStudent]

    def get(self, request):
        user = request.user
        date_from = request.query_params.get('from')
        date_to = request.query_params.get('to')

        attendance = Attendance.objects.filter(
            enrollment__student=user
        ).select_related('enrollment', 'enrollment__student', 'enrollment__student__profile')

        if date_from:
            attendance = attendance.filter(date__gte=date_from)
        if date_to:
            attendance = attendance.filter(date__lte=date_to)

        serializer = AttendanceSerializer(attendance, many=True)
        return Response(serializer.data)
