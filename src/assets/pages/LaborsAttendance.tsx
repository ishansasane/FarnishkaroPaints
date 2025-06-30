import React, { useState, useEffect } from "react";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

function LaborsAttendance() {
  const [sites, setSites] = useState([]);
  const [selectedSite, setSelectedSite] = useState("");
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [attendanceData, setAttendanceData] = useState([]);
  const [laborNames, setLaborNames] = useState([]);
  const [newLaborName, setNewLaborName] = useState("");
  const [copyFromDate, setCopyFromDate] = useState("");

  // Fetch sites data
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
  }, []);

  // Format date for display
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getDate()} / ${date.getMonth() + 1} / ${date.getFullYear()}`;
  };

  // Add new labor
  const addLabor = () => {
    if (newLaborName.trim() && selectedSite) {
      const newLabor = {
        name: newLaborName.trim(),
        day: "",
        night: "",
      };
      setLaborNames([...laborNames, newLabor]);
      setNewLaborName("");
    }
  };

  // Update attendance
  const updateAttendance = (index, shift, value) => {
    const updatedLabors = [...laborNames];
    updatedLabors[index][shift] = value;
    setLaborNames(updatedLabors);
  };

  // Save attendance for current site and date
  const saveAttendance = () => {
    if (selectedSite && selectedDate && laborNames.length > 0) {
      const newEntry = {
        date: selectedDate,
        site: selectedSite,
        labors: [...laborNames],
      };

      // Check if entry for this date and site already exists
      const existingIndex = attendanceData.findIndex(
        (entry) => entry.date === selectedDate && entry.site === selectedSite
      );

      if (existingIndex >= 0) {
        const updatedData = [...attendanceData];
        updatedData[existingIndex] = newEntry;
        setAttendanceData(updatedData);
      } else {
        setAttendanceData([...attendanceData, newEntry]);
      }

      alert("Attendance saved successfully!");
    }
  };

  // Copy names from previous date
  const copyNamesFromPrevious = () => {
    if (copyFromDate) {
      const previousEntry = attendanceData.find(
        (entry) => entry.date === copyFromDate && entry.site === selectedSite
      );

      if (previousEntry) {
        setLaborNames(
          previousEntry.labors.map((labor) => ({
            name: labor.name,
            day: "",
            night: "",
          }))
        );
      } else {
        alert("No attendance data found for the selected date and site");
      }
    }
  };

  // Group attendance data by date
  const groupedByDate = attendanceData.reduce((acc, entry) => {
    if (!acc[entry.date]) {
      acc[entry.date] = [];
    }
    acc[entry.date].push(entry);
    return acc;
  }, {});

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Labour Attendance</h1>

      {/* Attendance Input Section */}
      <div className="bg-white p-6 rounded-lg shadow-md mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Site Name
            </label>
            <select
              value={selectedSite}
              onChange={(e) => setSelectedSite(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Select Site</option>
              {sites.map((site, index) => (
                <option key={index} value={site}>
                  {site}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={saveAttendance}
              disabled={
                !selectedSite || !selectedDate || laborNames.length === 0
              }
              className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:bg-gray-400"
            >
              Save Attendance
            </button>
          </div>
        </div>

        {/* Copy from previous date */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 bg-gray-50 p-4 rounded">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Copy Names From Date
            </label>
            <input
              type="date"
              value={copyFromDate}
              onChange={(e) => setCopyFromDate(e.target.value)}
              className="w-full p-2 border rounded"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={copyNamesFromPrevious}
              disabled={!copyFromDate || !selectedSite}
              className="w-full bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700 disabled:bg-gray-400"
            >
              Copy Names
            </button>
          </div>
          <div className="flex items-end">
            <div className="text-sm text-gray-500">
              Will copy labor names (without attendance) from selected date
            </div>
          </div>
        </div>

        {/* Add new labor */}
        <div className="flex gap-2 mb-6">
          <input
            type="text"
            value={newLaborName}
            onChange={(e) => setNewLaborName(e.target.value)}
            placeholder="Enter labor name"
            className="flex-1 p-2 border rounded"
            onKeyPress={(e) => e.key === "Enter" && addLabor()}
          />
          <button
            onClick={addLabor}
            className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
          >
            Add Labor
          </button>
        </div>

        {/* Attendance table */}
        {laborNames.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full border">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border p-2 text-left">Name</th>
                  <th className="border p-2 text-left">Day</th>
                  <th className="border p-2 text-left">Night</th>
                  <th className="border p-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {laborNames.map((labor, index) => (
                  <tr key={index}>
                    <td className="border p-2">{labor.name}</td>
                    <td className="border p-2">
                      <select
                        value={labor.day}
                        onChange={(e) =>
                          updateAttendance(index, "day", e.target.value)
                        }
                        className="w-full p-1 border rounded"
                      >
                        <option value="">Select</option>
                        <option value="p">Present (P)</option>
                        <option value="a">Absent (A)</option>
                      </select>
                    </td>
                    <td className="border p-2">
                      <select
                        value={labor.night}
                        onChange={(e) =>
                          updateAttendance(index, "night", e.target.value)
                        }
                        className="w-full p-1 border rounded"
                      >
                        <option value="">Select</option>
                        <option value="p">Present (P)</option>
                        <option value="a">Absent (A)</option>
                      </select>
                    </td>
                    <td className="border p-2">
                      <button
                        onClick={() => {
                          const updated = [...laborNames];
                          updated.splice(index, 1);
                          setLaborNames(updated);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Attendance Records Section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Attendance Records</h2>

        {Object.entries(groupedByDate).length === 0 ? (
          <p className="text-gray-500">No attendance records found</p>
        ) : (
          Object.entries(groupedByDate).map(([date, entries]) => (
            <div key={date} className="mb-8">
              <h3 className="text-lg font-medium mb-2">
                Date: {formatDate(date)}
              </h3>

              {entries.map((entry, index) => (
                <div
                  key={`${date}-${index}`}
                  className="mb-6 bg-white p-4 rounded shadow"
                >
                  <h4 className="font-medium mb-2">Site: {entry.site}</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border p-2 text-left">Name</th>
                          <th className="border p-2 text-left">Day</th>
                          <th className="border p-2 text-left">Night</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entry.labors.map((labor, laborIndex) => (
                          <tr key={laborIndex}>
                            <td className="border p-2">{labor.name}</td>
                            <td className="border p-2">
                              {labor.day === "p" ? "Present (P)" : "Absent (A)"}
                            </td>
                            <td className="border p-2">
                              {labor.night === "p"
                                ? "Present (P)"
                                : "Absent (A)"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default LaborsAttendance;
