// Simple test script to verify Gemini API configuration
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

console.log('Testing Gemini API configuration...');
console.log('API Key:', process.env.GEMINI_API_KEY ? 'Set' : 'Not set');

const testGemini = async () => {
  try {
    // Test with gemini-1.5-flash
    console.log('\nTesting gemini-1.5-flash...');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const result = await model.generateContent('Hello! Can you respond with "Gemini API is working!" in both English and Roman Urdu?');
    const response = await result.response.text();
    
    console.log('✅ Gemini API test successful!');
    console.log('Response:', response);
    
  } catch (error) {
    console.error('❌ Gemini API test failed:', error.message);
    
    // Try fallback model
    try {
      console.log('\nTrying fallback model gemini-1.5-pro...');
      const fallbackModel = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
      
      const result = await fallbackModel.generateContent('Hello! Can you respond with "Gemini API is working!" in both English and Roman Urdu?');
      const response = await result.response.text();
      
      console.log('✅ Fallback model test successful!');
      console.log('Response:', response);
      
    } catch (fallbackError) {
      console.error('❌ Fallback model also failed:', fallbackError.message);
    }
  }
};

testGemini();