# Dynamic Private Label Inventory Management System v2.0

## Executive Summary
AI-driven platform that maximizes retail profitability by strategically optimizing private label product allocation while maintaining customer satisfaction. This system incorporates passive behavioral intelligence extraction, multi-layer resilience architecture, and adaptive optimization algorithms.

**Key Innovation**: Zero Human Input Intelligence - Behavioral pattern analysis replaces manual forecasting with 95% autonomy.

---

## System Architecture Overview

### Core Design Philosophy
- **Private Label Products**: 25-40% higher margins with complete supply chain control
- **Third-Party Products**: Customer choice guarantee with strategic management
- **Behavioral Intelligence**: Automatic extraction from manager actions without manual input
- **Resilient Architecture**: Multi-layer failsafe system ensuring 99.9% reliability

---

## Implementation Status

### IMPLEMENTED COMPONENTS

#### Component 1: Database Schema & Atomic Operations
- Status: Fully implemented and tested
- Location: `sql/schema.sql`, `config/db.js`
- Features:
  - Products table with private label classification
  - Inventory tracking with atomic operations
  - Warehouses and stores management
  - Inventory reservations with expiry system
  - Audit trail through inventory transactions
  - Manager actions tracking table

#### Component 2: Product Classification Service
- Status: Fully implemented with API endpoints
- Location: `controllers/classificationController.js`, `services/classifier.js`
- Features:
  - Automatic product classification (private label vs third-party)
  - Dynamic multiplier calculation (1.0-2.0 range)
  - Batch classification processing
  - Classification rules management
  - Priority calculation based on sales velocity
- API Endpoints:
  - `POST /api/classification` - Register and classify products
  - `POST /api/classification/batch` - Batch product classification
  - `GET /api/classification/rules` - Get classification rules

#### Component 3: Manager Action Tracker (COMPLETE)
- Status: Fully implemented with behavioral intelligence
- Location: `controllers/managerActionsController.js`, `services/behaviourAnalyzer.js`
- Features:
  - Event-driven manager action logging
  - 6 types of behavioral intelligence extraction:
    - Order Timing Variance (demand_increase_expected)
    - Quantity Adjustments (market_opportunity_detected)
    - Emergency Orders (unexpected_demand_spike)
    - Safety Stock Changes (volatility_expected)
    - Competitive Response (market_disruption_detected)
    - Event Planning (event_driven_demand)
  - Confidence scoring (50%-95%)
  - Magnitude classification (moderate/significant/high)
  - Automated scheduling (every 5 minutes)
- API Endpoints:
  - `POST /api/manager-actions` - Log manager actions
  - `GET /api/manager-actions/signals` - Get behavioral signals
- Intelligence Metrics:
  - 83% signal detection rate
  - 10 signals from 12 actions
  - 5 high-priority alerts identified

### PARTIALLY IMPLEMENTED COMPONENTS

#### Component 1 Extensions: Atomic Inventory Management
- Status: Basic inventory tracking implemented
- Implemented: Database schema, basic CRUD operations
- Missing: Row-level locking, atomic reservations, race condition prevention
- Location: `controllers/inventoryController.js`

## PENDING IMPLEMENTATION

### Component 4: Regional Consensus Engine
- Purpose: Cross-store pattern validation and geographic trend analysis
- Dependencies: Manager Action Tracker
- Features Needed:
  - Cross-store behavior validation
  - Geographic clustering algorithms
  - Consensus strength calculation
  - Performance-weighted manager influence

### Component 5: Multi-Queue Processing System
- Purpose: Process different product types with appropriate priority
- Dependencies: Product Classification, Behavioral Intelligence
- Features Needed:
  - High Priority Queue (Private label with behavioral intelligence)
  - Standard Queue (Third-party with traditional processing)
  - Emergency Queue (Critical stockout situations)

