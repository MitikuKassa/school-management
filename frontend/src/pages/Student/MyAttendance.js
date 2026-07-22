import { useState, useEffect, useCallback } from "react";
import api from "../../api";

export default function MyAttendance() {
  const [attendance, setAttendance] = useState([]);
  const [summary, setSummary] = useState({ total: 0, present: 0, absent: 0, late: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const fetchAttendance = useCallback(async () => {
    setLoading(true);
    try {
      let url = "student/attendance/?";
      if (dateFrom) url += `from=${dateFrom}&`;
      if (dateTo) url += `to=${dateTo}&`;
      const res = await api.get(url);
      const records = res.data;
      setAttendance(records);
      const total = records.length;
      const present = records.filter((r) => r.status === "present").length;
      const absent = records.filter((r) => r.status === "absent").length;
      const late = records.filter((r) => r.status === "late").length;
      setSummary({
        total, present, absent, late,
        percentage: total > 0 ? ((present / total) * 100).toFixed(2) : 0,
      });
    } catch { /* ignore */ }
    finally { setLoading(false); }
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchAttendance(); }, [fetchAttendance]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Attendance</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-sm text-gray-500">Total Days</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{summary.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-sm text-gray-500">Present</p>
          <p className="text-3xl font-bold text-green-600 mt-1">{summary.present}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-sm text-gray-500">Absent</p>
          <p className="text-3xl font-bold text-red-600 mt-1">{summary.absent}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 text-center">
          <p className="text-sm text-gray-500">Attendance Rate</p>
          <p className="text-3xl font-bold text-primary-600 mt-1">{summary.percentage}%</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
            <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
            <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none" />
          </div>
          <button onClick={() => { setDateFrom(""); setDateTo(""); }}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 transition-colors text-sm font-medium">
            Clear Filters
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendance.map((a) => (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-sm text-gray-800">
                      {new Date(a.date).toLocaleDateString("en-US", { weekday: "short", year: "numeric", month: "short", day: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${
                        a.status === "present" ? "bg-green-100 text-green-800" :
                        a.status === "absent" ? "bg-red-100 text-red-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
                {attendance.length === 0 && (
                  <tr><td colSpan={2} className="px-4 py-8 text-center text-gray-500">No attendance records found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
