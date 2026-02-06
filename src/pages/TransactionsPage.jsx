import React from 'react'
import Navbar from '../Components/common/navbar'

function TransactionsPage() {
    return (
        <div className="min-h-screen bg-base-200">
            <Navbar />
            <div className="container mx-auto px-4 py-6">
                <h1 className="text-3xl font-bold text-base-content mb-6">
                    Transactions
                </h1>
                <div className="bg-base-100 rounded-lg p-6 shadow-sm">
                    <p className="text-base-content/60">
                        Transactions page will be implemented here.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default TransactionsPage;
