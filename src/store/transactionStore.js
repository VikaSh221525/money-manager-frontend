import { create } from "zustand";
import axios from "../utils/axios";
import toast from "react-hot-toast";

export const useTransactionStore = create((set, get) => ({
    transactions: [],
    filteredTransactions: [],
    loading: false,
    error: null,
    filters: {
        category: "",
        account: "",
        division: "",
        startDate: "",
        endDate: "",
        type: "",
        search: ""
    },

    // Get all transactions with optional filters
    getTransactions: async (filters = {}) => {
        set({ loading: true, error: null });
        try {
            const params = new URLSearchParams();
            
            // Add filters to query params
            Object.keys(filters).forEach(key => {
                if (filters[key]) {
                    params.append(key, filters[key]);
                }
            });

            const url = params.toString() ? `/transactions?${params.toString()}` : "/transactions";
            const res = await axios.get(url);
            
            // Backend returns { transactions: [...], pagination: {...} }
            const transactionsArray = res.data.transactions || [];
            
            set({ 
                transactions: transactionsArray,
                filteredTransactions: transactionsArray,
                filters: { ...get().filters, ...filters },
                loading: false 
            });
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to fetch transactions" });
            toast.error(err.response?.data?.message || "Failed to fetch transactions");
            set({ loading: false });
        }
    },

    // Create new transaction
    createTransaction: async (transactionData) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.post("/transactions", transactionData);
            // Backend returns { message: "...", transaction: {...} }
            const transaction = res.data.transaction || res.data;
            
            set((state) => ({ 
                transactions: Array.isArray(state.transactions) ? [transaction, ...state.transactions] : [transaction],
                filteredTransactions: Array.isArray(state.filteredTransactions) ? [transaction, ...state.filteredTransactions] : [transaction],
                loading: false 
            }));
            toast.success("Transaction added successfully ✅");
            return transaction;
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to add transaction";
            set({ error: errorMessage });
            toast.error(errorMessage);
            set({ loading: false });
            console.error("Transaction creation error:", err.response?.data || err);
            return null;
        }
    },

    // Update transaction (only within 12 hours)
    updateTransaction: async (id, transactionData) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.put(`/transactions/${id}`, transactionData);
            // Backend returns { message: "...", transaction: {...} }
            const transaction = res.data.transaction || res.data;
            
            set((state) => ({
                transactions: state.transactions.map(tx => 
                    tx._id === id ? transaction : tx
                ),
                filteredTransactions: state.filteredTransactions.map(tx => 
                    tx._id === id ? transaction : tx
                ),
                loading: false
            }));
            toast.success("Transaction updated successfully ✅");
            return transaction;
        } catch (err) {
            const errorMessage = err.response?.data?.message || "Failed to update transaction";
            set({ error: errorMessage });
            toast.error(errorMessage);
            set({ loading: false });
            console.error("Transaction update error:", err.response?.data || err);
            return null;
        }
    },

    // Delete transaction
    deleteTransaction: async (id) => {
        set({ loading: true, error: null });
        try {
            await axios.delete(`/transactions/${id}`);
            set((state) => ({
                transactions: state.transactions.filter(tx => tx._id !== id),
                filteredTransactions: state.filteredTransactions.filter(tx => tx._id !== id),
                loading: false
            }));
            toast.success("Transaction deleted successfully ✅");
            return true;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to delete transaction" });
            toast.error(err.response?.data?.message || "Failed to delete transaction");
            set({ loading: false });
            return false;
        }
    },

    // Apply filters locally
    applyFilters: (newFilters) => {
        const { transactions } = get();
        const updatedFilters = { ...get().filters, ...newFilters };
        
        let filtered = [...transactions];

        // Filter by type
        if (updatedFilters.type) {
            filtered = filtered.filter(tx => tx.type === updatedFilters.type);
        }

        // Filter by category
        if (updatedFilters.category) {
            filtered = filtered.filter(tx => tx.category === updatedFilters.category);
        }

        // Filter by account
        if (updatedFilters.account) {
            filtered = filtered.filter(tx => tx.account === updatedFilters.account);
        }

        // Filter by division
        if (updatedFilters.division) {
            filtered = filtered.filter(tx => tx.division === updatedFilters.division);
        }

        // Filter by date range
        if (updatedFilters.startDate) {
            const startDate = new Date(updatedFilters.startDate);
            filtered = filtered.filter(tx => new Date(tx.date) >= startDate);
        }

        if (updatedFilters.endDate) {
            const endDate = new Date(updatedFilters.endDate);
            filtered = filtered.filter(tx => new Date(tx.date) <= endDate);
        }

        // Filter by search (description)
        if (updatedFilters.search) {
            const searchLower = updatedFilters.search.toLowerCase();
            filtered = filtered.filter(tx => 
                tx.description.toLowerCase().includes(searchLower)
            );
        }

        set({ 
            filteredTransactions: filtered,
            filters: updatedFilters 
        });
    },

    // Clear all filters
    clearFilters: () => {
        set({ 
            filteredTransactions: get().transactions,
            filters: {
                category: "",
                account: "",
                division: "",
                startDate: "",
                endDate: "",
                type: "",
                search: ""
            }
        });
    },

    // Get transaction by ID
    getTransactionById: (id) => {
        const { transactions } = get();
        return transactions.find(tx => tx._id === id);
    },

    // Check if transaction is editable (within 12 hours)
    isTransactionEditable: (transactionDate) => {
        const now = new Date();
        const txDate = new Date(transactionDate);
        const hoursDiff = (now - txDate) / (1000 * 60 * 60);
        return hoursDiff <= 12;
    },

    // Get transactions by type
    getTransactionsByType: (type) => {
        const { filteredTransactions } = get();
        return filteredTransactions.filter(tx => tx.type === type);
    },

    // Get income transactions
    getIncomeTransactions: () => {
        return get().getTransactionsByType("income");
    },

    // Get expense transactions
    getExpenseTransactions: () => {
        return get().getTransactionsByType("expense");
    },

    // Get transfer transactions
    getTransferTransactions: () => {
        return get().getTransactionsByType("transfer");
    },

    // Calculate total income
    getTotalIncome: () => {
        const incomeTransactions = get().getIncomeTransactions();
        return incomeTransactions.reduce((total, tx) => total + tx.amount, 0);
    },

    // Calculate total expenses
    getTotalExpenses: () => {
        const expenseTransactions = get().getExpenseTransactions();
        return expenseTransactions.reduce((total, tx) => total + tx.amount, 0);
    },

    // Calculate net balance (income - expenses)
    getNetBalance: () => {
        return get().getTotalIncome() - get().getTotalExpenses();
    }
}));
