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


exports.countStudentsByRoomAndFloor = (req, res) => {
    const query = `
        SELECT 
            f.id AS floor_id,
            f.floor_name,
            COUNT(s.id) AS total_student_count
        FROM 
            floors f
        JOIN 
            rooms r ON f.id = r.floor_id
        LEFT JOIN 
            students s ON r.id = s.room_id
        GROUP BY 
            f.id, f.floor_name
    `;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Error counting students by room and floor:', err.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        return res.json({ data: results });
    });
};
