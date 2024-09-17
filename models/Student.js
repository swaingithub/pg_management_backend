const db = require('../config/db');

const Student = {
    create: (studentData, callback) => {
        db.query('INSERT INTO Students SET ?', studentData, callback);
    },
    // Other CRUD operations...
};

module.exports = Student;
