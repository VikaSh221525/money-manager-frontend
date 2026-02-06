import { create } from "zustand";
import axios from "../utils/axios";
import toast from "react-hot-toast";

export const useCategoryStore = create((set, get) => ({
    categories: [],
    summary: null,
    loading: false,
    error: null,

    // Get all categories
    getCategories: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get("/categories");
            console.log("Categories API response:", res.data);

            // Backend returns { categories: { income: [...], expense: [...] }, total: X }
            // We need to flatten it into a single array
            let categoriesArray = [];
            if (res.data.categories) {
                if (Array.isArray(res.data.categories)) {
                    // If it's already an array
                    categoriesArray = res.data.categories;
                } else if (typeof res.data.categories === 'object') {
                    // If it's grouped by type {income: [...], expense: [...]}
                    categoriesArray = [
                        ...(res.data.categories.income || []),
                        ...(res.data.categories.expense || [])
                    ];
                }
            }

            console.log("Parsed categories array:", categoriesArray);
            set({ categories: categoriesArray });
        } catch (err) {
            console.error("Get categories error:", err);
            set({ error: err.response?.data?.message || "Failed to fetch categories" });
            toast.error(err.response?.data?.message || "Failed to fetch categories");
        } finally {
            set({ loading: false });
        }
    },

    // Create new category
    createCategory: async (categoryData) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.post("/categories", categoryData);
            set((state) => ({
                categories: [...state.categories, res.data],
                loading: false
            }));
            toast.success("Category created successfully ✅");
            return res.data;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to create category" });
            toast.error(err.response?.data?.message || "Failed to create category");
            set({ loading: false });
            return null;
        }
    },

    // Update category
    updateCategory: async (id, categoryData) => {
        set({ loading: true, error: null });
        try {
            const res = await axios.put(`/categories/${id}`, categoryData);
            set((state) => ({
                categories: state.categories.map(cat =>
                    cat._id === id ? res.data : cat
                ),
                loading: false
            }));
            toast.success("Category updated successfully ✅");
            return res.data;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to update category" });
            toast.error(err.response?.data?.message || "Failed to update category");
            set({ loading: false });
            return null;
        }
    },

    // Delete category
    deleteCategory: async (id) => {
        set({ loading: true, error: null });
        try {
            await axios.delete(`/categories/${id}`);
            set((state) => ({
                categories: state.categories.filter(cat => cat._id !== id),
                loading: false
            }));
            toast.success("Category deleted successfully ✅");
            return true;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to delete category" });
            toast.error(err.response?.data?.message || "Failed to delete category");
            set({ loading: false });
            return false;
        }
    },

    // Get category summary (spending analysis)
    getCategorySummary: async () => {
        set({ loading: true, error: null });
        try {
            const res = await axios.get("/categories/summary");
            set({ summary: res.data, loading: false });
            return res.data;
        } catch (err) {
            set({ error: err.response?.data?.message || "Failed to fetch category summary" });
            toast.error(err.response?.data?.message || "Failed to fetch category summary");
            set({ loading: false });
            return null;
        }
    },

    // Get categories by type (income/expense)
    getCategoriesByType: (type) => {
        const { categories } = get();
        return categories.filter(cat => cat.type === type && cat.isActive);
    },

    // Get income categories
    getIncomeCategories: () => {
        return get().getCategoriesByType("income");
    },

    // Get expense categories
    getExpenseCategories: () => {
        return get().getCategoriesByType("expense");
    },

    // Get category by ID
    getCategoryById: (id) => {
        const { categories } = get();
        return categories.find(cat => cat._id === id);
    },

    // Get default categories (can't be deleted)
    getDefaultCategories: () => {
        const { categories } = get();
        return categories.filter(cat => cat.isDefault && cat.isActive);
    },

    // Get custom categories (user created)
    getCustomCategories: () => {
        const { categories } = get();
        return categories.filter(cat => !cat.isDefault && cat.isActive);
    }
}));
