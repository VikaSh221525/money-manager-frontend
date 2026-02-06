import React, { useEffect, useState } from 'react'
import { 
    Search, 
    Filter, 
    Download, 
    Plus,
    Edit,
    Trash2,
    ArrowUpDown,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import Navbar from '../Components/common/navbar'
import AddTransactionSidebar from '../Components/transactions/AddTransactionSidebar'
import { useTransactionStore } from '../store/transactionStore'
import { useCategoryStore } from '../store/categoryStore'
import { useAccountStore } from '../store/accountStore'

function TransactionsPage() {
    const [showAddTransaction, setShowAddTransaction] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        category: '',
        account: '',
        division: '',
        startDate: '',
        endDate: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [sortField, setSortField] = useState('date');
    const [sortOrder, setSortOrder] = useState('desc');
    const itemsPerPage = 10;

    const { transactions, loading, getTransactions, deleteTransaction } = useTransactionStore();
    const { categories, getCategories } = useCategoryStore();
    const { accounts, getAccounts } = useAccountStore();

    useEffect(() => {
        getTransactions();
        getCategories();
        getAccounts();
    }, []);

    // Filter and search transactions
    const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = transaction.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = !filters.type || transaction.type === filters.type;
        const matchesCategory = !filters.category || transaction.category?._id === filters.category;
        const matchesAccount = !filters.account || transaction.account?._id === filters.account;
        const matchesDivision = !filters.division || transaction.division === filters.division;
        
        let matchesDateRange = true;
        if (filters.startDate) {
            matchesDateRange = matchesDateRange && new Date(transaction.date) >= new Date(filters.startDate);
        }
        if (filters.endDate) {
            matchesDateRange = matchesDateRange && new Date(transaction.date) <= new Date(filters.endDate);
        }

        return matchesSearch && matchesType && matchesCategory && matchesAccount && matchesDivision && matchesDateRange;
    });

    // Sort transactions
    const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        let aValue = a[sortField];
        let bValue = b[sortField];

        if (sortField === 'date') {
            aValue = new Date(aValue);
            bValue = new Date(bValue);
        }

        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    // Pagination
    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedTransactions = sortedTransactions.slice(startIndex, startIndex + itemsPerPage);

    const handleSort = (field) => {
        if (sortField === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortOrder('desc');
        }
    };

    const handleEdit = (transaction) => {
        setEditingTransaction(transaction);
        setShowAddTransaction(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this transaction?')) {
            await deleteTransaction(id);
            getTransactions();
        }
    };

    const handleClearFilters = () => {
        setFilters({
            type: '',
            category: '',
            account: '',
            division: '',
            startDate: '',
            endDate: ''
        });
        setSearchQuery('');
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getTypeColor = (type) => {
        switch (type) {
            case 'income':
                return 'badge-success';
            case 'expense':
                return 'badge-error';
            case 'transfer':
                return 'badge-info';
            default:
                return 'badge-ghost';
        }
    };

    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />

            <div className="container mx-auto px-4 py-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-base-content">Transactions</h1>
                        <p className="text-base-content/60 mt-1">
                            Manage and track all your transactions
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            setEditingTransaction(null);
                            setShowAddTransaction(true);
                        }}
                        className="btn btn-primary gap-2"
                    >
                        <Plus size={18} />
                        Add Transaction
                    </button>
                </div>

                {/* Search and Filters */}
                <div className="bg-base-100 rounded-lg p-6 shadow-sm mb-6">
                    {/* Search Bar */}
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-base-content/40" size={20} />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                className="input input-bordered w-full pl-10"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Filters Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                        {/* Type Filter */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-xs font-medium">Type</span>
                            </label>
                            <select
                                className="select select-bordered select-sm"
                                value={filters.type}
                                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                            >
                                <option value="">All Types</option>
                                <option value="income">Income</option>
                                <option value="expense">Expense</option>
                                <option value="transfer">Transfer</option>
                            </select>
                        </div>

                        {/* Category Filter */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-xs font-medium">Category</span>
                            </label>
                            <select
                                className="select select-bordered select-sm"
                                value={filters.category}
                                onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                            >
                                <option value="">All Categories</option>
                                {categories.map((category) => (
                                    <option key={category._id} value={category._id}>
                                        {category.icon} {category.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Division Filter */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-xs font-medium">Division</span>
                            </label>
                            <select
                                className="select select-bordered select-sm"
                                value={filters.division}
                                onChange={(e) => setFilters({ ...filters, division: e.target.value })}
                            >
                                <option value="">All Divisions</option>
                                <option value="personal">Personal</option>
                                <option value="office">Office</option>
                            </select>
                        </div>

                        {/* Start Date */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-xs font-medium">Start Date</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered input-sm"
                                value={filters.startDate}
                                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                            />
                        </div>

                        {/* End Date */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text text-xs font-medium">End Date</span>
                            </label>
                            <input
                                type="date"
                                className="input input-bordered input-sm"
                                value={filters.endDate}
                                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Filter Actions and Results Count */}
                    <div className="flex flex-wrap justify-between items-center mt-4 pt-4 border-t border-base-200">
                        <button
                            onClick={handleClearFilters}
                            className="btn btn-ghost btn-sm gap-2"
                        >
                            <Filter size={16} />
                            Clear Filters
                        </button>

                        <div className="text-sm text-base-content/60">
                            Showing <span className="font-semibold text-base-content">{paginatedTransactions.length}</span> of <span className="font-semibold text-base-content">{filteredTransactions.length}</span> transactions
                        </div>
                    </div>
                </div>

                {/* Transactions Table */}
                <div className="bg-base-100 rounded-lg shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="table table-zebra w-full">
                            <thead>
                                <tr>
                                    <th>
                                        <button
                                            onClick={() => handleSort('date')}
                                            className="flex items-center gap-1 hover:text-primary"
                                        >
                                            Date
                                            <ArrowUpDown size={14} />
                                        </button>
                                    </th>
                                    <th>Description</th>
                                    <th>Category</th>
                                    <th>
                                        <button
                                            onClick={() => handleSort('type')}
                                            className="flex items-center gap-1 hover:text-primary"
                                        >
                                            Type
                                            <ArrowUpDown size={14} />
                                        </button>
                                    </th>
                                    <th>
                                        <button
                                            onClick={() => handleSort('amount')}
                                            className="flex items-center gap-1 hover:text-primary"
                                        >
                                            Amount
                                            <ArrowUpDown size={14} />
                                        </button>
                                    </th>
                                    <th>Account</th>
                                    <th>Division</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-8">
                                            <span className="loading loading-spinner loading-lg"></span>
                                        </td>
                                    </tr>
                                ) : paginatedTransactions.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="text-center py-8 text-base-content/60">
                                            No transactions found
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedTransactions.map((transaction) => (
                                        <tr key={transaction._id} className="hover">
                                            <td>{formatDate(transaction.date)}</td>
                                            <td className="font-medium">{transaction.description}</td>
                                            <td>
                                                {transaction.category ? (
                                                    <span>
                                                        {transaction.category.icon} {transaction.category.name}
                                                    </span>
                                                ) : (
                                                    <span className="text-base-content/40">N/A</span>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge ${getTypeColor(transaction.type)} badge-sm`}>
                                                    {transaction.type}
                                                </span>
                                            </td>
                                            <td className={`font-semibold ${
                                                transaction.type === 'income' ? 'text-green-600' :
                                                transaction.type === 'expense' ? 'text-red-600' :
                                                'text-blue-600'
                                            }`}>
                                                {transaction.type === 'income' && '+'}
                                                {transaction.type === 'expense' && '-'}
                                                {formatCurrency(transaction.amount)}
                                            </td>
                                            <td>{transaction.account?.name || 'N/A'}</td>
                                            <td>
                                                <span className={`badge badge-sm ${
                                                    transaction.division === 'office' ? 'badge-info' : 'badge-secondary'
                                                }`}>
                                                    {transaction.division}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => handleEdit(transaction)}
                                                        className="btn btn-ghost btn-xs"
                                                        title="Edit"
                                                    >
                                                        <Edit size={14} />
                                                    </button>
                                                    {transaction.isEditable && (
                                                        <button
                                                            onClick={() => handleDelete(transaction._id)}
                                                            className="btn btn-ghost btn-xs text-error"
                                                            title="Delete"
                                                        >
                                                            <Trash2 size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center gap-2 p-4 border-t border-base-200">
                            <button
                                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                                disabled={currentPage === 1}
                                className="btn btn-sm btn-ghost"
                            >
                                <ChevronLeft size={18} />
                            </button>

                            <div className="flex gap-1">
                                {[...Array(totalPages)].map((_, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentPage(index + 1)}
                                        className={`btn btn-sm ${
                                            currentPage === index + 1 ? 'btn-primary' : 'btn-ghost'
                                        }`}
                                    >
                                        {index + 1}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                                disabled={currentPage === totalPages}
                                className="btn btn-sm btn-ghost"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Add/Edit Transaction Sidebar */}
            <AddTransactionSidebar
                isOpen={showAddTransaction}
                onClose={() => {
                    setShowAddTransaction(false);
                    setEditingTransaction(null);
                }}
                editingTransaction={editingTransaction}
            />
        </div>
    );
}

export default TransactionsPage;
