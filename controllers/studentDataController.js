const multer = require('multer');
const path = require('path');
const fs = require('fs');
const db = require('../config/db'); // Your database configuration

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const upload = multer({
    storage: multer.diskStorage({
        destination: (req, file, cb) => {
            cb(null, uploadDir); // Folder to save uploaded files
        },
        filename: (req, file, cb) => {
            const fileName = Date.now() + path.extname(file.originalname);
            cb(null, fileName); // Unique file name
        }
    }),
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Error: Images Only!'));
    }
});

// Temporary storage for student data
exports.createTemporaryStudent = [
    upload.fields([{ name: 'aadhaarPhoto', maxCount: 1 }, { name: 'passportPhoto', maxCount: 1 }]),
    (req, res) => {
        const { name, fatherName, phone, email, work, share } = req.body;

        const studentData = {
            name,
            fatherName,
            phone,
            email,
            work,
            aadhaarPhoto: req.files['aadhaarPhoto'] ? `/uploads/${req.files['aadhaarPhoto'][0].filename}` : null,
            passportPhoto: req.files['passportPhoto'] ? `/uploads/${req.files['passportPhoto'][0].filename}` : null,
            share: share || 'default_value'
        };

        const query = `INSERT INTO student_approvals (name, father_name, phone, email, work, aadhaar_photo, passport_photo, share) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            studentData.name,
            studentData.fatherName,
            studentData.phone,
            studentData.email,
            studentData.work,
            studentData.aadhaarPhoto,
            studentData.passportPhoto,
            studentData.share
        ];

        // Insert into student_approvals table
        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Error creating temporary student:', err);
                return res.status(500).send('Failed to submit data');
            }

            const studentId = result.insertId; // Get the inserted student's ID

            // Insert notification after successfully creating the student
            const notificationQuery = `INSERT INTO notifications (message, student_id, is_read, created_at) VALUES (?, ?, ?, ?)`;
            const notificationValues = [
                `Student ${studentData.name} submitted data for review.`,
                studentId,
                0, // is_read is false (unread)
                new Date() // created_at
            ];

            db.query(notificationQuery, notificationValues, (err) => {
                if (err) {
                    console.error('Error inserting notification:', err);
                    return res.status(500).send('Data saved, but failed to send notification');
                }

                res.status(200).send('Data submitted for review, notification sent');
            });
        });
    }
];




// Example endpoint to fetch student details
exports.getStudentDetails = (req, res) => {
    const { studentId } = req.params;

    if (!studentId || isNaN(studentId)) {
        return res.status(400).send('Invalid student ID');
    }

    const query = 'SELECT * FROM student_approvals WHERE id = ?';

    db.query(query, [studentId], (err, results) => {
        if (err) {
            console.error('Error fetching student:', err);
            return res.status(500).send('Failed to fetch student');
        }

        if (results.length === 0) {
            return res.status(404).send('Student not found');
        }

        const student = results[0];

        // Ensure image URLs are correct
        if (student.aadhaar_photo) {
            student.aadhaar_photo = `${req.protocol}://${req.get('host')}${student.aadhaar_photo}`;
        }
        if (student.passport_photo) {
            student.passport_photo = `${req.protocol}://${req.get('host')}${student.passport_photo}`;
        }

        res.status(200).json(student);
    });
};





// Approve a student
exports.approveStudent = async (req, res) => {
    const studentId = req.params.studentId;

    try {
        await db.execute('UPDATE student_approvals SET status = ? WHERE id = ?', ['approved', studentId]);

        res.json({ message: 'Student approved successfully' });
    } catch (error) {
        console.error('Error approving student:', error);
        res.status(500).json({ message: 'Error approving student' });
    }
};

// Reject a student
exports.rejectStudent = async (req, res) => {
    const studentId = req.params.studentId;

    try {
        await db.execute('UPDATE student_approvals SET status = ? WHERE id = ?', ['rejected', studentId]);

        res.json({ message: 'Student rejected successfully' });
    } catch (error) {
        console.error('Error rejecting student:', error);
        res.status(500).json({ message: 'Error rejecting student' });
    }
};

// Save approved student data to the student table
exports.saveApprovedStudent = (req, res) => {
    const studentId = req.params.studentId; // Get the student ID from the route parameters
    const { roomId } = req.body; // Get the selected room ID from the request body

    const fetchStudentQuery = 'SELECT * FROM student_approvals WHERE id = ?';

    db.query(fetchStudentQuery, [studentId], (err, results) => {
        if (err) {
            console.error('Error fetching student:', err);
            return res.status(500).json({ message: 'Failed to fetch student details' });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: 'Student not found' });
        }

        const student = results[0];

        // Check current share_room count
        const checkRoomQuery = 'SELECT room_share FROM rooms WHERE id = ?';
        db.query(checkRoomQuery, [roomId], (err, results) => {
            if (err) {
                console.error('Error checking room:', err);
                return res.status(500).json({ message: 'Failed to check room details' });
            }

            if (results.length === 0 || results[0].share_room >= 4) {
                return res.status(400).json({ message: 'Room is full or does not exist' });
            }

            const insertStudentQuery = `INSERT INTO students (name, father_name, phone_number, email, work, aadhaar_photo, passport_photo, room_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
            const studentValues = [
                student.name,
                student.father_name,
                student.phone, // Ensure this matches the column name in the students table
                student.email,
                student.work,
                student.aadhaar_photo,
                student.passport_photo,
                roomId // Insert the selected room ID
            ];

            db.query(insertStudentQuery, studentValues, (err) => {
                if (err) {
                    console.error('Error saving student data:', err);
                    return res.status(500).json({ message: 'Failed to save student data' });
                }

                // Increase the share_room count
                const updateRoomQuery = 'UPDATE rooms SET room_share = room_share + 1 WHERE id = ?';
                db.query(updateRoomQuery, [roomId], (err) => {
                    if (err) {
                        console.error('Error updating room room_share:', err);
                        return res.status(500).json({ message: 'Failed to update room share count' });
                    }

                    // Delete related notifications
                    const deleteNotificationsQuery = 'DELETE FROM notifications WHERE student_id = ?';
                    db.query(deleteNotificationsQuery, [studentId], (err) => {
                        if (err) {
                            console.error('Error deleting notifications:', err);
                            return res.status(500).json({ message: 'Student saved, but failed to remove notifications' });
                        }

                        // Now delete the student from the approvals table
                        const deleteQuery = 'DELETE FROM student_approvals WHERE id = ?';
                        db.query(deleteQuery, [studentId], (err) => {
                            if (err) {
                                console.error('Error deleting student from approvals:', err);
                                return res.status(500).json({ message: 'Student saved, but failed to remove from approvals' });
                            }

                            res.status(200).json({ message: 'Student saved successfully' });
                        });
                    });
                });
            });
        });
    });
};

