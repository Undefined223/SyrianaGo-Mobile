import axiosInstance from '../AxiosInstance';

// Fetch all categories
export async function getAllCategories() {
  const res = await axiosInstance.get('/categories');
  return res.data;
}

// Fetch a single category by ID
export async function getCategory(id:string) {
  const res = await axiosInstance.get(`/categories/${id}`);
  return res.data;
}

// Fetch listings by category ID

export const getCategoryWithListings = async (id: string, page = 1, limit = 12) => {
    const res = await axiosInstance.get(`/categories/listings/${id}?page=${page}&limit=${limit}`);
    return res.data;
  }
