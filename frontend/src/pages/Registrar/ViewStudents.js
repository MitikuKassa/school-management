import { useState, useEffect, useCallback } from "react";
import api from "../../api";

const grades = ["1","2","3","4","5","6","7","8","9","10","11","12"];

export default function ViewStudents() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [gradeFilter, setGradeFilter] = useState("");

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      let url = "registrar/students/?";
      if (query) url += `q=${encodeURIComponent(query)}&`;
      if (gradeFilter) url += `grade=${gradeFilter}&`;
      const res = await api.get(url);
      setStudents(res.data.results || res.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [query, gradeFilter]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">All Students</h1>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <input type="text" value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && fetchStudents()}
            placeholder="Search by name or username..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          <select value={gradeFilter}
            onChange={(e) => setGradeFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
            <option value="">All Grades</option>
            {grades.map((g) => <option key={g} value={g}>Grade {g}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Gender</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Enrolled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.full_name || s.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.username}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.profile?.gender === "M" ? "Male" : s.profile?.gender === "F" ? "Female" : "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.profile?.phone_number || "-"}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">-</td>
                    <td className="px-4 py-3 text-sm text-gray-500">{s.date_joined ? new Date(s.date_joined).toLocaleDateString() : "-"}</td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
