import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { X, Plus, ArrowUpRight, ArrowDownRight, ArrowRightLeft } from 'lucide-react'
import { useTransactionStore } from '../../store/transactionStore'
import { useAccountStore } from '../../store/accountStore'
import { useCategoryStore } from '../../store/categoryStore'

const AddTransactionModal = ({ isOpen, onClose }) => {
    const [transactionType, setTransactionType] = useState('expense');
    const { 
        register, 
        handleSubmit, 
        reset, 
        formState: { errors },
        watch,
        setValue
    } = useForm();

    const { createTransaction, loading } = useTransactionStore();
    const { accounts, getAccounts } = useAccountStore();
    const { categories, getCategories } = useCategoryStore();

    const watchedAmount = watch('amount');
    const watchedAccount = watch('account');
    const watchedToAccount = watch('toAccount');

    useEffect(() => {
        if (isOpen) {
            getAccounts();
            getCategories();
            reset();
            setTransactionType('expense');
        }
    }, [isOpen, getAccounts, getCategories, reset]);

    const onSubmit = async (data) => {
        const transactionData = {
            ...data,
            type: transactionType,
            amount: parseFloat(data.amount),
            date: new Date(data.date).toISOString(),
        };

        // Remove toAccount for non-transfer transactions
        if (transactionType !== 'transfer') {
            delete transactionData.toAccount;
        }

        // Remove category for transfers
        if (transactionType === 'transfer') {
            delete transactionData.category;
        }

        const success = await createTransaction(transactionData);
        if (success) {
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

    if (!isOpen) return null;

    return (
        <div className="modal modal-open">
            <div className="modal-box max-w-2xl">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold">Add Transaction</h3>
                    <button
                        onClick={onClose}
                        className="btn btn-ghost btn-sm btn-circle"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Transaction Type Tabs */}
                <div className="tabs tabs-boxed mb-6">
                    <button
                        className={`tab tab-md flex-1 gap-2 ${
                            transactionType === 'expense' ? 'tab-active' : ''
                        }`}
                        onClick={() => setTransactionType('expense')}
                    >
                        <ArrowDownRight size={16} />
                        Expense
                    </button>
                    <button
                        className={`tab tab-md flex-1 gap-2 ${
                            transactionType === 'income' ? 'tab-active' : ''
                        }`}
                        onClick={() => setTransactionType('income')}
                    >
                        <ArrowUpRight size={16} />
                        Income
                    </button>
                    <button
                        className={`tab tab-md flex-1 gap-2 ${
                            transactionType === 'transfer' ? 'tab-active' : ''
                        }`}
                        onClick={() => setTransactionType('transfer')}
                    >
                        <ArrowRightLeft size={16} />
                        Transfer
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Amount */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Amount *</span>
                        </label>
                        <div className="input-group">
                            <span className="bg-base-200 border border-r-0 border-base-300 px-3 flex items-center">
                                $
                            </span>
                            <input
                                type="number"
                                step="0.01"
                                min="0.01"
                                placeholder="0.00"
                                className="input input-bordered flex-1"
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

                    {/* Description */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Description *</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter description"
                            className="input input-bordered"
                            {...register('description', { 
                                required: 'Description is required',
                                minLength: { value: 2, message: 'Description must be at least 2 characters' }
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

                    {/* Category (not for transfers) */}
                    {transactionType !== 'transfer' && (
                        <div className="form-control">
                            <label className="label">
                                <span className="label-text">Category *</span>
                            </label>
                            <select
                                className="select select-bordered"
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

                    {/* Account */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">From Account *</span>
                        </label>
                        <select
                            className="select select-bordered"
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
                                className="select select-bordered"
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
                            className="select select-bordered"
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

                    {/* Date */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Date & Time *</span>
                        </label>
                        <input
                            type="datetime-local"
                            className="input input-bordered"
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

                    {/* Tags */}
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Tags (optional)</span>
                        </label>
                        <input
                            type="text"
                            placeholder="Enter tags separated by commas"
                            className="input input-bordered"
                            {...register('tags')}
                        />
                        <label className="label">
                            <span className="label-text-alt">
                                e.g., food, restaurant, urgent
                            </span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="btn btn-ghost flex-1"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="btn btn-primary flex-1 gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                <Plus size={18} />
                            )}
                            Add {transactionType.charAt(0).toUpperCase() + transactionType.slice(1)}
                        </button>
                    </div>
                </form>
            </div>

            {/* Backdrop */}
            <div 
                className="modal-backdrop"
                onClick={onClose}
            />
        </div>
    );
};

export default AddTransactionModal;
