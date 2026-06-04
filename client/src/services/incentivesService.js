import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`
  }
});

const incentivesService = {
  getAllIncentives: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return axios.get(`${API_BASE_URL}/incentives?${params}`, getAuthHeader());
  },

  getIncentiveById: (id) => {
    return axios.get(`${API_BASE_URL}/incentives/${id}`, getAuthHeader());
  },

  createIncentive: (data) => {
    return axios.post(`${API_BASE_URL}/incentives`, data, getAuthHeader());
  },

  updateIncentive: (id, data) => {
    return axios.put(`${API_BASE_URL}/incentives/${id}`, data, getAuthHeader());
  },

  deleteIncentive: (id, reason = '') => {
    return axios.delete(`${API_BASE_URL}/incentives/${id}`, {
      ...getAuthHeader(),
      data: { reason }
    });
  },

  permanentlyDeleteIncentive: (id, reason = '') => {
    return axios.delete(`${API_BASE_URL}/incentives/${id}/permanent`, {
      ...getAuthHeader(),
      data: { reason }
    });
  },

  restoreIncentive: (id) => {
    return axios.patch(`${API_BASE_URL}/incentives/${id}/restore`, {}, getAuthHeader());
  },

  getDeletedIncentives: (filters = {}) => {
    const params = new URLSearchParams(filters);
    return axios.get(`${API_BASE_URL}/incentives/deleted/list?${params}`, getAuthHeader());
  }
};

export default incentivesService;
