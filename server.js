require('dotenv').config();
const express = require('express');
const app = express();

//Cleanup Scheduler
const cronScheduler = require('./cron/cleanupScheduler');

//Component-3 Manager Actions Scheduler
const managerActionsScheduler = require('./cron/managerActionsScheduler');

//Component-1
const reservationRoutes = require('./routes/reservations');
const inventoryRoutes = require('./routes/inventory');
const analyticsRoutes = require('./routes/analytics');
const demoRoutes = require('./routes/demo');

//Component-2
const classificationRoutes = require('./routes/classification');
const dashboardRoutes = require('./routes/dashboard');
const healthRoutes = require('./routes/health');

//Component-3
const managerActionsRoutes = require('./routes/managerActions');

//Component-4
const consensusRoutes = require('./routes/consensus');

app.use(express.json());

//Component-1 Routes
app.use('/api/reservations', reservationRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/demo', demoRoutes);

//Component-2 Routes
app.use('/api/classification', classificationRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/health', healthRoutes);

//Component-3 Routes
app.use('/api/manager-actions', managerActionsRoutes);

//Component-4 Routes
app.use('/api/consensus', consensusRoutes);

const PORT = process.env.SERVER_PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

