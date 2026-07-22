import { useState, useCallback } from "react";
import api from "../../api";

const grades = ["1","2","3","4","5","6","7","8","9","10","11","12"];
const sections = ["A","B","C","D","E","F"];

export default function SearchEnroll() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [enrollments, setEnrollments] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSearch = useCallback(async () => {
    if (!searchQuery.trim()) return;
    setSearching(true); setError(""); setSuccess("");
    try {
      const res = await api.get(`registrar/student-search/?q=${encodeURIComponent(searchQuery)}`);
      setResults(res.data);
      if (res.data.length === 0) setError("No students found matching your query.");
    } catch {
      setError("Search failed. Please try again.");
    } finally {
      setSearching(false);
    }
  }, [searchQuery]);

  const handleEnroll = async (studentId) => {
    const { grade, section } = enrollments[studentId] || { grade: "10", section: "A" };
    setError(""); setSuccess("");
    try {
      await api.post("registrar/enrollments/", {
        student_id: studentId, grade, section,
      });
      setSuccess("Student enrolled successfully!");
      setResults(results.filter((r) => r.id !== studentId));
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || "Enrollment failed.";
      setError(typeof msg === "string" ? msg : "Enrollment failed.");
    }
  };

  const setEnrollmentField = (id, field, value) => {
    setEnrollments((prev) => ({
      ...prev,
      [id]: { ...prev[id], grade: "10", section: "A", ...prev[id], [field]: value },
    }));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Enroll Existing Student</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex gap-3">
          <input type="text" value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            placeholder="Search by name or username..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          <button onClick={handleSearch} disabled={searching}
            className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50">
            {searching ? "Searching..." : "Search"}
          </button>
        </div>
      </div>

      {results.length > 0 && (
        <div className="space-y-3">
          {results.map((student) => (
            <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <p className="font-medium text-gray-800">{student.full_name || student.username}</p>
                <p className="text-sm text-gray-500">@{student.username}</p>
                {student.profile && (
                  <p className="text-xs text-gray-400 mt-1">
                    {student.profile.gender === "M" ? "Male" : "Female"} {student.profile.nationality ? `- ${student.profile.nationality}` : ""}
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <select value={enrollments[student.id]?.grade || "10"}
                  onChange={(e) => setEnrollmentField(student.id, "grade", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  {grades.map((g) => <option key={g} value={g}>Grade {g}</option>)}
                </select>
                <select value={enrollments[student.id]?.section || "A"}
                  onChange={(e) => setEnrollmentField(student.id, "section", e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary-500 outline-none">
                  {sections.map((s) => <option key={s} value={s}>Section {s}</option>)}
                </select>
                <button onClick={() => handleEnroll(student.id)}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium">
                  Enroll
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {!searching && results.length === 0 && searchQuery && !error && (
        <div className="text-center text-gray-500 py-8">No students found.</div>
      )}
    </div>
  );
}
