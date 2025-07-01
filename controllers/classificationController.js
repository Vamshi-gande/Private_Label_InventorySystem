const pool = require('../config/db');
const { classifyProduct } = require('../services/classifier');
const { calculatePriority } = require('../services/priorityCalculator');

exports.registerProduct = async (req, res) => {
    const { sku, productName, brand, category, profitMarginPercentage, salesVelocity, supplierId, unitCost, sellingPrice, participateInAllocation } = req.body;

    if (!sku || !productName || !category || !profitMarginPercentage) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    try {
        const classification = await classifyProduct({ sku, brand });
        const isPrivateLabel = classification.isPrivateLabel;

        const priority = await calculatePriority({ sales_velocity: salesVelocity }, isPrivateLabel);

        const insertQuery = `
            INSERT INTO products (sku, product_name, brand, category, is_private_label, profit_margin_percentage, sales_velocity, base_priority, calculated_priority, supplier_id, unit_cost, selling_price, participate_in_allocation)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
            RETURNING product_id
        `;
        const result = await pool.query(insertQuery, [
            sku, productName, brand, category, isPrivateLabel, profitMarginPercentage, salesVelocity, isPrivateLabel ? 1.5 : 1.0, priority, supplierId, unitCost, sellingPrice, participateInAllocation
        ]);

        res.json({
            success: true,
            productId: result.rows[0].product_id,
            isPrivateLabel,
            calculatedPriority: priority,
            message: 'Product registered and classified successfully.'
        });

    } catch (error) {
        console.error('Error registering product:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.batchClassifyProducts = async (req, res) => {
    const { products } = req.body;

    if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({ error: 'No products provided.' });
    }

    try {
        const results = [];
        const skippedProducts = [];

        for (const product of products) {
            const classification = await classifyProduct(product);
            const priority = await calculatePriority({ sales_velocity: product.salesVelocity }, classification.isPrivateLabel);

            const insertResult = await pool.query(
                `INSERT INTO products (sku, product_name, brand, category, is_private_label, profit_margin_percentage, sales_velocity, base_priority, calculated_priority, supplier_id, unit_cost, selling_price, participate_in_allocation)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
                 ON CONFLICT (sku) DO NOTHING
                 RETURNING sku`,
                [
                    product.sku,
                    product.productName,
                    product.brand,
                    product.category,
                    classification.isPrivateLabel,
                    product.profitMarginPercentage,
                    product.salesVelocity,
                    classification.isPrivateLabel ? 1.5 : 1.0,
                    priority,
                    product.supplierId,
                    product.unitCost,
                    product.sellingPrice,
                    product.participateInAllocation
                ]
            );

            if (insertResult.rows.length === 0) {
                // Product was skipped due to duplicate SKU
                skippedProducts.push(product.sku);
            } else {
                results.push({
                    sku: product.sku,
                    isPrivateLabel: classification.isPrivateLabel,
                    calculatedPriority: priority
                });
            }
        }

        res.json({
            success: true,
            classifiedProducts: results,
            skippedProducts: skippedProducts,
            message: 'Batch classification completed.'
        });

    } catch (error) {
        console.error('Error in batch classification:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};


exports.getClassificationRules = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM classification_rules ORDER BY rule_id');

        res.json({
            success: true,
            rules: result.rows
        });
    } catch (error) {
        console.error('Error fetching classification rules:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

exports.addClassificationRule = async (req, res) => {
    const { ruleType, rulePattern, confidenceScore } = req.body;

    if (!ruleType || !rulePattern || confidenceScore == null) {
        return res.status(400).json({ error: 'Missing required fields.' });
    }

    try {
        await pool.query(
            `INSERT INTO classification_rules (rule_type, rule_pattern, confidence_score)
             VALUES ($1, $2, $3)`,
            [ruleType, rulePattern, confidenceScore]
        );

        res.json({
            success: true,
            message: 'Classification rule added successfully.'
        });

    } catch (error) {
        console.error('Error adding classification rule:', error);
        res.status(500).json({ error: 'Internal server error.' });
    }
};
