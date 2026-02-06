import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router'
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    PiggyBank,
    Calendar,
    Filter,
    Plus,
    ArrowUpRight,
    ArrowDownRight,
    Wallet
} from 'lucide-react'
import { useDashboardStore } from '../store/dashboardStore'
import { useTransactionStore } from '../store/transactionStore'
import { useAccountStore } from '../store/accountStore'
import { useCategoryStore } from '../store/categoryStore'
import { useAuthStore } from '../store/authStore'
import Navbar from '../Components/common/navbar'
import AddTransactionSidebar from '../Components/transactions/AddTransactionSidebar'
import CreateAccountModal from '../Components/accounts/CreateAccountModal'
import SummaryCards from '../Components/dashboard/SummaryCards'
import TransactionOverviewChart from '../Components/dashboard/TransactionOverviewChart'
import ExpenseBreakdownChart from '../Components/dashboard/ExpenseBreakdownChart'
import RecentTransactions from '../Components/dashboard/RecentTransactions'
import SkeletonLoader from '../Components/common/SkeletonLoader'

function Dashboard() {
    const [searchParams] = useSearchParams();
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [showCreateAccount, setShowCreateAccount] = useState(false);
    const [timeRange, setTimeRange] = useState('month');

    const { user } = useAuthStore();
    console.log("Dashboard component - user from store:", user);

    const {
        summary,
        trends,
        loading,
        getDashboardSummary,
        getDashboardTrends,
        loadDashboardData,
        setTimeRange: setStoreTimeRange
    } = useDashboardStore();

    const { getTransactions, clearFilters } = useTransactionStore();
    const { getAccounts } = useAccountStore();
    const { getCategories } = useCategoryStore();

    // Check if add transaction sidebar should be opened
    useEffect(() => {
        if (searchParams.get('addTransaction') === 'true') {
            setShowAddTransaction(true);
        }
    }, [searchParams]);

    // Load initial data
    useEffect(() => {
        loadDashboardData(timeRange);
        getAccounts();
        getCategories();
        getTransactions();
    }, []);

    // Handle time range change
    const handleTimeRangeChange = (newRange) => {
        setTimeRange(newRange);
        setStoreTimeRange(newRange);
    };

    // Format currency
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    // Calculate percentage change
    const calculatePercentageChange = (current, previous) => {
        if (!previous || previous === 0) return 0;
        return ((current - previous) / previous) * 100;
    };

    if (loading && !summary) {
        return (
            <div className="min-h-screen bg-base-200">
                <Navbar />
                <div className="container mx-auto px-4 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-base-100 rounded-lg p-6">
                                <SkeletonLoader height={120} />
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                        <div className="bg-base-100 rounded-lg p-6">
                            <SkeletonLoader height={300} />
                        </div>
                        <div className="bg-base-100 rounded-lg p-6">
                            <SkeletonLoader height={300} />
                        </div>
                    </div>
                    <div className="bg-base-100 rounded-lg p-6">
                        <SkeletonLoader height={400} />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />

            <div className="container mx-auto px-4 py-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-base-content">
                            Welcome back, {user?.name || 'User'} 👋
                        </h1>
                        <p className="text-base-content/60 mt-1">
                            Here's your financial overview
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-3">
                        {/* Time Range Selector */}
                        <div className="dropdown">
                            <button
                                tabIndex={0}
                                role="button"
                                className="btn btn-outline gap-2"
                            >
                                <Calendar size={18} />
                                {timeRange === 'week' && 'Last 7 Days'}
                                {timeRange === 'month' && 'Last 30 Days'}
                                {timeRange === 'year' && 'This Year'}
                            </button>
                            <ul
                                tabIndex={0}
                                className="dropdown-content z-50 menu p-2 shadow-lg bg-base-100 rounded-box w-52"
                            >
                                <li>
                                    <button
                                        onClick={() => handleTimeRangeChange('week')}
                                        className={timeRange === 'week' ? 'active' : ''}
                                    >
                                        Last 7 Days
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleTimeRangeChange('month')}
                                        className={timeRange === 'month' ? 'active' : ''}
                                    >
                                        Last 30 Days
                                    </button>
                                </li>
                                <li>
                                    <button
                                        onClick={() => handleTimeRangeChange('year')}
                                        className={timeRange === 'year' ? 'active' : ''}
                                    >
                                        This Year
                                    </button>
                                </li>
                            </ul>
                        </div>

                        {/* Add Transaction Button */}
                        <button
                            onClick={() => setShowAddTransaction(true)}
                            className="btn btn-primary gap-2"
                        >
                            <Plus size={18} />
                            Add Transaction
                        </button>

                        {/* Create Account Button */}
                        <button
                            onClick={() => setShowCreateAccount(true)}
                            className="btn btn-outline btn-primary gap-2"
                        >
                            <Wallet size={18} />
                            Create Account
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                <SummaryCards
                    summary={summary}
                    formatCurrency={formatCurrency}
                    calculatePercentageChange={calculatePercentageChange}
                    loading={loading}
                />

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Transaction Overview Chart */}
                    <TransactionOverviewChart
                        trends={trends}
                        loading={loading}
                        formatCurrency={formatCurrency}
                    />

                    {/* Expense Breakdown Chart */}
                    <ExpenseBreakdownChart
                        summary={summary}
                        loading={loading}
                        formatCurrency={formatCurrency}
                    />
                </div>

                {/* Recent Transactions */}
                <RecentTransactions
                    summary={summary}
                    formatCurrency={formatCurrency}
                    loading={loading}
                />
            </div>

            {/* Add Transaction Sidebar */}
            <AddTransactionSidebar
                isOpen={showAddTransaction}
                onClose={() => setShowAddTransaction(false)}
            />

            {/* Create Account Modal */}
            <CreateAccountModal
                isOpen={showCreateAccount}
                onClose={() => setShowCreateAccount(false)}
            />
        </div>
    );
}

export default Dashboard