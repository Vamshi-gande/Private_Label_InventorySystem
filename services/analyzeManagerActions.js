const pool = require('../config/db');
const analyzer = require('./behaviourAnalyzer');

async function analyzeAndStoreSignals() {
  const actions = await pool.query('SELECT * FROM manager_actions');
  const signals = actions.rows.map(analyzer.extractSignal).filter(Boolean);


  console.log('[Behavioral Signals]', signals);
}

module.exports = analyzeAndStoreSignals;