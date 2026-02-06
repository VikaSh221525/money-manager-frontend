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
    getDashboardSummary: async (period = "monthly") => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get(`/dashboard/summary?period=${period}`);
            console.log("Dashboard summary response:", res.data);
            
            // Transform backend response to match frontend expectations
            const income = res.data.summary?.income?.total || 0;
            const expenses = res.data.summary?.expense?.total || 0;
            const netIncome = res.data.summary?.netIncome || (income - expenses);
            
            // Calculate savings rate: if income > 0, show (netIncome / income) * 100
            // Otherwise show 0
            let savingsRate = 0;
            if (income > 0) {
                savingsRate = (netIncome / income) * 100;
            }
            
            const transformedData = {
                monthlyIncome: income,
                monthlyExpenses: expenses,
                netIncome: netIncome,
                savingsRate: savingsRate,
                categoryBreakdown: res.data.categoryBreakdown || [],
                recentTransactions: res.data.recentTransactions || []
            };
            
            console.log("Transformed summary data:", transformedData);
            set({ summary: transformedData, loading: false });
            return transformedData;
        } catch (err) {
            console.error("Dashboard summary error:", err.response?.data || err);
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
            // Map frontend timeRange to backend period
            const periodMap = {
                'week': 'weekly',
                'month': 'monthly',
                'year': 'yearly'
            };
            const period = periodMap[timeRange] || 'monthly';
            
            const res = await axios.get(`/dashboard/trends?period=${period}`);
            console.log("Dashboard trends response:", res.data);
            
            // Transform backend response to match frontend expectations
            const transformedData = {
                data: (res.data.trends || []).map(item => ({
                    period: item._id?.year 
                        ? `${item._id.month || ''}/${item._id.year}` 
                        : 'Unknown',
                    income: item._id?.type === 'income' ? item.total : 0,
                    expenses: item._id?.type === 'expense' ? item.total : 0
                })),
                period: res.data.period
            };
            
            // Group by period and combine income/expense
            const groupedData = {};
            transformedData.data.forEach(item => {
                if (!groupedData[item.period]) {
                    groupedData[item.period] = { period: item.period, income: 0, expenses: 0 };
                }
                groupedData[item.period].income += item.income;
                groupedData[item.period].expenses += item.expenses;
            });
            
            const finalData = {
                data: Object.values(groupedData),
                period: res.data.period
            };
            
            console.log("Transformed trends data:", finalData);
            set({ 
                trends: finalData, 
                timeRange,
                loading: false 
            });
            return finalData;
        } catch (err) {
            console.error("Dashboard trends error:", err.response?.data || err);
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
            console.log("Accounts overview response:", res.data);
            set({ 
                accountsOverview: res.data,
                loading: false 
            });
            return res.data;
        } catch (err) {
            console.error("Accounts overview error:", err.response?.data || err);
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
            // Map frontend timeRange to backend period
            const periodMap = {
                'week': 'weekly',
                'month': 'monthly',
                'year': 'yearly'
            };
            const period = periodMap[timeRange] || 'monthly';
            
            // Load accounts first to get total balance
            const accountsOverview = await get().getAccountsOverview();
            
            // Then load summary and trends
            const [summary, trends] = await Promise.all([
                get().getDashboardSummary(period),
                get().getDashboardTrends(timeRange)
            ]);
            
            // Merge account balance into summary
            const finalSummary = {
                ...summary,
                totalBalance: accountsOverview?.totalBalance || 0
            };
            
            set({ 
                summary: finalSummary,
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
