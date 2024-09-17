const mysql = require('mysql2');
require('dotenv').config();

// Create the MySQL connection
const db = mysql.createConnection({
    host: process.env.HOST,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Connect to the database
db.connect(err => {
    if (err) {
        throw err;
    }
    console.log('MySQL connected...');
});

module.exports = db;
