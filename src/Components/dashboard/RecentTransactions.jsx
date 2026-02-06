import React from 'react'
import { Link } from 'react-router'
import { 
    Clock, 
    ArrowUpRight, 
    ArrowDownRight, 
    ArrowRightLeft,
    Eye,
    Edit,
    Trash2
} from 'lucide-react'
import SkeletonLoader from '../common/SkeletonLoader'

const RecentTransactions = ({ summary, formatCurrency, loading }) => {
    const recentTransactions = summary?.recentTransactions || [];

    const getTransactionIcon = (type) => {
        switch (type) {
            case 'income':
                return <ArrowUpRight size={16} className="text-green-600" />;
            case 'expense':
                return <ArrowDownRight size={16} className="text-red-600" />;
            case 'transfer':
                return <ArrowRightLeft size={16} className="text-blue-600" />;
            default:
                return <Clock size={16} className="text-gray-600" />;
        }
    };

    const getTransactionColor = (type) => {
        switch (type) {
            case 'income':
                return 'text-green-600 bg-green-50 border-green-200';
            case 'expense':
                return 'text-red-600 bg-red-50 border-red-200';
            case 'transfer':
                return 'text-blue-600 bg-blue-50 border-blue-200';
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200';
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        if (date.toDateString() === today.toDateString()) {
            return 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
            return 'Yesterday';
        } else {
            return date.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: date.getFullYear() !== today.getFullYear() ? 'numeric' : undefined
            });
        }
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    if (loading) {
        return (
            <div className="bg-base-100 rounded-lg p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                    <SkeletonLoader height={24} width="40%" />
                    <SkeletonLoader height={32} width="20%" />
                </div>
                <div className="space-y-4">
                    {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex items-center justify-between p-4 border border-base-200 rounded-lg">
                            <div className="flex items-center gap-3">
                                <SkeletonLoader height={40} width={40} className="rounded-full" />
                                <div>
                                    <SkeletonLoader height={16} width={120} className="mb-2" />
                                    <SkeletonLoader height={12} width={80} />
                                </div>
                            </div>
                            <SkeletonLoader height={20} width={80} />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="bg-base-100 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-lg font-semibold text-base-content flex items-center gap-2">
                        <Clock size={20} className="text-primary" />
                        Recent Transactions
                    </h2>
                    <p className="text-sm text-base-content/60 mt-1">
                        Your latest financial activities
                    </p>
                </div>
                
                <Link 
                    to="/transactions"
                    className="btn btn-outline btn-sm"
                >
                    View All
                </Link>
            </div>

            {recentTransactions.length > 0 ? (
                <div className="space-y-3">
                    {recentTransactions.map((transaction) => (
                        <div
                            key={transaction._id}
                            className="flex items-center justify-between p-4 border border-base-200 rounded-lg hover:bg-base-50 transition-colors duration-150"
                        >
                            <div className="flex items-center gap-3">
                                {/* Transaction Icon */}
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${getTransactionColor(transaction.type)}`}>
                                    {getTransactionIcon(transaction.type)}
                                </div>

                                {/* Transaction Details */}
                                <div>
                                    <h3 className="font-medium text-base-content">
                                        {transaction.description}
                                    </h3>
                                    <div className="flex items-center gap-2 text-sm text-base-content/60">
                                        <span>{transaction.category?.name || 'Uncategorized'}</span>
                                        <span>•</span>
                                        <span>{formatDate(transaction.date)}</span>
                                        <span>•</span>
                                        <span>{formatTime(transaction.date)}</span>
                                    </div>
                                    {transaction.division && (
                                        <div className="flex items-center gap-1 mt-1">
                                            <span className={`text-xs px-2 py-1 rounded-full ${
                                                transaction.division === 'office' 
                                                    ? 'bg-blue-100 text-blue-700' 
                                                    : 'bg-purple-100 text-purple-700'
                                            }`}>
                                                {transaction.division}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Amount and Actions */}
                            <div className="flex items-center gap-3">
                                <div className="text-right">
                                    <p className={`font-semibold ${
                                        transaction.type === 'income' ? 'text-green-600' : 
                                        transaction.type === 'expense' ? 'text-red-600' : 
                                        'text-blue-600'
                                    }`}>
                                        {transaction.type === 'income' && '+'}
                                        {transaction.type === 'expense' && '-'}
                                        {formatCurrency(transaction.amount)}
                                    </p>
                                    <p className="text-xs text-base-content/60">
                                        {transaction.account?.name || 'Unknown Account'}
                                    </p>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex items-center gap-1">
                                    <button
                                        className="btn btn-ghost btn-xs btn-circle"
                                        title="View Details"
                                    >
                                        <Eye size={14} />
                                    </button>
                                    {transaction.isEditable && (
                                        <button
                                            className="btn btn-ghost btn-xs btn-circle"
                                            title="Edit Transaction"
                                        >
                                            <Edit size={14} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12">
                    <Clock size={48} className="mx-auto text-base-content/30 mb-4" />
                    <p className="text-base-content/60 mb-2">No recent transactions</p>
                    <p className="text-sm text-base-content/40 mb-4">
                        Start adding transactions to see your recent activity
                    </p>
                    <button className="btn btn-primary btn-sm">
                        Add Your First Transaction
                    </button>
                </div>
            )}

            {/* Summary */}
            {recentTransactions.length > 0 && (
                <div className="mt-6 pt-6 border-t border-base-200">
                    <div className="flex items-center justify-between text-sm">
                        <p className="text-base-content/60">
                            Showing {recentTransactions.length} most recent transactions
                        </p>
                        <Link 
                            to="/transactions"
                            className="text-primary hover:underline"
                        >
                            View all transactions →
                        </Link>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RecentTransactions;
