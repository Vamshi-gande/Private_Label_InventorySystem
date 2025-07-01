const pool = require('../config/db');

async function classifyProduct(product) {
    let isPrivateLabel = false;
    let confidence = 0;

    // Brand Matching
    const brandQuery = `
        SELECT * FROM classification_rules
        WHERE rule_type = 'BRAND' AND $1 ILIKE '%' || rule_pattern || '%'
        ORDER BY confidence_score DESC LIMIT 1
    `;
    const brandMatch = await pool.query(brandQuery, [product.brand]);

    if (brandMatch.rows.length > 0) {
        isPrivateLabel = true;
        confidence = brandMatch.rows[0].confidence_score;
    } else {
        // SKU Pattern Matching
        const skuQuery = `
            SELECT * FROM classification_rules
            WHERE rule_type = 'SKU_PATTERN' AND $1 LIKE rule_pattern
            ORDER BY confidence_score DESC LIMIT 1
        `;
        const skuMatch = await pool.query(skuQuery, [product.sku]);

        if (skuMatch.rows.length > 0) {
            isPrivateLabel = true;
            confidence = skuMatch.rows[0].confidence_score;
        }
    }

    return {
        isPrivateLabel,
        confidence,
        basePriority: isPrivateLabel ? 1.5 : 1.0
    };
}

module.exports = { classifyProduct };
