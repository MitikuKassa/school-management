import { useState, useEffect } from "react";
import api from "../../api";

export default function MyGrades() {
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
        <h1 className="text-2xl font-bold text-gray-800">My Grades</h1>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-500">No enrollment data available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Grades</h1>

      {data.grades.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Subject Summary</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.grades.map((g, i) => (
              <div key={i} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h3 className="font-semibold text-gray-800 text-lg">{g.subject}</h3>
                <div className="mt-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Score</span>
                    <span className="font-medium text-gray-800">{g.total_score} / {g.total_possible}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Percentage</span>
                    <span className="font-medium text-gray-800">{g.percentage}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Grade</span>
                    <span className={`text-xl font-bold ${
                      g.grade.startsWith("A") ? "text-green-600" :
                      g.grade.startsWith("B") ? "text-blue-600" :
                      g.grade.startsWith("C") ? "text-yellow-600" :
                      "text-red-600"
                    }`}>{g.grade}</span>
                  </div>
                </div>
                <div className="mt-3 w-full bg-gray-200 rounded-full h-3">
                  <div className={`h-3 rounded-full transition-all ${
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
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Detailed Results</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assessment</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Percentage</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.results.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{r.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.assessment}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{r.score}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{r.max_score}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.percentage >= 80 ? "bg-green-100 text-green-800" :
                        r.percentage >= 60 ? "bg-blue-100 text-blue-800" :
                        r.percentage >= 40 ? "bg-yellow-100 text-yellow-800" :
                        "bg-red-100 text-red-800"
                      }`}>{r.percentage}%</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {data.results.length === 0 && data.grades.length === 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
          <p className="text-gray-500">No grades recorded yet.</p>
        </div>
      )}
    </div>
  );
}
