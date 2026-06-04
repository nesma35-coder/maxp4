import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const rewardsService = {
  getAllRewards: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return axios.get(`${API_BASE_URL}/rewards?${params}`, getAuthHeader());
  },

  getRewardById: (id) => {
    return axios.get(`${API_BASE_URL}/rewards/${id}`, getAuthHeader());
  },

  createReward: (data) => {
    return axios.post(`${API_BASE_URL}/rewards`, data, getAuthHeader());
  },

  updateReward: (id, data) => {
    return axios.put(`${API_BASE_URL}/rewards/${id}`, data, getAuthHeader());
  },

  deleteReward: (id, reason = '') => {
    return axios.delete(`${API_BASE_URL}/rewards/${id}`, {
      ...getAuthHeader(),
      data: { reason }
    });
  },

  permanentlyDeleteReward: (id, reason = '') => {
    return axios.delete(`${API_BASE_URL}/rewards/${id}/permanent`, {
      ...getAuthHeader(),
      data: { reason }
    });
  },

  restoreReward: (id) => {
    return axios.patch(`${API_BASE_URL}/rewards/${id}/restore`, {}, getAuthHeader());
  },

  getDeletedRewards: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return axios.get(`${API_BASE_URL}/rewards/deleted/list?${params}`, getAuthHeader());
  }
};

export default rewardsService;
