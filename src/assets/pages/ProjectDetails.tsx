import { Target } from "lucide-react";
import React, { useState, useEffect } from "react";
import { FaPlus } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { setInteriorData, setSalesAssociateData } from "../Redux/dataSlice";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

const ProjectDetails = ({
  selectedCustomer,
  interior = [],
  salesdata = [],
  interiorArray = "",
  setInteriorArray,
  salesAssociateArray = "",
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
  projectAddress,
  setProjectAddress,
  setSalesData,
  setInterior,
}) => {
  // Debugging logs for props
  console.log("Props received:", {
    salesdata,
    interior,
    salesAssociateArray,
    interiorArray,
  });

  async function fetchInteriors() {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsinteriordata",
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
      console.error("Error fetching interiors:", error);
      return [];
    }
  }

  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phonenumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");

  const handleSubmit = async () => {
    const url =
      "https://sheeladecor.netlify.app/.netlify/functions/server/sendpaintsinteriordata";
    const response = await fetchWithLoading(url, {
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
      setIsOpen(false);
      setName("");
      setEmail("");
      setPhoneNumber("");
      setAddress("");
      alert("Interior added successfully");
    } else {
      alert("Error saving interior");
    }
  };

  const [isSalesOpen, setIsSalesOpen] = useState(false);

  async function fetchSalesAssociates() {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintssalesassociatedata",
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

  const [salesname, salesSetName] = useState("");
  const [salesemail, salesSetEmail] = useState("");
  const [salesphonenumber, salesSetPhoneNumber] = useState("");
  const [salesaddress, salesSetAddress] = useState("");

  const handleSalesSubmit = async () => {
    const url =
      "https://sheeladecor.netlify.app/.netlify/functions/server/sendpaintssalesassociatedata";
    const response = await fetchWithLoading(url, {
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
      setSalesData(data);
      localStorage.setItem(
        "salesAssociateData",
        JSON.stringify({ data, time: Date.now() })
      );
      setIsSalesOpen(false);
      salesSetName("");
      salesSetEmail("");
      salesSetPhoneNumber("");
      salesSetAddress("");
      alert("Sales Associate added successfully");
    } else {
      alert("Error saving sales associate");
    }
  };

  // Handle sales associate selection
  const handleSalesAssociateChange = (e) => {
    const selectedValue = e.target.value;
    console.log("Selected Sales Associate:", selectedValue);
    console.log("Previous salesAssociateArray:", salesAssociateArray);
    setSalesAssociateArray(selectedValue);
    console.log("New salesAssociateArray:", selectedValue);
  };

  // Handle interior selection
  const handleInteriorChange = (e) => {
    const selectedValue = e.target.value;
    console.log("Selected Interior:", selectedValue);
    console.log("Previous interiorArray:", interiorArray);
    setInteriorArray(selectedValue);
    console.log("New interiorArray:", selectedValue);
  };

  // Debug state changes
  useEffect(() => {
    console.log("salesAssociateArray updated:", salesAssociateArray);
  }, [salesAssociateArray]);

  useEffect(() => {
    console.log("interiorArray updated:", interiorArray);
  }, [interiorArray]);

  return (
    <div className="flex flex-col gap-3 w-full rounded-xl shadow-2xl border-2 border-gray-200 px-3 py-3 sm:px-4 md:px-6 lg:px-8">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
        Project Details
      </h2>

      {/* Reference & Project Name */}
      <div className="flex flex-col sm:flex-row w-full gap-2">
        <div className="flex flex-col w-full sm:w-1/2">
          <p className="text-sm sm:text-base">
            Project Name{" "}
            <span className="text-gray-500">(type a unique name)</span>
          </p>
          <input
            type="text"
            className="border p-2 rounded w-full text-sm sm:text-base"
            value={projectName || ""}
            onChange={(e) => setProjectName(e.target.value)}
            placeholder="Project Name"
          />
        </div>
        <div className="flex flex-col w-full sm:w-1/2">
          <p className="text-sm sm:text-base">
            Reference <span className="text-gray-500">(optional)</span>
          </p>

          <input
            type="text"
            className="border p-2 rounded w-full text-sm sm:text-base"
            value={projectReference || ""}
            onChange={(e) => setProjectReference(e.target.value)}
            placeholder="Reference"
          />
        </div>
      </div>

      {/* Address */}
      {selectedCustomer && (
        <div className="flex flex-col w-full gap-2">
          <div className="flex flex-col w-full">
            <p className="text-sm sm:text-base">Address</p>
            <input
              type="text"
              className="border p-2 rounded w-full text-sm sm:text-base"
              value={projectAddress || ""}
              onChange={(e) => setProjectAddress(e.target.value)}
              placeholder="Address"
            />
          </div>
        </div>
      )}

      {/* Additional Requests */}
      {selectedCustomer && (
        <div className="flex flex-col w-full gap-2">
          <div className="flex flex-col w-full">
            <p className="text-sm sm:text-base">
              Any Additional Requests{" "}
              <span className="text-gray-500">(optional)</span>
            </p>
            <textarea
              placeholder="Additional Requests"
              value={additionalRequests || ""}
              onChange={(e) => setAdditionalRequests(e.target.value)}
              className="border p-2 rounded w-full text-sm sm:text-base resize-y min-h-[100px]"
            />
          </div>
        </div>
      )}

      {/* Dropdowns for Interior & Sales Associate */}
      <div className="flex flex-col sm:flex-row w-full gap-2">
        <div className="flex flex-col w-full sm:w-1/2">
          <div className="flex flex-wrap flex-row gap-3 px-2 items-center">
            <p className="text-sm sm:text-base">Select Interior</p>
            <button
              className="mb-3 flex items-center md:!text-[15px] !text-xs px-2 py-1 border-1 border-blue-400 text-blue-500 font-semibold !rounded-xl hover:bg-blue-50 transition"
              onClick={() => setIsOpen(true)}
            >
              <span className="mr-2 flex justify-center w-6 h-6 border-2 border-blue-500 rounded-full text-lg leading-none text-blue-600">
                +
              </span>
              Interior
            </button>
          </div>
          <select
            className="border border-black p-2 rounded w-full text-sm sm:text-base"
            value={interiorArray}
            onChange={handleInteriorChange}
          >
            <option value="">Select Interior Name (optional)</option>
            {Array.isArray(interior) &&
              interior.map((data, index) => {
                const value = data.name || data[0] || "";
                return (
                  <option key={index} value={value}>
                    {value || "Unknown"}
                  </option>
                );
              })}
          </select>
        </div>

        <div className="flex flex-col w-full sm:w-1/2">
          <div className="flex flex-wrap flex-row gap-3 px-2 items-center">
            <p className="text-sm sm:text-base">Select Sales Associate</p>
            <button
              onClick={() => setIsSalesOpen(true)}
              className="mb-3 flex items-center md:!text-[15px] !text-xs px-2 py-1 border-1 border-blue-400 text-blue-500 font-semibold !rounded-xl hover:bg-blue-50 transition"
            >
              <span className="mr-2 flex justify-center w-6 h-6 border-2 border-blue-500 rounded-full text-lg leading-none text-blue-600">
                +
              </span>
              Sales Associate
            </button>
          </div>
          <select
            className="border border-black p-2 rounded w-full text-sm sm:text-base"
            value={salesAssociateArray}
            onChange={handleSalesAssociateChange}
          >
            <option value="">Select Sales Associate (optional)</option>
            {Array.isArray(salesdata) &&
              salesdata.map((data, index) => {
                const value = data.name || data[0] || "";
                return (
                  <option key={index} value={value}>
                    {value || "Unknown"}
                  </option>
                );
              })}
          </select>
        </div>
      </div>

      {/* Select User */}
      <div className="flex flex-col sm:flex-row w-full gap-2">
        <div className="flex flex-col w-full sm:w-1/2">
          <p className="text-sm sm:text-base">Select User</p>
          <input
            type="text"
            className="border p-2 rounded w-full text-sm sm:text-base"
            value={user || ""}
            onChange={(e) => setUser(e.target.value)}
            placeholder="User Name"
          />
        </div>
        <div className="flex flex-col w-full sm:w-1/2">
          <p className="text-sm sm:text-base">Project Deadline</p>
          <input
            type="date"
            className="border p-2 rounded w-full text-sm sm:text-base"
            value={projectDate || ""}
            onChange={(e) => setProjectDate(e.target.value)}
          />
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
          <div className="bg-white p-6 rounded shadow-md w-[90%] sm:w-[80%] md:w-[500px] border">
            <h2 className="text-xl font-bold mb-4">Add Interior</h2>
            <input
              className="border p-2 rounded w-full mb-2 text-sm sm:text-base"
              placeholder="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              className="border p-2 rounded w-full mb-2 text-sm sm:text-base"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              className="border p-2 rounded w-full mb-2 text-sm sm:text-base"
              placeholder="Phone Number"
              value={phonenumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
            />
            <input
              className="border p-2 rounded w-full mb-2 text-sm sm:text-base"
              placeholder="Address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm sm:text-base"
                onClick={() => {
                  setName("");
                  setEmail("");
                  setPhoneNumber("");
                  setAddress("");
                  setIsOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm sm:text-base"
                onClick={handleSubmit}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {isSalesOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
          <div className="bg-white p-6 rounded shadow-md w-[90%] sm:w-[80%] md:w-[500px] border">
            <h2 className="text-xl font-bold mb-4">Add Sales Associate</h2>
            <input
              className="border p-2 rounded w-full mb-2 text-sm sm:text-base"
              placeholder="Name"
              value={salesname}
              onChange={(e) => salesSetName(e.target.value)}
            />
            <input
              className="border p-2 rounded w-full mb-2 text-sm sm:text-base"
              placeholder="Email"
              value={salesemail}
              onChange={(e) => salesSetEmail(e.target.value)}
            />
            <input
              className="border p-2 rounded w-full mb-2 text-sm sm:text-base"
              placeholder="Phone Number"
              value={salesphonenumber}
              onChange={(e) => salesSetPhoneNumber(e.target.value)}
            />
            <input
              className="border p-2 rounded w-full mb-2 text-sm sm:text-base"
              placeholder="Address"
              value={salesaddress}
              onChange={(e) => salesSetAddress(e.target.value)}
            />
            <div className="flex justify-end gap-2 mt-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded text-sm sm:text-base"
                onClick={() => {
                  salesSetName("");
                  salesSetEmail("");
                  salesSetPhoneNumber("");
                  salesSetAddress("");
                  setIsSalesOpen(false);
                }}
              >
                Cancel
              </button>
              <button
                className="bg-blue-500 text-white px-4 py-2 rounded text-sm sm:text-base"
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

// Error Boundary Component
class ProjectDetailsErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 text-red-500">
          <h2>Something went wrong in Project Details.</h2>
          <p>{this.state.error?.toString()}</p>
          <button
            className="mt-2 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => this.setState({ hasError: false, error: null })}
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const WrappedProjectDetails = (props) => (
  <ProjectDetailsErrorBoundary>
    <ProjectDetails {...props} />
  </ProjectDetailsErrorBoundary>
);

export default WrappedProjectDetails;
