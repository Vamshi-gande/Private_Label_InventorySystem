-- Warehouses
INSERT INTO warehouses (warehouse_name, region) VALUES
('East Coast Distribution Center', 'Northeast'),
('Central Distribution Hub', 'Midwest'),
('West Coast Fulfillment', 'West');

-- Stores
INSERT INTO stores (store_name, region) VALUES
('Manhattan Flagship', 'Northeast'),
('Brooklyn Heights', 'Northeast'),
('Chicago Loop', 'Midwest'),
('Los Angeles Beverly', 'West');

-- Products
INSERT INTO products (sku, product_name, is_private_label, profit_margin_percentage, selling_price) VALUES
('PL001', 'Store Brand Premium Coffee', TRUE, 45.00, 9.99),
('PL002', 'House Label Organic Pasta', TRUE, 35.00, 1.85),
('TP001', 'Coca-Cola Classic 12pk', FALSE, 18.00, 5.99),
('TP002', 'Kelloggs Corn Flakes', FALSE, 22.00, 4.99);

-- Inventory
INSERT INTO inventory (product_id, warehouse_id, available_quantity, reserved_quantity, safety_stock_level) VALUES
(1, 1, 500, 0, 50),  -- Coffee at East Coast
(2, 1, 300, 0, 30),  -- Pasta at East Coast
(3, 1, 800, 0, 80),  -- Coca-Cola at East Coast
(4, 1, 600, 0, 60);  -- Kelloggs at East Coast


--Component-2
-- Insert Initial Classification Rules
INSERT INTO classification_rules (rule_type, rule_pattern, confidence_score) VALUES
('BRAND', 'Store Brand', 1.0),
('BRAND', 'House Label', 0.9),
('SKU_PATTERN', 'PL%', 0.95),
('SKU_PATTERN', 'HL%', 0.9);


-- Insert Priority Profiles
INSERT INTO priority_profiles (product_type, base_multiplier, max_multiplier, performance_weight) VALUES
('PRIVATE_LABEL', 1.5, 3.0, 0.5),
('THIRD_PARTY', 1.0, 2.0, 0.3);


-- Insert Products (Some Matching, Some Not)
INSERT INTO products (
  sku, product_name, brand, category, is_private_label, profit_margin_percentage,
  sales_velocity, base_priority, calculated_priority, supplier_id, unit_cost,
  selling_price, participate_in_allocation
)
VALUES
('PL001', 'Store Brand Premium Coffee', 'Store Brand', 'Beverages', TRUE, 45.00, 2.0, 1.5, 2.5, 101, 5.00, 9.99, TRUE),
('HL001', 'House Label Organic Pasta', 'House Label', 'Food', TRUE, 35.00, 3.0, 1.5, 3.0, 102, 1.00, 1.85, TRUE),
('TP001', 'Coca-Cola Classic 12pk', 'Coca-Cola', 'Beverages', FALSE, 18.00, 1.0, 1.0, 1.3, 103, 4.50, 5.99, TRUE),
('TP002', 'Kellogg''s Corn Flakes', 'Kellogg''s', 'Food', FALSE, 22.00, 1.5, 1.0, 1.45, 104, 3.00, 4.99, TRUE),
('UN001', 'Unclassified Energy Bar', 'Unknown Brand', 'Snacks', NULL, 25.00, 0.5, 1.0, 1.0, 105, 2.00, 3.50, TRUE);

truncate table products cascade;


--component-3
-- Manager Actions for Behavioral Analysis
INSERT INTO manager_actions (store_id, product_id, action_type, quantity, original_schedule_date, action_timestamp, comments, manager_id) VALUES
-- Early ordering patterns (indicating demand increase expectations)
(1, 1, 'early_order', 200, '2025-07-15', '2025-06-28 10:30:00', 'Summer coffee demand expected to spike', 101),
(1, 2, 'early_order', 150, '2025-07-20', '2025-07-02 14:15:00', 'Back-to-school pasta promotions starting early', 101),
(2, 1, 'early_order', 180, '2025-07-18', '2025-06-30 09:45:00', 'Local event driving coffee sales', 102),

-- Emergency orders (indicating unexpected demand spikes)
(3, 3, 'emergency_order', 100, NULL, '2025-07-01 16:20:00', 'Coca-Cola stock out due to heat wave', 103),
(4, 4, 'emergency_order', 75, NULL, '2025-06-29 11:30:00', 'Breakfast cereal promotion exceeded expectations', 104),
(1, 3, 'emergency_order', 120, NULL, '2025-06-28 13:45:00', 'Competitor stock out, customers switching', 101),

-- Normal reorder patterns
(2, 2, 'scheduled_order', 100, '2025-07-10', '2025-07-10 08:00:00', 'Regular weekly pasta restock', 102),
(3, 1, 'scheduled_order', 150, '2025-07-12', '2025-07-12 09:30:00', 'Standard coffee inventory replenishment', 103),

-- Bulk orders indicating strategic planning
(1, 1, 'bulk_order', 500, '2025-08-01', '2025-07-01 10:00:00', 'Q3 coffee promotion prep - expecting 40% sales increase', 101),
(2, 3, 'bulk_order', 300, '2025-07-25', '2025-07-08 15:20:00', 'Summer beverage campaign launch', 102),

-- Seasonal adjustments
(4, 2, 'early_order', 200, '2025-08-15', '2025-07-20 12:00:00', 'Back-to-school season prep - pasta meals popular', 104),
(3, 4, 'early_order', 120, '2025-08-10', '2025-07-25 16:30:00', 'Cereal demand increases with school season', 103),

