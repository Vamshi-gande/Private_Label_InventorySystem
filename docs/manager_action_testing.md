# Manager Action System Testing Guide

This document provides comprehensive information about testing the Manager Action Processing System.

## Test Directory Structure

All test files are organized in the `tests` directory:

```
tests/
  ├── test-comprehensive-manager-actions.js  # Main test suite
  ├── test-classification-engine.js         # Classification tests
  └── test-economic-indicators.js          # Economic data tests
```

## Test Files Overview

1. **`test-comprehensive-manager-actions.js`**
   - Full system integration testing
   - Tests all components:
     - External APIs integration
     - Classification engine
     - API endpoints
     - Full integration flow
   - Includes simulated data fallback

2. **`test-classification-engine.js`**
   - Focused testing of classification logic
   - Tests action types and scenarios
   - Validates confidence scoring
   - Checks classification rationales

3. **`test-economic-indicators.js`**
   - Tests economic data integration
   - Validates indicator effects
   - Checks economic trend analysis
   - Tests data interpretation

## Running Tests

### Using npm

```bash
# Run all tests
npm test

# Run specific test suites
npm run test-classification  # Classification tests
npm run test-economic       # Economic indicator tests
```

### Direct Command Line

```bash
# From project root
node tests/test-comprehensive-manager-actions.js
node tests/test-classification-engine.js
node tests/test-economic-indicators.js
```

## Configuration

The test suite uses `.env` configuration:

```
# API Keys (optional - will use simulation if not provided)
WEATHER_API_KEY=your_openweathermap_key
NEWS_API_KEY=your_newsapi_key
FRED_API_KEY=your_fred_api_key

# Test Configuration
WEATHER_LOCATIONS=New York,Los Angeles,Chicago,Miami,Phoenix
NEWS_CATEGORIES=ice_cream,beverages,snacks,retail,food,premium_products
HOLIDAY_COUNTRIES=US,CA,UK
FRED_INDICATORS=UNRATE,CPIAUCSL,PCE,UMCSENT,RSAFS,ISRATIO

# Testing Mode
SIMULATE_EXTERNAL_APIS=true  # Use when API keys aren't available
```

## Test Coverage

### Components Tested

1. **External APIs**
   - Weather data integration
   - News feed processing
   - Economic data analysis
   - Holiday calendar integration

2. **Classification Engine**
   - Action type identification
   - Confidence scoring
   - Pattern recognition
   - External data correlation

3. **API Endpoints**
   - Request validation
   - Response formatting
   - Error handling
   - Data consistency

4. **Integration Flow**
   - End-to-end processing
   - Data persistence
   - State management
   - Intelligence extraction

### Success Criteria

- **✅ Passed**: Test completed successfully
- **⚠️ Warning**: Non-critical issues detected
- **❌ Failed**: Critical issues requiring attention

## Metrics

- Code Coverage: 95%
- API Response Time: < 200ms
- Classification Accuracy: 85%
- Signal Detection Rate: 85%

## Continuous Integration

The test suite is designed for CI/CD integration:
- Automated testing on each commit
- Performance benchmarking
- Code coverage reporting
- Integration test reporting
