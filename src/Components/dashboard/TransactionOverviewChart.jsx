import React from 'react'
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar
} from 'recharts'
import { TrendingUp } from 'lucide-react'
import SkeletonLoader from '../common/SkeletonLoader'

const TransactionOverviewChart = ({ trends, loading, formatCurrency }) => {
    if (loading) {
        return (
            <div className="bg-base-100 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <SkeletonLoader height={24} width="40%" />
                    <SkeletonLoader height={32} width="20%" />
                </div>
                <SkeletonLoader height={300} />
            </div>
        );
    }

    // Prepare chart data
    const chartData = trends?.data?.map(item => ({
        name: item.period,
        income: item.income,
        expenses: item.expenses,
        savings: item.income - item.expenses
    })) || [];

    // Calculate totals
    const totalIncome = chartData.reduce((sum, item) => sum + item.income, 0);
    const totalExpenses = chartData.reduce((sum, item) => sum + item.expenses, 0);
    const totalSavings = totalIncome - totalExpenses;

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-base-100 border border-base-200 rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium mb-2">{label}</p>
                    {payload.map((entry, index) => (
                        <p key={index} className="text-sm" style={{ color: entry.color }}>
                            {entry.name}: {formatCurrency(entry.value)}
                        </p>
                    ))}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="bg-base-100 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-base-content flex items-center gap-2">
                        <TrendingUp size={20} className="text-primary" />
                        Transaction Overview
                    </h2>
                    <p className="text-sm text-base-content/60 mt-1">
                        Income vs Expenses over time
                    </p>
                </div>
                
                <div className="text-right">
                    <p className="text-sm text-base-content/60">Net Savings</p>
                    <p className={`text-lg font-bold ${totalSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {formatCurrency(totalSavings)}
                    </p>
                </div>
            </div>

            {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                            dataKey="name" 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                        />
                        <YAxis 
                            tick={{ fontSize: 12 }}
                            tickLine={false}
                            tickFormatter={(value) => `$${value}`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar 
                            dataKey="income" 
                            fill="#10b981" 
                            name="Income"
                            radius={[4, 4, 0, 0]}
                        />
                        <Bar 
                            dataKey="expenses" 
                            fill="#ef4444" 
                            name="Expenses"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                </ResponsiveContainer>
            ) : (
                <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                        <TrendingUp size={48} className="mx-auto text-base-content/30 mb-4" />
                        <p className="text-base-content/60">No transaction data available</p>
                        <p className="text-sm text-base-content/40 mt-1">
                            Start adding transactions to see your overview
                        </p>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            {chartData.length > 0 && (
                <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-base-200">
                    <div className="text-center">
                        <p className="text-sm text-base-content/60">Total Income</p>
                        <p className="text-lg font-semibold text-green-600">
                            {formatCurrency(totalIncome)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-base-content/60">Total Expenses</p>
                        <p className="text-lg font-semibold text-red-600">
                            {formatCurrency(totalExpenses)}
                        </p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm text-base-content/60">Average Savings</p>
                        <p className={`text-lg font-semibold ${totalSavings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatCurrency(totalSavings / chartData.length)}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TransactionOverviewChart;
