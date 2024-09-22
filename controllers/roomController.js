const db = require('../config/db');

exports.getRooms = (req, res) => {
    const { floorId } = req.params;
    db.query('SELECT * FROM rooms WHERE floor_id = ?', [floorId], (error, results) => {
        if (error) {
            console.error('Error fetching rooms:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
};

exports.createRoom = (req, res) => {
    const { floorId } = req.params;
    const { room_name, room_share } = req.body; // Added room_share to request body

    db.query('INSERT INTO rooms (floor_id, room_name, room_share) VALUES (?, ?, ?)', [floorId, room_name, room_share], (error) => {
        if (error) {
            console.error('Error creating room:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'Room created successfully' });
    });
};

// Fetch rooms by floorId and optionally by room_share
exports.FetchedRooms = (req, res) => {
    const { room_share } = req.query; // Only use room_share from query

    let query = 'SELECT * FROM rooms';
    let queryParams = [];

    // If room_share is provided, filter by it
    if (room_share) {
        query += ' WHERE room_share = ?';
        queryParams.push(room_share);
    }

    db.query(query, queryParams, (error, results) => {
        if (error) {
            console.error('Error fetching rooms:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
};

exports.countStudent = (req, res) => {
    const query = `
        SELECT 
            r.id AS room_id, 
            r.room_name, 
            COUNT(s.id) AS student_count 
        FROM 
            rooms r 
        LEFT JOIN 
            students s ON r.id = s.room_id 
        GROUP BY 
            r.id, r.room_name
    `;

    db.query(query, (error, results) => {
        if (error) {
            console.error('Error counting students by room:', error.message);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
};
