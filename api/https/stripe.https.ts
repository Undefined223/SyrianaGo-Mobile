import axiosInstance from '../AxiosInstance';

export const initiateStripePayment = async (paymentPayload: {
  userId: string;
  listingId: string;
  details: {
    checkIn: string;
    checkOut: string;
    guests: number;
    price: number;
  };
}) => {
  const res = await axiosInstance.post('/stripe/initiate-payment', paymentPayload);
  return res.data;
};
