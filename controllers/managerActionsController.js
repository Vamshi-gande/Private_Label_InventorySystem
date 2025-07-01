const pool = require('../config/db');
const behaviorAnalyzer = require('../services/behaviourAnalyzer');

exports.logAction = async (req, res) => {
  const { store_id, product_id, action_type, quantity, original_schedule_date, comments } = req.body;
  try {
    await pool.query(
      `INSERT INTO manager_actions (store_id, product_id, action_type, quantity, original_schedule_date, comments)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [store_id, product_id, action_type, quantity, original_schedule_date, comments]
    );
    res.status(201).json({ message: 'Action logged successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getSignals = async (req, res) => {
  try {
    const actions = await pool.query('SELECT * FROM manager_actions');
    const signals = actions.rows.map(behaviorAnalyzer.extractSignal).filter(Boolean);
    res.json(signals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
