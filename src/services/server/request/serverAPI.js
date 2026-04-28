import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const baseURL = import.meta.env.VITE_API_KEY;
// const baseURL = "http://10.10.12.14:8002/api";
// const baseURL = "http://10.10.13.6:8082/api";

// const baseURL = "http://localhost:8080/Genus2/public/api";

export const serverAPI = createApi({
  reducerPath: "serverAPI",
  baseQuery: fetchBaseQuery({
    baseUrl: baseURL,
    mode: "cors",
    prepareHeaders: (headers, { getState }) => {
      const token = getState().auth.token;
      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }
      headers.set("Accept", "application/json");
      return headers;
    },
  }),
  tagTypes: [
    "Users",
    "OneCharging",
    "AccountTitle",
    "Category",
    "Materials",
    "Uom",
    "ApprovalSetup",
    "Approver",
    "Order",
  ],
  endpoints: (builder) => ({}),
});

export const {} = serverAPI;
