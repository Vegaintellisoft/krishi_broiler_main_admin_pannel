import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { FiBell } from "react-icons/fi";
import { RiSearchLine } from "react-icons/ri";
import { useAuth } from '../../auth/AuthContext';

const Header = () => {
    const { user, logout } = useAuth();

    const data = {
        notifyCount: 0,
        notifications: [],
        userName: user.username,
        role: user.role
    }

    const [isOpen, setIsOpen] = useState(false);
    const toggleDropdown = () => {
        setIsOpen(prev => !prev);
    };


    return (
        <header className="flex px-4 bg-[#F9F9FC] border-b font-poppins border-gray-300">

            <div className="w-56 text-center py-6 border-r flex justify-center items-center">
                <Link to="/" className="">
                    <img src="/assets/krishi.png" alt="" className='object-contain h-10 -ml-3' />
                </Link>
            </div>

            <div className="flex justify-between flex-1">
                <div className="flex items-center ms-3">
                    {/* <RiSearchLine className='absolute ms-2  opacity-50' size={18} />
                    <input
                        type="search"
                        placeholder="Search"
                        className="pl-10 pr-2 h-10 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    /> */}
                </div>

                <div className="flex items-center gap-4">

                    {/* <div className="relative">
                        <button onClick={toggleDropdown} className="p-2 text-gray-500 hover:text-gray-700">
                            <FiBell size={20} />
                        </button>
                        <span className="absolute top-0 left-4 flex items-center justify-center w-4 h-4 text-xs text-white bg-blue-500 rounded-sm">
                            {data.notifyCount}
                        </span>

                        {isOpen && <NotificationSection notifications={data.notifications} />}

                    </div> */}

                    <div className="flex items-center gap-3">
                        <img
                            src={`https://ui-avatars.com/api/?name=${data.userName}&background=79b82d&color=fff`}
                            alt="Profile"
                            className="w-10 h-10 rounded-full bg-gray-200"
                        />
                        <div className="flex flex-col">
                            <span className="text-sm capitalize font-semibold">{data.userName}</span>
                            <span className="text-xs capitalize text-gray-500">{data.role || "Administrator"}</span>
                        </div>

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