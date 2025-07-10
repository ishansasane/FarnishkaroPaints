import React, { useEffect, useState } from "react";
import { FaTrash } from "react-icons/fa";
import { Edit } from "lucide-react";

// 🔧 SAME CLEANING LOGIC as your ProtectedRoute
const normalizePath = (path: string) => {
  if (path.length > 1 && path.endsWith("/")) return path.slice(0, -1);
  return path;
};

const cleanRoute = (route: string) => {
  try {
    const decoded = route.replace(/\\/g, "");
    return normalizePath(decoded);
  } catch {
    return route;
  }
};

interface PaymentsSectionProps {
  addPayment: boolean;
  setAddPayment: (val: boolean) => void;
  Amount: number;
  Tax: number;
  Received: number;
  Discount: number;
  paymentData: any[];
  deletePayment: (
    amount: string,
    date: string,
    mode: string,
    remarks: string
  ) => void;
  setNavState: (nav: string) => void;
  setEditPayments: (val: any) => void;
  setPaymentDate: (val: string) => void;
  setPaymentMode: (val: string) => void;
  setPayment: (val: string) => void;
  setPaymentRemarks: (val: string) => void;
  projectData: any;
  discountType: string;
}

const PaymentsSection: React.FC<PaymentsSectionProps> = ({
  addPayment,
  setAddPayment,
  Amount,
  Tax,
  Received,
  Discount,
  paymentData,
  deletePayment,
  setNavState,
  setEditPayments,
  setPaymentDate,
  setPaymentMode,
  setPayment,
  setPaymentRemarks,
  projectData,
  discountType,
}) => {
  const [canDeleteOrEdit, setCanDeleteOrEdit] = useState(false);

  const [paymentReceived, setPaymentReceived] = useState(0);

  useEffect(() => {
    if (!projectData?.projectName || !paymentData?.length) return;

    const total = paymentData
      .filter(payment => payment[1] === projectData.projectName)
      .reduce((sum, payment) => {
        const amount = parseFloat(payment[2]);
        return sum + (isNaN(amount) ? 0 : amount);
      }, 0);

    setPaymentReceived(total);
  }, [projectData.projectName, paymentData]);


  // ✅ Check if "/delete-payments" permission exists
  useEffect(() => {
    try {
      const raw = localStorage.getItem("allowed_routes");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          const cleaned = parsed.map(cleanRoute);
          setCanDeleteOrEdit(cleaned.includes("/delete-payments"));
        }
      }
    } catch (err) {
      console.error("❌ Failed to check /delete-payments permission:", err);
    }
  }, []);

  const editPaymentData = (data: any[]) => {
    setPayment(data[2]);
    setPaymentDate(data[3]);
    setPaymentMode(data[4]);
    setPaymentRemarks(data[5]);
    setEditPayments(data);
    setAddPayment(true);
  };

  return (
    <div
      className={`${
        addPayment ? "hidden" : ""
      } flex flex-col gap-3 mt-3 w-full`}
    >
      <p className="text-base sm:text-lg font-semibold mb-2">Payments</p>

      <div className="flex flex-col sm:flex-row w-full justify-between gap-3">
        <div className="border !rounded-lg w-full sm:w-1/4 p-3">
          <p className="text-gray-500 text-xs sm:text-sm">Total Amount</p>
          <p className="text-xs sm:text-sm">{(Math.round(Amount)).toLocaleString("en-IN")}</p>
        </div>
        <div className="border !rounded-lg w-full sm:w-1/4 p-3">
          <p className="text-gray-500 text-xs sm:text-sm">Payment Received</p>
          <p className="text-xs sm:text-sm">{(Math.round(paymentReceived)).toLocaleString("en-IN")}</p>
        </div>
        <div className="border !rounded-lg w-full sm:w-1/4 p-3">
          <p className="text-gray-500 text-xs sm:text-sm">Payment Due</p>
          <p className="text-xs sm:text-sm">{(Math.round(Amount - paymentReceived)).toLocaleString("en-IN")}</p>
        </div>
        <div className="border !rounded-lg w-full sm:w-1/4 p-3">
          <p className="text-gray-500 text-xs sm:text-sm">Discount</p>
          <p className="text-xs sm:text-sm">{(Math.round(Discount)).toLocaleString("en-IN") + ` in ${discountType}`}</p>
        </div>
      </div>

      <div className="flex flex-col w-full">
        <div className="flex flex-col sm:flex-row justify-between mt-2 gap-2">
          <p className="text-base sm:text-lg font-semibold">Received Payments</p>
          <button
            onClick={() => setAddPayment(true)}
            className="shadow-xl hover:bg-sky-700 bg-sky-600 text-white px-2 h-8 !rounded-lg text-xs sm:text-sm"
          >
            Add Payment
          </button>
        </div>

        <table className="w-full border border-gray-300 mt-2">
          <thead>
            <tr className="bg-gray-100 flex flex-col sm:flex-row hidden sm:flex">
              <th className="w-full sm:w-1/5 text-left p-2 text-xs sm:text-sm">Amount Received</th>
              <th className="w-full sm:w-1/5 text-left p-2 text-xs sm:text-sm">Received Date</th>
              <th className="w-full sm:w-1/5 text-left p-2 text-xs sm:text-sm">Payment Mode</th>
              <th className="w-full sm:w-1/5 text-left p-2 text-xs sm:text-sm">Remarks</th>
              <th className="w-full sm:w-1/5 text-left p-2 text-xs sm:text-sm">Options</th>
            </tr>
          </thead>
          <tbody>
            {paymentData
              ?.filter((data) => data[1] === projectData.projectName)
              .map((data, index) => (
                <tr key={index} className="border-t flex flex-col sm:flex-row">
                  <td className="w-full sm:w-1/5 p-2 text-xs sm:text-sm before:content-['Amount_Received:_'] sm:before:content-none before:font-bold before:pr-2">
                    {(Math.round(data[2])).toLocaleString("en-IN")}
                  </td>
                  <td className="w-full sm:w-1/5 p-2 text-xs sm:text-sm before:content-['Received_Date:_'] sm:before:content-none before:font-bold before:pr-2">
                    {data[3]}
                  </td>
                  <td className="w-full sm:w-1/5 p-2 text-xs sm:text-sm before:content-['Payment_Mode:_'] sm:before:content-none before:font-bold before:pr-2">
                    {data[4]}
                  </td>
                  <td className="w-full sm:w-1/5 p-2 text-xs sm:text-sm before:content-['Remarks:_'] sm:before:content-none before:font-bold before:pr-2">
                    {data[5]}
                  </td>
                  <td className="w-full sm:w-1/5 p-2 text-xs sm:text-sm before:content-['Options:_'] sm:before:content-none before:font-bold before:pr-2">
                    <div className="flex flex-row gap-2 items-center">
                      {canDeleteOrEdit && (
                        <>
                          <button onClick={() => editPaymentData(data)}>
                            <Edit size={18} />
                          </button>
                          <button
                            onClick={() =>
                              deletePayment(data[2], data[3], data[4], data[5])
                            }
                          >
                            <FaTrash className="text-red-500" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-row justify-between">
                <button  onClick={() => setNavState("Tailors")} style={{ borderRadius : "8px" }} className="!rounded-lg border px-2 h-8 bg-white">Back</button>
                <button onClick={() => setNavState("Tasks")} style={{ borderRadius : "8px" }} className="!rounded-lg text-white border px-2 h-8 bg-sky-600">Next</button>
              </div>
    </div>
  );
};

export default PaymentsSection;