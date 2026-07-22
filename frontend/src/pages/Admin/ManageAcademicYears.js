import { useState, useEffect, useCallback } from "react";
import api from "../../api";

export default function ManageAcademicYears() {
  const [years, setYears] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({ year: "", is_active: false, is_registration_open: false, is_grading_open: false });

  const fetchYears = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("admin/academic-years/");
      setYears(res.data.results || res.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchYears(); }, [fetchYears]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await api.post("admin/academic-years/", formData);
      setSuccess("Academic year created.");
      setFormData({ year: "", is_active: false, is_registration_open: false, is_grading_open: false });
      setShowForm(false);
      fetchYears();
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "object") {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`);
        setError(msgs.join("\n"));
      } else {
        setError("Failed to create academic year.");
      }
    }
  };

  const toggleField = async (id, field, currentValue) => {
    try {
      await api.patch(`admin/academic-years/${id}/`, { [field]: !currentValue });
      fetchYears();
    } catch { setError("Failed to update."); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this academic year?")) return;
    try {
      await api.delete(`admin/academic-years/${id}/`);
      setSuccess("Deleted.");
      fetchYears();
    } catch { setError("Failed to delete."); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Academic Years</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
          {showForm ? "Cancel" : "+ New Year"}
        </button>
      </div>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm whitespace-pre-line">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Year (e.g. 2024-2025)</label>
              <input required type="text" value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="rounded border-gray-300 text-primary-600" />
              Active
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formData.is_registration_open}
                onChange={(e) => setFormData({ ...formData, is_registration_open: e.target.checked })}
                className="rounded border-gray-300 text-primary-600" />
              Registration Open
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={formData.is_grading_open}
                onChange={(e) => setFormData({ ...formData, is_grading_open: e.target.checked })}
                className="rounded border-gray-300 text-primary-600" />
              Grading Open
            </label>
            <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
              Create
            </button>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Year</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grading</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {years.map((y) => (
                  <tr key={y.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-medium text-gray-800">{y.year}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleField(y.id, "is_active", y.is_active)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${y.is_active ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                        {y.is_active ? "Yes" : "No"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleField(y.id, "is_registration_open", y.is_registration_open)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${y.is_registration_open ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}>
                        {y.is_registration_open ? "Open" : "Closed"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleField(y.id, "is_grading_open", y.is_grading_open)}
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${y.is_grading_open ? "bg-blue-100 text-blue-800" : "bg-gray-100 text-gray-600"}`}>
                        {y.is_grading_open ? "Open" : "Closed"}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button onClick={() => handleDelete(y.id)} className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
                {years.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No academic years yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
