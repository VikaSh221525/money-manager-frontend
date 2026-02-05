import { create } from "zustand";
import axios from "../utils/axios";
import toast from "react-hot-toast";

export const useDashboardStore = create((set, get) => ({
    summary: null,
    trends: null,
    accountsOverview: null,
    loading: false,
    error: null,
    timeRange: "month", // week, month, year

    // Get dashboard summary
    getDashboardSummary: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get("/dashboard/summary");
            set({ summary: res.data, loading: false });
            return res.data;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to fetch dashboard summary" });
            toast.error(err.response?.data?.message || "Failed to fetch dashboard summary");
            set({ loading: false });
            return null;
        }
    },

    // Get income/expense trends
    getDashboardTrends: async (timeRange = "month") => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get(`/dashboard/trends?range=${timeRange}`);
            set({ 
                trends: res.data, 
                timeRange,
                loading: false 
            });
            return res.data;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to fetch trends" });
            toast.error(err.response?.data?.message || "Failed to fetch trends");
            set({ loading: false });
            return null;
        }
    },

    // Get accounts overview
    getAccountsOverview: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get("/dashboard/accounts");
            set({ accountsOverview: res.data, loading: false });
            return res.data;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to fetch accounts overview" });
            toast.error(err.response?.data?.message || "Failed to fetch accounts overview");
            set({ loading: false });
            return null;
        }
    },

    // Load all dashboard data
    loadDashboardData: async (timeRange = "month") => {
        set({ loading: true });
        try {
            const [summary, trends, accountsOverview] = await Promise.all([
                get().getDashboardSummary(),
                get().getDashboardTrends(timeRange),
                get().getAccountsOverview()
            ]);
            
            set({ 
                summary,
                trends,
                accountsOverview,
                timeRange,
                loading: false 
            });
            
            return { summary, trends, accountsOverview };
        } catch (err) {
            set({ loading: false });
            return null;
        }
    },

    // Set time range for trends
    setTimeRange: (range) => {
        set({ timeRange: range });
        get().getDashboardTrends(range);
    },

    // Get monthly income (from summary)
    getMonthlyIncome: () => {
        const { summary } = get();
        return summary?.monthlyIncome || 0;
    },

    // Get monthly expenses (from summary)
    getMonthlyExpenses: () => {
        const { summary } = get();
        return summary?.monthlyExpenses || 0;
    },

    // Get monthly savings (income - expenses)
    getMonthlySavings: () => {
        return get().getMonthlyIncome() - get().getMonthlyExpenses();
    },

    // Get total balance across all accounts
    getTotalBalance: () => {
        const { summary } = get();
        return summary?.totalBalance || 0;
    },

    // Get recent transactions (from summary)
    getRecentTransactions: () => {
        const { summary } = get();
        return summary?.recentTransactions || [];
    },

    // Get top spending categories (from summary)
    getTopSpendingCategories: () => {
        const { summary } = get();
        return summary?.topSpendingCategories || [];
    },

    // Get chart data for trends (formatted for recharts)
    getTrendsChartData: () => {
        const { trends } = get();
        if (!trends || !trends.data) return [];

        return trends.data.map(item => ({
            name: item.period,
            income: item.income,
            expenses: item.expenses,
            savings: item.income - item.expenses
        }));
    },

    // Get category breakdown chart data
    getCategoryChartData: () => {
        const { summary } = get();
        if (!summary?.categoryBreakdown) return [];

        return summary.categoryBreakdown.map(item => ({
            name: item.category,
            value: item.amount,
            percentage: item.percentage
        }));
    },

    // Get account distribution chart data
    getAccountChartData: () => {
        const { accountsOverview } = get();
        if (!accountsOverview?.accounts) return [];

        return accountsOverview.accounts.map(account => ({
            name: account.name,
            balance: account.balance,
            type: account.type
        }));
    },

    // Get weekly comparison data
    getWeeklyComparison: () => {
        const { trends } = get();
        if (!trends?.weeklyComparison) return null;

        return {
            thisWeek: trends.weeklyComparison.thisWeek,
            lastWeek: trends.weeklyComparison.lastWeek,
            change: trends.weeklyComparison.change,
            changePercentage: trends.weeklyComparison.changePercentage
        };
    },

    // Get monthly comparison data
    getMonthlyComparison: () => {
        const { trends } = get();
        if (!trends?.monthlyComparison) return null;

        return {
            thisMonth: trends.monthlyComparison.thisMonth,
            lastMonth: trends.monthlyComparison.lastMonth,
            change: trends.monthlyComparison.change,
            changePercentage: trends.monthlyComparison.changePercentage
        };
    },

    // Clear all dashboard data
    clearDashboardData: () => {
        set({
            summary: null,
            trends: null,
            accountsOverview: null,
            timeRange: "month"
        });
    }
}));
