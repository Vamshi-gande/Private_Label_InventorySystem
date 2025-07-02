const pool = require('../config/db');

async function saveConsensus(region, consensus) {
    await pool.query(
        `INSERT INTO regional_consensus_history (region, signal_type, consensus_strength, participation_rate, participating_stores, confidence, emergency_alert, recommended_action)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
            region,
            consensus.signal_type,
            consensus.consensus_strength,
            consensus.participation_rate,
            consensus.participating_stores,
            consensus.confidence,
            consensus.emergency_alert || false,
            consensus.recommended_action || 'none'
        ]
    );
}

module.exports = { saveConsensus };
