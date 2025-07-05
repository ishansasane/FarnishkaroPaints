import React, { useEffect, useState } from "react";
import { fetchWithLoading } from "../Redux/fetchWithLoading";
import dayjs from "dayjs";

interface AttendanceEntry {
  date: string;
  site: string;
  records: {
    name: string;
    day: boolean;
    night: boolean;
  }[];
}

const hasPermission = (requiredRoute: string): boolean => {
  try {
    const allowedRoutes = JSON.parse(
      localStorage.getItem("allowed_routes") || "[]"
    );
    if (!Array.isArray(allowedRoutes)) return false;

    return allowedRoutes.includes(
      requiredRoute.replace(/\\/g, "").replace(/\/+$/, "")
    );
  } catch {
    return false;
  }
};

const canEditAttendance = hasPermission("/edit-attendence");

function LaborsPage() {
  const [labors, setLabors] = useState<string[][]>([]);
  const [name, setName] = useState("");
  const [payment, setPayment] = useState("");
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLabor, setSelectedLabor] = useState<string | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>(
    dayjs().format("MM")
  );
  const [selectedYear, setSelectedYear] = useState<string>(
    dayjs().format("YYYY")
  );
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [currentEditLabor, setCurrentEditLabor] = useState<{
    name: string;
    payment: string;
  }>({ name: "", payment: "" });

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
    if (!name.trim()) return alert("Name is required");

    const today = new Date().toISOString().split("T")[0];
    const payload: any = { name: name.trim(), date: today };
    if (payment.trim()) payload.payment = payment.trim();

    fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/sendPaintsLabourData",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          alert("Labor added successfully!");
          setName("");
          setPayment("");
          fetchLabors();
          setAddDialogOpen(false);
        } else {
          alert("Failed to add labor.");
        }
      })
      .catch((err) => {
        console.error("POST error:", err);
        alert("Something went wrong");
      });
  };

  const handleUpdate = () => {
    if (!currentEditLabor.payment.trim()) return alert("Payment is required");

    fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/updatePaintsLabourData",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentEditLabor.name,
          payment: currentEditLabor.payment.trim(),
        }),
      }
    )
      .then((res) => res.json())
      .then((res) => {
        if (res.success) {
          alert("Labor payment updated successfully!");
          fetchLabors();
          setEditDialogOpen(false);
        } else {
          alert("Failed to update labor payment.");
        }
      })
      .catch((err) => {
        console.error("UPDATE error:", err);
        alert("Something went wrong");
      });
  };

  const openEditDialog = (labor: string[]) => {
    setCurrentEditLabor({
      name: labor[0],
      payment: labor[2] || "",
    });
    setEditDialogOpen(true);
  };

  const openAttendanceDialog = (laborName: string) => {
    setSelectedLabor(laborName);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setSelectedLabor(null);
  };

  const closeEditDialog = () => {
    setEditDialogOpen(false);
    setCurrentEditLabor({ name: "", payment: "" });
  };

  const filteredAttendance = attendanceData.filter(
    (entry) =>
      dayjs(entry.date).format("YYYY") === selectedYear &&
      dayjs(entry.date).format("MM") === selectedMonth &&
      entry.records.some((r) => r.name === selectedLabor)
  );

  const getLaborPayment = (laborName: string): number => {
    const entry = labors.find(([name]) => name === laborName);
    const payStr = entry?.[2];
    return payStr ? parseFloat(payStr) : 0;
  };

  const calculateWage = (): number => {
    if (!selectedLabor) return 0;
    const pay = getLaborPayment(selectedLabor);
    let total = 0;

    filteredAttendance.forEach((entry) => {
      const record = entry.records.find((r) => r.name === selectedLabor);
      if (record) {
        if (record.day) total += pay;
        if (record.night) total += pay * 0.5;
      }
    });

    return total;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-bold">Labors</h1>
        <button
          onClick={() => setAddDialogOpen(true)}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          + Add Labor
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border border-gray-300">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-4 py-2 text-left">#</th>
              <th className="border px-4 py-2 text-left">Name</th>
              <th className="border px-4 py-2 text-left">Payment</th>
              <th className="border px-4 py-2 text-left">Date</th>
              <th className="border px-4 py-2 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : labors.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4 text-gray-500">
                  No labors added yet.
                </td>
              </tr>
            ) : (
              labors.map(([name, date, pay], idx) => (
                <tr key={idx}>
                  <td className="border px-4 py-2">{idx + 1}</td>
                  <td
                    className="border px-4 py-2 text-blue-600 cursor-pointer hover:underline"
                    onClick={() => openAttendanceDialog(name)}
                  >
                    {name}
                  </td>
                  <td className="border px-4 py-2">{pay ? `₹${pay}` : "--"}</td>
                  <td className="border px-4 py-2">{date}</td>
                  <td className="border px-4 py-2">
                    {canEditAttendance && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog([name, date, pay]);
                        }}
                        className="bg-blue-500 text-white px-3 py-1 rounded mr-2 hover:bg-blue-600"
                      >
                        Edit Payment
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Add Labor Dialog */}
      {addDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Add New Labor</h2>
            <div className="mb-4">
              <label className="block font-medium mb-1">Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter name"
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">
                Payment (optional)
              </label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={payment}
                onChange={(e) => setPayment(e.target.value)}
                placeholder="e.g. 1000"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={() => setAddDialogOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleAdd}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment Dialog */}
      {editDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
            <h2 className="text-xl font-semibold mb-4">Update Payment</h2>
            <div className="mb-4">
              <label className="block font-medium mb-1">Labor Name</label>
              <input
                type="text"
                className="w-full border rounded px-3 py-2 bg-gray-100"
                value={currentEditLabor.name}
                readOnly
                disabled
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1">Payment</label>
              <input
                type="number"
                className="w-full border rounded px-3 py-2"
                value={currentEditLabor.payment}
                onChange={(e) =>
                  setCurrentEditLabor({
                    ...currentEditLabor,
                    payment: e.target.value,
                  })
                }
                placeholder="Enter payment amount"
              />
            </div>
            <div className="flex justify-end gap-3">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
                onClick={closeEditDialog}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                onClick={handleUpdate}
              >
                Update Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Attendance Dialog */}
      {dialogOpen && selectedLabor && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 max-w-3xl w-full shadow-xl">
            <h2 className="text-xl font-semibold mb-4">
              Attendance for {selectedLabor}
            </h2>

            <div className="flex gap-4 mb-4">
              <select
                className="border px-3 py-2 rounded"
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
              >
                {["2024", "2025", "2026"].map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select
                className="border px-3 py-2 rounded"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const month = (i + 1).toString().padStart(2, "0");
                  return (
                    <option key={month} value={month}>
                      {dayjs().month(i).format("MMMM")}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="overflow-y-auto max-h-[60vh] text-sm">
              <table className="w-full border border-gray-300">
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

            <div className="mt-4 font-semibold">
              Total Wage: ₹{Math.round(calculateWage())}
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
