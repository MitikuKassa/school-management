import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

import AdminDashboard from "./pages/Admin/AdminDashboard";
import ManageStaff from "./pages/Admin/ManageStaff";
import ManageAcademicYears from "./pages/Admin/ManageAcademicYears";
import ManageTeacherAssignments from "./pages/Admin/ManageTeacherAssignments";
import ManageGradeScheme from "./pages/Admin/ManageGradeScheme";

import RegistrarDashboard from "./pages/Registrar/RegistrarDashboard";
import RegisterStudent from "./pages/Registrar/RegisterStudent";
import SearchEnroll from "./pages/Registrar/SearchEnroll";
import ViewStudents from "./pages/Registrar/ViewStudents";

import TeacherDashboard from "./pages/Teacher/TeacherDashboard";
import MyClasses from "./pages/Teacher/MyClasses";
import ManageAssessments from "./pages/Teacher/ManageAssessments";
import GradeStudents from "./pages/Teacher/GradeStudents";
import MarkAttendance from "./pages/Teacher/MarkAttendance";

import StudentDashboard from "./pages/Student/StudentDashboard";
import MyGrades from "./pages/Student/MyGrades";
import MyAttendance from "./pages/Student/MyAttendance";

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route path="/dashboard" element={
            <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
          } />

          <Route path="/admin" element={
            <ProtectedRoute roles={["admin"]}><Layout><AdminDashboard /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/staff" element={
            <ProtectedRoute roles={["admin"]}><Layout><ManageStaff /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/academic-years" element={
            <ProtectedRoute roles={["admin"]}><Layout><ManageAcademicYears /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/assignments" element={
            <ProtectedRoute roles={["admin"]}><Layout><ManageTeacherAssignments /></Layout></ProtectedRoute>
          } />
          <Route path="/admin/grade-scheme" element={
            <ProtectedRoute roles={["admin"]}><Layout><ManageGradeScheme /></Layout></ProtectedRoute>
          } />

          <Route path="/registrar" element={
            <ProtectedRoute roles={["registrar"]}><Layout><RegistrarDashboard /></Layout></ProtectedRoute>
          } />
          <Route path="/registrar/students" element={
            <ProtectedRoute roles={["registrar"]}><Layout><ViewStudents /></Layout></ProtectedRoute>
          } />
          <Route path="/registrar/admit" element={
            <ProtectedRoute roles={["registrar"]}><Layout><RegisterStudent /></Layout></ProtectedRoute>
          } />
          <Route path="/registrar/enroll" element={
            <ProtectedRoute roles={["registrar"]}><Layout><SearchEnroll /></Layout></ProtectedRoute>
          } />

          <Route path="/teacher" element={
            <ProtectedRoute roles={["teacher"]}><Layout><TeacherDashboard /></Layout></ProtectedRoute>
          } />
          <Route path="/teacher/classes" element={
            <ProtectedRoute roles={["teacher"]}><Layout><MyClasses /></Layout></ProtectedRoute>
          } />
          <Route path="/teacher/assessments" element={
            <ProtectedRoute roles={["teacher"]}><Layout><ManageAssessments /></Layout></ProtectedRoute>
          } />
          <Route path="/teacher/grading" element={
            <ProtectedRoute roles={["teacher"]}><Layout><GradeStudents /></Layout></ProtectedRoute>
          } />
          <Route path="/teacher/attendance" element={
            <ProtectedRoute roles={["teacher"]}><Layout><MarkAttendance /></Layout></ProtectedRoute>
          } />

          <Route path="/student" element={
            <ProtectedRoute roles={["student"]}><Layout><StudentDashboard /></Layout></ProtectedRoute>
          } />
          <Route path="/student/grades" element={
            <ProtectedRoute roles={["student"]}><Layout><MyGrades /></Layout></ProtectedRoute>
          } />
          <Route path="/student/attendance" element={
            <ProtectedRoute roles={["student"]}><Layout><MyAttendance /></Layout></ProtectedRoute>
          } />

          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-6xl font-bold text-gray-300">404</h1>
                <p className="text-gray-500 mt-2">Page not found</p>
                <a href="/dashboard" className="text-primary-600 hover:underline mt-4 inline-block">Go to Dashboard</a>
              </div>
            </div>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
