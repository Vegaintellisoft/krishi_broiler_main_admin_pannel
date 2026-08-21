import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RiArrowUpSFill, RiLockPasswordLine } from "react-icons/ri";
import Swal from "sweetalert2";
import { IoGrid, IoLogOut } from "react-icons/io5";
import { useAuth } from '../../auth/AuthContext';
import { FaUsers, FaWeight } from "react-icons/fa";
import { PiFarmFill } from "react-icons/pi";
import { GiGreenhouse } from "react-icons/gi";
import { GiNestEggs } from "react-icons/gi";
import { GiRoastChicken } from "react-icons/gi";

const BreederSidebar = () => {



    const { logout } = useAuth();

    const location = useLocation();
    const [menuExpanded, setMenuExpanded] = useState(false);
    const [feedExpanded, setFeedExpanded] = useState(false);
    const [onSelect, setOnSelect] = useState(location.pathname);

    // Masters Menu Items
    const mastersMenuItems = [
        { path: "/unitname", label: "Unit Name", show: true },
        { path: "/biosecurity", label: "Bio Security", show: true },
        { path: "/biosecuritydata", label: "Bio Security Data", show: true },
        { path: "/flockmaster", label: "Flock Master", show: true },
        { path: "/plantmaster", label: "Plant Master", show: true }
    ];

    const feedMenuItems = [
        { path: "/feeding", label: "Feed", show: true },
        { path: "/medicine", label: "Medicine", show: true }
    ];



    const mastersVisibleItems = mastersMenuItems.filter(item => item.show);
    const feedVisibleItems = feedMenuItems.filter(item => item.show);

    useEffect(() => {
        setOnSelect(location.pathname);

        // Optional: Auto-expand menu if current path is inside it or is a subpath of /unitname or /biosecurity
        if (mastersMenuItems.some(item =>
            location.pathname === item.path ||
            location.pathname.startsWith(item.path + "/")
        )) {
            setMenuExpanded(true);
        }
        if (feedVisibleItems.some(item => location.pathname === item.path || location.pathname.startsWith(item.path + "/"))) setFeedExpanded(true);

    }, [location.pathname]);

    const handleLogout = () => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You will be logged out!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#f86624',
            cancelButtonColor: '#808080',
            confirmButtonText: 'Yes, logout!'
        }).then((result) => {
            if (result.isConfirmed) {
                logout();
            }
        });
    };

    return (
        <aside className="w-60 bg-white border-r font-poppins font-semibold">
            <nav className="space-y-2">

                {/* Dashboard */}
                <Link
                    to="/"
                    className={`flex items-center justify-start text-sm gap-2 px-5 py-3    
            ${onSelect === '/' ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56]'}`}
                >
                    <IoGrid size={18} />
                    <span className='text-sm'>Dashboardds</span>
                </Link>

                {/* Masters Dropdown */}
                {mastersVisibleItems.length > 0 && (
                    <div className={`${mastersMenuItems.some(item => onSelect === item.path || onSelect.startsWith(item.path + "/")) ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56]'}`}>
                        <button
                            onClick={() => {
                                setMenuExpanded(!menuExpanded);
                                setFeedExpanded(false);
                            }}
                            className={`w-full flex items-center justify-between px-2 ${mastersMenuItems.some(item => onSelect === item.path || onSelect.startsWith(item.path + "/")) ? 'text-[#F3890A] bg-[#F9E6D3]' : 'text-[#4A4C56]'}`}
                        >
                            <span className="flex justify-between w-full h-10 items-center gap-2 px-3 py-3">
                                <div className='flex gap-2 items-center justify-start'>
                                    <GiGreenhouse size={18} />
                                    <span className='text-sm font-poppins font-bold'>Masters</span>
                                </div>
                                <RiArrowUpSFill className={`${menuExpanded ? "" : "rotate-180"}`} size={20} />
                            </span>
                        </button>

                        {menuExpanded && (
                            <div className="ml-10 space-y-1 max-h-80 overflow-y-auto scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-white">
                                {mastersVisibleItems.map(({ path, label }) => {
                                    const isActive = onSelect === path || onSelect.startsWith(path + "/");

                                    return (
                                        <div key={path} className="flex items-center">
                                            <span className={`min-w-2.5 min-h-2.5 rounded-full ${isActive ? 'bg-orange-500' : 'bg-white border border-slate-400'}`}></span>
                                            <Link to={path} className={`block p-2 rounded-lg text-sm ${isActive ? 'text-[#F3890A] bg-[#F9E6D3]' : 'text-[#4A4C56]'}`}>
                                                {label}
                                            </Link>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {feedVisibleItems.length > 0 && (
                    <div className={`${feedMenuItems.some(item => onSelect === item.path || onSelect.startsWith(item.path + "/")) ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56]'}`}>
                        <button
                            onClick={() => {
                                setFeedExpanded(!feedExpanded);
                                setMenuExpanded(false);
                            }}
                            className={`w-full flex items-center justify-between px-2 ${feedMenuItems.some(item => onSelect === item.path || onSelect.startsWith(item.path + "/")) ? 'text-[#F3890A] bg-[#F9E6D3]' : 'text-[#4A4C56]'}`}
                        >
                            <span className="flex justify-between w-full h-10 items-center gap-2 px-3 py-3">
                                <div className='flex gap-2 items-center justify-start'>
                                    <PiFarmFill size={18} />
                                    <span className='text-sm'>Feeds</span>
                                </div>
                                <RiArrowUpSFill className={`${feedExpanded ? "" : "rotate-180"}`} size={20} />
                            </span>
                        </button>

                        {feedExpanded && (
                            <div className="ml-10 space-y-1">
                                {feedVisibleItems.map(({ path, label }) => (
                                    <div key={path} className="flex items-center">
                                        <span className={`min-w-2.5 min-h-2.5 rounded-full ${onSelect === path || onSelect.startsWith(path + "/") ? 'bg-orange-500' : 'bg-white border border-slate-400'}`}></span>
                                        <Link to={path} className={`block p-2 rounded-lg text-sm ${onSelect === path || onSelect.startsWith(path + "/") ? 'text-[#F3890A] bg-[#F9E6D3]' : 'text-[#4A4C56]'}`}>
                                            {label}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}


                <Link
                    to="/eggcollection"
                    className={`flex px-5 py-3 gap-2 items-center justify-start text-sm
                                            ${onSelect === "/eggcollection" || onSelect.startsWith("/eggcollection/") ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56] '}`}
                >
                    <GiNestEggs size={18} />
                    <span>Egg Collection</span>
                </Link>

                <Link
                    to="/mortality"
                    className={`flex px-5 py-3 gap-2 items-center justify-start text-sm
                                            ${onSelect === "/mortality" ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56] '}`}
                >
                    <GiRoastChicken size={18} />
                    <span>Mortality</span>
                </Link>

                <Link
                    to="/birdweighing"
                    className={`flex px-5 py-3 gap-2 items-center justify-start text-sm
                                            ${onSelect === "/birdweighing" || onSelect.startsWith("/birdweighing/") ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56] '}`}
                >
                    <FaWeight size={18} />
                    <span>Bird Weighing</span>
                </Link>

                <Link
                    to="/change-password"
                    className={`flex px-5 py-3 gap-2 items-center justify-start text-sm
                                            ${onSelect === "/change-password" ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56] '}`}
                >
                    <RiLockPasswordLine size={18} />
                    <span>Change Password</span>
                </Link>

                {/* Logout */}
                <button
                    onClick={handleLogout}
                    className="flex px-5 py-3 gap-2 items-center justify-start text-sm text-[#4A4C56] hover:text-[#F3890A] hover:bg-[#F9E6D3] hover:border-l-4 w-full transition-all hover:border-[#F3890A]"
                >
                    <IoLogOut size={19} />
                    <span>Logout</span>
                </button>

            </nav>
        </aside>
    );
};

export default BreederSidebar;