import React from 'react'
import { 
    PieChart, 
    Pie, 
    Cell, 
    ResponsiveContainer, 
    Tooltip, 
    Legend
} from 'recharts'
import { PieChart as PieChartIcon } from 'lucide-react'
import SkeletonLoader from '../common/SkeletonLoader'

const ExpenseBreakdownChart = ({ summary, loading, formatCurrency }) => {
    if (loading) {
        return (
            <div className="bg-base-100 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <SkeletonLoader height={24} width="40%" />
                    <SkeletonLoader height={32} width="30%" />
                </div>
                <SkeletonLoader height={300} />
            </div>
        );
    }

    // Prepare chart data
    const chartData = summary?.categoryBreakdown?.map(item => ({
        name: item.category,
        value: item.amount,
        percentage: item.percentage
    })) || [];

    // Color palette for the chart
    const COLORS = [
        '#3b82f6', // blue
        '#10b981', // green
        '#f59e0b', // amber
        '#ef4444', // red
        '#8b5cf6', // purple
        '#ec4899', // pink
        '#14b8a6', // teal
        '#f97316', // orange
        '#6b7280', // gray
        '#84cc16', // lime
    ];

    const totalExpenses = summary?.monthlyExpenses || 0;

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            return (
                <div className="bg-base-100 border border-base-200 rounded-lg p-3 shadow-lg">
                    <p className="text-sm font-medium mb-1">{data.name}</p>
                    <p className="text-sm">
                        Amount: <span className="font-semibold">{formatCurrency(data.value)}</span>
                    </p>
                    <p className="text-sm">
                        Percentage: <span className="font-semibold">{data.payload.percentage.toFixed(1)}%</span>
                    </p>
                </div>
            );
        }
        return null;
    };

    const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percentage }) => {
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * Math.PI / 180);
        const y = cy + radius * Math.sin(-midAngle * Math.PI / 180);

        if (percentage < 5) return null; // Don't show label for small slices

        return (
            <text 
                x={x} 
                y={y} 
                fill="white" 
                textAnchor={x > cx ? 'start' : 'end'} 
                dominantBaseline="central"
                className="text-xs font-medium"
            >
                {`${percentage.toFixed(0)}%`}
            </text>
        );
    };

    return (
        <div className="bg-base-100 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-base-content flex items-center gap-2">
                        <PieChartIcon size={20} className="text-primary" />
                        Expense Breakdown
                    </h2>
                    <p className="text-sm text-base-content/60 mt-1">
                        Total expenses for selected period
                    </p>
                </div>
                
                <div className="text-right">
                    <p className="text-sm text-base-content/60">Total Spent</p>
                    <p className="text-lg font-bold text-red-600">
                        {formatCurrency(totalExpenses)}
                    </p>
                </div>
            </div>

            {chartData.length > 0 ? (
                <div className="flex flex-col lg:flex-row items-center gap-6">
                    {/* Pie Chart */}
                    <div className="flex-1 w-full">
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    cx="50%"
                                    cy="50%"
                                    labelLine={false}
                                    label={(props) => CustomLabel({ ...props, percentage: props.payload.percentage })}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Legend */}
                    <div className="flex-1 w-full">
                        <div className="space-y-3">
                            <h3 className="text-sm font-medium text-base-content/60 mb-3">
                                Top Categories
                            </h3>
                            {chartData.slice(0, 8).map((item, index) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div 
                                            className="w-3 h-3 rounded-full"
                                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                        />
                                        <span className="text-sm text-base-content">
                                            {item.name}
                                        </span>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-medium text-base-content">
                                            {formatCurrency(item.value)}
                                        </p>
                                        <p className="text-xs text-base-content/60">
                                            {item.percentage.toFixed(1)}%
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="h-[300px] flex items-center justify-center">
                    <div className="text-center">
                        <PieChartIcon size={48} className="mx-auto text-base-content/30 mb-4" />
                        <p className="text-base-content/60">No expense data available</p>
                        <p className="text-sm text-base-content/40 mt-1">
                            Start adding expenses to see your breakdown
                        </p>
                    </div>
                </div>
            )}

            {/* Summary */}
            {chartData.length > 0 && (
                <div className="mt-6 pt-6 border-t border-base-200">
                    <div className="flex items-center justify-between">
                        <p className="text-sm text-base-content/60">
                            Most expensive category: 
                            <span className="font-medium text-base-content ml-1">
                                {chartData[0]?.name || 'N/A'}
                            </span>
                        </p>
                        <p className="text-sm text-base-content/60">
                            Categories: 
                            <span className="font-medium text-base-content ml-1">
                                {chartData.length}
                            </span>
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ExpenseBreakdownChart;
