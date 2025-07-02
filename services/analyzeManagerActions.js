const pool = require('../config/db');
const analyzer = require('./behaviourAnalyzer');

async function analyzeAndStoreSignals() {
  try {
    // Getting manager actions from last 24 hours for efficiency
    const recentActionsQuery = `
      SELECT * FROM manager_actions 
      WHERE action_timestamp >= NOW() - INTERVAL '24 hours'
      ORDER BY action_timestamp DESC
    `;
    
    const actions = await pool.query(recentActionsQuery);
    
    if (actions.rows.length === 0) {
      console.log('No recent manager actions to analyze');
      return;
    }

    // Extract behavioral signals
    const signals = actions.rows
      .map(analyzer.extractSignal)
      .filter(Boolean);

    // Categorize and count signals
    const signalSummary = {};
    signals.forEach(signal => {
      signalSummary[signal.signal] = (signalSummary[signal.signal] || 0) + 1;
    });

    console.log('Manager Action Analysis Results:');
    console.log(`   Actions analyzed: ${actions.rows.length}`);
    console.log(`   Signals detected: ${signals.length}`);
    
    if (signals.length > 0) {
      console.log('   Signal breakdown:');
      Object.entries(signalSummary).forEach(([signal, count]) => {
        console.log(`     • ${signal}: ${count}`);
      });

      // Log high-priority signals
      const highPrioritySignals = signals.filter(s => 
        s.confidence > 0.8 || s.magnitude === 'high' || s.magnitude === 'significant'
      );
      
      if (highPrioritySignals.length > 0) {
        console.log('High-Priority Signals:');
        highPrioritySignals.forEach(signal => {
          console.log(`     • Store ${signal.store_id}, Product ${signal.product_id}: ${signal.signal} (${Math.round(signal.confidence * 100)}% confidence)`);
        });
      }
    }

    return {
      totalActions: actions.rows.length,
      totalSignals: signals.length,
      signalSummary,
      highPrioritySignals: signals.filter(s => s.confidence > 0.8)
    };

  } catch (error) {
    console.error('Error analyzing manager actions:', error.message);
    throw error;
  }
}

module.exports = analyzeAndStoreSignals;