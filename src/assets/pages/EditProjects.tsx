/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../Redux/store";
import OverviewPage from "./OverviewPage";
import {
  setTermsData,
  setBankData,
  setPaymentData,
  setSalesAssociateData,
  setInteriorData,
  setCustomerData,
  setProducts,
  setCatalogs,
  setProjects,
  setItemData,
  setProjectFlag,
  setTasks,
  setTailorData,
} from "../Redux/dataSlice";
import CustomerDetails from "./CustomerDetails";
import ProjectDetails from "./ProjectDetails";
import EditCustomerDetails from "./Edit/EditCustomerDetails";
import EditProjectDetails from "./Edit/EditProjectDetails";
import MaterialSelectionComponent from "./MaterialSelectionComponent";
import MeasurementSection from "./MeasurementSections";
import QuotationTable from "./QuotationTable";
import { Disc, Edit } from "lucide-react";
import { FaPlus, FaTrash } from "react-icons/fa";
import PaymentsSection from "./PaymentSection";
import TailorsSection from "./TailorsSection";
import { AnimatePresence, motion } from "framer-motion";
import TaskDialog from "../compoonents/TaskDialog";
import { useCallback } from "react";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

const EditProjects = ({
  Paid,
  setPaid,
  discountType,
  setDiscountType,
  grandTotal,
  setGrandTotal,
  projectData,
  index,
  goBack,
  projects,
  Tax,
  setTax,
  Amount,
  setAmount,
  Discount,
  setDiscount,
}) => {
  const [currentStatus, setCurrentStatus] = useState("Unsent");
  const [navState, setNavState] = useState("Overview");
  const [status, changeStatus] = useState("approved");

  const dispatch = useDispatch();
  const customerData = useSelector((state: RootState) => state.data.customers);
  const interiorData = useSelector((state: RootState) => state.data.interiors);
  const salesAssociateData = useSelector(
    (state: RootState) => state.data.salesAssociates
  );
  const products = useSelector((state: RootState) => state.data.products);
  const items = useSelector((state: RootState) => state.data.items);
  const paymentData = useSelector((state: RootState) => state.data.paymentData);
  const tailors = useSelector((state: RootState) => state.data.tailors);

  const catalogueData = useSelector((state: RootState) => state.data.catalogs);
  const Tasks = useSelector((state: RootState) => state.data.tasks);
  let availableCompanies = ["D Decor", "Asian Paints", "ZAMAN"];
  const designNo = ["514", "98", "123"];

  const [customers, setcustomers] = useState<[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const [singleitems, setsingleitems] = useState([]);

  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);

  const [interior, setinterior] = useState([]);
  const [salesdata, setsalesdata] = useState([]);
  const [availableProductGroups, setAvailableProductGroups] = useState([]);

  const termData = useSelector((state: RootState) => state.data.termsData);
  const bankData = useSelector((state: RootState) => state.data.bankData);

  const [terms, setTerms] = useState("NA");
  const [bank, setBank] = useState("NA");

  const [additionalItems, setAdditionaItems] = useState<additional[]>([]);

  const [editPayments, setEditPayments] = useState(undefined);

  useEffect(() => {
    setDiscountType(discountType);
    setBank(projectData.bankDetails || "NA");
    setTerms(projectData.termsCondiditions || "NA");
    console.log(projectData.bankDetails);
    console.log(projectData.termsCondiditions);
    changeStatus(projectData.status || "Approved");
  }, []);

  interface additional {
    name: string;
    quantity: number;
    rate: number;
    netRate: number;
    tax: number;
    taxAmount: number;
    totalAmount: number;
    remark: string;
  }
  const [availableAreas, setAvailableAreas] = useState([]);

  interface AreaSelection {
    area: string;
    areacollection: collectionArea[];
  }

  interface measurements {
    unit;
    width;
    height;
    quantity;
    newquantity;
  }
  interface collectionArea {
    productGroup;
    items: [];
    company;
    catalogue;
    designNo;
    reference;
    measurement: measurements;
    totalAmount: [];
    totalTax: [];
    quantities: [];
  }

  interface ProductGroup {
    groupName: string;
    mainProducts: string;
    addonProducts: string;
    color: string;
    needsTailoring: boolean;
  }
  interface Goods {
    pg;
    date;
    status;
    orderID;
    remark;
    mainindex;
    groupIndex;
    item;
  }

  interface Tailor {
    pg;
    rate;
    tailorData;
    status;
    remark;
    mainindex;
    groupIndex;
    item;
  }
  const units = ["Inches (in)", "Centimeter (cm)", "Meters (m)", "Feet (ft)"];

  const [selections, setSelections] = useState<AreaSelection[]>([]);
  const [interiorArray, setInteriorArray] = useState([]);
  const [salesAssociateArray, setSalesAssociateArray] = useState([]);
  const [projectName, setProjectName] = useState("");
  const [projectReference, setProjectReference] = useState("");
  const [user, setUser] = useState("");
  const [projectDate, setPRojectDate] = useState("");
  const [additionalRequests, setAdditionalRequests] = useState("");
  const [projectAddress, setProjectAddress] = useState("");

  const fetchTaskData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintstasks"
    );
    const data = await response.json();
    return data.body;
  };

  const getItemsData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintssingleproducts"
    );

    const data = await response.json();

    return data.body;
  };

  const fetchCustomers = async () => {
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
  };

  async function fetchAllAreas() {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsAreas",
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
      console.error("Error fetching Areas:", error);
      return [];
    }
  }

  async function fetchCatalogues() {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getcatalogues",
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

  async function fetchInteriors() {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintsinteriordata",
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
        "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintssalesassociatedata",
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  async function fetchProductGroups(): Promise<ProductGroup[]> {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getallproductgroup",
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
      console.error("Error fetching product groups:", error);
      return [];
    }
  }
  const fetchTermsData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsTermsData"
    );
    const data = await response.json();
    return data.body || [];
  };
  const fetchBankData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsBankData"
    );
    const data = await response.json();
    return data.body || [];
  };
  useEffect(() => {
    const fetchAndCacheBankData = async () => {
      const now = Date.now();
      const cached = localStorage.getItem("bankData");

      if (cached) {
        const parsed = JSON.parse(cached);
        const timeDiff = now - parsed.time;
        if (timeDiff < 5 * 60 * 1000 && parsed.data.length > 0) {
          dispatch(setBankData(parsed.data));
          return;
        }
      }

      const data = await fetchBankData();
      dispatch(setBankData(data));
      localStorage.setItem("bankData", JSON.stringify({ data, time: now }));
    };

    fetchAndCacheBankData();
  }, [dispatch]);

  useEffect(() => {
    const fetchAndCacheTermData = async () => {
      const now = Date.now();
      const cached = localStorage.getItem("termData");

      if (cached) {
        const parsed = JSON.parse(cached);
        const timeDiff = now - parsed.time;

        if (timeDiff < 5 * 60 * 1000 && parsed.data.length > 0) {
          dispatch(setTermsData(parsed.data));
          return;
        }
      }

      const data = await fetchTermsData();
      dispatch(setTermsData(data));
      localStorage.setItem("termData", JSON.stringify({ data, time: now }));
    };

    fetchAndCacheTermData();
  }, [dispatch]);

  useEffect(() => {
    const clonedSelections = Array.isArray(projectData.allData)
      ? JSON.parse(JSON.stringify(projectData.allData))
      : [];

    const clonedAdditionalItems = Array.isArray(projectData.additionalItems)
      ? JSON.parse(JSON.stringify(projectData.additionalItems))
      : [];
    setSelections(clonedSelections);

    setAdditionaItems(clonedAdditionalItems);
    setSelectedCustomer(projectData.customerLink);
    setUser(projectData.createdBy);
    setPRojectDate(projectData.projectDate);
    setAdditionalRequests(projectData.additionalRequests);
    setInteriorArray(projectData.interiorArray);
    setSalesAssociateArray(projectData.salesAssociateArray);
    setProjectReference(projectData.projectReference);
    setProjectAddress(projectData.projectAddres);
    setProjectName(projectData.projectName);
    setProjectReference(projectData.projectReference);
    if (Object.isFrozen(additionalItems)) {
      console.log("frozen");
    }
  }, [projectData]);

  const useFetchData = () => {
    const fetchAndSetData = useCallback(
      async (
        fetchFn,
        dispatchFn,
        localStateSetter,
        storeData,
        keyName = ""
      ) => {
        try {
          const oneHour = 3600 * 1000; // 1 hour in ms
          let shouldFetch = true;

          if (keyName) {
            const cached = localStorage.getItem(keyName);
            if (cached) {
              const { data, time } = JSON.parse(cached);

              // If cache is valid
              if (Date.now() - time < oneHour) {
                dispatch(dispatchFn(data));
                if (localStateSetter) localStateSetter(data);
                shouldFetch = false; // No need to fetch from server
              } else {
                localStorage.removeItem(keyName); // expired cache
              }
            }
          }

          // If store is empty or cache expired, fetch fresh
          if (shouldFetch || storeData.length === 0) {
            const data = await fetchFn();
            dispatch(dispatchFn(data));
            if (localStateSetter) localStateSetter(data);

            if (keyName) {
              localStorage.setItem(
                keyName,
                JSON.stringify({ data, time: Date.now() })
              );
            }
          }
        } catch (error) {
          console.error(`Error fetching ${keyName || "data"}:`, error);
        }
      },
      [dispatch]
    );

    useEffect(() => {
      fetchAndSetData(
        fetchInteriors,
        setInteriorData,
        setinterior,
        interiorData,
        "interiorData"
      );

      fetchAndSetData(
        async () => {
          const response = await fetchWithLoading(
            "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintssingleproducts",
            { credentials: "include" }
          );
          const data = await response.json();
          return data.body || [];
        },
        setItemData,
        setsingleitems,
        items,
        "itemsData"
      );

      fetchAndSetData(
        fetchSalesAssociates,
        setSalesAssociateData,
        setsalesdata,
        salesAssociateData,
        "salesAssociateData"
      );

      fetchAndSetData(
        fetchProductGroups,
        setProducts,
        setAvailableProductGroups,
        products,
        "productsData"
      );

      fetchAndSetData(
        fetchCatalogues,
        setCatalogs,
        null,
        catalogueData,
        "catalogueData"
      );

      fetchAndSetData(
        fetchCustomers,
        setCustomerData,
        setcustomers,
        customerData,
        "customerData"
      );
    }, [
      fetchAndSetData,
      interiorData.length,
      items.length,
      salesAssociateData.length,
      products.length,
      catalogueData.length,
      customerData.length,
    ]);
  };

  useFetchData();

  const handleAreaChange = (mainindex, newArea) => {
    // Clone the selections array to avoid direct mutation of state
    const updatedSelections = [...selections];

    // Check if the area exists and update its value
    if (updatedSelections[mainindex]) {
      updatedSelections[mainindex].area = newArea; // Set the new area for the selected index
    }

    // Update the state with the new selections array
    setSelections(updatedSelections);
  };

  const handleProductGroupChange = (
    mainindex: number,
    i: number,
    product: string
  ) => {
    const updatedSelections = [...selections];

    console.log(product);
    console.log(mainindex);
    console.log(i);

    if (!updatedSelections[mainindex].areacollection) {
      updatedSelections[mainindex].areacollection = [];
    }

    if (!updatedSelections[mainindex].areacollection[i]) {
      updatedSelections[mainindex].areacollection[i] = {
        productGroup: null,
        items: [],
        catalogue: [],
        company: null,
        designNo: null,
        reference: null,
        measurement: {
          unit: "Centimeter (cm)",
          width: undefined,
          height: undefined,
          quantity: undefined,
        },
        totalAmount: [],
        totalTax: [],
        quantities: [],
      };
    }

    const newproduct = product;
    updatedSelections[mainindex].areacollection[i].productGroup = newproduct;

    const pg = newproduct;
    if (!Array.isArray(pg) || pg.length < 2) return;

    console.log(pg);

    let relevantPG = pg.length > 2 ? pg.slice(1, -1) : null;

    let newMatchedItems = null;

    console.log(relevantPG);

    if (relevantPG != null) {
      newMatchedItems = relevantPG
        .map((pgItem) => items.find((item) => item[0] === pgItem))
        .filter((item) => Array.isArray(item));
    } else {
      newMatchedItems = [product];
    }
    console.log(newMatchedItems);

    if (newMatchedItems.length == 0) {
      newMatchedItems = [product];
    }

    updatedSelections[mainindex].areacollection[i].items = newMatchedItems;
    setSelections(updatedSelections);

    const filteredGoods = goodsArray.filter(
      (g) => !(g.mainindex === mainindex && g.groupIndex === i)
    );

    const newGoods = newMatchedItems.map((item) => ({
      mainindex,
      groupIndex: i,
      pg: newproduct,
      date: "",
      status: "Pending",
      orderID: "",
      remark: "NA",
      item: item,
    }));

    setGoodsArray([...filteredGoods, ...newGoods]);

    const filteredTailors = tailorsArray.filter(
      (t) => !(t.mainindex === mainindex && t.groupIndex === i)
    );

    const newTailors = newMatchedItems
      .filter((item) => item[7] == true)
      .map((item, itemIndex) => ({
        mainindex,
        groupIndex: i,
        pg: newproduct,
        rate: 0,
        tailorData: [""],
        status: "Pending",
        remark: "NA",
        item: item,
      }));

    setTailorsArray([...filteredTailors, ...newTailors]);
  };

  const handleCatalogueChange = (mainindex, i, catalogue) => {
    const updatedSelections = [...selections];

    if (!updatedSelections[mainindex].areacollection) {
      updatedSelections[mainindex].areacollection = [];
    }

    if (!updatedSelections[mainindex].areacollection[i]) {
      updatedSelections[mainindex].areacollection[i] = {
        productGroup: null,
        items: [""],
        catalogue: [],
        company: null,
        designNo: null,
        reference: null,
        measurement: {
          unit: "Centimeter (cm)",
          width: undefined,
          height: undefined,
          quantity: undefined,
        },
        additionalItems: [],
        totalAmount: [],
        totalTax: [],
      };
    }

    updatedSelections[mainindex].areacollection[i].catalogue = catalogue[0]
      .split(",")
      .map((item) => item.trim())
      .filter((item) => item);

    setSelections(updatedSelections);
    console.log(updatedSelections[mainindex].areacollection[i].catalogue);
  };

  const handleCompanyChange = (
    mainindex: number,
    i: number,
    company: string
  ) => {
    const updatedSelections = [...selections];

    if (!updatedSelections[mainindex].areacollection) {
      updatedSelections[mainindex].areacollection = [];
    }

    if (!updatedSelections[mainindex].areacollection[i]) {
      updatedSelections[mainindex].areacollection[i] = {
        productGroup: null,
        items: [""],
        catalogue: null,
        company: null,
        designNo: null,
        reference: null,
        measurement: {
          unit: "Centimeter (cm)",
          width: undefined,
          height: undefined,
          quantity: undefined,
        },
        additionalItems: [],
        totalAmount: [],
        totalTax: [],
      };
    }

    updatedSelections[mainindex].areacollection[i].company = company;
    setSelections(updatedSelections);
  };

  const handleDesignNoChange = (mainindex: number, i: number, designNo) => {
    const updatedSelections = [...selections];

    if (!updatedSelections[mainindex].areacollection) {
      updatedSelections[mainindex].areacollection = [];
    }

    if (!updatedSelections[mainindex].areacollection[i]) {
      updatedSelections[mainindex].areacollection[i] = {
        productGroup: null,
        items: [""],
        catalogue: null,
        company: null,
        designNo: null,
        reference: null,
        measurement: {
          unit: "Centimeter (cm)",
          width: undefined,
          height: undefined,
          quantity: undefined,
        },
        additionalItems: [],
        totalAmount: [],
        totalTax: [],
      };
    }

    updatedSelections[mainindex].areacollection[i].designNo = designNo;
    setSelections(updatedSelections);

    console.log(updatedSelections);
  };

  const handleReferenceChange = (mainindex: number, i: number, reference) => {
    const updatedSelection = [...selections];

    if (!updatedSelection[mainindex].areacollection) {
      updatedSelection[mainindex].areacollection = [];
    }

    if (!updatedSelection[mainindex].areacollection[i]) {
      updatedSelection[mainindex].areacollection[i] = {
        productGroup: null,
        items: [""],
        catalogue: null,
        company: null,
        designNo: null,
        reference: null,
        measurement: {
          unit: "Centimeter (cm)",
          width: undefined,
          height: undefined,
          quantity: undefined,
        },
        additionalItems: [],
        totalAmount: [],
        totalTax: [],
      };
    }

    updatedSelection[mainindex].areacollection[i].reference = reference;

    setSelections(updatedSelection);
  };

  const handleAddNewGroup = (mainindex: number, productGroupString = "") => {
    const updatedSelections = [...selections];

    if (!updatedSelections[mainindex]?.areacollection) {
      updatedSelections[mainindex].areacollection = [];
    }

    const groupIndex = updatedSelections[mainindex].areacollection.length;

    // Parse product group string (can be empty initially)
    const productGroupArray = productGroupString
      ? productGroupString.split(",")
      : [];

    const relevantPG =
      productGroupArray.length > 2 ? productGroupArray.slice(1, -2) : [];

    const matchedItems = relevantPG
      .map((pgName) => items.find((item) => item[0] === pgName))
      .filter((item) => Array.isArray(item));

    // Add the new group
    updatedSelections[mainindex].areacollection.push({
      productGroup: productGroupArray,
      company: "",
      catalogue: [],
      designNo: "",
      reference: "",
      measurement: {
        unit: "Centimeter (cm)",
        width: undefined,
        height: undefined,
        quantity: undefined,
      },
      items: matchedItems,
      additionalItems: [],
      totalAmount: [],
      totalTax: [],
    });

    setSelections(updatedSelections);

    // Create new goodsArray entries
    const newGoods = matchedItems.map((item) => ({
      mainindex,
      groupIndex,
      pg: productGroupArray,
      date: "",
      status: "Pending",
      orderID: "",
      remark: "NA",
      item: item,
    }));

    // Create new tailorsArray entries
    const newTailors = matchedItems
      .filter((item) => item[2] === "Tailoring")
      .map((item) => ({
        mainindex,
        groupIndex,
        pg: productGroupArray,
        rate: 0,
        tailorData: [""],
        status: "Pending",
        remark: "NA",
        item: item,
      }));

    // Add new entries
    setGoodsArray((prev) => [...prev, ...newGoods]);
    setTailorsArray((prev) => [...prev, ...newTailors]);
  };

  const handleGroupDelete = (mainindex: number, index: number) => {
    const updatedSelection = [...selections];
    if (updatedSelection[mainindex].areacollection[index]) {
      updatedSelection[mainindex].areacollection.splice(index, 1);
    }

    setSelections(updatedSelection);

    // Remove matching goods and tailors for this group
    setGoodsArray((prev) =>
      prev.filter((g) => !(g.mainindex === mainindex && g.groupIndex === index))
    );

    setTailorsArray((prev) =>
      prev.filter((t) => !(t.mainindex === mainindex && t.groupIndex === index))
    );

    console.log(goodsArray);
    console.log(tailorsArray);
  };

  const handleAddArea = () => {
    setSelections([...selections, { area: "", areacollection: [] }]);
  };

  const handleRemoveArea = (index: number) => {
    const updatedSelections = [...selections];
    const removedArea = updatedSelections[index];

    // Count how many product groups (areacollection) are in the removed area
    let productGroupCount = 0;
    removedArea.areacollection.forEach((collection) => {
      productGroupCount += collection.items.length;
    });

    // Calculate the starting index in goodsArray and tailorsArray for this area
    let startIndex = 0;
    for (let i = 0; i < index; i++) {
      selections[i].areacollection.forEach((collection) => {
        startIndex += collection.items.length;
      });
    }

    // Remove corresponding items from goodsArray and tailorsArray
    const updatedGoodsArray = [...goodsArray];
    const updatedTailorsArray = [...tailorsArray];
    updatedGoodsArray.splice(startIndex, productGroupCount);
    updatedTailorsArray.splice(startIndex, productGroupCount);

    // Update state
    setGoodsArray(updatedGoodsArray);
    setTailorsArray(updatedTailorsArray);
    setSelections(updatedSelections.filter((_, i) => i !== index));
  };

  const handlewidthchange = (mainindex: number, index: number, width) => {
    const updatedSelection = [...selections];
    updatedSelection[mainindex].areacollection[index].measurement.width = width;
    setSelections(updatedSelection);
  };
  const handleheightchange = (mainindex: number, index: number, height) => {
    const updatedSelection = [...selections];
    updatedSelection[mainindex].areacollection[index].measurement.height =
      height;
    setSelections(updatedSelection);
  };

  const recalculateTotals = (
    updatedSelections: AreaSelection[],
    additionalItems: Additional[]
  ) => {
    const selectionTaxArray = updatedSelections.flatMap((selection) =>
      selection.areacollection.flatMap((col) => col.totalTax || [])
    );

    const selectionAmountArray = updatedSelections.flatMap((selection) =>
      selection.areacollection.flatMap((col) => col.totalAmount || [])
    );

    const additionalTaxArray = additionalItems.map(
      (item) => parseInt(item.taxAmount) || 0
    );

    const additionalAmountArray = additionalItems.map(
      (item) => parseInt(item.totalAmount) || 0
    );

    const totalTax = parseInt(
      [...selectionTaxArray, ...additionalTaxArray]
        .reduce((acc, curr) => acc + curr, 0)
        .toFixed(2)
    );

    const totalAmount = parseInt(
      [...selectionAmountArray, ...additionalAmountArray]
        .reduce((acc, curr) => acc + curr, 0)
        .toFixed(2)
    );

    return { totalTax, totalAmount };
  };

  const handlequantitychange = (
    mainIndex: number,
    index: number,
    quantity: number
  ) => {
    const updatedSelections = [...selections];
    const areaCol = updatedSelections[mainIndex].areacollection[index];
    areaCol.measurement.quantity = quantity;

    const discountRaw =
      discountType === "cash" ? `${Discount}` : `${Discount}%`;

    const isPercent =
      typeof discountRaw === "string" && discountRaw.toString().includes("%");
    const discountValue =
      parseInt(discountRaw.toString().replace("%", "")) || 0;

    if (areaCol.items !== undefined) {
      if (!areaCol.totalTax) areaCol.totalTax = [];
      if (!areaCol.totalAmount) areaCol.totalAmount = [];

      // Step 1: Calculate total pre-tax amount for flat discount
      let preTaxTotal = 0;
      areaCol.items.forEach((item, i) => {
        const itemQuantity = parseInt(areaCol.quantities?.[i]) || 0;
        const itemRate = parseInt(item[4]) || 0;
        preTaxTotal += quantity * itemQuantity * itemRate;
      });

      const effectiveDiscountPercent = isPercent
        ? discountValue
        : preTaxTotal > 0
        ? (discountValue / preTaxTotal) * 100
        : 0;

      // Step 2: Calculate per item with discount + tax
      const corrected = areaCol.items.map((item, i) => {
        const itemQuantity = parseInt(areaCol.quantities?.[i]) || 0;
        const itemRate = parseInt(item[4]) || 0;
        const itemTaxPercent = parseInt(item[5]) || 0;

        const baseAmount = quantity * itemQuantity * itemRate;
        const discountAmount = (baseAmount * effectiveDiscountPercent) / 100;
        const discountedAmount = baseAmount - discountAmount;

        const taxAmount = parseInt(
          ((discountedAmount * itemTaxPercent) / 100).toFixed(2)
        );
        const totalAmount = parseInt((discountedAmount + taxAmount).toFixed(2));

        areaCol.totalTax[i] = taxAmount;
        areaCol.totalAmount[i] = totalAmount;

        return [...item.slice(0, 6), taxAmount, totalAmount];
      });

      areaCol.items = corrected;
    }

    setSelections(updatedSelections);

    const { totalTax, totalAmount } = recalculateTotals(
      updatedSelections,
      additionalItems
    );
    setTax(totalTax);
    setAmount(totalAmount);
    setGrandTotal(parseInt(totalAmount.toFixed(2))); // ✅ Grand Total = Amount + Tax
  };
  const handleunitchange = (mainindex: number, index: number, unit) => {
    const updatedSelection = [...selections];
    updatedSelection[mainindex].areacollection[index].measurement.unit = unit;
    setSelections(updatedSelection);
  };
  const [quantities, setQuantities] = useState({});
  const [Received, setReceived] = useState(0);

  const handleQuantityChange = async (
    key: string,
    value: string,
    mainIndex: number,
    collectionIndex: number,
    quantity: string,
    num1: number, // rate
    num2: number, // tax %
    itemIndex: number
  ) => {
    const updatedSelections = [...selections];

    const areaCol =
      updatedSelections[mainIndex].areacollection[collectionIndex];
    const quantityNum = parseFloat(quantity) || 0;
    const valueNum = parseFloat(value) || 0;

    // Ensure quantities array exists
    if (!areaCol.quantities) {
      areaCol.quantities = [];
    }
    areaCol.quantities[itemIndex] = value;

    // Step 1: Base cost
    const baseCost = num1 * quantityNum * valueNum;

    // Step 2: Compute effective discount
    let effectiveDiscountPercent = 0;

    if (discountType === "percent") {
      effectiveDiscountPercent = Discount;
    } else if (discountType === "cash") {
      const totalBeforeDiscount = baseCost;
      effectiveDiscountPercent =
        totalBeforeDiscount > 0 ? (Discount / totalBeforeDiscount) * 100 : 0;
    }

    // Step 3: Apply discount
    const discountAmount = (baseCost * effectiveDiscountPercent) / 100;
    const discountedCost = baseCost - discountAmount;

    // Step 4: Apply tax
    const taxAmount = parseFloat(((discountedCost * num2) / 100).toFixed(2));
    const totalWithTax = parseFloat((discountedCost + taxAmount).toFixed(2));

    // Step 5: Set tax & total
    if (!areaCol.totalTax) areaCol.totalTax = [];
    if (!areaCol.totalAmount) areaCol.totalAmount = [];

    areaCol.totalTax[itemIndex] = taxAmount;
    areaCol.totalAmount[itemIndex] = totalWithTax;

    setSelections(updatedSelections);

    // Step 6: Recalculate overall tax/amount
    const { totalTax, totalAmount } = recalculateTotals(
      updatedSelections,
      additionalItems
    );
    setTax(totalTax);
    setAmount(totalAmount);

    // Optional: Update grand total
    let discountAmt = 0;
    if (discountType === "percent") {
      discountAmt = (totalAmount * Discount) / 100;
    } else if (discountType === "cash") {
      discountAmt = Discount;
    }

    const grandTotal = parseFloat(totalAmount.toFixed(2)); // if you're tracking this
    setGrandTotal(grandTotal);
  };

  const handleItemQuantityChange = (i: number, quantity: string) => {
    const updated = [...additionalItems];
    const item = updated[i];

    const parsedQuantity = parseFloat(quantity) || 0;
    item.quantity = parsedQuantity;

    const baseNetRate = parsedQuantity * item.rate;

    // Step 1: Compute effective discount percentage
    let effectiveDiscountPercent = 0;
    if (discountType === "percent") {
      effectiveDiscountPercent = Discount;
    } else if (discountType === "cash") {
      const totalBeforeDiscount = baseNetRate;
      effectiveDiscountPercent =
        totalBeforeDiscount > 0 ? (Discount / totalBeforeDiscount) * 100 : 0;
    }

    // Step 2: Apply discount to net rate
    const discountAmount = (baseNetRate * effectiveDiscountPercent) / 100;
    const discountedNetRate = baseNetRate - discountAmount;

    // Step 3: Tax calculation
    const taxAmount = parseFloat(
      ((discountedNetRate * item.tax) / 100).toFixed(2)
    );
    const totalAmount = parseFloat((discountedNetRate + taxAmount).toFixed(2));

    item.netRate = parseFloat(discountedNetRate.toFixed(2));
    item.taxAmount = taxAmount;
    item.totalAmount = totalAmount;

    setAdditionaItems(updated);

    const { totalTax, totalAmount: grandSubtotal } = recalculateTotals(
      selections,
      updated
    );
    setTax(totalTax);
    setAmount(grandSubtotal);

    // Optional grand total and discount amount
    let discountAmt = 0;
    if (discountType === "percent") {
      discountAmt = (grandSubtotal * discount) / 100;
    } else if (discountType === "cash") {
      discountAmt = discount;
    }

    const grandTotal = parseFloat(grandSubtotal.toFixed(2));
    setGrandTotal(grandTotal);
  };

  const handleAddMiscItem = () => {
    setAdditionaItems((prev) => [
      ...prev,
      {
        name: "",
        quantity: 0,
        rate: 0,
        netRate: 0,
        tax: 0,
        taxAmount: 0,
        totalAmount: 0,
        remark: "",
      },
    ]);
  };

  // Delete item by index
  const handleDeleteMiscItem = (itemIndex: number) => {
    const updated = [...additionalItems];
    updated.splice(itemIndex, 1);
    setAdditionaItems(updated);
    // Recalculate totals
    const { totalTax, totalAmount } = recalculateTotals(selections, updated);
    setTax(totalTax);
    setAmount(totalAmount);

    // Recalculate discount amount
    let discountAmt = 0;

    if (discountType === "percent") {
      discountAmt = parseFloat(((totalAmount * discount) / 100).toFixed(2));
    } else if (discountType === "cash") {
      discountAmt = discount;
    }

    // Recalculate grand total with updated discount
    const grandTotal = parseFloat(totalAmount.toFixed(2));
    setGrandTotal(grandTotal);
  };
  const [itemTax, setItemTax] = useState(0);
  const [itemTotal, setItemTotal] = useState(0);

  const handleItemNameChange = (i, value) => {
    const updated = [...additionalItems];
    updated[i].name = value;
    setAdditionaItems(updated);
  };

  const recalculateItemTotals = (items: Additional[]) => {
    let totalTax = 0;
    let totalAmount = 0;

    // Calculate total before tax to determine effective cash discount if needed
    const totalBeforeDiscount = items.reduce(
      (acc, item) => acc + item.quantity * item.rate,
      0
    );

    let effectiveDiscountPercent = 0;
    if (discountType === "percent") {
      effectiveDiscountPercent = discount;
    } else if (discountType === "cash" && totalBeforeDiscount > 0) {
      effectiveDiscountPercent = (discount / totalBeforeDiscount) * 100;
    }

    const updatedItems = items.map((item) => {
      const baseNet = item.quantity * item.rate;
      const discountAmount = (baseNet * effectiveDiscountPercent) / 100;
      const discountedNet = baseNet - discountAmount;

      const taxAmt = parseFloat(((discountedNet * item.tax) / 100).toFixed(2));
      const totalAmt = parseFloat((discountedNet + taxAmt).toFixed(2));

      totalTax += taxAmt;
      totalAmount += totalAmt;

      return {
        ...item,
        netRate: parseFloat(discountedNet.toFixed(2)),
        taxAmount: taxAmt,
        totalAmount: totalAmt,
      };
    });

    setAdditionaItems(updatedItems);
    setItemTax(parseFloat(totalTax.toFixed(2)));
    setItemTotal(parseFloat(totalAmount.toFixed(2)));
  };

  // Update rate and auto-update net rate, tax amount, and total amount
  const handleItemRateChange = (i: number, rate: string) => {
    const updated = [...additionalItems];
    const item = updated[i];

    item.rate = parseFloat(rate) || 0;
    const baseNet = item.quantity * item.rate;

    // Step 1: Calculate total before discount (for cash discount % conversion)
    const totalBeforeDiscount = updated.reduce(
      (acc, itm) => acc + itm.quantity * itm.rate,
      0
    );

    // Step 2: Determine effective discount %
    let effectiveDiscountPercent = 0;
    if (discountType === "percent") {
      effectiveDiscountPercent = discount;
    } else if (discountType === "cash" && totalBeforeDiscount > 0) {
      effectiveDiscountPercent = (discount / totalBeforeDiscount) * 100;
    }

    // Step 3: Apply discount and compute tax
    const discountAmount = (baseNet * effectiveDiscountPercent) / 100;
    const discountedNet = baseNet - discountAmount;

    item.netRate = parseFloat(discountedNet.toFixed(2));
    item.taxAmount = parseFloat(((discountedNet * item.tax) / 100).toFixed(2));
    item.totalAmount = parseFloat((item.netRate + item.taxAmount).toFixed(2));

    updated[i] = item;

    setAdditionaItems(updated);

    const { totalTax, totalAmount } = recalculateTotals(selections, updated);
    setTax(totalTax);
    setAmount(totalAmount);
    setGrandTotal(parseFloat(totalAmount.toFixed(2))); // ✅ Grand total logic added
  };

  // Update tax and auto-update tax amount and total amount
  const handleItemTaxChange = (i: number, tax: string) => {
    const updated = [...additionalItems];
    const item = updated[i];

    item.tax = parseFloat(tax) || 0;
    const baseNet = item.quantity * item.rate;

    // Step 1: Calculate total before discount (for cash discount % conversion)
    const totalBeforeDiscount = updated.reduce(
      (acc, itm) => acc + itm.quantity * itm.rate,
      0
    );

    // Step 2: Determine effective discount %
    let effectiveDiscountPercent = 0;
    if (discountType === "percent") {
      effectiveDiscountPercent = discount;
    } else if (discountType === "cash" && totalBeforeDiscount > 0) {
      effectiveDiscountPercent = (discount / totalBeforeDiscount) * 100;
    }

    // Step 3: Apply discount and compute tax
    const discountAmount = (baseNet * effectiveDiscountPercent) / 100;
    const discountedNet = baseNet - discountAmount;

    item.netRate = parseFloat(discountedNet.toFixed(2));
    item.taxAmount = parseFloat(((discountedNet * item.tax) / 100).toFixed(2));
    item.totalAmount = parseFloat((item.netRate + item.taxAmount).toFixed(2));

    updated[i] = item;

    setAdditionaItems(updated);

    const { totalTax, totalAmount } = recalculateTotals(selections, updated);
    setTax(totalTax);
    setAmount(totalAmount);
    setGrandTotal(parseFloat(totalAmount.toFixed(2))); // ✅ Grand total logic added
  };
  const handleItemRemarkChange = (i, remark) => {
    const updated = [...additionalItems];
    updated[i].remark = remark;
    setAdditionaItems(updated);
  };

  const [goodsArray, setGoodsArray] = useState<Goods[]>([]);
  const [tailorsArray, setTailorsArray] = useState<Tailor[]>([]);

  useEffect(() => {
    const deepClone = (data) => JSON.parse(JSON.stringify(data));
    setAdditionaItems(deepClone(projectData.additionalItems));
    setGoodsArray(deepClone(projectData.goodsArray));
    setTailorsArray(deepClone(projectData.tailorsArray));
    console.log(projectData.goodsArray);
  }, [projectData]);

  const [selectedMainIndex, setSelectedMainIndex] = useState(null);
  const [selectedCollectionIndex, setSelectedCollectionIndex] = useState(null);

  const setGoodsDate = (index, date) => {
    let newarray = [...goodsArray];
    newarray[index].date = date;
    setGoodsArray(newarray);
  };
  const setGoodsStatus = (index, status) => {
    let newarray = [...goodsArray];
    newarray[index].status = status;
    setGoodsArray(newarray);
  };
  const setGoodsOrderID = (index, orderID) => {
    let newarray = [...goodsArray];
    newarray[index].orderID = orderID;
    setGoodsArray(newarray);
  };
  const setGoodsRemark = (index, remark) => {
    let newarray = [...goodsArray];
    newarray[index].remark = remark;
    setGoodsArray(newarray);
  };

  const [payment, setPayment] = useState(0);
  const [paymentDate, setPaymentDate] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentRemarks, setPaymentRemarks] = useState("");

  const [addPayment, setAddPayment] = useState(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchPaymentData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsPayments"
    );
    const data = await response.json();
    return data.message;
  };

  const fetchTailorData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/gettailors"
    );
    const data = await response.json();
    return data.body;
  };

  const hasFetchedPayments = useRef(false);
  const [added, setAdded] = useState(false);
  useEffect(() => {
    let isMounted = true; // To avoid state updates on unmounted component

    const fetchAndStoreData = async () => {
      try {
        // Parallel fetch
        const [paymentData, tailorData] = await Promise.all([
          fetchPaymentData(),
          fetchTailorData(),
        ]);

        // --- PAYMENT DATA ---
        if (paymentData && isMounted) {
          dispatch(setPaymentData(paymentData));

          // Compute total payment for this project
          const totalReceived = paymentData.reduce((sum, record) => {
            if (record[1] === projectData.projectName) {
              const amount = parseFloat(record[2]);
              return sum + (isNaN(amount) ? 0 : amount);
            }
            return sum;
          }, 0);

          setReceived(totalReceived);
        }

        // --- TAILOR DATA ---
        if (tailorData && isMounted) {
          dispatch(setTailorData(tailorData));
        }

        // Prevent re-fetching
        if (isMounted) setAdded(true);
      } catch (error) {
        console.error("❌ Failed to fetch payment or tailor data:", error);
        // Optional: showToast("Error loading data")
      }
    };

    if (!added) {
      fetchAndStoreData();
    }

    return () => {
      isMounted = false; // Cleanup for async calls
    };
  }, [added, dispatch, projectData.projectName]);

  useEffect(() => {
    async function getAreas() {
      try {
        // Check localStorage first to avoid unnecessary API calls
        const cachedData = localStorage.getItem("areasData");
        const oneHour = 3600 * 1000; // 1 hour expiration for cached data

        if (cachedData) {
          const { data, time } = JSON.parse(cachedData);

          if (Date.now() - time < oneHour) {
            // Use cached data if it hasn't expired
            setAvailableAreas(data);
            return;
          } else {
            // Remove expired data from localStorage
            localStorage.removeItem("areasData");
          }
        }

        // If no valid cached data, fetch from the API
        const response = await fetchWithLoading(
          "https://sheeladecor.netlify.app/.netlify/functions/server/getPaintsAreas"
        );
        const data = await response.json();
        setAvailableAreas(data.body);

        // Cache the fresh data
        localStorage.setItem(
          "areasData",
          JSON.stringify({ data: data.body, time: Date.now() })
        );
      } catch (error) {
        console.error("Error fetching areas:", error);
      }
    }

    // Fetch areas only if not already loaded
    if (availableAreas.length === 0) {
      getAreas();
    }
  }, [availableAreas.length]); // Only re-run when availableAreas length changes

  const addPaymentFunction = async () => {
    const isEdit = typeof editProjects !== "undefined";

    const url = isEdit
      ? "https://sheeladecor.netlify.app/.netlify/functions/server/updatePaintsPayments"
      : "https://sheeladecor.netlify.app/.netlify/functions/server/addPaintsPayment";

    const payload = {
      customerName: projectData.customerLink[0],
      Name: projectData.projectName,
      Received: payment,
      ReceivedDate: paymentDate,
      PaymentMode: paymentMode,
      Remarks: paymentRemarks,
    };

    try {
      const response = await fetchWithLoading(url, {
        credentials: "include",
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert(isEdit ? "Payment updated" : "Payment added");

        // ✅ Reset form states
        setAddPayment(false);
        setPayment(0);
        setPaymentDate("");
        setPaymentMode("");
        setPaymentRemarks("");
        setAdded((prev) => !prev); // trigger useEffect if needed

        // ✅ Refresh payment data
        const latestPayments = await fetchPaymentData();
        dispatch(setPaymentData(latestPayments));
        localStorage.setItem(
          "paymentData",
          JSON.stringify({ data: latestPayments, time: Date.now() })
        );
      } else {
        alert("Error submitting payment");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Network or server error");
    }
  };

  const deletePayment = async (p, pd, pm, re) => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/deletePaintsPayment",
      {
        credentials: "include",
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          customerName: projectData.customerLink[0],
          Name: projectData.projectName,
          Received: p,
          ReceivedDate: pd,
          PaymentMode: pm,
          Remarks: re,
        }),
      }
    );

    if (response.status == 200) {
      alert("Deleted");
      if (added) {
        setAdded(false);
      } else {
        setAdded(true);
      }
    } else {
      alert("Error");
    }
  };

  const [taskFilter, setTaskFilter] = useState("All Tasks");
  const statusArray = ["Pending", "Ordered", "Received", "In Stock"];

  const [filteredTasks, setFilteredTasks] = useState([]);

  useEffect(() => {
    const filtered = Tasks.filter(
      (task) => task[5] === projectData.projectName
    ).filter((task) => {
      if (taskFilter === "All Tasks") return true;
      return task[7] === taskFilter;
    });

    setFilteredTasks(filtered);
  }, [taskFilter, projectData, Tasks]);

  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [editing, setediting] = useState<[]>(null);

  const [name, setName] = useState("");

  useEffect(() => {
    async function taskData() {
      const data = await fetchTaskData();
      dispatch(setTasks(data));
      setAdded(true);
    }
    if (!added) {
      taskData();
    }
  }, [dispatch, taskDialogOpen, added]);

  const deleteTask = async (name: string) => {
    await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/deletePaintstask",
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

  const bankDetails = ["123123", "!23123", "!2312331"];
  const termsCondiditions = ["asdasd", "asasda"];

  const updateTailorData = (index, data) => {
    const formattedData = data.split(",").map((item) => item.trim()); // split and trim spaces
    const newtailors = [...tailorsArray];
    newtailors[index].tailorData = formattedData;
    console.log(newtailors[index]);
    setTailorsArray(newtailors);
  };

  const updateTailorRate = (index, data) => {
    const newtailors = [...tailorsArray];
    newtailors[index].rate = data;
    setTailorsArray(newtailors);
  };
  const updateTailorStatus = (index, data) => {
    const newtailors = [...tailorsArray];
    newtailors[index].status = data;
    setTailorsArray(newtailors);
  };
  const updateTailorRemark = (index, data) => {
    const newtailors = [...tailorsArray];
    newtailors[index].remark = data;
    setTailorsArray(newtailors);
  };

  const setCancelPayment = () => {
    if (editPayments) {
      setPayment(0);
      setPaymentDate("");
      setPaymentMode("");
      setPaymentRemarks("NA");
      setAddPayment(false);
    } else {
      setAddPayment(false);
    }
  };

  const handleDiscountChange = (newDiscount, newDiscountType) => {
    // --- Update discount state ---
    setDiscount(newDiscount);
    setDiscountType(newDiscountType);

    // --- Deep clone selections and additionalItems ---
    const updatedSelections = JSON.parse(JSON.stringify(selections));
    const updatedAdditionalItems = JSON.parse(JSON.stringify(additionalItems));

    // === Recalculate Area-Based Items ===
    updatedSelections.forEach((selection) => {
      selection.areacollection.forEach((areaCol) => {
        const quantity = parseFloat(areaCol.measurement.quantity) || 0;

        if (!Array.isArray(areaCol.totalTax)) areaCol.totalTax = [];
        if (!Array.isArray(areaCol.totalAmount)) areaCol.totalAmount = [];

        // Calculate pre-tax total
        let preTaxTotal = 0;
        areaCol.items?.forEach((item, i) => {
          const itemQty = parseFloat(areaCol.quantities?.[i]) || 0;
          const itemRate = parseFloat(item[4]) || 0;
          preTaxTotal += quantity * itemQty * itemRate;
        });

        const isPercent = newDiscountType === "percent";
        const effectiveDiscountPercent = isPercent
          ? parseFloat(newDiscount)
          : preTaxTotal > 0
          ? (parseFloat(newDiscount) / preTaxTotal) * 100
          : 0;

        // Apply discount and calculate tax
        areaCol.items = areaCol.items?.map((item, i) => {
          const itemQty = parseFloat(areaCol.quantities?.[i]) || 0;
          const itemRate = parseFloat(item[4]) || 0;
          const itemTaxPercent = parseFloat(item[5]) || 0;

          const baseAmount = quantity * itemQty * itemRate;
          const discountAmount = (baseAmount * effectiveDiscountPercent) / 100;
          const discountedAmount = baseAmount - discountAmount;

          const taxAmount = parseFloat(
            ((discountedAmount * itemTaxPercent) / 100).toFixed(2)
          );
          const totalAmount = parseFloat(
            (discountedAmount + taxAmount).toFixed(2)
          );

          areaCol.totalTax[i] = taxAmount;
          areaCol.totalAmount[i] = totalAmount;

          return [...item.slice(0, 6), taxAmount, totalAmount];
        });
      });
    });

    // === Recalculate Additional Items ===
    const totalBeforeDiscount = updatedAdditionalItems.reduce(
      (acc, item) => acc + item.quantity * item.rate,
      0
    );

    const additionalDiscountPercent =
      newDiscountType === "percent"
        ? parseFloat(newDiscount)
        : totalBeforeDiscount > 0
        ? (parseFloat(newDiscount) / totalBeforeDiscount) * 100
        : 0;

    updatedAdditionalItems.forEach((item) => {
      const baseNet = item.quantity * item.rate;
      const discountAmount = (baseNet * additionalDiscountPercent) / 100;
      const discountedNet = baseNet - discountAmount;

      item.netRate = parseFloat(discountedNet.toFixed(2));
      item.taxAmount = parseFloat(
        ((discountedNet * item.tax) / 100).toFixed(2)
      );
      item.totalAmount = parseFloat((item.netRate + item.taxAmount).toFixed(2));
    });

    // === Set Everything ===
    setSelections(updatedSelections);
    setAdditionaItems(updatedAdditionalItems);

    const { totalTax, totalAmount } = recalculateTotals(
      updatedSelections,
      updatedAdditionalItems
    );
    setTax(totalTax);
    setAmount(totalAmount);
    setGrandTotal(parseFloat(totalAmount.toFixed(2)));
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

  const sendProjectData = async () => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/updatepaintsprojectdata",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            projectName: projectData.projectName,
            customerLink: JSON.stringify(selectedCustomer),
            projectReference,
            status,
            totalAmount: Amount,
            totalTax: Tax,
            paid: Paid,
            discount: Discount,
            createdBy: user,
            allData: JSON.stringify(selections),
            projectDate,
            additionalRequests,
            interiorArray: JSON.stringify(interiorArray),
            salesAssociateArray: JSON.stringify(salesAssociateArray),
            additionalItems: JSON.stringify(additionalItems),
            goodsArray: JSON.stringify(goodsArray),
            tailorsArray: JSON.stringify(tailorsArray),
            projectAddress: JSON.stringify(projectAddress),
            grandTotal,
            discountType,
            bankDetails: JSON.stringify(bank),
            termsConditions: JSON.stringify(terms),
          }),
        }
      );

      if (response.status === 200) {
        alert("Project Edited");
        const updatedData = await fetchProjectData();
        dispatch(setProjects(updatedData));
        localStorage.setItem(
          "projectData",
          JSON.stringify({ data: updatedData, time: Date.now() })
        );
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        alert("Error: Failed to add project");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      alert("Error: Network issue or server not responding");
    }
  };

  return (
    <div className="p-6">
      <div className="flex flex-col">
        <div className="flex flex-row justify-between items-center">
          <p className=" font-semibold">Order Overview</p>
          <button
            onClick={goBack}
            className="mb-4 px-3 py-1 text-white bg-red-500 !rounded"
          >
            ← Back
          </button>
        </div>
        <div className="flex flex-col sm:flex-row w-full max-w-full justify-between mb-2 sm:mb-3 bg-sky-50 px-1 sm:!px-4 py-1 sm:!py-4  !rounded-lg">
          <button
            className={`w-full sm:w-auto text-sm sm:text-base ${
              navState === "Overview" ? "text-sky-700 font-semibold" : ""
            }`}
            onClick={() => setNavState("Overview")}
          >
            Overview
          </button>
          <button
            className={`w-full sm:w-auto text-sm sm:text-base ${
              navState === "Customer & Project Details"
                ? "text-sky-700 font-semibold"
                : ""
            }`}
            onClick={() => setNavState("Customer & Project Details")}
          >
            Customer & Project Details
          </button>
          <button
            className={`w-full sm:w-auto text-sm sm:text-base ${
              navState === "Material Selection"
                ? "text-sky-700 font-semibold"
                : ""
            }`}
            onClick={() => setNavState("Material Selection")}
          >
            Material Selection
          </button>
          <button
            className={`w-full sm:w-auto text-sm sm:text-base ${
              navState === "Measurement" ? "text-sky-700 font-semibold" : ""
            }`}
            onClick={() => setNavState("Measurement")}
          >
            Measurement
          </button>
          <button
            className={`w-full sm:w-auto text-sm sm:text-base ${
              navState === "Quotation" ? "text-sky-700 font-semibold" : ""
            }`}
            onClick={() => setNavState("Quotation")}
          >
            Quotation
          </button>
          <button
            className={`w-full sm:w-auto text-sm sm:text-base ${
              navState === "Goods" ? "text-sky-700 font-semibold" : ""
            }`}
            onClick={() => setNavState("Goods")}
          >
            Goods
          </button>
          <button
            className={`w-full sm:w-auto text-sm sm:text-base ${
              navState === "Tailors" ? "text-sky-700 font-semibold" : ""
            }`}
            onClick={() => setNavState("Tailors")}
          >
            Tailors
          </button>
          <button
            className={`w-full sm:w-auto text-sm sm:text-base ${
              navState === "Payments" ? "text-sky-700 font-semibold" : ""
            }`}
            onClick={() => setNavState("Payments")}
          >
            Payments
          </button>
          <button
            className={`w-full sm:w-auto text-sm sm:text-base ${
              navState === "Tasks" ? "text-sky-700 font-semibold" : ""
            }`}
            onClick={() => setNavState("Tasks")}
          >
            Tasks
          </button>
        </div>
        {navState == "Overview" && (
          <div className="flex flex-col justify-between">
            <OverviewPage
              projectData={projectData}
              status={status}
              setStatus={changeStatus}
              tasks={Tasks}
              setNavState={setNavState}
              tailorsArray={tailorsArray}
              setTailorsArray={setTailorsArray}
              goodsArray={goodsArray}
              setGoodsArray={setGoodsArray}
              projectDate={projectDate}
              setPRojectDate={setPRojectDate}
              interiorArray={interiorArray}
              salesAssociateArray={salesAssociateArray}
              projects={projects}
              setAddPayment={setAddPayment}
              addPayment={addPayment}
              paymentData={paymentData}
            />
            <div className="flex flex-row justify-between mt-3">
              <button
                onClick={() => setNavState("Tasks")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg border px-2 h-8 bg-white"
              >
                Back
              </button>
              <button
                onClick={() => setNavState("Customer & Project Details")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg text-white border px-2 h-8 bg-sky-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {navState == "Customer & Project Details" && (
          <div className="flex flex-col gap-3">
            <EditCustomerDetails
              customers={customers}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              projectData={projectData}
              setcustomers={setcustomers}
            />
            <EditProjectDetails
              selectedCustomer={selectedCustomer}
              interior={interior}
              salesdata={salesdata}
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
              setProjectDate={setPRojectDate}
              setAdditionalRequests={setAdditionalRequests}
              additionalRequests={additionalRequests}
              projectData={projectData}
              setSalesData={setsalesdata}
            />
            <div className="flex flex-row justify-between">
              <button
                onClick={() => setNavState("Overview")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg border px-2 h-8 bg-white"
              >
                Back
              </button>
              <button
                onClick={() => setNavState("Material Selection")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg text-white border px-2 h-8 bg-sky-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {navState == "Material Selection" && (
          <div className="flex flex-col gap-3">
            <MaterialSelectionComponent
              selections={selections}
              availableAreas={availableAreas}
              availableProductGroups={availableProductGroups}
              availableCompanies={availableCompanies}
              catalogueData={catalogueData}
              designNo={designNo}
              handleAddArea={handleAddArea}
              handleRemoveArea={handleRemoveArea}
              handleAreaChange={handleAreaChange}
              handleAddNewGroup={handleAddNewGroup}
              handleProductGroupChange={handleProductGroupChange}
              handleCompanyChange={handleCompanyChange}
              handleCatalogueChange={handleCatalogueChange}
              handleDesignNoChange={handleDesignNoChange}
              handleReferenceChange={handleReferenceChange}
              handleGroupDelete={handleGroupDelete}
              projectData={projectData}
              setAvailableAreas={setAvailableAreas}
              singleItems={singleitems}
            />
            <div className="flex flex-row justify-between">
              <button
                onClick={() => setNavState("Customer & Project Details")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg border px-2 h-8 bg-white"
              >
                Back
              </button>
              <button
                onClick={() => setNavState("Measurement")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg text-white border px-2 h-8 bg-sky-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {navState == "Measurement" && (
          <div className="flex flex-col gap-3">
            <MeasurementSection
              selections={selections}
              units={units}
              handleRemoveArea={handleRemoveArea}
              handleReferenceChange={handleReferenceChange}
              handleunitchange={handleunitchange}
              handlewidthchange={handlewidthchange}
              handleheightchange={handleheightchange}
              handlequantitychange={handlequantitychange}
            />
            <div className="flex flex-row justify-between">
              <button
                onClick={() => setNavState("Material Selection")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg border px-2 h-8 bg-white"
              >
                Back
              </button>
              <button
                onClick={() => setNavState("Quotation")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg text-white border px-2 h-8 bg-sky-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {navState == "Quotation" && (
          <div className="flex flex-col gap-3">
            <div className="flex flex-col p-6 border !rounded-lg w-full shadow-2xl">
              <p className="">Quotation</p>
              <div className="flex flex-col gap-3 w-full">
                {selections.map((selection, mainindex) => (
                  <div key={mainindex} className="w-full">
                    <p className="text-base sm:text-lg font-semibold mb-2">
                      {selection.area}
                    </p>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse mb-6 text-xs sm:text-sm min-w-[600px] sm:min-w-full">
                        <thead>
                          <tr className="flex flex-col sm:flex-row justify-between w-full bg-gray-100 p-2 border-b font-semibold hidden sm:flex">
                            <td className="w-full sm:w-[10%] py-1">Sr. No.</td>
                            <td className="w-full sm:w-[45%] py-1">
                              Product Name
                            </td>
                            <td className="w-full sm:w-[45%] py-1">Size</td>
                            <td className="w-full sm:w-[20%] py-1">MRP</td>
                            <td className="w-full sm:w-[20%] py-1">Quantity</td>
                            <td className="w-full sm:w-[20%] py-1">Subtotal</td>
                            <td className="w-full sm:w-[20%] py-1">
                              Tax Rate (%)
                            </td>
                            <td className="w-full sm:w-[20%] py-1">
                              Tax Amount
                            </td>
                            <td className="w-full sm:w-[20%] py-1">Total</td>
                          </tr>
                        </thead>
                        <tbody>
                          {selection.areacollection &&
                          selection.areacollection.length > 0 ? (
                            selection.areacollection.map(
                              (collection, collectionIndex) => {
                                if (!Array.isArray(collection.items)) {
                                  return (
                                    <tr key={`error-${collectionIndex}`}>
                                      <td
                                        colSpan={9}
                                        className="text-center text-red-500 text-xs sm:text-sm py-2"
                                      >
                                        No items found for collection{" "}
                                        {collectionIndex + 1}
                                      </td>
                                    </tr>
                                  );
                                }

                                return collection.items.map(
                                  (item: any, itemIndex: number) => {
                                    const key = `${mainindex}-${collectionIndex}-${itemIndex}`;
                                    const qty =
                                      collection.quantities?.[itemIndex] || 0;

                                    return (
                                      <tr
                                        key={key}
                                        className="flex flex-col sm:flex-row justify-between w-full border-b p-2 sm:p-4"
                                      >
                                        <td className="w-full sm:w-[10%] text-xs sm:text-sm py-1 sm:text-center before:content-['Sr._No.:_'] sm:before:content-none before:font-bold before:pr-2">
                                          {itemIndex + 1}
                                        </td>
                                        <td className="w-full sm:w-[45%] text-xs sm:text-sm py-1 before:content-['Product_Name:_'] sm:before:content-none before:font-bold before:pr-2">
                                          {item[0] +
                                            " * " +
                                            collection.measurement.quantity}
                                        </td>
                                        <td className="w-full sm:w-[45%] text-xs sm:text-sm py-1 before:content-['Size:_'] sm:before:content-none before:font-bold before:pr-2">
                                          {collection.measurement.width +
                                            " x " +
                                            collection.measurement.height +
                                            " " +
                                            collection.measurement.unit}
                                        </td>
                                        <td className="w-full sm:w-[20%] text-xs sm:text-sm py-1 sm:text-center before:content-['MRP:_'] sm:before:content-none before:font-bold before:pr-2">
                                          {(
                                            item[4] *
                                            parseFloat(
                                              collection.measurement.quantity
                                            )
                                          ).toFixed(2)}
                                        </td>
                                        <td className="w-full sm:w-[20%] py-1 before:content-['Quantity:_'] sm:before:content-none before:font-bold before:pr-2">
                                          <div className="flex flex-col">
                                            <input
                                              type="text"
                                              value={
                                                collection.quantities?.[
                                                  itemIndex
                                                ] || ""
                                              }
                                              onChange={(e) =>
                                                handleQuantityChange(
                                                  key,
                                                  e.target.value,
                                                  mainindex,
                                                  collectionIndex,
                                                  collection.measurement
                                                    .quantity,
                                                  item[4],
                                                  item[5],
                                                  itemIndex
                                                )
                                              }
                                              className="border w-max sm:w-4/5 px-2 py-1 !rounded text-xs sm:text-sm min-w-[80px]"
                                            />
                                            <p className="text-[10px] sm:text-xs text-gray-600 mt-1">
                                              {item[3]}
                                            </p>
                                          </div>
                                        </td>
                                        <td className="w-full sm:w-[20%] text-xs sm:text-sm py-1 sm:text-center before:content-['Subtotal:_'] sm:before:content-none before:font-bold before:pr-2">
                                          {(
                                            item[4] *
                                            parseFloat(
                                              collection.measurement.quantity
                                            ) *
                                            qty
                                          ).toFixed(2)}
                                        </td>
                                        <td className="w-full sm:w-[20%] text-xs sm:text-sm py-1 sm:text-center before:content-['Tax_Rate_(%):_'] sm:before:content-none before:font-bold before:pr-2">
                                          {item[5]}
                                        </td>
                                        <td className="w-full sm:w-[20%] text-xs sm:text-sm py-1 sm:text-center before:content-['Tax_Amount:_'] sm:before:content-none before:font-bold before:pr-2">
                                          {collection.totalTax[itemIndex]
                                            ? collection.totalTax[
                                                itemIndex
                                              ].toFixed(2)
                                            : "0.00"}
                                        </td>
                                        <td className="w-full sm:w-[20%] text-xs sm:text-sm py-1 sm:text-center before:content-['Total:_'] sm:before:content-none before:font-bold before:pr-2">
                                          {collection.totalAmount[itemIndex]
                                            ? collection.totalAmount[
                                                itemIndex
                                              ].toFixed(2)
                                            : "0.00"}
                                        </td>
                                      </tr>
                                    );
                                  }
                                );
                              }
                            )
                          ) : (
                            <tr>
                              <td
                                colSpan={9}
                                className="text-center py-2 text-gray-500 text-xs sm:text-base"
                              >
                                No product data available.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border p-4 sm:p-6 !rounded-lg w-full flex flex-col">
                <p className="text-base sm:text-lg font-semibold">
                  Miscellaneous
                </p>
                <div className="flex w-full flex-col">
                  <div className="flex flex-row justify-between items-center mt-4">
                    <button
                      className="flex flex-row gap-2 !rounded-xl bg-sky-50 hover:bg-sky-100 items-center px-2 py-1 text-sm"
                      onClick={handleAddMiscItem}
                    >
                      <FaPlus className="text-sky-500" />
                      Add Item
                    </button>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <table className="mt-3 w-full bg-white">
                      <thead className="hidden sm:table-header-group">
                        <tr className="bg-gray-100 text-gray-700 text-sm font-semibold">
                          <th className="py-3 px-4 text-center">SR</th>
                          <th className="py-3 px-4">Item Name</th>
                          <th className="py-3 px-4">Quantity</th>
                          <th className="py-3 px-4">Rate</th>
                          <th className="py-3 px-4">Net Rate</th>
                          <th className="py-3 px-4">Tax (%)</th>
                          <th className="py-3 px-4">Tax Amount</th>
                          <th className="py-3 px-4">Total Amount</th>
                          <th className="py-3 px-4">Remark</th>
                          <th className="py-3 px-4 text-center">Actions</th>
                        </tr>
                      </thead>

                      <tbody className="w-full">
                        {additionalItems.map((item, i) => (
                          <tr
                            key={i}
                            className="flex flex-col sm:table-row w-full border-b hover:bg-gray-50"
                          >
                            <td className="py-3 px-4 text-center text-sm before:content-['SR:_'] sm:before:content-none before:font-semibold sm:text-center">
                              {i + 1}
                            </td>

                            <td className="py-3 px-4 before:content-['Item_Name:_'] sm:before:content-none before:font-semibold">
                              <input
                                onChange={(e) =>
                                  handleItemNameChange(i, e.target.value)
                                }
                                className="w-[100px] border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={item.name || ""}
                                type="text"
                              />
                            </td>

                            <td className="py-3 px-4 before:content-['Quantity:_'] sm:before:content-none before:font-semibold">
                              <input
                                onChange={(e) =>
                                  handleItemQuantityChange(i, e.target.value)
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={item.quantity || ""}
                                type="number"
                                min="0"
                              />
                            </td>

                            <td className="w-[130px] py-3 px-4 before:content-['Rate:_'] sm:before:content-none before:font-semibold">
                              <input
                                onChange={(e) =>
                                  handleItemRateChange(i, e.target.value)
                                }
                                className="w-[130px] border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={item.rate || ""}
                                type="number"
                                min="0"
                              />
                            </td>

                            <td className="w-[130px] py-3 px-4 text-sm text-left sm:text-center before:content-['Net_Rate:_'] sm:before:content-none before:font-semibold">
                              INR {item.netRate?.toFixed(2) || "0.00"}
                            </td>

                            <td className="py-3 px-4 before:content-['Tax_(%):_'] sm:before:content-none before:font-semibold">
                              <input
                                onChange={(e) =>
                                  handleItemTaxChange(i, e.target.value)
                                }
                                className="w-[70px] border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={item.tax || ""}
                                type="number"
                                min="0"
                              />
                            </td>

                            <td className="py-3 px-4 text-sm text-left sm:text-center before:content-['Tax_Amount:_'] sm:before:content-none before:font-semibold">
                              INR {item.taxAmount?.toFixed(2) || "0.00"}
                            </td>

                            <td className="py-3 px-4 text-sm text-left sm:text-center before:content-['Total_Amount:_'] sm:before:content-none before:font-semibold">
                              INR {item.totalAmount?.toFixed(2) || "0.00"}
                            </td>

                            <td className="py-3 px-4 before:content-['Remark:_'] sm:before:content-none before:font-semibold">
                              <input
                                onChange={(e) =>
                                  handleItemRemarkChange(i, e.target.value)
                                }
                                className="w-[100px] border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                value={item.remark || ""}
                                type="text"
                              />
                            </td>

                            <td className="py-3 px-4 text-left sm:text-center before:content-['Actions:_'] sm:before:content-none before:font-semibold">
                              <button onClick={() => handleDeleteMiscItem(i)}>
                                <FaTrash className="text-red-500 hover:text-red-600 w-4 h-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-between w-full">
              <div className="bg-white p-6 !rounded-xl shadow-md border border-gray-200 w-full md:w-1/2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Bank Details & Terms
                </h3>
                <div className="space-y-4">
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value.split(","))}
                    className="w-full border border-gray-300 !rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Bank Details</option>
                    {bankData.map((data, index) => (
                      <option key={index} value={data}>
                        Account Name : {data[0]} - Account Number : {data[1]}
                      </option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Bank Details Description"
                    value={`Account Name : ${
                      bank == "NA" ? "" : bank[0]
                    } \nAccount Number : ${
                      bank == "NA" ? "" : bank[1]
                    }\nIFSC code : ${bank == "NA" ? "" : bank[2]}`}
                    className="w-full border border-gray-300 !rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  ></textarea>
                  <select
                    value={terms}
                    onChange={(e) => setTerms(e.target.value.split(","))}
                    className="w-full border border-gray-300 !rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select Terms & Conditions</option>
                    {termData.map((data, index) => (
                      <option key={index} value={data}>
                        {data[0]}
                      </option>
                    ))}
                  </select>
                  <textarea
                    placeholder="Terms & Conditions Description"
                    className="w-full border border-gray-300 !rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    value={`Terms & Conditions : ${
                      terms == "NA" ? "" : terms[0]
                    }`}
                  ></textarea>
                </div>
              </div>
              <div className="shadow-xl p-4 sm:p-6 flex flex-col gap-2 border w-full sm:w-1/2 !rounded-lg">
                <p className="text-base sm:text-lg font-semibold">Summary</p>
                <div className="flex flex-row justify-between w-full text-xs sm:text-sm">
                  <p>Sub Total</p>
                  <p>{Amount}</p>
                </div>
                <div className="flex flex-row justify-between w-full text-xs sm:text-sm">
                  <p>Total Tax Amount</p>
                  <p>{Tax}</p>
                </div>
                <div className="flex flex-row justify-between w-full text-xs sm:text-sm">
                  <p>Total Amount</p>
                  <p>{parseFloat(Amount.toFixed(2))}</p>
                </div>
                <div className="border border-gray-400"></div>
                <div className="flex justify-between mt-1 w-full text-xs sm:text-sm">
                  <p>Discount</p>
                  <div className="flex items-center gap-2">
                    <select
                      value={discountType}
                      onChange={(e) =>
                        handleDiscountChange(Discount, e.target.value)
                      }
                      className="border border-gray-300 !rounded-md px-2 py-1 text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      {discountType === "cash" ? (
                        <>
                          <option value="cash">₹</option>
                          <option value="percent">%</option>
                        </>
                      ) : (
                        <>
                          <option value="percent">%</option>
                          <option value="cash">₹</option>
                        </>
                      )}
                    </select>

                    <input
                      className="w-20 sm:w-24 border border-gray-300 !rounded-md px-3 py-1 text-xs sm:text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={Discount}
                      onChange={(e) =>
                        handleDiscountChange(e.target.value, discountType)
                      }
                      type="number"
                      min="0"
                    />
                  </div>
                </div>
                <div className="border border-gray-400"></div>
                <div className="flex w-full flex-row items-center justify-between text-xs sm:text-sm">
                  <p>Grand Total</p>
                  <p>{grandTotal}</p>
                </div>
                <button
                  onClick={sendProjectData}
                  className="!rounded-lg bg-sky-700 hover:bg-sky-800 text-white px-4 py-2 text-xs sm:text-sm mt-2"
                >
                  Edit Project & Generate Quote
                </button>
              </div>
            </div>

            <div className="flex flex-row justify-between">
              <button
                onClick={() => setNavState("Measurement")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg border px-2 h-8 bg-white"
              >
                Back
              </button>
              <button
                onClick={() => setNavState("Goods")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg text-white border px-2 h-8 bg-sky-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {navState == "Goods" && (
          <div className="flex flex-col w-full gap-3 mt-3">
            <div className="w-full">
              <p className="text-base sm:text-lg font-semibold mb-2">Goods</p>
              <table className="w-full table-auto">
                <thead>
                  <tr className="bg-gray-100 flex flex-col sm:flex-row text-center hidden sm:flex">
                    <th className="w-full sm:w-[10%] py-1 text-xs sm:text-sm">
                      Sr.No.
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Area
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Product Group
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Company
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Catalogue
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Design No
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Date
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Status
                    </th>
                    <th className="w-full sm:w-[10%] py-1 text-xs sm:text-sm">
                      Order ID
                    </th>
                    <th className="w-full sm:w-[15%] py-1 text-xs sm:text-sm">
                      Remark
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {goodsArray != undefined &&
                    goodsArray.map((goods, index) => {
                      const selection = selections[goods.mainindex];
                      const collection =
                        selection?.areacollection?.[goods.groupIndex];
                      return (
                        <tr
                          key={index}
                          className="flex flex-col sm:flex-row text-center border-b sm:border-b-0"
                        >
                          <td className="w-full sm:w-[10%] py-1 text-xs sm:text-sm before:content-['Sr.No.:_'] sm:before:content-none before:font-bold before:pr-2">
                            {index + 1}
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Area:_'] sm:before:content-none before:font-bold before:pr-2">
                            {selection?.area || ""}
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Product_Group:_'] sm:before:content-none before:font-bold before:pr-2">
                            {goods?.item?.[0] || ""}
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Company:_'] sm:before:content-none before:font-bold before:pr-2">
                            {collection.company[0] || ""}
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Catalogue:_'] sm:before:content-none before:font-bold before:pr-2">
                            {collection?.catalogue || ""}
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Design_No:_'] sm:before:content-none before:font-bold before:pr-2">
                            {collection?.designNo || ""}
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Date:_'] sm:before:content-none before:font-bold before:pr-2">
                            <input
                              type="date"
                              className="border !rounded-lg w-full px-2 py-1 text-xs sm:text-sm text-center sm:min-w-[100px]"
                              value={goods?.date || ""}
                              onChange={(e) =>
                                setGoodsDate(index, e.target.value)
                              }
                            />
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Status:_'] sm:before:content-none before:font-bold before:pr-2">
                            <select
                              className="border !rounded-lg w-full px-2 py-1 text-xs sm:text-sm sm:min-w-[100px]"
                              value={goods?.status || ""}
                              onChange={(e) =>
                                setGoodsStatus(index, e.target.value)
                              }
                            >
                              <option value="">Pending</option>
                              {statusArray.map((data, i) => (
                                <option key={i} value={data}>
                                  {data}
                                </option>
                              ))}
                            </select>
                          </td>
                          <td className="w-full sm:w-[10%] py-1 text-xs sm:text-sm before:content-['Order_ID:_'] sm:before:content-none before:font-bold before:pr-2">
                            <input
                              type="text"
                              className="border !rounded-lg w-full px-2 py-1 text-xs sm:text-sm text-center sm:min-w-[80px]"
                              value={goods?.orderID || ""}
                              onChange={(e) =>
                                setGoodsOrderID(index, e.target.value)
                              }
                            />
                          </td>
                          <td className="w-full sm:w-[15%] py-1 text-xs sm:text-sm before:content-['Remark:_'] sm:before:content-none before:font-bold before:pr-2">
                            <input
                              type="text"
                              className="border !rounded-lg w-full px-2 py-1 text-xs sm:text-sm sm:min-w-[100px]"
                              value={goods?.remark || ""}
                              onChange={(e) =>
                                setGoodsRemark(index, e.target.value)
                              }
                            />
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
            <div className="flex flex-row justify-between">
              <button
                onClick={() => setNavState("Quotation")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg border px-2 h-8 bg-white"
              >
                Back
              </button>
              <button
                onClick={() => setNavState("Tailors")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg text-white border px-2 h-8 bg-sky-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
        {navState === "Tailors" && (
          <TailorsSection
            updateTailorRate={updateTailorRate}
            updateTailorRemark={updateTailorRemark}
            updateTailorData={updateTailorData}
            updateTailorStatus={updateTailorStatus}
            tailors={tailors}
            statusArray={statusArray}
            selections={selections}
            setNavState={setNavState}
            tailorsArray={tailorsArray}
            setTailorsArray={setTailorsArray}
          />
        )}
        {navState == "Payments" && (
          <PaymentsSection
            addPayment={addPayment}
            setAddPayment={setAddPayment}
            Amount={Amount}
            Tax={Tax}
            Received={Paid}
            Discount={Discount}
            paymentData={paymentData}
            deletePayment={deletePayment}
            setNavState={setNavState}
            setEditPayments={setEditPayments}
            setPayment={setPayment}
            setPaymentDate={setPaymentDate}
            setPaymentRemarks={setPaymentRemarks}
            setPaymentMode={setPaymentMode}
            projectData={projectData}
            discountType={discountType}
          />
        )}
        {addPayment && (
          <div className="flex flex-col z-50 justify-between gap-3 w-[50vw] border !rounded-xl p-3">
            <div className="flex flex-col">
              <div className="flex flex-row gap-1">
                <p className=" ">Amount Received</p>
                <p className="text-red-500">*</p>
              </div>
              <input
                type="text"
                value={payment}
                className="border-1 !rounded-lg pl-2 h-8"
                onChange={(e) =>
                  setPayment(
                    e.target.value == "" ? 0 : parseFloat(e.target.value)
                  )
                }
              />
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row gap-1">
                <p className=" ">Payment Date</p>
                <p className="text-red-500">*</p>
              </div>
              <input
                type="date"
                value={paymentDate}
                className="border-1 !rounded-lg pl-2 h-8 pr-2"
                onChange={(e) => setPaymentDate(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row gap-1">
                <p className=" ">Payment Mode</p>
                <p className="text-red-500">*</p>
              </div>
              <input
                type="text"
                value={paymentMode}
                className="border-1 !rounded-lg pl-2 h-8"
                onChange={(e) => setPaymentMode(e.target.value)}
              />
            </div>
            <div className="flex flex-col">
              <div className="flex flex-row gap-1">
                <p className=" ">Remarks</p>
                <p className="text-red-500">*</p>
              </div>
              <input
                type="text"
                value={paymentRemarks}
                className="border-1 !rounded-lg pl-2 h-8"
                onChange={(e) => setPaymentRemarks(e.target.value)}
              />
            </div>
            <div className="flex flex-row justify-end gap-3">
              <button
                onClick={() => {
                  if (editPayments != undefined) {
                    setEditPayments(undefined);
                  }
                  setCancelPayment();
                }}
                style={{ borderRadius: "8px" }}
                className="border-2 border-sky-700 text-sky-600 bg-white px-2 h-8"
              >
                Close
              </button>
              <button
                onClick={() => addPaymentFunction()}
                style={{ borderRadius: "8px" }}
                className={`${
                  editPayments == undefined ? "" : "hidden"
                } text-white bg-sky-600 hover:bg-sky-700 px-2 h-8`}
              >
                Add Payment
              </button>
              <button
                onClick={() => addPaymentFunction()}
                style={{ borderRadius: "8px" }}
                className={`${
                  editPayments != undefined ? "" : "hidden"
                } text-white bg-sky-600 hover:bg-sky-700 px-2 h-8`}
              >
                Edit Payment
              </button>
            </div>
          </div>
        )}
        {navState == "Tasks" && (
          <div className="flex flex-col w-full justify-between gap-3 mt-3 p-3">
            <div className="flex flex-col sm:flex-row w-full justify-between items-start sm:items-center gap-2">
              <p className="font-semibold">Tasks</p>
              <button
                onClick={() => setTaskDialogOpen(true)}
                className="bg-sky-600 text-white hover:bg-sky-700 px-2 h-8 !rounded-lg"
              >
                Add Task
              </button>
            </div>

            {/* Task Filters - Responsive wrap */}
            <div className="flex flex-wrap gap-5">
              {["All Tasks", "To Do", "In Progress", "Completed"].map(
                (label) => (
                  <div className="flex flex-col gap-3" key={label}>
                    <button
                      onClick={() => setTaskFilter(label)}
                      className="text-gray-600 font-semibold"
                    >
                      {label}
                    </button>
                    <div
                      className={`${
                        taskFilter !== label ? "bg-white" : "bg-sky-500"
                      } w-full h-[2px] !rounded-full`}
                    ></div>
                  </div>
                )
              )}
            </div>

            {/* Responsive Table Wrapper */}
            <div className="overflow-x-auto w-full">
              <table className="w-full min-w-[900px] p-3">
                <thead>
                  <tr>
                    <td>Sr.No.</td>
                    <td>Task Name</td>
                    <td>Priority</td>
                    <td>Project</td>
                    <td>Assignee</td>
                    <td>Due Date</td>
                    <td>Status</td>
                    <td>Created At</td>
                    <td>Actions</td>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.map((task, index) => (
                    <tr
                      key={index}
                      className="max-h-fit border-b border-gray-200 py-3"
                    >
                      <td className="py-2">{index + 1}</td>
                      <td className="py-2">{task[0]}</td>
                      <td
                        className={`py-2 font-semibold ${
                          task[6] === "Low"
                            ? "text-green-600"
                            : task[6] === "Moderate"
                            ? "text-yellow-600"
                            : task[6] === "High"
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        {task[6]}
                      </td>
                      <td className="py-2">{task[5]}</td>
                      <td className="py-2">{task[4]}</td>
                      <td className="py-2">{task[2]}</td>
                      <td
                        className={`py-2 font-semibold ${
                          task[7] === "Completed"
                            ? "text-green-600"
                            : task[7] === "In Progress"
                            ? "text-yellow-600"
                            : task[7] === "To Do"
                            ? "text-red-500"
                            : ""
                        }`}
                      >
                        {task[7]}
                      </td>
                      <td className="py-2">{task[3]}</td>
                      <td className="flex flex-row gap-2 items-center py-2">
                        <button
                          onClick={() => {
                            setName(task[0]);
                            setediting(task);
                            setTaskDialogOpen(true);
                          }}
                        >
                          <Edit size={18} />
                        </button>
                        <button onClick={() => deleteTask(task[0])}>
                          <FaTrash size={18} className="text-red-500" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Navigation Buttons */}
            <div className="flex flex-row justify-between">
              <button
                onClick={() => setNavState("Payments")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg border px-2 h-8 bg-white"
              >
                Back
              </button>
              <button
                onClick={() => setNavState("Overview")}
                style={{ borderRadius: "8px" }}
                className="!rounded-lg text-white border px-2 h-8 bg-sky-600"
              >
                Next
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {taskDialogOpen && (
            <>
              <motion.div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setTaskDialogOpen(false)}
              />
              <motion.div
                className="fixed inset-0 z-50 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                <TaskDialog
                  onClose={() => setTaskDialogOpen(false)}
                  isEditing={editing}
                  setediting={setediting}
                  name={name}
                  projectData={projects}
                  setTaskDialogOpen={setTaskDialogOpen}
                  taskDialogOpen={taskDialogOpen}
                  setProjectFlag={setProjectFlag}
                  setAdded={setAdded}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default EditProjects;
