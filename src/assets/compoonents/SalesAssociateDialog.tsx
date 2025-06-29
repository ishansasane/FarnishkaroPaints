import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

interface SalesAssociateDialogProps {
  setDialogOpen: (open: boolean) => void;
  setRefresh: (state: boolean) => void;
  refresh: boolean;
  editingSalesAssociate: string[] | null;
  setEditingSalesAssociate: (salesAssociate: string[] | null) => void;
}

async function fetchSalesAssociates(): Promise<string[][]> {
  try {
    const response = await fetchWithLoading(
      "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/getsalesassociatedata",
      { credentials: "include" }
    );
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    return Array.isArray(data.body) ? data.body : [];
  } catch (error) {
    console.error("Error fetching sales associates:", error);
    return [];
  }
}

const SalesAssociateDialog: React.FC<SalesAssociateDialogProps> = ({
  setDialogOpen,
  setRefresh,
  refresh,
  editingSalesAssociate,
  setEditingSalesAssociate,
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const salesAssociates = useSelector(
    (state: RootState) => state.data.salesAssociates
  );

  const [name, setName] = useState(
    editingSalesAssociate ? editingSalesAssociate[0] : ""
  );
  const [email, setEmail] = useState(
    editingSalesAssociate ? editingSalesAssociate[1] : ""
  );
  const [phonenumber, setPhoneNumber] = useState(
    editingSalesAssociate ? editingSalesAssociate[2] : ""
  );
  const [address, setAddress] = useState(
    editingSalesAssociate ? editingSalesAssociate[3] : ""
  );

  const handleSubmit = async () => {
    // ✅ Duplicate check (only for Add mode)
    if (!editingSalesAssociate) {
      const duplicate = salesAssociates.find(
        (sa) => sa[0].toLowerCase().trim() === name.toLowerCase().trim()
      );
      if (duplicate) {
        alert("Already data present");
        setDialogOpen(false);
        setEditingSalesAssociate(null);
        setRefresh(!refresh);
        return;
      }
    }

    const url = editingSalesAssociate
      ? "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/updatesalesassociatedata"
      : "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/sendsalesassociatedata";

    try {
      const response = await fetchWithLoading(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, phonenumber, address }),
      });

      if (response.status === 200) {
        alert(
          editingSalesAssociate
            ? "Sales Associate updated successfully"
            : "Sales Associate added successfully"
        );

        const updatedData = await fetchSalesAssociates();
        const now = Date.now();

        if (Array.isArray(updatedData)) {
          dispatch(setSalesAssociateData(updatedData));
          localStorage.setItem(
            "salesAssociateData",
            JSON.stringify({ data: updatedData, time: now })
          );
        }

        setDialogOpen(false);
        setEditingSalesAssociate(null);
        setRefresh(!refresh);
        navigate("/masters/sales-associate");
      } else {
        alert("Error saving sales associate");
      }
    } catch (error) {
      console.error("Error saving sales associate:", error);
      alert("Error saving sales associate");
    }
  };

  return (
    <>
      {/* ✅ Background overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40"></div>

      {/* ✅ Dialog */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-md">
        <div className="bg-white p-6 rounded shadow-md w-full border">
          <h2 className="text-xl font-bold mb-4">
            {editingSalesAssociate
              ? "Edit Sales Associate"
              : "Add Sales Associate"}
          </h2>

          <input
            className={`${
              editingSalesAssociate ? "hidden" : ""
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
                setEditingSalesAssociate(null);
                navigate("/masters/sales-associate");
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

export default SalesAssociateDialog;
