// Component 3: Intelligence Engine
// Zero-Input Intelligence Extraction from Manager Behaviors

/**
 * Extract behavioral intelligence from manager actions
 * @param {Object} actionData - Manager action data
 * @returns {Object} Extracted intelligence with confidence score
 */
function extractIntelligence(actionData) {
    const { action_type, timing_variance, quantity_variance } = actionData;

    switch (action_type) {
        case 'early_order':
            return extractEarlyOrderIntelligence(timing_variance);
        case 'quantity_increase':
            return extractQuantityIntelligence(quantity_variance);
        case 'safety_stock_increase':
            return extractSafetyStockIntelligence(quantity_variance);
        case 'emergency_order':
            return extractEmergencyIntelligence();
        case 'bulk_order':
            return extractBulkOrderIntelligence(quantity_variance);
        case 'competitive_response':
            return extractCompetitiveIntelligence();
        default:
            return { signal: 'unknown', confidence: 0.0, reasoning: 'unrecognized_action' };
    }
}

/**
 * Extract intelligence from early ordering patterns
 */
function extractEarlyOrderIntelligence(timing_variance) {
    const daysEarly = Math.abs(timing_variance);
    
    if (daysEarly >= 21) {
        return {
            signal: 'seasonal_preparation',
            confidence: Math.min(0.95, daysEarly / 30),
            reasoning: `Manager ordered ${daysEarly} days early - indicates major seasonal preparation`,
            magnitude: 'significant',
            demand_multiplier: 1.3,
            duration_weeks: Math.ceil(daysEarly / 7),
            trigger: 'order_timing_variance'
        };
    } else if (daysEarly >= 14) {
        return {
            signal: 'demand_increase_expected',
            confidence: Math.min(0.85, daysEarly / 30),
            reasoning: `Manager ordered ${daysEarly} days early - expects demand increase`,
            magnitude: 'moderate',
            demand_multiplier: 1.15,
            duration_weeks: Math.ceil(daysEarly / 7),
            trigger: 'order_timing_variance'
        };
    }
    
    return { signal: 'normal_pattern', confidence: 0.0, reasoning: 'within normal range' };
}

/**
 * Extract intelligence from quantity adjustments
 */
function extractQuantityIntelligence(quantity_variance) {
    if (quantity_variance >= 1.5) {
        return {
            signal: 'supply_concern',
            confidence: 0.85,
            reasoning: `Quantity increased by ${((quantity_variance - 1) * 100).toFixed(0)}% - indicates supply chain concern`,
            magnitude: 'high',
            demand_multiplier: quantity_variance,
            duration_weeks: 4,
            trigger: 'quantity_adjustment'
        };
    } else if (quantity_variance >= 1.25) {
        return {
            signal: 'market_opportunity',
            confidence: 0.75,
            reasoning: `Quantity increased by ${((quantity_variance - 1) * 100).toFixed(0)}% - market opportunity detected`,
            magnitude: 'moderate',
            demand_multiplier: quantity_variance,
            duration_weeks: 3,
            trigger: 'quantity_adjustment'
        };
    }
    
    return { signal: 'normal_quantity', confidence: 0.0, reasoning: 'normal quantity variance' };
}

/**
 * Extract intelligence from safety stock changes
 */
function extractSafetyStockIntelligence(quantity_variance) {
    if (quantity_variance >= 2.0) {
        return {
            signal: 'supply_disruption_prep',
            confidence: 0.90,
            reasoning: `Safety stock increased by ${((quantity_variance - 1) * 100).toFixed(0)}% - preparing for supply disruption`,
            magnitude: 'critical',
            buffer_multiplier: quantity_variance,
            duration_weeks: Math.ceil(quantity_variance * 2),
            trigger: 'safety_stock_change'
        };
    } else if (quantity_variance >= 1.5) {
        return {
            signal: 'volatility_expected',
            confidence: 0.80,
            reasoning: `Safety stock increased by ${((quantity_variance - 1) * 100).toFixed(0)}% - expecting demand volatility`,
            magnitude: 'significant',
            buffer_multiplier: quantity_variance,
            duration_weeks: Math.ceil(quantity_variance * 1.5),
            trigger: 'safety_stock_change'
        };
    }
    
    return { signal: 'normal_buffer', confidence: 0.0, reasoning: 'normal buffer level' };
}

