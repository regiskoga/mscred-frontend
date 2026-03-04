import axios, { InternalAxiosRequestConfig } from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
const baseURL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;

export const api = axios.create({
    baseURL,
});

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('@mscred:token');

    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
}, (error: any) => {
    return Promise.reject(error);
});

