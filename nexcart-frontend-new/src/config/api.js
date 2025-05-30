// API Configuration for NexCart Frontend
// This ensures the correct API URL is always used

// Get API URL from environment variables with proper fallback
const getApiUrl = () => {
  // Check if we're in production (deployed)
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  
  if (isProduction) {
    // Force production API URL when deployed
    return 'https://nexcart-backend-qv0t.onrender.com/api';
  }
  
  // Use environment variable for development, fallback to localhost
  return import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
};

// Export the API URL
export const API_URL = getApiUrl();

// Export a function to get API URL (for consistency)
export const getApiBaseUrl = () => API_URL;

// Log the API URL for debugging
console.log('NexCart API URL:', API_URL);

export default API_URL;
