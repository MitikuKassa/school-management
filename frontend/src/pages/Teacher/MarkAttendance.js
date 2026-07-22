import { useState, useEffect, useCallback } from "react";
import api from "../../api";

export default function MarkAttendance() {
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [attendance, setAttendance] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pastAttendance, setPastAttendance] = useState([]);
  const [viewDate, setViewDate] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, sRes] = await Promise.all([
        api.get("teacher/assignments/"),
        api.get("teacher/students/"),
      ]);
      setAssignments(aRes.data);
      setStudents(sRes.data);
      if (aRes.data.length > 0 && !selectedAssignment) {
        setSelectedAssignment(String(aRes.data[0].id));
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [selectedAssignment]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const filteredStudents = selectedAssignment
    ? (() => {
        const assignment = assignments.find((a) => String(a.id) === String(selectedAssignment));
        if (!assignment) return students;
        return students.filter((s) => s.grade === assignment.grade && s.section === assignment.section);
      })()
    : students;

  const setStatus = (enrollmentId, status) => {
    setAttendance((prev) => ({ ...prev, [enrollmentId]: status }));
  };

  const handleSubmit = async () => {
    if (!date) { setError("Please select a date."); return; }
    setError(""); setSuccess(""); setSubmitting(true);
    try {
      const attendanceList = filteredStudents.map((s) => ({
        enrollment_id: String(s.id),
        status: attendance[s.id] || "present",
      }));
      await api.post("teacher/attendance/", { date, attendance: attendanceList });
      setSuccess("Attendance saved successfully!");
      setAttendance({});
    } catch (err) {
      const msg = err.response?.data?.error || err.response?.data?.detail || "Failed to save attendance.";
      setError(typeof msg === "string" ? msg : "Failed to save attendance.");
    } finally {
      setSubmitting(false);
    }
  };

  const fetchPastAttendance = useCallback(async () => {
    if (!viewDate) return;
    try {
      const res = await api.get(`teacher/attendance/list/?date=${viewDate}`);
      setPastAttendance(res.data);
    } catch { setPastAttendance([]); }
  }, [viewDate]);

  useEffect(() => { if (viewDate) fetchPastAttendance(); }, [viewDate, fetchPastAttendance]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Mark Attendance</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Class</label>
            <select value={selectedAssignment || ""} onChange={(e) => setSelectedAssignment(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
              {assignments.map((a) => (
                <option key={a.id} value={a.id}>{a.subject} - {a.grade}{a.section}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <button onClick={() => { setAttendance({}); filteredStudents.forEach((s) => setAttendance((p) => ({ ...p, [s.id]: "present" }))); }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
            All Present
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">Loading...</div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Present</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Absent</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Late</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredStudents.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-500">{i + 1}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{s.student_name}</td>
                    {["present", "absent", "late"].map((status) => (
                      <td key={status} className="px-4 py-3 text-center">
                        <input type="radio" name={`att_${s.id}`} value={status}
                          checked={(attendance[s.id] || "present") === status}
                          onChange={() => setStatus(s.id, status)}
                          className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500" />
                      </td>
                    ))}
                  </tr>
                ))}
                {filteredStudents.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No students found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {filteredStudents.length > 0 && (
            <div className="p-4 border-t border-gray-100 flex justify-end">
              <button onClick={handleSubmit} disabled={submitting}
                className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium disabled:opacity-50">
                {submitting ? "Saving..." : "Save Attendance"}
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">View Past Attendance</h2>
        <div className="flex gap-3 items-end mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
            <input type="date" value={viewDate} onChange={(e) => setViewDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
        </div>
        {pastAttendance.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Recorded By</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pastAttendance.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{a.student_name}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.status === "present" ? "bg-green-100 text-green-800" :
                        a.status === "absent" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>{a.status}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.recorded_by}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {viewDate && pastAttendance.length === 0 && (
          <p className="text-gray-500 text-sm">No attendance records for this date.</p>
        )}
      </div>
    </div>
  );
}
