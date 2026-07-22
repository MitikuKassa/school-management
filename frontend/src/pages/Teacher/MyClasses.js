import { useState, useEffect, useCallback } from "react";
import api from "../../api";

export default function MyClasses() {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedAssignment, setSelectedAssignment] = useState(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, sRes] = await Promise.all([
        api.get("teacher/assignments/"),
        api.get("teacher/students/"),
      ]);
      setAssignments(aRes.data);
      setStudents(sRes.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredStudents = selectedAssignment
    ? students.filter(
        (s) => s.grade === selectedAssignment.grade && s.section === selectedAssignment.section
      )
    : students;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Classes</h1>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => setSelectedAssignment(null)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !selectedAssignment ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}>
              All Classes ({students.length})
            </button>
            {assignments.map((a) => (
              <button key={a.id} onClick={() => setSelectedAssignment(a)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedAssignment?.id === a.id ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}>
                {a.subject} - {a.grade}{a.section}
              </button>
            ))}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            {selectedAssignment && (
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <p className="text-sm text-gray-600">
                  Showing students for <span className="font-medium text-gray-800">{selectedAssignment.subject}</span> - Grade {selectedAssignment.grade}{selectedAssignment.section}
                </p>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStudents.map((s, i) => (
                    <tr key={s.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.student_name}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.grade}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.section}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{s.academic_year_display}</td>
                    </tr>
                  ))}
                  {filteredStudents.length === 0 && (
                    <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No students found.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
