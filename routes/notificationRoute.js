const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');

// Fetch pending student approval requests
router.get('/notifications', notificationController.getNotifications);

// Mark notifications as read after the admin views them
router.post('/notifications/:id/mark-read', notificationController.markAsRead);

module.exports = router;
