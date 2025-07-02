import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux"; // Add this import
import { fetchWithLoading } from "../Redux/fetchWithLoading";
import { RootState } from "../Redux/Store"; // Make sure to import RootState
import { setInteriorData } from "../Redux/dataSlice"; // Import your action

interface InteriorDialogProps {
  setDialogOpen: (open: boolean) => void;
  setRefresh: (state: boolean) => void;
  refresh: boolean;
  editingInterior: string[] | null;
  setEditingInterior: (interior: string[] | null) => void;
}

async function fetchInteriors() {
  try {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsinteriordata",
      { credentials: "include" }
    );
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data.body) ? data.body : [];
  } catch (error) {
    console.error("Error fetching interiors:", error);
    return [];
  }
}

const InteriorDialog: React.FC<InteriorDialogProps> = ({
  setDialogOpen,
  setRefresh,
  refresh,
  editingInterior,
  setEditingInterior,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const interiors = useSelector((state: RootState) => state.data.interiors);

  const [name, setName] = useState(editingInterior ? editingInterior[0] : "");
  const [email, setEmail] = useState(editingInterior ? editingInterior[1] : "");
  const [phonenumber, setPhoneNumber] = useState(
    editingInterior ? editingInterior[2] : ""
  );
  const [address, setAddress] = useState(
    editingInterior ? editingInterior[3] : ""
  );

  const handleSubmit = async () => {
    if (!editingInterior) {
      const duplicate = interiors.find(
        (interior) =>
          interior[0].toLowerCase().trim() === name.toLowerCase().trim()
      );

      if (duplicate) {
        alert("Already data present");
        setDialogOpen(false);
        setEditingInterior(null);
        setRefresh(!refresh);
        return;
      }
    }

    const url = editingInterior
      ? "https://sheeladecor.netlify.app/.netlify/functions/server/updatepaintsinteriordata"
      : "https://sheeladecor.netlify.app/.netlify/functions/server/sendpaintsinteriordata";

    try {
      const response = await fetchWithLoading(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, phonenumber, address }),
      });

      if (response.status === 200) {
        alert(
          editingInterior
            ? "Interior updated successfully"
            : "Interior added successfully"
        );

        const updatedInteriors = await fetchInteriors();
        const now = Date.now();

        if (Array.isArray(updatedInteriors)) {
          dispatch(setInteriorData(updatedInteriors));
          localStorage.setItem(
            "interiorData",
            JSON.stringify({ data: updatedInteriors, time: now })
          );
        }

        setDialogOpen(false);
        setEditingInterior(null);
        setRefresh(!refresh);
        navigate("/masters/interiors");
      } else {
        alert("Error saving interior");
      }
    } catch (error) {
      console.error("Error saving interior:", error);
      alert("Error saving interior");
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white p-6 rounded shadow-md w-full border">
          <h2 className="text-xl font-bold mb-4">
            {editingInterior ? "Edit Interior" : "Add Interior"}
          </h2>

          <input
            className={`${
              editingInterior ? "hidden" : ""
            } border p-2 rounded w-full mb-2`}
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="border p-2 rounded w-full mb-2"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            className="border p-2 rounded w-full mb-2"
            placeholder="Phone Number"
            value={phonenumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
          />
          <input
            className="border p-2 rounded w-full mb-2"
            placeholder="Address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />

          <div className="flex justify-end gap-2 mt-4">
            <button
              className="bg-gray-500 text-white px-4 py-2 rounded"
              onClick={() => {
                setDialogOpen(false);
                setEditingInterior(null);
                navigate("/masters/interiors");
              }}
            >
              Cancel
            </button>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded"
              onClick={handleSubmit}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default InteriorDialog;
