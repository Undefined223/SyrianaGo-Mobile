import axiosInstance from "./AxiosInstance";

export const fetchCategories = async () => {
  try {
    const res = await axiosInstance.get('/categories'); // replace with your real endpoint
    return res.data;
  } catch (err) {
    console.error('Failed to fetch categories:', err);
    return [];
  }
};
