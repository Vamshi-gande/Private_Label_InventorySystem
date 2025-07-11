create table if not exists products(
    product_id serial primary key,
    sku varchar(20) unique not null,
    product_name VARCHAR(255) NOT NULL,
    is_private_label BOOLEAN DEFAULT FALSE,
    profit_margin_percentage DECIMAL(5,2),
    selling_price DECIMAL(10,2),
    participate_in_allocation BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS warehouses (
    warehouse_id SERIAL PRIMARY KEY,
    warehouse_name VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS stores (
    store_id SERIAL PRIMARY KEY,
    store_name VARCHAR(100) NOT NULL,
    region VARCHAR(50) NOT NULL
);

CREATE TABLE IF NOT EXISTS inventory (
    inventory_id SERIAL PRIMARY KEY,
    product_id INT REFERENCES products(product_id),
    warehouse_id INT REFERENCES warehouses(warehouse_id),
    available_quantity INT NOT NULL DEFAULT 0,
    reserved_quantity INT NOT NULL DEFAULT 0,
    safety_stock_level INT NOT NULL DEFAULT 0,
    UNIQUE (product_id, warehouse_id)
);

CREATE TABLE IF NOT EXISTS inventory_reservations (
    reservation_id SERIAL PRIMARY KEY,
    inventory_id INT REFERENCES inventory(inventory_id),
    product_id INT REFERENCES products(product_id),
    requesting_store_id INT REFERENCES stores(store_id),
    reserved_quantity INT NOT NULL,
    reservation_timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expiry_timestamp TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '5 minutes'),
    status VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE IF NOT EXISTS inventory_transactions (
    transaction_id SERIAL PRIMARY KEY,
    request_id VARCHAR(50),             -- Tracks the original allocation request
    store_id VARCHAR(50),               -- The store receiving the inventory
    sku VARCHAR(50),                    -- SKU of the product
    transaction_type VARCHAR(50),       -- Type of transaction (e.g., ALLOCATE)
    original_quantity INT,              -- Requested quantity
    final_quantity INT,                 -- Adjusted quantity after processing
    processing_queue VARCHAR(50),       -- Which queue processed this (EMERGENCY, HIGH_PRIORITY, STANDARD)
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
CREATE TABLE IF NOT EXISTS classification_rules (
    rule_id SERIAL PRIMARY KEY,
    rule_type VARCHAR(50) NOT NULL, -- BRAND or SKU_PATTERN
    rule_pattern VARCHAR(255) NOT NULL, -- Regex or substring
    confidence_score DECIMAL(3,2) DEFAULT 1.0, -- Confidence in this rule (0 to 1)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS priority_profiles (
    profile_id SERIAL PRIMARY KEY,
    product_type VARCHAR(50) NOT NULL, -- PRIVATE_LABEL or THIRD_PARTY
    base_multiplier DECIMAL(3,2) DEFAULT 1.0,
    max_multiplier DECIMAL(3,2) DEFAULT 2.0,
    performance_weight DECIMAL(3,2) DEFAULT 0.5, -- How much sales_velocity influences final priority
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS suggested_rules (
    suggestion_id SERIAL PRIMARY KEY,
    rule_type VARCHAR(50),
    rule_pattern VARCHAR(255),
    occurrence_count INT DEFAULT 0,
    confidence_score DECIMAL(3,2),
    status VARCHAR(20) DEFAULT 'PENDING', -- PENDING, ACCEPTED, REJECTED
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    decision_at TIMESTAMP NULL
);

ALTER TABLE products ADD COLUMN category VARCHAR(100);
ALTER TABLE products ADD COLUMN supplier_id VARCHAR(100);
ALTER TABLE products ADD COLUMN unit_cost DECIMAL(10,2) DEFAULT 0.00;
drop table suggested_rules;

--COMPONENT-3
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

ALTER TABLE manager_actions ADD COLUMN manager_id INT;


--COMPONENT-4
-- 1. Add store location fields for clustering
ALTER TABLE stores ADD COLUMN latitude DECIMAL(9,6);
ALTER TABLE stores ADD COLUMN longitude DECIMAL(9,6);

-- 2. Manager Performance Table (Optional but recommended)
CREATE TABLE IF NOT EXISTS manager_performance (
    manager_id VARCHAR(10) PRIMARY KEY,
    current_weight DECIMAL(3,2) DEFAULT 0.5 -- Start with neutral weight
);

-- 3. Consensus History Table
CREATE TABLE IF NOT EXISTS regional_consensus_history (
    consensus_id SERIAL PRIMARY KEY,
    region VARCHAR(50),
    signal_type VARCHAR(50),
    consensus_strength DECIMAL(3,2),
    participation_rate DECIMAL(3,2),
    participating_stores INTEGER,
    confidence DECIMAL(3,2),
    emergency_alert BOOLEAN DEFAULT FALSE,
    recommended_action VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW()
);

--Component-5 (table update checking)
SELECT * FROM inventory_transactions ORDER BY transaction_timestamp DESC;

-- Component 6: Contribution Scoring Tables
CREATE TABLE IF NOT EXISTS contribution_history (
    id SERIAL PRIMARY KEY,
    from_store_id VARCHAR(10) NOT NULL,
    to_store_id VARCHAR(10) NOT NULL,
    sku VARCHAR(50) NOT NULL,
    contribution_score DECIMAL(10,2),
    quantity_contributed INT,
    transfer_success BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add transfer success rate to inventory
ALTER TABLE inventory ADD COLUMN IF NOT EXISTS last_transfer_success_rate DECIMAL(4,3) DEFAULT 0.900;

-- Component 6: Store-level inventory for contribution scoring
CREATE TABLE IF NOT EXISTS store_inventory (
    id SERIAL PRIMARY KEY,
    store_id INT REFERENCES stores(store_id),
    product_id INT REFERENCES products(product_id),
    sku VARCHAR(50) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    safety_stock INT NOT NULL DEFAULT 0,
    reserved_quantity INT DEFAULT 0,
    last_restock_date DATE,
    average_daily_sales DECIMAL(10,2) DEFAULT 0,
    last_transfer_success_rate DECIMAL(4,3) DEFAULT 0.900,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(store_id, product_id)
);

-- Update contribution_history table to match ID types
ALTER TABLE contribution_history ALTER COLUMN from_store_id TYPE INT USING from_store_id::INT;
ALTER TABLE contribution_history ALTER COLUMN to_store_id TYPE INT USING to_store_id::INT;

-- Component 7: Warehouse Transfer System Schema Extensions

-- Transfer Requests Table
CREATE TABLE IF NOT EXISTS transfer_requests (
    id SERIAL PRIMARY KEY,
    request_id VARCHAR(50) UNIQUE NOT NULL,
    from_store_id INTEGER REFERENCES stores(store_id),
    to_store_id INTEGER REFERENCES stores(store_id),
    sku VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    priority VARCHAR(20) DEFAULT 'standard', -- 'high', 'standard', 'emergency'
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'in_transit', 'completed', 'failed'
    warehouse_route JSONB, -- Stores the warehouse routing path
    estimated_cost DECIMAL(10,2),
    notes TEXT,
    emergency_reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transfer Batches Table
CREATE TABLE IF NOT EXISTS transfer_batches (
    id SERIAL PRIMARY KEY,
    batch_id VARCHAR(50) UNIQUE NOT NULL,
    warehouse_id INTEGER REFERENCES warehouses(warehouse_id),
    status VARCHAR(20) DEFAULT 'preparing', -- 'preparing', 'ready', 'in_transit', 'completed'
    total_requests INTEGER DEFAULT 0,
    total_cost DECIMAL(10,2) DEFAULT 0,
    scheduled_departure TIMESTAMP,
    actual_departure TIMESTAMP,
    estimated_arrival TIMESTAMP,
    actual_arrival TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Transfer Batch Items Table
CREATE TABLE IF NOT EXISTS transfer_batch_items (
    id SERIAL PRIMARY KEY,
    batch_id INTEGER REFERENCES transfer_batches(id),
    transfer_request_id INTEGER REFERENCES transfer_requests(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouse Capacity Tracking
CREATE TABLE IF NOT EXISTS warehouse_capacity (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouses(warehouse_id),
    date DATE NOT NULL,
    max_capacity INTEGER NOT NULL,
    current_utilization INTEGER DEFAULT 0,
    incoming_scheduled INTEGER DEFAULT 0,
    outgoing_scheduled INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, date)
);

-- Transfer Routes (for cost optimization)
CREATE TABLE IF NOT EXISTS transfer_routes (
    id SERIAL PRIMARY KEY,
    from_warehouse_id INTEGER REFERENCES warehouses(warehouse_id),
    to_store_id INTEGER REFERENCES stores(store_id),
    distance_km DECIMAL(8,2),
    estimated_time_hours DECIMAL(4,2),
    base_cost DECIMAL(10,2),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Warehouse Performance Metrics
CREATE TABLE IF NOT EXISTS warehouse_performance (
    id SERIAL PRIMARY KEY,
    warehouse_id INTEGER REFERENCES warehouses(warehouse_id),
    date DATE NOT NULL,
    success_rate DECIMAL(5,2) DEFAULT 100.00,
    avg_processing_time_hours DECIMAL(6,2),
    capacity_utilization DECIMAL(5,2),
    cost_efficiency_score DECIMAL(5,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(warehouse_id, date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_transfer_requests_status ON transfer_requests(status);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_priority ON transfer_requests(priority);
CREATE INDEX IF NOT EXISTS idx_transfer_requests_created_at ON transfer_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_transfer_batches_warehouse_id ON transfer_batches(warehouse_id);
CREATE INDEX IF NOT EXISTS idx_transfer_batches_status ON transfer_batches(status);
CREATE INDEX IF NOT EXISTS idx_warehouse_capacity_date ON warehouse_capacity(warehouse_id, date);

ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS latitude DECIMAL(9,6);
ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS longitude DECIMAL(9,6);

--component-8

ALTER TABLE stores ADD COLUMN IF NOT EXISTS annual_revenue DECIMAL(15,2) DEFAULT 0.00;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS warehouse_id int;
ALTER TABLE stores ADD COLUMN IF NOT EXISTS region VARCHAR(50);

ALTER TABLE stores
ADD CONSTRAINT fk_warehouse
FOREIGN KEY (warehouse_id)
REFERENCES warehouses(warehouse_id)
ON DELETE SET NULL;
