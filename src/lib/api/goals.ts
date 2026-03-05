import { api } from '../axios';

export interface Goal {
    id: number;
    product_id: number;
    store_id: number | null;
    user_id: string | null;
    month: number;
    year: number;
    target: number;
    product?: { name: string };
    store?: { name: string };
    user?: { name: string };
}

export const goalsAPI = {
    list: async (params?: { month?: number; year?: number; product_id?: number }) => {
        const response = await api.get<Goal[]>('/goals', { params });
        return response.data;
    },

    create: async (data: Omit<Goal, 'id' | 'product' | 'store' | 'user'>) => {
        const response = await api.post<Goal>('/goals', data);
        return response.data;
    },

    update: async (id: number, data: { target: number }) => {
        const response = await api.put<Goal>(`/goals/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/goals/${id}`);
    }
};