-- Weekend/event-driven orders
(1, 3, 'weekend_stock', 80, '2025-07-05', '2025-07-04 18:00:00', 'July 4th weekend - high beverage demand expected', 101),
(2, 1, 'event_order', 100, '2025-07-12', '2025-07-08 14:45:00', 'Local food festival - premium coffee booth', 102),

-- Competitive response orders
(4, 1, 'competitive_response', 90, NULL, '2025-06-30 20:15:00', 'Competitor launched coffee promotion, matching inventory', 104),
(3, 2, 'competitive_response', 110, NULL, '2025-07-01 07:30:00', 'Nearby store sold out, capturing overflow demand', 103),

-- Safety stock adjustments (volatility expectations)
(1, 1, 'safety_stock_increase', 50, NULL, '2025-07-01 12:00:00', 'Increasing coffee safety stock due to supply chain volatility', 101),
(2, 2, 'safety_stock_increase', 40, NULL, '2025-06-30 15:30:00', 'Pasta supply uncertainty - buffering inventory', 102),

-- Additional quantity adjustment examples
(3, 3, 'bulk_order', 400, '2025-07-20', '2025-07-05 10:00:00', 'Summer beverage surge - 300% increase from normal order', 103),
(4, 4, 'bulk_order', 350, '2025-08-01', '2025-07-10 14:00:00', 'Back-to-school cereal demand - massive order increase', 104);

--component-4

UPDATE stores SET latitude = 40.7128, longitude = -74.0060 WHERE store_name = 'Manhattan Flagship';
UPDATE stores SET latitude = 40.6950, longitude = -73.9950 WHERE store_name = 'Brooklyn Heights';
UPDATE stores SET latitude = 41.8781, longitude = -87.6298 WHERE store_name = 'Chicago Loop';
UPDATE stores SET latitude = 34.0736, longitude = -118.4004 WHERE store_name = 'Los Angeles Beverly';

INSERT INTO manager_performance (manager_id, current_weight) VALUES
('MGR001', 0.7),
('MGR002', 0.8),
('MGR003', 0.6),
('MGR004', 0.75);


--component-3
-- Manager Actions for Behavioral Analysis
INSERT INTO manager_actions (store_id, product_id, action_type, quantity, original_schedule_date, action_timestamp, comments, manager_id) VALUES
-- Early ordering patterns (indicating demand increase expectations)
(1, 1, 'early_order', 200, '2025-07-15', '2025-06-28 10:30:00', 'Summer coffee demand expected to spike', 101),
(1, 2, 'early_order', 150, '2025-07-20', '2025-07-02 14:15:00', 'Back-to-school pasta promotions starting early', 101),
(2, 1, 'early_order', 180, '2025-07-18', '2025-06-30 09:45:00', 'Local event driving coffee sales', 102),

-- Emergency orders (indicating unexpected demand spikes)
(3, 3, 'emergency_order', 100, NULL, '2025-07-01 16:20:00', 'Coca-Cola stock out due to heat wave', 103),
(4, 4, 'emergency_order', 75, NULL, '2025-06-29 11:30:00', 'Breakfast cereal promotion exceeded expectations', 104),
(1, 3, 'emergency_order', 120, NULL, '2025-06-28 13:45:00', 'Competitor stock out, customers switching', 101),

-- Normal reorder patterns
(2, 2, 'scheduled_order', 100, '2025-07-10', '2025-07-10 08:00:00', 'Regular weekly pasta restock', 102),
(3, 1, 'scheduled_order', 150, '2025-07-12', '2025-07-12 09:30:00', 'Standard coffee inventory replenishment', 103),

-- Bulk orders indicating strategic planning
(1, 1, 'bulk_order', 500, '2025-08-01', '2025-07-01 10:00:00', 'Q3 coffee promotion prep - expecting 40% sales increase', 101),
(2, 3, 'bulk_order', 300, '2025-07-25', '2025-07-08 15:20:00', 'Summer beverage campaign launch', 102),

-- Seasonal adjustments
(4, 2, 'early_order', 200, '2025-08-15', '2025-07-20 12:00:00', 'Back-to-school season prep - pasta meals popular', 104),
(3, 4, 'early_order', 120, '2025-08-10', '2025-07-25 16:30:00', 'Cereal demand increases with school season', 103),

-- Weekend/event-driven orders
(1, 3, 'weekend_stock', 80, '2025-07-05', '2025-07-04 18:00:00', 'July 4th weekend - high beverage demand expected', 101),
(2, 1, 'event_order', 100, '2025-07-12', '2025-07-08 14:45:00', 'Local food festival - premium coffee booth', 102),

-- Competitive response orders
(4, 1, 'competitive_response', 90, NULL, '2025-06-30 20:15:00', 'Competitor launched coffee promotion, matching inventory', 104),
(3, 2, 'competitive_response', 110, NULL, '2025-07-01 07:30:00', 'Nearby store sold out, capturing overflow demand', 103),

-- Safety stock adjustments (volatility expectations)
(1, 1, 'safety_stock_increase', 50, NULL, '2025-07-01 12:00:00', 'Increasing coffee safety stock due to supply chain volatility', 101),
(2, 2, 'safety_stock_increase', 40, NULL, '2025-06-30 15:30:00', 'Pasta supply uncertainty - buffering inventory', 102),

-- Additional quantity adjustment examples
(3, 3, 'bulk_order', 400, '2025-07-20', '2025-07-05 10:00:00', 'Summer beverage surge - 300% increase from normal order', 103),
(4, 4, 'bulk_order', 350, '2025-08-01', '2025-07-10 14:00:00', 'Back-to-school cereal demand - massive order increase', 104);
