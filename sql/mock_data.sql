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

-- component-4

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

-- Component 6: Store inventory mock data
INSERT INTO store_inventory (store_id, product_id, sku, current_stock, safety_stock, reserved_quantity, average_daily_sales) VALUES
(1, 1, 'PL-PASTA-001', 240, 50, 10, 15.5),
(1, 2, 'PL-SAUCE-002', 180, 30, 5, 8.2),
(1, 3, 'BR-BREAD-001', 120, 20, 0, 12.0),
(2, 1, 'PL-PASTA-001', 80, 30, 5, 10.5),
(2, 2, 'PL-SAUCE-002', 150, 25, 0, 6.8),
(2, 3, 'BR-BREAD-001', 200, 40, 15, 18.2),
(3, 1, 'PL-PASTA-001', 320, 60, 20, 22.0),
(3, 2, 'PL-SAUCE-002', 90, 15, 0, 4.5),
(3, 3, 'BR-BREAD-001', 160, 25, 10, 14.8)
ON CONFLICT (store_id, product_id) DO NOTHING;

-- Add store location data for regional priority calculation
UPDATE stores SET latitude = 40.7831, longitude = -73.9712 WHERE store_id = 1;
UPDATE stores SET latitude = 40.6962, longitude = -73.9961 WHERE store_id = 2;
UPDATE stores SET latitude = 40.7589, longitude = -73.9851 WHERE store_id = 3;

-- Component 7: Warehouse Transfer System Mock Data

-- Update warehouses with coordinates for distance calculations
UPDATE warehouses SET 
    latitude = CASE warehouse_id
        WHEN 1 THEN 40.7128  -- East Coast (NYC area)
        WHEN 2 THEN 41.8781  -- Midwest (Chicago area)
        WHEN 3 THEN 34.0522  -- West Coast (LA area)
        ELSE NULL
    END,
    longitude = CASE warehouse_id  
        WHEN 1 THEN -74.0060 -- East Coast (NYC area)
        WHEN 2 THEN -87.6298 -- Midwest (Chicago area)
        WHEN 3 THEN -118.2437 -- West Coast (LA area)
        ELSE NULL
    END
WHERE warehouse_id IN (1, 2, 3);

-- Insert sample warehouse capacity data
INSERT INTO warehouse_capacity (warehouse_id, date, max_capacity, current_utilization, incoming_scheduled, outgoing_scheduled) 
VALUES 
    (1, CURRENT_DATE, 1000, 250, 50, 100),  -- East Coast Distribution Center
    (2, CURRENT_DATE, 600, 180, 30, 60),    -- Central Distribution Hub  
    (3, CURRENT_DATE, 300, 120, 20, 40)     -- West Coast Fulfillment
ON CONFLICT (warehouse_id, date) DO UPDATE SET
    max_capacity = EXCLUDED.max_capacity,
    current_utilization = EXCLUDED.current_utilization,
    incoming_scheduled = EXCLUDED.incoming_scheduled,
    outgoing_scheduled = EXCLUDED.outgoing_scheduled;

-- Insert sample transfer routes with costs
INSERT INTO transfer_routes (from_warehouse_id, to_store_id, distance_km, estimated_time_hours, base_cost, active) VALUES
    -- East Coast Warehouse to Stores
    (1, 1, 15.2, 1.5, 25.00, true),   -- To Manhattan Flagship
    (1, 2, 22.8, 2.0, 35.00, true),   -- To Brooklyn Heights
    (1, 3, 790.5, 12.0, 450.00, true), -- To Chicago Loop (cross-region)
    (1, 4, 2445.0, 36.0, 1200.00, true), -- To LA Beverly (cross-region)
    
    -- Central Warehouse to Stores  
    (2, 1, 790.5, 12.0, 450.00, true), -- To Manhattan (cross-region)
    (2, 2, 815.3, 13.0, 475.00, true), -- To Brooklyn (cross-region)
    (2, 3, 18.7, 1.8, 30.00, true),   -- To Chicago Loop
    (2, 4, 1745.2, 26.0, 850.00, true), -- To LA Beverly (cross-region)
    
    -- West Coast Warehouse to Stores
    (3, 1, 2445.0, 36.0, 1200.00, true), -- To Manhattan (cross-region)
    (3, 2, 2470.8, 37.0, 1225.00, true), -- To Brooklyn (cross-region) 
    (3, 3, 1745.2, 26.0, 850.00, true), -- To Chicago (cross-region)
    (3, 4, 25.4, 2.5, 40.00, true);   -- To LA Beverly

