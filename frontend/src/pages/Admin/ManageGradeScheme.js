import { useState, useEffect, useCallback } from "react";
import api from "../../api";

export default function ManageGradeScheme() {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newGrade, setNewGrade] = useState({ letter: "", min_percent: "" });

  const fetchSchemes = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("admin/grade-scheme/");
      setSchemes(res.data.results || res.data);
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchSchemes(); }, [fetchSchemes]);

  const handleAdd = async (e) => {
    e.preventDefault();
    setError(""); setSuccess("");
    try {
      await api.post("admin/grade-scheme/", newGrade);
      setSuccess("Grade added.");
      setNewGrade({ letter: "", min_percent: "" });
      fetchSchemes();
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "object") {
        const msgs = Object.entries(data).map(([k, v]) => `${k}: ${Array.isArray(v) ? v.join(", ") : v}`);
        setError(msgs.join("\n"));
      } else {
        setError("Failed to add grade.");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this grade?")) return;
    try {
      await api.delete(`admin/grade-scheme/${id}/`);
      setSuccess("Deleted.");
      fetchSchemes();
    } catch { setError("Failed to delete."); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">Grade Scheme</h1>

      {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm whitespace-pre-line">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Add Grade</h2>
        <form onSubmit={handleAdd} className="flex items-end gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Letter Grade</label>
            <input required type="text" value={newGrade.letter}
              onChange={(e) => setNewGrade({ ...newGrade, letter: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-20"
              placeholder="A+" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Percentage</label>
            <input required type="number" step="0.01" min="0" max="100" value={newGrade.min_percent}
              onChange={(e) => setNewGrade({ ...newGrade, min_percent: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none w-28"
              placeholder="90" />
          </div>
          <button type="submit" className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
            Add
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Letter</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Min %</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Range</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {schemes.map((s, i) => (
                  <tr key={s.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm font-bold text-gray-800">{s.letter}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{s.min_percent}%</td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {s.min_percent}% - {i < schemes.length - 1 ? (parseFloat(schemes[i + 1].min_percent) - 0.01).toFixed(2) + "%" : "100%"}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-800">Delete</button>
                    </td>
                  </tr>
                ))}
                {schemes.length === 0 && (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-500">No grades configured yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
