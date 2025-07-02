/**
 * Enhanced classification engine for manager actions
 * Uses heuristics and external intelligence to classify manager actions
 */

/**
 * Classify a manager action based on raw data and external intelligence
 * @param {Object} rawData - Raw manager action data
 * @param {Object} weatherData - Weather data from external API
 * @param {Array} newsData - News articles from external API
 * @param {Object} economicData - Economic indicators data
 * @returns {Object} Classification result with action_type, confidence, and rationale
 */
function classifyAction(rawData, weatherData, newsData, economicData) {
    const { 
        scheduled_order_date, 
        actual_order_date, 
        scheduled_quantity, 
        actual_quantity, 
        normal_baseline,
        actual_action,
        comments = '',
        product_category = ''
    } = rawData;

    // Calculate timing and quantity variance
    let timingVariance = 0;
    let quantityVariance = 1.0;

    // Handle different data formats
    if (scheduled_order_date && actual_order_date) {
        // Direct date format
        timingVariance = Math.floor((new Date(scheduled_order_date) - new Date(actual_order_date)) / (24 * 3600 * 1000));
    } else if (normal_baseline?.typical_order_date && actual_action?.actual_order_date) {
        // Structured format from existing system
        timingVariance = Math.floor((new Date(normal_baseline.typical_order_date) - new Date(actual_action.actual_order_date)) / (24 * 3600 * 1000));
    } else if (rawData.timing_variance !== undefined) {
        // Direct timing variance
        timingVariance = rawData.timing_variance;
    }

    // Calculate quantity variance
    if (scheduled_quantity && actual_quantity) {
        quantityVariance = actual_quantity / scheduled_quantity;
    } else if (normal_baseline?.typical_quantity && actual_action?.actual_quantity) {
        quantityVariance = actual_action.actual_quantity / normal_baseline.typical_quantity;
    } else if (rawData.quantity_variance !== undefined) {
        quantityVariance = rawData.quantity_variance;
    }

    // Check external intelligence factors
    // For news data - check if articles mention the product category
    const newsRelevant = newsData?.articles?.some(article => 
        article.title?.toLowerCase().includes(product_category.toLowerCase()) ||
        article.description?.toLowerCase().includes(product_category.toLowerCase())
    );
    
    // For weather data - check for high temperatures
    const hotWeather = 
        (weatherData?.main?.temp > 30) || 
        (weatherData?.forecasts?.some(f => f.temperature > 30));
    
    // For economic data - analyze multiple indicators if available
    const hasMultipleIndicators = economicData?.indicators && Object.keys(economicData.indicators).length > 1;
    
    // Unemployment indicators
    const economicShift = economicData?.value < 4.0 || economicData?.indicators?.UNRATE?.value < 4.0;
    const lowUnemployment = economicData?.value < 3.7 || economicData?.indicators?.UNRATE?.value < 3.7;
    
    // Additional economic indicators (if available)
    const highInflation = hasMultipleIndicators && 
        economicData.indicators.CPIAUCSL && 
        economicData.indicators.CPIAUCSL.value > 310; // High CPI threshold
    
    const risingConsumerSpending = hasMultipleIndicators && 
        economicData.indicators.PCE && 
        economicData.indicators.PCE.value > 18500; // High personal consumption
    
    const highConsumerSentiment = hasMultipleIndicators && 
        economicData.indicators.UMCSENT && 
        economicData.indicators.UMCSENT.value > 85; // High consumer sentiment
    
    const strongRetailSales = hasMultipleIndicators && 
        economicData.indicators.RSAFS && 
        economicData.indicators.RSAFS.value > 730; // Strong retail sales
    
    const highInventoryRatio = hasMultipleIndicators && 
        economicData.indicators.ISRATIO && 
        economicData.indicators.ISRATIO.value > 1.4; // High inventory-to-sales ratio
    
    // Classify action based on patterns and external intelligence
    if (timingVariance <= -14) {
        return { 
            action_type: 'early_order',
            confidence: 0.9,
            rationale: `Order placed ${Math.abs(timingVariance)} days early, indicating preparation for increased demand`
        };
    }
    
    if (quantityVariance >= 1.5) {
        return { 
            action_type: 'bulk_order',
            confidence: 0.85,
            rationale: `Quantity increased by ${((quantityVariance - 1) * 100).toFixed(0)}%, suggesting anticipation of higher demand`
        };
    }
    
    if (comments?.toLowerCase().includes('emergency') || 
        comments?.toLowerCase().includes('urgent')) {
        return { 
            action_type: 'emergency_order',
            confidence: 0.95,
            rationale: 'Explicitly marked as emergency/urgent by manager'
        };
    }
    
    if (newsRelevant) {
        return { 
            action_type: 'event_driven',
            confidence: 0.7,
            rationale: 'Relevant news detected for product category, suggesting event-driven decision'
        };
    }
    
    if (hotWeather && 
        (product_category.toLowerCase().includes('ice') || 
         product_category.toLowerCase().includes('beverage'))) {
        return { 
            action_type: 'weather_demand_spike',
            confidence: 0.8,
            rationale: 'Weather-sensitive product with high temperature forecast'
        };
    }
    
    if (economicShift) {
        return { 
            action_type: 'economic_substitution',
            confidence: 0.6,
            rationale: 'Economic indicators suggest shift toward alternative products'
        };
    }

    if (lowUnemployment && quantityVariance >= 1.2) {
        return {
            action_type: 'consumer_confidence_response',
            confidence: 0.65,
            rationale: 'Order increase aligned with strong employment numbers'
        };
    }
    
    if (highInflation && quantityVariance < 1.0) {
        return {
            action_type: 'inflation_response',
            confidence: 0.75,
            rationale: 'Order reduction aligned with high inflation indicators'
        };
    }
    
    if (risingConsumerSpending && quantityVariance >= 1.3) {
        return {
            action_type: 'consumer_spending_response',
            confidence: 0.7,
            rationale: 'Order increase aligned with rising consumer spending'
        };
    }
    
    if (highConsumerSentiment && product_category.toLowerCase().includes('premium')) {
        return {
            action_type: 'premium_product_push',
            confidence: 0.65,
            rationale: 'Premium product emphasis aligned with high consumer sentiment'
        };
    }
    
    if (strongRetailSales && timingVariance < -7) {
        return {
            action_type: 'retail_momentum_response',
            confidence: 0.7,
            rationale: 'Early order aligned with strong retail sales momentum'
        };
    }
    
    if (highInventoryRatio && quantityVariance < 0.9) {
        return {
            action_type: 'inventory_reduction',
            confidence: 0.75,
            rationale: 'Order reduction aligned with high industry inventory ratios'
        };
    }

    // Default classification
    return { 
        action_type: 'scheduled_order',
        confidence: 0.5,
        rationale: 'Regular order with no significant patterns detected'
    };
}

module.exports = { classifyAction };
