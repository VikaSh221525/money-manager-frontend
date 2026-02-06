import React from 'react'

const SkeletonLoader = ({ height = 'h-4', width = 'w-full', className = '' }) => {
    return (
        <div 
            className={`skeleton ${height} ${width} ${className}`}
            style={{ 
                background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
                backgroundSize: '200% 100%',
                animation: 'loading 1.5s infinite'
            }}
        />
    );
};

export default SkeletonLoader;
