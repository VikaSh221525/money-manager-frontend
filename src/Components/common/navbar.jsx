import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router'
import { useAuthStore } from '../../store/authStore'
import { 
    Home, 
    Receipt, 
    FileText, 
    Settings, 
    User, 
    LogOut,
    Menu,
    X,
    WalletCards
} from 'lucide-react'

function Navbar() {
    const { user, logout } = useAuthStore();
    const location = useLocation();
    const navigate = useNavigate();
    const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const navItems = [
        { name: 'Overview', path: '/dashboard', icon: Home },
        { name: 'Transactions', path: '/transactions', icon: Receipt },
        { name: 'Reports', path: '/reports', icon: FileText },
        { name: 'Settings', path: '/settings', icon: Settings },
    ];

    const handleLogout = () => {
        logout();
        navigate('/');
        setIsProfileDropdownOpen(false);
    };

    const isActivePath = (path) => {
        if (path === '/dashboard') {
            return location.pathname === '/' || location.pathname === '/dashboard';
        }
        return location.pathname === path;
    };

    return (
        <div className="navbar bg-base-100 border-b border-base-200 px-4 lg:px-6">
            <div className="navbar-start">
                {/* Mobile menu toggle */}
                <div className="lg:hidden">
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="btn btn-ghost btn-circle"
                    >
                        {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                    </button>
                </div>
                
                {/* Logo/Brand */}
                <Link to="/dashboard" className="btn btn-ghost text-xl font-bold flex items-center gap-2">
                    <WalletCards size={24} className="text-primary" />
                    Money Manager
                </Link>
            </div>

            <div className="navbar-center hidden lg:flex">
                <ul className="menu menu-horizontal px-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-2 ${
                                        isActivePath(item.path)
                                            ? 'text-primary bg-primary/10'
                                            : 'hover:text-primary'
                                    }`}
                                >
                                    <Icon size={18} />
                                    {item.name}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </div>

            <div className="navbar-end">
                {/* Profile Dropdown */}
                <div className="dropdown dropdown-end">
                    <button
                        tabIndex={0}
                        role="button"
                        onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                        className="btn btn-ghost btn-circle avatar"
                    >
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
                            {user?.profilePic ? (
                                <img
                                    src={user.profilePic}
                                    alt="Profile"
                                    className="w-full h-full rounded-full object-cover"
                                />
                            ) : (
                                <User size={18} className="text-primary" />
                            )}
                        </div>
                    </button>
                    
                    <ul
                        tabIndex={0}
                        className={`dropdown-content z-50 p-2 shadow-lg bg-base-100 rounded-box w-52 ${
                            isProfileDropdownOpen ? '' : 'hidden'
                        }`}
                    >
                        <li className="menu-title">
                            <span>{user?.name || 'User'}</span>
                        </li>
                        <li>
                            <Link to="/settings" className="flex items-center gap-2">
                                <Settings size={16} />
                                Settings
                            </Link>
                        </li>
                        <li>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2 text-error"
                            >
                                <LogOut size={16} />
                                Logout
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="absolute top-16 left-0 right-0 bg-base-100 border-b border-base-200 z-50 lg:hidden">
                    <ul className="menu menu-vertical px-4 py-2">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            return (
                                <li key={item.path}>
                                    <Link
                                        to={item.path}
                                        onClick={() => setIsMobileMenuOpen(false)}
                                        className={`flex items-center gap-2 ${
                                            isActivePath(item.path)
                                                ? 'text-primary bg-primary/10'
                                                : 'hover:text-primary'
                                        }`}
                                    >
                                        <Icon size={18} />
                                        {item.name}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default Navbar