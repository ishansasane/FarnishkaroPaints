import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { RootState } from "../Redux/store";
import {
  setSalesAssociateData,
  setInteriorData,
  setCustomerData,
  setProducts,
  setCatalogs,
  setProjects,
  setItemData,
  setTermsData,
  setBankData,
} from "../Redux/dataSlice";
import { Plus, Upload } from "lucide-react";
import { FaPlus, FaTrash } from "react-icons/fa";
import CustomerDetails from "./CustomerDetails";
import ProjectDetails from "./ProjectDetails";
import MaterialSelectionComponent from "./MaterialSelectionComponent";
import MeasurementSection from "./MeasurementSections";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { fetchWithLoading } from "../Redux/fetchWithLoading";

function AddProjectForm() {
  const dispatch = useDispatch();
  const customerData = useSelector((state: RootState) => state.data.customers);
  const interiorData = useSelector((state: RootState) => state.data.interiors);
  const salesAssociateData = useSelector(
    (state: RootState) => state.data.salesAssociates
  );
  const products = useSelector((state: RootState) => state.data.products);
  const items = useSelector((state: RootState) => state.data.items);

  let projectData: any[] = [];
  const [count, setCount] = useState(0);

  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);

  const [singleItems, setSingleItems] = useState<any[]>([]);

  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);

  const [interior, setInterior] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);

  const termData = useSelector((state: RootState) => state.data.termsData);
  const bankData = useSelector((state: RootState) => state.data.bankData);

  const [terms, setTerms] = useState("NA");
  const [bank, setBank] = useState("NA");
  const [availableProductGroups, setAvailableProductGroups] = useState<any[]>(
    []
  );

  const catalogueData = useSelector((state: RootState) => state.data.catalogs);

  let availableCompanies = ["D Decor", "Asian Paints", "ZAMAN"];

  const designNo = ["514", "98", "123"];

  const [amount, setAmount] = useState(0);
  const [tax, setTax] = useState(0);
  const [paid, setPaid] = useState(0);
  const [discount, setDiscount] = useState(0);

  const [additionalItems, setAdditionalItems] = useState<Additional[]>([]);

  const [projectAddress, setProjectAddress] = useState(null);

  const projects = useSelector((state: RootState) => state.data.projects);

  const [discountType, setDiscountType] = useState("cash");

  const [grandTotal, setGrandTotal] = useState(0);

  interface Additional {
    name: string;
    quantity: number;
    rate: number;
    netRate: number;
    tax: number;
    taxAmount: number;
    totalAmount: number;
    remark: string;
  }

  interface AreaSelection {
    area: string;
    areacollection: CollectionArea[];
  }

  interface Measurements {
    unit: string;
    width: number;
    height: number;
    quantity: number;
    newquantity?: number;
  }

  interface CollectionArea {
    productGroup: any;
    items: any;
    company: string | null;
    catalogue: any[];
    designNo: string | null;
    reference: string | null;
    measurement: Measurements;
    totalAmount: number[];
    totalTax: number[];
    quantities: any[];
  }

  interface ProductGroup {
    groupName: string;
    mainProducts: string;
    addonProducts: string;
    color: string;
    needsTailoring: boolean;
  }

  interface Goods {
    pg: any;
    date: any;
    status: any;
    orderID: any;
    remark: any;
    mainindex: any;
    groupIndex: any;
    item: any;
  }

  interface Tailor {
    pg: any;
    rate: any;
    tailorData: any;
    status: any;
    remark: any;
    mainindex: any;
    groupIndex: any;
    item: any;
  }

  const [goodsArray, setGoodsArray] = useState<Goods[]>([]);
  const [tailorsArray, setTailorsArray] = useState<Tailor[]>([]);

  const [selections, setSelections] = useState<AreaSelection[]>([]);
  const [availableAreas, setAvailableAreas] = useState([]);

  const getItemsData = async () => {
    const response = await fetchWithLoading(
      "https://sheeladecor.netlify.app/.netlify/functions/server/getsingleproducts"
    );
    const data = await response.json();
    return data.body;
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/getpaintscustomerdata",
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
      console.error("Error fetching customer data:", error);
      return [];
    }
  };

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
        "https://sheeladecor.netlify.app/.netlify/functions/server/getsalesassociatedata",
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

  const handleAddArea = () => {
    setSelections([...selections, { area: "", areacollection: [] }]);
  };

  const handleRemoveArea = (index: number) => {
    const updatedSelections = selections.filter((_, i) => i !== index);
    setSelections(updatedSelections);
  };

  const handleAreaChange = (mainindex: number, newArea: string) => {
    const updatedSelections = [...selections];
    if (updatedSelections[mainindex]) {
      updatedSelections[mainindex].area = newArea;
    }
    setSelections(updatedSelections);
  };

  const handleProductGroupChange = (
    mainindex: number,
    i: number,
    product: string
  ) => {
    const updatedSelections = [...selections];

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

    let relevantPG = pg.length > 2 ? pg.slice(1, -1) : null;

    let newMatchedItems = null;

    if (relevantPG != null) {
      newMatchedItems = relevantPG
        .map((pgItem) => items.find((item) => item[0] === pgItem))
        .filter((item) => Array.isArray(item));
    } else {
      newMatchedItems = [product];
    }

    if (newMatchedItems.length == 0) {
      newMatchedItems = [product.split(",")];
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
        totalAmount: [],
        totalTax: [],
        quantities: [],
      };
    }

    updatedSelections[mainindex].areacollection[i].catalogue = catalogue[0];
    setSelections(updatedSelections);
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

    updatedSelections[mainindex].areacollection[i].company = company;
    setSelections(updatedSelections);
  };

  const handleDesignNoChange = (
    mainindex: number,
    i: number,
    designNo: string
  ) => {
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
        totalAmount: [],
        totalTax: [],
        quantities: [],
      };
    }

    updatedSelections[mainindex].areacollection[i].designNo = designNo;
    setSelections(updatedSelections);
  };

  const handleReferenceChange = (
    mainindex: number,
    i: number,
    reference: string
  ) => {
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
        totalAmount: [],
        totalTax: [],
        quantities: [],
      };
    }

    updatedSelections[mainindex].areacollection[i].reference = reference;
    setSelections(updatedSelections);
  };

  const handleAddNewGroup = (mainindex: number, productGroupString = "") => {
    const updatedSelections = [...selections];

    if (!updatedSelections[mainindex]?.areacollection) {
      updatedSelections[mainindex].areacollection = [];
    }

    const groupIndex = updatedSelections[mainindex].areacollection.length;

    const productGroupArray = productGroupString
      ? productGroupString.split(",")
      : [];

    const relevantPG =
      productGroupArray.length > 2 ? productGroupArray.slice(1, -2) : [];

    const matchedItems = relevantPG
      .map((pgName) => items.find((item) => item[0] === pgName))
      .filter((item) => Array.isArray(item));

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

    const newTailors = matchedItems
      .filter((item) => item[7] == true)
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

    setGoodsArray((prev) => [...prev, ...newGoods]);
    setTailorsArray((prev) => [...prev, ...newTailors]);
  };

  const handleGroupDelete = (mainindex: number, index: number) => {
    const updatedSelection = [...selections];
    if (updatedSelection[mainindex].areacollection[index]) {
      updatedSelection[mainindex].areacollection.splice(index, 1);
    }
    setSelections(updatedSelection);
  };

  const units = ["Inches (in)", "Centimeter (cm)", "Meters (m)", "Feet (ft)"];
  const getSubtotal = (
    rate: number,
    measurementQty: number,
    quantity: number
  ): string => {
    const subtotal = rate * measurementQty * quantity;
    return subtotal.toFixed(2);
  };

  const handleWidthChange = (
    mainindex: number,
    index: number,
    width: number
  ) => {
    const updatedSelections = [...selections];
    updatedSelections[mainindex].areacollection[index].measurement.width =
      width;
    setSelections(updatedSelections);
  };

  const handleHeightChange = (
    mainindex: number,
    index: number,
    height: number
  ) => {
    const updatedSelections = [...selections];
    updatedSelections[mainindex].areacollection[index].measurement.height =
      height;
    setSelections(updatedSelections);
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
      (item) => parseFloat(item.taxAmount.toString()) || 0
    );

    const additionalAmountArray = additionalItems.map(
      (item) => parseFloat(item.totalAmount.toString()) || 0
    );

    const totalTax = parseFloat(
      [...selectionTaxArray, ...additionalTaxArray]
        .reduce((acc, curr) => acc + curr, 0)
        .toFixed(2)
    );

    const totalAmount = parseFloat(
      [...selectionAmountArray, ...additionalAmountArray]
        .reduce((acc, curr) => acc + curr, 0)
        .toFixed(2)
    );

    return { totalTax, totalAmount };
  };

  const handleQuantityChangeMain = (
    mainIndex: number,
    index: number,
    quantity: number
  ) => {
    const updatedSelections = [...selections];
    const areaCol = updatedSelections[mainIndex].areacollection[index];

    // Ensure quantities array is initialized
    if (!areaCol.quantities) areaCol.quantities = [];

    // Sync both measurement and quotation section
    areaCol.measurement.quantity = quantity;
    areaCol.quantities[0] = quantity.toString();

    const discountRaw =
      discountType === "cash" ? `${discount}` : `${discount}%`;

    const isPercent =
      typeof discountRaw === "string" && discountRaw.toString().includes("%");
    const discountValue =
      parseFloat(discountRaw.toString().replace("%", "")) || 0;

    if (areaCol.items !== undefined) {
      if (!areaCol.totalTax) areaCol.totalTax = [];
      if (!areaCol.totalAmount) areaCol.totalAmount = [];

      // Step 1: Calculate total pre-tax amount for flat discount
      let preTaxTotal = 0;
      areaCol.items.forEach((item, i) => {
        const itemQuantity = parseFloat(areaCol.quantities?.[i]) || 0;
        const itemRate = parseFloat(item[4]) || 0;
        preTaxTotal += quantity * itemQuantity * itemRate;
      });

      const effectiveDiscountPercent = isPercent
        ? discountValue
        : preTaxTotal > 0
        ? (discountValue / preTaxTotal) * 100
        : 0;

      // Step 2: Calculate per item with discount + tax
      const corrected = areaCol.items.map((item, i) => {
        const itemQuantity = parseFloat(areaCol.quantities?.[i]) || 0;
        const itemRate = parseFloat(item[4]) || 0;
        const itemTaxPercent = parseFloat(item[5]) || 0;

        const baseAmount = quantity * itemQuantity * itemRate;
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

      areaCol.items = corrected;
    }

    setSelections(updatedSelections);

    const { totalTax, totalAmount } = recalculateTotals(
      updatedSelections,
      additionalItems
    );
    setTax(totalTax);
    setAmount(totalAmount);
    setGrandTotal(parseFloat(totalAmount.toFixed(2))); // ✅ Grand Total = Amount + Tax
  };

  const handleUnitChange = (mainindex: number, index: number, unit: string) => {
    const updatedSelections = [...selections];
    updatedSelections[mainindex].areacollection[index].measurement.unit = unit;
    setSelections(updatedSelections);
  };

  const [quantities, setQuantities] = useState<{ [key: string]: string }>({});

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

    // Ensure quantities array is initialized
    if (!areaCol.quantities) areaCol.quantities = [];

    // Sync both quotation and measurement
    areaCol.quantities[itemIndex] = value;
    areaCol.measurement.quantity = valueNum;

    // Step 2: Compute effective discount
    // Step 2: Compute effective discount
    let effectiveDiscountPercent = 0;
    const baseCost = num1 * quantityNum * valueNum;

    if (discountType === "percent") {
      effectiveDiscountPercent = discount;
    } else if (discountType === "cash") {
      effectiveDiscountPercent = baseCost > 0 ? (discount / baseCost) * 100 : 0;
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
      discountAmt = (totalAmount * discount) / 100;
    } else if (discountType === "cash") {
      discountAmt = discount;
    }

    const grandTotal = parseFloat(totalAmount.toFixed(2)); // if you're tracking this
    setGrandTotal(grandTotal);
  };

  const handleAddMiscItem = () => {
    setAdditionalItems((prev) => [
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
  const handleTaxChange = (
    mainIndex: number,
    collectionIndex: number,
    newTaxRate: number,
    rate: number,
    measurementQty: number,
    qty: number
  ) => {
    const updatedSelections = [...selections];
    const collection =
      updatedSelections[mainIndex].areacollection[collectionIndex];

    const totalMRP = rate * parseFloat(measurementQty || "0");
    const subtotal = totalMRP * qty;
    const taxAmount = subtotal * (newTaxRate / 100);
    const total = subtotal + taxAmount;

    // Update tax rate in item
    collection.items[0][5] = newTaxRate;
    collection.totalTax[0] = taxAmount;
    collection.totalAmount[0] = total;

    setSelections(updatedSelections);

    const { totalTax, totalAmount } = recalculateTotals(
      updatedSelections,
      additionalItems
    );
    setTax(totalTax);
    setAmount(totalAmount);
    setGrandTotal(parseFloat(totalAmount.toFixed(2)));
  };

  // Delete item by index
  const handleDeleteMiscItem = (itemIndex: number) => {
    const updated = [...additionalItems];
    updated.splice(itemIndex, 1);
    setAdditionalItems(updated);

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

  const handleItemNameChange = (i: number, value: string) => {
    const updated = [...additionalItems];
    updated[i].name = value;
    setAdditionalItems(updated);
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
      effectiveDiscountPercent = discount;
    } else if (discountType === "cash") {
      const totalBeforeDiscount = baseNetRate;
      effectiveDiscountPercent =
        totalBeforeDiscount > 0 ? (discount / totalBeforeDiscount) * 100 : 0;
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

    setAdditionalItems(updated);

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
  const [itemTax, setItemTax] = useState(0);
  const [itemTotal, setItemTotal] = useState(0);

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

    setAdditionalItems(updatedItems);
    setItemTax(parseFloat(totalTax.toFixed(2)));
    setItemTotal(parseFloat(totalAmount.toFixed(2)));
  };

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

    setAdditionalItems(updated);

    const { totalTax, totalAmount } = recalculateTotals(selections, updated);
    setTax(totalTax);
    setAmount(totalAmount);
    setGrandTotal(parseFloat(totalAmount.toFixed(2))); // ✅ Grand total logic added
  };

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

    setAdditionalItems(updated);

    const { totalTax, totalAmount } = recalculateTotals(selections, updated);
    setTax(totalTax);
    setAmount(totalAmount);
    setGrandTotal(parseFloat(totalAmount.toFixed(2))); // ✅ Grand total logic added
  };

  const [status, changeStatus] = useState("approved");
  const [interiorArray, setInteriorArray] = useState<any[]>([]);
  const [salesAssociateArray, setSalesAssociateArray] = useState<any[]>([]);
  const [projectName, setProjectName] = useState("");
  const [projectReference, setProjectReference] = useState("");
  const [user, setUser] = useState("");
  const [projectDate, setProjectDate] = useState("");
  const [additionalRequests, setAdditionalRequests] = useState("");
  const [termsAndConditions, setTermsAndConditions] = useState("");

  const handleItemRemarkChange = (i: number, remark: string) => {
    const updated = [...additionalItems];
    updated[i].remark = remark;
    setAdditionalItems(updated);
  };

  const [selectedMainIndex, setSelectedMainIndex] = useState<number | null>(
    null
  );
  const [selectedCollectionIndex, setSelectedCollectionIndex] = useState<
    number | null
  >(null);

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

  const parseSafely = (input: any, fallback: any) => {
    if (typeof input !== "string") return fallback;
    try {
      return JSON.parse(input);
    } catch {
      return fallback;
    }
  };

  const deepClone = (obj: any): any => {
    if (obj === null || typeof obj !== "object") return obj;
    if (Array.isArray(obj)) return obj.map(deepClone);
    const cloned: { [key: string]: any } = {};
    for (const key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  };

  const handleDiscountChange = (newDiscount, newDiscountType) => {
    // --- Update discount state (if required) ---
    setDiscount(newDiscount);
    setDiscountType(newDiscountType);

    // --- Deep clone selections and additionalItems ---
    const updatedSelections = [...selections];
    const updatedAdditionalItems = [...additionalItems];

    // === Recalculate Area-Based Items ===
    updatedSelections.forEach((selection) => {
      selection.areacollection.forEach((areaCol) => {
        const quantity = areaCol.measurement.quantity || 0;
        if (!areaCol.totalTax) areaCol.totalTax = [];
        if (!areaCol.totalAmount) areaCol.totalAmount = [];

        // Calculate pre-tax total
        let preTaxTotal = 0;
        areaCol.items?.forEach((item, i) => {
          const itemQty = parseFloat(areaCol.quantities?.[i]) || 0;
          const itemRate = parseFloat(item[4]) || 0;
          preTaxTotal += quantity * itemQty * itemRate;
        });

        const isPercent = newDiscountType === "percent";
        const effectiveDiscountPercent = isPercent
          ? newDiscount
          : preTaxTotal > 0
          ? (newDiscount / preTaxTotal) * 100
          : 0;

        // Apply discount to each item
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
        ? newDiscount
        : totalBeforeDiscount > 0
        ? (newDiscount / totalBeforeDiscount) * 100
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
    setAdditionalItems(updatedAdditionalItems);

    const { totalTax, totalAmount } = recalculateTotals(
      updatedSelections,
      updatedAdditionalItems
    );
    setTax(totalTax);
    setAmount(totalAmount);
    setGrandTotal(parseFloat(totalAmount.toFixed(2)));
  };

  const fixBrokenArray = (input: any): string[] => {
    if (Array.isArray(input)) return input;
    if (typeof input !== "string") return [];
    try {
      const parsed = JSON.parse(input);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      const cleaned = input
        .replace(/^\[|\]$/g, "")
        .split(",")
        .map((item: string) => item.trim().replace(/^"+|"+$/g, ""));
      return cleaned;
    }
  };

  const sendProjectData = async () => {
    try {
      let allProjects = projects;

      if (!allProjects || allProjects.length === 0) {
        allProjects = await fetchProjectData();
        dispatch(setProjects(allProjects));
      }

      const isDuplicate = allProjects.some(
        (project) =>
          project.projectName?.toLowerCase().trim() ===
          projectName?.toLowerCase().trim()
      );

      if (isDuplicate) {
        alert(`Project "${projectName}" already exists.`);
        return;
      }

      let date = new Date();
      const day = date.getDay();
      const month = date.getMonth();
      const year = date.getFullYear();

      const newdate = day + "/" + month + "/" + year;

      const finalAmount =
        typeof amount !== "undefined" && !isNaN(amount)
          ? amount
          : parseFloat(paymentData?.totalValue || "0");

      const finalPaid =
        typeof paid !== "undefined" && !isNaN(paid)
          ? paid
          : parseFloat(paymentData?.paid || "0");

      const finalGrandTotal =
        typeof grandTotal !== "undefined" && !isNaN(grandTotal)
          ? grandTotal
          : finalAmount;

      const response = await fetchWithLoading(
        "https://sheeladecor.netlify.app/.netlify/functions/server/sendpaintsprojectdata",
        {
          method: "POST",
          credentials: "include",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            projectName,
            customerLink: JSON.stringify(selectedCustomer),
            projectReference,
            status,
            totalAmount: finalAmount,
            totalTax: tax,
            paid,
            discount,
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
            date: newdate,
            grandTotal,
            discountType,
            bankDetails: JSON.stringify(bank),
            termsConditions: JSON.stringify(terms),
          }),
        }
      );

      if (response.status === 200) {
        alert("Project Added");
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

  useEffect(() => {
    const fetchAndDispatch = async (
      fetchFn: () => Promise<any>,
      dispatchFn: (data: any) => void,
      key: string,
      setStateFn?: (data: any) => void
    ) => {
      try {
        const oneHour = 3600 * 1000;
        let shouldFetch = true;

        const cached = localStorage.getItem(key);
        if (cached) {
          const { data, time } = JSON.parse(cached);

          if (Date.now() - time < oneHour) {
            dispatch(dispatchFn(data));
            setStateFn?.(data);
            shouldFetch = false;
          } else {
            localStorage.removeItem(key);
          }
        }

        if (shouldFetch) {
          const freshData = await fetchFn();
          dispatch(dispatchFn(freshData));
          setStateFn?.(freshData);
          localStorage.setItem(
            key,
            JSON.stringify({ data: freshData, time: Date.now() })
          );
        }
      } catch (error) {
        console.error(`Error fetching ${key}:`, error);
      }
    };

    const fetchAllData = async () => {
      await Promise.all([
        fetchAndDispatch(
          fetchInteriors,
          setInteriorData,
          "interiorData",
          setInterior
        ),
        fetchAndDispatch(
          getItemsData,
          setItemData,
          "itemsData",
          setSingleItems
        ),
        fetchAndDispatch(
          fetchSalesAssociates,
          setSalesAssociateData,
          "salesAssociateData",
          setSalesData
        ),
        fetchAndDispatch(
          fetchProductGroups,
          setProducts,
          "productsData",
          setAvailableProductGroups
        ),
        fetchAndDispatch(fetchCatalogues, setCatalogs, "catalogueData"),
        fetchAndDispatch(
          fetchCustomers,
          setCustomerData,
          "customerData",
          setCustomers
        ),
      ]);
    };

    fetchAllData();
  }, [dispatch]);

  useEffect(() => {
    async function getAreas() {
      try {
        const cachedData = localStorage.getItem("areasData");
        const oneHour = 3600 * 1000;

        if (cachedData) {
          const { data, time } = JSON.parse(cachedData);

          if (Date.now() - time < oneHour) {
            setAvailableAreas(data);
            return;
          } else {
            localStorage.removeItem("areasData");
          }
        }

        const response = await fetchWithLoading(
          "https://sheeladecor.netlify.app/.netlify/functions/server/getAreas"
        );
        const data = await response.json();
        setAvailableAreas(data.body);

        localStorage.setItem(
          "areasData",
          JSON.stringify({ data: data.body, time: Date.now() })
        );
      } catch (error) {
        console.error("Error fetching areas:", error);
      }
    }

    if (availableAreas.length === 0) {
      getAreas();
    }
  }, []);

  const bankDetails = ["123213", "!23123213", "123132"];
  const termsConditions = ["sadsdsad", "Adasdad"];

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yOffset = 20;

    // Colors and fonts
    doc.setFont("helvetica", "normal");
    const primaryColor = [0, 51, 102];
    const secondaryColor = [33, 33, 33];
    const accentColor = [0, 102, 204];
    const lightGray = [245, 245, 245];

    // Header
    doc.setFillColor(...primaryColor);
    doc.rect(0, 0, pageWidth, 30, "F");
    doc.setFillColor(...accentColor);
    doc.rect(0, 30, pageWidth, 1, "F");
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("Quotation", pageWidth / 2, 18, { align: "center" });

    // Company Details
    yOffset += 15;
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.setFont("helvetica", "normal");
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

    // Project and Customer Details Box
    doc.setFillColor(...lightGray);
    doc.roundedRect(15, yOffset, pageWidth - 30, 25, 2, 2, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...primaryColor);
    doc.text("Project Details", 20, yOffset + 6);
    doc.text("Customer Details", pageWidth / 2 + 5, yOffset + 6);

    yOffset += 12;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text(`Project Name: ${projectName || "N/A"}`, 20, yOffset);
    doc.text(
      `Customer: ${selectedCustomer?.name || "N/A"}`,
      pageWidth / 2 + 5,
      yOffset
    );
    yOffset += 5;
    doc.text(`Address: ${projectAddress || "N/A"}`, pageWidth / 2 + 5, yOffset);
    yOffset += 5;
    doc.text(
      `Date: ${projectDate || new Date().toLocaleDateString()}`,
      20,
      yOffset
    );
    yOffset += 10;

    // Table Data
    const tableData: any[] = [];
    let srNo = 1;

    selections.forEach((selection) => {
      if (selection.areacollection?.length > 0) {
        tableData.push([
          {
            content: selection.area,
            colSpan: 9,
            styles: {
              fontStyle: "bold",
              fontSize: 9,
              fillColor: accentColor,
              textColor: [255, 255, 255],
            },
          },
        ]);

        selection.areacollection.forEach((collection) => {
          const pg = collection.productGroup;
          if (!Array.isArray(pg) || pg.length < 2) return;

          const relevantPG = pg.slice(1, -2);
          relevantPG.forEach((pgItem, index) => {
            const item = items.find((it) => it[0] === pgItem);
            if (!item) return;

            const qty = parseFloat(collection.quantities?.[index]) || 0;
            const measurementQty = parseFloat(
              collection.measurement?.quantity || "0"
            );
            const size =
              collection.measurement.width && collection.measurement.height
                ? `${collection.measurement.width} x ${
                    collection.measurement.height
                  } ${collection.measurement.unit || ""}`
                : "N/A";
            const mrp = parseFloat(item[4]) * measurementQty;
            const subtotal = mrp * qty;
            const taxRate = parseFloat(item[5]) || 0;
            const taxAmount =
              parseFloat(collection.totalTax?.[index]?.toString()) || 0;
            const total =
              parseFloat(collection.totalAmount?.[index]?.toString()) || 0;

            tableData.push([
              srNo++,
              `${item[0]} * ${measurementQty}`,
              size,
              `INR ${mrp.toFixed(2)}`,
              qty.toString(),
              `INR ${subtotal.toFixed(2)}`,
              `${taxRate.toFixed(2)}%`,
              `INR ${taxAmount.toFixed(2)}`,
              `INR ${total.toFixed(2)}`,
            ]);
          });
        });
      }
    });

    if (additionalItems.length > 0) {
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

      additionalItems.forEach((item, idx) => {
        const qty = parseFloat(item.quantity?.toString()) || 0;
        const rate = parseFloat(item.rate?.toString()) || 0;
        const netRate = parseFloat(item.netRate?.toString()) || 0;
        const tax = parseFloat(item.tax?.toString()) || 0;
        const taxAmount = parseFloat(item.taxAmount?.toString()) || 0;
        const totalAmount = parseFloat(item.totalAmount?.toString()) || 0;

        tableData.push([
          srNo++,
          item.name || `Misc Item ${idx + 1}`,
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

    // Improved wider table layout
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
        fontSize: 7.5,
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
        fontSize: 8,
        halign: "center",
        cellPadding: 1.5,
      },
      alternateRowStyles: {
        fillColor: lightGray,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 35 },
        2: { cellWidth: 28 },
        3: { cellWidth: 22, halign: "right" },
        4: { cellWidth: 12, halign: "center" },
        5: { cellWidth: 22, halign: "right" },
        6: { cellWidth: 12, halign: "center" },
        7: { cellWidth: 15, halign: "right" },
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

    const tableEndY = (doc as any).lastAutoTable.finalY;
    const summaryBoxHeight = 50;
    const footerHeight = 25;
    const bottomMargin = footerHeight + 10;

    // Smart placement for Summary Box
    if (tableEndY + summaryBoxHeight + bottomMargin > pageHeight) {
      doc.addPage();
      yOffset = 15;
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

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);

    const numericAmount = Number(amount) || 0;
    const numericTax = Number(tax) || 0;
    const numericDiscount = Number(discount) || 0;
    const summaryItems = [
      { label: "Total Amount", value: `INR ${numericAmount.toFixed(2)}` },
      { label: "Discount", value: `INR ${numericDiscount.toFixed(2)}` },
      { label: "Total Tax", value: `INR ${numericTax.toFixed(2)}` },
      {
        label: "Grand Total",
        value: `INR ${(numericAmount + numericTax - numericDiscount).toFixed(
          2
        )}`,
      },
    ];
    summaryItems.forEach((item) => {
      doc.setFont("helvetica", "bold");
      doc.text(item.label, pageWidth - 85, yOffset);
      doc.setFont("helvetica", "normal");
      doc.text(item.value, pageWidth - 20, yOffset, { align: "right" });
      yOffset += 8;
    });

    // Terms & Conditions
    if (termsAndConditions.trim()) {
      if (yOffset + 30 > pageHeight - footerHeight - 10) {
        doc.addPage();
        yOffset = 15;
      }
      yOffset += 5;
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...primaryColor);
      doc.text("Terms & Conditions", 15, yOffset);
      yOffset += 5;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...secondaryColor);

      const terms = doc.splitTextToSize(termsAndConditions, pageWidth - 30);
      terms.forEach((term: string) => {
        if (yOffset + 5 > pageHeight - footerHeight - 10) {
          doc.addPage();
          yOffset = 15;
        }
        doc.text(`• ${term}`, 15, yOffset);
        yOffset += 5;
      });
    }

    // Footer only on last page
    const footerY = pageHeight - footerHeight;
    doc.setFillColor(...accentColor);
    doc.rect(0, footerY, pageWidth, 1, "F");
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "italic");
    doc.text(
      "Thank you for choosing Sheela Decor!",
      pageWidth / 2,
      footerY + 10,
      { align: "center" }
    );
    doc.setFont("helvetica", "normal");
    doc.text(
      "Sheela Decor - All Rights Reserved",
      pageWidth / 2,
      footerY + 17,
      { align: "center" }
    );

    doc.save(
      `Quotation_${projectName || "Project"}_${
        projectDate || new Date().toLocaleDateString()
      }.pdf`
    );
  };

  const handleMRPChange = (
    mainIndex: number,
    collectionIndex: number,
    value: string,
    measurementQuantity: number,
    taxRate: number,
    qty: number
  ) => {
    const updatedSelections = [...selections];
    const measurementQty = parseFloat(measurementQuantity.toString() || "0");
    const newMRP = parseFloat(value) || 0;

    // Update item[4] to make item[4] * measurementQuantity equal the input MRP
    updatedSelections[mainIndex].areacollection[collectionIndex].items[0][4] =
      measurementQty > 0 ? newMRP / measurementQty : newMRP;

    // Recalculate Subtotal, Tax Amount, and Total
    const subtotal = newMRP * qty;
    const taxAmount = subtotal * (parseFloat(taxRate.toString() || "0") / 100);
    updatedSelections[mainIndex].areacollection[collectionIndex].totalTax[0] =
      taxAmount;
    updatedSelections[mainIndex].areacollection[
      collectionIndex
    ].totalAmount[0] = subtotal + taxAmount;

    // Apply discount
    let effectiveDiscountPercent = 0;
    if (discountType === "percent") {
      effectiveDiscountPercent = discount;
    } else if (discountType === "cash") {
      effectiveDiscountPercent = subtotal > 0 ? (discount / subtotal) * 100 : 0;
    }

    const discountAmount = (subtotal * effectiveDiscountPercent) / 100;
    const discountedSubtotal = subtotal - discountAmount;
    const discountedTaxAmount =
      (discountedSubtotal * parseFloat(taxRate.toString() || "0")) / 100;
    const discountedTotal = discountedSubtotal + discountedTaxAmount;

    updatedSelections[mainIndex].areacollection[collectionIndex].totalTax[0] =
      parseFloat(discountedTaxAmount.toFixed(2));
    updatedSelections[mainIndex].areacollection[
      collectionIndex
    ].totalAmount[0] = parseFloat(discountedTotal.toFixed(2));

    setSelections(updatedSelections);

    // Recalculate totals for summary
    const { totalTax, totalAmount } = recalculateTotals(
      updatedSelections,
      additionalItems
    );
    setTax(totalTax);
    setAmount(totalAmount);
    setGrandTotal(parseFloat(totalAmount.toFixed(2)));
  };

  return (
    <div className="flex flex-col gap-6 p-6 bg-gray-50 min-h-screen w-full">
      {/* Header Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
          Add New Project
        </h1>
        <div className="flex gap-4 text-sm md:text-base">
          <Link
            to="/"
            className="text-blue-600 hover:text-blue-800 transition-colors !no-underline"
          >
            Dashboard
          </Link>
          <Link
            to="/projects"
            className="text-blue-600 hover:text-blue-800 transition-colors !no-underline"
          >
            All Projects
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Customer Details */}
        <div className="bg-white p-6 rounded-xl shadow-none border border-gray-200">
          <CustomerDetails
            customers={customers}
            selectedCustomer={selectedCustomer}
            setSelectedCustomer={setSelectedCustomer}
            projectData={projectData}
            setCustomers={setCustomers}
          />
        </div>

        {/* Project Details */}
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

        {/* Material Selection */}
        <div className="bg-white p-6 rounded-xl shadow-none border border-gray-200">
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
            setAvailableAreas={setAvailableAreas}
            singleItems={singleItems}
            projectData={projectData}
          />
        </div>
        {/* Measurement Section */}
        <div className="bg-white p-6 rounded-xl shadow-none border border-gray-200">
          <MeasurementSection
            selections={selections}
            units={units}
            handleRemoveArea={handleRemoveArea}
            handleReferenceChange={handleReferenceChange}
            handleunitchange={handleUnitChange}
            handlewidthchange={handleWidthChange}
            handleheightchange={handleHeightChange}
            handlequantitychange={handleQuantityChangeMain}
            setSelections={setSelections}
            handleGroupDelete={handleGroupDelete}
          />
        </div>
        {/* Miscellaneous Section */}
        <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              Miscellaneous
            </h2>
            <button
              className="flex items-center gap-1 sm:gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white text-xs sm:text-sm font-medium !rounded-xl hover:bg-blue-700 transition-colors"
              onClick={handleAddMiscItem}
            >
              <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
              Add Item
            </button>
          </div>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full bg-white hidden sm:table">
              <thead>
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
              <tbody>
                {additionalItems.map((item, i) => (
                  <tr key={i} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 text-center text-sm">{i + 1}</td>
                    <td className="py-3 px-4">
                      <input
                        onChange={(e) =>
                          handleItemNameChange(i, e.target.value)
                        }
                        className="w-[120px] border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={item.name || ""}
                        type="text"
                      />
                    </td>
                    <td className="py-3 px-4">
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
                    <td className="py-3 px-4">
                      <input
                        onChange={(e) =>
                          handleItemRateChange(i, e.target.value)
                        }
                        className="w-[70px] border border-gray-300 rounded px-2 py-1 text-sm"
                        value={item.rate || ""}
                        type="number"
                        min="0"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-center">
                      INR {item.netRate.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        onChange={(e) => handleItemTaxChange(i, e.target.value)}
                        className="w-[70px] border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={item.tax || ""}
                        type="number"
                        min="0"
                      />
                    </td>
                    <td className="py-3 px-4 text-sm text-center">
                      INR {item.taxAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-center">
                      INR {item.totalAmount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <input
                        onChange={(e) =>
                          handleItemRemarkChange(i, e.target.value)
                        }
                        className="w-[120px] border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={item.remark || ""}
                        type="text"
                      />
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button onClick={() => handleDeleteMiscItem(i)}>
                        <FaTrash className="text-red-500 hover:text-red-600 w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Mobile View for Miscellaneous */}
            <div className="sm:hidden flex flex-col gap-4 mt-4">
              {additionalItems.map((item, i) => (
                <div
                  key={i}
                  className="bg-white p-4 rounded-lg shadow-none border border-gray-200"
                >
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-semibold text-sm">SR: {i + 1}</span>
                    <button onClick={() => handleDeleteMiscItem(i)}>
                      <FaTrash className="text-red-500 hover:text-red-600 w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Item Name
                      </label>
                      <input
                        onChange={(e) =>
                          handleItemNameChange(i, e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={item.name || ""}
                        type="text"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Quantity
                      </label>
                      <input
                        onChange={(e) =>
                          handleItemQuantityChange(i, e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={item.quantity || ""}
                        type="number"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Rate
                      </label>
                      <input
                        onChange={(e) =>
                          handleItemRateChange(i, e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={item.rate || ""}
                        type="number"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Net Rate
                      </label>
                      <span className="text-sm">
                        INR {item.netRate.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tax (%)
                      </label>
                      <input
                        onChange={(e) => handleItemTaxChange(i, e.target.value)}
                        className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={item.tax || ""}
                        type="number"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Tax Amount
                      </label>
                      <span className="text-sm">
                        INR {item.taxAmount.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Total Amount
                      </label>
                      <span className="text-sm">
                        INR {item.totalAmount.toFixed(2)}
                      </span>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Remark
                      </label>
                      <input
                        onChange={(e) =>
                          handleItemRemarkChange(i, e.target.value)
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={item.remark || ""}
                        type="text"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quotation Section */}
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-4 pl-4 md:pl-4">
            Quotation
          </h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full bg-white min-w-[800px]">
              <thead>
                <tr className="bg-gray-100 text-gray-700 text-xs sm:text-sm md:text-base font-semibold">
                  <th className="py-2 px-4 text-center">SR</th>
                  <th className="py-2 px-4">Area</th>
                  <th className="py-2 px-4">Product Name</th>
                  <th className="py-2 px-4">Size</th>
                  <th className="py-2 px-4">MRP</th>
                  <th className="py-2 px-4">Quantity</th>
                  <th className="py-2 px-4">Subtotal</th>
                  <th className="py-2 px-4">Tax Rate(%)</th>
                  <th className="py-2 px-4">Tax Amount</th>
                  <th className="py-2 px-4">Tax Amount</th>
                  <th className="py-2 px-4">Total</th>
                </tr>
              </thead>
              <tbody>
                {selections.flatMap((selection, mainIndex) =>
                  selection.areacollection?.map(
                    (collection, collectionIndex) => {
                      const item = collection.items?.[0];
                      const qty = collection.quantities?.[0] || 0;
                      if (!item) return null;

                      const calculatedMRP = (
                        item[4] *
                        parseFloat(collection.measurement.quantity || "0")
                      ).toFixed(2);
                      const subtotal = (
                        item[4] *
                        parseFloat(collection.measurement.quantity || "0") *
                        qty
                      ).toFixed(2);
                      const taxAmount =
                        collection.totalTax?.[0]?.toFixed(2) || "0.00";
                      const totalAmount =
                        collection.totalAmount?.[0]?.toFixed(2) || "0.00";

                      return (
                        <tr
                          key={`${mainIndex}-${collectionIndex}`}
                          className="border-b border-gray-200 hover:bg-gray-50"
                        >
                          <td className="py-2 px-4 text-center text-sm">
                            {collectionIndex + 1}
                          </td>
                          <td className="py-2 px-4 text-sm">
                            {selection.area}
                          </td>
                          <td className="py-2 px-4 text-sm">
                            {collection.productGroup?.[0] || "N/A"}
                          </td>
                          <td className="py-2 px-4 text-sm">
                            {collection.measurement.width &&
                            collection.measurement.height
                              ? `${collection.measurement.width} x ${
                                  collection.measurement.height
                                } ${collection.measurement.unit || ""}`
                              : "N/A"}
                          </td>
                          <td className="py-2 px-4 text-sm">
                            <input
                              type="number"
                              className="w-[120px] border border-gray-300 rounded px-2 py-1 text-sm"
                              value={calculatedMRP}
                              onChange={(e) =>
                                handleMRPChange(
                                  mainIndex,
                                  collectionIndex,
                                  e.target.value,
                                  collection.measurement.quantity,
                                  item[5],
                                  qty
                                )
                              }
                            />
                          </td>
                          <td className="py-2 px-4 text-sm">
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              value={qty}
                              onChange={(e) =>
                                handleQuantityChange(
                                  `${mainIndex}-${collectionIndex}`,
                                  e.target.value,
                                  mainIndex,
                                  collectionIndex,
                                  collection.measurement.quantity,
                                  parseFloat(item[4]),
                                  parseFloat(item[5]),
                                  0
                                )
                              }
                            />
                          </td>
                          <td className="py-2 px-4 text-sm">
                            INR{" "}
                            {(
                              parseFloat(item[4]) *
                              parseFloat(
                                collection.measurement.quantity || "0"
                              ) *
                              parseFloat(qty || "0")
                            ).toFixed(2)}
                          </td>

                          <td className="py-2 px-4 text-sm">
                            <input
                              type="number"
                              className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                              value={item[5]}
                              onChange={(e) =>
                                handleTaxChange(
                                  mainIndex,
                                  collectionIndex,
                                  parseFloat(e.target.value),
                                  item[4],
                                  collection.measurement.quantity,
                                  qty
                                )
                              }
                            />
                          </td>

                          <td className="py-2 px-4 text-sm">
                            {item[5] || "0"}%
                          </td>
                          <td className="py-2 px-4 text-sm">INR {taxAmount}</td>
                          <td className="py-2 px-4 text-sm">
                            INR {totalAmount}
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary and Bank Details */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Bank Details and Terms */}
          <div className="bg-white p-6 rounded-xl shadow-none border border-gray-200 w-full md:w-1/2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Bank Details & Terms
            </h3>
            <div className="space-y-4">
              <select
                value={bank}
                onChange={(e) => setBank(e.target.value.split(","))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              ></textarea>
              <select
                value={terms}
                onChange={(e) => setTerms(e.target.value.split(","))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                value={`Terms & Conditions : ${terms == "NA" ? "" : terms[0]}`}
              ></textarea>
            </div>
          </div>

          {/* Summary */}
          <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200 w-full md:w-1/2">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">
              Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Sub Total</span>
                <span className="font-medium">INR {amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Tax Amount</span>
                <span className="font-medium">INR {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-medium">INR {amount.toFixed(2)}</span>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Discount</span>
                <div className="flex items-center gap-2">
                  <select
                    onChange={(e) => {
                      handleDiscountChange(discount, e.target.value);
                    }}
                    className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="cash">₹</option>
                    <option value="percent">%</option>
                  </select>
                  <input
                    className="w-24 border border-gray-300 rounded-md px-3 py-1 text-sm text-right focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={discount}
                    onChange={(e) => {
                      handleDiscountChange(e.target.value, discountType);
                    }}
                    type="number"
                    min="0"
                  />
                </div>
              </div>
              <hr className="border-gray-200" />
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 font-semibold">Grand Total</span>
                <span className="font-semibold text-blue-600">
                  INR {grandTotal.toFixed(2)}
                </span>
              </div>
              <div className=" flex gap-2 flex-col">
                <button
                  onClick={sendProjectData}
                  className="w-full  bg-blue-600 text-white py-2 !rounded-xl hover:bg-blue-700 transition-colors text-sm font-medium mt-4"
                >
                  Add Project & Generate Quote
                </button>
                <button
                  onClick={generatePDF}
                  className="w-full bg-green-600 text-white py-2 !rounded-xl hover:bg-green-700 transition-colors text-sm font-medium"
                >
                  Download Quotation PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AddProjectForm;
