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

export interface SalesByProduct {
    productId: number;
    productName: string;
    totalValue: number;
    count: number;
}

export interface MonthlyEvolution {
    productEvolution: {
        series: any[];
        names: string[];
    };
    storeEvolution: {
        series: any[];
        names: string[];
    };
    consultantRanking: {
        name: string;
        value: number;
    }[];
}

export interface DashboardMetricsResponse {
    workingDays: WorkingDaysMetrics;
    financialTotals: FinancialTotals;
    goalsProgress: GoalProgress[];
    salesByProduct: SalesByProduct[];
    monthlyEvolution: MonthlyEvolution;
}

export const dashboardAPI = {
    getMetrics: async (month?: number, year?: number, consultantId?: string, targetStoreId?: number) => {
        const params: any = {};
        if (month) params.month = month;
        if (year) params.year = year;
        if (consultantId) params.consultantId = consultantId;
        if (targetStoreId) params.targetStoreId = targetStoreId;

        const response = await api.get<DashboardMetricsResponse>('/dashboard/metrics', { params });
        return response.data;
    }
};
