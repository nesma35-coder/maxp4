import React from 'react';
import './RewardItem.css';

const RewardItem = ({ reward, canDelete, onDelete }) => {
  return (
    <tr className="reward-item">
      <td>{reward.createdBy?.name || 'N/A'}</td>
      <td>
        <span className="category-badge">
          {reward.category}
        </span>
      </td>
      <td className="points">
        <strong>{reward.points}</strong> pts
      </td>
      <td>{reward.rewardType}</td>
      <td>{new Date(reward.createdAt).toLocaleDateString()}</td>
      <td>
        <span className={`status-badge status-${reward.status}`}>
          {reward.status}
        </span>
      </td>
      <td className="actions">
        <button className="action-btn view" title="View">
          👁️
        </button>
        <button className="action-btn edit" title="Edit">
          ✏️
        </button>
        {canDelete && (
          <button
            className="action-btn delete"
            title="Delete"
            onClick={() => onDelete(reward._id, reward.title)}
          >
            🗑️
          </button>
        )}
      </td>
    </tr>
  );
};

export default RewardItem;
