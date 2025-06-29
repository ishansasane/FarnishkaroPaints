// src/utils/fetchWithLoading.ts
import { store } from "./store.js";
import { setLoading } from "../Redux/dataSlice";

export const fetchWithLoading = async (
  input: RequestInfo,
  init?: RequestInit
): Promise<Response> => {
  try {
    store.dispatch(setLoading(false));
    const response = await fetch(input, init);
    return response;
  } finally {
    store.dispatch(setLoading(false));
  }
};
