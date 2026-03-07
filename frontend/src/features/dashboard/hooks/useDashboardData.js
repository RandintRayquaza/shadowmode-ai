import { useEffect } from 'react';
import useDashboardStore from '../state/useDashboardStore';
import { fetchDashboardRecent } from '../api/dashboardApi';
import { toast } from 'sonner';

export const useDashboardData = () => {
  const { recentAnalyses, isLoading, error, setLoading, setRecentAnalyses, setError } = useDashboardStore();

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const data = await fetchDashboardRecent();
      setRecentAnalyses(data.results || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to load dashboard data";
      setError(msg);
      toast.error('Data Sync Error', { description: msg });
    }
  };

  useEffect(() => {
    loadDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return { recentAnalyses, isLoading, error, refresh: loadDashboardData };
};
