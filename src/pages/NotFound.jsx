import React from 'react';
import { Link } from 'react-router';
import { Home, ArrowLeft } from 'lucide-react';

function NotFound() {
    return (
        <div className='h-screen w-full flex items-center justify-center bg-linear-to-br from-blue-50 to-purple-50'>
            <div className='text-center px-6'>
                {/* 404 Text */}
                <h1 className='text-9xl font-bold text-primary mb-4'>404</h1>

                {/* Message */}
                <h2 className='text-3xl lg:text-4xl font-bold text-gray-800 mb-4'>
                    Page Not Found
                </h2>
                <p className='text-gray-600 text-lg mb-8 max-w-md mx-auto'>
                    Oops! The page you're looking for doesn't exist. It might have been moved or deleted.
                </p>

                {/* Action Buttons */}
                <div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
                    <Link
                        to="/"
                        className='btn btn-primary text-white font-semibold px-6 hover:scale-105 transition-transform'
                    >
                        <Home className='w-5 h-5 mr-2' />
                        Go to Home
                    </Link>
                    <button
                        onClick={() => window.history.back()}
                        className='btn btn-outline font-semibold px-6 hover:scale-105 transition-transform'
                    >
                        <ArrowLeft className='w-5 h-5 mr-2' />
                        Go Back
                    </button>
                </div>

                {/* Decorative Element */}
                <div className='mt-12'>
                    <svg className='w-64 h-64 mx-auto opacity-20' viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM13 17H11V15H13V17ZM13 13H11V7H13V13Z" fill="currentColor" />
                    </svg>
                </div>
            </div>
        </div>
    );
}

export default NotFound;
