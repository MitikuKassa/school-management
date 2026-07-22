import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navConfig = {
  admin: [
    { to: "/admin", label: "Dashboard", icon: "📊" },
    { to: "/admin/staff", label: "Manage Staff", icon: "👥" },
    { to: "/admin/academic-years", label: "Academic Years", icon: "📅" },
    { to: "/admin/assignments", label: "Teacher Assignments", icon: "📋" },
    { to: "/admin/grade-scheme", label: "Grade Scheme", icon: "📝" },
  ],
  registrar: [
    { to: "/registrar", label: "Dashboard", icon: "📊" },
    { to: "/registrar/students", label: "All Students", icon: "🎓" },
    { to: "/registrar/admit", label: "Register Student", icon: "➕" },
    { to: "/registrar/enroll", label: "Enroll Student", icon: "📋" },
  ],
  teacher: [
    { to: "/teacher", label: "Dashboard", icon: "📊" },
    { to: "/teacher/classes", label: "My Classes", icon: "📚" },
    { to: "/teacher/assessments", label: "Assessments", icon: "📝" },
    { to: "/teacher/grading", label: "Grade Students", icon: "✏️" },
    { to: "/teacher/attendance", label: "Attendance", icon: "✅" },
  ],
  student: [
    { to: "/student", label: "Dashboard", icon: "📊" },
    { to: "/student/grades", label: "My Grades", icon: "📝" },
    { to: "/student/attendance", label: "My Attendance", icon: "✅" },
  ],
};

const roleColors = {
  admin: "bg-red-100 text-red-800",
  registrar: "bg-green-100 text-green-800",
  teacher: "bg-blue-100 text-blue-800",
  student: "bg-purple-100 text-purple-800",
};

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = navConfig[user?.role] || [];
  const prefix = `/${user?.role}`;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-center h-16 border-b border-gray-200 px-4">
            <h1 className="text-xl font-bold text-primary-700">SMS</h1>
            <span className="ml-2 text-sm text-gray-500 hidden sm:inline">School Management</span>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive =
                item.to === prefix
                  ? location.pathname === item.to
                  : location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-primary-50 text-primary-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  }`}
                >
                  <span className="mr-3 text-lg">{item.icon}</span>
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                {user?.username?.[0]?.toUpperCase() || "U"}
              </div>
              <div className="ml-3 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || user?.username}
                </p>
                <span
                  className={`inline-block text-xs px-2 py-0.5 rounded-full capitalize ${roleColors[user?.role] || "bg-gray-100 text-gray-800"}`}
                >
                  {user?.role}
                </span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-3 w-full text-left text-sm text-red-600 hover:text-red-800 px-3 py-2 rounded-lg hover:bg-red-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="ml-4 lg:ml-0">
            <h2 className="text-lg font-semibold text-gray-800">
              {navItems.find(
                (item) =>
                  item.to === prefix
                    ? location.pathname === item.to
                    : location.pathname.startsWith(item.to)
              )?.label || "Dashboard"}
            </h2>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