-- Insert sample warehouse performance metrics
INSERT INTO warehouse_performance (warehouse_id, date, success_rate, avg_processing_time_hours, capacity_utilization, cost_efficiency_score) VALUES
    (1, CURRENT_DATE, 96.5, 2.3, 25.0, 85.2),  -- East Coast performing well
    (2, CURRENT_DATE, 94.8, 2.8, 30.0, 82.7),  -- Central performing well
    (3, CURRENT_DATE, 91.2, 3.5, 40.0, 78.9)   -- West Coast needs improvement
ON CONFLICT (warehouse_id, date) DO UPDATE SET
    success_rate = EXCLUDED.success_rate,
    avg_processing_time_hours = EXCLUDED.avg_processing_time_hours,
    capacity_utilization = EXCLUDED.capacity_utilization,
    cost_efficiency_score = EXCLUDED.cost_efficiency_score;

--component-8
-- Insert sample warehouses
INSERT INTO warehouses (warehouse_id, warehouse_name, latitude, longitude, region) VALUES
('001', 'NYC Regional', 40.7282, -74.0776, 'northeast'),
('002', 'Chicago Central', 41.8781, -87.6298, 'midwest'),
('003', 'LA Distribution', 34.0522, -118.2437, 'west'),
('004', 'Miami Southeast', 25.7617, -80.1918, 'southeast');

-- Insert sample warehouse capacity
INSERT INTO warehouse_capacity (warehouse_id, date, max_capacity, current_utilization, incoming_scheduled) VALUES
('001', CURRENT_DATE, 1000, 300, 50),
('002', CURRENT_DATE, 1200, 900, 100),
('003', CURRENT_DATE, 1500, 200, 100),
('004', CURRENT_DATE, 800, 600, 50);

-- Insert sample stores
INSERT INTO stores (store_id, store_name, latitude, longitude, warehouse_id, annual_revenue, region) VALUES
('001', 'Downtown Manhattan', 40.7831, -73.9712, '001', 15000000, 'northeast'),
('002', 'Brooklyn Heights', 40.6962, -73.9961, '001', 8000000, 'northeast'),
('003', 'Queens Plaza', 40.7505, -73.9370, '001', 12000000, 'northeast'),
('004', 'Chicago Loop', 41.8781, -87.6298, '002', 18000000, 'midwest'),
('005', 'Chicago North', 41.9278, -87.6431, '002', 10000000, 'midwest'),
('006', 'LA Beverly Hills', 34.0736, -118.4004, '003', 22000000, 'west'),
('007', 'LA Santa Monica', 34.0195, -118.4912, '003', 16000000, 'west'),
('008', 'Miami Beach', 25.7907, -80.1300, '004', 14000000, 'southeast');

-- Insert sample products
INSERT INTO products (product_id, sku, product_name, brand, category, is_private_label, profit_margin_percentage, sales_velocity, base_priority, calculated_priority, supplier_id, unit_cost, selling_price, participate_in_allocation) VALUES
(1, 'PL-PASTA-001', 'Private Pasta', 'Store Brand', 'Food', true, 45, 75, 1.5, 4.75, 101, 1.25, 3.99, true),
(2, 'TP-JUICE-001', 'Orange Juice', 'Minute Maid', 'Beverages', false, 30, 50, 1.0, 2.50, 102, 0.90, 2.49, true);

-- Insert store_inventory mapping
INSERT INTO store_inventory (store_id, product_id, current_stock, reserved_quantity, safety_stock, sku) VALUES
('001', 1, 300, 20, 50, 'PL-PASTA-001'),
('004', 2, 500, 10, 50, 'TP-JUICE-001');

truncate table products cascade;
truncate table warehouses cascade;
TRUNCATE TABLE stores CASCADE;