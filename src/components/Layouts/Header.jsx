import React, { useState, useRef, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FiBell, FiLock, FiLogOut, FiChevronDown } from "react-icons/fi";
import { RiSearchLine } from "react-icons/ri";
import { useAuth } from '../../auth/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const data = {
        notifyCount: 0,
        notifications: [],
        userName: user?.username || 'User',
        role: user?.role
    }

    const [isOpen, setIsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const menuRef = useRef(null);

    const toggleDropdown = () => {
        setIsOpen(prev => !prev);
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <header className="flex px-4 bg-[#F9F9FC] border-b font-poppins border-gray-300">

            <div className="w-56 text-center py-6 border-r flex justify-center items-center">
                <Link to="/" className="">
                    <img src="/assets/krishi.png" alt="" className='object-contain h-10 -ml-3' />
                </Link>
            </div>

            <div className="flex justify-between flex-1">
                <div className="flex items-center ms-3">
                </div>

                <div className="flex items-center gap-4">

                    <div className="relative" ref={menuRef}>
                        <button
                            onClick={() => setUserMenuOpen(prev => !prev)}
                            className="flex items-center gap-3 p-1.5 rounded-lg hover:bg-gray-200/60 transition-colors focus:outline-none"
                        >
                            <img
                                src={`https://ui-avatars.com/api/?name=${data.userName}&background=79b82d&color=fff`}
                                alt="Profile"
                                className="w-10 h-10 rounded-full bg-gray-200"
                            />
                            <div className="flex flex-col text-left">
                                <span className="text-sm capitalize font-semibold">{data.userName}</span>
                                <span className="text-xs capitalize text-gray-500">{data.role || "Administrator"}</span>
                            </div>
                            <FiChevronDown className={`text-gray-500 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} size={16} />
                        </button>

                        {userMenuOpen && (
                            <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 py-1.5 z-50 animate-in fade-in duration-150">
                                <div className="px-4 py-2 border-b border-gray-100">
                                    <p className="text-xs text-gray-400 font-medium">Signed in as</p>
                                    <p className="text-sm font-semibold text-gray-800 truncate">{data.userName}</p>
                                </div>

                                <Link
                                    to="/change-password"
                                    onClick={() => setUserMenuOpen(false)}
                                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                                >
                                    <FiLock size={16} className="text-orange-500" />
                                    <span>Change Password</span>
                                </Link>

                                <button
                                    onClick={() => {
                                        setUserMenuOpen(false);
                                        logout();
                                    }}
                                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors text-left"
                                >
                                    <FiLogOut size={16} />
                                    <span>Logout</span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </header>
    )
}


function NotificationSection({ notifications }) {
    return (
        <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
            <ul className="max-h-64 overflow-y-auto">
                {notifications.length > 0 ? (
                    notifications.map((notification, index) => (
                        <li key={index} className="p-2 hover:bg-gray-100">
                            <p className="text-sm">{notification.message}</p>
                            <span className="text-xs text-gray-500">{notification.timestamp}</span>
                        </li>
                    ))
                ) : (
                    <li className="p-2 text-gray-500">No new notifications</li>
                )}
            </ul>
        </div>
    );
}

export default Header