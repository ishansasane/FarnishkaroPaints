import React, { useState, useRef, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, store } from "../Redux/Store.ts";
import { setStoreData } from "../Redux/dataSlice.ts";
import { useNavigate } from "react-router-dom";
import StoreDialog from "./StoreDialog.tsx";
import { fetchWithLoading } from "../Redux/fetchWithLoading.ts";

interface Store {
  name: string;
  phone: string;
  email: string;
  address: string;
}

async function getStoreData(): Promise<Store[]> {
  const response = await fetchWithLoading(
    "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/getallstores",
    {
      credentials: "include",
    }
  );
  const data = await response.json();
  return Array.isArray(data.body) ? data : [];
}

const Store: React.FC = () => {
  const navigate = useNavigate();
  const [stores, setStores] = useState<Store[]>([]);
  const dispatch = useDispatch();
  const storeData = useSelector((state: RootState) => state.data.stores);

  const [isAddStoreOpen, setIsAddStoreOpen] = useState(false);
  const [newStoreName, setNewStoreName] = useState("");
  const [newStorePhone, setNewStorePhone] = useState("");
  const [newStoreEmail, setNewStoreEmail] = useState("");
  const [newStoreAddress, setNewStoreAddress] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState<number | null>(null);
  const [dropdownStyle, setDropdownStyle] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [refresh, setRefresh] = useState(true);

  const handleAddStoreClick = () => setIsAddStoreOpen(true);

  const handleCloseAddStore = () => {
    setIsAddStoreOpen(false);
    setNewStoreName("");
    setNewStorePhone("");
    setNewStoreEmail("");
    setNewStoreAddress("");
    setDropdownOpen(null);
    setEditingStore(null);
  };

  const handleSaveStore = async (
    newStoreName,
    newStoreAddress,
    newStoreEmail,
    newStorePhone
  ) => {
    const url = editingStore
      ? "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/updatestore"
      : "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/addstore";

    await fetchWithLoading(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        storeName: newStoreName,
        storeAddress: newStoreAddress,
        email: newStoreEmail,
        phonenumber: newStorePhone,
      }),
    });

    const data = await getStoreData();
    dispatch(setStoreData(data.body));
    setStores(data.body);

    setRefresh((prev) => !prev);
    handleCloseAddStore();
  };

  const toggleDropdown = (
    index: number,
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setDropdownStyle({
      top: rect.top + window.scrollY + 24,
      left: rect.left + window.scrollX,
    });
    setDropdownOpen(dropdownOpen === index ? null : index);
  };

  const handleEdit = async (store: Store) => {
    setEditingStore(store);
    setNewStoreName(store.name);
    setNewStorePhone(store.phone);
    setNewStoreEmail(store.email);
    setNewStoreAddress(store.address);
    setIsAddStoreOpen(true);
    setDropdownOpen(null);
  };

  const handleDelete = async (store) => {
    const storeName = store.name || store[0];

    await fetchWithLoading(
      "https://sahanipaintsbackend.netlify.app/.netlify/functions/server/deletestore",
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ storeName }),
      }
    );

    const data = await getStoreData();
    dispatch(setStoreData(data.body));
    setStores(data.body);
    setRefresh((prev) => !prev);
    setDropdownOpen(null);
  };

  useEffect(() => {
    async function fetchData() {
      const data = await getStoreData();
      dispatch(setStoreData(data.body));
      setStores(Array.isArray(data.body) ? data.body : []);
    }

    if (storeData !== undefined && storeData.length === 0) {
      fetchData();
    } else {
      setStores(storeData || []);
    }
  }, [refresh, dispatch, storeData]);

  return (
    <div
      style={{ backgroundColor: "#f0f2f5", borderRadius: "20px" }}
      className="p-6 mb-20 md:mt-0 mt-20"
    >
      <div
        className="flex-wrap"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "20px",
        }}
      >
        <h2 className="font-bold text-3xl">Stores</h2>
        <button
          onClick={() => setIsAddStoreOpen(true)}
          style={{
            backgroundColor: "#1890ff",
            color: "white",
            border: "none",
            padding: "8px 16px",
            borderRadius: "8px",
          }}
        >
          + Add Store
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="🔍 Search Stores..."
          style={{
            padding: "8px",
            borderRadius: "4px",
            border: "1px solid #ccc",
          }}
          className="px-3 py-2 rounded-md w-full"
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            minWidth: "600px",
          }}
        >
          <thead>
            <tr>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  borderBottom: "1px solid #eee",
                }}
              >
                Store Name
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  borderBottom: "1px solid #eee",
                }}
              >
                Phone
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  borderBottom: "1px solid #eee",
                }}
              >
                Email
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  borderBottom: "1px solid #eee",
                }}
              >
                Address
              </th>
              <th
                style={{
                  textAlign: "left",
                  padding: "8px",
                  borderBottom: "1px solid #eee",
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {stores?.map((store, index) => (
              <tr key={index}>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                  {store[0]}
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                  {store[2]}
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                  {store[3]}
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                  {store[1]}
                </td>
                <td style={{ padding: "8px", borderBottom: "1px solid #eee" }}>
                  <button
                    onClick={(e) => toggleDropdown(index, e)}
                    style={{
                      border: "none",
                      background: "none",
                      cursor: "pointer",
                    }}
                  >
                    ⋮
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {dropdownOpen !== null && dropdownStyle && (
          <div
            ref={dropdownRef}
            style={{
              position: "absolute",
              top: dropdownStyle.top,
              left: dropdownStyle.left,
              backgroundColor: "white",
              border: "1px solid #ccc",
              borderRadius: "4px",
              padding: "8px",
              zIndex: 1000,
              boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
            }}
          >
            <button
              onClick={() => handleEdit(stores[dropdownOpen])}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                display: "block",
                padding: "4px 8px",
              }}
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(stores[dropdownOpen])}
              style={{
                border: "none",
                background: "none",
                cursor: "pointer",
                display: "block",
                padding: "4px 8px",
                color: "red",
              }}
            >
              Delete
            </button>
          </div>
        )}
      </div>
      {isAddStoreOpen && (
        <StoreDialog
          onSave={handleSaveStore}
          setIsAddStoreOpen={setIsAddStoreOpen}
          editingStore={editingStore}
          setEditingStore={setEditingStore}
        />
      )}
    </div>
  );
};

export default Store;
