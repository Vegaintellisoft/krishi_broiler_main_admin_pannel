import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import ExcelExport from '../../utils/ExcelExport';
import { RiSearchLine } from 'react-icons/ri';
import { LuImport, LuRefreshCw } from 'react-icons/lu';
import { FiUsers, FiFileText, FiLogIn, FiActivity, FiChevronDown, FiChevronUp } from 'react-icons/fi';

const BroilerDashBoard = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    active_users: 0,
    total_entries: 0,
    total_logins: 0,
    unique_login_users: 0
  });
  const [reportDetails, setReportDetails] = useState([]);
  const [loginDetails, setLoginDetails] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [farmActivityDetails, setFarmActivityDetails] = useState(null);
  const [farmActivityLoading, setFarmActivityLoading] = useState(false);
  const [farmActivityError, setFarmActivityError] = useState(null);

  // Login History expanded states
  const [expandedLoginRow, setExpandedLoginRow] = useState(null);
  const [loginDetailsData, setLoginDetailsData] = useState(null);
  const [loginDetailsLoading, setLoginDetailsLoading] = useState(false);
  const [loginDetailsError, setLoginDetailsError] = useState(null);

  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [period, setPeriod] = useState('daily');
  const [searchText, setSearchText] = useState('');

  // Pagination states for main report
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Pagination states for login report
  const [loginCurrentPage, setLoginCurrentPage] = useState(1);
  const loginItemsPerPage = 5;

  const fetchReportData = async (fromVal, toVal, periodVal) => {
    setLoading(true);
    try {
      const { data } = await axios.get('/admin/broiler-dashboard-report', {
        params: {
          from: fromVal || '',
          to: toVal || '',
          period: periodVal || 'daily'
        }
      });
      if (data.status && data.data) {
        setSummary(data.data.summary || {
          active_users: 0,
          total_entries: 0,
          total_logins: 0,
          unique_login_users: 0
        });
        setReportDetails(data.data.reportDetails || []);
        setLoginDetails(data.data.loginDetails || []);
        if (data.data.fromDate) setFromDate(data.data.fromDate);
        if (data.data.toDate) setToDate(data.data.toDate);
      }
    } catch (err) {
      console.error("Error fetching broiler dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(fromDate, toDate, period);
  }, []);

  const handleRefresh = () => {
    fetchReportData(fromDate, toDate, period);
  };

  const handleFilterChange = (type, value) => {
    let nextFrom = fromDate;
    let nextTo = toDate;
    let nextPeriod = period;

    if (type === 'from') {
      setFromDate(value);
      nextFrom = value;
    } else if (type === 'to') {
      setToDate(value);
      nextTo = value;
    } else if (type === 'period') {
      setPeriod(value);
      nextPeriod = value;
    }

    fetchReportData(nextFrom, nextTo, nextPeriod);
    setCurrentPage(1);
    setLoginCurrentPage(1);
  };

  const fetchFarmActivityDetails = async (date, plant) => {
    setFarmActivityLoading(true);
    setFarmActivityDetails(null);
    setFarmActivityError(null);
    try {
      const { data } = await axios.get('/admin/broiler-farm-activity-details', {
        params: { date, plant: String(plant), period }
      });
      if (data.status && data.data) {
        setFarmActivityDetails(data.data);
      } else {
        setFarmActivityError(data.message || 'No data returned from server.');
      }
    } catch (err) {
      console.error("Error fetching farm activity details:", err);
      setFarmActivityError(err?.response?.data?.message || err.message || 'Failed to load farm activity details.');
    } finally {
      setFarmActivityLoading(false);
    }
  };

  const handleRowExpand = (rowKey, row) => {
    if (expandedRow === rowKey) {
      setExpandedRow(null);
      setFarmActivityDetails(null);
      setFarmActivityError(null);
    } else {
      setExpandedRow(rowKey);
      fetchFarmActivityDetails(row.period_date, row.plant);
    }
  };

  const fetchLoginDetails = async (date) => {
    setLoginDetailsLoading(true);
    setLoginDetailsData(null);
    setLoginDetailsError(null);
    try {
      const { data } = await axios.get('/admin/broiler-login-details', {
        params: { date, period }
      });
      if (data.status && data.data) {
        setLoginDetailsData(data.data);
      } else {
        setLoginDetailsError(data.message || 'No login details returned from server.');
      }
    } catch (err) {
      console.error("Error fetching login details:", err);
      setLoginDetailsError(err?.response?.data?.message || err.message || 'Failed to load login details.');
    } finally {
      setLoginDetailsLoading(false);
    }
  };

  const handleLoginRowExpand = (rowKey, row) => {
    if (expandedLoginRow === rowKey) {
      setExpandedLoginRow(null);
      setLoginDetailsData(null);
      setLoginDetailsError(null);
    } else {
      setExpandedLoginRow(rowKey);
      fetchLoginDetails(row.period_date);
    }
  };

  // Search filtering
  const filteredReportData = reportDetails.filter(
    (item) =>
      String(item.plant_name).toLowerCase().includes(searchText.toLowerCase()) ||
      String(item.plant).toLowerCase().includes(searchText.toLowerCase())
  );

  // Pagination for main report table
  const totalPages = Math.ceil(filteredReportData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredReportData.slice(startIndex, startIndex + itemsPerPage);

  // Pagination for login report table
  const totalLoginPages = Math.ceil(loginDetails.length / loginItemsPerPage);
  const startLoginIndex = (loginCurrentPage - 1) * loginItemsPerPage;
  const paginatedLoginData = loginDetails.slice(startLoginIndex, startLoginIndex + loginItemsPerPage);

  // Export handlers
  const handleExportEntries = () => {
    const exportData = filteredReportData.map(item => ({
      "Period Date": item.period_date,
      "Plant Code": item.plant,
      "Plant Name": item.plant_name,
      "Entries Posted": item.posted,
      "Active User Count": item.user_count,
      "User List": item.usernames || '-'
    }));
    ExcelExport(exportData, `Broiler_Entries_Report_${period}_${fromDate}_to_${toDate}.xlsx`);
  };

  const handleExportLogins = () => {
    const exportData = loginDetails.map(item => ({
      "Period Date": item.period_date,
      "Total Logins": item.login_count
    }));
    ExcelExport(exportData, `Broiler_Logins_Report_${period}_${fromDate}_to_${toDate}.xlsx`);
  };

  // Chart transformations
  // Get top plants by entries posted
  const plantChartData = reportDetails.reduce((acc, current) => {
    const existing = acc.find(item => item.name === current.plant_name);
    if (existing) {
      existing.posted += current.posted;
      existing.users = Math.max(existing.users, current.user_count);
    } else {
      acc.push({
        name: current.plant_name,
        posted: current.posted,
        users: current.user_count
      });
    }
    return acc;
  }, []).sort((a, b) => b.posted - a.posted).slice(0, 8);

  // Get chronological trends
  const trendChartData = [...reportDetails].reduce((acc, current) => {
    const existing = acc.find(item => item.date === current.period_date);
    if (existing) {
      existing.entries += current.posted;
    } else {
      acc.push({
        date: current.period_date,
        entries: current.posted,
        logins: 0
      });
    }
    return acc;
  }, []);

  // Merge logins into trend
  loginDetails.forEach(log => {
    const existing = trendChartData.find(t => t.date === log.period_date);
    if (existing) {
      existing.logins = log.login_count;
    } else {
      trendChartData.push({
        date: log.period_date,
        entries: 0,
        logins: log.login_count
      });
    }
  });

  trendChartData.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));

  return (
    <div className="flex-1 bg-[#F9F9FC] p-6 font-poppins min-h-screen">
      {/* Upper Title Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Broiler Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time mobile entries, logins, and operational insights.</p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          {/* Period selector */}
          <select
            value={period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
            className="border-gray-200 focus:ring-orange-500 focus:border-orange-500 rounded-lg text-sm p-2 bg-gray-50 font-medium text-gray-700 outline-none"
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly View</option>
            <option value="monthly">Monthly View</option>
          </select>

          {/* Date Picker - From */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 uppercase ml-2">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => handleFilterChange('from', e.target.value)}
              className="border-gray-200 focus:ring-orange-500 focus:border-orange-500 rounded-lg text-sm p-1.5 bg-gray-50 outline-none font-medium text-gray-700"
            />
          </div>

          {/* Date Picker - To */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 uppercase">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => handleFilterChange('to', e.target.value)}
              className="border-gray-200 focus:ring-orange-500 focus:border-orange-500 rounded-lg text-sm p-1.5 bg-gray-50 outline-none font-medium text-gray-700"
            />
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 bg-gray-50 hover:bg-orange-50 hover:text-orange-500 text-gray-600 rounded-lg transition-all"
            title="Refresh Data"
          >
            <LuRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Entries */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Entries</p>
            <h3 className="text-3xl font-bold text-gray-900">{summary?.total_entries || 0}</h3>
            <p className="text-xs text-green-500 font-medium">Farm activities & challans</p>
          </div>
          <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl">
            <FiFileText className="h-6 w-6" />
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Users</p>
            <h3 className="text-3xl font-bold text-gray-900">{summary?.active_users || 0}</h3>
            <p className="text-xs text-indigo-500 font-medium">Supervisors entering data</p>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-500 rounded-2xl">
            <FiUsers className="h-6 w-6" />
          </div>
        </div>

        {/* Total Logins */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Logins</p>
            <h3 className="text-3xl font-bold text-gray-900">{summary?.total_logins || 0}</h3>
            <p className="text-xs text-blue-500 font-medium">Mobile login sessions logged</p>
          </div>
          <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl">
            <FiLogIn className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Entries by Plant */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-950">Top Plants by Activity</h3>
            <p className="text-sm text-gray-500">Cumulative entries submitted per plant</p>
          </div>
          <div className="h-80 w-full">
            {plantChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={plantChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} angle={25} tickMargin={12} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', fontFamily: 'Poppins' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Bar dataKey="posted" fill="#F3890A" radius={[8, 8, 0, 0]} name="Entries Posted" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No entries data for selected date range.</div>
            )}
          </div>
        </div>

        {/* Trends over Time */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-950">Submissions & Logins Trend</h3>
            <p className="text-sm text-gray-500">Comparing activities and user logins chronologically</p>
          </div>
          <div className="h-80 w-full">
            {trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', fontFamily: 'Poppins' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Poppins' }} />
                  <Line type="monotone" dataKey="entries" stroke="#F3890A" strokeWidth={2.5} name="Entries Posted" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="logins" stroke="#3B82F6" strokeWidth={2.5} name="User Logins" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No trend data for selected date range.</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Report Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-950">Farm Activity Report</h3>
            <p className="text-sm text-gray-500">Farm activity entries per plant — click a count to view farmer-wise details.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Period selector */}
            <select
              value={period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-xl text-xs p-2 bg-gray-50 font-medium text-gray-700 outline-none"
            >
              <option value="daily">Daily View</option>
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly View</option>
            </select>

            {/* From Date */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-2 px-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="bg-transparent outline-none text-xs font-medium text-gray-700"
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-2 px-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="bg-transparent outline-none text-xs font-medium text-gray-700"
              />
            </div>

            {/* Search */}
            <div className="relative flex-1 md:flex-none">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <RiSearchLine className="text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search Plant..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-4 py-2 border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none rounded-xl text-xs w-full md:w-44 bg-gray-50 font-medium"
              />
            </div>

            {/* Export */}
            <button
              onClick={handleExportEntries}
              className="px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-100 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all shadow-sm"
            >
              <LuImport size={14} />
              <span>Export Excel</span>
            </button>
          </div>
        </div>

        {/* Table container */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold text-xs text-left">
                <th className="px-6 py-4 rounded-l-xl">Period Date</th>
                <th className="px-6 py-4">Plant Code</th>
                <th className="px-6 py-4">Plant Name</th>
                <th className="px-6 py-4 text-center rounded-r-xl">Farm Activities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => {
                  const rowKey = `${row.period_date}-${row.plant}-${idx}`;
                  const isExpanded = expandedRow === rowKey;
                  return (
                    <React.Fragment key={idx}>
                      <tr className={`hover:bg-gray-50 transition-all cursor-pointer ${isExpanded ? 'bg-orange-50/50' : ''}`} onClick={() => handleRowExpand(rowKey, row)}>
                        <td className="px-6 py-4 font-semibold text-gray-900">{row.period_date}</td>
                        <td className="px-6 py-4 text-gray-500">{row.plant}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{row.plant_name}</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className="px-3 py-1 bg-orange-50 text-orange-600 font-bold rounded-full text-xs cursor-pointer hover:bg-orange-100 hover:shadow-md transition-all inline-flex items-center gap-1"
                          title="Click to view farmer details"
                          >
                            {row.posted}
                            {isExpanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                          </span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="4" className="p-0">
                            <div className="bg-gradient-to-br from-orange-50/60 to-amber-50/40 border-t border-b border-orange-100 px-6 py-5">
                              {farmActivityLoading ? (
                                <div className="flex items-center justify-center py-8 gap-2">
                                  <LuRefreshCw className="animate-spin text-orange-500" size={18} />
                                  <span className="text-sm text-gray-500 font-medium">Loading farm activity details...</span>
                                </div>
                              ) : farmActivityError ? (
                                <div className="flex items-center gap-2 py-5 px-3 bg-red-50 rounded-xl border border-red-100">
                                  <span className="text-red-500 text-xs font-semibold">⚠ Error: {farmActivityError}</span>
                                </div>
                              ) : farmActivityDetails ? (
                                <div className="space-y-3">
                                  {/* Farmer-level Entries Table */}
                                  <div>
                                    <h4 className="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                      <FiActivity className="text-orange-500" size={15} />
                                      Farm Activity Entries — {farmActivityDetails.plant_name}
                                      <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold">{farmActivityDetails.summary.total_entries} entries · {farmActivityDetails.summary.unique_farmers} farmers</span>
                                    </h4>
                                    <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
                                      <table className="min-w-full text-xs">
                                        <thead>
                                          <tr className="bg-white text-gray-500 font-semibold text-[10px] uppercase tracking-wider">
                                            <th className="px-3 py-2.5 text-left">Farmer</th>
                                            <th className="px-3 py-2.5 text-left">Batch</th>
                                            <th className="px-3 py-2.5 text-center">Age</th>
                                            <th className="px-3 py-2.5 text-center">Housed</th>
                                            <th className="px-3 py-2.5 text-center">Stock</th>
                                            <th className="px-3 py-2.5 text-center">Mortality</th>
                                            <th className="px-3 py-2.5 text-center">Cum Mort %</th>
                                            <th className="px-3 py-2.5 text-center">Body Wt</th>
                                            <th className="px-3 py-2.5 text-center">Farm Maint.</th>
                                            <th className="px-3 py-2.5 text-center">Litter Qlty</th>
                                            <th className="px-3 py-2.5 text-center">Drinker Clean</th>
                                            <th className="px-3 py-2.5 text-left">Material</th>
                                            <th className="px-3 py-2.5 text-center">Feed Bags (Qty)</th>
                                            <th className="px-3 py-2.5 text-center">Balance Stock</th>
                                            <th className="px-3 py-2.5 text-center">Cum Feed</th>
                                            <th className="px-3 py-2.5 text-left">Treatment</th>
                                            <th className="px-3 py-2.5 text-left">Posted By</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                          {farmActivityDetails.entries.length > 0 ? (
                                            farmActivityDetails.entries.map((entry, eIdx) => (
                                              <tr key={eIdx} className="bg-white hover:bg-gray-50 transition-all">
                                                <td className="px-3 py-2.5 whitespace-nowrap">
                                                  {entry.farmer_name ? (
                                                    <>
                                                      <div className="font-semibold text-gray-800">{entry.farmer_name}</div>
                                                      <div className="text-[10px] text-gray-400 font-medium mt-0.5">{entry.farmer}</div>
                                                    </>
                                                  ) : (
                                                    <>
                                                      <div className="font-semibold text-gray-800">{entry.farmer || '-'}</div>
                                                      <div className="text-[10px] text-gray-400 font-medium mt-0.5">Name N/A</div>
                                                    </>
                                                  )}
                                                </td>
                                                <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{entry.batch || '-'}</td>
                                                <td className="px-3 py-2.5 text-center text-gray-600">{entry.age || '-'}</td>
                                                <td className="px-3 py-2.5 text-center">
                                                  <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-semibold">{entry.housed || '-'}</span>
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                  <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-semibold">{entry.stock || '-'}</span>
                                                </td>
                                                <td className="px-3 py-2.5 text-center">
                                                  <span className={`px-2 py-0.5 rounded-full font-semibold ${Number(entry.mortality) > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
                                                    {entry.mortality || '0'}
                                                  </span>
                                                </td>
                                                <td className="px-3 py-2.5 text-center text-gray-600">{entry.cum_mortality_percentage || '-'}%</td>
                                                <td className="px-3 py-2.5 text-center">
                                                  <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-semibold">{entry.body_weight || '-'}</span>
                                                </td>
                                                <td className="px-3 py-2.5 text-center text-gray-600">{entry.farms_maintenance || '-'}</td>
                                                <td className="px-3 py-2.5 text-center text-gray-600">{entry.litter_quality || '-'}</td>
                                                <td className="px-3 py-2.5 text-center text-gray-600">{entry.drinker_cleaning || '-'}</td>
                                                {/* Material Details - supports multiple materials */}
                                                {entry.materials && Array.isArray(entry.materials) && entry.materials.length > 0 ? (
                                                  <>
                                                    <td className="px-3 py-2.5 text-left">
                                                      <div className="flex flex-col gap-1">
                                                        {entry.materials.map((m, mIdx) => (
                                                          <span key={mIdx} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full font-semibold text-[10px] whitespace-nowrap block w-fit">
                                                            {m.material_label || m.material || '-'}
                                                          </span>
                                                        ))}
                                                      </div>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                      <div className="flex flex-col gap-1 items-center">
                                                        {entry.materials.map((m, mIdx) => (
                                                          <span key={mIdx} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-semibold">
                                                            {m.qty || '0'}
                                                          </span>
                                                        ))}
                                                      </div>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                      <div className="flex flex-col gap-1 items-center">
                                                        {entry.materials.map((m, mIdx) => (
                                                          <span key={mIdx} className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-full font-semibold">
                                                            {m.stock || '0'}
                                                          </span>
                                                        ))}
                                                      </div>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                      <div className="flex flex-col gap-1 items-center">
                                                        {entry.materials.map((m, mIdx) => (
                                                          <span key={mIdx} className="text-gray-600">
                                                            {m.cum_feed || '-'}
                                                          </span>
                                                        ))}
                                                      </div>
                                                    </td>
                                                  </>
                                                ) : (
                                                  <>
                                                    <td className="px-3 py-2.5 text-left">
                                                      <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full font-semibold text-[10px] whitespace-nowrap">
                                                        {entry.material || '-'}
                                                      </span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                      <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-semibold">{entry.quantity_bags || '-'}</span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                      <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-full font-semibold">{entry.stock_bags || '-'}</span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center text-gray-600">{entry.cum_feed || '-'}</td>
                                                  </>
                                                )}
                                                <td className="px-3 py-2.5 text-gray-600 max-w-[120px] truncate" title={entry.treatment}>{entry.treatment || '-'}</td>
                                                <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{entry.user_display_name}</td>
                                              </tr>
                                            ))
                                          ) : (
                                            <tr>
                                              <td colSpan="17" className="px-4 py-6 text-center text-gray-400 font-medium">
                                                No farm activity entries found for this date and plant.
                                              </td>
                                            </tr>
                                          )}
                                        </tbody>
                                      </table>
                                    </div>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-6 text-gray-400 text-sm">No farm activity data available.</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400 font-medium">
                    {loading ? "Loading report data..." : "No reports available for selected period and filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 border rounded-lg text-xs font-semibold ${currentPage === 1 ? 'text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed' : 'text-white bg-orange-500 border-orange-500 hover:bg-orange-600'}`}
            >
              Prev
            </button>
            <span className="text-xs text-gray-500 font-semibold px-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 border rounded-lg text-xs font-semibold ${currentPage === totalPages ? 'text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed' : 'text-white bg-orange-500 border-orange-500 hover:bg-orange-600'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Login History Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-950">User Login History Report</h3>
            <p className="text-sm text-gray-500">Chronological count of logins and distinct users in the period.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Period selector */}
            <select
              value={period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-xl text-xs p-2 bg-gray-50 font-medium text-gray-700 outline-none"
            >
              <option value="daily">Daily View</option>
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly View</option>
            </select>

            {/* From Date */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-2 px-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="bg-transparent outline-none text-xs font-medium text-gray-700"
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-2 px-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="bg-transparent outline-none text-xs font-medium text-gray-700"
              />
            </div>

            {/* Export */}
            <button
              onClick={handleExportLogins}
              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white border border-blue-100 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all shadow-sm"
            >
              <LuImport size={14} />
              <span>Export Logins</span>
            </button>
          </div>
        </div>

        {/* Table container */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold text-xs text-left">
                <th className="px-6 py-4 rounded-l-xl">Period Date</th>
                <th className="px-6 py-4 text-center rounded-r-xl">Total Logins</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {paginatedLoginData.length > 0 ? (
                paginatedLoginData.map((row, idx) => {
                  const rowKey = `login-${row.period_date}-${idx}`;
                  const isExpanded = expandedLoginRow === rowKey;
                  return (
                    <React.Fragment key={idx}>
                      <tr
                        className={`hover:bg-gray-50 transition-all cursor-pointer ${isExpanded ? 'bg-orange-50/40' : ''}`}
                        onClick={() => handleLoginRowExpand(rowKey, row)}
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                          <span className={`p-1 rounded-md transition-colors ${isExpanded ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}>
                            {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                          </span>
                          <span>{row.period_date}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className="px-4 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-full text-xs cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-2xs"
                            title="Click to view logged in user details"
                          >
                            <span>{row.login_count}</span>
                            <span className="text-[10px] text-blue-400 font-normal">logins</span>
                          </span>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan="2" className="p-0">
                            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border-t border-b border-blue-100 px-6 py-5">
                              {loginDetailsLoading ? (
                                <div className="flex items-center justify-center py-8 gap-2">
                                  <LuRefreshCw className="animate-spin text-blue-500" size={18} />
                                  <span className="text-sm text-gray-500 font-medium">Loading logged-in user details...</span>
                                </div>
                              ) : loginDetailsError ? (
                                <div className="flex items-center gap-2 py-4 px-4 bg-red-50 rounded-xl border border-red-100 text-red-600 text-xs font-semibold">
                                  <span>⚠ Error: {loginDetailsError}</span>
                                </div>
                              ) : loginDetailsData ? (
                                <div className="space-y-4">
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                      <FiUsers className="text-blue-500" size={16} />
                                      <span>Logged-In Users on {loginDetailsData.date}</span>
                                      <span className="ml-1 px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-extrabold">
                                        {loginDetailsData.total_logins} Total Logins
                                      </span>
                                    </h4>
                                  </div>

                                  {/* Logged in users table */}
                                  <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                                    <table className="min-w-full text-xs">
                                      <thead>
                                        <tr className="bg-gray-50 text-gray-600 font-semibold text-[11px] uppercase tracking-wider border-b border-gray-200">
                                          <th className="px-6 py-3 text-center w-14">#</th>
                                          <th className="px-6 py-3 text-left">User</th>
                                          <th className="px-6 py-3 text-left">Role</th>
                                          <th className="px-6 py-3 text-left">Plant / Branch</th>
                                          <th className="px-6 py-3 text-left">Login Time</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {loginDetailsData.allLogins && loginDetailsData.allLogins.length > 0 ? (
                                          loginDetailsData.allLogins.map((item, uIdx) => (
                                            <tr key={uIdx} className="hover:bg-blue-50/40 transition-colors">
                                              <td className="px-6 py-3.5 text-center font-bold text-gray-400">
                                                {uIdx + 1}
                                              </td>
                                              <td className="px-6 py-3.5">
                                                <div className="font-bold text-gray-900">{item.fullname || item.username}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">@{item.username}</div>
                                              </td>
                                              <td className="px-6 py-3.5">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 font-semibold rounded-md text-[11px]">
                                                  {item.role || 'Supervisor'}
                                                </span>
                                              </td>
                                              <td className="px-6 py-3.5">
                                                {item.plant_name && item.plant_name !== '-' ? (
                                                  <span className="px-2.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 font-semibold rounded-md text-[11px]">
                                                    {item.plant_name}
                                                  </span>
                                                ) : (
                                                  <span className="text-gray-400 font-medium">-</span>
                                                )}
                                              </td>
                                              <td className="px-6 py-3.5 text-gray-800 font-semibold whitespace-nowrap">
                                                {item.login_time
                                                  ? new Date(item.login_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
                                                  : item.time_only || '-'}
                                              </td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr>
                                            <td colSpan="5" className="px-6 py-6 text-center text-gray-400 font-medium">
                                              No login logs found for this date.
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-6 text-gray-400 text-sm">No login data available.</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="2" className="px-6 py-8 text-center text-gray-400 font-medium">
                    No login logs recorded in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalLoginPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-6">
            <button
              onClick={() => setLoginCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={loginCurrentPage === 1}
              className={`px-3 py-1.5 border rounded-lg text-xs font-semibold ${loginCurrentPage === 1 ? 'text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed' : 'text-white bg-orange-500 border-orange-500 hover:bg-orange-600'}`}
            >
              Prev
            </button>
            <span className="text-xs text-gray-500 font-semibold px-2">Page {loginCurrentPage} of {totalLoginPages}</span>
            <button
              onClick={() => setLoginCurrentPage(prev => Math.min(prev + 1, totalLoginPages))}
              disabled={loginCurrentPage === totalLoginPages}
              className={`px-3 py-1.5 border rounded-lg text-xs font-semibold ${loginCurrentPage === totalLoginPages ? 'text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed' : 'text-white bg-orange-500 border-orange-500 hover:bg-orange-600'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default BroilerDashBoard;
