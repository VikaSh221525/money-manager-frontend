import React from 'react'
import { useForm } from 'react-hook-form'
import { useAuthStore } from '../store/authStore';
import { WalletCards } from 'lucide-react';
import { Link, useNavigate } from 'react-router';

function LoginPage() {
    const { login, loading } = useAuthStore();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const navigate = useNavigate();

    const onSubmit = async (data) => {
        const success = await login(data);
        if (success) {
            navigate('/dashboard');
        }
    }
    return (
        <div className='h-screen w-full flex overflow-hidden'>
            {/* Left Section - Form */}
            <div className='w-full lg:w-1/2 flex flex-col p-6 lg:p-10 overflow-hidden'>
                {/* Site name and icon */}
                <div className='flex items-center gap-2 mb-12 lg:mb-16'>
                    <WalletCards className='h-8 w-8 lg:h-10 lg:w-10 text-primary' />
                    <h1 className='text-2xl lg:text-3xl font-bold'>Money Manager</h1>
                </div>

                {/* Form Container */}
                <div className='flex-1 flex items-center justify-center lg:justify-start'>
                    <div className='w-full max-w-md'>
                        {/* Header Section */}
                        <div className='mb-8'>
                            <h2 className='text-3xl lg:text-4xl font-bold text-gray-800 mb-2'>Welcome Back</h2>
                            <p className='text-gray-600'>Log in to continue managing your finances</p>
                        </div>

                        {/* Form Section */}
                        <form onSubmit={handleSubmit(onSubmit)} className='space-y-5'>
                            {/* Email Field */}
                            <div className='form-control'>
                                <label className='label'>
                                    <span className='label-text font-semibold text-gray-700'>Email Address</span>
                                </label>
                                <input
                                    type="email"
                                    placeholder="Enter your email"
                                    className={`input input-bordered w-full bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${errors.email ? 'input-error' : ''}`}
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                />
                                {errors.email && (
                                    <label className='label'>
                                        <span className='label-text-alt text-error'>{errors.email.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className='form-control'>
                                <label className='label'>
                                    <span className='label-text font-semibold text-gray-700'>Password</span>
                                </label>
                                <input
                                    type="password"
                                    placeholder="Enter your password"
                                    className={`input input-bordered w-full bg-white focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all ${errors.password ? 'input-error' : ''}`}
                                    {...register('password', {
                                        required: 'Password is required',
                                        minLength: { value: 6, message: 'Password must be at least 6 characters' }
                                    })}
                                />
                                {errors.password && (
                                    <label className='label'>
                                        <span className='label-text-alt text-error'>{errors.password.message}</span>
                                    </label>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className='form-control mt-6'>
                                <button
                                    type="submit"
                                    className='btn btn-primary w-full text-white font-semibold text-lg hover:scale-[1.02] transition-transform'
                                    disabled={loading}
                                >
                                    {loading ? (
                                        <span className='loading loading-spinner loading-md'></span>
                                    ) : (
                                        'Log In'
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* Footer Section */}
                        <div className='mt-6 text-center'>
                            <p className='text-gray-600'>
                                Don't have an account?{' '}
                                <Link to='/signup' className='text-primary font-semibold hover:underline transition-all'>
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Section - Image */}
            <div className='hidden lg:flex lg:w-1/2 items-center justify-center'>
                <img className='w-full h-full object-contain' src="/budgeting_online_3.jpg" alt="Budget Planning" />
            </div>
        </div>
    )
}

export default LoginPage