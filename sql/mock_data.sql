-- Clean mock data for Private Label Inventory System
-- This file ensures proper foreign key relationships and prevents violations

-- First, clear existing data in proper order (child tables first)
DELETE FROM warehouse_performance;
DELETE FROM transfer_routes;
DELETE FROM warehouse_capacity;
DELETE FROM transfer_batch_items;
DELETE FROM transfer_batches;
DELETE FROM transfer_requests;
DELETE FROM store_inventory;
DELETE FROM contribution_history;
DELETE FROM regional_consensus_history;
DELETE FROM manager_performance;
DELETE FROM manager_actions;
DELETE FROM inventory_transactions;
DELETE FROM inventory_reservations;
DELETE FROM inventory;
DELETE FROM classification_rules;
DELETE FROM priority_profiles;
DELETE FROM products;
DELETE FROM stores;
DELETE FROM warehouses;

-- Reset sequences to start from 1
ALTER SEQUENCE warehouses_warehouse_id_seq RESTART WITH 1;
ALTER SEQUENCE stores_store_id_seq RESTART WITH 1;
ALTER SEQUENCE products_product_id_seq RESTART WITH 1;

-- 1. Insert Warehouses first (no dependencies)
INSERT INTO warehouses (warehouse_name, region, latitude, longitude) VALUES
('East Coast Distribution Center', 'Northeast', 40.7128, -74.0060),
('Central Distribution Hub', 'Midwest', 41.8781, -87.6298),
('West Coast Fulfillment', 'West', 34.0522, -118.2437);

-- 2. Insert Stores (no dependencies)
INSERT INTO stores (store_name, region, latitude, longitude) VALUES
('Manhattan Flagship', 'Northeast', 40.7831, -73.9712),
('Brooklyn Heights', 'Northeast', 40.6962, -73.9961),
('Chicago Loop', 'Midwest', 41.8781, -87.6298),
('Los Angeles Beverly', 'West', 34.0736, -118.4004);

-- 3. Insert Products (no dependencies)
INSERT INTO products (
    sku, product_name, brand, category, is_private_label, 
    profit_margin_percentage, sales_velocity, base_priority, 
    calculated_priority, supplier_id, unit_cost, selling_price, 
    participate_in_allocation
) VALUES
('PL001', 'Store Brand Premium Coffee', 'Store Brand', 'Beverages', TRUE, 45.00, 2.0, 1.5, 2.5, 101, 5.00, 9.99, TRUE),
('PL002', 'House Label Organic Pasta', 'House Label', 'Food', TRUE, 35.00, 3.0, 1.5, 3.0, 102, 1.00, 1.85, TRUE),
('TP001', 'Coca-Cola Classic 12pk', 'Coca-Cola', 'Beverages', FALSE, 18.00, 1.0, 1.0, 1.3, 103, 4.50, 5.99, TRUE),
('TP002', 'Kellogg''s Corn Flakes', 'Kellogg''s', 'Food', FALSE, 22.00, 1.5, 1.0, 1.45, 104, 3.00, 4.99, TRUE),
('UN001', 'Unclassified Energy Bar', 'Unknown Brand', 'Snacks', NULL, 25.00, 0.5, 1.0, 1.0, 105, 2.00, 3.50, TRUE);

-- 4. Insert Inventory (depends on products and warehouses)
INSERT INTO inventory (product_id, warehouse_id, available_quantity, reserved_quantity, safety_stock_level) VALUES
(1, 1, 500, 0, 50),  -- Coffee at East Coast
(2, 1, 300, 0, 30),  -- Pasta at East Coast
(3, 1, 800, 0, 80),  -- Coca-Cola at East Coast
(4, 1, 600, 0, 60),  -- Kellogg's at East Coast
(5, 1, 200, 0, 20),  -- Energy Bar at East Coast
(1, 2, 400, 0, 40),  -- Coffee at Central
(2, 2, 250, 0, 25),  -- Pasta at Central
(3, 2, 700, 0, 70),  -- Coca-Cola at Central
(4, 2, 500, 0, 50),  -- Kellogg's at Central
(5, 2, 150, 0, 15),  -- Energy Bar at Central
(1, 3, 300, 0, 30),  -- Coffee at West Coast
(2, 3, 200, 0, 20),  -- Pasta at West Coast
(3, 3, 600, 0, 60),  -- Coca-Cola at West Coast
(4, 3, 400, 0, 40),  -- Kellogg's at West Coast
(5, 3, 100, 0, 10);  -- Energy Bar at West Coast

-- 5. Insert Classification Rules
INSERT INTO classification_rules (rule_type, rule_pattern, confidence_score) VALUES
('BRAND', 'Store Brand', 1.0),
('BRAND', 'House Label', 0.9),
('SKU_PATTERN', 'PL%', 0.95),
('SKU_PATTERN', 'HL%', 0.9);

-- 6. Insert Priority Profiles
INSERT INTO priority_profiles (product_type, base_multiplier, max_multiplier, performance_weight) VALUES
('PRIVATE_LABEL', 1.5, 3.0, 0.5),
('THIRD_PARTY', 1.0, 2.0, 0.3);

