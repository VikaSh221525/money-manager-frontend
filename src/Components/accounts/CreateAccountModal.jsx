import React, { useState } from 'react';
import { useAccountStore } from '../../store/accountStore';
import { X, Plus } from 'lucide-react';

const CreateAccountModal = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({
        name: '',
        type: 'savings',
        balance: 0,
        currency: 'USD'
    });

    const { createAccount, loading } = useAccountStore();

    const handleSubmit = async (e) => {
        e.preventDefault();
        const success = await createAccount(formData);
        if (success) {
            setFormData({ name: '', type: 'savings', balance: 0, currency: 'USD' });
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

            <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-base-100 rounded-lg shadow-2xl z-50 p-6">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">Create Account</h3>
                    <button onClick={onClose} className="btn btn-ghost btn-sm btn-circle">
                        <X size={18} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Account Name *</span>
                        </label>
                        <input
                            type="text"
                            placeholder="e.g., Chase Checking"
                            className="input input-bordered"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Account Type *</span>
                        </label>
                        <select
                            className="select select-bordered"
                            value={formData.type}
                            onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                        >
                            <option value="savings">Savings Account</option>
                            <option value="checking">Checking Account</option>
                            <option value="cash">Cash/Wallet</option>
                            <option value="credit">Credit Card</option>
                            <option value="investment">Investment</option>
                            <option value="other">Other</option>
                        </select>
                    </div>

                    <div className="form-control">
                        <label className="label">
                            <span className="label-text">Initial Balance *</span>
                        </label>
                        <div className="input-group">
                            <span className="bg-base-200 border border-r-0 border-base-300 px-3 flex items-center">$</span>
                            <input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className="input input-bordered flex-1"
                                value={formData.balance}
                                onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                            />
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="btn btn-ghost flex-1">
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-primary flex-1 gap-2" disabled={loading}>
                            {loading ? (
                                <span className="loading loading-spinner loading-sm"></span>
                            ) : (
                                <Plus size={16} />
                            )}
                            Create Account
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default CreateAccountModal;
