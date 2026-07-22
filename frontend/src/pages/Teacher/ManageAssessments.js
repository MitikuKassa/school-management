import { useState, useEffect, useCallback } from "react";
import api from "../../api";

export default function ManageAssessments() {
  const [assignments, setAssignments] = useState([]);
  const [assessments, setAssessments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newAssessment, setNewAssessment] = useState({ name: "", max_score: "", assignment_id: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, asRes] = await Promise.all([
        api.get("teacher/assignments/"),
        api.get("teacher/assessments/"),
      ]);
      setAssignments(aRes.data);
      setAssessments(asRes.data);
      if (aRes.data.length > 0 && !newAssessment.assignment_id) {
        setNewAssessment((prev) => ({ ...prev, assignment_id: String(aRes.data[0].id) }));
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [newAssessment.assignment_id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await api.post("teacher/create-assessment/", {
        name: newAssessment.name,
        max_score: newAssessment.max_score,
        assignment_id: newAssessment.assignment_id || undefined,
      });
      setSuccess("Assessment created.");
      setNewAssessment({ ...newAssessment, name: "", max_score: "" });
      fetchData();
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || "Failed to create assessment.";
      setError(typeof msg === "string" ? msg : "Failed to create assessment.");
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Manage Assessments</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Create Assessment</h2>
        <form onSubmit={handleCreate} className="flex flex-wrap items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
            <select value={newAssessment.assignment_id}
              onChange={(e) => setNewAssessment({ ...newAssessment, assignment_id: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>{a.subject} - {a.grade}{a.section}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input required type="text" value={newAssessment.name}
              onChange={(e) => setNewAssessment({ ...newAssessment, name: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
              placeholder="e.g. Mid-term Exam" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Score *</label>
            <input required type="number" step="0.01" min="1" value={newAssessment.max_score}
              onChange={(e) => setNewAssessment({ ...newAssessment, max_score: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-28"
              placeholder="100" />
          </div>
          <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
            Create
          </button>
        </form>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Score</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Course</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assessments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{a.name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.max_score}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.course_display}</td>
                  </tr>
                ))}
                {assessments.length === 0 && (
                  <tr><td colSpan={3} className="px-4 py-8 text-center text-gray-500">No assessments created yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
