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
    const { room_name } = req.body;
    db.query('INSERT INTO rooms (floor_id, room_name) VALUES (?, ?)', [floorId, room_name], (error) => {
        if (error) {
            console.error('Error creating room:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({ message: 'Room created successfully' });
    });
};
