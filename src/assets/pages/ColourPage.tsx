import React, { useEffect, useState } from "react";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

function ColourPage() {
  const [open, setOpen] = useState(false);
  const [sites, setSites] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [form, setForm] = useState({
    site: "",
    areas: [{ area: "", shadeName: "", shadeCode: "" }],
  });

  useEffect(() => {
    fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getprojectdata"
    )
      .then((res) => res.json())
      .then((data) => {
        const siteNames = data.body.map((item) => item[0]);
        setSites(siteNames);
      })
      .catch((error) => console.error("Error fetching site data:", error));

    fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsColorData"
    )
      .then((res) => res.json())
      .then((data) => {
        const parsed = [];
        data.body.forEach(([siteName, areaCollection, date]) => {
          const matches = areaCollection.match(/\[([^\]]+)\]/g);
          if (matches) {
            matches.forEach((block) => {
              const parts = block
                .replace(/[\[\]]/g, "")
                .split(",")
                .map((p) => p.trim());
              parsed.push({
                site: siteName,
                area: parts[0] || "",
                shadeName: parts[1] || "",
                shadeCode: parts[2] || "",
                date,
              });
            });
          }
        });
        setTableData(parsed);
      })
      .catch((err) => console.error("Error fetching paint data:", err));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAreaChange = (index, e) => {
    const { name, value } = e.target;
    const updatedAreas = [...form.areas];
    updatedAreas[index][name] = value;
    setForm((prev) => ({ ...prev, areas: updatedAreas }));
  };

  const addNewArea = () => {
    setForm((prev) => ({
      ...prev,
      areas: [...prev.areas, { area: "", shadeName: "", shadeCode: "" }],
    }));
  };

  const removeArea = (index) => {
    const updatedAreas = [...form.areas];
    updatedAreas.splice(index, 1);
    setForm((prev) => ({ ...prev, areas: updatedAreas }));
  };

  const handleAdd = () => {
    if (
      form.site &&
      form.areas.every((a) => a.area && a.shadeName && a.shadeCode)
    ) {
      const areaString = form.areas
        .map((a) => `[${a.area} , ${a.shadeName} , ${a.shadeCode}]`)
        .join("");

      fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/sendPaintsColorData",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            siteName: form.site,
            areaCollection: areaString,
            date: new Date().toISOString().split("T")[0], // e.g. 2025-07-01
          }),
        }
      )
        .then((res) => res.json())
        .then((res) => {
          if (res.success) {
            alert("Data added successfully!");
            // Optionally re-fetch
            window.location.reload();
          } else {
            alert("Failed to add: " + res.message);
          }
        })
        .catch((err) => {
          console.error("POST error:", err);
          alert("Something went wrong");
        });

      setForm({
        site: "",
        areas: [{ area: "", shadeName: "", shadeCode: "" }],
      });
      setOpen(false);
    }
  };

  const groupedData = tableData.reduce((acc, curr) => {
    if (!acc[curr.site]) acc[curr.site] = [];
    acc[curr.site].push(curr);
    return acc;
  }, {});

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
            <th className="border px-4 py-2 text-left">Area</th>
            <th className="border px-4 py-2 text-left">Shade Name</th>
            <th className="border px-4 py-2 text-left">Shade Code</th>
          </tr>
        </thead>
        <tbody>
          {tableData.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center py-4 text-gray-500">
                No data available
              </td>
            </tr>
          ) : (
            Object.entries(groupedData).map(([site, entries]) => (
              <React.Fragment key={site}>
                {entries.map((entry, index) => (
                  <tr key={`${site}-${index}`}>
                    {index === 0 && (
                      <td className="border px-4 py-2" rowSpan={entries.length}>
                        {site}
                      </td>
                    )}
                    <td className="border px-4 py-2">{entry.area}</td>
                    <td className="border px-4 py-2">{entry.shadeName}</td>
                    <td className="border px-4 py-2">{entry.shadeCode}</td>
                  </tr>
                ))}
              </React.Fragment>
            ))
          )}
        </tbody>
      </table>

      {/* Modal Dialog */}
      {open && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg overflow-y-auto max-h-screen">
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

            {form.areas.map((area, index) => (
              <div
                key={index}
                className="mb-4 border p-3 rounded-lg bg-gray-50"
              >
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Area {index + 1}</h3>
                  {index > 0 && (
                    <button
                      onClick={() => removeArea(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div className="mb-3">
                  <label className="block mb-1">Area</label>
                  <input
                    name="area"
                    value={area.area}
                    onChange={(e) => handleAreaChange(index, e)}
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter area"
                  />
                </div>

                <div className="mb-3">
                  <label className="block mb-1">Shade Name</label>
                  <input
                    name="shadeName"
                    value={area.shadeName}
                    onChange={(e) => handleAreaChange(index, e)}
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter shade name"
                  />
                </div>

                <div className="mb-3">
                  <label className="block mb-1">Shade Code</label>
                  <input
                    name="shadeCode"
                    value={area.shadeCode}
                    onChange={(e) => handleAreaChange(index, e)}
                    type="text"
                    className="w-full border rounded px-3 py-2"
                    placeholder="Enter shade code"
                  />
                </div>
              </div>
            ))}

            <div className="flex justify-between mb-4">
              <button
                onClick={addNewArea}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                + Add Another Area
              </button>
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
                Add All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ColourPage;
