const { DataTypes } = require('sequelize');
const sequelize = require('../config/db'); // Adjust the path to your database configuration

const Room = sequelize.define('Room', {
    room_name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    floor_id: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    tableName: 'rooms', // Ensure this matches your database table name
    timestamps: false // Set to true if your table has createdAt/updatedAt fields
});

module.exports = Room;
