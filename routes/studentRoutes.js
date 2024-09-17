const express = require('express');
const router = express.Router();
const studentDataController = require('../controllers/studentDataController');

// Temporary storage endpoint
router.post('/student/temporary', studentDataController.createTemporaryStudent);

// Get student details by ID
router.get('/student/:studentId', studentDataController.getStudentDetails);

// Approve student
router.post('/student/approve/:studentId', studentDataController.approveStudent);

// Reject student
router.post('/student/reject/:studentId', studentDataController.rejectStudent);

module.exports = router;
