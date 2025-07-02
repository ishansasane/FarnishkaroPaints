import { useEffect, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { RootState } from "../Redux/store";
import {
  setPaymentData,
  setProjects,
  setProjectFlag,
  setTasks,
} from "../Redux/dataSlice";
import { useDispatch, useSelector } from "react-redux";
import EditProjects from "./EditProjects";
import BankDetails from "./BankDetails";
import TermsAndConditions from "./TermsAndConditions";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

function Reports() {
  const dispatch = useDispatch();

  // Utility function for safe data parsing
  const parseSafely = (value: any, fallback: any) => {
    try {
      if (value === null || value === undefined) return fallback;
      return typeof value === "string" ? JSON.parse(value) : value || fallback;
    } catch (error) {
      console.warn("Invalid JSON:", value, error);
      return fallback;
    }
  };

  // Utility function for deep cloning
  const deepClone = (obj: any) => {
    try {
      return JSON.parse(JSON.stringify(obj));
    } catch (error) {
      console.warn("Deep clone failed:", error);
      return Array.isArray(obj) ? [] : {};
    }
  };

  // Utility function to fix broken arrays
  const fixBrokenArray = (input: any): string[] => {
    if (Array.isArray(input)) return input;
    if (input === null || input === undefined) return [];

    try {
      if (typeof input === "string") {
        // Handle empty string or malformed JSON
        if (input.trim() === "") return [];

        // Try parsing as JSON first
        try {
          const parsed = JSON.parse(input);
          if (Array.isArray(parsed)) return parsed;
        } catch (e) {
          // If JSON parsing fails, try splitting the string
          const cleaned = input
            .replace(/^\[|\]$/g, "")
            .split(",")
            .map((item: string) => item.trim().replace(/^"+|"+$/g, ""));
          return cleaned.filter((item: string) => item !== "");
        }
      }
      return [];
    } catch (error) {
      console.warn("Array fixing failed:", error);
      return [];
    }
  };

  // Safe data fetching for projects
  const fetchProjectData = async () => {
    try {
      const response = await fetch(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsprojectdata",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Validate response structure
      if (!data || !data.body) {
        console.warn("No data.body in API response");
        return [];
      }

      // Ensure data.body is an array
      if (!Array.isArray(data.body)) {
        console.warn("data.body is not an array");
        return [];
      }

      // Safely transform each project row
      const projects = data.body.map((row: any[]) => {
        try {
          return {
            projectName: row[0] || "",
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
            projectAddress: row[17] || "",
            date: row[18] || "",
            grandTotal: parseFloat(row[19]) || 0,
            discountType: row[20] || "cash",
          };
        } catch (error) {
          console.warn("Error processing project row:", row, error);
          return {
            projectName: "",
            customerLink: [],
            projectReference: "",
            status: "",
            totalAmount: 0,
            totalTax: 0,
            paid: 0,
            discount: 0,
            createdBy: "",
            allData: [],
            projectDate: "",
            additionalRequests: [],
            interiorArray: [],
            salesAssociateArray: [],
            additionalItems: [],
            goodsArray: [],
            tailorsArray: [],
            projectAddress: "",
            date: "",
            grandTotal: 0,
            discountType: "cash",
          };
        }
      });

      return projects.filter((project) => project.projectName); // Filter out empty projects
    } catch (error) {
      console.error("Failed to fetch projects:", error);
      return [];
    }
  };

  const [payments, setPayments] = useState<any[]>([]);
  const [projects, setProjectsData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("payments");

  const [searchCustomer, setSearchCustomer] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const projectData = useSelector((state: RootState) => state.data.projects);
  const paymentsData = useSelector(
    (state: RootState) => state.data.paymentData
  );
  const taskData = useSelector((state: RootState) => state.data.tasks);

  const [projectPayments, setProjectPayments] = useState<number[]>([]);

  // Safe task data fetching
  const fetchTaskData = async () => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintstasks"
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();

      // Validate response
      if (!data || !data.body) {
        console.warn("No data.body in tasks API response");
        return [];
      }

      return Array.isArray(data.body) ? data.body : [];
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
      return [];
    }
  };

  const [flag, setFlag] = useState(false);
  const [sendProject, setSendProject] = useState<any>(null);
  const [index, setIndex] = useState<number | null>(null);
  const [Tax, setTax] = useState(0);
  const [Amount, setAmount] = useState(0);
  const [Discount, setDiscount] = useState(0);
  const [grandTotal, setGrandTotal] = useState(0);
  const [discountType, setDiscountType] = useState("cash");
  const [paidAmount, setPaidAmount] = useState(0);

  // Safe task data fetching with caching
  useEffect(() => {
    const fetchAndSetTasks = async () => {
      try {
        const cached = localStorage.getItem("taskData");
        const now = Date.now();

        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            const timeDiff = now - parsed.time;

            if (
              timeDiff < 5 * 60 * 1000 &&
              parsed.data &&
              parsed.data.length > 0
            ) {
              const sortedTasks = parsed.data.sort(
                (a: any, b: any) =>
                  new Date(a[2]).getTime() - new Date(b[2]).getTime()
              );
              dispatch(setTasks(sortedTasks));
              return;
            }
          } catch (e) {
            console.warn("Failed to parse cached task data", e);
            localStorage.removeItem("taskData");
          }
        }

        const data = await fetchTaskData();
        if (data && data.length > 0) {
          const sorted = data.sort(
            (a: any, b: any) =>
              new Date(a[2]).getTime() - new Date(b[2]).getTime()
          );
          dispatch(setTasks(sorted));
          localStorage.setItem(
            "taskData",
            JSON.stringify({ data: sorted, time: now })
          );
        }
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
        setError("Failed to load tasks. Please try again later.");
      }
    };

    fetchAndSetTasks();
  }, [dispatch]);

  // Main data fetching effect
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const now = Date.now();

        // ---------- Handle Project Data ----------
        let projects: any[] = [];
        const cachedProjects = localStorage.getItem("projectData");

        if (cachedProjects) {
          try {
            const parsed = JSON.parse(cachedProjects);
            const timeDiff = now - parsed.time;

            if (
              timeDiff < 5 * 60 * 1000 &&
              parsed.data &&
              parsed.data.length > 0
            ) {
              projects = parsed.data;
              dispatch(setProjects(projects));
              setProjectsData(projects);
            } else {
              projects = await fetchProjectData();
              if (projects.length > 0) {
                dispatch(setProjects(projects));
                setProjectsData(projects);
                localStorage.setItem(
                  "projectData",
                  JSON.stringify({ data: projects, time: now })
                );
              }
            }
          } catch (e) {
            console.warn("Failed to parse cached projects", e);
            localStorage.removeItem("projectData");
            projects = await fetchProjectData();
            if (projects.length > 0) {
              dispatch(setProjects(projects));
              setProjectsData(projects);
              localStorage.setItem(
                "projectData",
                JSON.stringify({ data: projects, time: now })
              );
            }
          }
        } else {
          projects = await fetchProjectData();
          if (projects.length > 0) {
            dispatch(setProjects(projects));
            setProjectsData(projects);
            localStorage.setItem(
              "projectData",
              JSON.stringify({ data: projects, time: now })
            );
          }
        }

        // ---------- Handle Payments ----------
        try {
          const paymentRes = await fetchWithLoading(
            "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsPayments",
            {
              credentials: "include",
            }
          );

          if (paymentRes.ok) {
            const paymentData = await paymentRes.json();

            if (
              paymentData &&
              (paymentData.success === "true" || paymentData.message)
            ) {
              const validPayments = Array.isArray(paymentData.message)
                ? paymentData.message.filter((p: any) => p && p.length >= 3)
                : [];

              dispatch(setPaymentData(validPayments));
              setPayments(validPayments);

              // Calculate payment sums per project
              const paymentSums = projects.map((project) => {
                if (!project || !project.projectName) return 0;

                const totalPaid = validPayments
                  .filter(
                    (payment: any[]) =>
                      payment && payment[1] === project.projectName
                  )
                  .reduce(
                    (acc: number, payment: any[]) =>
                      acc + (parseFloat(payment[2]) || 0),
                    0
                  );
                return totalPaid;
              });

              setProjectPayments(paymentSums);
            } else {
              console.warn("Invalid payment data structure");
              dispatch(setPaymentData([]));
              setPayments([]);
              setProjectPayments(projects.map(() => 0));
            }
          } else {
            console.error("Failed to fetch payment data:", paymentRes.status);
            setError("Failed to load payment data. Please try again later.");
          }
        } catch (error) {
          console.error("Error fetching payments:", error);
          setError("Error loading payments. Please try again.");
        }

        setLoading(false);
      } catch (error) {
        console.error("Error in main data fetch:", error);
        setError("Failed to load data. Please refresh the page.");
        setLoading(false);
      }
    };

    fetchData();
  }, [dispatch, flag]);

  // Safe payment filtering
  const filteredPayments = (payments || []).filter((payment) => {
    if (!payment || payment.length < 4) return false;

    const [customer, , amount, date] = payment;

    // Validate payment structure
    if (typeof customer !== "string" || !date) return false;

    const matchCustomer = customer
      .toLowerCase()
      .includes(searchCustomer.toLowerCase());

    const matchDate =
      (!dateFrom || dayjs(date).isAfter(dayjs(dateFrom).subtract(1, "day"))) &&
      (!dateTo || dayjs(date).isBefore(dayjs(dateTo).add(1, "day")));

    return matchCustomer && matchDate;
  });

  // Safe total calculation
  const totalPaymentAmount = filteredPayments.reduce(
    (acc, curr) => acc + (parseFloat(curr[2]) || 0),
    0
  );

  // Safe project value calculation
  const totalProjectValue = projects.reduce((acc, proj) => {
    if (!proj) return acc;
    const projectValue = parseFloat(proj.grandTotal) || 0;
    return acc + projectValue;
  }, 0);

  // Safe advance calculation
  const totalAdvance = payments.reduce((acc, payment) => {
    if (!payment || payment.length < 3) return acc;

    const [, projectName, amount] = payment;
    const isInProjectList = projects.some(
      (proj) => proj && proj.projectName === projectName
    );
    return isInProjectList ? acc + (parseFloat(amount) || 0) : acc;
  }, 0);

  // Handle project click safely
  const handleProjectClick = (proj: any, idx: number) => {
    if (!proj) return;

    setPaidAmount(projectPayments[idx] || 0);
    setDiscountType(proj.discountType || "cash");
    setTax(proj.totalTax || 0);
    setAmount(proj.totalAmount || 0);
    setDiscount(proj.discount || 0);
    setGrandTotal(proj.grandTotal || 0);
    setSendProject(proj);
    setIndex(idx);
    setFlag(true);
  };

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className={`text-2xl font-bold mb-6 ${flag ? "hidden" : ""}`}>
        Reports Dashboard
      </h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className={`${flag ? "hidden" : ""} flex gap-4 mb-6 mt-10`}>
        <button
          onClick={() => setActiveTab("payments")}
          className={`px-4 py-2 rounded ${
            activeTab === "payments"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-300"
          }`}
        >
          Payments
        </button>
        <button
          onClick={() => setActiveTab("projects")}
          className={`px-4 py-2 rounded ${
            activeTab === "projects"
              ? "bg-blue-600 text-white"
              : "bg-white border border-gray-300"
          }`}
        >
          Projects
        </button>
      </div>

      {flag == false && loading ? (
        <div className="flex justify-center items-center h-64">
          <p>Loading data...</p>
        </div>
      ) : (
        <>
          {flag == false && activeTab === "payments" && (
            <>
              {/* Filters */}
              <div className="grid md:grid-cols-3 gap-4 mb-6">
                <input
                  type="text"
                  placeholder="Search by customer"
                  value={searchCustomer}
                  onChange={(e) => setSearchCustomer(e.target.value)}
                  className="border rounded px-4 py-2 w-full"
                />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="border rounded px-4 py-2 w-full"
                />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="border rounded px-4 py-2 w-full"
                />
              </div>

              {/* Summary */}
              <div className="mb-4 text-lg font-semibold">
                Total Payments: ₹{totalPaymentAmount.toLocaleString()}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {filteredPayments.length > 0 ? (
                  <table className="min-w-full bg-white border rounded shadow">
                    <thead>
                      <tr className="bg-gray-200 text-left">
                        <th className="px-4 py-2">Customer</th>
                        <th className="px-4 py-2">Project</th>
                        <th className="px-4 py-2">Amount</th>
                        <th className="px-4 py-2">Date</th>
                        <th className="px-4 py-2">Mode</th>
                        <th className="px-4 py-2">Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments.map((pay, idx) => (
                        <tr key={idx} className="border-t">
                          {pay.slice(0, 6).map((val, i) => (
                            <td key={i} className="px-4 py-2">
                              {val || "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="bg-white p-4 rounded shadow text-center">
                    No payment data available
                  </div>
                )}
              </div>
            </>
          )}

          {flag == false && activeTab === "projects" && (
            <>
              {/* Summary */}
              <div className="mb-4 text-lg font-semibold">
                Total Project Value: ₹{totalProjectValue.toLocaleString()} |
                Total Advance: ₹{totalAdvance.toLocaleString()}
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                {projects.length > 0 ? (
                  <table className="min-w-full bg-white border rounded shadow">
                    <thead>
                      <tr className="bg-gray-200 text-left">
                        <th className="px-4 py-2">Project Name</th>
                        <th className="px-4 py-2">Customer Name</th>
                        <th className="px-4 py-2">Total Amount</th>
                        <th className="px-4 py-2">Paid</th>
                        <th className="px-4 py-2">Due</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects.map((proj, idx) => (
                        <tr key={idx} className="border-t">
                          <td
                            onClick={() => handleProjectClick(proj, idx)}
                            className="px-4 py-2 cursor-pointer hover:text-blue-600"
                          >
                            {proj.projectName || "Unnamed Project"}
                          </td>
                          <td className="px-4 py-2">
                            {proj.customerLink?.[0] || "-"}
                          </td>
                          <td className="px-4 py-2">
                            ₹{(proj.grandTotal || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-2">
                            ₹{(projectPayments[idx] || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-2">
                            {(
                              (proj.grandTotal || 0) -
                              (projectPayments[idx] || 0)
                            ).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="bg-white p-4 rounded shadow text-center">
                    No project data available
                  </div>
                )}
              </div>
            </>
          )}
        </>
      )}
      {flag && sendProject && (
        <EditProjects
          projectData={sendProject}
          index={index}
          goBack={() => {
            setFlag(false);
            dispatch(setProjectFlag(false));
          }}
          tasks={taskData}
          projects={projectData}
          Tax={Tax}
          setTax={setTax}
          Amount={Amount}
          setAmount={setAmount}
          Discount={Discount}
          setDiscount={setDiscount}
          grandTotal={grandTotal}
          setGrandTotal={setGrandTotal}
          discountType={discountType}
          setDiscountType={setDiscountType}
          Paid={paidAmount}
          setPaid={setPaidAmount}
        />
      )}
    </div>
  );
}

export default Reports;
