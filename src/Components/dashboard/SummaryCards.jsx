import React from 'react'
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    PiggyBank,
    Wallet,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react'
import SkeletonLoader from '../common/SkeletonLoader'

const SummaryCards = ({ summary, formatCurrency, calculatePercentageChange, loading }) => {
    const cards = [
        {
            title: 'Available Balance',
            value: summary?.totalBalance || 0,
            change: summary?.balanceChange || 0,
            changeType: 'positive',
            icon: Wallet,
            color: 'text-blue-600',
            bgColor: 'bg-blue-50',
            borderColor: 'border-blue-200'
        },
        {
            title: 'Total Income',
            value: summary?.monthlyIncome || 0,
            change: summary?.incomeChange || 0,
            changeType: 'positive',
            icon: TrendingUp,
            color: 'text-green-600',
            bgColor: 'bg-green-50',
            borderColor: 'border-green-200'
        },
        {
            title: 'Total Expenses',
            value: summary?.monthlyExpenses || 0,
            change: summary?.expenseChange || 0,
            changeType: 'negative',
            icon: TrendingDown,
            color: 'text-red-600',
            bgColor: 'bg-red-50',
            borderColor: 'border-red-200'
        },
        {
            title: 'Savings Rate',
            value: summary?.savingsRate || 0,
            change: summary?.savingsRateChange || 0,
            changeType: 'neutral',
            icon: PiggyBank,
            color: 'text-purple-600',
            bgColor: 'bg-purple-50',
            borderColor: 'border-purple-200',
            isPercentage: true
        }
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-base-100 rounded-lg p-6 shadow-sm">
                        <SkeletonLoader height={24} width="60%" className="mb-4" />
                        <SkeletonLoader height={32} width="80%" className="mb-2" />
                        <SkeletonLoader height={16} width="40%" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {cards.map((card, index) => {
                const Icon = card.icon;
                const isPositive = card.change > 0;
                const isNegative = card.change < 0;
                
                return (
                    <div
                        key={index}
                        className="bg-base-100 rounded-lg p-6 shadow-sm hover:shadow-md transition-shadow duration-200 border border-base-200"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <div className={`p-2 rounded-lg ${card.bgColor}`}>
                                <Icon size={20} className={card.color} />
                            </div>
                            
                            {card.change !== 0 && (
                                <div className={`flex items-center gap-1 text-sm ${
                                    isPositive ? 'text-green-600' : isNegative ? 'text-red-600' : 'text-gray-600'
                                }`}>
                                    {isPositive && <ArrowUpRight size={16} />}
                                    {isNegative && <ArrowDownRight size={16} />}
                                    <span>
                                        {Math.abs(card.change).toFixed(1)}%
                                    </span>
                                </div>
                            )}
                        </div>
                        
                        <h3 className="text-sm font-medium text-base-content/60 mb-1">
                            {card.title}
                        </h3>
                        
                        <p className="text-2xl font-bold text-base-content">
                            {card.isPercentage 
                                ? `${card.value.toFixed(1)}%`
                                : formatCurrency(card.value)
                            }
                        </p>
                        
                        <p className="text-xs text-base-content/50 mt-2">
                            {card.title === 'Available Balance' && 'Total across all accounts'}
                            {card.title === 'Total Income' && `Past 30 days`}
                            {card.title === 'Total Expenses' && `Past 30 days`}
                            {card.title === 'Savings Rate' && 'Of total income'}
                        </p>
                    </div>
                );
            })}
        </div>
    );
};

export default SummaryCards;
