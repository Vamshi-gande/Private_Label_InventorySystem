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
