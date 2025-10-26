import axios from 'axios';

// --- UPDATED LOGIC ---
// Use the live Render URL for production, otherwise use localhost
const baseURL = process.env.NODE_ENV === 'production'
    ? 'https://online-movie-ticket-booking-backend.onrender.com/api'
    : 'http://localhost:5000/api';
// --- END OF UPDATE ---

const api = axios.create({
  baseURL: baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;