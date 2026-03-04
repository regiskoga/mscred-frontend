import { api } from '../axios';

export interface SyncStats {
    created: number;
    skipped: number;
    errors: number;
}

export interface SyncResponse {
    message: string;
    stats: SyncStats;
}

export const integrationsApi = {
    async updateUserSheetId(userId: string, googleSheetId: string) {
        const response = await api.patch(`/integrations/google-sheets/users/${userId}/sheet`, {
            google_sheet_id: googleSheetId,
        });
        return response.data;
    },

    async syncGoogleSheets(userId: string): Promise<SyncResponse> {
        const response = await api.post('/integrations/google-sheets/sync', {
            user_id: userId,
        });
        return response.data;
    }
};
