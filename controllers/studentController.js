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
            console.log(`Saving file as ${fileName}`); // Debugging log
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

// Create student with file uploads
exports.createStudent = [
    upload.fields([{ name: 'aadhaar_photo', maxCount: 1 }, { name: 'passport_photo', maxCount: 1 }]),
    (req, res) => {
        const { name, father_name, phone_number, email, work, room_id } = req.body;

        // Validate room_id
        if (!room_id || isNaN(room_id)) {
            return res.status(400).send('Invalid room ID');
        }

        const studentData = {
            name,
            father_name,
            phone_number,
            email,
            work,
            aadhaar_photo: req.files['aadhaar_photo'] ? `/uploads/${req.files['aadhaar_photo'][0].filename}` : null,
            passport_photo: req.files['passport_photo'] ? `/uploads/${req.files['passport_photo'][0].filename}` : null,
            room_id: parseInt(room_id, 10) // Ensure room_id is an integer
        };

        const query = `INSERT INTO students (name, father_name, phone_number, email, work, aadhaar_photo, passport_photo, room_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        const values = [
            studentData.name,
            studentData.father_name,
            studentData.phone_number,
            studentData.email,
            studentData.work,
            studentData.aadhaar_photo,
            studentData.passport_photo,
            studentData.room_id
        ];

        db.query(query, values, (err) => {
            if (err) {
                console.error('Error creating student:', err);
                return res.status(500).send('Failed to create student');
            }
            res.status(201).send('Student created successfully');
        });
    }
];

// Edit student details with file uploads
exports.editStudent = [
    upload.fields([{ name: 'aadhaar_photo', maxCount: 1 }, { name: 'passport_photo', maxCount: 1 }]),
    (req, res) => {
        const { id } = req.params;
        const { name, father_name, phone_number, email, work, room_id } = req.body;

        // Validate ID and room_id
        if (!id || isNaN(id)) {
            return res.status(400).send('Invalid student ID');
        }
        if (room_id && isNaN(room_id)) {
            return res.status(400).send('Invalid room ID');
        }

        // Build update query and values
        let query = `UPDATE students SET name = ?, father_name = ?, phone_number = ?, email = ?, work = ?, room_id = ?`;
        const values = [
            name,
            father_name,
            phone_number,
            email,
            work,
            room_id ? parseInt(room_id, 10) : null
        ];

        // Add photo updates if available
        if (req.files['aadhaar_photo']) {
            query += `, aadhaar_photo = ?`;
            values.push(`/uploads/${req.files['aadhaar_photo'][0].filename}`);
        }
        if (req.files['passport_photo']) {
            query += `, passport_photo = ?`;
            values.push(`/uploads/${req.files['passport_photo'][0].filename}`);
        }

        query += ` WHERE id = ?`;
        values.push(parseInt(id, 10));

        db.query(query, values, (err) => {
            if (err) {
                console.error('Error updating student:', err);
                return res.status(500).send('Failed to update student');
            }
            res.status(200).send('Student updated successfully');
        });
    }
];

// Fetch students by room ID
exports.getStudentsByRoom = (req, res) => {
    const { room_id } = req.params;

    if (!room_id || isNaN(room_id)) {
        return res.status(400).send('Invalid room ID');
    }

    const query = `SELECT * FROM students WHERE room_id = ?`;
    db.query(query, [room_id], (err, results) => {
        if (err) {
            console.error('Error fetching students:', err);
            return res.status(500).send('Failed to fetch students');
        }

        // Ensure paths are correct for serving images
        results.forEach(student => {
            if (student.aadhaar_photo) {
                student.aadhaar_photo = `${req.protocol}://${req.get('host')}${student.aadhaar_photo}`;
            }
            if (student.passport_photo) {
                student.passport_photo = `${req.protocol}://${req.get('host')}${student.passport_photo}`;
            }
        });

        res.status(200).json(results);
    });
};

// Delete file helper function
const deleteFile = (filePath) => {
    if (filePath && fs.existsSync(filePath)) {
        try {
            fs.unlinkSync(filePath); // Synchronously delete the file
            console.log(`Deleted file: ${filePath}`);
        } catch (err) {
            console.error(`Error deleting file: ${err.message}`);
        }
    }
};

// Controller to delete a student
exports.deleteStudent = (req, res) => {
    const studentId = req.params.id;

    // Query to find the student
    const findStudentQuery = 'SELECT passport_photo, aadhaar_photo FROM students WHERE id = ?';

    db.query(findStudentQuery, [studentId], (err, result) => {
        if (err) {
            return res.status(500).json({ error: 'Failed to find the student' });
        }

        if (result.length === 0) {
            return res.status(404).json({ error: 'Student not found' });
        }

        const student = result[0];

        // Extract file paths (they should be strings)
        const passportPhotoPath = student.passport_photo;
        const aadhaarPhotoPath = student.aadhaar_photo;

        // First, delete the student record
        const deleteStudentQuery = 'DELETE FROM students WHERE id = ?';

        db.query(deleteStudentQuery, [studentId], (err, result) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to delete student' });
            }

            // After deleting student, delete the associated files
            deleteFile(passportPhotoPath);  // Delete passport photo
            deleteFile(aadhaarPhotoPath);   // Delete Aadhaar photo

            return res.status(200).json({ message: 'Student deleted successfully' });
        });
    });
};
