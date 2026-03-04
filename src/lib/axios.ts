import axios from 'axios';

export const api = axios.create({
    // VITE_API_URL injected by Coolify environment variables or falls back to localhost in dev
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333/api',
});
