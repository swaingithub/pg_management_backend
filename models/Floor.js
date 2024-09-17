const db = require('../config/db');

const Floor = {
    create: (floorName, callback) => {
        db.query('INSERT INTO Floors (floor_name) VALUES (?)', [floorName], callback);
    },
    // Other CRUD operations...
};

module.exports = Floor;
