create table products(
    product_id serial primary key,
    sku varchar(20) unique not null,
    product_name VARCHAR(255) NOT NULL,
    is_private_label BOOLEAN DEFAULT FALSE,
    profit_margin_percentage DECIMAL(5,2),
    selling_price DECIMAL(10,2),
    participate_in_allocation BOOLEAN DEFAULT TRUE
);

CREATE TABLE warehouses (
    warehouse_id SERIAL PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL
);

CREATE TABLE stores (
    store_id SERIAL PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL
);

CREATE TABLE inventory (
    inventory_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(product_id),
    warehouse_id INT REFERENCES warehouses(warehouse_id),
    available_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    safety_stock_level INT NOT NULL DEFAULT 0,
    UNIQUE (product_id, warehouse_id)
);

CREATE TABLE inventory_reservations (
    reservation_id SERIAL PRIMARY KEY,
    inventory_id INT REFERENCES inventory(inventory_id),
    product_id INT REFERENCES products(product_id),
    requesting_store_id INT REFERENCES stores(store_id),
    reserved_quantity INT NOT NULL,
    reservation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_timestamp TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '5 minutes'),
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE inventory_transactions (
    transaction_id SERIAL PRIMARY KEY,
    inventory_id INT REFERENCES inventory(inventory_id),
    product_id INT REFERENCES products(product_id),
    transaction_type VARCHAR(30) NOT NULL, -- RESERVE, RELEASE
    quantity_change INT NOT NULL,
    transaction_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_inventory_available_qty ON inventory(available_quantity);
CREATE INDEX idx_reservations_expiry ON inventory_reservations(expiry_timestamp) WHERE status = 'ACTIVE';
CREATE INDEX idx_products_private_label ON products(is_private_label) WHERE is_private_label = TRUE;


SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';


