import React, { useState } from 'react';
import axios from '../../utils/axios';
import toast from 'react-hot-toast';
import { useCategoryStore } from '../../store/categoryStore';

const InitializeCategoriesButton = () => {
    const [loading, setLoading] = useState(false);
    const { getCategories } = useCategoryStore();

    const initializeCategories = async () => {
        setLoading(true);
        try {
            const response = await axios.post('/categories/initialize');
            console.log('Initialize categories response:', response.data);

            toast.success('✅ Default categories created successfully!');

            // Refresh categories
            await getCategories();
        } catch (error) {
            console.error('Error initializing categories:', error);

            if (error.response?.status === 400) {
                toast.error('Categories already exist for this user');
            } else {
                toast.error(error.response?.data?.message || 'Failed to create categories');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <button
            onClick={initializeCategories}
            className="btn btn-warning gap-2"
            disabled={loading}
        >
            {loading ? (
                <span className="loading loading-spinner loading-sm"></span>
            ) : (
                '🏷️'
            )}
            Initialize Categories
        </button>
    );
};

export default InitializeCategoriesButton;
