# 📘 Detailed Documentation: Component 5 – Multi-Queue Processing System

---

## 📌 Overview: What Component 5 Does

The **Multi-Queue Processing System** is designed to intelligently manage inventory allocation requests by:

* Prioritizing requests based on **urgency**, **product type**, and **behavioral signals**.
* Organizing requests into **three distinct processing queues**:

  1. **Emergency Queue** – Critical stockouts (highest priority)
  2. **High Priority Queue** – Private label products influenced by behavioral intelligence
  3. **Standard Queue** – Traditional third-party products
* Ensuring **dynamic processing** that adjusts quantities using behavioral intelligence.
* Providing **auditability** by logging all inventory transactions to the database.

This component ensures **real-time prioritization, traceability, and scalable request management** in the Dynamic Private Label Inventory System.

---

## ⚙️ Files and Their Roles

| File                  | Location                           | Purpose                                                                   |
| --------------------- | ---------------------------------- | ------------------------------------------------------------------------- |
| Multi-Queue Processor | `/services/multiQueueProcessor.js` | Core processing logic, manages queues, assigns requests, processes queues |
| Inventory Logger      | `/services/inventoryLogger.js`     | Logs all processed transactions into the `inventory_transactions` table   |
| Queue Controller      | `/controllers/queueController.js`  | Exposes APIs for adding, processing, and checking queue statuses          |
| Queue Routes          | `/routes/queueRoutes.js`           | Connects queue-related endpoints to the Express server                    |
| Mock Data             | `/mock/multiQueueMockData.js`      | Provides sample products, behavioral signals, and requests for testing    |

---

## 🛠️ Component Files: Detailed Breakdown

### 1. `/services/multiQueueProcessor.js`

**Purpose: Core queue management and processing service**

#### Key Functions:

* `assignToQueue(allocationRequest)`:
  Determines which queue the request should be added to based on urgency and product type.

* `addToQueue(allocationRequest)`:
  Adds incoming requests to the appropriate queue.

* `processEmergencyQueue()`:
  Processes emergency requests, adds a 20% buffer to the requested quantity, logs the transaction.

* `processHighPriorityQueue()`:
  Processes private label requests with behavioral adjustments and a 50% buffer.

* `processStandardQueue()`:
  Processes third-party requests as-is.

* `processAllQueues()`:
  Runs all three processing functions in order of priority (emergency → high priority → standard).

* `getQueueStatus()`:
  Returns the number of pending requests in each queue.

---

### 2. `/services/inventoryLogger.js`

**Purpose: Transaction logger for processed allocations**

#### Key Functions:

* `logTransaction({ request_id, store_id, sku, original_quantity, final_quantity, processing_queue })`:
  Logs each allocation into the `inventory_transactions` table using PostgreSQL.

#### Configuration:

* Uses PostgreSQL pool configuration from `/config/db.js`.
* Writes transaction type, quantity change, source, destination, and detailed notes.

---

### 3. `/controllers/queueController.js`

**Purpose: API controller to manage queue requests**

#### Key API Functions:

* `addRequestToQueue(req, res)`:

  * Adds a request to the appropriate queue.

* `processQueues(req, res)`:

  * Triggers processing of all queues and returns processed results.

* `getQueueStatus(req, res)`:

  * Returns the live queue status.

* `loadMockData(req, res)`:

  * Loads predefined mock requests into queues for testing.

* `runDemo(req, res)`:

  * Loads mock requests and immediately processes all queues.

---

### 4. `/routes/queueRoutes.js`

**Purpose: Connects queue controller functions to HTTP routes**

#### API Routes:

* `POST /api/queue/add` → Add request to queue.
* `POST /api/queue/process` → Process all queues.
* `GET /api/queue/status` → Get queue status.
* `POST /api/queue/load-demo` → Load mock data into queues.
* `GET /api/queue/demo` → Run a complete processing demo.

---

### 5. `/mock/multiQueueMockData.js`

**Purpose: Provides mock data for local and demo testing**

#### Mock Data Includes:

* **Products:**

  * Private label (SKU: `PL-PASTA-001`)
  * Third-party (SKU: `TP-PASTA-001`)

* **Behavioral Signals:**

  * `ST001`: Demand spike expected → Multiplier: 1.4
  * `ST002`: Supply disruption expected → Multiplier: 1.6

* **Allocation Requests:**

  * Various urgency levels and priority categories.

---

## ⚙️ Configurations Used

### PostgreSQL Connection (`/config/db.js`)

```env
DB_HOST=localhost
DB_PORT=5432
DB_DATABASE=inventory_system
DB_USER=postgres
DB_PASSWORD=your_password
```

### Inventory Transactions Table Structure

| Field                  | Description                                       |
| ---------------------- | ------------------------------------------------- |
| transaction\_id        | Primary Key                                       |
| product\_id            | SKU / Product Identifier                          |
| transaction\_type      | Always 'ALLOCATE' for Component 5                 |
| quantity\_change       | Final allocated quantity                          |
| source\_location       | Always 'Warehouse'                                |
| destination\_location  | Destination store                                 |
| notes                  | Details about the request, queue type, quantities |
| transaction\_timestamp | Timestamp of transaction                          |

---

## ✅ How We Tested Component 5

### Testing Setup

* Database: PostgreSQL 17
* Server: Node.js (Express)

### Step 1: Start Server

```bash
node server.js
```

### Step 2: Load Mock Data

```http
POST http://localhost:3000/api/queue/load-demo
```

✅ Expected: Mock requests loaded into queues.

### Step 3: Check Queue Status

```http
GET http://localhost:3000/api/queue/status
```

✅ Expected: Response showing queue sizes.

### Step 4: Process Queues

```http
POST http://localhost:3000/api/queue/process
```

✅ Expected:

* All queues processed.
* Response showing processed items with final quantities.
* Inventory transactions logged in `inventory_transactions` table.

### Step 5: Verify Logs in Database

```sql
SELECT * FROM inventory_transactions;
```

✅ Expected:

* Each processed request should be logged with correct transaction details.

### Step 6: Manual API Testing

Tested via Postman:

* Add custom requests to verify dynamic queue assignment.
* Process queues with varying data sets.
* Confirm queue status updates and transaction logging.

---

## 🔍 Notes and Considerations

* **Scalability:** The current design supports batch processing; further optimization may be required for high-volume real-time requests.
* **Cron Jobs:** Can be added to automate periodic queue processing.
* **WebSocket Dashboard:** Deferred for later implementation to provide live queue monitoring.
* **Data Integrity:** Relies on behavioral signals being correctly extracted in earlier components.

---

## ✅ Summary of Key Outcomes

| Feature                                | Status               |
| -------------------------------------- | -------------------- |
| Multi-Queue Segmentation               | ✅ Completed          |
| Behavioral Signal Integration          | ✅ Completed          |
| Inventory Transaction Logging          | ✅ Completed          |
| API Endpoints for Full Queue Lifecycle | ✅ Completed          |
| Mock Data and Testing Setup            | ✅ Completed          |
| WebSocket Dashboard                    | 🚧 Planned for later |

---

If you would like, I can provide this document as:

* A **Markdown (.md)** file for GitHub.
* A **Word (.docx)** file for team circulation.
* A **PDF file** for formal documentation.

Let me know how you would like it exported!
