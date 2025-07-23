import axiosInstance from '../AxiosInstance';

export async function getListing(id: string) {
  const res = await axiosInstance.get(`/listing/${id}`);
  return res.data;
}

export const getBlockedDatesByListing = async (listingId) => {
  const res = await axiosInstance.get(`/blocked/${listingId}`);
  return res.data;
};

export const getListingAvailability = async (listingId) => {
  try {
    const res = await axiosInstance.get(`/listing/${listingId}/availability`);
    return res.data;
  } catch (err) {
    throw err.response?.data || err;
  }
};