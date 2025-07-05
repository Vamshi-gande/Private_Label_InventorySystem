# Dynamic Private Label Inventory Management System v2.0

## Executive Summary

AI-driven platform that maximizes retail profitability by strategically optimizing private label product allocation while maintaining customer satisfaction. This system incorporates passive behavioral intelligence extraction, multi-layer resilience architecture, and adaptive optimization algorithms.

**Key Innovation**: Zero Human Input Intelligence - Behavioral pattern analysis replaces manual forecasting with 95% autonomy.

---

## System Architecture Overview

### Core Design Philosophy

* **Private Label Products**: 25-40% higher margins with complete supply chain control
* **Third-Party Products**: Customer choice guarantee with strategic management
* **Behavioral Intelligence**: Automatic extraction from manager actions without manual input
* **Resilient Architecture**: Multi-layer failsafe system ensuring 99.9% reliability

---

## Implementation Status

### IMPLEMENTED COMPONENTS

#### Component 1: Database Schema & Atomic Operations

* Status: Fully implemented and tested
* Location: `sql/schema.sql`, `config/db.js`
* Features:

  * Products table with private label classification
  * Inventory tracking with atomic operations
  * Warehouses and stores management
  * Inventory reservations with expiry system
  * Audit trail through inventory transactions
  * Manager actions tracking table

#### Component 2: Product Classification Service

* Status: Fully implemented with API endpoints
* Location: `controllers/classificationController.js`, `services/classifier.js`
* Features:

  * Automatic product classification (private label vs third-party)
  * Dynamic multiplier calculation (1.0-2.0 range)
  * Batch classification processing
  * Classification rules management
  * Priority calculation based on sales velocity
* API Endpoints:

  * `POST /api/classification` - Register and classify products
  * `POST /api/classification/batch` - Batch product classification
  * `GET /api/classification/rules` - Get classification rules

#### Component 3: Manager Action Tracker (COMPLETE)

* Status: Fully implemented with enhanced behavioral intelligence
* Location: `controllers/managerActionsController.js`, `services/behaviourAnalyzer.js`
* Features:

  * Event-driven manager action logging with auto-classification
  * Multi-signal intelligence extraction:

    * Order Timing Variance (demand\_increase\_expected)
    * Quantity Adjustments (market\_opportunity\_detected)
    * Emergency Orders (unexpected\_demand\_spike)
    * Safety Stock Changes (volatility\_expected)
    * Competitive Response (market\_disruption\_detected)
    * Event Planning (event\_driven\_demand)
  * Advanced signal analysis:

    * Confidence scoring (50%-95%)
    * Magnitude classification (moderate/significant/high)
    * Multiple signals per action support
    * Quantitative metrics (days early, quantity increase %)
  * Real-time processing features:

    * Automated scheduling (every 5 minutes)
    * Backward compatibility mode
    * Enhanced signal extraction
    * Action type auto-classification
* API Endpoints:

  * `POST /` - Log manager actions (Current)
  * `GET /signals` - Get behavioral signals (Current)
  * `POST /api/manager-actions` - Enhanced logging (Planned)
  * `GET /api/manager-actions/signals` - Enhanced signals (Planned)
* Intelligence Metrics:

  * 83% signal detection rate
  * 10 signals from 12 actions
  * 5 high-priority alerts identified

#### Component 4: Regional Consensus Engine (COMPLETE)

* Status: Fully implemented with dynamic threshold support and real-time clustering
* Location: `controllers/consensusController.js`, `services/regionalConsensusEngine.js`
* Features:

  * Geographic clustering using K-means
  * Consensus validation across regional clusters
  * Manager performance weighting
  * API-based dynamic consensus threshold tuning
  * Detailed debug tracing for consensus strength, participation, and confidence
  * Real-time clustering based on store locations
* API Endpoints:

  * `POST /api/consensus/run` - Run consensus engine with dynamic threshold
* API Request Example:

```json
{
    "consensusThreshold": 0.4
}
```

* Key Capabilities:

  * Dynamic sensitivity control via API
  * Real-time cross-store consensus analysis

#### Component 5: Multi-Queue Processing System (COMPLETE)

