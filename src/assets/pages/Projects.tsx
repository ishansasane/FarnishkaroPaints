/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { Pencil, XCircle, Plus, Download } from "lucide-react";
import { Link } from "react-router-dom";
import { RootState } from "../Redux/store";
import { useDispatch, useSelector } from "react-redux";
import {
  setProjects,
  setTasks,
  setProjectFlag,
  setPaymentData,
} from "../Redux/dataSlice";
import EditProjects from "./EditProjects";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import ConfirmBox from "./ConfirmBox";
import BankDetails from "./BankDetails";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

// Define the type for a project
interface Project {
  id: number;
  projectName: string;
  customerName: string;
  status: string;
  amount: string;
  received: string;
  due: string;
  createdBy: string;
  date: string;
  quote: string;
  customerLink: any[];
  projectReference: string;
  totalAmount: number;
  totalTax: number;
  discount: number;
  projectDate: string;
  allData: any[];
  additionalItems: any[];
  interiorArray: string[];
  salesAssociateArray: string[];
  grandTotal: number;
  discountType: string;
}

// Status filter options
const statusFilters = [
  "All",
  "Approved",
  "Goods Pending",
  "Goods Complete",
  "Tailor Complete",
  "Tailor Pending",
  "Completed",
] as const;

export default function Projects() {
  const [projects, setprojects] = useState<Project[]>([]);
  const [filter, setFilter] = useState<(typeof statusFilters)[number]>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [index, setIndex] = useState(null);
  const [flag, setFlag] = useState(false);
  const [sendProject, setSendProject] = useState(null);
  const [taskData, setTaskData] = useState([]);
  const [Received, setReceived] = useState(0);
  const [discountType, setDiscountType] = useState("cash");

  const dispatch = useDispatch();
  const projectData = useSelector((state: RootState) => state.data.projects);
  const tasks = useSelector((state: RootState) => state.data.tasks);
  const projectFlag = useSelector((state: RootState) => state.data.projectFlag);
  const paymentData = useSelector((state: RootState) => state.data.paymentData);
  const [projectPayments, setProjectPayments] = useState([]);

  const [grandTotal, setGrandTotal] = useState(0);

  const fetchProjectData = async () => {
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

    if (!data.body || !Array.isArray(data.body)) {
      throw new Error("Invalid data format: Expected an array in data.body");
    }

    const parseSafely = (value: any, fallback: any) => {
      try {
        return typeof value === "string"
          ? JSON.parse(value)
          : value || fallback;
      } catch (error) {
        console.warn("Invalid JSON:", value, error);
        return fallback;
      }
    };

    const deepClone = (obj: any) => JSON.parse(JSON.stringify(obj));

    const fixBrokenArray = (input: any): string[] => {
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
            .map((item: string) => item.trim().replace(/^"+|"+$/g, ""));
          return cleaned;
        } catch {
          return [];
        }
      }
    };

    const projects = data.body.map((row: any[]) => ({
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
      bankDetails: deepClone(parseSafely(row[21], [])),
      termsConditions: deepClone(parseSafely(row[22], [])),
    }));

    return projects;
  };

  const [added, setAdded] = useState(false);

  const fetchPaymentData = async () => {
    const response = await fetch(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPayments"
    );
    const data = await response.json();
    return data.message;
  };

  const [deleted, setDeleted] = useState(false);

  // --- Fetch Projects ---
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const cached = localStorage.getItem("projectData");
        const now = Date.now();
        const cacheExpiry = 5 * 60 * 1000; // 5 minutes

        if (cached) {
          const parsed = JSON.parse(cached);

          const isCacheValid =
            parsed?.data?.length > 0 && now - parsed.time < cacheExpiry;

          if (isCacheValid) {
            dispatch(setProjects(parsed.data));
            setprojects(parsed.data);
            return;
          }
        }

        // If no valid cache, fetch fresh data
        const freshData = await fetchProjectData();

        if (Array.isArray(freshData)) {
          dispatch(setProjects(freshData));
          setprojects(freshData);
          localStorage.setItem(
            "projectData",
            JSON.stringify({ data: freshData, time: now })
          );
        } else {
          console.warn("Fetched project data is not an array:", freshData);
        }
      } catch (error) {
        console.error("Failed to fetch projects:", error);

        // Optional fallback to stale cache if fetch fails
        const fallbackCache = localStorage.getItem("projectData");
        if (fallbackCache) {
          const parsed = JSON.parse(fallbackCache);
          if (parsed?.data?.length > 0) {
            dispatch(setProjects(parsed.data));
            setprojects(parsed.data);
          }
        }
      }
    };

    fetchProjects();
  }, [dispatch, flag]);

  // --- Fetch Tasks ---
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const data = await fetchTaskData();
        dispatch(setTasks(data));
        setTaskData(data);
        setDeleted(false); // reset deleted after refreshing
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      }
    };

    if (!tasks.length || deleted) {
      fetchTasks();
    }
  }, [dispatch, tasks, deleted]);

  // --- Fetch Payments after Projects are available ---
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await fetchPaymentData();
        dispatch(setPaymentData(data));

        if (data && projectData?.length) {
          const projectWisePayments = projectData.map((project) => {
            const total = data
              .filter((item) => item[1] === project.projectName)
              .reduce((acc, curr) => {
                const amount = parseFloat(curr[2]);
                return acc + (isNaN(amount) ? 0 : amount);
              }, 0);
            return total;
          });

          setProjectPayments(projectWisePayments);
        }

        setAdded(true);
      } catch (error) {
        console.error("Failed to fetch payments:", error);
      }
    };

    fetchPayments();
  }, [dispatch, added, projectData]);

  // --- API fetching functions ---
  const fetchTaskData = async () => {
    const response = await fetch(
      "https://sheeladecor.netlify.app/.netlify/functions/server/gettasks"
    );
    const data = await response.json();
    return data.body || [];
  };

  const [filteredTasks, setTaskNames] = useState([]);

  const deleteTask = async (name: string) => {
    await fetch(
      "https://sheeladecor.netlify.app/.netlify/functions/server/deletetask",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ title: name }),
      }
    );
    setAdded(false);
  };

  // Status filter
  const filteredProjects = projectData.filter((proj) => {
    const statusMatch = filter === "All" || proj.status === filter;

    const searchMatch =
      searchQuery.trim() === "" ||
      (proj.projectName &&
        proj.projectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (proj.customerLink &&
        Array.isArray(proj.customerLink) &&
        proj.customerLink[0]
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase())) ||
      (proj.createdBy &&
        proj.createdBy.toLowerCase().includes(searchQuery.toLowerCase()));

    return statusMatch && searchMatch;
  });

  useEffect(() => {
    console.log(filteredProjects);
  });

  const deleteProject = async (name) => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/deletepaintsprojectdata",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({ projectName: name }),
        }
      );

      // Fetch tasks and delete related ones
      const taskData = await fetchTaskData();
      const filteredTaskNames = taskData
        .filter((task) => task[5] === name)
        .map((task) => task[0]);

      setTaskNames(filteredTaskNames);

      for (const taskName of filteredTaskNames) {
        await deleteTask(taskName);
      }

      if (response.status === 200) {
        alert("Project Deleted");

        // 1. Get current cache
        const cached = localStorage.getItem("projectData");
        let currentProjects = [];

        if (cached) {
          const parsed = JSON.parse(cached);
          if (Array.isArray(parsed.data)) {
            currentProjects = parsed.data;
          }
        }

        // 2. Remove deleted project from cache
        const updatedProjects = currentProjects.filter(
          (p) => p.projectName !== name
        );

        // 3. Update Redux and state
        dispatch(setProjects(updatedProjects));
        setprojects(updatedProjects);

        // 4. Update localStorage
        localStorage.setItem(
          "projectData",
          JSON.stringify({
            data: updatedProjects,
            time: Date.now(),
          })
        );
      } else {
        alert("Error");
      }
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Error: Network issue or server not responding");
    }
  };

  const [confirmBox, setConfirmBox] = useState(false);
  const [chosenProject, setChosenProject] = useState(false);

  const [Amount, setAmount] = useState(0);
  const [Tax, setTax] = useState(0);
  const [Discount, setDiscount] = useState(0);

  const setValues = (i) => {
    setTax(projectData[i].totalTax);
    setAmount(projectData[i].totalAmount);
    setDiscount(
      projectData[i].discount !== undefined ? projectData[i].discount : 0
    );
    setGrandTotal(projectData[i].grandTotal);
  };

  // PDF Generation Function
  const generatePDF = (project: any) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yOffset = 20;

    const primaryColor = [0, 51, 102];
    const secondaryColor = [33, 33, 33];
    const accentColor = [0, 102, 204];
    const lightGray = [245, 245, 245];

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setFillColor(...accentColor);
    doc.rect(0, 30, pageWidth, 1, "F");
    doc.setFontSize(14);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Quotation", pageWidth / 2, 18, { align: "center" });

    // Company Details
    yOffset += 15;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.text("Sheela Decor", 15, yOffset);
    yOffset += 5;
    doc.text("123 Business Street, City, Country", 15, yOffset);
    yOffset += 5;
    doc.text(
      "Email: contact@sheeladecor.com | Phone: +123 456 7890",
      15,
      yOffset
    );
    yOffset += 8;

    // Divider
    doc.setDrawColor(...accentColor);
    doc.setLineWidth(0.4);
    doc.line(15, yOffset, pageWidth - 15, yOffset);
    yOffset += 8;

    // Project and Customer Details
    const cleanAddress =
      typeof project.projectAddress === "string"
        ? project.projectAddress.replace(/^"(.*)"$/, "$1")
        : "N/A";
    const addressLines = doc.splitTextToSize(
      `Address: ${cleanAddress}`,
      pageWidth / 2 - 20
    );

    const detailBoxHeight = Math.max(25, 12 + addressLines.length * 5);
    doc.setFillColor(...lightGray);
    doc.roundedRect(15, yOffset, pageWidth - 30, detailBoxHeight, 2, 2, "F");

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("Project Details", 20, yOffset + 6);
    doc.text("Customer Details", pageWidth / 2 + 5, yOffset + 6);

    yOffset += 12;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);

    doc.text(`Project Name: ${project.projectName || "N/A"}`, 20, yOffset);
    doc.text(
      `Customer: ${
        Array.isArray(project.customerLink) && project.customerLink.length > 0
          ? project.customerLink[0]
          : "N/A"
      }`,
      pageWidth / 2 + 5,
      yOffset
    );
    yOffset += 5;

    addressLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2 + 5, yOffset);
      yOffset += 5;
    });

    doc.text(
      `Date: ${project.projectDate || new Date().toLocaleDateString()}`,
      20,
      yOffset
    );
    yOffset += 10;

    // Quotation Items Table
    const tableData: any[] = [];
    let srNo = 1;

    if (Array.isArray(project.allData)) {
      project.allData.forEach((selection: any) => {
        if (Array.isArray(selection.areacollection)) {
          tableData.push([
            {
              content: selection.area || "Unknown Area",
              colSpan: 9,
              styles: {
                fontStyle: "bold",
                fontSize: 9,
                fillColor: accentColor,
                textColor: [255, 255, 255],
              },
            },
          ]);
          selection.areacollection.forEach((collection: any) => {
            if (!Array.isArray(collection.items) || !collection.items.length)
              return;
            const item = collection.items[0];
            const qty = parseFloat(collection.quantities?.[0]) || 0;
            const measurementQty = parseFloat(
              collection.measurement?.quantity || "0"
            );
            const calculatedMRP = (item[4] * measurementQty).toFixed(2);
            tableData.push([
              srNo++,
              `${collection.productGroup?.[0] || "N/A"} * ${
                collection.measurement?.quantity || 0
              }`,
              collection.measurement?.width && collection.measurement?.height
                ? `${collection.measurement.width}x${
                    collection.measurement.height
                  } ${collection.measurement.unit || ""}`
                : "N/A",
              `INR ${calculatedMRP}`,
              qty.toString(),
              `INR ${(item[4] * measurementQty * qty).toFixed(2)}`,
              `${item[5] || "0"}%`,
              `INR ${collection.taxAmount?.[0]?.toFixed(2) || "0.00"}`,
              `INR ${collection.totalAmount?.[0]?.toFixed(2) || "0.00"}`,
            ]);
          });
        }
      });
    }

    if (
      Array.isArray(project.additionalItems) &&
      project.additionalItems.length > 0
    ) {
      tableData.push([
        {
          content: "Miscellaneous Items",
          colSpan: 9,
          styles: {
            fontStyle: "bold",
            fillColor: accentColor,
            textColor: [255, 255, 255],
            fontSize: 9,
          },
        },
      ]);
      project.additionalItems.forEach((item: any, index: number) => {
        const qty = parseFloat(item.quantity?.toString() || "0");
        const rate = parseFloat(item.rate?.toString() || "0");
        const netRate = parseFloat(item.netRate?.toString() || "0");
        const tax = parseFloat(item.tax?.toString() || "0");
        const taxAmount = parseFloat(item.taxAmount?.toString() || "0");
        const totalAmount = parseFloat(item.totalAmount?.toString() || "0");

        tableData.push([
          srNo++,
          item.name || `Miscellaneous Item ${index + 1}`,
          item.description || item.remark || "N/A",
          `INR ${rate.toFixed(2)}`,
          qty.toString(),
          `INR ${netRate.toFixed(2)}`,
          `${tax.toFixed(0)}%`,
          `INR ${taxAmount.toFixed(2)}`,
          `INR ${totalAmount.toFixed(2)}`,
        ]);
      });
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("Quotation Items", 15, yOffset);
    yOffset += 8;

    autoTable(doc, {
      startY: yOffset,
      head: [
        [
          "Sr. No.",
          "Item Name",
          "Description",
          "Rate",
          "Qty",
          "Net Rate",
          "Tax Rate",
          "Tax Amount",
          "Total",
        ],
      ],
      body:
        tableData.length > 0
          ? tableData
          : [
              [
                {
                  content: "No product data available.",
                  colSpan: 9,
                  styles: { halign: "center" },
                },
              ],
            ],
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: 1.5,
        textColor: secondaryColor,
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        overflow: "linebreak",
      },
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 9,
        halign: "center",
        cellPadding: 1.5,
      },
      alternateRowStyles: {
        fillColor: lightGray,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 38 },
        2: { cellWidth: 32 },
        3: { cellWidth: 22, halign: "right" },
        4: { cellWidth: 12, halign: "center" },
        5: { cellWidth: 22, halign: "right" },
        6: { cellWidth: 12, halign: "center" },
        7: { cellWidth: 12, halign: "right" },
        8: { cellWidth: 22, halign: "right" },
      },
      willDrawCell: (data) => {
        if (
          data.section === "body" &&
          (data.column.index === 1 || data.column.index === 2)
        ) {
          const text = data.cell.text.join(" ");
          if (text.length > 25) {
            data.cell.text = doc.splitTextToSize(text, data.cell.width - 3);
          }
        }
      },
    });

    // === Smart Summary Placement ===
    const summaryBoxHeight = 60;
    const tableEndY = (doc as any).lastAutoTable.finalY;
    const remainingSpace = pageHeight - tableEndY - 20;

    if (remainingSpace < summaryBoxHeight) {
      doc.addPage();
      yOffset = 20;
    } else {
      yOffset = tableEndY + 10;
    }

    doc.setFillColor(...lightGray);
    doc.roundedRect(pageWidth - 90, yOffset - 5, 75, 50, 2, 2, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("Summary", pageWidth - 85, yOffset);
    yOffset += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    const summaryItems = [
      {
        label: "Total Amount",
        value: `INR ${(project.totalAmount || 0).toFixed(2)}`,
      },
      { label: "Discount", value: `INR ${(project.discount || 0).toFixed(2)}` },
      {
        label: "Total Tax",
        value: `INR ${(project.totalTax || 0).toFixed(2)}`,
      },
      {
        label: "Grand Total",
        value: `INR ${(project.totalAmount || 0).toFixed(2)}`,
      },
    ];
    summaryItems.forEach((item) => {
      doc.setFont("helvetica", "bold");
      doc.text(item.label, pageWidth - 85, yOffset);
      doc.setFont("helvetica", "normal");
      doc.text(item.value, pageWidth - 20, yOffset, { align: "right" });
      yOffset += 8;
    });

    // Terms & Conditions (Skip any standalone date lines)
    if (
      typeof project.additionalRequests === "string" &&
      project.additionalRequests.trim()
    ) {
      if (yOffset + 30 > pageHeight - 50) {
        doc.addPage();
        yOffset = 20;
      }
      yOffset += 5;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(...primaryColor);
      doc.text("Terms & Conditions", 15, yOffset);
      yOffset += 5;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.setTextColor(...secondaryColor);

      const terms = doc.splitTextToSize(
        project.additionalRequests,
        pageWidth - 30
      );
      const datePattern = /^\s*\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\s*$/;

      terms.forEach((term: string) => {
        if (datePattern.test(term.trim())) return;
        if (yOffset + 5 > pageHeight - 50) {
          doc.addPage();
          yOffset = 20;
        }
        doc.text(`• ${term}`, 15, yOffset);
        yOffset += 5;
      });
    }

    // Footer
    if (yOffset + 20 > pageHeight - 50) {
      doc.addPage();
      yOffset = 20;
    }
    doc.setFillColor(...accentColor);
    doc.rect(0, pageHeight - 25, pageWidth, 1, "F");
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Thank you for choosing Sheela Decor!",
      pageWidth / 2,
      pageHeight - 15,
      { align: "center" }
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      "Sheela Decor - All Rights Reserved",
      pageWidth / 2,
      pageHeight - 8,
      { align: "center" }
    );

    const safeProjectName = (project.projectName || "Project").replace(
      /[^a-zA-Z0-9]/g,
      "_"
    );
    const safeDate = (
      project.projectDate || new Date().toLocaleDateString()
    ).replace(/[^a-zA-Z0-9]/g, "_");
    doc.save(`Quotation_${safeProjectName}_${safeDate}.pdf`);
  };

  const [paidAmount, setPaidAmount] = useState(0);

  return (
    <div className={`md:!p-6 p-2 md:mt-0 mt-20 h-screen bg-gray-50`}>
      <div className={`flex justify-between flex-wrap items-center mb-4`}>
        <h1 className="text-2xl font-bold">Projects</h1>
        <div className="flex gap-2">
          <Link to="/add-project">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 !rounded-md">
              <Plus size={18} /> Add Project
            </button>
          </Link>
          <Link to="/add-site">
            <button className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 !rounded-md">
              <Plus size={18} /> Add Site
            </button>
          </Link>
        </div>
      </div>
      <div className="bg-white md:!p-6 p-2 mt-5 md:mt-0 rounded-md shadow overflow-x-auto">
        <div className={`${flag ? "hidden" : ""} mb-4 flex gap-4`}>
          <select
            value={filter}
            onChange={(e) =>
              setFilter(e.target.value as (typeof statusFilters)[number])
            }
            className="border px-3 py-2 rounded-md"
          >
            {statusFilters.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Search projects..."
            className="border px-3 py-2 rounded-md"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <table className={`${flag ? "hidden" : ""} w-full`}>
          <thead className="bg-sky-50">
            <tr>
              <th className="px-4 py-2">Project Name</th>
              <th className="px-4 py-2">Customer Name</th>
              <th className="px-4 py-2">Amount</th>
              <th className="px-4 py-2">Received</th>
              <th className="px-4 py-2">Due</th>
              <th className="px-4 py-2">Created By</th>
              <th className="px-4 py-2">Deadline Date</th>
              <th className="px-4 py-2">Created On</th>
              <th className="px-4 py-2">Quote</th>
              <th className="px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProjects.map((project, index) => (
              <tr key={index} className="hover:bg-sky-50">
                <td
                  onClick={() => {
                    setValues(index);
                    setIndex(index);
                    setSendProject(project);
                    setDiscountType(project.discountType);
                    setFlag(true);
                  }}
                  className="px-4 py-2"
                >
                  {project.projectName}
                </td>
                <td
                  onClick={() => {
                    setValues(index);
                    setIndex(index);
                    setSendProject(project);
                    setDiscountType(project.discountType);
                    setFlag(true);
                  }}
                  className="px-4 py-2"
                >
                  {project.customerLink ? project.customerLink[0] : ""}
                </td>
                <td
                  onClick={() => {
                    setValues(index);
                    setIndex(index);
                    setSendProject(project);
                    setDiscountType(project.discountType);
                    setFlag(true);
                  }}
                  className="px-4 py-2"
                >
                  {project.grandTotal}
                </td>
                <td
                  onClick={() => {
                    setValues(index);
                    setIndex(index);
                    setSendProject(project);
                    setDiscountType(project.discountType);
                    setFlag(true);
                  }}
                  className="px-4 py-2"
                >
                  {projectPayments[index]}
                </td>
                <td
                  onClick={() => {
                    setValues(index);
                    setIndex(index);
                    setSendProject(project);
                    setDiscountType(project.discountType);
                    setFlag(true);
                  }}
                  className="px-4 py-2"
                >
                  {(project.grandTotal - (projectPayments[index] || 0)).toFixed(
                    2
                  )}
                </td>
                <td
                  onClick={() => {
                    setValues(index);
                    setIndex(index);
                    setSendProject(project);
                    setDiscountType(project.discountType);
                    setFlag(true);
                  }}
                  className="px-4 py-2"
                >
                  {project.createdBy}
                </td>
                <td
                  onClick={() => {
                    setValues(index);
                    setIndex(index);
                    setSendProject(project);
                    setDiscountType(project.discountType);
                    setFlag(true);
                  }}
                  className="px-4 py-2"
                >
                  {project.projectDate}
                </td>
                <td
                  onClick={() => {
                    setValues(index);
                    setIndex(index);
                    setSendProject(project);
                    setDiscountType(project.discountType);
                    setFlag(true);
                  }}
                  className="px-4 py-2"
                >
                  {project.date}
                </td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => generatePDF(project)}
                    className="border px-2 py-1 rounded-md"
                  >
                    <Download size={16} />
                  </button>
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setValues(index);
                        setIndex(index);
                        setSendProject(project);
                        setDiscountType(project.discountType);
                        setFlag(true);
                      }}
                      className="border px-2 py-1 rounded-md"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => {
                        setChosenProject(project);
                        setConfirmBox(true);
                      }}
                      className="border px-2 py-1 rounded-md"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {flag && (
          <EditProjects
            projectData={sendProject}
            index={index}
            goBack={() => {
              setFlag(false);
              dispatch(setProjectFlag(false));
            }}
            tasks={taskData}
            projects={filteredProjects}
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
        {confirmBox && (
          <ConfirmBox
            setConfirmBox={setConfirmBox}
            deleteProject={deleteProject}
            project={chosenProject}
          />
        )}
      </div>
    </div>
  );
}