/**
 * Extract intelligence from emergency orders
 */
function extractEmergencyIntelligence() {
    return {
        signal: 'unexpected_demand_spike',
        confidence: 0.95,
        reasoning: 'Emergency order placed - immediate demand spike occurring',
        magnitude: 'critical',
        demand_multiplier: 2.0,
        duration_weeks: 2,
        emergency_flag: true,
        trigger: 'emergency_order'
    };
}

/**
 * Extract intelligence from bulk orders
 */
function extractBulkOrderIntelligence(quantity_variance) {
    if (quantity_variance >= 1.5) {
        return {
            signal: 'market_opportunity_detected',
            confidence: Math.min(0.9, quantity_variance - 0.5),
            reasoning: `Bulk order ${((quantity_variance - 1) * 100).toFixed(0)}% above normal - market opportunity`,
            magnitude: quantity_variance > 2.0 ? 'significant' : 'moderate',
            demand_multiplier: quantity_variance,
            duration_weeks: 4,
            trigger: 'bulk_order'
        };
    }
    
    return { signal: 'normal_bulk_order', confidence: 0.0, reasoning: 'standard bulk order' };
}

/**
 * Extract intelligence from competitive response actions
 */
function extractCompetitiveIntelligence() {
    return {
        signal: 'market_disruption_detected',
        confidence: 0.85,
        reasoning: 'Manager responding to competitive action - market disruption detected',
        magnitude: 'moderate',
        demand_multiplier: 1.2,
        duration_weeks: 3,
        trigger: 'competitive_response'
    };
}

/**
 * Aggregate intelligence from multiple manager actions
 */
function aggregateIntelligence(actions) {
    if (actions.length === 0) {
        return { signal: 'no_intelligence', confidence: 0.0 };
    }

    // Group by signal type and calculate weighted confidence
    const signalGroups = {};
    
    actions.forEach(action => {
        const intelligence = action.extracted_intelligence;
        if (!intelligence || !intelligence.signal) return;
        
        const managerWeight = action.current_weight || 1.0;
        const weightedConfidence = intelligence.confidence * managerWeight;
        
        if (!signalGroups[intelligence.signal]) {
            signalGroups[intelligence.signal] = {
                total_confidence: 0,
                action_count: 0,
                latest_action: action.action_timestamp,
                forecast_adjustments: []
            };
        }
        
        signalGroups[intelligence.signal].total_confidence += weightedConfidence;
        signalGroups[intelligence.signal].action_count += 1;
        if (intelligence.demand_multiplier) {
            signalGroups[intelligence.signal].forecast_adjustments.push({
                demand_multiplier: intelligence.demand_multiplier,
                duration_weeks: intelligence.duration_weeks || 2,
                confidence_score: intelligence.confidence
            });
        }
    });

    // Find the strongest signal
    let strongestSignal = null;
    let highestConfidence = 0;
    
    for (const [signal, data] of Object.entries(signalGroups)) {
        const avgConfidence = data.total_confidence / data.action_count;
        if (avgConfidence > highestConfidence) {
            highestConfidence = avgConfidence;
            strongestSignal = signal;
        }
    }

    return {
        primary_signal: strongestSignal,
        confidence: Number(highestConfidence.toFixed(2)),
        supporting_actions: signalGroups[strongestSignal].action_count,
        forecast_adjustment: calculateAggregateAdjustment(
            signalGroups[strongestSignal].forecast_adjustments
        )
    };
}

/**
 * Calculate aggregate forecast adjustment from multiple signals
 */
function calculateAggregateAdjustment(adjustments) {
    if (adjustments.length === 0) return null;
    
    const avgMultiplier = adjustments.reduce((sum, adj) => 
        sum + (adj.demand_multiplier || 1.0), 0
    ) / adjustments.length;
    
    const maxDuration = Math.max(...adjustments.map(adj => adj.duration_weeks || 2));
    const avgConfidence = adjustments.reduce((sum, adj) => sum + adj.confidence_score, 0) / adjustments.length;
    
    return {
        aggregate_multiplier: Number(avgMultiplier.toFixed(2)),
        duration_weeks: maxDuration,
        confidence: Number(avgConfidence.toFixed(2)),
        signal_count: adjustments.length
    };
}

module.exports = { 
    extractIntelligence, 
    aggregateIntelligence,
    calculateAggregateAdjustment
};
