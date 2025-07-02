# External Intelligence Configuration

The Private Label Inventory System's Component 3 now supports configurable external intelligence gathering through environment variables.

## Configuration Options

You can configure the following aspects of external intelligence gathering:

### Weather Locations

```
WEATHER_LOCATIONS=New York,Los Angeles,Chicago,Miami
```

- Define multiple locations to fetch weather data for (comma-separated)
- Each location will be processed separately
- Weather analysis will be location-specific
- Default: "New York" if not specified

### News Categories

```
NEWS_CATEGORIES=ice_cream,beverages,snacks,retail,food
```

- Define product categories to fetch news for (comma-separated)
- News will be analyzed for each category separately
- Default categories: "ice_cream,beverages,snacks,retail" if not specified

### Holiday Countries

```
HOLIDAY_COUNTRIES=US,CA,UK
```

- Define countries to fetch holiday data for (comma-separated)
- Holidays will be analyzed for each country
- Default: "US" if not specified

## API Keys

You'll need to set up API keys for external intelligence:

```
WEATHER_API_KEY=your_openweathermap_api_key_here
NEWS_API_KEY=your_newsapi_key_here
```

- Get your OpenWeatherMap API key at: https://openweathermap.org/api
- Get your NewsAPI key at: https://newsapi.org/

## Fallback Mechanism

If API keys are not configured, the system will automatically fall back to simulated data to ensure functionality.

## Impact

These configuration options allow your system to fetch intelligence that's relevant to your specific business locations and product categories, making the behavioral intelligence extraction more accurate and actionable.
