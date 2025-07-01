exports.extractSignal = (action) => {
  const signals = [];

  // 1. Order Timing Variance Analysis
  if (action.action_type === 'early_order' && action.original_schedule_date) {
    const actionDate = new Date(action.action_timestamp);
    const normalDate = new Date(action.original_schedule_date);
    const daysEarly = Math.floor((normalDate - actionDate) / (1000 * 60 * 60 * 24));
    
    if (daysEarly >= 14) {
      signals.push({
        store_id: action.store_id,
        product_id: action.product_id,
        signal: 'demand_increase_expected',
        confidence: Math.min(0.95, daysEarly / 30),
        magnitude: daysEarly > 21 ? 'significant' : 'moderate',
        trigger: 'order_timing_variance',
        days_early: daysEarly
      });
    }
  }

  // 2. Emergency Orders (Rush Requests)
  if (action.action_type === 'emergency_order') {
    signals.push({
      store_id: action.store_id,
      product_id: action.product_id,
      signal: 'unexpected_demand_spike',
      confidence: 0.9,
      magnitude: 'high',
      trigger: 'emergency_order'
    });
  }

  // 3. Quantity Adjustments (Market Opportunities)
  if (action.action_type === 'bulk_order' && action.quantity) {
    // Assume normal order quantity is around 100-150 based on mock data
    const normalQuantity = 125;
    const quantityIncrease = (action.quantity - normalQuantity) / normalQuantity;
    
    if (quantityIncrease > 0.5) { // 50% increase
      signals.push({
        store_id: action.store_id,
        product_id: action.product_id,
        signal: 'market_opportunity_detected',
        confidence: Math.min(0.9, quantityIncrease),
        magnitude: quantityIncrease > 1.0 ? 'significant' : 'moderate',
        trigger: 'quantity_adjustment',
        quantity_increase_pct: Math.round(quantityIncrease * 100)
      });
    }
  }

  // 4. Safety Stock Changes (Volatility Expectations)
  if (action.action_type === 'safety_stock_increase') {
    signals.push({
      store_id: action.store_id,
      product_id: action.product_id,
      signal: 'volatility_expected',
      confidence: 0.8,
      magnitude: 'moderate',
      trigger: 'safety_stock_change'
    });
  }

  // 5. Competitive Response Intelligence
  if (action.action_type === 'competitive_response') {
    signals.push({
      store_id: action.store_id,
      product_id: action.product_id,
      signal: 'market_disruption_detected',
      confidence: 0.85,
      magnitude: 'moderate',
      trigger: 'competitive_response'
    });
  }

  // 6. Event-driven Intelligence
  if (action.action_type === 'event_order' || action.action_type === 'weekend_stock') {
    signals.push({
      store_id: action.store_id,
      product_id: action.product_id,
      signal: 'event_driven_demand',
      confidence: 0.75,
      magnitude: 'moderate',
      trigger: 'event_planning'
    });
  }

  // Return single signal for backward compatibility, or first signal if multiple
  return signals.length > 0 ? signals[0] : null;
};

// New function to extract ALL signals (not just the first one)
exports.extractAllSignals = (action) => {
  const signals = [];

  // Reuse the logic from extractSignal but return all signals
  const singleSignal = exports.extractSignal(action);
  if (singleSignal) {
    signals.push(singleSignal);
  }

  return signals;
};
