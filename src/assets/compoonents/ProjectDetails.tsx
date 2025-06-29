import { RootState } from "../Redux/store";
import { useDispatch, useSelector } from "react-redux";
import { setInteriorData, setSalesAssociateData } from "../Redux/dataSlice";
import { useEffect, useState } from "react";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

const ProjectDetails = () => {
  const dispatch = useDispatch();
  const interiorData = useSelector((state: RootState) => state.data.interiors);
  const salesAssociateData = useSelector(
    (state: RootState) => state.data.salesAssociates
  );

  const [interior, setinterior] = useState([]);
  const [salesdata, setsalesdata] = useState([]);

  async function fetchInteriors() {
    try {
      const response = await fetchWithLoading(
        "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/getinteriordata",
        {
          credentials: "include",
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      return data.body;
    } catch (error) {
      console.error("Error fetching interiors:", error);
      return [];
    }
  }

  async function fetchSalesAssociates() {
    try {
      const response = await fetchWithLoading(
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

  useEffect(() => {
    async function getData() {
      let data = await fetchInteriors();
      dispatch(setInteriorData(data));
      setinterior(interiorData);
      data = await fetchSalesAssociates();
      dispatch(setSalesAssociateData(data));
      setsalesdata(salesAssociateData);
    }
    if (interiorData.length == 0 || salesAssociateData.length == 0) {
      getData();
    } else {
      setinterior(interiorData);
      setsalesdata(salesAssociateData);
    }
  }, [dispatch, interiorData, salesAssociateData]);

  return (
    <div className="mb-6 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-semibold mb-4">Project Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Left Column */}
        <div>
          <input
            className="border p-2 rounded w-full"
            placeholder="Reference (optional)"
          />
        </div>
        <div>
          <input
            className="border p-2 rounded w-full"
            placeholder="Project Name *"
            required
          />
        </div>

        <div>
          <input
            className="border p-2 rounded w-full"
            placeholder="Address (optional)"
          />
        </div>
        <div>
          <textarea
            className="border p-2 rounded w-full"
            placeholder="Any Additional Requests (optional)"
          ></textarea>
        </div>

        <div>
          <select className="border p-2 rounded w-full">
            <option value="">Select Interior Name (optional)</option>
            {interior.map((data, index) => (
              <option value="Minimalist" key={index}>
                {data[0]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select className="border p-2 rounded w-full">
            <option value="">Select Sales Associate (optional)</option>
            {salesdata.map((data, index) => (
              <option value="Minimalist" key={index}>
                {data[0]}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select className="border p-2 rounded w-full">
            <option value="">Select User (optional)</option>
            <option value="User 1">User 1</option>
            <option value="User 2">User 2</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