-- 7. Insert Manager Performance
INSERT INTO manager_performance (manager_id, current_weight) VALUES
('MGR001', 0.7),
('MGR002', 0.8),
('MGR003', 0.6),
('MGR004', 0.75);

-- 8. Insert Manager Actions (depends on stores and products)
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

-- 9. Insert Store Inventory (depends on stores and products)
INSERT INTO store_inventory (store_id, product_id, sku, current_stock, safety_stock, reserved_quantity, average_daily_sales) VALUES
(1, 1, 'PL001', 240, 50, 10, 15.5),
(1, 2, 'PL002', 180, 30, 5, 8.2),
(1, 3, 'TP001', 120, 20, 0, 12.0),
(1, 4, 'TP002', 150, 25, 0, 10.5),
(2, 1, 'PL001', 80, 30, 5, 10.5),
(2, 2, 'PL002', 150, 25, 0, 6.8),
(2, 3, 'TP001', 200, 40, 15, 18.2),
(2, 4, 'TP002', 130, 20, 0, 8.0),
(3, 1, 'PL001', 320, 60, 20, 22.0),
(3, 2, 'PL002', 90, 15, 0, 4.5),
(3, 3, 'TP001', 160, 25, 10, 14.8),
(3, 4, 'TP002', 180, 30, 0, 12.5),
(4, 1, 'PL001', 200, 40, 0, 18.0),
(4, 2, 'PL002', 120, 20, 5, 7.5),
(4, 3, 'TP001', 250, 50, 10, 20.0),
(4, 4, 'TP002', 160, 25, 0, 11.2);

-- 10. Insert Warehouse Capacity (depends on warehouses)
INSERT INTO warehouse_capacity (warehouse_id, date, max_capacity, current_utilization, incoming_scheduled, outgoing_scheduled) VALUES 
(1, CURRENT_DATE, 1000, 250, 50, 100),  -- East Coast Distribution Center
(2, CURRENT_DATE, 600, 180, 30, 60),    -- Central Distribution Hub  
(3, CURRENT_DATE, 300, 120, 20, 40);    -- West Coast Fulfillment

-- 11. Insert Transfer Routes (depends on warehouses and stores)
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

-- 12. Insert Warehouse Performance (depends on warehouses)
INSERT INTO warehouse_performance (warehouse_id, date, success_rate, avg_processing_time_hours, capacity_utilization, cost_efficiency_score) VALUES
(1, CURRENT_DATE, 96.5, 2.3, 25.0, 85.2),  -- East Coast performing well
(2, CURRENT_DATE, 94.8, 2.8, 30.0, 82.7),  -- Central performing well
(3, CURRENT_DATE, 91.2, 3.5, 40.0, 78.9);  -- West Coast needs improvement

-- 13. Insert some sample inventory transactions
INSERT INTO inventory_transactions (request_id, store_id, sku, transaction_type, original_quantity, final_quantity, processing_queue, transaction_timestamp) VALUES
('REQ001', '1', 'PL001', 'ALLOCATE', 100, 95, 'HIGH_PRIORITY', '2025-01-01 10:00:00'),
('REQ002', '2', 'PL002', 'ALLOCATE', 150, 150, 'STANDARD', '2025-01-01 11:00:00'),
('REQ003', '3', 'TP001', 'ALLOCATE', 200, 180, 'EMERGENCY', '2025-01-01 12:00:00'),
('REQ004', '4', 'TP002', 'ALLOCATE', 75, 75, 'STANDARD', '2025-01-01 13:00:00');

-- 14. Insert some sample contribution history
INSERT INTO contribution_history (from_store_id, to_store_id, sku, contribution_score, quantity_contributed, transfer_success, created_at) VALUES
(1, 2, 'PL001', 85.5, 50, true, '2025-01-01 14:00:00'),
(2, 3, 'PL002', 92.3, 30, true, '2025-01-01 15:00:00'),
(3, 4, 'TP001', 78.1, 40, false, '2025-01-01 16:00:00'),
(4, 1, 'TP002', 88.7, 25, true, '2025-01-01 17:00:00');

-- 15. Insert some sample regional consensus history
INSERT INTO regional_consensus_history (region, signal_type, consensus_strength, participation_rate, participating_stores, confidence, emergency_alert, recommended_action, created_at) VALUES
('Northeast', 'DEMAND_SPIKE', 0.85, 0.90, 2, 0.88, false, 'INCREASE_INVENTORY', '2025-01-01 18:00:00'),
('Midwest', 'SUPPLY_SHORTAGE', 0.70, 0.80, 1, 0.75, true, 'EMERGENCY_RESTOCK', '2025-01-01 19:00:00'),
('West', 'NORMAL_OPERATIONS', 0.95, 0.95, 1, 0.92, false, 'MAINTAIN_CURRENT', '2025-01-01 20:00:00');

-- Success message
SELECT 'Mock data loaded successfully!' as status;