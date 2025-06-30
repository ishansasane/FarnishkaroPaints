import React, { useState, useEffect } from "react";
import CustomerDetails from "./CustomerDetails";
import ProjectDetails from "./ProjectDetails";

function AddSitePage() {
  // State for CustomerDetails
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [projectData, setProjectData] = useState({});

  // State for ProjectDetails
  const [interior, setInterior] = useState("");
  const [interiorArray, setInteriorArray] = useState([]);
  const [salesAssociateArray, setSalesAssociateArray] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [projectReference, setProjectReference] = useState("");
  const [user, setUser] = useState(null);
  const [projectDate, setProjectDate] = useState("");
  const [additionalRequests, setAdditionalRequests] = useState("");
  const [projectAddress, setProjectAddress] = useState("");
  const [salesData, setSalesData] = useState({});

  // State for Payment Table
  const [paymentData, setPaymentData] = useState({
    totalValue: "",
    paid: "",
    due: 0,
  });

  // Calculate due whenever totalValue or paid changes
  useEffect(() => {
    const total = parseFloat(paymentData.totalValue) || 0;
    const paid = parseFloat(paymentData.paid) || 0;
    const due = total - paid;

    setPaymentData((prev) => ({
      ...prev,
      due: due > 0 ? due : 0, // Ensure due doesn't go negative
    }));
  }, [paymentData.totalValue, paymentData.paid]);

  const handlePaymentChange = (e) => {
    const { name, value } = e.target;
    setPaymentData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="space-y-6 p-4">
      {/* Customer Details Section */}
      <div className="bg-white p-6 rounded-xl shadow-none border border-gray-200">
        <CustomerDetails
          customers={customers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          projectData={projectData}
          setCustomers={setCustomers}
        />
      </div>

      {/* Project Details Section */}
      <div className="bg-white p-6 rounded-xl shadow-none border border-gray-200">
        <ProjectDetails
          selectedCustomer={selectedCustomer}
          interior={interior}
          setInterior={setInterior}
          salesdata={salesData}
          interiorArray={interiorArray}
          setInteriorArray={setInteriorArray}
          salesAssociateArray={salesAssociateArray}
          setSalesAssociateArray={setSalesAssociateArray}
          projectName={projectName}
          setProjectName={setProjectName}
          projectReference={projectReference}
          setProjectReference={setProjectReference}
          user={user}
          setUser={setUser}
          projectDate={projectDate}
          setProjectDate={setProjectDate}
          setAdditionalRequests={setAdditionalRequests}
          additionalRequests={additionalRequests}
          projectAddress={projectAddress}
          setProjectAddress={setProjectAddress}
          setSalesData={setSalesData}
        />
      </div>

      {/* Payment Table Section */}
      <div className="bg-white p-6 rounded-xl shadow-none border border-gray-200">
        <h3 className="text-lg font-medium mb-4">Payment Information</h3>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Total Value
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Paid
              </th>
              <th className="p-3 text-left text-sm font-medium text-gray-500">
                Due
              </th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-gray-200">
              <td className="p-3">
                <input
                  type="number"
                  name="totalValue"
                  value={paymentData.totalValue}
                  onChange={handlePaymentChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter total amount"
                />
              </td>
              <td className="p-3">
                <input
                  type="number"
                  name="paid"
                  value={paymentData.paid}
                  onChange={handlePaymentChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  placeholder="Enter paid amount"
                />
              </td>
              <td className="p-3">
                <div
                  className={`p-2 ₹{
                    paymentData.due > 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {paymentData.due.toFixed(2)}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Summary Section */}
        <div className="mt-4 flex justify-end">
          <div className="bg-gray-50 p-4 rounded-lg w-64">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Total:</span>
              <span>₹{parseFloat(paymentData.totalValue || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Paid:</span>
              <span>₹{parseFloat(paymentData.paid || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg">
              <span>Balance Due:</span>
              <span
                className={
                  paymentData.due > 0 ? "text-red-500" : "text-green-500"
                }
              >
                ₹{paymentData.due.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddSitePage;
