import axiosInstance from '../AxiosInstance';

export async function getListing(id: string) {
  const res = await axiosInstance.get(`/listing/${id}`);
  return res.data;
}
