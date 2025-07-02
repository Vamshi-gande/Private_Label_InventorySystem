// External APIs Service for Component 3
// Fetches external intelligence from free APIs to enrich manager behavior analysis

const axios = require('axios');
const pool = require('../config/db');

/**
 * Fetch weather forecast data (OpenWeatherMap API)
 * @param {string} city - City name to get weather for
 * @returns {Object|null} Weather data or null if error
 */
async function fetchWeatherForecast(city = 'New York') {
    const apiKey = process.env.WEATHER_API_KEY;
    
    if (!apiKey) {
        console.warn('WEATHER_API_KEY not found in environment variables');
        return null;
    }

    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    try {
        const response = await axios.get(url);
        
        // Extract relevant weather intelligence
        const forecast = response.data;
        const relevantData = {
            city: forecast.city.name,
            country: forecast.city.country,
            forecasts: forecast.list.slice(0, 5).map(item => ({
                date: item.dt_txt,
                temperature: item.main.temp,
                weather: item.weather[0].main,
                description: item.weather[0].description,
                humidity: item.main.humidity,
                wind_speed: item.wind.speed
            })),
            fetched_at: new Date().toISOString()
        };

        console.log(`Weather data fetched successfully for ${city}`);
        return relevantData;

    } catch (error) {
        console.error('Error fetching weather data:', error.message);
        return null;
    }
}

/**
 * Fetch category-specific news (NewsAPI)
 * @param {string} category - Category to search for (e.g., 'food', 'retail')
 * @returns {Object|null} News data or null if error
 */
async function fetchCategoryNews(category = 'retail') {
    const apiKey = process.env.NEWS_API_KEY;
    
    if (!apiKey) {
        console.warn('NEWS_API_KEY not found in environment variables');
        return null;
    }

    const searchTerms = {
        'ice_cream': 'ice cream OR frozen dessert OR dairy products',
        'beverages': 'beverages OR drinks OR soft drinks',
        'snacks': 'snacks OR chips OR crackers',
        'retail': 'retail industry OR consumer goods OR supply chain',
        'food': 'food industry OR grocery OR supermarket'
    };

    const query = searchTerms[category] || category;
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&sortBy=publishedAt&pageSize=10&apiKey=${apiKey}`;

    try {
        const response = await axios.get(url);
        
        // Extract relevant news intelligence
        const articles = response.data.articles.slice(0, 5).map(article => ({
            title: article.title,
            description: article.description,
            source: article.source.name,
            published_at: article.publishedAt,
            url: article.url
        }));

        const relevantData = {
            category,
            total_results: response.data.totalResults,
            articles,
            fetched_at: new Date().toISOString()
        };

        console.log(`News data fetched successfully for category: ${category}`);
        return relevantData;

    } catch (error) {
        console.error('Error fetching news data:', error.message);
        return null;
    }
}

/**
 * Fetch holiday and events data (Free holidays API)
 * @param {string} country - Country code (e.g., 'US', 'CA')
 * @returns {Object|null} Holiday data or null if error
 */
async function fetchHolidaysAndEvents(country = 'US') {
    const currentYear = new Date().getFullYear();
    const url = `https://date.nager.at/api/v3/PublicHolidays/${currentYear}/${country}`;

    try {
        const response = await axios.get(url);
        
        // Filter upcoming holidays (next 60 days)
        const today = new Date();
        const futureDate = new Date();
        futureDate.setDate(today.getDate() + 60);

        const upcomingHolidays = response.data
            .filter(holiday => {
                const holidayDate = new Date(holiday.date);
                return holidayDate >= today && holidayDate <= futureDate;
            })
            .map(holiday => ({
                name: holiday.name,
                date: holiday.date,
                global: holiday.global,
                counties: holiday.counties
            }));

        const relevantData = {
            country,
            upcoming_holidays: upcomingHolidays,
            total_upcoming: upcomingHolidays.length,
            fetched_at: new Date().toISOString()
        };

        console.log(`Holiday data fetched successfully for ${country}`);
        return relevantData;

    } catch (error) {
        console.error('Error fetching holiday data:', error.message);
        return null;
    }
}

/**
 * Fetch economic data (FRED API for economic indicators)
 * @returns {Object|null} Economic data or null if error
 */
