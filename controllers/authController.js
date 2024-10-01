const bcrypt = require('bcryptjs');
const db = require('../config/db');

// Register Admin
exports.signupUser = async (req, res) => {
    const { username, email, password } = req.body;
    
    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide both username and password' });
    }

    try {
        // Check if the username already exists
        db.query('SELECT username FROM user_login WHERE username = ?', [username], async (err, result) => {
            if (err) throw err;

            if (result.length > 0) {
                return res.status(400).json({ message: 'Username already exists' });
            }

            // Hash the password
            const hashedPassword = await bcrypt.hash(password, 10);

            // Insert the new admin into the database
            const sql = 'INSERT INTO user_login (username, email, password) VALUES (?, ?, ?)';
            db.query(sql, [username, email, hashedPassword], (err, result) => {
                if (err) throw err;
                res.status(201).json({ message: 'User signed up successfully' });
            });
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Login Admin or User
exports.login = (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: 'Please provide both username and password' });
    }

    // Check if the username exists in the admin table first
    db.query('SELECT * FROM admin WHERE username = ?', [username], async (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
            // If found in the admin table, validate the password
            const admin = result[0];
            const isMatch = await bcrypt.compare(password, admin.password);

            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid username or password' });
            }

            // Successful admin login
            return res.status(200).json({
                message: 'Logged in successfully',
                role: 'admin',
                id: admin.id,
                username: admin.username
            });
        } else {
            // If not found in the admin table, check the user table
            db.query('SELECT * FROM user_login WHERE username = ?', [username], async (err, result) => {
                if (err) throw err;

                if (result.length === 0) {
                    return res.status(400).json({ message: 'Invalid username or password' });
                }

                // Validate user password
                const user = result[0];
                const isMatch = await bcrypt.compare(password, user.password);

                if (!isMatch) {
                    return res.status(400).json({ message: 'Invalid username or password' });
                }

                // Successful user login
                return res.status(200).json({
                    message: 'Logged in successfully',
                    role: 'user',
                    id: user.id,
                    username: user.username,
                    email: user.email
                });
            });
        }
    });
};

