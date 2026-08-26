import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { 
  RiArrowUpSFill, 
  RiSearchLine, 
  RiSmartphoneLine, 
  RiComputerLine, 
  RiTimeLine, 
  RiRefreshLine, 
  RiFileTextLine, 
  RiUserLine,
  RiFilter3Line,
  RiAppsLine
} from 'react-icons/ri';
import { LuImport } from 'react-icons/lu';
import { FiActivity, FiEye, FiX, FiCheckCircle } from 'react-icons/fi';
import { formatDateTime } from '../../utils/helper';
import ExcelExport from '../../utils/ExcelExport';
import { useAuth } from '../../auth/AuthContext';

const ActivityMonitor = () => {
  const { user } = useAuth();
  const currentCategory = user?.category || 'Broiler';

  // Active Tab: 'all' | 'mobile' | 'admin'
  const [activeTab, setActiveTab] = useState('all');

  // Logs & Loading states
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [mobileTotalCount, setMobileTotalCount] = useState(0);
  const [adminTotalCount, setAdminTotalCount] = useState(0);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [moduleFilter, setModuleFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all'); // 'all' | 'mobile' | 'admin'

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  // Selected Log for Details Modal
  const [selectedLog, setSelectedLog] = useState(null);

  // Fetch Activity Logs based on active tab & filters
  const fetchActivities = async () => {
    setLoading(true);
    try {
      // Determine endpoint & source parameter based on active tab
      const endpoint = activeTab === 'all' 
        ? '/admin/activity-logs/all' 
        : activeTab === 'mobile' 
          ? '/admin/activity-logs/mobile' 
          : '/admin/activity-logs/admin';

      const { data } = await axios.get(endpoint, {
        params: {
          category: currentCategory,
          source: activeTab === 'all' ? (sourceFilter !== 'all' ? sourceFilter : 'all') : activeTab,
          from: fromDate || '',
          to: toDate || '',
          search: searchQuery || '',
          action: actionFilter !== 'all' ? actionFilter : '',
          module: moduleFilter !== 'all' ? moduleFilter : '',
          limit: 1000,
          offset: 0
        }
      });

      if (data.status && data.data) {
        setLogs(data.data.activities || []);
        setTotalCount(data.data.total || 0);
        setMobileTotalCount(data.data.mobileTotal || 0);
        setAdminTotalCount(data.data.adminTotal || 0);
      } else {
        setLogs([]);
        setTotalCount(0);
        setMobileTotalCount(0);
        setAdminTotalCount(0);
      }
    } catch (err) {
      console.error("Error fetching activity logs:", err);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivities();
    setCurrentPage(1);
  }, [activeTab, currentCategory, fromDate, toDate, actionFilter, moduleFilter, sourceFilter]);

  // Client-side quick filter on loaded dataset for ultra responsive search
  const filteredLogs = useMemo(() => {
    if (!searchQuery) return logs;
    const q = searchQuery.toLowerCase();
    return logs.filter(
      item =>
        (item.fullname && item.fullname.toLowerCase().includes(q)) ||
        (item.username && item.username.toLowerCase().includes(q)) ||
        (item.description && item.description.toLowerCase().includes(q)) ||
        (item.module && item.module.toLowerCase().includes(q)) ||
        (item.action && item.action.toLowerCase().includes(q)) ||
        (item.ip_address && item.ip_address.toLowerCase().includes(q)) ||
        (item.request_url && item.request_url.toLowerCase().includes(q))
    );
  }, [logs, searchQuery]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredLogs.slice(startIndex, startIndex + itemsPerPage);

  // Distinct Modules for Filter Dropdown
  const uniqueModules = useMemo(() => {
    const modules = logs.map(l => l.module).filter(Boolean);
    return [...new Set(modules)].sort();
  }, [logs]);

  // Excel Export Handler
  const handleExport = () => {
    const exportData = filteredLogs.map(item => ({
      "Category": item.category || currentCategory,
      "Source": item.source === 'mobile' ? 'Mobile App' : 'Admin Panel',
      "Full Name": item.fullname || item.username,
      "Username": item.username,
      "Role": item.role || (item.source === 'mobile' ? 'Supervisor' : 'Admin'),
      "Action": item.action,
      "Module": item.module,
      "Activity Details": item.description || '-',
      "User IP Address": item.ip_address || '-',
      "Request URL": item.request_url || '-',
      "Timestamp": formatDateTime(item.created_at)
    }));

    const filePrefix = activeTab === 'all' ? 'All_Activities' : activeTab === 'mobile' ? 'Mobile_Activities' : 'Admin_Audit_Trail';
    ExcelExport(exportData, `${currentCategory}_${filePrefix}_${new Date().toISOString().slice(0, 10)}.xlsx`);
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
      case 'SUBMIT':
        return 'bg-purple-50 text-purple-700 border border-purple-300 font-bold';
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
            onClick={fetchActivities}
            className="p-2.5 bg-white hover:bg-orange-50 hover:text-orange-500 text-gray-600 rounded-xl border border-gray-200 transition-all shadow-sm flex items-center gap-1.5 text-xs font-semibold"
            title="Refresh logs"
          >
            <RiRefreshLine className={`h-4 w-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-6">
        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Platform Activities</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{totalCount}</h3>
            <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1">
              <RiAppsLine /> Combined Mobile & Admin stream
            </p>
          </div>
          <div className="p-3.5 bg-emerald-50 text-emerald-500 rounded-xl">
            <RiAppsLine size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Mobile App Activities</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{mobileTotalCount}</h3>
            <p className="text-[11px] text-orange-600 font-medium flex items-center gap-1">
              <RiSmartphoneLine /> {currentCategory === 'Wagon' ? 'Delivery Challan, Purchase Orders, Dispatches' : currentCategory === 'Breeder' ? 'Bio Security, Feed Details' : 'Farm entry, BOS, Feed, Receipts'}
            </p>
          </div>
          <div className="p-3.5 bg-orange-50 text-orange-500 rounded-xl">
            <RiSmartphoneLine size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Panel Changes</p>
            <h3 className="text-2xl font-extrabold text-gray-900">{adminTotalCount}</h3>
            <p className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
              <RiComputerLine /> Roles, Users, Passwords & Masters
            </p>
          </div>
          <div className="p-3.5 bg-blue-50 text-blue-500 rounded-xl">
            <RiComputerLine size={24} />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Audit Security Status</p>
            <h3 className="text-base font-bold text-emerald-600 flex items-center gap-1.5">
              <FiCheckCircle className="text-emerald-500" /> Active Tracking
            </h3>
            <p className="text-[11px] text-gray-400 font-medium">
              Clean IP, User & Payload Captured
            </p>
          </div>
          <div className="p-3.5 bg-purple-50 text-purple-500 rounded-xl">
            <FiCheckCircle size={24} />
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        {/* Tab Navigation & Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-gray-100 pb-5 mb-5">
          <div className="flex items-center gap-1.5 bg-gray-100/90 p-1.5 rounded-xl flex-wrap">
            {/* Tab 1: All Activities */}
            <button
              onClick={() => setActiveTab('all')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'all'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <RiAppsLine size={15} />
              <span>All Activities</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'all' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-700'}`}>
                {totalCount}
              </span>
            </button>

            {/* Tab 2: Mobile App Activities */}
            <button
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'mobile'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <RiSmartphoneLine size={15} />
              <span>Mobile App Activities</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'mobile' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-700'}`}>
                {mobileTotalCount}
              </span>
            </button>

            {/* Tab 3: Admin Audit Trail */}
            <button
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'admin'
                  ? 'bg-white text-orange-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <RiComputerLine size={15} />
              <span>Admin Audit Trail</span>
              <span className={`px-2 py-0.5 rounded-full text-[10px] ${activeTab === 'admin' ? 'bg-orange-100 text-orange-700' : 'bg-gray-200 text-gray-700'}`}>
                {adminTotalCount}
              </span>
            </button>
          </div>

          {/* Date & Search Filters */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            {/* Live Search Input */}
            <div className="relative flex-1 lg:flex-initial">
              <span className="absolute left-3 top-2.5 text-gray-400">
                <RiSearchLine size={14} />
              </span>
              <input
                type="search"
                placeholder="Search user, IP, activity..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full lg:w-56 pl-8 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-orange-500 font-medium"
              />
            </div>

            {/* Source Filter (Visible on 'all' tab) */}
            {activeTab === 'all' && (
              <select
                value={sourceFilter}
                onChange={(e) => setSourceFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Sources</option>
                <option value="mobile">📱 Mobile App</option>
                <option value="admin">💻 Admin Panel</option>
              </select>
            )}

            {/* Module Filter */}
            {uniqueModules.length > 0 && (
              <select
                value={moduleFilter}
                onChange={(e) => setModuleFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500 max-w-[140px]"
              >
                <option value="all">All Modules</option>
                {uniqueModules.map((m, idx) => (
                  <option key={idx} value={m}>{m}</option>
                ))}
              </select>
            )}

            {/* Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="bg-gray-50 border border-gray-200 rounded-xl p-2 text-xs font-semibold text-gray-700 outline-none focus:ring-2 focus:ring-orange-500"
            >
              <option value="all">All Actions</option>
              <option value="CREATE">CREATE</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
              <option value="SUBMIT">SUBMIT</option>
              <option value="CANCEL">CANCEL</option>
            </select>

            {/* From Date */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 px-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="bg-transparent outline-none text-xs font-medium text-gray-700"
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-1 bg-gray-50 border border-gray-200 rounded-xl p-1 px-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="bg-transparent outline-none text-xs font-medium text-gray-700"
              />
            </div>
          </div>
        </div>

        {/* Normalized Unified Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left divide-y divide-gray-100">
            <thead>
              <tr className="bg-gray-50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                <th className="px-4 py-3.5 rounded-l-xl">S.No</th>
                <th className="px-4 py-3.5">Source</th>
                <th className="px-4 py-3.5">User</th>
                <th className="px-4 py-3.5">Role</th>
                <th className="px-4 py-3.5 text-center">Action</th>
                <th className="px-4 py-3.5">Module</th>
                <th className="px-4 py-3.5">Specific Activity Details</th>
                <th className="px-4 py-3.5 text-center">User IP</th>
                <th className="px-4 py-3.5 text-right">Time</th>
                <th className="px-4 py-3.5 text-center rounded-r-xl">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs text-gray-700">
              {loading ? (
                <tr>
                  <td colSpan="10" className="py-14 text-center">
                    <div className="flex flex-col justify-center items-center gap-2">
                      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-xs text-gray-400 font-medium">Loading activity logs...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-gray-50/80 transition-all">
                    <td className="px-4 py-3.5 font-semibold text-gray-400">
                      {startIndex + idx + 1}
                    </td>

                    {/* Source Pill */}
                    <td className="px-4 py-3.5">
                      {row.source === 'mobile' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-orange-50 text-orange-700 border border-orange-200 whitespace-nowrap shadow-2xs">
                          <RiSmartphoneLine size={12} /> Mobile App
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 whitespace-nowrap shadow-2xs">
                          <RiComputerLine size={12} /> Admin Panel
                        </span>
                      )}
                    </td>

                    {/* User Fullname & Username */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-gray-900 flex items-center gap-1.5">
                        <RiUserLine className={row.source === 'mobile' ? "text-orange-500" : "text-blue-500"} />
                        <span>{row.fullname || row.username}</span>
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono">@{row.username}</div>
                    </td>

                    {/* Role */}
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-semibold text-[10px] whitespace-nowrap">
                        {row.role || (row.source === 'mobile' ? 'Supervisor' : 'Admin')}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-center">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${getActionBadgeClass(row.action)}`}>
                        {row.action || 'CREATE'}
                      </span>
                    </td>

                    {/* Module */}
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-gray-800 whitespace-nowrap">{row.module || 'Operations'}</div>
                      {row.request_url && (
                        <div className="text-[9px] text-gray-400 font-mono truncate max-w-[120px]" title={row.request_url}>
                          {row.request_url}
                        </div>
                      )}
                    </td>

                    {/* Specific Description */}
                    <td className="px-4 py-3.5 max-w-sm">
                      <div className="font-medium text-gray-900 bg-gray-50 p-2 rounded-lg border border-gray-200/70 text-[11px] leading-relaxed">
                        {row.description || `${row.action} in ${row.module}`}
                      </div>
                    </td>

                    {/* IP Address */}
                    <td className="px-4 py-3.5 text-center">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-mono font-bold rounded text-[10px] border border-indigo-200 whitespace-nowrap">
                        {row.ip_address || '127.0.0.1'}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td className="px-4 py-3.5 text-right font-medium text-gray-600 whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1 text-gray-800 font-semibold text-[11px]">
                        <RiTimeLine className="text-gray-400" />
                        <span>{formatDateTime(row.created_at)}</span>
                      </div>
                    </td>

                    {/* Details Eye Button */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => setSelectedLog(row)}
                        className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                        title="View activity payload"
                      >
                        <FiEye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="10" className="px-6 py-12 text-center text-gray-400 font-medium">
                    No activity logs recorded in {currentCategory} matching the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-100">
            <span className="text-xs text-gray-400">
              Showing <span className="font-bold text-gray-700">{startIndex + 1}</span> to <span className="font-bold text-gray-700">{Math.min(startIndex + itemsPerPage, filteredLogs.length)}</span> of <span className="font-bold text-gray-700">{filteredLogs.length}</span> entries
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
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-150">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-gray-50/50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <RiFileTextLine className="text-orange-500" />
                    Activity Details
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${selectedLog.source === 'mobile' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                    {selectedLog.source === 'mobile' ? '📱 Mobile App' : '💻 Admin Panel'}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">
                  Action by <span className="font-bold text-gray-800">{selectedLog.fullname || selectedLog.username}</span> (@{selectedLog.username}) at {formatDateTime(selectedLog.created_at)}
                </p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
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
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${getActionBadgeClass(selectedLog.action)}`}>
                      {selectedLog.action}
                    </span>
                  </div>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Module</span>
                  <div className="font-bold text-gray-800 mt-1">{selectedLog.module}</div>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px]">User IP Address</span>
                  <div className="font-mono font-bold text-indigo-600 mt-1">{selectedLog.ip_address}</div>
                </div>
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px]">Role</span>
                  <div className="font-semibold text-gray-800 mt-1">{selectedLog.role || (selectedLog.source === 'mobile' ? 'Supervisor' : 'Admin')}</div>
                </div>
              </div>

              {/* Specific change summary highlight */}
              <div className="bg-amber-50/80 border border-amber-200 p-3.5 rounded-xl">
                <span className="text-amber-700 font-bold uppercase text-[10px] block mb-1">Specific What Was Done</span>
                <p className="text-xs font-semibold text-gray-900 leading-relaxed">
                  {selectedLog.description || `${selectedLog.action} in ${selectedLog.module}`}
                </p>
              </div>

              {selectedLog.request_url && (
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">Request Endpoint</span>
                  <code className="block p-2.5 bg-gray-900 text-emerald-400 rounded-lg font-mono text-[11px] overflow-x-auto">
                    {selectedLog.request_url}
                  </code>
                </div>
              )}

              {selectedLog.payload && (
                <div>
                  <span className="text-gray-400 font-bold uppercase text-[10px] block mb-1">Payload / Submitted Parameters</span>
                  <pre className="p-4 bg-gray-950 text-gray-100 rounded-xl font-mono text-[11px] max-h-60 overflow-y-auto border border-gray-800">
                    {(() => {
                      try {
                        const parsed = typeof selectedLog.payload === 'string' 
                          ? JSON.parse(selectedLog.payload) 
                          : selectedLog.payload;
                        return JSON.stringify(parsed, null, 2);
                      } catch (_) {
                        return JSON.stringify(selectedLog.payload, null, 2);
                      }
                    })()}
                  </pre>
                </div>
              )}
            </div>

            <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
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
