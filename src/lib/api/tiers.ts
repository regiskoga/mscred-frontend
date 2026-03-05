import { api } from '../axios';

export interface CommissionTier {
    id: number;
    product_id: number;
    min_value: number;
    max_value: number | null;
    percentage: number;
    product?: { name: string };
}

export const tiersAPI = {
    list: async (params?: { product_id?: number }) => {
        const response = await api.get<CommissionTier[]>('/commission-tiers', { params });
        return response.data;
    },

    create: async (data: Omit<CommissionTier, 'id' | 'product'>) => {
        const response = await api.post<CommissionTier>('/commission-tiers', data);
        return response.data;
    },

    update: async (id: number, data: Omit<CommissionTier, 'id' | 'product' | 'product_id'>) => {
        const response = await api.put<CommissionTier>(`/commission-tiers/${id}`, data);
        return response.data;
    },

    delete: async (id: number) => {
        await api.delete(`/commission-tiers/${id}`);
    }
};
