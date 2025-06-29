import { Target } from "lucide-react";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setInteriorData, setSalesAssociateData } from "../../Redux/dataSlice";

const EditProjectDetails = ({
  selectedCustomer,
  interior,
  salesdata,
  interiorArray,
  setInteriorArray,
  salesAssociateArray,
  setSalesAssociateArray,
  projectName,
  setProjectName,
  projectReference,
  setProjectReference,
  user,
  setUser,
  projectDate,
  setProjectDate,
  setAdditionalRequests,
  additionalRequests,
  projectData,
  setsalesdata,
}) => {
  async function fetchInteriors() {
    try {
      const response = await fetch(
        "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/getinteriordata",
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return data.body || [];
    } catch (error) {
      console.error("Error fetching interiors:", error);
      return [];
    }
  }

  async function fetchSalesAssociates() {
    try {
      const response = await fetch(
        "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/getsalesassociatedata",
        {
          credentials: "include",
        }
      );
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const data = await response.json();
      return Array.isArray(data.body) ? data.body : [];
    } catch (error) {
      console.error("Error fetching sales associates:", error);
      return [];
    }
  }

  const [isOpen, setIsOpen] = useState(false);
  const [isSalesOpen, setIsSalesOpen] = useState(false);
  const dispatch = useDispatch();
  const [interiorData, setInterior] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [salesname, salesSetName] = useState("");
  const [salesemail, salesSetEmail] = useState("");
  const [salesphonenumber, salesSetPhoneNumber] = useState("");
  const [salesaddress, salesSetAddress] = useState("");

  const handleSubmit = async () => {
    const url =
      "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/sendinteriordata";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, phonenumber, address }),
    });

    if (response.status === 200) {
      const data = await fetchInteriors();
      dispatch(setInteriorData(data));
      setInterior(data);
      localStorage.setItem(
        "interiorData",
        JSON.stringify({ data, time: Date.now() })
      );
      setName("");
      setEmail("");
      setPhoneNumber("");
      setAddress("");
      setIsOpen(false);
      alert("Interior added successfully");
    } else {
      alert("Error saving interior");
    }
  };

  const handleSalesSubmit = async () => {
    const url =
      "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/sendsalesassociatedata";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        name: salesname,
        email: salesemail,
        phonenumber: salesphonenumber,
        address: salesaddress,
      }),
    });

    if (response.status === 200) {
      const data = await fetchSalesAssociates();
      dispatch(setSalesAssociateData(data));
      setsalesdata(data);
      localStorage.setItem(
        "salesAssociateData",
        JSON.stringify({ data, time: Date.now() })
      );
      salesSetName("");
      salesSetEmail("");
      salesSetPhoneNumber("");
      salesSetAddress("");
      setIsSalesOpen(false);
      alert("Sales Associate added successfully");
    } else {
      alert("Error saving sales associate");
    }
  };

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 rounded-xl shadow-xl w-full border-gray-200 border-2 mt-4">
      <p className="text-lg sm:text-xl font-semibold">Project Details</p>

      {/* Reference & Project Name */}
      <div className="flex flex-col sm:flex-row w-full gap-4">
        <div className="flex flex-col w-full sm:w-1/2">
          <p className="text-sm sm:text-base">
            Reference <span className="text-gray-500">(optional)</span>
          </p>
          <input
            type="text"
            className="border border-gray-300 p-2 rounded w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
            value={projectReference}
            onChange={(e) => setProjectReference(e.target.value)}
          />
        </div>
        <div className="flex flex-col w-full sm:w-1/2">
          <p className="text-sm sm:text-base">
            Project Name <span className="text-gray-500">(Unique name )</span>
          </p>
          <input
            type="text"
            className="border border-gray-300 p-2 rounded w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
            value={projectName}
            onChange={(e) => setProjectName(e.target.value)}
          />
        </div>
      </div>

      {/* Address */}
      {projectData.customerLink && (
        <div className="flex flex-col w-full">
          <p className="text-sm sm:text-base">Address</p>
          <input
            type="text"
            className="border border-gray-300 p-2 rounded w-full text-sm sm:text-base bg-gray-100"
            value={selectedCustomer[3] || ""}
            readOnly
          />
        </div>
      )}

      {/* Additional Requests */}
      {projectData.additionalRequests && (
        <div className="flex flex-col w-full">
          <p className="text-sm sm:text-base">
            Any Additional Requests{" "}
            <span className="text-gray-500">(optional)</span>
          </p>
          <textarea
            value={additionalRequests}
            onChange={(e) => setAdditionalRequests(e.target.value)}
            className="border border-gray-300 p-2 rounded w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-400 resize-y min-h-[100px]"
          />
        </div>
      )}

      {/* Dropdowns for Interior & Sales Associate */}
      <div className="flex flex-col sm:flex-row w-full gap-4">
        <div className="flex flex-col w-full sm:w-1/2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <p className="text-sm sm:text-base">Select Interior</p>
            <button
              className="flex items-center px-3 py-1 border border-blue-400 text-blue-500 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => setIsOpen(true)}
            >
              <FaPlus className="mr-2 text-blue-600" /> Add Interior
            </button>
          </div>
          <select
            className="border border-gray-300 p-2 rounded w-full text-sm sm:text-base opacity-80 focus:opacity-100 focus:ring-2 focus:ring-blue-400"
            value={interiorArray ? JSON.stringify(interiorArray) : ""}
            onChange={(e) =>
              setInteriorArray(e.target.value ? JSON.parse(e.target.value) : [])
            }
          >
            <option value="">Select Interior Name (optional)</option>
            {interior.map((data, index) => (
              <option key={index} value={JSON.stringify(data)}>
                {data[0]}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-col w-full sm:w-1/2">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
            <p className="text-sm sm:text-base">Select Sales Associate</p>
            <button
              className="flex items-center px-3 py-1 border border-blue-400 text-blue-500 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              onClick={() => setIsSalesOpen(true)}
            >
              <FaPlus className="mr-2 text-blue-600" /> Add Sales Associate
            </button>
          </div>
          <select
            className="border border-gray-300 p-2 rounded w-full text-sm sm:text-base opacity-80 focus:opacity-100 focus:ring-2 focus:ring-blue-400"
            value={
              salesAssociateArray ? JSON.stringify(salesAssociateArray) : ""
            }
            onChange={(e) =>
              setSalesAssociateArray(
                e.target.value ? JSON.parse(e.target.value) : []
              )
            }
          >
            <option value="">Select Sales Associate (optional)</option>
            {salesdata.map((data, index) => (
              <option key={index} value={JSON.stringify(data)}>
                {data[0]}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Select User & Project Deadline */}
      <div className="flex flex-col sm:flex-row w-full gap-4">
        <div className="flex flex-col w-full sm:w-1/2">
          <p className="text-sm sm:text-base">Select User</p>
          <input
            type="text"
            className="border border-gray-300 p-2 rounded w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
            value={user}
            onChange={(e) => setUser(e.target.value)}
          />
        </div>
        <div className="flex flex-col w-full sm:w-1/2">
          <p className="text-sm sm:text-base">Project Deadline</p>
          <input
            type="date"
            className="border border-gray-300 p-2 rounded w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
            value={projectDate}
            onChange={(e) => setProjectDate(e.target.value)}
          />
        </div>
      </div>

      {/* Interior Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl w-full max-w-xs sm:max-w-md">
            <h2 className="text-lg sm:text-xl font-bold mb-4">Add Interior</h2>
            <input
              className="border border-gray-300 p-2 rounded w-full mb-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border border-gray-300 p-2 rounded w-full mb-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="border border-gray-300 p-2 rounded w-full mb-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
              placeholder="Phone Number"
              value={phonenumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <input
              className="border border-gray-300 p-2 rounded w-full mb-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Associate Modal */}
      {isSalesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white p-4 sm:p-6 rounded-xl shadow-xl w-full max-w-xs sm:max-w-md">
            <h2 className="text-lg sm:text-xl font-bold mb-4">
              Add Sales Associate
            </h2>
            <input
              className="border border-gray-300 p-2 rounded w-full mb-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
              placeholder="Name"
              value={salesname}
              onChange={(e) => salesSetName(e.target.value)}
            />
            <input
              className="border border-gray-300 p-2 rounded w-full mb-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
              placeholder="Email"
              value={salesemail}
              onChange={(e) => salesSetEmail(e.target.value)}
            />
            <input
              className="border border-gray-300 p-2 rounded w-full mb-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
              placeholder="Phone Number"
              value={salesphonenumber}
              onChange={(e) => salesSetPhoneNumber(e.target.value)}
            />
            <input
              className="border border-gray-300 p-2 rounded w-full mb-3 text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
              placeholder="Address"
              value={salesaddress}
              onChange={(e) => salesSetAddress(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm sm:text-base"
                onClick={() => setIsSalesOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm sm:text-base"
                onClick={handleSalesSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditProjectDetails;
