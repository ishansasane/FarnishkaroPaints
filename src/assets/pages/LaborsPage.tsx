import React, { useEffect, useState } from "react";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

function LaborsPage() {
  const [labors, setLabors] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch existing labors
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

  useEffect(() => {
    fetchLabors();
  }, []);

  // Add a new labor
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

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Labors</h1>

      {/* Form */}
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

      {/* Table */}
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
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : labors.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-4 text-gray-500">
                  No labors added yet.
                </td>
              </tr>
            ) : (
              labors.map(([name, date], idx) => (
                <tr key={idx}>
                  <td className="border px-4 py-2">{idx + 1}</td>
                  <td className="border px-4 py-2">{name}</td>
                  <td className="border px-4 py-2">{date}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default LaborsPage;
