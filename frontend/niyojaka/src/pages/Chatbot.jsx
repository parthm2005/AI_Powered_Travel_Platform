import React, { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Loader2, MapPin, Cloud, Star, Calendar, DollarSign, Info, X } from 'lucide-react';

// Travel Recommendation Engine
class TravelRecommendationEngine {
  constructor(config) {
    this.openWeatherKey = config.openWeatherKey;
    this.googlePlacesKey = config.googlePlacesKey;
    this.aiService = config.aiService;
  }

  async generateRecommendations(query, filters = {}) {
    try {
      const travelIntent = await this.parseUserIntent(query);
      
      const [weatherData, placesData] = await Promise.all([
        this.getWeatherData(travelIntent.destination),
        this.getPlacesData(travelIntent.destination, filters.interests)
      ]);
      
      const recommendation = await this.generateSmartItinerary({
        ...travelIntent,
        weather: weatherData,
        places: placesData,
        filters
      });
      
      return recommendation;
    } catch (error) {
      console.error('Recommendation generation failed:', error);
      return this.fallbackRecommendation(query);
    }
  }

  async parseUserIntent(query) {
    // Simulate AI parsing - in real implementation, use your AI service
    const locationMatch = query.match(/(?:in|to|visit)\s+([A-Za-z\s]+?)(?:\s+for|\s+\d|$)/i);
    const durationMatch = query.match(/(\d+)\s*days?/i);
    
    return {
      destination: locationMatch ? locationMatch[1].trim() : 'Unknown',
      duration: durationMatch ? parseInt(durationMatch[1]) : 3,
      startDate: null,
      groupSize: 1,
      travelType: 'solo'
    };
  }

  async getWeatherData(destination) {
    try {
      // Mock weather data - replace with real API calls
      return {
        current: {
          main: { temp: 25, humidity: 60 },
          weather: [{ description: 'partly cloudy', main: 'Clouds' }]
        },
        forecast: {
          list: Array(5).fill(null).map((_, i) => ({
            dt: Date.now() / 1000 + i * 86400,
            main: { temp: 25 + Math.random() * 5 },
            weather: [{ main: 'Clear' }]
          }))
        }
      };
    } catch (error) {
      console.error('Weather API error:', error);
      return null;
    }
  }

  async getPlacesData(destination, interests = []) {
    try {
      // Option 1: Using Overpass API (Free OpenStreetMap data)
      return await this.getPlacesFromOverpass(destination, interests);
      
      // Option 2: Using Foursquare Places API (has free tier)
      // return await this.getPlacesFromFoursquare(destination, interests);
      
      // Option 3: Using REST Countries + Wikipedia API
      // return await this.getPlacesFromWikipedia(destination, interests);
      
    } catch (error) {
      console.error('Places API error:', error);
      return this.getMockPlacesData(destination, interests);
    }
  }

  // FREE Option 1: Overpass API (OpenStreetMap data)
  async getPlacesFromOverpass(destination, interests = []) {
    try {
      // First get coordinates for the destination
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`
      );
      const geoData = await geoResponse.json();
      
      if (!geoData.length) throw new Error('Location not found');
      
      const { lat, lon } = geoData[0];
      const radius = 5000; // 5km radius
      
      // Query Overpass API for places
      const overpassQuery = `
        [out:json][timeout:25];
        (
          node["tourism"~"attraction|museum|viewpoint|gallery|zoo"](around:${radius},${lat},${lon});
          node["amenity"~"restaurant|cafe|bar|pub"](around:${radius},${lat},${lon});
          node["leisure"~"park|garden|sports_centre|swimming_pool"](around:${radius},${lat},${lon});
          node["shop"~"mall|department_store"](around:${radius},${lat},${lon});
        );
        out body;
      `;
      
      const overpassUrl = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(overpassQuery)}`;
      const response = await fetch(overpassUrl);
      const data = await response.json();
      
      return this.processOverpassData(data.elements);
    } catch (error) {
      console.error('Overpass API error:', error);
      return this.getMockPlacesData(destination, interests);
    }
  }