* Status: Fully implemented with inventory logging
* Location: `controllers/queueController.js`, `services/multiQueueProcessor.js`, `services/inventoryLogger.js`
* Features:

  * Multi-queue architecture:

    * High Priority Queue (Private label with behavioral intelligence)
    * Standard Queue (Third-party with traditional processing)
    * Emergency Queue (Critical stockout situations)
  * Real-time queue assignment based on product type, urgency, and behavioral signals
  * Behavioral signal integration for high-priority requests
  * Automatic quantity adjustments per queue type
  * Inventory transaction logging:

    * Logs request\_id, store\_id, SKU, original quantity, final quantity, processing queue, and timestamp
    * Full audit trail for each processed allocation
* API Endpoints:

  * `POST /api/queue/add` - Add new allocation request to queues
  * `POST /api/queue/process` - Process all queues
  * `GET /api/queue/status` - View current queue status
  * `POST /api/queue/load-demo` - Load mock allocation requests
  * `GET /api/queue/demo` - Run demo processing cycle
* Key Capabilities:

  * Real-time priority-based processing
  * Automated inventory logging
  * Auditable transaction records

#### Component 6: Contribution Scoring Algorithm (COMPLETE)

* Status: Fully implemented and tested
* Location: `controllers/contributionController.js`, `services/contributionScorer.js`, `routes/contribution.js`
* Features:

  * Store-to-store inventory contribution scoring
  * Dynamic boundaries (15-60% for private label, 10-40% for third-party)
  * Multi-factor scoring algorithm:
    * Available stock calculation (current stock - safety stock - reserved)
    * Demand stability based on sales velocity and manager actions
    * Regional priority based on store proximity
    * Transfer efficiency based on historical success
    * Private label multiplier (1.5x for private label products)
  * Batch analysis for multiple inventory requests
  * Contribution history tracking
  * Store inventory management
  * Manager action integration for behavioral intelligence

* API Endpoints:

  * `GET /api/contribution/score/:fromStore/:toStore/:sku` - Get contribution score
  * `POST /api/contribution/find-contributors` - Find potential contributors
  * `POST /api/contribution/batch-analysis` - Process multiple requests
  * `GET /api/contribution/history/:storeId` - Get contribution history
  * `POST /api/contribution/record` - Record contribution transaction
  * `GET /api/contribution/store-inventory/:storeId` - Get store inventory

* Documentation:
  * Detailed documentation available in `docs/contribution_scoring_algorithm.md`

### PARTIALLY IMPLEMENTED COMPONENTS

#### Component 1 Extensions: Atomic Inventory Management

* Status: Basic inventory tracking implemented
* Implemented: Database schema, basic CRUD operations
* Missing: Row-level locking, atomic reservations, race condition prevention
* Location: `controllers/inventoryController.js`

## PENDING IMPLEMENTATION

### Component 7: Warehouse-Centric Transfer System

* Purpose: Manage inventory movement between stores via warehouses
* Features Needed:

  * Hierarchical warehouse failover system
  * Cost-optimized routing algorithms
  * Batch transfer coordination
  * Real-time capacity monitoring

### Component 8: Regional Cluster Manager

* Purpose: Geographic organization for transfer efficiency
* Features Needed:

  * Geographic boundary optimization
  * Dynamic cluster adjustment
  * Cross-cluster transfer capability

### Component 9: Queue Conversion Failsafe

* Purpose: Automatic fallback during system stress
* Features Needed:

  * Real-time system health monitoring
  * Automatic rule-based processing fallback
  * Gradual restoration with validation

### Component 10: Participation Flag System

* Purpose: Control product participation in dynamic allocation
* Features Needed:

  * Boolean participation flags
  * Supply chain disruption management
  * Quality issue isolation

### Component 11: Independent Satisfaction Monitor

* Purpose: Customer satisfaction monitoring and protection
* Features Needed:

  * Separate satisfaction tracking algorithms
  * Early warning alert system
  * Override capability for customer protection

### Component 12: Traditional Logistics Fallback

* Purpose: Complete system backup using proven methods
* Features Needed:

  * Parallel traditional allocation system
  * Seamless switchover capability
  * Performance monitoring for recovery

### Component 13: API Gateway & Orchestration

* Purpose: Coordinate all components and provide external interfaces
* Features Needed:

  * Service orchestration and workflow management
  * Error handling and retry logic
  * Performance monitoring and logging

