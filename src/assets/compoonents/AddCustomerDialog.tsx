import { EditIcon } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { setCustomerData } from "../Redux/dataSlice";
import { useNavigate } from "react-router-dom";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

interface Customer {
  name: string;
  mobile: string;
  address: string;
}

interface AddCustomerDialogProps {
  setDialogOpen: (open: boolean) => void;
  setCustomers: (callback: (prev: Customer[]) => Customer[]) => void;
  editing: string[] | null;
  setEditing: (value: string[] | null) => void;
}

async function fetchCustomers() {
  try {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintscustomerdata",
      { credentials: "include" }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data.body) ? data.body : [];
  } catch (error) {
    console.error("Error fetching customer data:", error);
    return [];
  }
}

const AddCustomerDialog: React.FC<AddCustomerDialogProps> = ({
  setDialogOpen,
  setCustomers,
  editing,
  setEditing,
}) => {
  const navigate = useNavigate();
  const [name, setName] = useState(editing ? editing[0] : "");
  const [mobile, setMobile] = useState(editing ? editing[1] : "");
  const [address, setAddress] = useState(editing ? editing[3] : "");
  const [alternateNumber, setAlternateNumber] = useState(
    editing ? editing[4] : ""
  );
  const [email, setEmail] = useState(editing ? editing[2] : "");

  const dispatch = useDispatch();
  const customerData = useSelector((state: RootState) => state.data.customers);

  async function sendcustomerData() {
    const phonenumber = mobile;
    let date = undefined;

    if (!editing) {
      const now = new Date();
      date = now.toISOString().slice(0, 16);
    }

    if (editing) {
      setName(editing[0]);
    }

    const api = editing
      ? "https://sheeladecor.netlify.app/.netlify/functions/server/updatepaintscustomerdata"
      : "https://sheeladecor.netlify.app/.netlify/functions/server/sendpaintscustomerdata";

    const response = await fetchWithLoading(api, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name,
        phonenumber,
        email,
        address,
        alternatenumber: alternateNumber,
        addedDate: date,
      }),
    });

    if (response.status === 200) {
      const data = await fetchCustomers();

      // 1. Update Redux store
      dispatch(setCustomerData(data));

      // 3. Update localStorage cache
      localStorage.setItem(
        "customerData",
        JSON.stringify({ data, time: Date.now() })
      );

      // 4. Clear form
      setName("");
      setAddress("");
      setMobile("");
      setEmail("");
      setAlternateNumber("");

      // 5. Show success
      alert(
        editing
          ? "Customer Updated Successfully"
          : "Customer added successfully"
      );
    } else {
      alert(
        editing ? "Error in updating customer" : "Error in adding customer"
      );
    }

    if (!editing) {
      navigate("/customers");
    }
    setEditing(null);
    setDialogOpen(false);
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-30 z-50">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md border">
        <h2 className="text-xl font-bold mb-4">
          {editing ? "Edit Customer" : "Add Customer"}
        </h2>
        <input
          className={`${
            editing ? "hidden" : ""
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
          placeholder="Mobile Number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full mb-2"
          placeholder="Address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />
        <input
          className="border p-2 rounded w-full mb-2"
          placeholder="Alternate Number"
          value={alternateNumber}
          onChange={(e) => setAlternateNumber(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={() => {
              if (!editing) {
                navigate("/customers");
              }
              setEditing(null);
              setDialogOpen(false);
            }}
          >
            Cancel
          </button>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded"
            onClick={sendcustomerData}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddCustomerDialog;
