import axios from 'axios';

// Set the base URL based on the environment (local vs. production)
const baseURL = process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL || '/api'
    : 'http://localhost:5000/api';

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;