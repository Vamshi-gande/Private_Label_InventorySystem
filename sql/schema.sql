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
-- Adding new columns to the products table(component-2)
alter table products
add column brand varchar(100),
add column sales_velocity DECIMAL(10,2) DEFAULT 0,
add column base_priority DECIMAL(3,2) DEFAULT 1.0,
add column calculated_priority DECIMAL(3,2) DEFAULT 1.0,
add column created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
add column updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;

alter table products
alter column is_private_label set default null;


-- Adding new columns to the inventory table(component-2)
CREATE TABLE classification_rules (
    rule_id SERIAL PRIMARY KEY,
    rule_type VARCHAR(50) NOT NULL, -- BRAND or SKU_PATTERN
    rule_pattern VARCHAR(255) NOT NULL, -- Regex or substring
    confidence_score DECIMAL(3,2) DEFAULT 1.0, -- Confidence in this rule (0 to 1)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE priority_profiles (
    profile_id SERIAL PRIMARY KEY,
    product_type VARCHAR(50) NOT NULL, -- PRIVATE_LABEL or THIRD_PARTY
    base_multiplier DECIMAL(3,2) DEFAULT 1.0,
    max_multiplier DECIMAL(3,2) DEFAULT 2.0,
    performance_weight DECIMAL(3,2) DEFAULT 0.5, -- How much sales_velocity influences final priority
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE suggested_rules (
    suggestion_id SERIAL PRIMARY KEY,
    rule_type VARCHAR(50),
    rule_pattern VARCHAR(255),
    occurrence_count INT DEFAULT 0,
    confidence_score DECIMAL(3,2),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    decision_at TIMESTAMP NULL
);

drop table suggested_rules;

CREATE TABLE IF NOT EXISTS manager_actions (
    id SERIAL PRIMARY KEY,
    store_id INT NOT NULL,
    product_id INT NOT NULL,
    action_type VARCHAR(50), -- 'early_order', 'emergency_order', etc.
    quantity INT,
    original_schedule_date DATE,
    action_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    comments TEXT
);
