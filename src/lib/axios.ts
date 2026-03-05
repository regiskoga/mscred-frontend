import axios, { InternalAxiosRequestConfig } from 'axios';

const rawUrl = import.meta.env.VITE_API_URL || 'http://localhost:3333/api';
const baseURL = rawUrl.endsWith('/api') ? rawUrl : `${rawUrl.replace(/\/$/, '')}/api`;

console.log('[Axios Debug] API Base URL:', baseURL);

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

api.interceptors.response.use(
    response => response,
    error => {
        console.error('[Axios Debug] Response Error:', {
            url: error.config?.url,
            status: error.response?.status,
            data: error.response?.data,
            message: error.message
        });
        return Promise.reject(error);
    }
);

