import { api } from '../axios';

export type CatalogTypeDb = 'products' | 'operation_types' | 'attendance_statuses' | 'sales_channels';
export type CatalogTypeEndpoint = 'products' | 'operation-types' | 'attendance-statuses' | 'sales-channels';

export interface CatalogItem {
    id: number;
    name: string;
    active: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export const catalogsApi = {
    // Busca items por endpoint formatado com hífen
    async getItems(endpointType: CatalogTypeEndpoint): Promise<CatalogItem[]> {
        const response = await api.get(`/catalogs/${endpointType}`);
        // O backend retorna { products: [...] } ou { operation_types: [...] } 
        // Vamos extrair a primeira chave do objeto que seja um array
        const data = response.data;
        const arrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
        return arrayKey ? data[arrayKey] : [];
    },

    // Cria usando o formato do DB (com underscore) esperado pelo Fastify Controller param
    async createItem(type: CatalogTypeDb, name: string, extraData: any = {}) {
        const response = await api.post(`/catalogs/${type}`, { name, ...extraData });
        return response.data;
    },

    async updateItem(type: CatalogTypeDb, id: number, name: string, extraData: any = {}) {
        const response = await api.put(`/catalogs/${type}/${id}`, { name, ...extraData });
        return response.data;
    },

    async toggleItemStatus(type: CatalogTypeDb, id: number, active: boolean) {
        const response = await api.patch(`/catalogs/${type}/${id}/toggle`, { active });
        return response.data;
    }
};
