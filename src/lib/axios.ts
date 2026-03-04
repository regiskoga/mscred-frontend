import axios from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
const baseURL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;

export const api = axios.create({
    baseURL,
});
