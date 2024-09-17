const db = require('../config/db'); // No need for .promise()

// Fetch pending student approval requests
exports.getNotifications = (req, res) => {
    db.query(`
        SELECT * FROM notifications WHERE is_read = FALSE ORDER BY created_at DESC
    `, (error, notifications) => {
        if (error) {
            console.error('Error fetching notifications:', error);
            return res.status(500).send('Error fetching notifications');
        }
        res.json(notifications);
    });
};

// Mark notifications as read after the admin views them
exports.markAsRead = (req, res) => {
    const { id } = req.params;
    db.query(`UPDATE notifications SET is_read = TRUE WHERE id = ?`, [id], (error) => {
        if (error) {
            console.error('Error marking notification as read:', error);
            return res.status(500).send('Error marking notification as read');
        }
        res.status(200).send('Notification marked as read');
    });
};

const addNotification = async (message, studentId) => {
    try {
        const sql = 'INSERT INTO notifications (message, student_id, is_read, created_at) VALUES (?, ?, FALSE, NOW())';
        await db.query(sql, [message, studentId]);
    } catch (error) {
        console.error('Error inserting notification:', error);
    }
};
