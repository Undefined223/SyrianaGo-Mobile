import axiosInstance from "../AxiosInstance";

export const getReviews = async (listingId:string) => {
  const res = await axiosInstance.get(`/review/${listingId}/reviews`);
  return res.data;
};

export const createReview = async (listingId:string, review:any) => {
  const res = await axiosInstance.post(`/review/${listingId}/reviews`, review, {
    withCredentials: true,
  });
  return res.data;
};