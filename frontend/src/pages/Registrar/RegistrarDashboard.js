import { useState, useEffect } from "react";
import api from "../../api";

export default function RegistrarDashboard() {
  const [stats, setStats] = useState({ students: 0, activeYear: null, enrollments: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sRes, yRes, eRes] = await Promise.all([
          api.get("registrar/students/"),
          api.get("admin/academic-years/"),
          api.get("registrar/enrollments/"),
        ]);
        const activeYear = (yRes.data.results || yRes.data).find((y) => y.is_active) || null;
        setStats({
          students: sRes.data.length || sRes.data.count || 0,
          activeYear,
          enrollments: eRes.data.length || eRes.data.count || 0,
        });
      } catch { /* ignore */ }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Registrar Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
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
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Enrollments</p>
              <p className="text-2xl font-bold text-gray-800">{stats.enrollments}</p>
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
              <p className="text-2xl font-bold text-gray-800">{stats.activeYear?.year || "None"}</p>
              <p className="text-xs text-gray-400">
                Reg: {stats.activeYear?.is_registration_open ? "Open" : "Closed"}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <a href="/registrar/admit" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <span className="text-2xl block mb-2">➕</span>
            <span className="text-sm font-medium text-gray-700">Register New Student</span>
          </a>
          <a href="/registrar/enroll" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <span className="text-2xl block mb-2">📋</span>
            <span className="text-sm font-medium text-gray-700">Enroll Existing Student</span>
          </a>
          <a href="/registrar/students" className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-center">
            <span className="text-2xl block mb-2">👥</span>
            <span className="text-sm font-medium text-gray-700">View All Students</span>
          </a>
        </div>
      </div>
    </div>
  );
}