  // FREE Option 2: Foursquare Places API (100 requests/day free)
  async getPlacesFromFoursquare(destination, interests = []) {
    try {
      const FOURSQUARE_API_KEY = 'your-foursquare-api-key'; // Free at developer.foursquare.com
      
      // Get coordinates first
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}&limit=1`
      );
      const geoData = await geoResponse.json();
      
      if (!geoData.length) throw new Error('Location not found');
      const { lat, lon } = geoData[0];
      
      // Foursquare Places API
      const foursquareUrl = `https://api.foursquare.com/v3/places/search?ll=${lat},${lon}&radius=5000&limit=50`;
      
      const response = await fetch(foursquareUrl, {
        headers: {
          'Authorization': FOURSQUARE_API_KEY,
          'Accept': 'application/json'
        }
      });
      
      const data = await response.json();
      return this.processFoursquareData(data.results);
    } catch (error) {
      console.error('Foursquare API error:', error);
      return this.getMockPlacesData(destination, interests);
    }
  }

  // Process OpenStreetMap/Overpass data
  processOverpassData(elements) {
    const categories = {
      attractions: [],
      restaurants: [],
      activities: [],
      accommodation: []
    };
    
    elements.forEach(place => {
      const tags = place.tags || {};
      const placeData = {
        name: tags.name || 'Unnamed Place',
        rating: +(Math.random() * 2 + 3).toFixed(1), // Random rating 3-5, 1 digit after decimal
        types: [],
        address: tags['addr:street'] || '',
        category: ''
      };
      
      // Categorize based on OSM tags
      if (tags.tourism) {
        placeData.types.push('tourist_attraction');
        placeData.category = 'tourism';
        categories.attractions.push(placeData);
      } else if (tags.amenity === 'restaurant' || tags.amenity === 'cafe') {
        placeData.types.push(tags.amenity);
        placeData.category = 'dining';
        categories.restaurants.push(placeData);
      } else if (tags.leisure) {
        placeData.types.push('activity');
        placeData.category = 'leisure';
        categories.activities.push(placeData);
      }
    });
    
    // Sort by rating and limit results
    Object.keys(categories).forEach(key => {
      categories[key] = categories[key]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 10);
    });
    
    return categories;
  }

  // Process Foursquare data
  processFoursquareData(places) {
    const categories = {
      attractions: [],
      restaurants: [],
      activities: [],
      accommodation: []
    };
    
    places.forEach(place => {
      const placeData = {
        name: place.name,
        rating: +(Math.random() * 2 + 3).toFixed(1), // Foursquare rating if available
        types: place.categories?.map(cat => cat.name) || [],
        address: place.location?.formatted_address || '',
        category: place.categories?.[0]?.name || 'general'
      };
      
      // Categorize based on Foursquare categories
      const categoryName = place.categories?.[0]?.name?.toLowerCase() || '';
      
      if (categoryName.includes('restaurant') || categoryName.includes('food') || categoryName.includes('cafe')) {
        categories.restaurants.push(placeData);
      } else if (categoryName.includes('museum') || categoryName.includes('attraction') || categoryName.includes('landmark')) {
        categories.attractions.push(placeData);
      } else if (categoryName.includes('park') || categoryName.includes('recreation') || categoryName.includes('entertainment')) {
        categories.activities.push(placeData);
      } else if (categoryName.includes('hotel') || categoryName.includes('accommodation')) {
        categories.accommodation.push(placeData);
      }
    });
    
    return categories;
  }

  // Enhanced mock data with more realistic places
  getMockPlacesData(destination, interests = []) {
    const destinationLower = destination.toLowerCase();
    
    // Create destination-specific mock data
    const mockData = {
      paris: {
        attractions: [
          { name: 'Eiffel Tower', rating: 4.6, types: ['landmark'], description: 'Iconic iron tower' },
          { name: 'Louvre Museum', rating: 4.7, types: ['museum'], description: 'World\'s largest art museum' },
          { name: 'Notre-Dame Cathedral', rating: 4.5, types: ['church'], description: 'Gothic cathedral' },
          { name: 'Arc de Triomphe', rating: 4.5, types: ['monument'], description: 'Triumphal arch' }
        ],
        restaurants: [
          { name: 'Le Jules Verne', rating: 4.2, types: ['fine_dining'], description: 'Michelin-starred restaurant' },
          { name: 'L\'As du Fallafel', rating: 4.4, types: ['street_food'], description: 'Famous falafel spot' },
          { name: 'Café de Flore', rating: 4.1, types: ['cafe'], description: 'Historic Parisian cafe' }
        ],
        activities: [
          { name: 'Seine River Cruise', rating: 4.3, types: ['boat_tour'], description: 'Scenic river tour' },
          { name: 'Montmartre Walking Tour', rating: 4.4, types: ['walking_tour'], description: 'Explore artistic quarter' }
        ]
      },
      tokyo: {
        attractions: [
          { name: 'Senso-ji Temple', rating: 4.5, types: ['temple'], description: 'Ancient Buddhist temple' },
          { name: 'Tokyo Skytree', rating: 4.3, types: ['observation_tower'], description: 'Tallest tower in Japan' },
          { name: 'Meiji Shrine', rating: 4.4, types: ['shrine'], description: 'Shinto shrine in forest' }
        ],
        restaurants: [
          { name: 'Sukiyabashi Jiro', rating: 4.8, types: ['sushi'], description: 'World-famous sushi' },
          { name: 'Ramen Yokocho', rating: 4.2, types: ['ramen'], description: 'Traditional ramen alley' },
          { name: 'Tsukiji Outer Market', rating: 4.1, types: ['market'], description: 'Fresh seafood market' }
        ],
        activities: [
          { name: 'Shibuya Crossing Experience', rating: 4.2, types: ['urban_experience'], description: 'World\'s busiest intersection' },
          { name: 'Traditional Tea Ceremony', rating: 4.6, types: ['cultural_experience'], description: 'Authentic Japanese culture' }
        ]
      },
      // Default fallback for other destinations
      default: {
        attractions: [
          { name: 'City Center', rating: 4.2, types: ['area'], description: 'Historic downtown area' },
          { name: 'Local Museum', rating: 4.0, types: ['museum'], description: 'Regional history and culture' },
          { name: 'Main Square', rating: 4.1, types: ['landmark'], description: 'Central gathering place' }
        ],
        restaurants: [
          { name: 'Local Cuisine Restaurant', rating: 4.3, types: ['restaurant'], description: 'Traditional local dishes' },
          { name: 'Popular Cafe', rating: 4.1, types: ['cafe'], description: 'Cozy local hangout' }
        ],
        activities: [
          { name: 'City Walking Tour', rating: 4.0, types: ['tour'], description: 'Explore the main sights' },
          { name: 'Local Market Visit', rating: 3.9, types: ['market'], description: 'Experience local culture' }
        ]
      }
    };
    
    // Return specific data for known destinations, otherwise use default
    const key = Object.keys(mockData).find(city => destinationLower.includes(city)) || 'default';
    return mockData[key];
  }

  async generateSmartItinerary(data) {
    const { destination, duration, weather, places, filters } = data;

    let itinerary = `🏙️ **${duration}-Day ${destination} Travel Plan**\n\n`;
    for (let day = 1; day <= duration; day++) {
      itinerary += `**Day ${day}:**\n`;
      if (day === 1) {
        itinerary += `🌅 Morning (9:00 AM):\n- Check into accommodation\n- Visit ${places?.attractions?.[0]?.name || 'main attraction'} (${places?.attractions?.[0]?.rating || '4.5'}⭐)\n`;
        itinerary += `🍽️ Lunch (1:00 PM):\n- Dine at ${places?.restaurants?.[0]?.name || 'local restaurant'} (${places?.restaurants?.[0]?.rating || '4.6'}⭐)\n`;
        itinerary += `🌆 Evening (6:00 PM):\n- Explore ${places?.attractions?.[1]?.name || 'city center'}\n- Weather: ${weather?.current?.weather?.[0]?.description || 'pleasant'}, ${weather?.current?.main?.temp || '25'}°C\n\n`;
      } else {
        itinerary += `🏛️ Morning (10:00 AM):\n- Visit ${places?.attractions?.[day % places?.attractions?.length || 1]?.name || 'museum or cultural site'}\n- ${places?.activities?.[(day-1) % places?.activities?.length || 0]?.name || 'Adventure activity'}\n`;
        itinerary += `🍕 Afternoon (2:00 PM):\n- Lunch at ${places?.restaurants?.[day % places?.restaurants?.length || 1]?.name || 'popular eatery'}\n- Free time for shopping or local exploration\n\n`;
      }
    }
    itinerary += `**Budget Estimate**: $${50 * duration}-${100 * duration} per day\n`;
    itinerary += `**Weather Tip**: ${this.getWeatherRecommendation(weather?.current)}`;

    return this.enhanceItinerary(itinerary, data);
  }

  enhanceItinerary(aiItinerary, data) {
    const { weather, places } = data;
    
    return {
      itinerary: aiItinerary,
      metadata: {
        destination: data.destination,
        duration: data.duration,
        generatedAt: new Date().toISOString(),
        weatherSummary: this.getWeatherSummary(weather),
        topRecommendations: {
          attractions: places?.attractions?.slice(0, 3) || [],
          restaurants: places?.restaurants?.slice(0, 3) || [],
          activities: places?.activities?.slice(0, 2) || []
        }
      },
      interactiveElements: {
        weatherAlerts: [],
        budgetRange: `$${50 * data.duration}-${100 * data.duration}`,
        quickActions: [
          'Modify budget preferences',
          'Add more days',
          'Change interests',
          'Get weather updates'
        ]
      }
    };
  }

  getWeatherSummary(weather) {
    if (!weather) return { temperature: 'N/A', condition: 'Unknown', recommendation: 'Check local weather' };
    
    const current = weather.current;
    return {
      temperature: `${Math.round(current.main.temp)}°C`,
      condition: current.weather[0].description,
      humidity: `${current.main.humidity}%`,
      recommendation: this.getWeatherRecommendation(current)
    };
  }

  getWeatherRecommendation(currentWeather) {
    if (!currentWeather) return 'Check local weather conditions';
    
    const temp = currentWeather.main.temp;
    const condition = currentWeather.weather[0].main.toLowerCase();
    
    if (condition.includes('rain')) {
      return '🌧️ Pack an umbrella and consider indoor activities';
    } else if (temp > 30) {
      return '☀️ Stay hydrated and seek shade during midday';
    } else if (temp < 10) {
      return '🧥 Dress warmly and enjoy cozy indoor spots';
    } else {
      return '🌤️ Perfect weather for outdoor exploration!';
    }
  }

  fallbackRecommendation(query) {
    return {
      itinerary: `I'd love to help you plan your trip! While I'm having trouble accessing real-time data right now, I can still provide some general guidance for "${query}".

🗺️ **General Travel Tips:**
- Check local weather forecasts before departure
- Research popular attractions and book in advance
- Download offline maps for navigation
- Pack according to local climate and activities
- Consider travel insurance

Would you like me to help you with specific aspects of your trip planning?`,
      metadata: {
        generatedAt: new Date().toISOString(),
        dataSource: 'fallback',
        limitation: 'Limited to general recommendations due to API unavailability'
      },
      interactiveElements: {
        quickActions: [
          'Tell me about local cuisine',
          'Suggest budget-friendly options',
          'What activities are popular?',
          'Help with packing list'
        ]
      }
    };
  }
}

