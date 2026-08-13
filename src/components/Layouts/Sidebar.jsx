import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { RiArrowUpSFill } from "react-icons/ri";
import Swal from "sweetalert2";
import { IoGrid, IoFolder, IoLogOut, IoDocumentText } from "react-icons/io5";
import { FaCartShopping } from "react-icons/fa6";
import { HiDocumentCheck } from "react-icons/hi2";
import { BiSolidUserPin } from "react-icons/bi";
import { TbReportMoney } from "react-icons/tb";
import { useAuth } from '../../auth/AuthContext';

const Sidebar = () => {
  const { getPermissions, logout } = useAuth();
  const {
    adminPage,
    unitMaster,
    userMaster,
    sourceMaster,
    purchaseOrder,
    shippingMaster,
    materialMaster,
    deliveryChallan,
    supplierMaster
  } = getPermissions();

  const location = useLocation();
  const [menuExpanded, setMenuExpanded] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);
  const [onSelect, setOnSelect] = useState(location.pathname);

  // Masters menu visibility check
  const mastersMenuItems = [
    { path: "/MaterialMaster", label: "Material Master", show: materialMaster?.show },
    { path: "/sourceMaster", label: "Source Master", show: sourceMaster?.show },
    { path: "/supplierMaster", label: "Supplier Master", show: supplierMaster?.show },
    { path: "/ShippingMaster", label: "Shipping Master", show: shippingMaster?.show },
    { path: "/unitMaster", label: "Unit Master", show: unitMaster?.show },
    { path: "/userMaster", label: "User Master", show: userMaster?.show }
  ];

  const mastersVisibleItems = mastersMenuItems.filter(item => item.show);

  useEffect(() => {
    setOnSelect(location.pathname);

    if (!mastersMenuItems.some(item => item.path === location.pathname)) {
      setMenuExpanded(false);
    }

    if (!['/admin/moderators', '/admin/roles'].includes(location.pathname)) {
      setAdminExpanded(false);
    }
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

        {/* Masters Dropdown — show only if at least one is visible */}
        {mastersVisibleItems.length > 0 && (
          <div className={`${mastersMenuItems.some(item => item.path === onSelect) ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56] '}`}>
            <button
              onClick={() => {
                setMenuExpanded(!menuExpanded);
                setAdminExpanded(false); // Close Admin if Masters is toggled
              }}
              className={`w-full flex items-center justify-between px-2 
                ${mastersMenuItems.some(item => item.path === onSelect) ? 'text-[#F3890A] bg-[#F9E6D3] ' : 'text-[#4A4C56] '}`}
            >
              <span className="flex justify-between w-full h-10 items-center gap-2 px-3 py-3">
                <div className='flex gap-2 items-center justify-start'>
                  <FaCartShopping size={18} />
                  <span className='text-sm'>Masters</span>
                </div>
                <RiArrowUpSFill className={`${menuExpanded ? "" : "rotate-180"}`} size={20} />
              </span>
            </button>

            {menuExpanded && (
              <div className="ml-10 space-y-1">
                {mastersVisibleItems.map(({ path, label }) => (
                  <div key={path} className="flex items-center">
                    <span className={`w-2.5 h-2.5 rounded-full ${onSelect === path ? 'bg-orange-500' : 'bg-white border border-slate-400'}`}></span>
                    <Link to={path} className={`block p-2 rounded-lg text-sm ${onSelect === path ? 'text-[#F3890A] bg-[#F9E6D3]' : 'text-[#4A4C56] '}`}>
                      {label}
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PO and DC Links */}
        {purchaseOrder?.show && (
          <Link
            to="/POMaster"
            className={`flex px-5 py-3 gap-2 items-center justify-start text-sm
              ${onSelect === "/POMaster" ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56] '}`}
          >
            <TbReportMoney size={18} />
            <span>Purchase Order</span>
          </Link>
        )}

        {deliveryChallan?.show && (
          <Link
            to="/dc"
            className={`flex px-5 py-3 gap-2 items-center justify-start text-sm
              ${onSelect === "/dc" ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56] '}`}
          >
            <HiDocumentCheck size={18} />
            <span>Delivery Challan</span>
          </Link>
        )}

        {/* Admin Dropdown */}
        {adminPage?.show && (adminPage.showModerators || adminPage.showRoles) && (
          <div
            className={`${['/admin/moderators', '/admin/roles'].includes(onSelect)
              ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]'
              : 'text-[#4A4C56]'
              }`}
          >
            <button
              onClick={() => {
                setAdminExpanded(!adminExpanded);
                setMenuExpanded(false); // Close Masters if Admin is toggled
              }}
              className={`w-full flex items-center justify-between px-2 
              ${['/admin/moderators', '/admin/roles'].includes(onSelect)
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
                {adminPage.showModerators && (
                  <div className="flex items-center">
                    <span className={`w-2.5 h-2.5 rounded-full ${onSelect === "/admin/moderators" ? 'bg-orange-500' : 'bg-white border border-slate-400'}`}></span>
                    <Link to="/admin/moderators" className={`block p-2 rounded-lg text-sm ${onSelect === "/admin/moderators" ? 'text-[#F3890A] bg-[#F9E6D3]' : 'text-[#4A4C56]'}`}>
                      Moderators
                    </Link>
                  </div>
                )}
                {adminPage.showRoles && (
                  <div className="flex items-center">
                    <span className={`w-2.5 h-2.5 rounded-full ${onSelect === "/admin/roles" ? 'bg-orange-500' : 'bg-white border border-slate-400'}`}></span>
                    <Link to="/admin/roles" className={`block p-2 rounded-lg text-sm ${onSelect === "/admin/roles" ? 'text-[#F3890A] bg-[#F9E6D3]' : 'text-[#4A4C56]'}`}>
                      Roles
                    </Link>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        <Link
          to="/reports"
          className={`flex px-5 py-3 gap-2 items-center justify-start text-sm
              ${onSelect === "/reports" ? 'text-[#F3890A] bg-[#F9E6D3] border-l-4 border-[#F3890A]' : 'text-[#4A4C56] '}`}
        >
          <IoDocumentText size={18} />
          <span>Reports</span>
        </Link>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex px-5 py-3 gap-2 items-center justify-start text-sm text-[#4A4C56] hover:text-[#F3890A] hover:bg-[#F9E6D3] hover:border-l-4 w-full transition-all hover:border-[#F3890A]">
          <IoLogOut size={19} />
          <span>Logout</span>
        </button>

      </nav>
    </aside>
  );
};

export default Sidebar;