// Export all stores from a single location
export { useAuthStore } from './authStore';
export { useAccountStore } from './accountStore';
export { useCategoryStore } from './categoryStore';
export { useTransactionStore } from './transactionStore';
export { useDashboardStore } from './dashboardStore';

// Optional: Create a combined store hook if needed
export const useAppStore = () => {
    const authStore = useAuthStore();
    const accountStore = useAccountStore();
    const categoryStore = useCategoryStore();
    const transactionStore = useTransactionStore();
    const dashboardStore = useDashboardStore();

    return {
        auth: authStore,
        accounts: accountStore,
        categories: categoryStore,
        transactions: transactionStore,
        dashboard: dashboardStore
    };
};
