import { useState, useEffect } from "react";
import api from "../../api";

export default function TeacherDashboard() {
  const [stats, setStats] = useState({ assignments: [], students: 0 });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aRes, sRes] = await Promise.all([
          api.get("teacher/assignments/"),
          api.get("teacher/students/"),
        ]);
        setStats({
          assignments: aRes.data,
          students: sRes.data.length || sRes.data.count || 0,
        });
      } catch { /* ignore */ }
    };
    fetchData();
  }, []);

  const uniqueSubjects = [...new Set(stats.assignments.map((a) => a.subject))];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">My Assignments</p>
              <p className="text-2xl font-bold text-gray-800">{stats.assignments.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">🎓</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">My Students</p>
              <p className="text-2xl font-bold text-gray-800">{stats.students}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📖</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Subjects</p>
              <p className="text-2xl font-bold text-gray-800">{uniqueSubjects.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">My Assignments</h2>
        {stats.assignments.length === 0 ? (
          <p className="text-gray-500 text-sm">No assignments yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {stats.assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{a.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.grade}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.section}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.academic_year_display}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
