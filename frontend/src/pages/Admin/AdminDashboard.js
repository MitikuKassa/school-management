import { useState, useEffect } from "react";
import api from "../../api";

export default function AdminDashboard() {
  const [stats, setStats] = useState({ staff: 0, students: 0, activeYear: null });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [staffRes, studentsRes, yearRes] = await Promise.all([
          api.get("admin/staff/"),
          api.get("registrar/students/"),
          api.get("admin/academic-years/"),
        ]);
        setStats({
          staff: staffRes.data.length || staffRes.data.count || 0,
          students: studentsRes.data.length || studentsRes.data.count || 0,
          activeYear: yearRes.data.find?.((y) => y.is_active) || null,
        });
      } catch (err) {
        console.error("Failed to load dashboard:", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Staff</p>
              <p className="text-2xl font-bold text-gray-800">{stats.staff}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Students</p>
              <p className="text-2xl font-bold text-gray-800">{stats.students}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Active Year</p>
              <p className="text-2xl font-bold text-gray-800">
                {stats.activeYear?.year || "None"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <a href="/admin/staff" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <span className="text-2xl block mb-2">👤</span>
            <span className="text-sm font-medium text-gray-700">Add Staff</span>
          </a>
          <a href="/admin/academic-years" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <span className="text-2xl block mb-2">📅</span>
            <span className="text-sm font-medium text-gray-700">Academic Years</span>
          </a>
          <a href="/admin/assignments" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <span className="text-2xl block mb-2">📋</span>
            <span className="text-sm font-medium text-gray-700">Assignments</span>
          </a>
          <a href="/admin/grade-scheme" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <span className="text-2xl block mb-2">📝</span>
            <span className="text-sm font-medium text-gray-700">Grade Scheme</span>
          </a>
        </div>
      </div>
    </div>
  );
}
