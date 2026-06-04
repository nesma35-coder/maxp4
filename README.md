# MaxP Platform - HR System

MaxP Platform is a comprehensive AI-powered HR and E-commerce system with integrated rewards and incentives management.

## 🎯 Features

### Rewards & Incentives Module
- ✅ **Create Rewards**: Add new rewards with validation
- ✅ **Create Incentives**: Add incentive programs with eligibility criteria
- ✅ **Edit Records**: Modify existing records with audit trails
- ✅ **Delete Records**: Soft delete with restoration capability
- ✅ **Permission-Based Access**: Role-based delete controls
- ✅ **Audit Logging**: Complete deletion history and reasons
- ✅ **Real-time UI Updates**: Immediate interface refresh after deletions
- ✅ **Confirmation Dialogs**: Prevent accidental deletions
- ✅ **Error Handling**: Comprehensive error messages

## 📦 Installation

### Backend Setup
```bash
npm install
cp .env.example .env
# Update .env with your MongoDB URI
npm run dev
```

### Frontend Setup
```bash
cd client
npm install
cp .env.example .env
# Update .env with your API URL
npm start
```

## 🔗 API Endpoints

### Rewards
- `GET /api/rewards` - List all rewards
- `GET /api/rewards/:id` - Get single reward
- `POST /api/rewards` - Create reward
- `PUT /api/rewards/:id` - Update reward
- `DELETE /api/rewards/:id` - Soft delete reward
- `DELETE /api/rewards/:id/permanent` - Permanently delete
- `PATCH /api/rewards/:id/restore` - Restore deleted reward
- `GET /api/rewards/deleted/list` - List deleted rewards

### Incentives
- `GET /api/incentives` - List all incentives
- `GET /api/incentives/:id` - Get single incentive
- `POST /api/incentives` - Create incentive
- `PUT /api/incentives/:id` - Update incentive
- `DELETE /api/incentives/:id` - Soft delete incentive
- `DELETE /api/incentives/:id/permanent` - Permanently delete
- `PATCH /api/incentives/:id/restore` - Restore deleted incentive
- `GET /api/incentives/deleted/list` - List deleted incentives

## 🔐 User Permissions

- `view_rewards` - View rewards
- `create_rewards` - Create rewards
- `edit_rewards` - Edit rewards
- `delete_rewards` - Delete/restore rewards
- `view_incentives` - View incentives
- `create_incentives` - Create incentives
- `edit_incentives` - Edit incentives
- `delete_incentives` - Delete/restore incentives

## ✨ Delete Functionality Features

### 1. Soft Delete Implementation
- Records are marked as deleted but retained in database
- Maintains complete audit trail and data integrity
- Easy restoration capability from deleted items

### 2. Permission-Based Access Control
- Delete button only visible to authorized users
- Role-based access control (Admin, HR Manager, Manager, Employee)
- Admin users have full system access

### 3. Confirmation Dialog
- User must confirm deletion before execution
- Optional reason for deletion tracking
- Clear warning messages in Arabic

### 4. Comprehensive Audit Logging
- All deletions logged with user information
- Reason for deletion recorded
- Before/after data snapshots
- Timestamps for tracking

### 5. Real-time UI Updates
- UI updates immediately after deletion
- No page refresh required
- Smooth user experience with animations

### 6. Advanced Error Handling
- Comprehensive error messages
- Network error handling
- Validation error display
- User-friendly notifications

## 🧪 Testing Scenarios

### Core Deletion Tests
1. ✅ Delete reward successfully
2. ✅ Delete incentive successfully
3. ✅ Cancel deletion operation
4. ✅ Delete with authorized user
5. ✅ Deny delete for unauthorized user
6. ✅ Real-time UI update after deletion
7. ✅ Restore deleted record
8. ✅ Error handling for edge cases

### Integration Tests
9. ✅ No side effects on other modules
10. ✅ Audit logs created correctly
11. ✅ No console errors or warnings
12. ✅ No memory leaks or performance issues

## 🏗️ Architecture

### Backend
- **Runtime**: Node.js + Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Authorization**: Role-based access control (RBAC)

### Frontend
- **Framework**: React with Hooks
- **HTTP Client**: Axios
- **State Management**: React Hooks (useState, useCallback)
- **Styling**: CSS with RTL support (Arabic)

## 📋 Project Structure

```
maxp4/
├── src/
│   ├── models/
│   │   ├── User.js
│   │   ├── Reward.js
│   │   ├── Incentive.js
│   │   └── AuditLog.js
│   ├── controllers/
│   │   ├── rewardsController.js
│   │   └── incentivesController.js
│   ├── routes/
│   │   ├── rewardsRoutes.js
│   │   ├── incentivesRoutes.js
│   │   ├── authRoutes.js
│   │   └── employeeRoutes.js
│   └── middleware/
│       ├── auth.js
│       └── permissions.js
├── client/
│   └── src/
│       ├── components/
│       │   ├── RewardsList.jsx
│       │   ├── RewardItem.jsx
│       │   └── DeleteConfirmationDialog.jsx
│       ├── services/
│       │   ├── rewardsService.js
│       │   └── incentivesService.js
│       ├── hooks/
│       │   ├── useRewards.js
│       │   └── useIncentives.js
│       └── components/
│           ├── RewardsList.css
│           ├── RewardItem.css
│           └── DeleteConfirmationDialog.css
├── server.js
├── package.json
└── .env.example
```

## 🔄 Delete Flow Diagram

```
User clicks Delete Button
        ↓
Confirmation Dialog Appears
        ↓
User Confirms Deletion
        ↓
API Request Sent (DELETE)
        ↓
Backend Soft Delete Operation
        ↓
Audit Log Created
        ↓
Response Sent to Frontend
        ↓
UI Updated in Real-time
        ↓
Success Notification Shown
```

## 🚀 Performance Considerations

- Efficient database indexing on `isDeleted` field
- Pagination support for large datasets
- Optimized queries with proper population
- No N+1 query problems
- Proper error handling prevents crashes

## 🔒 Security Features

- JWT token validation on all protected routes
- Permission-based authorization
- Input validation on all endpoints
- No sensitive data in audit logs
- Soft delete prevents accidental data loss

## 📝 License

MIT License - See LICENSE file for details

## 👥 Contributors

MaxP Team - 2026

## 📧 Support

For issues or questions, please create an issue in the repository.
