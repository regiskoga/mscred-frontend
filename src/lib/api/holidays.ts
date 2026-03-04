import { api } from '../axios'; // Assuming there's a predefined axios instance

export interface Holiday {
    id: number;
    name: string;
    date: string;
}

export async function getHolidays() {
    const response = await api.get('/holidays');
    return response.data.holidays;
}

export async function createHoliday(data: { name: string; date: string }) {
    const response = await api.post('/holidays', data);
    return response.data;
}

export async function updateHoliday(id: number, data: { name: string; date: string }) {
    const response = await api.put(`/holidays/${id}`, data);
    return response.data;
}

export async function deleteHoliday(id: number) {
    await api.delete(`/holidays/${id}`);
}
