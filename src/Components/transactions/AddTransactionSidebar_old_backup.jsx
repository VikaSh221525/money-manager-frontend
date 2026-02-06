import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Plus, ArrowUpRight, ArrowDownRight, ArrowRightLeft, Upload } from 'lucide-react'
import { useTransactionStore } from '../../store/transactionStore'
import { useAccountStore } from '../../store/accountStore'
import { useCategoryStore } from '../../store/categoryStore'
import { useDashboardStore } from '../../store/dashboardStore'

const AddTransactionSidebar = ({ isOpen, onClose }) => {
    const [transactionType, setTransactionType] = useState('expense');
    const [isRecurring, setIsRecurring] = useState(false);
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
        watch,
        setValue,
        getValues
    } = useForm();

    const { createTransaction, loading } = useTransactionStore();
    const { accounts, getAccounts } = useAccountStore();
    const { categories, getCategories } = useCategoryStore();
    const { getDashboardSummary } = useDashboardStore();

    const watchedAmount = watch('amount');
    const watchedAccount = watch('account');
    const watchedToAccount = watch('toAccount');

    useEffect(() => {
        if (isOpen) {
            getAccounts();
            getCategories();
            reset();
            setTransactionType('expense');
            setIsRecurring(false);
        }
    }, [isOpen, getAccounts, getCategories, reset]);

    const onSubmit = async (data) => {
        const transactionData = {
            ...data,
            type: transactionType,
            amount: parseFloat(data.amount),
            date: new Date(data.date).toISOString(),
            tags: data.tags ? data.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : [],
            isRecurring: isRecurring,
            recurringPattern: isRecurring ? data.recurringPattern : undefined,
        };

        // Remove toAccount for non-transfer transactions
        if (transactionType !== 'transfer') {
            delete transactionData.toAccount;
        }

        // Remove category for transfers
        if (transactionType === 'transfer') {
            delete transactionData.category;
        }

        // Remove recurring pattern if not recurring
        if (!isRecurring) {
            delete transactionData.recurringPattern;
        }

        const success = await createTransaction(transactionData);
        if (success) {
            // Refresh dashboard data
            getDashboardSummary();
            onClose();
            reset();
        }
    };

    const getFilteredCategories = () => {
        if (transactionType === 'transfer') return [];
        return categories.filter(cat => cat.type === transactionType && cat.isActive);
    };

    const getActiveAccounts = () => {
        return accounts.filter(acc => acc.isActive);
    };

    const handleFileUpload = (event) => {
        const files = event.target.files;
        // Placeholder for file upload functionality
        console.log('Files uploaded:', files);
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            {/* Sidebar */}
            <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-base-100 shadow-2xl z-50 overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-base-200 sticky top-0 bg-base-100 z-10">
                    <h3 className="text-lg font-semibold">Add Transaction</h3>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Form Content */}
                <div className="p-4">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        {/* Transaction Type */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Transaction Type</span>
                            </label>
                            <div className="flex gap-2">
                                <button
                                    type="button"
                                    onClick={() => setTransactionType('expense')}
                                    className={`flex-1 btn btn-sm gap-2 ${transactionType === 'expense' ? 'btn-primary' : 'btn-outline'
                                        }`}
                                >
                                    <ArrowDownRight size={16} />
                                    Expense
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTransactionType('income')}
                                    className={`flex-1 btn btn-sm gap-2 ${transactionType === 'income' ? 'btn-primary' : 'btn-outline'
                                        }`}
                                >
                                    <ArrowUpRight size={16} />
                                    Income
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setTransactionType('transfer')}
                                    className={`flex-1 btn btn-sm gap-2 ${transactionType === 'transfer' ? 'btn-primary' : 'btn-outline'
                                        }`}
                                >
                                    <ArrowRightLeft size={16} />
                                    Transfer
                                </button>
                            </div>
                        </div>

                        {/* Title/Description */}
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
                                    minLength: { value: 2, message: 'Title must be at least 2 characters' },
                                    maxLength: { value: 200, message: 'Title cannot exceed 200 characters' }
                                })}
                            />
                            {errors.description && (
                                <label className="label">
                                    <span className="label-text-alt text-error">
                                        {errors.description.message}
                                    </span>
                                </label>
                            )}
                        </div>

                        {/* Amount */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Amount *</span>
                            </label>
                            <div className="input-group">
                                <span className="bg-base-200 border border-r-0 border-base-300 px-3 flex items-center text-sm">
                                    $
                                </span>
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
                                    <span className="label-text-alt text-error">
                                        {errors.amount.message}
                                    </span>
                                </label>
                            )}
                        </div>

                        {/* Category (not for transfers) */}
                        {transactionType !== 'transfer' && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Category *</span>
                                </label>
                                <select
                                    className="select select-bordered select-sm"
                                    {...register('category', {
                                        required: 'Category is required'
                                    })}
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
                                        <span className="label-text-alt text-error">
                                            {errors.category.message}
                                        </span>
                                    </label>
                                )}
                            </div>
                        )}

                        {/* Date */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Date *</span>
                            </label>
                            <input
                                type="datetime-local"
                                className="input input-bordered input-sm"
                                {...register('date', {
                                    required: 'Date is required'
                                })}
                            />
                            {errors.date && (
                                <label className="label">
                                    <span className="label-text-alt text-error">
                                        {errors.date.message}
                                    </span>
                                </label>
                            )}
                        </div>

                        {/* Account */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">From Account *</span>
                            </label>
                            <select
                                className="select select-bordered select-sm"
                                {...register('account', {
                                    required: 'Account is required'
                                })}
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
                                    <span className="label-text-alt text-error">
                                        {errors.account.message}
                                    </span>
                                </label>
                            )}
                        </div>

                        {/* To Account (only for transfers) */}
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
                                        <span className="label-text-alt text-error">
                                            {errors.toAccount.message}
                                        </span>
                                    </label>
                                )}
                            </div>
                        )}

                        {/* Division */}
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Division *</span>
                            </label>
                            <select
                                className="select select-bordered select-sm"
                                {...register('division', {
                                    required: 'Division is required'
                                })}
                            >
                                <option value="">Select division</option>
                                <option value="personal">Personal</option>
                                <option value="office">Office</option>
                            </select>
                            {errors.division && (
                                <label className="label">
                                    <span className="label-text-alt text-error">
                                        {errors.division.message}
                                    </span>
                                </label>
                            )}
                        </div>

                        {/* Tags */}
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
                            <label className="label">
                                <span className="label-text-alt">
                                    e.g., food, restaurant, urgent
                                </span>
                            </label>
                        </div>

                        {/* Recurring Transaction */}
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

                        {/* Recurring Pattern (if recurring) */}
                        {isRecurring && (
                            <div className="form-control">
                                <label className="label">
                                    <span className="label-text">Recurring Pattern *</span>
                                </label>
                                <select
                                    className="select select-bordered select-sm"
                                    {...register('recurringPattern', {
                                        required: 'Pattern is required for recurring transactions'
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
                                        <span className="label-text-alt text-error">
                                            {errors.recurringPattern.message}
                                        </span>
                                    </label>
                                )}
                            </div>
                        )}

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4 sticky bottom-0 bg-base-100 pb-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="btn btn-ghost flex-1 btn-sm"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="btn btn-primary flex-1 btn-sm gap-2"
                                disabled={loading}
                            >
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
