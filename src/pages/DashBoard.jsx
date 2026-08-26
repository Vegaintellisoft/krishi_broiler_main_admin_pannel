import React, { useEffect, useRef, useState } from 'react';
import { dashBoardIcons } from "../assets/assets"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Rectangle,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import axios from 'axios';

const DashBoard = () => {

  const [isScreenLoading, setIsScreenLoading] = useState(false)
  // Dummy summary data
  const [summaryData, setSummaryData] = useState({
    active_materials: 0,
    pending_delivery_challans: 0,
    total_delivery_challans: 0,
    total_pos: 0,
    total_suppliers: 0,
    trucks_used_today: 0,
  });

  const [truckStatusData, setTruckStatusData] = useState([]);
  const [truckChartData, setTruckChartData] = useState([]);
  const [monthChartData, setMonthChartData] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const getTruckStatus = async (from, to) => {
    try {
      const { data } = await axios.get("admin/truck-status", {
        params: {
          from: from || '',
          to: to || ''
        }
      });
      if (data.status === true) {
        setTruckStatusData(data.data);
      } else {
        console.log("Something went wrong, Try again");
        setTruckStatusData([]);
      }
    } catch (error) {
      console.log("Server Error: ", error);
    }
  };

  const fetchDashboardData = async (from, to) => {
    setIsScreenLoading(true);
    try {
      const { data } = await axios.get("admin/getAdminSummary", {
        params: {
          from: from || '',
          to: to || '',
        }
      });
      if (data.status) {
        setSummaryData(data.data.summary);
        setTruckChartData(data.data.charts.challansPerRR);

        const normalizedLineData = data.data.charts.challansOverTime.map((item) => {
          const dateObj = new Date(item.date);
          const formattedDate = dateObj.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
          }); // Output: 27 Jul
          return {
            date: formattedDate.replace(' ', '-'), // Output: 27-Jul
            count: Number(item.count),
          };
        });
        setMonthChartData(normalizedLineData);
      }
    } catch (err) {
      console.log("Server Error: ", err);
    } finally {
      setIsScreenLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData(fromDate, toDate);
    getTruckStatus(fromDate, toDate);
  }, []);

  const [searchText, setSearchText] = useState('');

  const filteredTruckStatusData = truckStatusData.filter(
    (item) =>
      (item.supplier_name && item.supplier_name.toLowerCase().includes(searchText)) ||
      (item.material_names && item.material_names.toLowerCase().includes(searchText)) ||
      (item.po_no && item.po_no.toLowerCase().includes(searchText)) ||
      (item.rr_no && item.rr_no.toLowerCase().includes(searchText))
  );

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredTruckStatusData.length / itemsPerPage);;

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredTruckStatusData.slice(startIndex, startIndex + itemsPerPage);

  // Handle pagination
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));


  if (isScreenLoading) {
    return (
      <div className="flex bg-[#F9F9FC] font-poppins pt-10 justify-center h-screen space-x-2">
        <svg
          className="animate-spin h-5 w-5 text-primary"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        <span className="text-primary font-medium">Loading...</span>
      </div>
    );
  }




  return (
    <div className=" flex-1 bg-[#F9F9FC] p-2 font-poppins">
      {/* Heading Section */}
      <div className="flex justify-between ms-3">
        <div className="heading">
          <h1 className="text-2xl font-semibold my-2">Dashboard Overview</h1>
          <p className="text text-black/50">Summary of key updates.</p>
        </div>


        {/* Date Range Filters */}
        <div className="flex gap-4 items-center me-3">
          <div>
            <label className="block text-sm font-medium text-gray-700">From</label>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => {
                setFromDate(e.target.value);
                fetchDashboardData(e.target.value, toDate);
                getTruckStatus(e.target.value, toDate)
              }}
              className="border px-3 py-2 rounded shadow-sm text-sm"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">To</label>
            <input
              type="date"
              value={toDate}
              onChange={(e) => {
                setToDate(e.target.value);
                fetchDashboardData(fromDate, e.target.value);
                getTruckStatus(fromDate, e.target.value)
              }}
              className="border px-3 py-2 rounded shadow-sm text-sm"
            />
          </div>
        </div>



      </div>

      {/* Summary Cards Section (Dynamic) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-5">
        <div className="bg-white mx-3 rounded-lg shadow-md">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="opacity-70 text-sm">Total PO's</p>
              <div className={`p-2 rounded-lg bg-[#F4ECFB] flex items-center justify-center`}>
                <img src={dashBoardIcons.fileCheckIcon} alt="Total PO" className=' h-4 object-cover' />
              </div>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight ">{summaryData.total_pos}</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="opacity-70">Total Purchase Order Created.</span>
            </div>
          </div>
        </div>

        <div className="bg-white mx-3 rounded-lg shadow-md">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="opacity-70 text-sm">Total DC</p>
              <div className={`p-2 rounded-lg bg-[#F4ECFB] flex items-center justify-center`}>
                <img src={dashBoardIcons.inPrograssIcon} alt="Total Dc" className=' h-4 object-cover' />
              </div>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight ">{summaryData.total_delivery_challans}</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="opacity-70">Delivery Challan Created.</span>
            </div>
          </div>
        </div>

        <div className="bg-white mx-3 rounded-lg shadow-md">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="opacity-70 text-sm">Total Suppliers</p>
              <div className={`p-2 rounded-lg bg-[#F4ECFB] flex items-center justify-center`}>
                <img src={dashBoardIcons.finishedIcon} alt="Finished" className=' h-4 object-cover' />
              </div>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight ">{summaryData.total_suppliers}</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="opacity-70">Suppliers</span>
            </div>
          </div>
        </div>

        <div className="bg-white mx-3 rounded-lg shadow-md">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <p className="opacity-70 text-sm">Trucks Used</p>
              <div className={`p-2 rounded-lg bg-[#F4ECFB] flex items-center justify-center`} >
                <img src={dashBoardIcons.fileCheckIcon} alt="Total POs" className=' h-4 object-cover' />
              </div>
            </div>
            <h2 className="text-2xl font-semibold tracking-tight ">{summaryData.trucks_used_today}</h2>
            <div className="flex items-center gap-2 text-sm">
              <span className="opacity-70">Total trucks used today</span>
            </div>
          </div>
        </div>
      </div>



      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 px-3 mt-6">
        {/* Truck-wise Challan Count */}
        <div className="bg-white rounded-xl shadow-md p-4 overflow-hidden">
          <div className="mb-2">
            <h2 className="text-lg font-semibold">Challan Count by RR</h2>
            <p className="text-sm text-gray-500">This Month</p>
          </div>
          <ResponsiveContainer width="100%" height={300} style={{ marginLeft: '-20px' }}>
            <BarChart data={truckChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="rr_no" tick={{ fontSize: 10 }} tickMargin={10} angle={40} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#FF8042" />
            </BarChart>
          </ResponsiveContainer>

        </div>

        {/* Monthly Challan Count (Pie Chart) */}
        <div className="bg-white rounded-xl shadow-md p-4  overflow-hidden">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Day-Wise Challan Count</h2>
            <p className="text-sm text-gray-500">This Month</p>
          </div>
          <ResponsiveContainer width="100%" height={275} style={{ marginLeft: '-20px' }}>
            <LineChart data={monthChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickMargin={15} angle={40} />
              <YAxis allowDecimals={false} />
              <Tooltip formatter={(value) => [`${value} Challans`, 'Date']} />
              <Line type="monotone" dataKey="count" stroke="#8884d8" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>

        </div>

      </div>



      {/* Truck Status Overview (Table) */}
      <div className="bg-white mx-3 rounded-lg shadow-md mt-6 p-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-xl font-semibold">Delivery Status Overview</h2>
          <input
            type="text"
            placeholder="Search by supplier/material"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value.toLowerCase())}
            className="border px-3 py-2 rounded shadow-sm text-sm w-60"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">RR No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO No.</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material(s)</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={index} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{item.rr_no}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{item.po_no}</td>
                    <td className="px-6 py-4 text-sm text-gray-700">{item.supplier_name}</td>
                    <td className="px-6 py-4 text-sm text-gray-800 font-medium">{item.material_names || '-'}</td>

                    <td className="px-6 py-4 text-sm text-center">
                      <span
                        className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          item.status === 1 || item.status === '1' || String(item.status).toLowerCase() === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : item.status === 2 || item.status === '2' || String(item.status).toLowerCase() === 'in-transit'
                              ? 'bg-blue-100 text-blue-800 border border-blue-200'
                              : item.status === 3 || item.status === '3' || String(item.status).toLowerCase() === 'active' || String(item.status).toLowerCase() === 'completed'
                                ? 'bg-green-100 text-green-700 border border-green-200'
                                : item.status === 4 || item.status === '4' || String(item.status).toLowerCase() === 'close' || String(item.status).toLowerCase() === 'closed'
                                  ? 'bg-red-100 text-red-700 border border-red-200'
                                  : 'bg-gray-100 text-gray-700 border border-gray-200'
                        }`}
                      >
                        {item.status === 1 || item.status === '1' || String(item.status).toLowerCase() === 'pending'
                          ? 'Pending'
                          : item.status === 2 || item.status === '2' || String(item.status).toLowerCase() === 'in-transit'
                            ? 'In-Transit'
                            : item.status === 3 || item.status === '3' || String(item.status).toLowerCase() === 'active' || String(item.status).toLowerCase() === 'completed'
                              ? 'Active'
                              : item.status === 4 || item.status === '4' || String(item.status).toLowerCase() === 'close' || String(item.status).toLowerCase() === 'closed'
                                ? 'Closed'
                                : typeof item.status === 'string' && item.status
                                  ? item.status.charAt(0).toUpperCase() + item.status.slice(1)
                                  : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-4 text-center text-sm text-gray-500">No delivery status data available.</td>
                </tr>
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div className="flex justify-end font-dm items-center gap-2 mt-4">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 border  rounded ${currentPage === 1 ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}
            >
              &lt;
            </button>
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm border rounded ${currentPage === 1 ? 'text-gray-400' : 'text-black'}`}
            >
              {currentPage === 1 ? "0" : "1"}
            </button>
            <span className="px-3 py-1 border font-medium rounded bg-gray-200">{currentPage}</span>
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border text-sm rounded ${currentPage === totalPages ? 'text-gray-400' : 'text-black'}`}
            >
              {totalPages}
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded ${currentPage === totalPages ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}
            >
              &gt;
            </button>
          </div>

        </div>
      </div>

    </div>
  );
};

export default DashBoard;