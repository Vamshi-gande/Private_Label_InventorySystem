require('dotenv').config();
const express = require('express');
const app = express();
const cronScheduler = require('./cron/cleanupScheduler');

const reservationRoutes = require('./routes/reservations');
const inventoryRoutes = require('./routes/inventory');
const analyticsRoutes = require('./routes/analytics');
const demoRoutes = require('./routes/demo');

app.use(express.json());

app.use('/api/reservations', reservationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/demo', demoRoutes);

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
