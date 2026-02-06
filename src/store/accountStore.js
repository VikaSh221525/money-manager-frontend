import { create } from "zustand";
import axios from "../utils/axios";
import toast from "react-hot-toast";

export const useAccountStore = create((set, get) => ({
    accounts: [],
    loading: false,
    error: null,

    // Get all accounts
    getAccounts: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get("/accounts");
            console.log("Accounts API response:", res.data);
            // Backend returns { accounts: [...] }
            const accountsArray = res.data.accounts || res.data || [];
            console.log("Parsed accounts array:", accountsArray);
            set({ accounts: accountsArray });
        } catch (err) {
            console.error("Get accounts error:", err);
            set({ error: err.response?.data?.message || "Failed to fetch accounts" });
            toast.error(err.response?.data?.message || "Failed to fetch accounts");
        } finally {
            set({ loading: false });
        }
    },

    // Create new account
    createAccount: async (accountData) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.post("/accounts", accountData);
            set((state) => ({
                accounts: [...state.accounts, res.data],
                loading: false
            }));
            toast.success("Account created successfully ✅");
            return res.data;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to create account" });
            toast.error(err.response?.data?.message || "Failed to create account");
            set({ loading: false });
            return null;
        }
    },

    // Update account
    updateAccount: async (id, accountData) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.put(`/accounts/${id}`, accountData);
            set((state) => ({
                accounts: state.accounts.map(acc =>
                    acc._id === id ? res.data : acc
                ),
                loading: false
            }));
            toast.success("Account updated successfully ✅");
            return res.data;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to update account" });
            toast.error(err.response?.data?.message || "Failed to update account");
            set({ loading: false });
            return null;
        }
    },

    // Delete account
    deleteAccount: async (id) => {
        set({ loading: true, error: null });
        try {
            await axios.delete(`/accounts/${id}`);
            set((state) => ({
                accounts: state.accounts.filter(acc => acc._id !== id),
                loading: false
            }));
            toast.success("Account deleted successfully ✅");
            return true;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to delete account" });
            toast.error(err.response?.data?.message || "Failed to delete account");
            set({ loading: false });
            return false;
        }
    },

    // Get account by ID
    getAccountById: (id) => {
        const { accounts } = get();
        return accounts.find(acc => acc._id === id);
    },

    // Get total balance across all accounts
    getTotalBalance: () => {
        const { accounts } = get();
        return accounts
            .filter(acc => acc.isActive)
            .reduce((total, acc) => total + acc.balance, 0);
    },

    // Get accounts by type
    getAccountsByType: (type) => {
        const { accounts } = get();
        return accounts.filter(acc => acc.type === type && acc.isActive);
    }
}));
