require('dotenv').config();
const pool = require('../config/db');

async function setupComponent7Schema() {
    try {
        console.log('Setting up Component 7: Warehouse Transfer System schema...');
        
        // Transfer Requests Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transfer_requests (
                id SERIAL PRIMARY KEY,
                request_id VARCHAR(50) UNIQUE NOT NULL,
                from_store_id INTEGER REFERENCES stores(store_id),
                to_store_id INTEGER REFERENCES stores(store_id),
                sku VARCHAR(100) NOT NULL,
                quantity INTEGER NOT NULL,
                priority VARCHAR(20) DEFAULT 'standard',
                status VARCHAR(20) DEFAULT 'pending',
                warehouse_route JSONB,
                estimated_cost DECIMAL(10,2),
                notes TEXT,
                emergency_reason VARCHAR(255),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Transfer requests table created');

        // Transfer Batches Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transfer_batches (
                id SERIAL PRIMARY KEY,
                batch_id VARCHAR(50) UNIQUE NOT NULL,
                warehouse_id INTEGER REFERENCES warehouses(warehouse_id),
                status VARCHAR(20) DEFAULT 'preparing',
                total_requests INTEGER DEFAULT 0,
                total_cost DECIMAL(10,2) DEFAULT 0,
                scheduled_departure TIMESTAMP,
                actual_departure TIMESTAMP,
                estimated_arrival TIMESTAMP,
                actual_arrival TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Transfer batches table created');

        // Transfer Batch Items Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transfer_batch_items (
                id SERIAL PRIMARY KEY,
                batch_id INTEGER REFERENCES transfer_batches(id),
                transfer_request_id INTEGER REFERENCES transfer_requests(id),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Transfer batch items table created');

        // Warehouse Capacity Tracking
        await pool.query(`
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
            )
        `);
        console.log('✓ Warehouse capacity table created');

        // Transfer Routes Table
        await pool.query(`
            CREATE TABLE IF NOT EXISTS transfer_routes (
                id SERIAL PRIMARY KEY,
                from_warehouse_id INTEGER REFERENCES warehouses(warehouse_id),
                to_store_id INTEGER REFERENCES stores(store_id),
                distance_km DECIMAL(8,2),
                estimated_time_hours DECIMAL(4,2),
                base_cost DECIMAL(10,2),
                active BOOLEAN DEFAULT true,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        console.log('✓ Transfer routes table created');

        // Warehouse Performance Metrics
        await pool.query(`
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
            )
        `);
        console.log('✓ Warehouse performance table created');

        // Add warehouse coordinates columns first
        try {
            await pool.query('ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS latitude DECIMAL(9,6)');
            await pool.query('ALTER TABLE warehouses ADD COLUMN IF NOT EXISTS longitude DECIMAL(9,6)');
            console.log('✓ Warehouse coordinate columns added');
        } catch (error) {
            console.log('ℹ Warehouse coordinate columns already exist');
        }

        // Add warehouse coordinates
        await pool.query(`
            UPDATE warehouses SET 
                latitude = CASE warehouse_id
                    WHEN 1 THEN 40.7128
                    WHEN 2 THEN 41.8781
                    WHEN 3 THEN 34.0522
                    ELSE NULL
                END,
                longitude = CASE warehouse_id  
                    WHEN 1 THEN -74.0060
                    WHEN 2 THEN -87.6298
                    WHEN 3 THEN -118.2437
                    ELSE NULL
                END
            WHERE warehouse_id IN (1, 2, 3)
        `);
        console.log('✓ Warehouse coordinates updated');

        // Insert sample warehouse capacity data
        await pool.query(`
            INSERT INTO warehouse_capacity (warehouse_id, date, max_capacity, current_utilization, incoming_scheduled, outgoing_scheduled) 
            VALUES 
                (1, CURRENT_DATE, 1000, 250, 50, 100),
                (2, CURRENT_DATE, 600, 180, 30, 60),
                (3, CURRENT_DATE, 300, 120, 20, 40)
            ON CONFLICT (warehouse_id, date) DO UPDATE SET
                max_capacity = EXCLUDED.max_capacity,
                current_utilization = EXCLUDED.current_utilization,
                incoming_scheduled = EXCLUDED.incoming_scheduled,
                outgoing_scheduled = EXCLUDED.outgoing_scheduled
        `);
        console.log('✓ Warehouse capacity data inserted');

        // Insert sample transfer routes
        await pool.query(`
            INSERT INTO transfer_routes (from_warehouse_id, to_store_id, distance_km, estimated_time_hours, base_cost, active) VALUES
                (1, 1, 15.2, 1.5, 25.00, true),
                (1, 2, 22.8, 2.0, 35.00, true),
                (1, 3, 790.5, 12.0, 450.00, true),
                (1, 4, 2445.0, 36.0, 1200.00, true),
                (2, 1, 790.5, 12.0, 450.00, true),
                (2, 2, 815.3, 13.0, 475.00, true),
                (2, 3, 18.7, 1.8, 30.00, true),
                (2, 4, 1745.2, 26.0, 850.00, true),
                (3, 1, 2445.0, 36.0, 1200.00, true),
                (3, 2, 2470.8, 37.0, 1225.00, true),
                (3, 3, 1745.2, 26.0, 850.00, true),
                (3, 4, 25.4, 2.5, 40.00, true)
            ON CONFLICT DO NOTHING
        `);
        console.log('✓ Transfer routes data inserted');

        // Insert sample warehouse performance metrics
        await pool.query(`
            INSERT INTO warehouse_performance (warehouse_id, date, success_rate, avg_processing_time_hours, capacity_utilization, cost_efficiency_score) VALUES
                (1, CURRENT_DATE, 96.5, 2.3, 25.0, 85.2),
                (2, CURRENT_DATE, 94.8, 2.8, 30.0, 82.7),
                (3, CURRENT_DATE, 91.2, 3.5, 40.0, 78.9)
            ON CONFLICT (warehouse_id, date) DO UPDATE SET
                success_rate = EXCLUDED.success_rate,
                avg_processing_time_hours = EXCLUDED.avg_processing_time_hours,
                capacity_utilization = EXCLUDED.capacity_utilization,
                cost_efficiency_score = EXCLUDED.cost_efficiency_score
        `);
        console.log('✓ Warehouse performance data inserted');

        console.log('Component 7: Warehouse Transfer System setup complete!');
        
    } catch (error) {
        console.error('Error setting up Component 7:', error.message);
    }
    process.exit(0);
}

setupComponent7Schema();
