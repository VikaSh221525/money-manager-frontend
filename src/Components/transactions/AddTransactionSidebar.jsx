import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Plus, ArrowUpRight, ArrowDownRight, ArrowRightLeft } from 'lucide-react'
import { useTransactionStore } from '../../store/transactionStore'
import { useAccountStore } from '../../store/accountStore'
import { useCategoryStore } from '../../store/categoryStore'
import { useDashboardStore } from '../../store/dashboardStore'

const AddTransactionSidebar = ({ isOpen, onClose, editingTransaction = null }) => {
    const [transactionType, setTransactionType] = useState('expense');
    const [isRecurring, setIsRecurring] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
        watch
    } = useForm();

    const { createTransaction, updateTransaction, loading, getTransactions } = useTransactionStore();
    const { accounts, getAccounts } = useAccountStore();
    const { categories, getCategories } = useCategoryStore();
    const { getDashboardSummary, loadDashboardData, timeRange } = useDashboardStore();

    const watchedAccount = watch('account');

    useEffect(() => {
        if (isOpen) {
            getAccounts();
            getCategories();
            
            if (editingTransaction) {
                // Populate form with editing transaction data
                setTransactionType(editingTransaction.type);
                setIsRecurring(editingTransaction.isRecurring || false);
                
                // Format date for datetime-local input
                const date = new Date(editingTransaction.date);
                const localDateTime = new Date(date.getTime() - date.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
                
                reset({
                    description: editingTransaction.description,
                    amount: editingTransaction.amount,
                    category: editingTransaction.category?._id || '',
                    account: editingTransaction.account?._id || '',
                    toAccount: editingTransaction.toAccount?._id || '',
                    division: editingTransaction.division,
                    date: localDateTime,
                    tags: editingTransaction.tags?.join(', ') || '',
                    recurringPattern: editingTransaction.recurringPattern || ''
                });
            } else {
                // Set default date to current date/time for new transactions
                const now = new Date();
                const localDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                    .toISOString()
                    .slice(0, 16);
                reset({
                    date: localDateTime
                });
                setTransactionType('expense');
                setIsRecurring(false);
            }
        }
    }, [isOpen, editingTransaction, getAccounts, getCategories, reset]);

    const onSubmit = async (data) => {
        console.log("Form data before processing:", data);
        
        const transactionData = {
            type: transactionType,
            amount: parseFloat(data.amount),
            description: data.description,
            date: data.date,
            division: data.division,
            account: data.account,
            tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            isRecurring: isRecurring
        };

        // Add category for income/expense
        if (transactionType !== 'transfer') {
            transactionData.category = data.category;
        }

        // Add toAccount for transfers
        if (transactionType === 'transfer') {
            transactionData.toAccount = data.toAccount;
        }

        // Add recurring pattern if recurring is enabled
        if (isRecurring && data.recurringPattern) {
            transactionData.recurringPattern = data.recurringPattern;
        }

        console.log("Transaction data being sent to API:", transactionData);

        let success;
        if (editingTransaction) {
            // Update existing transaction
            success = await updateTransaction(editingTransaction._id, transactionData);
        } else {
            // Create new transaction
            success = await createTransaction(transactionData);
        }

        if (success) {
            // Reload all data to reflect the changes
            await Promise.all([
                loadDashboardData(timeRange),
                getTransactions()
            ]);
            onClose();
            reset();
        }
    };

    const getFilteredCategories = () => {
        if (transactionType === 'transfer') return [];
        if (!Array.isArray(categories)) return [];
        return categories.filter(cat => cat.type === transactionType && cat.isActive);
    };

    const getActiveAccounts = () => {
        if (!Array.isArray(accounts)) return [];
        return accounts.filter(acc => acc.isActive);
    };

    if (!isOpen) return null;

    return (
        <>
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-base-100 shadow-2xl z-50 overflow-y-auto">
                <div className="flex items-center justify-between p-4 border-b border-base-200 sticky top-0 bg-base-100 z-10">
                    <h3 className="text-lg font-semibold">
                        {editingTransaction ? 'Edit Transaction' : 'Add Transaction'}
                    </h3>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Transaction Type</span>
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTransactionType('expense')}
                                    className={`flex-1 btn btn-sm gap-2 ${transactionType === 'expense' ? 'btn-primary' : 'btn-outline'}`}
                                >
                                    <ArrowDownRight size={16} />
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTransactionType('income')}
                                    className={`flex-1 btn btn-sm gap-2 ${transactionType === 'income' ? 'btn-primary' : 'btn-outline'}`}
                                >
                                    <ArrowUpRight size={16} />
                                    Income
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTransactionType('transfer')}
                                    className={`flex-1 btn btn-sm gap-2 ${transactionType === 'transfer' ? 'btn-primary' : 'btn-outline'}`}
                                >
                                    <ArrowRightLeft size={16} />
                                    Transfer
                                </button>
                            </div>
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Title *</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter transaction title"
                                className="input input-bordered input-sm"
                                {...register('description', {
                                    required: 'Title is required',
                                    minLength: { value: 2, message: 'Title must be at least 2 characters' }
                                })}
                            />
                            {errors.description && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.description.message}</span>
                                </label>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Amount *</span>
                            </label>
                            <div className="input-group">
                                <span className="bg-base-200 border border-r-0 border-base-300 px-3 flex items-center text-sm">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="0.00"
                                    className="input input-bordered input-sm flex-1"
                                    {...register('amount', {
                                        required: 'Amount is required',
                                        min: { value: 0.01, message: 'Amount must be greater than 0' }
                                    })}
                                />
                            </div>
                            {errors.amount && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.amount.message}</span>
                                </label>
                            )}
                        </div>

                        {transactionType !== 'transfer' && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Category *</span>
                                </label>
                                <select
                                    className="select select-bordered select-sm"
                                    {...register('category', { required: 'Category is required' })}
                                >
                                    <option value="">Select a category</option>
                                    {getFilteredCategories().map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.icon} {category.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.category && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.category.message}</span>
                                    </label>
                                )}
                            </div>
                        )}

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Date *</span>
                            </label>
                            <input
                                type="datetime-local"
                                className="input input-bordered input-sm"
                                {...register('date', { required: 'Date is required' })}
                            />
                            {errors.date && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.date.message}</span>
                                </label>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">From Account *</span>
                            </label>
                            <select
                                className="select select-bordered select-sm"
                                {...register('account', { required: 'Account is required' })}
                            >
                                <option value="">Select an account</option>
                                {getActiveAccounts().map((account) => (
                                    <option key={account._id} value={account._id}>
                                        {account.name} ({account.type}) - ${account.balance.toFixed(2)}
                                    </option>
                                ))}
                            </select>
                            {errors.account && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.account.message}</span>
                                </label>
                            )}
                        </div>

                        {transactionType === 'transfer' && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">To Account *</span>
                                </label>
                                <select
                                    className="select select-bordered select-sm"
                                    {...register('toAccount', {
                                        required: 'Destination account is required',
                                        validate: value => value !== watchedAccount || 'Cannot transfer to same account'
                                    })}
                                >
                                    <option value="">Select destination account</option>
                                    {getActiveAccounts()
                                        .filter(acc => acc._id !== watchedAccount)
                                        .map((account) => (
                                            <option key={account._id} value={account._id}>
                                                {account.name} ({account.type}) - ${account.balance.toFixed(2)}
                                            </option>
                                        ))}
                                </select>
                                {errors.toAccount && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.toAccount.message}</span>
                                    </label>
                                )}
                            </div>
                        )}

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Division *</span>
                            </label>
                            <select
                                className="select select-bordered select-sm"
                                {...register('division', { required: 'Division is required' })}
                            >
                                <option value="">Select division</option>
                                <option value="personal">Personal</option>
                                <option value="office">Office</option>
                            </select>
                            {errors.division && (
                                <label className="label">
                                    <span className="label-text-alt text-error">{errors.division.message}</span>
                                </label>
                            )}
                        </div>

                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Tags (optional)</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Enter tags separated by commas"
                                className="input input-bordered input-sm"
                                {...register('tags')}
                            />
                        </div>

                        <div className="form-control">
                            <label className="label cursor-pointer">
                                <span className="label-text">Recurring Transaction</span>
                                <input
                                    type="checkbox"
                                    className="toggle toggle-sm"
                                    checked={isRecurring}
                                    onChange={(e) => setIsRecurring(e.target.checked)}
                                />
                            </label>
                        </div>

                        {isRecurring && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Recurring Pattern *</span>
                                </label>
                                <select
                                    className="select select-bordered select-sm"
                                    {...register('recurringPattern', { 
                                        required: isRecurring ? 'Pattern is required for recurring transactions' : false 
                                    })}
                                >
                                    <option value="">Select pattern</option>
                                    <option value="daily">Daily</option>
                                    <option value="weekly">Weekly</option>
                                    <option value="monthly">Monthly</option>
                                    <option value="yearly">Yearly</option>
                                </select>
                                {errors.recurringPattern && (
                                    <label className="label">
                                        <span className="label-text-alt text-error">{errors.recurringPattern.message}</span>
                                    </label>
                                )}
                            </div>
                        )}

                        <div className="flex gap-3 pt-4 sticky bottom-0 bg-base-100 pb-4">
                            <button type="button" onClick={onClose} className="btn btn-ghost flex-1 btn-sm">
                                Cancel
                            </button>
                            <button type="submit" className="btn btn-primary flex-1 btn-sm gap-2" disabled={loading}>
                                {loading ? (
                                    <span className="loading loading-spinner loading-sm"></span>
                                ) : (
                                    <Plus size={16} />
                                )}
                                Save
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default AddTransactionSidebar;
