import api from '@/shared/utils/apiClient';

export const fetchHistoryList = async (limit = 50) => {
  const response = await api.get(`/api/history?limit=${limit}`);
  return response.data;
};
