import React from "react";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import {
  setCustomerData,
  setPaymentData,
  setProjects,
} from "../Redux/dataSlice";
import { Link } from "react-router-dom";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

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

const fetchPaymentData = async () => {
  const response = await fetchWithLoading(
    "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsPayments"
  );
  const data = await response.json();
  return data.message;
};

const fetchProjectData = async () => {
  const response = await fetchWithLoading(
    "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsprojectdata",
    {
      credentials: "include",
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  const data = await response.json();

  if (!data.body || !Array.isArray(data.body)) {
    throw new Error("Invalid data format: Expected an array in data.body");
  }

  const parseSafely = (value, fallback) => {
    try {
      return typeof value === "string" ? JSON.parse(value) : value || fallback;
    } catch (error) {
      console.warn("Invalid JSON:", value, error);
      return fallback;
    }
  };

  const deepClone = (obj) => JSON.parse(JSON.stringify(obj));

  const fixBrokenArray = (input) => {
    if (Array.isArray(input)) return input;
    if (typeof input !== "string") return [];

    try {
      const fixed = JSON.parse(input);
      if (Array.isArray(fixed)) return fixed;
      return [];
    } catch {
      try {
        const cleaned = input
          .replace(/^\[|\]$/g, "")
          .split(",")
          .map((item) => item.trim().replace(/^"+|"+$/g, ""));
        return cleaned;
      } catch {
        return [];
      }
    }
  };

  const projects = data.body.map((row) => ({
    projectName: row[0],
    customerLink: parseSafely(row[1], []),
    projectReference: row[2] || "",
    status: row[3] || "",
    totalAmount: parseFloat(row[4]) || 0,
    totalTax: parseFloat(row[5]) || 0,
    paid: parseFloat(row[6]) || 0,
    discount: parseFloat(row[7]) || 0,
    createdBy: row[8] || "",
    allData: deepClone(parseSafely(row[9], [])),
    projectDate: row[10] || "",
    additionalRequests: parseSafely(row[11], []),
    interiorArray: fixBrokenArray(row[12]),
    salesAssociateArray: fixBrokenArray(row[13]),
    additionalItems: deepClone(parseSafely(row[14], [])),
    goodsArray: deepClone(parseSafely(row[15], [])),
    tailorsArray: deepClone(parseSafely(row[16], [])),
    projectAddress: row[17],
    date: row[18],
    grandTotal: row[19],
    discountType: row[20],
  }));

  return projects;
};

const CustomerDashboard = ({
  customerDashboardData,
  setCustomerDashboardData,
  setCustomerDashboard,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [alternateNumber, setAlternateNumber] = useState("");
  const [address, setAddress] = useState("");
  const [projectData, setProjectData] = useState([]);
  const [duePayment, setDuePayment] = useState(0);
  const [receivedPayment, setReceivedPayment] = useState(0);
  const [activeOrders, setActiveOrders] = useState(0);
  const [receivedProjectsPayment, setReceivedProjectsPayment] = useState(0);
  const [perProjectPayment, setPerProjectPayments] = useState([]);
  const [companyName, setCompanyName] = useState("");
  const [GST, setGST] = useState("");
  const [payments, setPaymentsArray] = useState([]);

  const dispatch = useDispatch();
  const paymentData = useSelector((state) => state.data.paymentData);
  const projects = useSelector((state) => state.data.projects);

  useEffect(() => {
    setEmail(customerDashboardData[2]);
    setCustomerName(customerDashboardData[0]);
    setPhoneNumber(customerDashboardData[1]);
    setAlternateNumber(customerDashboardData[4]);
    setAddress(customerDashboardData[3]);
  }, [customerDashboardData]);

  useEffect(() => {
    const fetchAndCalculate = async () => {
      const now = Date.now();

      // Fetch Project Data
      let projectList = [];
      const cachedProjects = localStorage.getItem("projectData");

      if (cachedProjects) {
        const parsed = JSON.parse(cachedProjects);
        const timeDiff = now - parsed.time;

        if (timeDiff < 5 * 60 * 1000 && parsed.data.length > 0) {
          projectList = parsed.data;
          dispatch(setProjects(parsed.data));
        } else {
          try {
            const data = await fetchProjectData();
            projectList = data;
            dispatch(setProjects(data));
            localStorage.setItem(
              "projectData",
              JSON.stringify({ data, time: now })
            );
          } catch (error) {
            console.error("Failed to fetch projects:", error);
          }
        }
      } else {
        try {
          const data = await fetchProjectData();
          projectList = data;
          dispatch(setProjects(data));
          localStorage.setItem(
            "projectData",
            JSON.stringify({ data, time: now })
          );
        } catch (error) {
          console.error("Failed to fetch projects:", error);
        }
      }

      // Filter & Calculate Project Stats
      let filteredProjects = [];
      if (customerDashboardData[0]) {
        filteredProjects = projectList.filter(
          (p) => p.customerLink[0] === customerDashboardData[0]
        );
        setProjectData(filteredProjects);
        setActiveOrders(filteredProjects.length);

        let totalAmount = 0;
        let totalTax = 0;
        filteredProjects.forEach((p) => {
          totalTax += parseFloat(p.totalTax) || 0;
          totalAmount += parseFloat(p.totalAmount) || 0;
        });

        setDuePayment(totalAmount);
      }

      // Fetch Payment Data
      let paymentList = [];
      const cachedPayments = localStorage.getItem("paymentData");

      if (cachedPayments) {
        const parsed = JSON.parse(cachedPayments);
        const timeDiff = now - parsed.time;

        if (timeDiff < 5 * 60 * 1000 && parsed.data.length > 0) {
          paymentList = parsed.data;
          dispatch(setPaymentData(parsed.data));
        } else {
          try {
            const data = await fetchPaymentData();
            paymentList = data;
            dispatch(setPaymentData(data));
            localStorage.setItem(
              "paymentData",
              JSON.stringify({ data, time: now })
            );
          } catch (error) {
            console.error("Failed to fetch payments:", error);
          }
        }
      } else {
        try {
          const data = await fetchPaymentData();
          paymentList = data;
          dispatch(setPaymentData(data));
          localStorage.setItem(
            "paymentData",
            JSON.stringify({ data, time: now })
          );
        } catch (error) {
          console.error("Failed to fetch payments:", error);
        }
      }

      // Calculate Total & Per-Project Received Payments
      if (customerDashboardData[0] && filteredProjects.length) {
        let totalReceived = 0;
        const projectPayments = filteredProjects.map((project) => {
          const projectTotal = paymentList
            .filter(
              (payment) =>
                payment[1] === project.projectName &&
                payment[0] === customerDashboardData[0]
            )
            .reduce((sum, payment) => {
              const amount = parseFloat(payment[2]);
              return sum + (isNaN(amount) ? 0 : amount);
            }, 0);

          totalReceived += projectTotal;
          return projectTotal;
        });

        setReceivedPayment(totalReceived);
        setReceivedProjectsPayment(totalReceived);
        setPerProjectPayments(projectPayments);
      }
    };

    fetchAndCalculate();
  }, [dispatch, customerDashboardData]);

  async function sendpaintscustomerdata() {
    let date = undefined;
    const now = new Date();
    date = now.toISOString().slice(0, 16);

    const api =
      "https://sheeladecor.netlify.app/.netlify/functions/server/updatepaintscustomerdata";

    const response = await fetchWithLoading(api, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        name: customerName,
        phonenumber: phoneNumber,
        email: email,
        address: address,
        alternatenumber: alternateNumber,
        addedDate: date,
        companyName,
        GST,
      }),
    });

    if (response.status === 200) {
      const data = await fetchCustomers();
      dispatch(setCustomerData(data));
      localStorage.setItem(
        "customerData",
        JSON.stringify({ data, time: Date.now() })
      );
      alert("Customer Updated Successfully");
    } else {
      alert("Error in updating customer");
    }
  }

  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 md:p-8 min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800">
            {customerName}
          </h1>
          <div className="flex flex-row gap-2 text-xs sm:text-sm text-gray-600">
            <Link
              to="/"
              className="text-blue-600 hover:text-blue-800 !no-underline"
            >
              Dashboard
            </Link>
            <span>•</span>
            <Link
              to="/customers"
              onClick={() => setCustomerDashboard(false)}
              className="text-blue-600 hover:text-blue-800 !no-underline"
            >
              Customers
            </Link>
            <span>•</span>
            <span>{customerName}</span>
          </div>
        </div>
        <button
          className="px-3 py-1.5 sm:px-4 sm:py-2 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700 transition-colors"
          onClick={() => setCustomerDashboard(false)}
        >
          Cancel
        </button>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="flex flex-col border rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm sm:text-base text-sky-700 font-medium">
            Active Orders
          </p>
          <p className="text-base sm:text-lg font-semibold">{activeOrders}</p>
        </div>
        <div className="flex flex-col border rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm sm:text-base text-purple-600 font-medium">
            Total Value of Projects
          </p>
          <p className="text-base sm:text-lg font-semibold">
            ₹{Math.round(duePayment).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex flex-col border rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm sm:text-base text-green-600 font-medium">
            Payment Received
          </p>
          <p className="text-base sm:text-lg font-semibold">
            ₹{Math.round(receivedProjectsPayment).toLocaleString("en-IN")}
          </p>
        </div>
        <div className="flex flex-col border rounded-lg p-4 bg-white shadow-sm">
          <p className="text-sm sm:text-base text-red-500 font-medium">
            Payment Due
          </p>
          <p className="text-base sm:text-lg font-semibold">
            ₹
            {Math.round(duePayment - receivedProjectsPayment).toLocaleString(
              "en-IN"
            )}
          </p>
        </div>
      </div>

      {/* Projects Table Section */}
      <div className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-4">
          Projects
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full hidden md:table border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-600 text-sm">
                <th className="py-3 px-4 text-left">Project Name</th>
                <th className="py-3 px-4 text-left">Status</th>
                <th className="py-3 px-4 text-left">Amount</th>
                <th className="py-3 px-4 text-left">Received</th>
                <th className="py-3 px-4 text-left">Due</th>
                <th className="py-3 px-4 text-left">Date</th>
                <th className="py-3 px-4 text-left">Quote</th>
              </tr>
            </thead>
            <tbody>
              {projectData &&
                projectData.map((project, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-sm">{project.projectName}</td>
                    <td className="py-3 px-4 text-sm">{project.status}</td>
                    <td className="py-3 px-4 text-sm">
                      ₹{Math.round(project.totalAmount).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      ₹
                      {perProjectPayment != null &&
                        Math.round(perProjectPayment[index]).toLocaleString(
                          "en-IN"
                        )}
                    </td>
                    <td className="py-3 px-4 text-sm">
                      ₹
                      {Math.round(
                        project.totalAmount - perProjectPayment[index]
                      ).toLocaleString("en-IN")}
                    </td>
                    <td className="py-3 px-4 text-sm">{project.projectDate}</td>
                    <td className="py-3 px-4 text-sm">{project.quote}</td>
                  </tr>
                ))}
            </tbody>
          </table>
          {/* Mobile and Tablet View for Projects */}
          <div className="md:hidden flex flex-col gap-4">
            {projectData &&
              projectData.map((project, index) => (
                <div
                  key={index}
                  className="border rounded-lg p-4 bg-white shadow-sm"
                >
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <span className="font-medium text-gray-600">
                      Project Name
                    </span>
                    <span>{project.projectName}</span>
                    <span className="font-medium text-gray-600">Status</span>
                    <span>{project.status}</span>
                    <span className="font-medium text-gray-600">Amount</span>
                    <span>
                      ₹{Math.round(project.totalAmount).toLocaleString("en-IN")}
                    </span>
                    <span className="font-medium text-gray-600">Received</span>
                    <span>
                      ₹
                      {perProjectPayment != null &&
                        Math.round(perProjectPayment[index]).toLocaleString(
                          "en-IN"
                        )}
                    </span>
                    <span className="font-medium text-gray-600">Due</span>
                    <span>
                      ₹
                      {Math.round(
                        project.totalAmount - perProjectPayment[index]
                      ).toLocaleString("en-IN")}
                    </span>
                    <span className="font-medium text-gray-600">Date</span>
                    <span>{project.projectDate}</span>
                    <span className="font-medium text-gray-600">Quote</span>
                    <span>{project.quote}</span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Customer Details Section */}
      <div className="bg-white border rounded-lg p-4 sm:p-6 shadow-sm">
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-gray-800 mb-4">
          Customer Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">
              Customer <span className="text-red-600">*</span>
            </label>
            <input
              type="text"
              className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={customerName}
              readOnly
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Email</label>
            <input
              type="text"
              onChange={(e) => setEmail(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={email}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Phone Number</label>
            <input
              type="text"
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={phoneNumber}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">
              Alternate Phone Number
            </label>
            <input
              type="text"
              onChange={(e) => setAlternateNumber(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={alternateNumber}
            />
          </div>
          <div className="flex flex-col sm:col-span-2">
            <label className="text-sm text-gray-600 mb-1">Address</label>
            <input
              type="text"
              onChange={(e) => setAddress(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={address}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">Company Name</label>
            <input
              type="text"
              placeholder="Company Name"
              onChange={(e) => setCompanyName(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={companyName}
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm text-gray-600 mb-1">GST IN</label>
            <input
              type="text"
              placeholder="GST Number"
              onChange={(e) => setGST(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={GST}
            />
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            onClick={sendpaintscustomerdata}
            className="px-4 py-2 bg-sky-600 text-white text-sm rounded-lg hover:bg-sky-700 transition-colors"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomerDashboard;
