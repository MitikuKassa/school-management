from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    MyTokenObtainPairView, RegisterView, UserProfileView, ChangePasswordView,
    AdminStaffViewSet, AcademicYearViewSet, TeacherAssignmentViewSet,
    StudentListView, StudentSearchView, StudentAdmissionView, EnrollmentViewSet,
    TeacherAssignmentView, TeacherStudentListView,
    AssessmentTypeCreateView, TeacherAssessmentListView, AssessmentViewSet,
    BulkGradingView, SubmitResultView, CalculateFinalGradeView,
    GradeSchemeViewSet, MarkAttendanceView, TeacherAttendanceListView,
    StudentDashboardView, StudentAttendanceView,
)

router = DefaultRouter()
router.register(r'admin/staff', AdminStaffViewSet, basename='admin-staff')
router.register(r'admin/academic-years', AcademicYearViewSet, basename='academic-years')
router.register(r'admin/teacher-assignments', TeacherAssignmentViewSet, basename='teacher-assignments')
router.register(r'admin/grade-scheme', GradeSchemeViewSet, basename='grade-scheme')
router.register(r'registrar/enrollments', EnrollmentViewSet, basename='enrollments')
router.register(r'assessments', AssessmentViewSet, basename='assessments')

urlpatterns = [
    path('auth/profile/', UserProfileView.as_view(), name='user-profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('auth/register/', RegisterView.as_view(), name='register'),

    path('registrar/students/', StudentListView.as_view(), name='student-list'),
    path('registrar/student-admission/', StudentAdmissionView.as_view(), name='student-admission'),
    path('registrar/student-search/', StudentSearchView.as_view(), name='student-search'),

    path('teacher/assignments/', TeacherAssignmentView.as_view(), name='teacher-assignments'),
    path('teacher/students/', TeacherStudentListView.as_view(), name='teacher-students'),
    path('teacher/assessments/', TeacherAssessmentListView.as_view(), name='teacher-assessments'),
    path('teacher/create-assessment/', AssessmentTypeCreateView.as_view(), name='create-assessment'),
    path('teacher/grade/', SubmitResultView.as_view(), name='submit-result'),
    path('teacher/bulk-grade/', BulkGradingView.as_view(), name='bulk-grade'),
    path('teacher/attendance/', MarkAttendanceView.as_view(), name='mark-attendance'),
    path('teacher/attendance/list/', TeacherAttendanceListView.as_view(), name='teacher-attendance-list'),

    path('student/dashboard/', StudentDashboardView.as_view(), name='student-dashboard'),
    path('student/attendance/', StudentAttendanceView.as_view(), name='student-attendance'),
    path('student/final-grade/', CalculateFinalGradeView.as_view(), name='calculate-final-grade'),

    path('', include(router.urls)),
]
