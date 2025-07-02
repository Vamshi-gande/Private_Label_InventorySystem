# Manager Action Intelligent Classification

The Private Label Inventory System now features fully automatic classification of manager actions based on raw data and external intelligence sources.

## Using Intelligent Classification

When submitting a manager action, simply provide the raw action data, and the system will:

1. Fetch relevant external intelligence (weather, news, economic data)
2. Analyze the action data with intelligent heuristics
3. Classify the action into the most appropriate type
4. Store the classification rationale and intelligence sources

### Example API Request

```json
POST /api/manager-actions/actions

{
  "store_id": "ST001",
  "manager_id": "MGR001",
  "city": "New York",
  "product_category": "ice_cream",
  "scheduled_order_date": "2025-07-15",
  "actual_order_date": "2025-06-25",
  "scheduled_quantity": 100,
  "actual_quantity": 200,
  "comments": "Preparing for summer heatwave"
}
```

### Classification Types

The system automatically classifies actions into the following types:

| Type | Description | Main Triggers |
|------|-------------|--------------|
| `early_order` | Order placed significantly earlier than normal | Timing variance > 14 days |
| `bulk_order` | Quantity significantly higher than normal | Quantity variance > 50% |
| `emergency_order` | Urgent order indicated by manager | Comments with "urgent" or "emergency" |
| `event_driven` | Response to news or events | Relevant news articles detected |
| `weather_demand_spike` | Response to weather forecasts | High temperatures for weather-sensitive products |
| `economic_substitution` | Response to economic indicators | Low unemployment or economic shift |
| `scheduled_order` | Regular order without special patterns | Default when no patterns detected |

## External Intelligence Sources

The system fetches data from the following sources:

1. **Weather Data** - Current and forecast weather for specific cities
2. **News Data** - Recent news articles related to product categories
3. **Economic Data** - Economic indicators like unemployment rate

## Configuration

You can configure the auto-classification behavior in the `.env` file:

```
# Enable/disable features
ENABLE_AUTO_CLASSIFICATION=true
EXTERNAL_INTELLIGENCE_ENABLED=true

# External intelligence configuration
WEATHER_LOCATIONS=New York,Los Angeles,Chicago,Miami
NEWS_CATEGORIES=ice_cream,beverages,snacks,retail,food
HOLIDAY_COUNTRIES=US,CA,UK

# API Keys
WEATHER_API_KEY=your_openweathermap_key
NEWS_API_KEY=your_newsapi_key
FRED_API_KEY=your_fred_api_key
```

## Example Response

```json
{
  "success": true,
  "actionId": 123,
  "intelligence": {
    "signal": "weather_demand_spike",
    "confidence": 0.8,
    "reasoning": "Weather-sensitive product with high temperature forecast",
    "auto_classified": true,
    "external_intelligence_used": true
  },
  "action_type": "weather_demand_spike",
  "message": "Manager action captured and intelligence extracted successfully"
}
```
