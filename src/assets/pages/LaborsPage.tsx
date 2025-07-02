import React, { useEffect, useState } from "react";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

interface AttendanceEntry {
  date: string;
  site: string;
  records: {
    name: string;
    day: boolean;
    night: boolean;
  }[];
}

function LaborsPage() {
  const [labors, setLabors] = useState<string[][]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLabor, setSelectedLabor] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceEntry[]>([]);

  const fetchLabors = () => {
    setLoading(true);
    fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsLabourData"
    )
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setLabors(data.body);
        }
      })
      .catch((err) => console.error("Failed to fetch labors:", err))
      .finally(() => setLoading(false));
  };

  const fetchAttendance = async () => {
    try {
      const res = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getLabourData"
      );
      const data = await res.json();

      if (data.success && Array.isArray(data.body)) {
        const parsed: AttendanceEntry[] = data.body.map(
          ([date, site, rawEntries]: any) => {
            const records: AttendanceEntry["records"] = rawEntries
              .split("],[")
              .map((s: string) => s.replace(/[\[\]"]/g, ""))
              .map((entry: string) => {
                const [name, day, night] = entry.split(",");
                return {
                  name: name.trim(),
                  day: day === "P",
                  night: night === "P",
                };
              });

            return { date, site, records };
          }
        );

        setAttendanceData(parsed);
      }
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  };

  useEffect(() => {
    fetchLabors();
    fetchAttendance();
  }, []);

  const handleAdd = () => {
    if (!name.trim()) {
      alert("Name is required");
      return;
    }

    const today = new Date().toISOString().split("T")[0];

    fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/sendPaintsLabourData",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: name.trim(), date: today }),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          alert("Labor added successfully!");
          setName("");
          fetchLabors();
        } else {
          alert("Failed to add labor.");
        }
      })
      .catch((err) => {
        console.error("POST error:", err);
        alert("Something went wrong");
      });
  };

  const openAttendanceDialog = (laborName: string) => {
    setSelectedLabor(laborName);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedLabor(null);
  };

  const filteredAttendance = attendanceData.filter((entry) =>
    entry.records.some((r) => r.name === selectedLabor)
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Labors</h1>

      <div className="mb-6 flex gap-4 items-end">
        <div className="flex-1">
          <label className="block mb-1 font-medium">Labor Name</label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Enter labor name"
          />
        </div>
        <button
          onClick={handleAdd}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Labor
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">#</th>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : labors.length === 0 ? (
              <tr>
                <td colSpan={3} className="text-center py-4 text-gray-500">
                  No labors added yet.
                </td>
              </tr>
            ) : (
              labors.map(([name, date], idx) => (
                <tr key={idx}>
                  <td className="border px-4 py-2">{idx + 1}</td>
                  <td
                    className="border px-4 py-2 text-blue-600 cursor-pointer hover:underline"
                    onClick={() => openAttendanceDialog(name)}
                  >
                    {name}
                  </td>
                  <td className="border px-4 py-2">{date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Attendance Dialog */}
      {dialogOpen && selectedLabor && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              Attendance for {selectedLabor}
            </h2>

            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full border border-gray-300 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="border px-3 py-2 text-left">Date</th>
                    <th className="border px-3 py-2 text-left">Site</th>
                    <th className="border px-3 py-2 text-left">Day</th>
                    <th className="border px-3 py-2 text-left">Night</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAttendance.map((entry, idx) => {
                    const record = entry.records.find(
                      (r) => r.name === selectedLabor
                    );
                    if (!record) return null;
                    return (
                      <tr key={idx}>
                        <td className="border px-3 py-2">{entry.date}</td>
                        <td className="border px-3 py-2">{entry.site}</td>
                        <td className="border px-3 py-2">
                          {record.day ? "✅" : "❌"}
                        </td>
                        <td className="border px-3 py-2">
                          {record.night ? "✅" : "❌"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right">
              <button
                className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                onClick={closeDialog}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default LaborsPage;
