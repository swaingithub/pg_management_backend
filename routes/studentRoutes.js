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

// Route to approve a student and save to the students table
router.post('/students/approve-and-save/:studentId', studentDataController.saveApprovedStudent);


module.exports = router;
