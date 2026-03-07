import api from '@/shared/utils/apiClient';

export const fetchDashboardRecent = async () => {
  const response = await api.get('/api/history?limit=5');
  return response.data;
};
