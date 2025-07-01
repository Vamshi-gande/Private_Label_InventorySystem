const cron = require('node-cron');
const analyze = require('./services/analyzeManagerActions');

cron.schedule('*/5 * * * *', analyze); // Every 5 mins
