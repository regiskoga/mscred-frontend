import { api } from '../axios';

export interface WorkingDaysMetrics {
    total: number;
    elapsed: number;
    remaining: number;
}

export interface FinancialTotals {
    currentCommission: number;
    paidApproved: number;
}

export interface GoalProgress {
    productId: number;
    productName: string;
    target: number;
    actualSales: number;
    remainingToGoal: number;
    percentageAchieved: number;
    currentTierPercentage: number;
}

export interface DashboardMetricsResponse {
    workingDays: WorkingDaysMetrics;
    financialTotals: FinancialTotals;
    goalsProgress: GoalProgress[];
}

export const dashboardAPI = {
    getMetrics: async () => {
        const response = await api.get<DashboardMetricsResponse>('/dashboard/metrics');
        return response.data;
    }
};
