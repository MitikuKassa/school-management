import { useState, useEffect, useCallback } from "react";
import api from "../../api";

export default function ManageTeacherAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({ teacher: "", subject: "", grade: "", section: "", academic_year: "" });

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [aRes, tRes, yRes] = await Promise.all([
        api.get("admin/teacher-assignments/"),
        api.get("admin/staff/?role=teacher"),
        api.get("admin/academic-years/"),
      ]);
      setAssignments(aRes.data.results || aRes.data);
      const teacherList = (tRes.data.results || tRes.data).filter((u) => u.role === "teacher");
      setTeachers(teacherList);
      setYears(yRes.data.results || yRes.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await api.post("admin/teacher-assignments/", formData);
      setSuccess("Assignment created.");
      setFormData({ teacher: "", subject: "", grade: "", section: "", academic_year: "" });
      setShowForm(false);
      fetchData();
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "object") {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`);
        setError(msgs.join("\n"));
      } else {
        setError("Failed to create assignment.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this assignment?")) return;
    try {
      await api.delete(`admin/teacher-assignments/${id}/`);
      setSuccess("Deleted.");
      fetchData();
    } catch { setError("Failed to delete."); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Teacher Assignments</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
          {showForm ? "Cancel" : "+ New Assignment"}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm whitespace-pre-line">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teacher *</label>
              <select required value={formData.teacher}
                onChange={(e) => setFormData({ ...formData, teacher: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Select Teacher</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.full_name || t.username}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
              <input required type="text" value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g. Mathematics" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Grade *</label>
              <input required type="text" value={formData.grade}
                onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g. 10" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section *</label>
              <input required type="text" value={formData.section}
                onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none"
                placeholder="e.g. A" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Academic Year *</label>
              <select required value={formData.academic_year}
                onChange={(e) => setFormData({ ...formData, academic_year: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                <option value="">Select Year</option>
                {years.map((y) => (
                  <option key={y.id} value={y.id}>{y.year}</option>
                ))}
              </select>
            </div>
            <div className="flex items-end">
              <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Teacher</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Section</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {assignments.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{a.teacher_name || a.teacher_username}</td>
                    <td className="px-4 py-3 text-sm text-gray-800">{a.subject}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.grade}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.section}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{a.academic_year_display}</td>
                    <td className="px-4 py-3 text-sm">
                      <button onClick={() => handleDelete(a.id)} className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
                {assignments.length === 0 && (
                  <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">No assignments yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
