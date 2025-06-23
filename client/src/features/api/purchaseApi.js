import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const COURSE_PURCHASE_API =
  import.meta.env.VITE_API_URL + "/purchase" || "http://localhost:3000/api/v1/purchase";

export const purchaseApi = createApi({
  reducerPath: "purchaseApi",
  baseQuery: fetchBaseQuery({
    baseUrl: COURSE_PURCHASE_API,
    credentials: "include",
    prepareHeaders: (headers) => {
      const token = localStorage.getItem("token");
      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    createOrder: builder.mutation({
      query: (courseId) => ({
        url: "/checkout/create-order",
        method: "POST",
        body: { courseId },
      }),
      transformErrorResponse: (response) => {
        return response.data?.message || "Failed to create order";
      },
    }),
    verifyPayment: builder.mutation({
      query: (paymentData) => ({
        url: "/verify-payment",
        method: "POST",
        body: paymentData,
      }),
      transformErrorResponse: (response) => {
        return response.data?.message || "Payment verification failed";
      },
    }),
    getCourseDetailWithStatus: builder.query({
      query: (courseId) => ({
        url: `/course/${courseId}/detail-with-status`,
        method: "GET",
      }),
    }),
    getPurchasedCourses: builder.query({
      query: () => ({
        url: `/`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useCreateOrderMutation,
  useVerifyPaymentMutation,
  useGetCourseDetailWithStatusQuery,
  useGetPurchasedCoursesQuery,
} = purchaseApi;
