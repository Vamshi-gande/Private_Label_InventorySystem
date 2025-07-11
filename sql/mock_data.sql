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