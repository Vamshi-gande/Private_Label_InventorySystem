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

    if (!profile) {
        throw new Error(`Priority profile not found for product type: ${type}`);
    }

    let baseMultiplier = Number(profile.base_multiplier) || 0;
    let performanceWeight = Number(profile.performance_weight) || 0;
    let maxMultiplier = Number(profile.max_multiplier) || 0;

    let finalPriority = baseMultiplier + (Number(product.sales_velocity) * performanceWeight);

    if (finalPriority > maxMultiplier) {
        finalPriority = maxMultiplier;
    }

    return finalPriority.toFixed(2);
}

module.exports = { calculatePriority };
