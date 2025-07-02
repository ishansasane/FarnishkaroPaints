import React, { useState, useEffect } from "react";
import CustomerDetails from "./CustomerDetails";
import ProjectDetails from "./ProjectDetails";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

function AddSitePage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [projectData, setProjectData] = useState<any>({});
  const [interior, setInterior] = useState<string>("");
  const [interiorArray, setInteriorArray] = useState<any[]>([]);
  const [salesAssociateArray, setSalesAssociateArray] = useState<any[]>([]);
  const [projectName, setProjectName] = useState<string>("");
  const [projectReference, setProjectReference] = useState<string>("");
  const [user, setUser] = useState<any>(null);
  const [projectDate, setProjectDate] = useState<string>("");
  const [additionalRequests, setAdditionalRequests] = useState<string>("");
  const [projectAddress, setProjectAddress] = useState<string>("");
  const [salesData, setSalesData] = useState<any>([]);
  const [paymentData, setPaymentData] = useState<any>({
    totalValue: "",
    paid: "",
    due: 0,
  });

  // ✅ NEW: Fetch dropdown data on first load
  useEffect(() => {
    async function fetchInitialData() {
      try {
        // Fetch Customers
        const customerResponse = await fetchWithLoading(
          "https://sheeladecor.netlify.app/.netlify/functions/server/getcustomerdata",
          { credentials: "include" }
        );
        const customerJson = await customerResponse.json();
        if (Array.isArray(customerJson.body)) {
          setCustomers(customerJson.body);
        }

        // Fetch Interiors
        const interiorResponse = await fetchWithLoading(
          "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsinteriordata",
          { credentials: "include" }
        );
        const interiorJson = await interiorResponse.json();
        if (Array.isArray(interiorJson.body)) {
          setInterior(interiorJson.body);
        }

        // Fetch Sales Associates
        const salesResponse = await fetchWithLoading(
          "https://sheeladecor.netlify.app/.netlify/functions/server/getsalesassociatedata",
          { credentials: "include" }
        );
        const salesJson = await salesResponse.json();
        if (Array.isArray(salesJson.body)) {
          setSalesData(salesJson.body);
        }
      } catch (error) {
        console.error("❌ Error fetching initial dropdown data:", error);
      }
    }

    fetchInitialData();
  }, []);

  useEffect(() => {
    const total = parseFloat(paymentData.totalValue) || 0;
    const paid = parseFloat(paymentData.paid) || 0;
    const due = total - paid;

    setPaymentData((prev: any) => ({
      ...prev,
      due: due > 0 ? due : 0,
    }));
  }, [paymentData.totalValue, paymentData.paid]);

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPaymentData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProjectAndPayment = async () => {
    try {
      const amount = parseFloat(paymentData.totalValue || "0");
      const paidAmount = parseFloat(paymentData.paid || "0");

      const projectPayload = {
        projectName,
        customerLink: JSON.stringify(selectedCustomer),
        projectReference,
        status: "Active",
        totalAmount: amount,
        totalTax: 0,
        paid: paidAmount,
        discount: 0,
        createdBy: user,
        allData: JSON.stringify({}),
        projectDate,
        additionalRequests,
        interiorArray: JSON.stringify(interiorArray),
        salesAssociateArray: JSON.stringify(salesAssociateArray),
        additionalItems: JSON.stringify([]),
        goodsArray: JSON.stringify([]),
        tailorsArray: JSON.stringify([]),
        projectAddress: JSON.stringify(projectAddress),
        date: new Date().toISOString(),
        grandTotal: amount,
        discountType: "",
        bankDetails: JSON.stringify({}),
        termsConditions: JSON.stringify([]),
      };

      const projectResponse = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/sendpaintsprojectdata",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(projectPayload),
        }
      );

      if (projectResponse.ok) {
        alert("✅ Project saved successfully");

        const customerName = selectedCustomer?.Name || "NA";
        const project = projectName || "NA";
        const received = paidAmount || 0;
        const receivedDate =
          projectDate || new Date().toISOString().split("T")[0];
        const paymentMode = "Site Booking";
        const remarks = "Auto Created from Add Site Page";

        const paymentPayload = {
          customerName,
          Name: project,
          Received: received,
          ReceivedDate: receivedDate,
          PaymentMode: paymentMode,
          Remarks: remarks,
        };

        console.log("➡️ Sending Payment Payload:", paymentPayload);

        const paymentResponse = await fetchWithLoading(
          "https://sheeladecor.netlify.app/.netlify/functions/server/addPayment",
          {
            method: "POST",
            credentials: "include",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify(paymentPayload),
          }
        );

        if (paymentResponse.ok) {
          alert("✅ Payment Created Successfully");
        } else {
          const errorText = await paymentResponse.text();
          alert("❌ Payment creation failed: " + errorText);
        }
      } else {
        alert("❌ Project creation failed");
      }
    } catch (error) {
      console.error("Error during project and payment creation:", error);
      alert("❌ Error while saving project or payment.");
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Customer Details */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
        <CustomerDetails
          customers={customers}
          selectedCustomer={selectedCustomer}
          setSelectedCustomer={setSelectedCustomer}
          projectData={projectData}
          setCustomers={setCustomers}
        />
      </div>

      {/* Project Details */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
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

      {/* Payment Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200">
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
                  className={`p-2 ${
                    paymentData.due > 0 ? "text-red-500" : "text-green-500"
                  }`}
                >
                  {paymentData.due.toFixed(2)}
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Summary */}
        <div className="mt-4 flex justify-end">
          <div className="bg-gray-50 p-4 rounded-lg w-64">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Total:</span>
              <span>
                ₹{parseFloat(paymentData.totalValue || "0").toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="font-medium">Paid:</span>
              <span>₹{parseFloat(paymentData.paid || "0").toFixed(2)}</span>
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

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSaveProjectAndPayment}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Save Project & Create Payment
        </button>
      </div>
    </div>
  );
}

export default AddSitePage;
