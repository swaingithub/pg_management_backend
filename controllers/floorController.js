const db = require('../config/db'); // Your database configuration

exports.getFloors = (req, res) => {
    db.query('SELECT * FROM floors', (error, results) => {
        if (error) {
            console.error('Error fetching floors:', error.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
};

exports.createFloor = (req, res) => {
    const { floor_name } = req.body;
    db.query('INSERT INTO floors (floor_name) VALUES (?)', [floor_name], (error, results) => {
        if (error) {
            console.error('Error creating floor:', error.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'Floor created successfully' });
    });
};
