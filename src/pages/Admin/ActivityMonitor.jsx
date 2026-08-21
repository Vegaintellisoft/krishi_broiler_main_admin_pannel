import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  RiArrowUpSFill, 
  RiSearchLine, 
  RiSmartphoneLine, 
  RiComputerLine, 
  RiShieldUserLine,
  RiTimeLine,
  RiRefreshLine,
  RiFileTextLine,
  RiUserLine,
  RiLockPasswordLine,
  RiDeleteBinLine,
  RiCloseCircleLine,
  RiAddCircleLine,
  RiEditLine
} from 'react-icons/ri';
import { LuImport } from 'react-icons/lu';
import { FiActivity, FiEye, FiX, FiCheckCircle } from 'react-icons/fi';
import { formatDateTime } from '../../utils/helper';
import ExcelExport from '../../utils/ExcelExport';
import { useAuth } from '../../auth/AuthContext';

const ActivityMonitor = () => {
  const { user } = useAuth();
  const currentCategory = user?.category || 'Broiler';

  // Active Tab: 'admin' or 'mobile'
  const [activeTab, setActiveTab] = useState('admin');

  // Mobile activity states (All mobile events)
  const [mobileLogs, setMobileLogs] = useState([]);
  const [mobileLoading, setMobileLoading] = useState(false);
  const [mobileTotal, setMobileTotal] = useState(0);

  // Admin audit states
  const [adminLogs, setAdminLogs] = useState([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const [adminTotal, setAdminTotal] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Selected Log for Details Modal
  const [selectedAuditLog, setSelectedAuditLog] = useState(null);

  // Fetch All Mobile Application Activities
  const fetchMobileLogs = async () => {
    setMobileLoading(true);
    try {
      const { data } = await axios.get('/admin/activity-logs/mobile', {
        params: {
          category: currentCategory,
          from: fromDate || '',
          to: toDate || '',
          search: searchQuery || '',
          limit: 200,
          offset: 0
        }
      });
      if (data.status && data.data) {
        setMobileLogs(data.data.activities || []);
        setMobileTotal(data.data.total || 0);
      } else {
        setMobileLogs([]);
        setMobileTotal(0);
      }
    } catch (err) {
      console.error("Error fetching mobile logs:", err);
      setMobileLogs([]);
    } finally {
      setMobileLoading(false);
    }
  };

  // Fetch Admin Audit Logs (Strictly filtered by Category & source = 'admin')
  const fetchAdminLogs = async () => {
    setAdminLoading(true);
    try {
      const { data } = await axios.get('/admin/activity-logs/admin', {
        params: {
          category: currentCategory,
          from: fromDate || '',
          to: toDate || '',
          search: searchQuery || '',
          action: actionFilter !== 'all' ? actionFilter : '',
          module: moduleFilter !== 'all' ? moduleFilter : '',
          limit: 200,
          offset: 0
        }
      });
      if (data.status && data.data) {
        setAdminLogs(data.data.logs || []);
        setAdminTotal(data.data.total || 0);
      } else {
        setAdminLogs([]);
        setAdminTotal(0);
      }
    } catch (err) {
      console.error("Error fetching admin audit logs:", err);
      setAdminLogs([]);
    } finally {
      setAdminLoading(false);
    }
  };

  useEffect(() => {
    fetchMobileLogs();
    fetchAdminLogs();
    setCurrentPage(1);
  }, [currentCategory, fromDate, toDate, actionFilter, moduleFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Search input handler
  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleRefresh = () => {
    fetchMobileLogs();
    fetchAdminLogs();
  };

  // Client-side filtering on loaded set
  const filteredMobileLogs = useMemo(() => {
    if (!searchQuery) return mobileLogs;
    const q = searchQuery.toLowerCase();
    return mobileLogs.filter(
      item =>
        (item.fullname && item.fullname.toLowerCase().includes(q)) ||
        (item.username && item.username.toLowerCase().includes(q)) ||
        (item.specific_change && item.specific_change.toLowerCase().includes(q)) ||
        (item.module_name && item.module_name.toLowerCase().includes(q)) ||
        (item.ip_address && item.ip_address.toLowerCase().includes(q)) ||
        (item.action && item.action.toLowerCase().includes(q))
    );
  }, [mobileLogs, searchQuery]);

  const filteredAdminLogs = useMemo(() => {
    let result = adminLogs;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        item =>
          (item.username && item.username.toLowerCase().includes(q)) ||
          (item.display_name && item.display_name.toLowerCase().includes(q)) ||
          (item.role && item.role.toLowerCase().includes(q)) ||
          (item.module && item.module.toLowerCase().includes(q)) ||
          (item.ip_address && item.ip_address.toLowerCase().includes(q)) ||
          (item.change_summary && item.change_summary.toLowerCase().includes(q))
      );
    }
    return result;
  }, [adminLogs, searchQuery]);

  // Pagination calculations
  const activeDataList = activeTab === 'mobile' ? filteredMobileLogs : filteredAdminLogs;
  const totalPages = Math.ceil(activeDataList.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = activeDataList.slice(startIndex, startIndex + itemsPerPage);

  // Distinct Modules for Filter Dropdown
  const uniqueModules = useMemo(() => {
    const modules = adminLogs.map(l => l.module).filter(Boolean);
    return [...new Set(modules)];
  }, [adminLogs]);

  // Excel Export Handler
  const handleExport = () => {
    if (activeTab === 'mobile') {
      const exportData = filteredMobileLogs.map(item => ({
        "Category": item.category || currentCategory,
        "Username": item.username,
        "Full Name": item.fullname,
        "Role": item.role || 'Supervisor',
        "Action": item.action,
        "Module": item.module_name,
        "Specific Activity": item.specific_change || '-',
        "IP Address": item.ip_address || '-',
        "Timestamp": formatDateTime(item.submitted_at)
      }));
      ExcelExport(exportData, `${currentCategory}_Mobile_Application_Activity_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } else {
      const exportData = filteredAdminLogs.map(item => ({
        "Category": item.category || currentCategory,
        "User Name": item.display_name || item.username,
        "Username": item.username,
        "Role": item.role || 'Admin',
        "Action": item.action,
        "Module Changed": item.module,
        "Specific Changes": item.change_summary || '-',
        "User IP Address": item.ip_address || '-',
        "Request URL": item.request_url || '-',
        "Timestamp": formatDateTime(item.created_at)
      }));
      ExcelExport(exportData, `${currentCategory}_Admin_Audit_Trail_${new Date().toISOString().slice(0, 10)}.xlsx`);
    }
  };

  // Color helper for Action Badges
  const getActionBadgeClass = (action) => {
    switch (String(action).toUpperCase()) {
      case 'CREATE':
      case 'POST':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-300 font-bold';
      case 'UPDATE':
      case 'PUT':
      case 'PATCH':
        return 'bg-blue-50 text-blue-700 border border-blue-300 font-bold';
      case 'DELETE':
        return 'bg-rose-50 text-rose-700 border border-rose-300 font-bold';
      case 'CANCEL':
        return 'bg-amber-50 text-amber-700 border border-amber-300 font-bold';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200 font-semibold';
    }
  };

  return (
    <div className="flex-1 bg-[#F9F9FC] p-6 font-poppins min-h-screen">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight flex items-center gap-2">
              <FiActivity className="text-orange-500" />
              Activity Monitor & Audit Trail
            </h1>
            <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 text-xs font-extrabold rounded-full uppercase tracking-wide border border-orange-200">
              {currentCategory} Logs
            </span>
          </div>
          <div className="flex items-center gap-x-2 text-xs text-gray-500 mt-1">
            <Link to="/" className="text-orange-500 hover:underline font-medium">Admin</Link>
            <span><RiArrowUpSFill className="rotate-90" size={16} /></span>
            <span className="font-semibold text-gray-700">{currentCategory} Activity Log</span>
          </div>
        </div>

        {/* Global Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleRefresh}
            className="p-2.5 bg-white hover:bg-orange-50 hover:text-orange-500 text-gray-600 rounded-xl border border-gray-200 transition-all shadow-sm flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh logs"
          >
            <RiRefreshLine className={`h-4 w-4 ${mobileLoading || adminLoading ? 'animate-spin text-orange-500' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={handleExport}
            className="px-4 py-2.5 bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-600 rounded-xl border border-blue-200 transition-all shadow-sm flex items-center gap-2 text-xs font-semibold"
          >
            <LuImport size={15} />
            <span>Export Excel</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{currentCategory} Admin Changes</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{adminTotal}</h3>
            <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
              <RiComputerLine /> Tracked changes with user & clean IP
            </p>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-500 rounded-xl">
            <RiComputerLine size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile App Activities</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{mobileTotal}</h3>
            <p className="text-[11px] text-orange-600 font-medium flex items-center gap-1">
              <RiSmartphoneLine /> All supervisor & mobile operations
            </p>
          </div>
          <div className="p-3.5 bg-orange-50 text-orange-500 rounded-xl">
            <RiSmartphoneLine size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Audit Security Status</p>
            <h3 className="text-base font-bold text-emerald-600 flex items-center gap-1.5">
              <FiCheckCircle className="text-emerald-500" /> Active Tracking
            </h3>
            <p className="text-[11px] text-gray-400 font-medium">
              Real IP, User, Timestamp, Change Summary
            </p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-500 rounded-xl">
            <FiCheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        {/* Tab Navigation & Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 pb-5 mb-5">
          <div className="flex items-center gap-2 bg-gray-100/90 p-1.5 rounded-xl">
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <RiComputerLine size={16} />
              <span>{currentCategory} Admin Audit Trail</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-700'}`}>
                {adminTotal}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'mobile'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <RiSmartphoneLine size={16} />
              <span>Mobile Application Activity Log</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'mobile' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-700'}`}>
                {mobileTotal}
              </span>
            </button>
          </div>

          {/* Date & Search Filters */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative flex-1 lg:flex-initial">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <RiSearchLine size={14} />
              </span>
              <input
                type="search"
                placeholder={activeTab === 'admin' ? "Search user, IP, change..." : "Search supervisor, activity..."}
                value={searchQuery}
                onChange={handleSearch}
                className="w-full lg:w-60 pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              />
            </div>

            {/* From Date */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-1.5 px-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent outline-none text-xs font-medium text-gray-700"
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-1.5 px-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent outline-none text-xs font-medium text-gray-700"
              />
            </div>

            {/* Action Filter (Admin tab only) */}
            {activeTab === 'admin' && (
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Actions</option>
                <option value="CREATE">CREATE</option>
                <option value="UPDATE">UPDATE</option>
                <option value="DELETE">DELETE</option>
                <option value="CANCEL">CANCEL</option>
              </select>
            )}

            {/* Module Filter (Admin tab only) */}
            {activeTab === 'admin' && uniqueModules.length > 0 && (
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Modules</option>
                {uniqueModules.map((m, idx) => (
                  <option key={idx} value={m}>{m}</option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Tab 1: Admin Panel Audit Trail Table */}
        {activeTab === 'admin' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5 rounded-l-xl">S.No</th>
                  <th className="px-5 py-3.5">Admin User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                  <th className="px-5 py-3.5">Module Changed</th>
                  <th className="px-5 py-3.5">Specific What Was Changed</th>
                  <th className="px-5 py-3.5 text-center">User IP Address</th>
                  <th className="px-5 py-3.5 text-right">Timestamp</th>
                  <th className="px-5 py-3.5 text-center rounded-r-xl">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {adminLoading ? (
                  <tr>
                    <td colSpan="9" className="py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-all">
                      <td className="px-5 py-4 font-semibold text-gray-400">
                        {startIndex + idx + 1}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          <RiUserLine className="text-orange-500" />
                          <span>{row.display_name || row.username}</span>
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">@{row.username}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md font-semibold text-[11px]">
                          {row.role || 'Admin'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${getActionBadgeClass(row.action)}`}>
                          {row.action}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-800">{row.module || 'System'}</div>
                        <div className="text-[10px] text-gray-400 font-mono truncate max-w-[150px]" title={row.request_url}>
                          {row.request_url}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-medium text-gray-900 bg-amber-50/60 p-2 rounded-lg border border-amber-200/60 max-w-xs">
                          {row.change_summary || `${row.action} performed in ${row.module}`}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-mono font-bold rounded-lg text-[11px] border border-indigo-200 shadow-sm whitespace-nowrap">
                          {row.ip_address || '127.0.0.1'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-gray-600 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1 text-gray-800 font-semibold">
                          <RiTimeLine className="text-gray-400" />
                          <span>{formatDateTime(row.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <button
                          onClick={() => setSelectedAuditLog(row)}
                          className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                          title="View change payload"
                        >
                          <FiEye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-gray-400 font-medium">
                      No admin panel change logs recorded in {currentCategory} matching the filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Tab 2: Mobile App Activity Table (ALL Mobile Activities) */}
        {activeTab === 'mobile' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left divide-y divide-gray-100">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-5 py-3.5 rounded-l-xl">S.No</th>
                  <th className="px-5 py-3.5">Mobile User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5 text-center">Action</th>
                  <th className="px-5 py-3.5">Module</th>
                  <th className="px-5 py-3.5">Specific Activity Done</th>
                  <th className="px-5 py-3.5 text-center">User IP Address</th>
                  <th className="px-5 py-3.5 text-right rounded-r-xl">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
                {mobileLoading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="flex justify-center items-center">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/80 transition-all">
                      <td className="px-5 py-4 font-semibold text-gray-400">
                        {startIndex + idx + 1}
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-bold text-gray-900 flex items-center gap-1.5">
                          <RiSmartphoneLine className="text-orange-500" />
                          <span>{row.fullname || row.username}</span>
                        </div>
                        <div className="text-[11px] text-gray-400 font-mono">@{row.username}</div>
                      </td>
                      <td className="px-5 py-4">
                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-700 rounded-md font-semibold text-[11px]">
                          {row.role || 'Supervisor'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${getActionBadgeClass(row.action)}`}>
                          {row.action || 'CREATE'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="font-bold text-gray-800">
                          {row.module_name || 'Farm Activity'}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-gray-900 bg-gray-50 p-2 rounded-lg border border-gray-200/80 max-w-md">
                          {row.specific_change || `${row.action} in ${row.module_name}`}
                        </div>
                      </td>
                      <td className="px-5 py-4 text-center">
                        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 font-mono font-bold rounded-lg text-[11px] border border-indigo-200 shadow-sm whitespace-nowrap">
                          {row.ip_address || '127.0.0.1'}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-gray-600 whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5 text-gray-800 font-semibold">
                          <RiTimeLine className="text-gray-400" />
                          <span>{formatDateTime(row.submitted_at)}</span>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="8" className="px-6 py-12 text-center text-gray-400 font-medium">
                      No mobile application activity recorded in {currentCategory}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Showing <span className="font-bold text-gray-700">{startIndex + 1}</span> to <span className="font-bold text-gray-700">{Math.min(startIndex + itemsPerPage, activeDataList.length)}</span> of <span className="font-bold text-gray-700">{activeDataList.length}</span> entries
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed bg-white hover:bg-gray-50 text-gray-700"
              >
                Prev
              </button>
              <span className="text-xs text-gray-600 font-bold px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 border rounded-lg text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed bg-orange-500 text-white hover:bg-orange-600"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Details View Modal */}
      {selectedAuditLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                  <RiFileTextLine className="text-orange-500" />
                  Audit Change Details ({selectedAuditLog.category || currentCategory})
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Action by <span className="font-bold text-gray-800">{selectedAuditLog.display_name || selectedAuditLog.username}</span> (@{selectedAuditLog.username}) at {formatDateTime(selectedAuditLog.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-gray-100"
              >
                <FiX size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Action</span>
                  <div className="mt-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${getActionBadgeClass(selectedAuditLog.action)}`}>
                      {selectedAuditLog.action}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Module</span>
                  <div className="font-bold text-gray-800 mt-1">{selectedAuditLog.module}</div>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px]">User IP Address</span>
                  <div className="font-mono font-bold text-indigo-600 mt-1">{selectedAuditLog.ip_address}</div>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Role</span>
                  <div className="font-semibold text-gray-800 mt-1">{selectedAuditLog.role || 'Admin'}</div>
                </div>
              </div>

              {/* Specific change summary highlight */}
              <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl">
                <span className="text-amber-700 font-bold uppercase text-[10px] block mb-1">Specific What Was Changed</span>
                <p className="text-xs font-semibold text-gray-900">
                  {selectedAuditLog.change_summary || `${selectedAuditLog.action} in ${selectedAuditLog.module}`}
                </p>
              </div>

              <div>
                <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">Request Endpoint</span>
                <code className="block p-2.5 bg-gray-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
                  {selectedAuditLog.request_url}
                </code>
              </div>

              <div>
                <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">Payload / Submitted Parameters</span>
                <pre className="p-4 bg-gray-950 text-gray-100 rounded-xl font-mono text-[11px] max-h-60 overflow-y-auto border border-gray-800">
                  {(() => {
                    try {
                      const parsed = typeof selectedAuditLog.details === 'string' 
                        ? JSON.parse(selectedAuditLog.details) 
                        : selectedAuditLog.details;
                      return JSON.stringify(parsed, null, 2);
                    } catch (_) {
                      return selectedAuditLog.details || 'No payload details available';
                    }
                  })()}
                </pre>
              </div>
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedAuditLog(null)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-xl text-xs transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActivityMonitor;
