import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import { setProjects, setPaymentData } from "../Redux/dataSlice";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

const DuePage = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const projects = useSelector((state: RootState) => state.data.projects);
  const paymentData = useSelector((state: RootState) => state.data.paymentData);

  const [projectData, setProjects] = useState([]);
  const [projectPayments, setProjectPayments] = useState([]);
  const [added, setAdded] = useState(false);

  const fetchProjectData = async () => {
    const response = await fetchWithLoading(
      "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/getprojectdata",
      { credentials: "include" }
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
        return typeof value === "string"
          ? JSON.parse(value)
          : value || fallback;
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
    }));

    return projects;
  };

  const fetchPaymentData = async () => {
    const response = await fetchWithLoading(
      "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/getPayments"
    );
    const data = await response.json();
    return data.message;
  };

  useEffect(() => {
    const now = Date.now();
    const cacheExpiry = 5 * 60 * 1000; // 5 minutes

    const loadProjectAndPaymentData = async () => {
      try {
        // === Handle Project Data ===
        let finalProjects = [];

        if (projects && projects.length > 0) {
          finalProjects = projects;
          setProjects(projects);
        } else {
          const cachedProjects = localStorage.getItem("projectData");

          if (cachedProjects) {
            const parsed = JSON.parse(cachedProjects);
            const isCacheValid =
              parsed?.data?.length > 0 && now - parsed.time < cacheExpiry;

            if (isCacheValid) {
              finalProjects = parsed.data;
              dispatch(setProjects(parsed.data));
              setProjects(parsed.data);
            }
          }

          if (finalProjects.length === 0) {
            const freshProjects = await fetchProjectData();
            if (Array.isArray(freshProjects)) {
              finalProjects = freshProjects;
              dispatch(setProjects(freshProjects));
              setProjects(freshProjects);
              localStorage.setItem(
                "projectData",
                JSON.stringify({ data: freshProjects, time: now })
              );
            } else {
              console.warn(
                "Fetched project data is not an array:",
                freshProjects
              );
            }
          }
        }

        // === Handle Payment Data ===
        let finalPayments = [];

        if (paymentData && paymentData.length > 0) {
          finalPayments = paymentData;
        } else {
          finalPayments = await fetchPaymentData();
          dispatch(setPaymentData(finalPayments));
        }

        // === Calculate Project-wise Payments and Combined Array ===
        if (finalPayments.length > 0 && finalProjects.length > 0) {
          const combinedArray = finalProjects.map((project) => {
            const totalAmount = parseFloat(
              project.totalAmount + project.totalTax
            );
            const discount = parseFloat(project.discount);
            const grandTotal = totalAmount - discount;

            const paymentsForProject = finalPayments.filter(
              (payment) => payment[1] === project.projectName
            );
            const totalPaid = paymentsForProject.reduce((sum, payment) => {
              const amount = parseFloat(payment[2]);
              return sum + (isNaN(amount) ? 0 : amount);
            }, 0);

            const balance = grandTotal - totalPaid;

            return [
              project.customerLink,
              project.projectName,
              grandTotal,
              totalPaid,
              balance,
            ];
          });

          setProjectPayments(combinedArray);
        }

        setAdded(true);
      } catch (error) {
        console.error("Failed to load project/payment data:", error);
      }
    };

    loadProjectAndPaymentData();
  }, [dispatch, added, paymentData, projects]);

  return (
    <div className="flex mt-2 flex-col items-center w-full min-h-screen p-4 sm:p-6">
      <div className="w-full max-w-7xl bg-white border rounded-xl p-4 sm:p-6">
        <div className="flex flex-wrap mt-2 flex-row justify-between items-center mb-4 sm:mb-6">
          <h1 className="text-lg sm:text-2xl font-semibold">Due Payments</h1>
          <button
            onClick={() => navigate("/")}
            className="px-3 py-2 text-sm sm:text-base text-white bg-sky-600 hover:bg-sky-700 !rounded-lg"
          >
            Dashboard
          </button>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm sm:text-base">
            <thead>
              <tr className="font-semibold text-gray-700">
                <th className="p-2 text-left">Customer Name</th>
                <th className="p-2 text-left">Project</th>
                <th className="p-theory2 text-left">Project Value</th>
                <th className="p-2 text-left">Paid Amount</th>
                <th className="p-2 text-left">Due Amount</th>
              </tr>
            </thead>
            <tbody>
              {projectPayments.map((payment, index) => (
                <tr key={index} className="hover:bg-sky-50">
                  <td className="p-2">{payment[0][0] || ""}</td>
                  <td className="p-2">{payment[1]}</td>
                  <td className="p-2">₹{payment[2].toLocaleString("en-IN")}</td>
                  <td className="p-2">₹{payment[3].toLocaleString("en-IN")}</td>
                  <td className="p-2">₹{payment[4].toLocaleString("en-IN")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DuePage;