// require('dotenv').config({path:'../../.env'});
// Travel Chatbot Component
class TravelChatbot {
  constructor() {
    this.engine = new TravelRecommendationEngine({
      openWeatherKey: process.env.REACT_APP_OPEN_WEATHER_API_KEY, // Replace with your actual key
      googlePlacesKey: 'your-google-places-api-key', // Replace with your actual key
      aiService: null // Would be your AI service
    });
  }

  async handleUserQuery(message) {
    const filters = this.extractFilters(message);
    const recommendation = await this.engine.generateRecommendations(message, filters);
    return this.formatResponse(recommendation);
  }

  extractFilters(message) {
    const filters = {
      interests: [],
      budget: 'moderate',
      travelStyle: 'balanced'
    };
    
    const interests = ['adventure', 'food', 'history', 'nature', 'shopping', 'nightlife'];
    interests.forEach(interest => {
      if (message.toLowerCase().includes(interest)) {
        filters.interests.push(interest);
      }
    });
    
    if (message.includes('budget') || message.includes('cheap')) {
      filters.budget = 'budget';
    } else if (message.includes('luxury') || message.includes('premium')) {
      filters.budget = 'luxury';
    }
    
    return filters;
  }

  formatResponse(recommendation) {
    return {
      text: recommendation.itinerary,
      metadata: recommendation.metadata,
      quickReplies: recommendation.interactiveElements?.quickActions || []
    };
  }