### Component 6: Contribution Scoring Algorithm
- Purpose: Calculate store contribution capacity for inventory sharing
- Dependencies: Inventory data, behavioral intelligence
- Features Needed:
  - Mathematical scoring based on multiple factors
  - Dynamic boundaries (15-60% private label, 10-40% third-party)
  - Real-time calculation during allocation cycles

### Component 7: Warehouse-Centric Transfer System
- Purpose: Manage inventory movement between stores via warehouses
- Features Needed:
  - Hierarchical warehouse failover system
  - Cost-optimized routing algorithms
  - Batch transfer coordination
  - Real-time capacity monitoring

### Component 8: Regional Cluster Manager
- Purpose: Geographic organization for transfer efficiency
- Features Needed:
  - Geographic boundary optimization
  - Dynamic cluster adjustment
  - Cross-cluster transfer capability

### Component 9: Queue Conversion Failsafe
- Purpose: Automatic fallback during system stress
- Features Needed:
  - Real-time system health monitoring
  - Automatic rule-based processing fallback
  - Gradual restoration with validation

### Component 10: Participation Flag System
- Purpose: Control product participation in dynamic allocation
- Features Needed:
  - Boolean participation flags
  - Supply chain disruption management
  - Quality issue isolation

### Component 11: Independent Satisfaction Monitor
- Purpose: Customer satisfaction monitoring and protection
- Features Needed:
  - Separate satisfaction tracking algorithms
  - Early warning alert system
  - Override capability for customer protection

### Component 12: Traditional Logistics Fallback
- Purpose: Complete system backup using proven methods
- Features Needed:
  - Parallel traditional allocation system
  - Seamless switchover capability
  - Performance monitoring for recovery
### Component 13: API Gateway & Orchestration
- Purpose: Coordinate all components and provide external interfaces
- Features Needed:
  - Service orchestration and workflow management
  - Error handling and retry logic
  - Performance monitoring and logging

### Component 14: Emergency Override System
- Purpose: Handle critical situations requiring immediate intervention
- Features Needed:
  - Emergency trigger detection
  - Automatic approval workflows
  - Rapid response protocols

## Current Technical Stack

### Backend Framework
- Runtime: Node.js v22.14.0
- Framework: Express.js v5.1.0
- Database: PostgreSQL 17
- Environment: dotenv v17.0.0

### Key Dependencies
```json
{
  "express": "^5.1.0",
  "pg": "^8.16.3",
  "dotenv": "^17.0.0",
  "node-cron": "^4.1.1",
  "axios": "^1.10.0"
}
```

### Database Schema
- Products: SKU, classification, pricing, priority scoring
- Inventory: Available/reserved quantities, safety stock levels
- Warehouses: Regional distribution centers
- Stores: Geographic organization and management
- Manager Actions: Behavioral intelligence data collection
- Classification Rules: Automated product categorization
- Priority Profiles: Dynamic allocation multipliers

## Getting Started

### Prerequisites
- Node.js v18+ 
- PostgreSQL 12+
- Git

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
# Test database connection
node test-db.js

# Test API endpoints
node test-api.js

# Test behavioral analyzer
node test-behavioral-analyzer.js

# Test manager actions scheduler
node test-manager-scheduler.js
```

---

## API Endpoints

### Core System
- `GET /api/health` - System health check
- `GET /api/demo/*` - Demo and testing endpoints

### Inventory Management
- `GET /api/inventory/:productId` - Get inventory status
- `GET /api/reservations/active` - Active reservations
- `POST /api/reservations/cleanup` - Cleanup expired reservations

### Product Classification
- `POST /api/classification` - Register and classify product
- `POST /api/classification/batch` - Batch classification
- `GET /api/classification/rules` - Get classification rules
- `POST /api/classification/rules` - Add classification rule

### Manager Behavioral Intelligence
- `POST /api/manager-actions` - Log manager action
- `GET /api/manager-actions/signals` - Get behavioral signals

### Analytics & Dashboard
- `GET /api/analytics/*` - Analytics endpoints
- `GET /api/dashboard/*` - Dashboard data