### Component 14: Emergency Override System

* Purpose: Handle critical situations requiring immediate intervention
* Features Needed:

  * Emergency trigger detection
  * Automatic approval workflows
  * Rapid response protocols

## Current Technical Stack

### Backend Framework

* Runtime: Node.js v22.14.0
* Framework: Express.js v5.1.0
* Database: PostgreSQL 17
* Environment: dotenv v17.0.0

### Key Dependencies

```json
{
  "express": "^5.1.0",
  "pg": "^8.16.3",
  "dotenv": "^17.0.0",
  "node-cron": "^4.1.1",
  "axios": "^1.10.0",
  "ml-kmeans": "^3.1.1"
}
```

### Database Schema

* Products: SKU, classification, pricing, priority scoring
* Inventory: Available/reserved quantities, safety stock levels
* Warehouses: Regional distribution centers
* Stores: Geographic organization and management
* Manager Actions: Behavioral intelligence data collection
* Classification Rules: Automated product categorization
* Priority Profiles: Dynamic allocation multipliers
* Inventory Transactions: Logs processed allocations from the multi-queue system
* Store Inventory: Store-level inventory tracking for contribution scoring
* Contribution History: Records of inventory contributions between stores

## Getting Started

### Prerequisites

* Node.js v18+
* PostgreSQL 12+
* Git

### Installation

1. Clone the repository

```bash
git clone https://github.com/Vamshi-gande/Private_Label_InventorySystem.git
cd Private_Label_InventorySystem
```

2. Install dependencies

```bash
npm install
```

3. Configure environment

```bash
# Create .env file
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=inventory_system
DB_USER=postgres
DB_PASSWORD=your_password
SERVER_PORT=3000
```

4. Setup database

```bash
# Create database and run schema
psql -U postgres -c "CREATE DATABASE inventory_system;"
psql -U postgres -d inventory_system -f sql/schema.sql
psql -U postgres -d inventory_system -f sql/mock_data.sql
```

5. Start the server

```bash
node server.js
```

### Testing the Implementation

```bash
# Test component implementations
node tests/test-contribution-scoring.js
node tests/test-classification-engine.js
node tests/test-economic-indicators.js
node tests/test-comprehensive-manager-actions.js
node tests/test-manager-scheduler.js
```

---

## API Endpoints

### Core System

* `GET /api/health` - System health check
* `GET /api/demo/*` - Demo and testing endpoints

### Inventory Management

* `GET /api/inventory/:productId` - Get inventory status
* `GET /api/reservations/active` - Active reservations
* `POST /api/reservations/cleanup` - Cleanup expired reservations

### Product Classification

* `POST /api/classification` - Register and classify product
* `POST /api/classification/batch` - Batch classification
* `GET /api/classification/rules` - Get classification rules
* `POST /api/classification/rules` - Add classification rule

### Manager Behavioral Intelligence

* `POST /manager-actions` - Log manager action (Current)
* `GET /manager-actions/signals` - Get behavioral signals (Current)
* Enhanced endpoints coming in next release:

  * `POST /api/manager-actions` - Enhanced logging
  * `GET /api/manager-actions/signals` - Enhanced signals

### Regional Consensus Engine

* `POST /api/consensus/run` - Run Regional Consensus Calculation with dynamic threshold

### Multi-Queue Processing System

* `POST /api/queue/add` - Add new allocation request to queues
* `POST /api/queue/process` - Process all queues
* `GET /api/queue/status` - View current queue status
* `POST /api/queue/load-demo` - Load mock allocation requests
* `GET /api/queue/demo` - Run demo processing cycle

### Contribution Scoring System

* `GET /api/contribution/score/:fromStore/:toStore/:sku` - Get contribution score
* `POST /api/contribution/find-contributors` - Find potential contributors
* `POST /api/contribution/batch-analysis` - Process multiple requests
* `GET /api/contribution/history/:storeId` - Get contribution history
* `POST /api/contribution/record` - Record contribution transaction
* `GET /api/contribution/store-inventory/:storeId` - Get store inventory

### Analytics & Dashboard

* `GET /api/analytics/*` - Analytics endpoints
* `GET /api/dashboard/*` - Dashboard data

