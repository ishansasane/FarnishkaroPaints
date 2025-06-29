import { Divide } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";
import { useDispatch, useSelector } from "react-redux";
import { setCatalogs } from "../Redux/dataSlice";
import { RootState } from "../Redux/store";
import { setCompanyData, setDesignData } from "../Redux/dataSlice";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

const SearchableSelect = ({
  options,
  value,
  placeholder,
  name,
  mainindex,
  i,
  handleProductGroupChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOptions, setFilteredOptions] = useState(options);
  const dropdownRef = useRef(null);

  useEffect(() => {
    setFilteredOptions(
      options.filter((option) =>
        option[0].toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, options]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <input
        type="text"
        value={searchTerm || value}
        onChange={(e) => setSearchTerm(e.target.value)}
        onFocus={() => setIsOpen(true)}
        placeholder={placeholder}
        className="border p-2 sm:p-3 rounded w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
      />
      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => (
              <div
                key={index}
                className="p-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  handleProductGroupChange(mainindex, i, option);
                  setIsOpen(false);
                  setSearchTerm("");
                }}
              >
                {option[0]}
              </div>
            ))
          ) : (
            <div className="p-2 text-gray-500">No results found</div>
          )}
        </div>
      )}
    </div>
  );
};

const MaterialSelectionComponent = ({
  selections,
  availableAreas,
  availableProductGroups,
  availableCompanies,
  catalogueData,
  designNo,
  handleAddArea,
  handleRemoveArea,
  handleAreaChange,
  handleAddNewGroup,
  handleProductGroupChange,
  handleCompanyChange,
  handleCatalogueChange,
  handleDesignNoChange,
  handleReferenceChange,
  handleGroupDelete,
  projectData,
  setAvailableAreas,
  singleItems,
}) => {
  const dispatch = useDispatch();
  const [combinedData, setCombinedData] = useState([]);

  useEffect(() => {
    const combined = [...availableProductGroups, ...singleItems];
    setCombinedData(combined);
  }, [availableProductGroups, singleItems]);

  const fetchCompanyData = async () => {
    try {
      const response = await fetchWithLoading(
        "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/getCompany",
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
      console.error("Error fetching company data:", error);
      return [];
    }
  };

  const fetchDesignData = async () => {
    try {
      const response = await fetchWithLoading(
        "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/getDesign",
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
      console.error("Error fetching brand data:", error);
      return [];
    }
  };

  const companyData = useSelector((state: RootState) => state.data.companyData);
  const designData = useSelector((state: RootState) => state.data.designData);

  const ONE_HOUR = 3600 * 1000;

  const useInitialFetch = (dispatch, setCompanyData, setDesignData) => {
    useEffect(() => {
      const fetchAndCache = async (key, fetchFn, dispatchFn) => {
        const cached = localStorage.getItem(key);
        const now = Date.now();

        if (cached) {
          const { data, time } = JSON.parse(cached);
          if (now - time < ONE_HOUR) {
            dispatch(dispatchFn(data));
            return;
          }
        }

        try {
          const data = await fetchFn();
          dispatch(dispatchFn(data));
          localStorage.setItem(key, JSON.stringify({ data, time: now }));
        } catch (error) {
          console.error(`Failed to fetch ${key}:`, error);
        }
      };

      fetchAndCache("companyData", fetchCompanyData, setCompanyData);
      fetchAndCache("designData", fetchDesignData, setDesignData);
    }, [dispatch]);
  };

  useInitialFetch(dispatch, setCompanyData, setDesignData);

  const [isCompanyOpen, setIsCompantyOpen] = useState(false);
  const [isCatalogueOpen, setIsCatalogueOpen] = useState(false);
  const [isDesignNoOpen, setIsDesignNoOpen] = useState(false);

  async function fetchCatalogues() {
    try {
      const response = await fetchWithLoading(
        "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/getcatalogues",
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
      console.error("Error fetching catalogues:", error);
      return [];
    }
  }

  const addArea = async (name) => {
    const response = await fetchWithLoading(
      "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/addArea",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ name: name }),
      }
    );

    if (response.status === 200) {
      const newareas = [...availableAreas];
      newareas.push([name]);
      setAvailableAreas(newareas);
      alert("Area Added");
    } else {
      alert("Error");
    }
  };

  const [catalogueName, setCatalogueName] = useState("");
  const [catalogueDescription, setCatalogueDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [designName, setDesignName] = useState("");

  const addCatalogue = async () => {
    const response = await fetchWithLoading(
      "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/addcatalogue",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          catalogueName: catalogueName,
          description: catalogueDescription,
        }),
      }
    );

    if (response.status === 200) {
      const data = await fetchCatalogues();
      dispatch(setCatalogs(data));
      localStorage.setItem(
        "catalogueData",
        JSON.stringify({ data, time: Date.now() })
      );
      setCatalogueName("");
      setCatalogueDescription("");
      setIsCatalogueOpen(false);
      alert("Catalogue Added");
    } else {
      alert("Error");
    }
  };

  const addCompany = async () => {
    const date = new Date();
    const response = await fetchWithLoading(
      "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/sendCompany",
      {
        method: "POST",
        credentials: "include",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({ companyName, date }),
      }
    );

    if (response.status === 200) {
      const data = await fetchCompanyData();
      dispatch(setCompanyData(data));
      localStorage.setItem(
        "companyData",
        JSON.stringify({ data, time: Date.now() })
      );
      setIsCompantyOpen(false);
      alert("Company Added");
    } else {
      alert("Error");
    }
  };

  const [design, setDesign] = useState("");

  const handleCompanyKeyPress = (e) => {
    if (e.key === "Enter") {
      addCompany();
    }
  };

  const handleCatalogueKeyPress = (e) => {
    if (e.key === "Enter") {
      addCatalogue();
    }
  };

  return (
    <div className="flex flex-col bg-white p-4 sm:p-6 rounded-lg shadow-lg">
      <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4">
        Material Selection
      </h2>
      <div className="flex flex-col sm:flex-row gap-4 sm:gap-5">
        {/* Left Column: Area Selection */}
        <div className="w-full sm:w-1/4">
          <p className="text-sm sm:text-base">Area</p>
          {selections.map((selection, index) => {
            const currentArea = selection.area || "";
            return (
              <div
                key={index}
                className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mb-4"
              >
                <div className="flex flex-col gap-2 w-full">
                  <select
                    className="border border-black opacity-50 p-2 sm:p-3 rounded-lg w-full text-sm sm:text-base focus:ring-2 focus:ring-blue-400"
                    value={currentArea}
                    onChange={(e) => {
                      if (e.target.value === "__add_new__") {
                        const newArea = prompt("Enter new Area name:");
                        if (newArea && newArea.trim() !== "") {
                          addArea(newArea.trim());
                          handleAreaChange(index, newArea.trim());
                        }
                      } else {
                        handleAreaChange(index, e.target.value);
                      }
                    }}
                  >
                    <option value="">Select Area</option>
                    <option value="__add_new__">➕ Add New Space</option>
                    {availableAreas.map((area) => (
                      <option key={area} value={area}>
                        {area[0]}
                      </option>
                    ))}
                  </select>
                </div>
                <button
                  className="text-red-500 hover:text-red-700 mt-2 sm:mt-0"
                  onClick={() => handleRemoveArea(index)}
                >
                  <FaTrash size={18} />
                </button>
              </div>
            );
          })}
          <button
            className="flex flex-row gap-2 !rounded-md bg-sky-50 hover:bg-sky-100 items-center px-2 py-1 text-sm sm:text-base"
            onClick={handleAddArea}
          >
            <FaPlus className="text-sky-500" />
            Add Area
          </button>
        </div>

        {/* Right Column: Product Group Selection */}
        <div className="w-full sm:w-3/4">
          <div className="flex flex-row items-center justify-between">
            <p className="text-sm sm:text-base">Select Product Groups</p>
          </div>
          {selections.map((selection, mainindex) => (
            <div
              key={mainindex}
              className="mb-4 border p-3 rounded-lg shadow-sm bg-gray-50"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
                <p className="text-base sm:text-lg font-medium">
                  {selection.area}
                </p>
                <button
                  className="mt-2 sm:mt-0 !rounded-md px-3 py-2 text-sm sm:text-base text-white bg-sky-600 hover:bg-sky-700"
                  onClick={() => handleAddNewGroup(mainindex)}
                >
                  Add New Group
                </button>
              </div>
              {selection.area ? (
                selection.areacollection.map((element, i) => (
                  <div
                    key={i}
                    className="mt-3 border p-3 rounded-lg shadow-sm bg-gray-50"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                      {/* Product Group */}
                      <div className="flex flex-col w-full sm:w-1/5">
                        <p className="text-sm sm:text-base">
                          Product Group / Items
                        </p>
                        <SearchableSelect
                          options={combinedData}
                          value={element.productGroup[0]}
                          i={i}
                          mainindex={mainindex}
                          handleProductGroupChange={handleProductGroupChange}
                          placeholder="Select Product Group"
                          name="productGroup"
                        />
                      </div>

                      {/* Company */}
                      <div>
                        <div className="flex flex-row gap-3">
                          <p className="">Company</p>
                          <button
                            className="mb-3"
                            onClick={() => setIsCompantyOpen(true)}
                          >
                            <span className="mr-2 flex justify-center w-6 h-6 border-2 border-blue-500 rounded-full text-lg leading-none text-blue-600">
                              +
                            </span>
                          </button>
                        </div>
                        <SearchableSelect
                          options={companyData}
                          value={element.company[0]}
                          i={i}
                          mainindex={mainindex}
                          handleProductGroupChange={handleCompanyChange}
                          placeholder="Select Company"
                          name="company"
                        />
                      </div>

                      {/* Catalogue */}
                      <div>
                        <div className="flex flex-row gap-3">
                          <p className="">Catalogue</p>
                          <button
                            className="mb-3"
                            onClick={() => setIsCatalogueOpen(true)}
                          >
                            <span className="mr-2 flex justify-center w-6 h-6 border-2 border-blue-500 rounded-full text-lg leading-none text-blue-600">
                              +
                            </span>
                          </button>
                        </div>
                        <SearchableSelect
                          options={catalogueData}
                          value={element.catalogue}
                          i={i}
                          mainindex={mainindex}
                          handleProductGroupChange={handleCatalogueChange}
                          placeholder="Select Catalogue"
                          name="catalogue"
                        />
                      </div>

                      {/* Design No */}
                      <div>
                        <div className="flex flex-row gap-3">
                          <p className="">Design No.</p>
                        </div>
                        <input
                          type="text"
                          placeholder="Design No"
                          value={element.design}
                          onChange={(e) => {
                            handleDesignNoChange(mainindex, i, e.target.value);
                            setDesign(e.target.value);
                          }}
                          className="border rounded-lg pl-2 py-2 w-24"
                        />
                      </div>

                      {/* Reference */}
                      <div className="flex flex-col w-full sm:w-1/5">
                        <p className="text-sm sm:text-base">Reference/Notes</p>
                        <input
                          type="text"
                          value={element.reference}
                          placeholder="Enter reference..."
                          onChange={(e) =>
                            handleReferenceChange(mainindex, i, e.target.value)
                          }
                          className="border p-2 sm:p-3 rounded w-full text-sm sm:text-base"
                        />
                      </div>

                      {/* Delete Button */}
                      <div className="flex flex-col w-full sm:w-auto">
                        <p className="text-sm sm:text-base sm:block hidden"></p>
                        <button
                          onClick={(e) => handleGroupDelete(mainindex, i)}
                          className="text-red-600 hover:text-red-800 p-1"
                        >
                          <FaTrash size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div></div>
              )}
            </div>
          ))}
        </div>
      </div>
      {isCompanyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
          <div className="w-[300px] p-6 rounded-xl shadow-xl text-center bg-white">
            <p className="text-[1.3vw]">Add Company</p>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              onKeyPress={handleCompanyKeyPress}
              className="w-full rounded-lg border p-2 pl-2 mb-3"
            />
            <div className="w-full flex flex-row justify-between">
              <button
                style={{ borderRadius: "6px" }}
                onClick={addCompany}
                className="px-2 py-1 text-white bg-sky-600 hover:bg-sky-700"
              >
                Add
              </button>
              <button
                onClick={() => setIsCompantyOpen(false)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {isCatalogueOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
          <div className="w-[300px] p-6 rounded-xl shadow-xl text-center bg-white">
            <p className="text-[1.3vw]">Add Catalogue</p>
            <input
              type="text"
              value={catalogueName}
              onChange={(e) => setCatalogueName(e.target.value)}
              onKeyPress={handleCatalogueKeyPress}
              className="w-full rounded-lg border p-2 pl-2 mb-3"
              placeholder="Name"
            />
            <input
              type="text"
              value={catalogueDescription}
              onChange={(e) => setCatalogueDescription(e.target.value)}
              onKeyPress={handleCatalogueKeyPress}
              className="w-full rounded-lg border p-2 pl-2 mb-3"
              placeholder="Description"
            />
            <div className="w-full flex flex-row justify-between">
              <button
                onClick={addCatalogue}
                style={{ borderRadius: "6px" }}
                className="px-2 py-1 text-white bg-sky-600 hover:bg-sky-700"
              >
                Add
              </button>
              <button
                onClick={() => setIsCatalogueOpen(false)}
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      {isDesignNoOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50">
          <div className="w-[300px] p-6 rounded-xl shadow-xl text-center bg-white">
            <p className="text-[1.3vw]">Add Design No</p>
            <input
              type="text"
              value={designName}
              onChange={(e) => setDesignName(e.target.value)}
              className="w-full rounded-lg border p-2 pl-2 mb-3"
            />
            <div className="w-full flex flex-row justify-between">
              <button
                style={{ borderRadius: "6px" }}
                onClick={addDesign}
                className="px-2 py-1 text-white bg-sky-600 hover:bg-sky-700"
              >
                Add
              </button>
              <button
                onClick={() => setIsDesignNoOpen(false)}
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

export default MaterialSelectionComponent;
