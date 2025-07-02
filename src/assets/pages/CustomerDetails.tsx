import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import AddCustomerDialog from "../compoonents/AddCustomerDialog";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../Redux/store";
import { setCustomerData } from "../Redux/dataSlice";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

const CustomerDetails = ({
  customers,
  selectedCustomer,
  setSelectedCustomer,
  projectData,
  setCustomers,
}) => {
  const handleCustomerChange = (e) => {
    if (e.target.value === "") {
      setSelectedCustomer(null);
    } else {
      const customerObj = JSON.parse(e.target.value);
      setSelectedCustomer(customerObj);
      projectData[0] = e.target.value;
    }
  };

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

  const [isOpen, setIsOpen] = useState(false);

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");
  const [email, setEmail] = useState("");

  const dispatch = useDispatch();
  const customerData = useSelector((state: RootState) => state.data.customers);

  async function sendcustomerData() {
    const phonenumber = mobile;
    let date = undefined;

    const now = new Date();
    date = now.toISOString().slice(0, 16);

    const api =
      "https://sheeladecor.netlify.app/.netlify/functions/server/sendpaintscustomerdata";

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

      // 2. Update local component state
      setCustomers(data);

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
      alert("Customer added successfully");
    } else {
      alert("Error in adding customer");
    }

    setIsOpen(false);
  }

  return (
    <div className="flex flex-col gap-3 px-3 py-3 rounded-xl shadow-xl w-full border-gray-200 border-2 mt-3">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
        Customer Details
      </h2>

      <div className="flex md:!flex-nowrap flex-wrap flex-row justify-between gap-2">
        {/* Select Customer */}
        <div className="flex  flex-col md:!w-1/2 w-full">
          <div className="flex flex-wrap flex-row gap-3 px-2">
            <p className="">Select Customer</p>
            <button
              className="mb-3 md:!text-[15px] !text-xs flex items-center px-2 py-1 border-1 border-blue-400 text-blue-500 font-semibold !rounded-xl hover:bg-blue-50 transition"
              onClick={() => setIsOpen(true)}
            >
              <span className="mr-2 flex justify-center w-6 h-6 border-2 border-blue-500 rounded-full text-lg leading-none text-blue-600">
                +
              </span>{" "}
              Customer
            </button>
          </div>
          <select
            className="border border-black p-2 rounded w-full opacity-50"
            value={selectedCustomer ? JSON.stringify(selectedCustomer) : ""}
            onChange={handleCustomerChange}
          >
            <option value="" className="">
              Select Customer
            </option>
            {Array.isArray(customers) &&
              customers.map((customer, index) => (
                <option key={index} value={JSON.stringify(customer)}>
                  {customer[0]}
                </option>
              ))}
          </select>
        </div>

        {/* Email Field */}
        {selectedCustomer && (
          <div className="flex flex-col md:!w-1/2 w-full">
            <p className="">Email (optional)</p>
            <input
              type="text"
              className="border p-2 rounded w-full"
              value={selectedCustomer[2]}
              readOnly
            />
          </div>
        )}
      </div>

      {/* Phone and Alternate Phone */}
      {selectedCustomer && (
        <div className="flex md:!flex-nowrap flex-wrap flex-row justify-between gap-2">
          <div className="flex flex-col md:!w-1/2 w-full">
            <p className="">Phone Number</p>
            <input
              type="text"
              className="border p-2 rounded w-full"
              value={selectedCustomer[1]}
              readOnly
            />
          </div>
          <div className="flex flex-col md:!w-1/2 w-full">
            <p className="">Alternate Phone Number (optional)</p>
            <input
              type="text"
              className="border p-2 rounded w-full"
              value={selectedCustomer[4]}
              readOnly
            />
          </div>
        </div>
      )}

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
          <div className="bg-transparent w-[300px] p-6 rounded-xl shadow-xl text-center">
            <div className="fixed inset-0 flex items-center justify-center bg-transparent bg-opacity-30 z-50">
              <div className="bg-white p-6 rounded shadow-md w-full max-w-md border">
                <h2 className="text-xl font-bold mb-4">{"Add Customer"}</h2>
                <input
                  className={` border p-2 rounded w-full mb-2`}
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
                      setIsOpen(false);
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
            <div className="w-full flex flex-row justify-between">
              <button
                style={{ borderRadius: "6px" }}
                className="px-2 py-1 text-white bg-sky-600 hover:bg-sky-700"
              >
                Add
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerDetails;
