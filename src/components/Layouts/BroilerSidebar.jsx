import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RiArrowUpSFill, RiLockPasswordLine } from "react-icons/ri";
import Swal from "sweetalert2";
import { IoGrid, IoLogOut } from "react-icons/io5";
import { FaShoppingCart, FaEdit } from "react-icons/fa";
import { BiSolidUserPin } from "react-icons/bi";
import { useAuth } from '../../auth/AuthContext';
import { TbReportMoney } from 'react-icons/tb';
import { FaUsers } from "react-icons/fa";
import { PiFarmFill } from "react-icons/pi";
import { BroilerMasterEndpoints } from '../../utils/store';

const BroilerSidebar = () => {
    const { getPermissions, logout } = useAuth();

    const { adminPage, broilerUsers, allMasters,
        farmActivity, shedReadiness, chickReceipt, medicineIssued,
        feedTransfer, feedReturn, feedApproval, feedRequest, broilerSupply
    } = getPermissions();

    const location = useLocation();
    const [menuExpanded, setMenuExpanded] = useState(false);
    const [dataEntryExpanded, setDataEntryExpanded] = useState(false);
    const [feedExpanded, setFeedExpanded] = useState(false);
    const [adminExpanded, setAdminExpanded] = useState(false);
    const [onSelect, setOnSelect] = useState(location.pathname);

   const mastersMenuItems = allMasters?.show ? [
    ...BroilerMasterEndpoints.map((endpoint) => {
        const label = endpoint
            .split("_")
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(" ");

        return {
            path: `/${endpoint.replaceAll("_", "-")}`,
            label,
            show: true,
        };
    }),

    { path: "/farmer-location-master", label: "Farmer Location", show: true },

    { path: "/line-farm-master", label: "Line Farm Master", show: true },

    { path: "/farmer-line-master", label: "Farmer Line Master", show: true },

    { path: "/tentative-rate", label: "Tentative Rate", show: true },

    { path: "/sap-post-date-config", label: "SAP Post Date Config", show: true }

] : [];

    // Data Entry Menu Items
    const dataEntryMenuItems = [
        { path: "/FarmActivity", label: "Farm Activity", show: farmActivity?.all },
        { path: "/ShedReadiness", label: "Shed Readiness", show: shedReadiness?.all },
        { path: "/ChickReceipt", label: "Chick Receipt", show: chickReceipt?.all },
        { path: "/IssueMedicine", label: "Issue Medicine", show: medicineIssued?.all },
    ];

    const feedMenuItems = [
        { path: "/FeedTransfer", label: "Feed Transfer", show: feedTransfer?.all },
        { path: "/FeedReturn", label: "Feed Return", show: feedReturn?.all },
        { path: "/BroilerSupply", label: "Broiler Supply", show: broilerSupply?.all },
        { path: "/FeedRequest", label: "Feed Request", show: feedRequest?.all },
        { path: "/FeedApproval", label: "Feed Approval", show: feedApproval?.all },
    ];

    const mastersVisibleItems = mastersMenuItems.filter(item => item.show);
    const dataEntryVisibleItems = dataEntryMenuItems.filter(item => item.show);
    const feedVisibleItems = feedMenuItems.filter(item => item.show);

    useEffect(() => {
        setOnSelect(location.pathname);

        if (mastersMenuItems.some(item => item.path === location.pathname)) setMenuExpanded(true);
        if (dataEntryMenuItems.some(item => item.path === location.pathname)) setDataEntryExpanded(true);
        if (feedVisibleItems.some(item => item.path === location.pathname)) setFeedExpanded(true);
        if (['/admin/roles', '/admin/activity-monitor'].includes(location.pathname)) setAdminExpanded(true);

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
                    <span className='text-sm'>Dashboard</span>
                </Link>

                {/* Masters Dropdown */}
                {mastersVisibleItems.length > 0 && (
                    <div className={`${mastersMenuItems.some(item => item.path === onSelect) ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56]'}`}>
                        <button
                            onClick={() => {
                                setMenuExpanded(!menuExpanded);
                                setDataEntryExpanded(false);
                                setFeedExpanded(false);
                                setAdminExpanded(false);
                            }}
                            className={`w-full flex items-center justify-between px-2 ${mastersMenuItems.some(item => item.path === onSelect) ? 'text-[#F3890A] bg-[#F9E6D3]' : 'text-[#4A4C56]'}`}
                        >
                            <span className="flex justify-between w-full h-10 items-center gap-2 px-3 py-3">
                                <div className='flex gap-2 items-center justify-start'>
                                    <FaShoppingCart size={18} />
                                    <span className='text-sm'>Masters</span>
                                </div>
                                <RiArrowUpSFill className={`${menuExpanded ? "" : "rotate-180"}`} size={20} />
                            </span>
                        </button>

                        {menuExpanded && (
                            <div className="ml-10 space-y-1 max-h-80 overflow-y-scroll scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-primary/50 scrollbar-track-white">
                                {mastersVisibleItems.map(({ path, label }) => (
                                    <div key={path} className="flex items-center">
                                        <span className={`min-w-2.5 min-h-2.5 rounded-full ${onSelect === path ? 'bg-orange-500' : 'bg-white border border-slate-400'}`}></span>
                                        <Link to={path} className={`block p-2 rounded-lg text-sm ${onSelect === path ? 'text-[#F3890A] bg-[#F9E6D3]' : 'text-[#4A4C56]'}`}>
                                            {label}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* --- DATA ENTRY SECTION --- */}
                {dataEntryVisibleItems.length > 0 && (
                    <div className={`${dataEntryMenuItems.some(item => item.path === onSelect) ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56]'}`}>
                        <button
                            onClick={() => {
                                setDataEntryExpanded(!dataEntryExpanded);
                                setMenuExpanded(false);
                                setFeedExpanded(false);
                                setAdminExpanded(false);
                            }}
                            className={`w-full flex items-center justify-between px-2 ${dataEntryMenuItems.some(item => item.path === onSelect) ? 'text-[#F3890A] bg-[#F9E6D3]' : 'text-[#4A4C56]'}`}
                        >
                            <span className="flex justify-between w-full h-10 items-center gap-2 px-3 py-3">
                                <div className='flex gap-2 items-center justify-start'>
                                    <FaEdit size={18} />
                                    <span className='text-sm'>Data Entry</span>
                                </div>
                                <RiArrowUpSFill className={`${dataEntryExpanded ? "" : "rotate-180"}`} size={20} />
                            </span>
                        </button>

                        {dataEntryExpanded && (
                            <div className="ml-10 space-y-1">
                                {dataEntryVisibleItems.map(({ path, label }) => (
                                    <div key={path} className="flex items-center">
                                        <span className={`min-w-2.5 min-h-2.5 rounded-full ${onSelect === path ? 'bg-orange-500' : 'bg-white border border-slate-400'}`}></span>
                                        <Link to={path} className={`block p-2 rounded-lg text-sm ${onSelect === path ? 'text-[#F3890A] bg-[#F9E6D3]' : 'text-[#4A4C56]'}`}>
                                            {label}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Feeds Section */}
                {feedVisibleItems.length > 0 && (
                    <div className={`${feedMenuItems.some(item => item.path === onSelect) ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56]'}`}>
                        <button
                            onClick={() => {
                                setFeedExpanded(!feedExpanded);
                                setMenuExpanded(false);
                                setDataEntryExpanded(false);
                                setAdminExpanded(false);
                            }}
                            className={`w-full flex items-center justify-between px-2 ${feedMenuItems.some(item => item.path === onSelect) ? 'text-[#F3890A] bg-[#F9E6D3]' : 'text-[#4A4C56]'}`}
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
                                        <span className={`min-w-2.5 min-h-2.5 rounded-full ${onSelect === path ? 'bg-orange-500' : 'bg-white border border-slate-400'}`}></span>
                                        <Link to={path} className={`block p-2 rounded-lg text-sm ${onSelect === path ? 'text-[#F3890A] bg-[#F9E6D3]' : 'text-[#4A4C56]'}`}>
                                            {label}
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Users (Broiler Users) */}
                {broilerUsers?.show && (
                    <Link
                        to="/broilerUser"
                        className={`flex px-5 py-3 gap-2 items-center justify-start text-sm
                            ${onSelect === "/broilerUser" ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56] '}`}
                    >
                        <FaUsers size={18} />
                        <span>Users</span>
                    </Link>
                )}

                {/* Admin Dropdown (Roles & Activity Log) */}
                {adminPage?.show && (
                    <div
                        className={`${['/admin/roles', '/admin/activity-monitor'].includes(onSelect)
                            ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]'
                            : 'text-[#4A4C56]'
                            }`}
                    >
                        <button
                            onClick={() => {
                                setAdminExpanded(!adminExpanded);
                                setMenuExpanded(false);
                                setDataEntryExpanded(false);
                                setFeedExpanded(false);
                            }}
                            className={`w-full flex items-center justify-between px-2 
                            ${['/admin/roles', '/admin/activity-monitor'].includes(onSelect)
                                    ? 'text-[#F3890A] bg-[#F9E6D3]'
                                    : 'text-[#4A4C56]'
                                }`}
                        >
                            <span className="flex justify-between w-full h-10 items-center gap-2 px-3 py-3">
                                <div className='flex gap-2 items-center justify-start'>
                                    <BiSolidUserPin size={18} />
                                    <span className='text-sm'>Admin</span>
                                </div>
                                <RiArrowUpSFill
                                    className={`${adminExpanded ? "" : "rotate-180"}`}
                                    size={20}
                                />
                            </span>
                        </button>

                        {adminExpanded && (
                            <div className="ml-10 space-y-1">
                                {adminPage.showRoles && (
                                    <div className="flex items-center">
                                        <span className={`w-2.5 h-2.5 rounded-full ${onSelect === "/admin/roles" ? 'bg-orange-500' : 'bg-white border border-slate-400'}`}></span>
                                        <Link to="/admin/roles" className={`block p-2 rounded-lg text-sm ${onSelect === "/admin/roles" ? 'text-[#F3890A] bg-[#F9E6D3]' : 'text-[#4A4C56]'}`}>
                                            Roles
                                        </Link>
                                    </div>
                                )}
                                <div className="flex items-center">
                                    <span className={`w-2.5 h-2.5 rounded-full ${onSelect === "/admin/activity-monitor" ? 'bg-orange-500' : 'bg-white border border-slate-400'}`}></span>
                                    <Link to="/admin/activity-monitor" className={`block p-2 rounded-lg text-sm ${onSelect === "/admin/activity-monitor" ? 'text-[#F3890A] bg-[#F9E6D3]' : 'text-[#4A4C56]'}`}>
                                        Activity Log
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                <Link
                    to="/change-password"
                    className={`flex px-5 py-3 gap-2 items-center justify-start text-sm
                        ${onSelect === "/change-password" ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56]'}`}
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

export default BroilerSidebar;