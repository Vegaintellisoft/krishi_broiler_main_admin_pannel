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
  const [reportData, setReportData] = useState({
  summary: {},
  farmActivity: [],
  billSupply: [],
  shedReady: [],
  issueMedicine: []
});

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

  const getFarmReport = async () => {
  try {

const { data } = await axios.get(
  "admin/farm-activity-report"
);

console.log("Farm Report Response:", data);
    console.log("Farm Report API:", data);

if (data?.status === true) {
  console.log("Setting report data", data.data);
  setReportData(data.data);
}

  } catch (error) {
    console.log(error);
  }
};


useEffect(() => {
  fetchDashboardData(fromDate, toDate);
  getTruckStatus(fromDate, toDate);
  getFarmReport();

  const interval = setInterval(() => {
    getFarmReport();
  }, 30000); // refresh every 30 seconds

  return () => clearInterval(interval);
}, []);
  const [searchText, setSearchText] = useState('');

  const filteredTruckStatusData = truckStatusData.filter(
    (item) =>
      item.supplier_name.toLowerCase().includes(searchText) ||
      item.material_names.toLowerCase().includes(searchText)
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



<div className="bg-white mx-3 rounded-lg shadow-md mt-5 p-4">

  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mx-3 mt-5">

  {/* Farm Activity */}
  <div className="bg-white rounded-lg shadow-md p-4">
    <h2 className="font-semibold text-lg mb-3">
      Farm Activity ({reportData.summary?.farmActivity || 0})
    </h2>

    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left">Plant</th>
          <th className="text-left">Entries</th>
        </tr>
      </thead>

      <tbody>
        {reportData?.farmActivity?.map((item,index)=>(
          <tr key={index}>
            <td>{item.plant}</td>
            <td>{item.entries}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Bill Supply */}
  <div className="bg-white rounded-lg shadow-md p-4">
    <h2 className="font-semibold text-lg mb-3">
      Bill Supply ({reportData.summary?.billSupply || 0})
    </h2>

    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left">Plant</th>
          <th className="text-left">Entries</th>
        </tr>
      </thead>

      <tbody>
        {reportData?.billSupply?.map((item,index)=>(
          <tr key={index}>
            <td>{item.plant}</td>
            <td>{item.entries}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Shed Ready */}
  <div className="bg-white rounded-lg shadow-md p-4">
    <h2 className="font-semibold text-lg mb-3">
      Shed Ready ({reportData.summary?.shedReady || 0})
    </h2>

    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left">Plant</th>
          <th className="text-left">Entries</th>
        </tr>
      </thead>

      <tbody>
        {reportData?.shedReady?.map((item,index)=>(
          <tr key={index}>
            <td>{item.plant}</td>
            <td>{item.entries}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

  {/* Issue Medicine */}
  <div className="bg-white rounded-lg shadow-md p-4">
    <h2 className="font-semibold text-lg mb-3">
      Issue Medicine ({reportData.summary?.issueMedicine || 0})
    </h2>

    <table className="w-full">
      <thead>
        <tr>
          <th className="text-left">Branch</th>
          <th className="text-left">Entries</th>
        </tr>
      </thead>

      <tbody>
        {reportData?.issueMedicine?.map((item,index)=>(
          <tr key={index}>
            <td>{item.branch}</td>
            <td>{item.entries}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

</div>


</div>

      {/* Truck Status Overview (Table) */}
      <div className="bg-white mx-3 rounded-lg shadow-md mt-5 p-4">
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Loaded</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Arrived</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {paginatedData.length > 0 ? (
                paginatedData.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 text-sm">{item.rr_no}</td>
                    <td className="px-6 py-4 text-sm">{item.po_no}</td>
                    <td className="px-6 py-4 text-sm">{item.supplier_name}</td>
                    <td className="px-6 py-4 text-sm">{item.material_names}</td>

                    <td className="px-6 py-4 text-sm">
                      <span className="w-8 h-8 rounded-full justify-center items-center text-sm inline-flex font-semibold  bg-blue-100 text-blue-800">
                        {item.loaded}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <span className="w-8 h-8 rounded-full justify-center items-center text-sm inline-flex font-semibold  bg-green-100 text-green-800">
                        {item.arrived}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-sm">
                      <span className="w-8 h-8 rounded-full justify-center items-center text-sm inline-flex font-semibold  bg-yellow-100 text-yellow-800">
                        {item.pending}
                      </span>
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">No truck status data available.</td>
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