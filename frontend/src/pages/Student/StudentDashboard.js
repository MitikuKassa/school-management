import { useState, useEffect } from "react";
import api from "../../api";

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get("student/dashboard/");
        setData(res.data);
      } catch { /* ignore */ }
      finally { setLoading(false); }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">Loading...</div>;
  }

  if (!data || !data.enrollment) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">Student Dashboard</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-500">You are not enrolled in any active academic year.</p>
          <p className="text-sm text-gray-400 mt-2">Please contact the registrar.</p>
        </div>
      </div>
    );
  }

  const { enrollment, grades, attendance_summary } = data;
  const overallGrade = grades.length > 0
    ? (grades.reduce((sum, g) => sum + g.percentage, 0) / grades.length).toFixed(2)
    : 0;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Grade/Section</p>
              <p className="text-xl font-bold text-gray-800">{enrollment.grade} {enrollment.section}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📝</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Overall Grade</p>
              <p className="text-xl font-bold text-gray-800">{overallGrade}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Attendance</p>
              <p className="text-xl font-bold text-gray-800">{attendance_summary.percentage}%</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Days Present</p>
              <p className="text-xl font-bold text-gray-800">{attendance_summary.present}/{attendance_summary.total}</p>
            </div>
          </div>
        </div>
      </div>

      {grades.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Subject Grades</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {grades.map((g, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4">
                <h3 className="font-medium text-gray-800">{g.subject}</h3>
                <div className="mt-2 flex items-end justify-between">
                  <div>
                    <p className="text-sm text-gray-500">Score: {g.total_score}/{g.total_possible}</p>
                    <p className="text-sm text-gray-500">Percentage: {g.percentage}%</p>
                  </div>
                  <span className={`text-2xl font-bold ${
                    g.grade.startsWith("A") ? "text-green-600" :
                    g.grade.startsWith("B") ? "text-blue-600" :
                    g.grade.startsWith("C") ? "text-yellow-600" :
                    "text-red-600"
                  }`}>{g.grade}</span>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div className={`h-2 rounded-full ${
                    g.percentage >= 80 ? "bg-green-500" :
                    g.percentage >= 60 ? "bg-blue-500" :
                    g.percentage >= 40 ? "bg-yellow-500" : "bg-red-500"
                  }`} style={{ width: `${Math.min(g.percentage, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {data.results.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.results.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.assessment}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.score}/{r.max_score}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
