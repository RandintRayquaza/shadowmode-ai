import { useEffect } from 'react';
import useHistoryStore from '../state/useHistoryStore';
import { fetchHistoryList } from '../api/historyApi';
import { toast } from 'sonner';

export const useHistoryData = (limit = 50) => {
  const { history, isLoading, error, setLoading, setHistory, setError } = useHistoryStore();

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await fetchHistoryList(limit);
      setHistory(data.results || []);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Failed to load history";
      setError(msg);
      toast.error("History Sync Error", { description: msg });
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [limit]);

  return { history, isLoading, error, refresh: loadData };
};