async function fetchEconomicData() {
    const apiKey = process.env.FRED_API_KEY;
    
    if (!apiKey) {
        console.warn('FRED_API_KEY not found in environment variables');
        return simulateEconomicData();
    }

    // Get configured indicators (default to UNRATE if not specified)
    const indicators = process.env.FRED_INDICATORS ? 
        process.env.FRED_INDICATORS.split(',') : 
        ['UNRATE'];
    
    console.log(`Fetching economic indicators: ${indicators.join(', ')}`);
    
    try {
        // Fetch all indicators in parallel
        const indicatorPromises = indicators.map(async (indicator) => {
            const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${indicator}&api_key=${apiKey}&file_type=json&sort_order=desc&limit=1`;
            const response = await axios.get(url);
            
            if (response.data.observations && response.data.observations.length > 0) {
                const latest = response.data.observations[0];
                return {
                    indicator,
                    value: parseFloat(latest.value),
                    date: latest.date
                };
            }
            return null;
        });
        
        // Wait for all indicators to be fetched
        const results = await Promise.all(indicatorPromises);
        const validResults = results.filter(result => result !== null);
        
        // Build response object with all indicators
        const economicData = {
            fetched_at: new Date().toISOString(),
            indicators: {}
        };
        
        // Add each indicator to the response
        validResults.forEach(result => {
            economicData.indicators[result.indicator] = {
                value: result.value,
                date: result.date
            };
            
            // Set main unemployment rate for backward compatibility
            if (result.indicator === 'UNRATE') {
                economicData.indicator = 'UNRATE';
                economicData.name = 'Unemployment Rate';
                economicData.value = result.value;
                economicData.date = result.date;
                economicData.unit = 'percent';
            }
        });
        
        console.log(`Economic data fetched successfully: ${validResults.length} indicators`);
        return economicData;

    } catch (error) {
        console.error('Error fetching economic data:', error.message);
        return simulateEconomicData();
    }
}

/**
 * Generate simulated economic data when API key not available
 * @returns {Object} Simulated economic data
 */
function simulateEconomicData() {
    console.log('Generating simulated economic data');
    
    const today = new Date().toISOString().split('T')[0];
    
    // Simulated values based on realistic ranges
    const simulatedData = {
        indicator: 'UNRATE',
        name: 'Unemployment Rate',
        value: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
        date: today,
        unit: 'percent',
        fetched_at: new Date().toISOString(),
        simulated: true,
        indicators: {
            'UNRATE': {
                value: parseFloat((3.5 + Math.random() * 1.5).toFixed(1)),
                date: today
            },
            'CPIAUCSL': {
                value: parseFloat((300 + Math.random() * 20).toFixed(1)),
                date: today
            },
            'PCE': {
                value: parseFloat((18000 + Math.random() * 1000).toFixed(0)),
                date: today
            },
            'UMCSENT': {
                value: parseFloat((70 + Math.random() * 30).toFixed(1)),
                date: today
            },
            'RSAFS': {
                value: parseFloat((700 + Math.random() * 50).toFixed(1)),
                date: today
            },
            'ISRATIO': {
                value: parseFloat((1.2 + Math.random() * 0.3).toFixed(2)),
                date: today
            }
        }
    };
    
    return simulatedData;
}

/**
 * Store external intelligence in database
 * @param {string} source - Source of intelligence ('weather', 'news', 'events')
 * @param {string} category - Category of data
 * @param {Object} data - The intelligence data
 */
async function storeExternalIntelligence(source, category, data) {
    try {
        await pool.query(
            `INSERT INTO external_intelligence (source, category, data, fetched_at)
             VALUES ($1, $2, $3, NOW())`,
            [source, category, JSON.stringify(data)]
        );
        
        console.log(`External intelligence stored: ${source} - ${category}`);
        
    } catch (error) {
        console.error('Error storing external intelligence:', error.message);
        throw error;
    }
}

/**
 * Get stored external intelligence
 * @param {string} source - Source filter ('weather', 'news', 'events')
 * @param {number} days - Number of days back to fetch (default: 7)
 * @returns {Array} Array of intelligence records
 */
async function getExternalIntelligence(source = null, days = 7) {
    try {
        let query = `
            SELECT * FROM external_intelligence 
            WHERE fetched_at >= NOW() - INTERVAL '${days} days'
        `;
        
        const params = [];
        
        if (source) {
            query += ` AND source = $${params.length + 1}`;
            params.push(source);
        }
        
        query += ` ORDER BY fetched_at DESC`;
        
        const result = await pool.query(query, params);
        return result.rows;
        
    } catch (error) {
        console.error('Error retrieving external intelligence:', error.message);
        throw error;
    }
}

/**
 * Fetch all external intelligence sources
 * @param {Object} config - Configuration object with locations, categories, and countries
 * @returns {Object} All fetched intelligence data
 */
async function fetchAllExternalIntelligence(config = {}) {
    const locations = config.locations || ['New York'];
    const categories = config.categories || ['ice_cream', 'beverages', 'snacks', 'retail'];
    const countries = config.countries || ['US'];
    
    const results = {
        weather: {},
        news: {},
        events: {},
        economic: null,
        timestamp: new Date().toISOString(),
        config: { locations, categories, countries }
    };

    try {
        // Fetch weather data for each location
        for (const location of locations) {
            const weatherData = await fetchWeatherForecast(location);
            if (weatherData) {
                await storeExternalIntelligence('weather', location, weatherData);
                results.weather[location] = weatherData;
            }
        }

        // Fetch news for different categories
        for (const category of categories) {
            const newsData = await fetchCategoryNews(category);
            if (newsData) {
                await storeExternalIntelligence('news', category, newsData);
                if (!results.news) results.news = {};
                results.news[category] = newsData;
            }
        }

        // Fetch holiday/events data for each country
        for (const country of countries) {
            const eventsData = await fetchHolidaysAndEvents(country);
            if (eventsData) {
                await storeExternalIntelligence('events', `holidays_${country}`, eventsData);
                if (!results.events) results.events = {};
                results.events[country] = eventsData;
            }
        }
        
        // Fetch economic data (once, not location specific)
        const economicData = await fetchEconomicData();
        if (economicData) {
            await storeExternalIntelligence('economic', 'indicators', economicData);
            results.economic = economicData;
        }

        console.log('All external intelligence fetched successfully');
        return results;

    } catch (error) {
        console.error('Error in fetchAllExternalIntelligence:', error.message);
        throw error;
    }
}

/**
 * Analyze external intelligence for potential impact on inventory
 */
async function analyzeExternalIntelligenceImpact() {
    try {
        const intelligence = await getExternalIntelligence(null, 3); // Last 3 days
        const analysis = {
            weather_impact: [],
            news_impact: [],
            event_impact: [],
            recommendations: [],
            locations: new Set(),
            categories: new Set(),
            countries: new Set()
        };

        intelligence.forEach(record => {
            const data = record.data;
            
            // Track which locations/categories/countries we have data for
            if (record.source === 'weather' && data.city) {
                analysis.locations.add(data.city);
            }
            if (record.source === 'news' && record.category) {
                analysis.categories.add(record.category);
            }
            if (record.source === 'events' && data.country) {
                analysis.countries.add(data.country);
            }
            
            if (record.source === 'weather') {
                // Analyze weather impact
                data.forecasts?.forEach(forecast => {
                    if (forecast.temperature > 30) {
                        analysis.weather_impact.push({
                            type: 'high_temperature',
                            location: data.city || 'Unknown',
                            impact: 'Increased demand for ice cream and beverages',
                            confidence: 0.8,
                            date: forecast.date
                        });
                    }
                    if (forecast.weather.includes('Rain') || forecast.weather.includes('Storm')) {
                        analysis.weather_impact.push({
                            type: 'bad_weather',
                            location: data.city || 'Unknown',
                            impact: 'Reduced foot traffic, potential supply delays',
                            confidence: 0.7,
                            date: forecast.date
                        });
                    }
                });
            }

            if (record.source === 'events') {
                // Analyze holiday impact
                data.upcoming_holidays?.forEach(holiday => {
                    analysis.event_impact.push({
                        type: 'holiday',
                        name: holiday.name,
                        country: data.country || 'Unknown',
                        impact: 'Increased demand for seasonal products',
                        confidence: 0.9,
                        date: holiday.date
                    });
                });
            }

            if (record.source === 'news') {
                // Simple news sentiment analysis (could be enhanced)
                data.articles?.forEach(article => {
                    if (article.title.toLowerCase().includes('shortage') || 
                        article.title.toLowerCase().includes('supply chain')) {
                        analysis.news_impact.push({
                            type: 'supply_concern',
                            category: record.category || 'Unknown',
                            impact: 'Potential supply chain disruption',
                            confidence: 0.6,
                            source: article.source,
                            title: article.title
                        });
                    }
                });
            }
        });

        // Generate location-specific recommendations
        analysis.locations.forEach(location => {
            const locationImpacts = analysis.weather_impact.filter(impact => impact.location === location);
            
            if (locationImpacts.some(impact => impact.type === 'high_temperature')) {
                analysis.recommendations.push(`Consider increasing ice cream and beverage inventory for hot weather in ${location}`);
            }
            
            if (locationImpacts.some(impact => impact.type === 'bad_weather')) {
                analysis.recommendations.push(`Prepare for potential delivery delays in ${location} due to bad weather`);
            }
        });
        
        // Generate holiday recommendations
        if (analysis.event_impact.length > 0) {
            analysis.countries.forEach(country => {
                analysis.recommendations.push(`Prepare seasonal inventory for upcoming holidays in ${country}`);
            });
        }
        
        // Generate category-specific recommendations
        analysis.categories.forEach(category => {
            const categoryImpacts = analysis.news_impact.filter(impact => impact.category === category);
            if (categoryImpacts.length > 0) {
                analysis.recommendations.push(`Monitor ${category} supply chain closely due to news indicators`);
            }
        });

        // Convert sets to arrays for JSON serialization
        analysis.locations = Array.from(analysis.locations);
        analysis.categories = Array.from(analysis.categories);
        analysis.countries = Array.from(analysis.countries);
        
        return analysis;

    } catch (error) {
        console.error('Error analyzing external intelligence impact:', error.message);
        throw error;
    }
}

module.exports = {
    fetchWeatherForecast,
    fetchCategoryNews,
    fetchHolidaysAndEvents,
    fetchEconomicData,
    storeExternalIntelligence,
    getExternalIntelligence,
    fetchAllExternalIntelligence,
    analyzeExternalIntelligenceImpact
};
