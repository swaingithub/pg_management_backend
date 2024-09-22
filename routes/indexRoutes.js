const express = require('express');
const router = express.Router();
const floorController = require('../controllers/floorController');
const roomController = require('../controllers/roomController');
const studentController = require('../controllers/studentController');

// Route to get floors
router.get('/floors',floorController.getFloors);

// Route to add a new floor
router.post('/floors', floorController.createFloor);

// Route to get rooms for a floor
router.get('/floors/:floorId/rooms', roomController.getRooms);

// Route to add a room to a floor
router.post('/floors/:floorId/rooms', roomController.createRoom);

// Route to fetch rooms by room_share
router.get('/floors/rooms/share', roomController.FetchedRooms);

// Route to get students by room ID
router.get('/rooms/:room_id/students', studentController.getStudentsByRoom);

// Route to count students by room
router.get('/rooms/count', roomController.countStudent);

// Route to create a new student
router.post('/students', studentController.createStudent);

// Route to edit an existing student by ID
router.post('/students/:id', studentController.editStudent);

// Delete student route
router.delete('/students/:id', studentController.deleteStudent);


module.exports = router;
