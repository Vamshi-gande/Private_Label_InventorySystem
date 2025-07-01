const pool = require('../config/db');

async function calculatePriority(product, isPrivateLabel) {
    const type = isPrivateLabel ? 'PRIVATE_LABEL' : 'THIRD_PARTY';

    const profileQuery = `
        SELECT * FROM priority_profiles
        WHERE product_type = $1
        LIMIT 1
    `;
    const profileResult = await pool.query(profileQuery, [type]);

    const profile = profileResult.rows[0];

    let finalPriority = profile.base_multiplier + (product.sales_velocity * profile.performance_weight);

    if (finalPriority > profile.max_multiplier) {
        finalPriority = profile.max_multiplier;
    }

    return finalPriority.toFixed(2);
}

module.exports = { calculatePriority };
