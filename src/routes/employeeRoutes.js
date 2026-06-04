const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

// Placeholder for employee routes
router.get('/', auth, (req, res) => {
  res.json({
    success: true,
    message: 'Employee routes coming soon'
  });
});

module.exports = router;
