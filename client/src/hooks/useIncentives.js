import { useState, useCallback } from 'react';
import incentivesService from '../services/incentivesService';

const useIncentives = () => {
  const [incentives, setIncentives] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchIncentives = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await incentivesService.getAllIncentives(filters);
      setIncentives(response.data.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch incentives';
      setError(message);
      console.error('Fetch incentives error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteIncentive = useCallback(async (id, reason = '') => {
    try {
      const response = await incentivesService.deleteIncentive(id, reason);
      setIncentives(prev => prev.filter(i => i._id !== id));
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete incentive';
      setError(message);
      console.error('Delete incentive error:', err);
      throw err;
    }
  }, []);

  const restoreIncentive = useCallback(async (id) => {
    try {
      const response = await incentivesService.restoreIncentive(id);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to restore incentive';
      setError(message);
      console.error('Restore incentive error:', err);
      throw err;
    }
  }, []);

  return {
    incentives,
    loading,
    error,
    fetchIncentives,
    deleteIncentive,
    restoreIncentive
  };
};

export default useIncentives;
