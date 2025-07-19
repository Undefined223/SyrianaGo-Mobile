import axiosInstance from "../AxiosInstance";


// Create a booking (handles both COD and Stripe)
export const createBooking = async (bookingPayload) => {
  const res = await axiosInstance.post("/booking", bookingPayload);
  return res.data;
};