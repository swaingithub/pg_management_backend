const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const indexRoutes = require('./routes/indexRoutes');
const studentRoutes = require('./routes/studentRoutes');
const notificationRoutes = require('./routes/notificationRoute');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());


// Routes
app.use('/api/auth', authRoutes);
app.use('/api', indexRoutes);
app.use('/api', studentRoutes);
app.use('/api', notificationRoutes);
app.use('/uploads', express.static('uploads'));


// Start the server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
