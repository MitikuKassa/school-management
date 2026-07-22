import { useState, useEffect, useCallback } from "react";
import api from "../../api";

export default function GradeStudents() {
  const [assessments, setAssessments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  const [scores, setScores] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [asRes, sRes] = await Promise.all([
        api.get("teacher/assessments/"),
        api.get("teacher/students/"),
      ]);
      setAssessments(asRes.data);
      setStudents(sRes.data);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleScoreChange = (enrollmentId, value) => {
    setScores((prev) => ({ ...prev, [enrollmentId]: value }));
  };

  const handleSubmit = async () => {
    if (!selectedAssessment) return;
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      const payload = Object.entries(scores)
        .filter(([, v]) => v !== "" && v !== undefined)
        .map(([enrollment_id, score]) => ({ enrollment_id: String(enrollment_id), score }));
      if (payload.length === 0) {
        setError("No scores to submit.");
        setSubmitting(false);
        return;
      }
      const res = await api.post("teacher/bulk-grade/", {
        assessment_id: selectedAssessment,
        scores: payload,
      });
      setSuccess(res.data.message || "Grades submitted successfully!");
      setScores({});
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || "Failed to submit grades.";
      setError(typeof msg === "string" ? msg : "Failed to submit grades.");
    } finally {
      setSubmitting(false);
    }
  };

  const currentAssessment = assessments.find((a) => String(a.id) === String(selectedAssessment));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Grade Students</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Select Assessment</label>
            <select value={selectedAssessment || ""} onChange={(e) => setSelectedAssessment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              <option value="">-- Choose Assessment --</option>
              {assessments.map((a) => (
                <option key={a.id} value={a.id}>{a.name} (Max: {a.max_score}) - {a.course_display}</option>
              ))}
            </select>
          </div>
          {currentAssessment && (
            <div className="text-sm text-gray-500 pb-2">
              Max Score: <span className="font-medium text-gray-700">{currentAssessment.max_score}</span>
            </div>
          )}
        </div>
      </div>

      {selectedAssessment && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade/Section</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {students.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.student_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.grade}{s.section}</td>
                    <td className="px-4 py-3">
                      <input type="number" step="0.01" min="0"
                        max={currentAssessment?.max_score}
                        value={scores[s.id] || ""}
                        onChange={(e) => handleScoreChange(s.id, e.target.value)}
                        className="w-24 px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                        placeholder="0" />
                    </td>
                  </tr>
                ))}
                {students.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No students in your classes.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {students.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={handleSubmit} disabled={submitting}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50">
                {submitting ? "Submitting..." : "Submit All Grades"}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
