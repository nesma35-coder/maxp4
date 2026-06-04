import React from 'react';
import './DeleteConfirmationDialog.css';

const DeleteConfirmationDialog = ({
  show,
  itemName,
  itemType,
  reason,
  onReasonChange,
  onConfirm,
  onCancel
}) => {
  if (!show) return null;

  return (
    <div className="confirmation-dialog-overlay">
      <div className="confirmation-dialog">
        <div className="dialog-header">
          <h3>تأكيد الحذف</h3>
          <button className="close-btn" onClick={onCancel}>×</button>
        </div>

        <div className="dialog-body">
          <div className="warning-icon">⚠️</div>
          <p className="warning-message">
            هل أنت متأكد من رغبتك في حذف <strong>{itemName}</strong>؟
          </p>
          <p className="warning-subtext">
            لا يمكن التراجع عن هذا الإجراء.
          </p>

          <div className="reason-section">
            <label htmlFor="delete-reason">سبب الحذف (اختياري):</label>
            <textarea
              id="delete-reason"
              className="reason-input"
              placeholder="أدخل سبب الحذف..."
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              maxLength={300}
              rows={3}
            />
            <div className="char-count">{reason.length}/300</div>
          </div>
        </div>

        <div className="dialog-footer">
          <button
            className="btn btn-cancel"
            onClick={onCancel}
          >
            إلغاء
          </button>
          <button
            className="btn btn-delete"
            onClick={onConfirm}
          >
            حذف نهائياً
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;
