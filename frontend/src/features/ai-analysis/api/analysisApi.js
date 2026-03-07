import api from '@/shared/utils/apiClient';

export const uploadAnalysisImage = async (file) => {
  const formData = new FormData();
  formData.append('image', file);
  const response = await api.post('/api/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const fetchAnalysisResult = async (id) => {
  const response = await api.get(`/api/result/${id}`);
  return response.data;
};
