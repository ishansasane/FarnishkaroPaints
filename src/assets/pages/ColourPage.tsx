import React, { useEffect, useState } from "react";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

function ColourPage() {
  const [open, setOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [form, setForm] = useState({ site: "", shadeName: "", shadeCode: "" });

  useEffect(() => {
    fetchWithLoading(
      "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/getprojectdata"
    )
      .then((res) => res.json())
      .then((data) => {
        const siteNames = data.body.map((item) => item[0]);
        setSites(siteNames);
      })
      .catch((error) => console.error("Error fetching site data:", error));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAdd = () => {
    if (form.site && form.shadeName && form.shadeCode) {
      setTableData([...tableData, form]);
      setForm({ site: "", shadeName: "", shadeCode: "" });
      setOpen(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Colour Table</h1>
        <button
          onClick={() => setOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Add Colour
        </button>
      </div>

      <table className="w-full border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Site Name</th>
            <th className="border px-4 py-2 text-left">Shade Name</th>
            <th className="border px-4 py-2 text-left">Shade Code</th>
          </tr>
        </thead>
        <tbody>
          {tableData.length === 0 ? (
            <tr>
              <td colSpan="3" className="text-center py-4 text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            tableData.map((row, index) => (
              <tr key={index}>
                <td className="border px-4 py-2">{row.site}</td>
                <td className="border px-4 py-2">{row.shadeName}</td>
                <td className="border px-4 py-2">{row.shadeCode}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Modal Dialog */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg">
            <h2 className="text-lg font-semibold mb-4">Add New Colour</h2>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Site Name</label>
              <select
                name="site"
                value={form.site}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2"
              >
                <option value="">Select site</option>
                {sites.map((site, idx) => (
                  <option key={idx} value={site}>
                    {site}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Shade Name</label>
              <input
                name="shadeName"
                value={form.shadeName}
                onChange={handleChange}
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="Enter shade name"
              />
            </div>

            <div className="mb-4">
              <label className="block mb-1 font-medium">Shade Code</label>
              <input
                name="shadeCode"
                value={form.shadeCode}
                onChange={handleChange}
                type="text"
                className="w-full border rounded px-3 py-2"
                placeholder="Enter shade code"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setOpen(false)}
                className="px-4 py-2 border rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleAdd}
                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColourPage;
