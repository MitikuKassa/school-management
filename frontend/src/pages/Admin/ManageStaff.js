import { useState, useEffect, useCallback } from "react";
import api from "../../api";

const emptyProfile = {
  first_name: "", father_name: "", grand_father_name: "",
  date_of_birth: "", gender: "M", nationality: "",
  phone_number: "", address: "",
};

export default function ManageStaff() {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [formData, setFormData] = useState({
    username: "", password: "", email: "", role: "teacher",
    profile: { ...emptyProfile },
  });

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get("admin/staff/");
      setStaffList(res.data.results || res.data);
    } catch (err) {
      console.error("Failed to load staff:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const resetForm = () => {
    setFormData({ username: "", password: "", email: "", role: "teacher", profile: { ...emptyProfile } });
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      if (editingId) {
        const payload = { email: formData.email, role: formData.role, profile: { ...formData.profile } };
        await api.put(`admin/staff/${editingId}/`, payload);
        setSuccess("Staff updated successfully.");
      } else {
        await api.post("auth/register/", formData);
        setSuccess("Staff created successfully.");
      }
      resetForm();
      setShowForm(false);
      fetchStaff();
    } catch (err) {
      const data = err.response?.data;
      if (typeof data === "object") {
        const msgs = [];
        for (const key in data) {
          const val = Array.isArray(data[key]) ? data[key].join(", ") : data[key];
          msgs.push(`${key}: ${val}`);
        }
        setError(msgs.join("\n"));
      } else {
        setError("Operation failed. Please try again.");
      }
    }
  };

  const handleEdit = (staff) => {
    setEditingId(staff.id);
    setFormData({
      username: staff.username,
      password: "",
      email: staff.email || "",
      role: staff.role,
      profile: staff.profile ? { ...emptyProfile, ...staff.profile } : { ...emptyProfile },
    });
    setShowForm(true);
  };

  const handleDeactivate = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this staff member?")) return;
    try {
      await api.delete(`admin/staff/${id}/`);
      setSuccess("Staff deactivated.");
      fetchStaff();
    } catch {
      setError("Failed to deactivate staff.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Manage Staff</h1>
        <button
          onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
        >
          {showForm ? "Cancel" : "+ Add Staff"}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm whitespace-pre-line">{error}</div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">{success}</div>
      )}

      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            {editingId ? "Edit Staff" : "Register New Staff"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {!editingId && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Username *</label>
                    <input required type="text" value={formData.username}
                      onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Password *</label>
                    <input required type="password" value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role *</label>
                <select value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="teacher">Teacher</option>
                  <option value="registrar">Registrar</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                <input required type="text" value={formData.profile.first_name}
                  onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, first_name: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Father Name *</label>
                <input required type="text" value={formData.profile.father_name}
                  onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, father_name: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Grand Father Name *</label>
                <input required type="text" value={formData.profile.grand_father_name}
                  onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, grand_father_name: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input type="date" value={formData.profile.date_of_birth}
                  onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, date_of_birth: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender *</label>
                <select value={formData.profile.gender}
                  onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, gender: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none">
                  <option value="M">Male</option>
                  <option value="F">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input type="text" value={formData.profile.phone_number}
                  onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, phone_number: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
                <input type="text" value={formData.profile.nationality}
                  onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, nationality: e.target.value } })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <textarea value={formData.profile.address}
                  onChange={(e) => setFormData({ ...formData, profile: { ...formData.profile, address: e.target.value } })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium">
                {editingId ? "Update Staff" : "Create Staff"}
              </button>
              <button type="button" onClick={() => { resetForm(); setShowForm(false); }}
                className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-4 border-b border-gray-100">
          <input type="text" placeholder="Search staff..." className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none text-sm"
            onChange={(e) => {
              const q = e.target.value.toLowerCase();
              document.querySelectorAll("[data-staff-row]").forEach((row) => {
                const name = row.getAttribute("data-staff-name") || "";
                row.style.display = name.toLowerCase().includes(q) ? "" : "none";
              });
            }}
          />
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Username</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {staffList.map((staff) => (
                  <tr key={staff.id} data-staff-row data-staff-name={`${staff.full_name} ${staff.username}`} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">{staff.full_name}</td>
                    <td className="px-4 py-3 text-sm text-gray-600">{staff.username}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        staff.role === "teacher" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"
                      }`}>
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">{staff.profile?.phone_number || "-"}</td>
                    <td className="px-4 py-3 text-sm space-x-2">
                      <button onClick={() => handleEdit(staff)} className="text-primary-600 hover:text-primary-800">Edit</button>
                      <button onClick={() => handleDeactivate(staff.id)} className="text-red-600 hover:text-red-800">Deactivate</button>
                    </td>
                  </tr>
                ))}
                {staffList.length === 0 && (
                  <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-500">No staff members found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
