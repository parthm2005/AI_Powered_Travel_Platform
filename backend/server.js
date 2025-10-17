// const express = require('express');
import cors from 'cors';
import Groq  from 'groq-sdk';
import dotenv from 'dotenv';
dotenv.config();
import express from "express";
import mongoose from "mongoose";
import userRoutes from "./src/routes/userRoute.js";
import dashboardRoutes from "./src/routes/dashboardRoute.js";
import axios from "axios";

const app = express();
const PORT = process.env.PORT || 5000;

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Set this in your .env file
});



// Middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'Server is running!' });
});

// Chat route
app.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }


    // Improved extraction for days and destination
    let days = 0;
    let destination = 'your destination';

    // Try to extract "X day(s)" anywhere in the message
    const daysMatch = message.match(/(\d+)\s*day[s]?/i);
    if (daysMatch) {
      days = parseInt(daysMatch[1], 10);
    }

    // Try to extract destination after "trip to", "visit", "in", "to", "for", "at"
    let destMatch = message.match(/(?:trip to|visit|in|to|for|at)\s+([A-Za-z\s]+?)(?:\s+for|\s+\d|$)/i);
    if (destMatch) {
      destination = destMatch[1].replace(/for\s+\d+\s*day[s]?/i, '').trim();
    }

    // If days not found, try "for X days" at end
    if (!days) {
      const altDaysMatch = message.match(/for\s+(\d+)\s*day[s]?/i);
      if (altDaysMatch) {
        days = parseInt(altDaysMatch[1], 10);
      }
    }

    // If still not found, try "X day trip"
    if (!days) {
      const altDaysMatch2 = message.match(/(\d+)\s*day[s]?\s*trip/i);
      if (altDaysMatch2) {
        days = parseInt(altDaysMatch2[1], 10);
      }
    }

    // Only fallback to 2 days if no number found at all
    if (!days) days = 2;

    // If user asks for a trip schedule
    if (/\btrip\b|\bitinerary\b|\bschedule\b|\bplan\b/i.test(message) && days > 0) {
      let schedule = [];
      for (let i = 1; i <= days; i++) {
        schedule.push(`Day ${i}: Activities and sightseeing in ${destination}`);
      }
      const responseText = `Here is your ${days}-day trip schedule for ${destination}:
\n` + schedule.join('\n');
      return res.json({
        success: true,
        response: responseText,
        timestamp: new Date().toISOString()
      });
    }

    // Prepare messages for Groq API
    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Provide clear, concise, and helpful responses to user queries.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // Call Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: messages,
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      stream: false
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.json({
      success: true,
      response: aiResponse,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    try {
      const { message, conversationHistory = [] } = req.body;

      if (!message) {
        return res.status(400).json({ 
          error: 'Message is required' 
        });
      }

      // Weather query detection
      const weatherRegex = /(weather|temperature|forecast|rain|sunny|cloudy|humidity|wind|climate)[^\w]*((in|at|for|of|on)\s+)?([A-Za-z\s]+?)(\?|$|this|today|tomorrow|week|now)/i;
      const weatherMatch = message.match(weatherRegex);

      if (weatherMatch) {
        // Extract place name
        let place = weatherMatch[4]?.trim();
        if (place) {
          // Remove trailing words like 'today', 'this week', etc.
          place = place.replace(/(today|this week|tomorrow|now)$/i, '').trim();
        }
        if (!place) place = 'your location';

        // Call OpenWeather API
        const apiKey = process.env.REACT_APP_OPEN_WEATHER_API_KEY;
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(place)}&appid=${apiKey}&units=metric`;
        try {
          const weatherRes = await axios.get(url);
          const data = weatherRes.data;
                    const desc = data.weather?.[0]?.description || 'No description';
                    const temp = data.main?.temp;
                    const feels = data.main?.feels_like;
                    const humidity = data.main?.humidity;
                    const wind = data.wind?.speed;
                    const city = data.name;
                    const country = data.sys?.country;
                    const responseText = `Weather in ${city}, ${country}:
          Description: ${desc}
          Temperature: ${temp}°C (feels like ${feels}°C)
          Humidity: ${humidity}%
          Wind Speed: ${wind} m/s`;
                    return res.json({
                      success: true,
                      response: responseText,
                      timestamp: new Date().toISOString()
                    });
        } catch (weatherErr) {
          // If city not found or API error
          return res.json({
            success: false,
            response: `Sorry, I couldn't find weather info for "${place}". Please check the city name and try again.`,
            timestamp: new Date().toISOString()
          });
        }
      }

      // ...existing code for trip schedule extraction...
      // Improved extraction for days and destination
      let days = 0;
      let destination = 'your destination';

      // Try to extract "X day(s)" anywhere in the message
      const daysMatch = message.match(/(\d+)\s*day[s]?/i);
      if (daysMatch) {
        days = parseInt(daysMatch[1], 10);
      }

      // Try to extract destination after "trip to", "visit", "in", "to", "for", "at"
      let destMatch = message.match(/(?:trip to|visit|in|to|for|at)\s+([A-Za-z\s]+?)(?:\s+for|\s+\d|$)/i);
      if (destMatch) {
        destination = destMatch[1].replace(/for\s+\d+\s*day[s]?/i, '').trim();
      }

      // If days not found, try "for X days" at end
      if (!days) {
        const altDaysMatch = message.match(/for\s+(\d+)\s*day[s]?/i);
        if (altDaysMatch) {
          days = parseInt(altDaysMatch[1], 10);
        }
      }

      // If still not found, try "X day trip"
      if (!days) {
        const altDaysMatch2 = message.match(/(\d+)\s*day[s]?\s*trip/i);
        if (altDaysMatch2) {
          days = parseInt(altDaysMatch2[1], 10);
        }
      }

      // Only fallback to 2 days if no number found at all
      if (!days) days = 2;

      // If user asks for a trip schedule
      if (/\btrip\b|\bitinerary\b|\bschedule\b|\bplan\b/i.test(message) && days > 0) {
        let schedule = [];
        for (let i = 1; i <= days; i++) {
          schedule.push(`Day ${i}: Activities and sightseeing in ${destination}`);
        }
        const responseText = `Here is your ${days}-day trip schedule for ${destination}:
  \n` + schedule.join('\n');
        return res.json({
          success: true,
          response: responseText,
          timestamp: new Date().toISOString()
        });
      }

      // Prepare messages for Groq API
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant. Provide clear, concise, and helpful responses to user queries.'
        },
        ...conversationHistory,
        {
          role: 'user',
          content: message
        }
      ];

      // Call Groq API
      const chatCompletion = await groq.chat.completions.create({
        messages: messages,
        model: 'llama-3.3-70b-versatile',
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        stream: false
      });

      const aiResponse = chatCompletion.choices[0]?.message?.content || 'Sorry, I could not generate a response.';

      res.json({
        success: true,
        response: aiResponse,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Groq API Error:', error);
      // Handle different types of errors
      if (error.status === 429) {
        res.status(429).json({ 
          error: 'Rate limit exceeded. Please try again later.' 
        });
      } else if (error.status === 401) {
        res.status(401).json({ 
          error: 'Invalid API key. Please check your Groq API configuration.' 
        });
      } else {
        res.status(500).json({
          error: 'Failed to get AI response. Please try again.'
        });
      }
      }
    }
  });

// Streaming chat route (optional - for real-time responses)
app.post('/chat/stream', async (req, res) => {
  try {
    const { message, conversationHistory = [] } = req.body;

    if (!message) {
      return res.status(400).json({ 
        error: 'Message is required' 
      });
    }

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const messages = [
      {
        role: 'system',
        content: 'You are a helpful AI assistant. Provide clear, concise, and helpful responses to user queries.'
      },
      ...conversationHistory,
      {
        role: 'user',
        content: message
      }
    ];

    // Create streaming completion
    const stream = await groq.chat.completions.create({
      messages: messages,
      model: 'llama3-8b-8192',
      temperature: 0.7,
      max_tokens: 1000,
      top_p: 1,
      stream: true
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content || '';
      if (content) {
        res.write(`data: ${JSON.stringify({ content })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Streaming Error:', error);
    res.write(`data: ${JSON.stringify({ error: 'Failed to stream response' })}\n\n`);
    res.end();
  }
});

// Connect to MongoDB
mongoose.connect("mongodb://127.0.0.1:27017/travel_companion");

// Routes
app.use("/api/users", userRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
});