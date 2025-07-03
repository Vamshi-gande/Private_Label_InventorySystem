Here’s a **detailed and fully structured documentation** for **Component 4: Regional Consensus Engine**
This version covers:

* Purpose
* How it works
* Folder & file breakdown
* Configuration used
* Testing methodology

You can directly use this as a **team reference document or internal wiki entry.**

---

# 📚 Component 4: Regional Consensus Engine

### Part of: Dynamic Private Label Inventory Management System

---

## 📌 **1. Overview of Component 4**

The **Regional Consensus Engine** is responsible for **validating behavioral intelligence signals across multiple stores in a region** to ensure that inventory and allocation decisions are not based on isolated manager actions but on collective regional behavior.

This helps:

* Prevent overreactions to outlier signals.
* Increase confidence in detected trends.
* Trigger **emergency allocations** only when multiple stores show critical patterns.

It dynamically **clusters stores into regions** and continuously **evaluates consensus strength** across these regions.

---

## ⚙️ **2. Key Functionalities**

| Feature                     | Description                                                                                                      |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| Dynamic Regional Clustering | Stores are grouped based on location and demand behavior using K-means clustering.                               |
| Signal Aggregation          | Collects and groups manager actions within a given time window (default: last 7 days).                           |
| Consensus Validation        | Determines whether enough stores in a region support the same signal to confirm its validity.                    |
| Weighted Confidence         | Each manager’s input is weighted based on their historical performance from Component 3.                         |
| Emergency Detection         | Special logic to immediately detect high-impact signals like supply chain disruptions or critical demand spikes. |

---

## 🗂️ **3. Folder & File Structure**

### `/services/regionalConsensusEngine.js`

* The core engine that:

  * Initializes regional clusters.
  * Calculates store demand scores.
  * Aggregates signals by region and by type.
  * Computes consensus strength.
  * Detects emergency signals.

---

### `/routes/consensusRoutes.js`

* API routes for:

  * Running regional consensus validation.
  * Triggering dynamic reclustering.
  * Fetching the latest consensus reports.

---

### `/services/kmeansHelper.js` (Optional, if separated)

* Contains K-means clustering logic.
* Can be used to separate math-heavy clustering from the main engine.

---

### `/config/consensusConfig.js`

* Stores configuration values:

```javascript
module.exports = {
    consensusThreshold: 0.6,  // Minimum agreement rate to establish consensus
    minStoresForConsensus: 3, // Minimum stores required in a region to validate a signal
    clusteringRefreshInterval: 3600 // Optional: Refresh clusters every hour
};
```

---

## 🔑 **4. Configuration Parameters**

| Parameter                   | Purpose                                                         | Default |
| --------------------------- | --------------------------------------------------------------- | ------- |
| `consensusThreshold`        | Minimum confidence × participation rate to validate a consensus | `0.6`   |
| `minStoresForConsensus`     | Minimum stores per region required to consider a signal valid   | `3`     |
| `clusteringRefreshInterval` | (Optional) Frequency of regional re-clustering in seconds       | `3600`  |

---

## 🔍 **5. Testing Approach**

### ✅ **Mock Data Used:**

* Simulated stores with latitude and longitude for clustering.
* Pre-inserted manager actions with extracted intelligence:

```sql
UPDATE manager_actions
SET extracted_intelligence = '{"signal": "demand_spike_critical", "confidence": 0.85}'
WHERE action_type = 'emergency_order';

UPDATE manager_actions
SET extracted_intelligence = '{"signal": "demand_increase_expected", "confidence": 0.78}'
WHERE action_type = 'early_order';

UPDATE manager_actions
SET extracted_intelligence = '{"signal": "volatility_expected", "confidence": 0.80}'
WHERE action_type = 'safety_stock_increase';
```

---

### ✅ **Functional Testing Steps:**

1. Loaded clustered regions using mock store location data.
2. Inserted behavioral intelligence signals into the database.
3. Used `GET /api/consensus/validate` to run the validation engine.
4. Verified that:

   * Signals with strong consensus were properly detected.
   * Weak or conflicting signals did not trigger regional actions.
   * Emergency signals were correctly prioritized.
5. Monitored the engine's console logs and API responses to ensure consensus strength calculations were accurate.
6. Tested both **manual triggering** of consensus and **mock automatic reclustering.**

---

### ✅ **Edge Cases Tested:**

* Stores showing conflicting signals within a region.
* Insufficient number of stores in a region.
* Emergency signals with near-threshold confidence.
* Scenarios with no recent manager actions in the region.

---

## 📡 **6. API Endpoints Implemented**

| Method | Endpoint                   | Purpose                                                                            |
| ------ | -------------------------- | ---------------------------------------------------------------------------------- |
| `POST` | `/api/consensus/validate`  | Runs regional consensus validation using current manager actions.                  |
| `POST` | `/api/consensus/recluster` | Triggers dynamic reclustering of store regions.                                    |
| `GET`  | `/api/consensus/report`    | Fetches the latest consensus report showing strong, weak, and emergency consensus. |

---

## 📈 **7. Outputs Generated**

Example of a **Consensus Report:**

```json
{
    "timestamp": "2025-06-29T12:34:56Z",
    "total_regions": 5,
    "strong_consensus": [
        {
            "region": "region_1",
            "signal_type": "demand_spike_critical",
            "consensus_strength": 0.82,
            "participating_stores": 4,
            "confidence": 0.88
        }
    ],
    "weak_consensus": [],
    "no_consensus": [
        { "region": "region_2", "signal_type": "no_consensus" }
    ],
    "emergency_alerts": [
        {
            "region": "region_1",
            "signal_type": "demand_spike_critical",
            "recommended_action": "emergency_inventory_allocation"
        }
    ]
}
```

---

## ✅ **Summary of Component 4 Implementation:**

| Feature                       | Status        |
| ----------------------------- | ------------- |
| Dynamic Clustering            | ✅ Implemented |
| Consensus Calculation         | ✅ Implemented |
| Emergency Detection           | ✅ Implemented |
| API Endpoints                 | ✅ Implemented |
| Real-Time Consensus Reporting | ✅ Implemented |
| Mock Data Testing             | ✅ Completed   |

---

## 🚀 **How This Component Connects to Others:**

* **Uses:** Manager actions (Component 3) and store/product metadata (Component 1).
* **Feeds Into:** Component 5 (Multi-Queue Processing) to prioritize high-confidence regional signals.
* **Supports:** Emergency allocation queues and dynamic private label prioritization.

---

If you want, I can format this as a PDF, a `README.md` file, or as a Confluence-friendly document.

👉 **Do you want me to help write the markdown file or continue with Component 5’s documentation next?**
