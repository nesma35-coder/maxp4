import { useState, useCallback } from 'react';
import rewardsService from '../services/rewardsService';

const useRewards = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRewards = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const response = await rewardsService.getAllRewards(filters);
      setRewards(response.data.data);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to fetch rewards';
      setError(message);
      console.error('Fetch rewards error:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteReward = useCallback(async (id, reason = '') => {
    try {
      const response = await rewardsService.deleteReward(id, reason);
      setRewards(prev => prev.filter(r => r._id !== id));
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete reward';
      setError(message);
      console.error('Delete reward error:', err);
      throw err;
    }
  }, []);

  const restoreReward = useCallback(async (id) => {
    try {
      const response = await rewardsService.restoreReward(id);
      return response.data;
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to restore reward';
      setError(message);
      console.error('Restore reward error:', err);
      throw err;
    }
  }, []);

  return {
    rewards,
    loading,
    error,
    fetchRewards,
    deleteReward,
    restoreReward
  };
};

export default useRewards;