  isTravelQuery(message) {
    const travelKeywords = [
      'plan', 'trip', 'travel', 'visit', 'go to', 'vacation', 'holiday',
      'itinerary', 'places to see', 'what to do', 'tourist', 'sightseeing',
      'days in', 'weekend in', 'tour', 'destination'
    ];
    
    return travelKeywords.some(keyword => 
      message.toLowerCase().includes(keyword.toLowerCase())
    );
  }
}

// Main ChatBot Component
const ChatBot = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const travelChatbot = useRef(new TravelChatbot());

  const API_BASE_URL = 'http://localhost:5000';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
    
    // Welcome message
    const welcomeMessage = {
      id: Date.now(),
      text: `🌍 **Welcome to your AI Travel Assistant!**

I can help you plan amazing trips with personalized recommendations. Try asking me:

• "Plan a 3-day trip to Paris"
• "I want to visit Tokyo for food and culture"
• "Suggest a weekend getaway to Goa"
• "What's the weather like in Manali?"

Just tell me where you want to go and I'll create a detailed itinerary for you! ✈️`,
      sender: 'ai',
      timestamp: new Date(),
      isWelcome: true
    };
    
    setMessages([welcomeMessage]);
  }, []);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError('');
    setIsLoading(true);

    const newUserMessage = {
      id: Date.now(),
      text: userMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);

    try {
      let aiResponse;
      
      // Check if this is a travel-related query
      if (travelChatbot.current.isTravelQuery(userMessage)) {
        // Use travel recommendation engine
        const travelResponse = await travelChatbot.current.handleUserQuery(userMessage);
        aiResponse = {
          response: travelResponse.text,
          metadata: travelResponse.metadata,
          quickReplies: travelResponse.quickReplies
        };
      } else {
        // Fallback to regular chatbot API
        const conversationHistory = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'assistant',
          content: msg.text
        }));

        const response = await fetch(`${API_BASE_URL}/chat`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: userMessage,
            conversationHistory: conversationHistory
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to get response');
        }

        aiResponse = await response.json();
      }

      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse.response,
        sender: 'ai',
        timestamp: new Date(),
        metadata: aiResponse.metadata,
        quickReplies: aiResponse.quickReplies
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error('Chat error:', err);
      setError(err.message || 'Failed to send message. Please try again.');
      
      const errorMessage = {
        id: Date.now() + 1,
        text: 'Sorry, I encountered an error. Please try again or rephrase your question.',
        sender: 'ai',
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickReply = (reply) => {
    setInputMessage(reply);
    inputRef.current?.focus();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([]);
    setError('');
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
  <div className="flex flex-col h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 shadow-lg sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center space-x-3">
            <MapPin className="h-8 w-8" />
            <h1 className="text-xl font-bold">AI Travel Assistant</h1>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={clearChat}
              className="px-3 py-1 bg-blue-700 hover:bg-blue-800 rounded-md text-sm transition-colors"
              disabled={messages.length === 0}
            >
              Clear Chat
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="px-2 py-1 bg-red-200 hover:bg-red-200 rounded-md text-red-600 text-sm flex items-center"
                title="Close Chatbot"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 max-w-4xl mx-auto w-full">
          <p className="text-sm">{error}</p>
        </div>
      )}

  {/* Chat Messages */}
  <div className="flex-1 p-4 max-w-4xl mx-auto w-full overflow-y-auto scrollbar-thin scrollbar-thumb-blue-400 scrollbar-track-blue-100">
        <div className="space-y-4">
          {messages.map((message) => (
            <div key={message.id}>
              <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`flex max-w-xs lg:max-w-md xl:max-w-lg ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}>
                  {/* Avatar */}
                  <div className={`flex-shrink-0 ${
                    message.sender === 'user' ? 'ml-3' : 'mr-3'
                  }`}>
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                      message.sender === 'user' 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white' 
                        : message.isError
                        ? 'bg-red-500 text-white'
                        : 'bg-gradient-to-r from-green-500 to-teal-600 text-white'
                    }`}>
                      {message.sender === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <MapPin className="h-4 w-4" />
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  <div className={`rounded-lg px-4 py-3 ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                      : message.isError
                      ? 'bg-red-100 text-red-800 border border-red-200'
                      : 'bg-white text-gray-800 shadow-md border border-gray-200'
                  }`}>
                    <div className="text-sm whitespace-pre-wrap"
                         dangerouslySetInnerHTML={{ 
                           __html: message.text
                             .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                             .replace(/\*(.*?)\*/g, '<em>$1</em>')
                             .replace(/\n/g, '<br>')
                         }} 
                    />
                    
                    {/* Metadata Display */}
                    {message.metadata && (
                      <div className="mt-3 pt-2 border-t border-gray-200">
                        <div className="flex items-center space-x-4 text-xs text-gray-600">
                          {message.metadata.weatherSummary && (
                            <div className="flex items-center space-x-1">
                              <Cloud className="h-3 w-3" />
                              <span>{message.metadata.weatherSummary.temperature}</span>
                            </div>
                          )}
                          {message.metadata.duration && (
                            <div className="flex items-center space-x-1">
                              <Calendar className="h-3 w-3" />
                              <span>{message.metadata.duration} days</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <p className={`text-xs mt-2 ${
                      message.sender === 'user' 
                        ? 'text-blue-100' 
                        : 'text-gray-500'
                    }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Quick Replies */}
              {message.quickReplies && message.quickReplies.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2 ml-11">
                  {message.quickReplies.map((reply, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuickReply(reply)}
                      className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs rounded-full transition-colors"
                    >
                      {reply}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex mr-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-green-500 to-teal-600 text-white flex items-center justify-center">
                  <MapPin className="h-4 w-4" />
                </div>
              </div>
              <div className="bg-white rounded-lg px-4 py-3 shadow-md border border-gray-200">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
                  <span className="text-sm text-gray-500">Planning your perfect trip...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white p-4 max-w-4xl mx-auto w-full shadow-lg mb-11">
        <div className="flex space-x-4">
          <input
            ref={inputRef}
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask me to plan your next adventure..."
            className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-2 rounded-lg transition-all flex items-center space-x-2 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span>Send</span>
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 text-center">
          Press Enter to send • Try: "Plan 3 days in Paris" or "Weekend in Goa"
        </p>
      </div>
    </div>
  );
};

export default ChatBot;