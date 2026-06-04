import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import RewardItem from './RewardItem';
import './RewardsList.css';

const RewardsList = ({ userRole, userPermissions }) => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState({
    show: false,
    rewardId: null,
    rewardTitle: null,
    reason: ''
  });
  const [filters, setFilters] = useState({
    status: '',
    category: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10
  });

  // Fetch rewards
  const fetchRewards = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page,
        limit: pagination.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.category && { category: filters.category })
      });

      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/rewards?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        setRewards(response.data.data);
        setPagination(prev => ({ ...prev, ...response.data.pagination }));
      } else {
        setError(response.data.message || 'Failed to fetch rewards');
      }
    } catch (err) {
      console.error('Fetch rewards error:', err);
      setError(err.response?.data?.message || 'Error fetching rewards');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [pagination.page, filters]);

  // Handle delete confirmation
  const handleDeleteClick = (rewardId, rewardTitle) => {
    setDeleteDialog({
      show: true,
      rewardId,
      rewardTitle,
      reason: ''
    });
  };

  // Confirm delete
  const handleConfirmDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.delete(
        `${process.env.REACT_APP_API_URL}/api/rewards/${deleteDialog.rewardId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          data: { reason: deleteDialog.reason }
        }
      );

      if (response.data.success) {
        // Update UI immediately without reloading
        setRewards(rewards.filter(r => r._id !== deleteDialog.rewardId));
        setDeleteDialog({ show: false, rewardId: null, rewardTitle: null, reason: '' });
        
        // Show success message
        showNotification('Reward deleted successfully', 'success');
      }
    } catch (err) {
      console.error('Delete reward error:', err);
      showNotification(
        err.response?.data?.message || 'Error deleting reward',
        'error'
      );
    }
  };

  // Cancel delete
  const handleCancelDelete = () => {
    setDeleteDialog({ show: false, rewardId: null, rewardTitle: null, reason: '' });
  };

  // Show notification
  const showNotification = (message, type) => {
    console.log(`[${type.toUpperCase()}] ${message}`);
  };

  // Check delete permission
  const canDelete = userPermissions?.includes('delete_rewards') || userRole === 'admin';

  if (loading && rewards.length === 0) {
    return <div className="rewards-list loading">Loading rewards...</div>;
  }

  return (
    <div className="rewards-list">
      <div className="rewards-header">
        <h2>المكافآت والحوافز</h2>
        <div className="rewards-filters">
          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="filter-select"
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="expired">Expired</option>
          </select>

          <select
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="filter-select"
          >
            <option value="">All Categories</option>
            <option value="performance">Performance</option>
            <option value="attendance">Attendance</option>
            <option value="innovation">Innovation</option>
            <option value="teamwork">Teamwork</option>
            <option value="safety">Safety</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {rewards.length === 0 ? (
        <div className="empty-state">No rewards found</div>
      ) : (
        <table className="rewards-table">
          <thead>
            <tr>
              <th>الموظف</th>
              <th>الفئة</th>
              <th>القيمة</th>
              <th>النوع</th>
              <th>التاريخ</th>
              <th>الحالة</th>
              <th>الإجراءات</th>
            </tr>
          </thead>
          <tbody>
            {rewards.map((reward) => (
              <RewardItem
                key={reward._id}
                reward={reward}
                canDelete={canDelete}
                onDelete={handleDeleteClick}
              />
            ))}
          </tbody>
        </table>
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        show={deleteDialog.show}
        itemName={deleteDialog.rewardTitle}
        itemType="مكافأة"
        reason={deleteDialog.reason}
        onReasonChange={(newReason) =>
          setDeleteDialog({ ...deleteDialog, reason: newReason })
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="pagination">
          <button
            disabled={pagination.page === 1}
            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
          >
            Previous
          </button>
          <span>Page {pagination.page} of {pagination.pages}</span>
          <button
            disabled={pagination.page === pagination.pages}
            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default RewardsList;
