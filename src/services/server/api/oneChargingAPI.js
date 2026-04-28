import { serverAPI } from "../request/serverAPI";

export const authAPI = serverAPI.injectEndpoints({
  endpoints: (builder) => ({
    oneCharging: builder.query({
      transformResponse: (response) => response,
      query: (payload) => ({
        url: `/charging`,
        method: "GET",
        params: payload,
      }),
      providesTags: ["OneCharging"],
    }),
    syncCharging: builder.mutation({
      query: (payload) => ({
        url: `/sync_charging`,
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["OneCharging"],
    }),
  }),
});

export const {
  useOneChargingQuery,
  useLazyOneChargingQuery,
  useSyncChargingMutation,
} = authAPI;
