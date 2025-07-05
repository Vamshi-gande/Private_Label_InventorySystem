# Contribution Scoring Algorithm Documentation

## Overview

The Contribution Scoring Algorithm (Component 6) is a sophisticated system for evaluating and optimizing inventory sharing between stores. It calculates a store's capacity to contribute inventory to other stores based on multiple factors including available stock, demand stability, regional priority, transfer efficiency, and special considerations for private label products.

## Core Functionality

The Contribution Scoring Algorithm provides several key functions:

1. **Score Calculation**: Determine how much inventory a store can safely contribute to another store
2. **Contributor Finding**: Identify potential contributing stores for inventory needs
3. **Batch Analysis**: Process multiple inventory requests simultaneously
4. **Contribution Recording**: Track and analyze contribution history
5. **Store Inventory Management**: Monitor and access store-level inventory data

## Mathematical Model

The contribution score is calculated using the following formula:

```
Contribution Score = Available Stock × Demand Stability × Transfer Efficiency × Regional Priority × Private Label Multiplier
```

Where:
- **Available Stock** = Current Stock - Safety Stock - Reserved Quantity
- **Demand Stability** = A value between 0.1-1.0 based on sales velocity and manager behavior
- **Transfer Efficiency** = Historical success rate of transfers from the store (default: 0.9)
- **Regional Priority** = A value between 0.1-1.0 based on geographic proximity
- **Private Label Multiplier** = 1.5 for private label products, 1.0 for regular products

## Dynamic Boundaries

The system applies dynamic boundaries to ensure that stores maintain sufficient inventory:

- **Private Label Products**: Can contribute 15-60% of current stock
- **Regular Products**: Can contribute 10-40% of current stock

## Integration with Manager Actions

The algorithm incorporates manager behavior as a critical signal through the manager_actions table:

- **Emergency Orders** (stability × 0.6): Significantly reduces contribution capacity
- **Bulk Orders** (stability × 0.7): Moderately reduces contribution capacity
- **Early Orders** (stability × 0.8): Slightly reduces contribution capacity
- **Scheduled Orders** (stability × 1.1): Increases contribution capacity

## API Endpoints

### Score Calculation
```
GET /api/contribution/score/:fromStore/:toStore/:sku
```
Calculates the contribution score between two stores for a specific SKU.

### Find Contributors
```
POST /api/contribution/find-contributors
```
Identifies potential contributors for a store needing inventory.

**Request Body:**
```json
{
  "requesting_store_id": 2,
  "sku": "PL-PASTA-001",
  "needed_quantity": 50
}
```

### Batch Analysis
```
POST /api/contribution/batch-analysis
```
Processes multiple inventory requests simultaneously.

**Request Body:**
```json
{
  "requests": [
    {
      "requesting_store_id": 2,
      "sku": "PL-PASTA-001",
      "needed_quantity": 50
    },
    {
      "requesting_store_id": 1,
      "sku": "PL-SAUCE-002",
      "needed_quantity": 30
    }
  ]
}
```

### Record Contribution
```
POST /api/contribution/record
```
Records a contribution transaction between stores.

**Request Body:**
```json
{
  "from_store_id": 3,
  "to_store_id": 2,
  "sku": "PL-PASTA-001",
  "contribution_score": 192,
  "quantity_contributed": 50,
  "transfer_success": true
}
```

### Get Contribution History
```
GET /api/contribution/history/:storeId
```
Retrieves contribution history for a specific store.

### Get Store Inventory
```
GET /api/contribution/store-inventory/:storeId
```
Retrieves current inventory for a specific store.

## Database Schema

The algorithm relies on two main tables:

### Store Inventory Table
```sql
CREATE TABLE store_inventory (
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
```

### Contribution History Table
```sql
CREATE TABLE contribution_history (
    id SERIAL PRIMARY KEY,
    from_store_id INT NOT NULL,
    to_store_id INT NOT NULL,
    sku VARCHAR(50) NOT NULL,
    contribution_score DECIMAL(10,2),
    quantity_contributed INT,
    transfer_success BOOLEAN,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## Implementation Details

The algorithm is implemented in the following files:

- **Controller**: `controllers/contributionController.js`
- **Service**: `services/contributionScorer.js`
- **Routes**: `routes/contribution.js`
- **Schema**: `sql/schema.sql`

## Business Benefits

1. **Optimized Inventory Distribution**: Ensures inventory is shared based on data-driven decisions
2. **Private Label Advantage**: Prioritizes and optimizes the distribution of high-margin private label products
3. **Regional Efficiency**: Reduces logistics costs through proximity-based transfers
4. **Behavioral Intelligence**: Incorporates manager insights without requiring manual input
5. **Scalable Analysis**: Handles multiple inventory needs simultaneously through batch processing

## Example Use Cases

1. **Store Restocking**: When a store is running low on inventory, the system can identify the best contributors
2. **New Store Stocking**: When opening a new location, inventory can be sourced from existing stores
3. **Seasonal Demand Shifts**: Rebalance inventory based on regional seasonal patterns
4. **Emergency Response**: Quickly fulfill critical inventory needs during unexpected demand spikes
5. **Supply Chain Disruptions**: Maintain inventory levels across the network when warehouse supplies are limited
