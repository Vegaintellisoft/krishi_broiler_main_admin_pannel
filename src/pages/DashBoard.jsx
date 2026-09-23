import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

// PO status: 1=Pending, 2=In-Transit, 3=Active, 4=Close
export const poStatusLabel = (s) => {
  const v = parseInt(s);
  if (v === 1) return { label: 'Pending',    cls: 'bg-yellow-100 text-yellow-800 border border-yellow-200' };
  if (v === 2) return { label: 'In-Transit', cls: 'bg-blue-100 text-blue-800 border border-blue-200' };
  if (v === 3) return { label: 'Active',     cls: 'bg-green-100 text-green-700 border border-green-200' };
  if (v === 4) return { label: 'Close',      cls: 'bg-red-100 text-red-700 border border-red-200' };
  return { label: '-', cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
};

// DC status: 0=Cancelled, 1=Active, 2=Cancelled, 3=Pending
export const dcStatusLabel = (s) => {
  const v = parseInt(s);
  if (v === 0) return { label: 'Cancelled', cls: 'bg-red-100 text-red-700 border border-red-200' };
  if (v === 1) return { label: 'Active',    cls: 'bg-green-100 text-green-700 border border-green-200' };
  if (v === 2) return { label: 'Cancelled', cls: 'bg-red-100 text-red-700 border border-red-200' };
  if (v === 3) return { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-800 border border-yellow-200' };
  return { label: '-', cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
};

const DashBoard = () => {
  const navigate = useNavigate();
  const [isScreenLoading, setIsScreenLoading] = useState(false)
  // Dummy summary data
  const [summaryData, setSummaryData] = useState({
    active_materials: 0,
    total_materials: 0,
    pending_delivery_challans: 0,
    total_delivery_challans: 0,
    total_pos: 0,
    total_suppliers: 0,
    trucks_used_today: 0,
    trucks_used: 0,
    total_truck_trips: 0,
  });

  const [truckStatusData, setTruckStatusData] = useState([]);
  const [truckChartData, setTruckChartData] = useState([]);
  const [monthChartData, setMonthChartData] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [poTruckData, setPoTruckData] = useState([]);
  const [expandedPo, setExpandedPo] = useState(null);
  const [poSearchText, setPoSearchText] = useState('');
  const [poCurrentPage, setPoCurrentPage] = useState(1);

  // Modal states for clicking summary cards
  const [activeModal, setActiveModal] = useState(null); // 'po' | 'dc' | 'supplier' | 'truck'
  const [modalData, setModalData] = useState([]);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [modalSearch, setModalSearch] = useState('');
  const [modalPage, setModalPage] = useState(1);
  const modalPageSize = 10;

  const openDetailModal = async (type) => {
    setActiveModal(type);
    setModalSearch('');
    setModalPage(1);
    setIsModalLoading(true);
    try {
      const { data } = await axios.get("admin/dashboard-modal-details", {
        params: {
          type,
          from: fromDate || '',
          to: toDate || ''
        }
      });
      if (data.status) {
        setModalData(data.data || []);
      } else {
        setModalData([]);
      }
    } catch (err) {
      console.error("Error fetching modal details:", err);
      setModalData([]);
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeDetailModal = () => {
    setActiveModal(null);
    setModalData([]);
    setModalSearch('');
  };

  const modalFilteredData = modalData.filter((item) => {
    if (!modalSearch) return true;
    const q = modalSearch.toLowerCase();
    if (activeModal === 'po') {
      return (
        (item.po_no && item.po_no.toLowerCase().includes(q)) ||
        (item.rr_no && item.rr_no.toLowerCase().includes(q)) ||
        (item.supplier_name && item.supplier_name.toLowerCase().includes(q)) ||
        (item.material_names && item.material_names.toLowerCase().includes(q))
      );
    }
    if (activeModal === 'dc') {
      return (
        (item.doc_no && item.doc_no.toLowerCase().includes(q)) ||
        (item.truck_no && item.truck_no.toLowerCase().includes(q)) ||
        (item.rr_no && item.rr_no.toLowerCase().includes(q)) ||
        (item.token_no && item.token_no.toLowerCase().includes(q))
      );
    }
    if (activeModal === 'supplier') {
      return (
        (item.name && item.name.toLowerCase().includes(q)) ||
        (item.supplier_id && String(item.supplier_id).toLowerCase().includes(q))
      );
    }
    if (activeModal === 'truck') {
      return item.truck_no && item.truck_no.toLowerCase().includes(q);
    }
    return true;
  });

  const modalTotalPages = Math.ceil(modalFilteredData.length / modalPageSize);
  const modalPaginatedData = modalFilteredData.slice(
    (modalPage - 1) * modalPageSize,
    modalPage * modalPageSize
  );
  const poItemsPerPage = 5;

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

  const getPoTruckSummary = async (from, to) => {
    try {
      const { data } = await axios.get("admin/po-truck-summary", {
        params: { from: from || '', to: to || '' }
      });
      if (data.status === true) {
        setPoTruckData(data.data);
      } else {
        setPoTruckData([]);
      }
    } catch (error) {
      console.log("Server Error (PO Truck Summary): ", error);
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
    getPoTruckSummary(fromDate, toDate);
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
                getTruckStatus(e.target.value, toDate);
                getPoTruckSummary(e.target.value, toDate);
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
                getTruckStatus(fromDate, e.target.value);
                getPoTruckSummary(fromDate, e.target.value);
              }}
              className="border px-3 py-2 rounded shadow-sm text-sm"
            />
          </div>
        </div>



      </div>

      {/* Summary Cards Section (Dynamic) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mt-5">
        {/* Card 1: Total PO's */}
        <div
          onClick={() => openDetailModal('po')}
          className="bg-white mx-3 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-xl hover:border-orange-400 border border-transparent transition-all duration-200 transform hover:-translate-y-1 group"
          title="Click to view Purchase Order details"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="opacity-70 text-sm font-medium">Total PO's</p>
            <div className="p-2 rounded-lg bg-[#F4ECFB] flex items-center justify-center group-hover:bg-orange-100 transition">
              <img src={dashBoardIcons.fileCheckIcon} alt="Total PO" className="h-4 object-cover" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{summaryData.total_pos}</h2>
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="opacity-70">Total Purchase Order Created.</span>
          </div>
          <div className="flex items-center justify-between text-xs text-orange-600 font-medium mt-3 pt-2 border-t border-gray-100">
            <span>Click to view details</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>

        {/* Card 2: Total DC */}
        <div
          onClick={() => openDetailModal('dc')}
          className="bg-white mx-3 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-xl hover:border-orange-400 border border-transparent transition-all duration-200 transform hover:-translate-y-1 group"
          title="Click to view Delivery Challan details"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="opacity-70 text-sm font-medium">Total DC</p>
            <div className="p-2 rounded-lg bg-[#F4ECFB] flex items-center justify-center group-hover:bg-orange-100 transition">
              <img src={dashBoardIcons.inPrograssIcon} alt="Total Dc" className="h-4 object-cover" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{summaryData.total_delivery_challans}</h2>
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="opacity-70">Delivery Challan Created.</span>
          </div>
          <div className="flex items-center justify-between text-xs text-orange-600 font-medium mt-3 pt-2 border-t border-gray-100">
            <span>Click to view details</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>

        {/* Card 3: Total Suppliers */}
        <div
          onClick={() => openDetailModal('supplier')}
          className="bg-white mx-3 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-xl hover:border-orange-400 border border-transparent transition-all duration-200 transform hover:-translate-y-1 group"
          title="Click to view Suppliers details"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="opacity-70 text-sm font-medium">Total Suppliers</p>
            <div className="p-2 rounded-lg bg-[#F4ECFB] flex items-center justify-center group-hover:bg-orange-100 transition">
              <img src={dashBoardIcons.finishedIcon} alt="Suppliers" className="h-4 object-cover" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{summaryData.total_suppliers}</h2>
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="opacity-70">Suppliers Registered.</span>
          </div>
          <div className="flex items-center justify-between text-xs text-orange-600 font-medium mt-3 pt-2 border-t border-gray-100">
            <span>Click to view details</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </div>
        </div>

        {/* Card 4: Trucks Used */}
        <div
          onClick={() => openDetailModal('truck')}
          className="bg-white mx-3 rounded-lg shadow-md p-4 cursor-pointer hover:shadow-xl hover:border-orange-400 border border-transparent transition-all duration-200 transform hover:-translate-y-1 group"
          title="Click to view Trucks Used details"
        >
          <div className="flex items-center justify-between mb-3">
            <p className="opacity-70 text-sm font-medium">Trucks Used</p>
            <div className="p-2 rounded-lg bg-[#F4ECFB] flex items-center justify-center group-hover:bg-orange-100 transition">
              <img src={dashBoardIcons.asn} alt="Trucks Used" className="h-4 object-cover" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            {summaryData.trucks_used ?? summaryData.trucks_used_today ?? 0}
          </h2>
          <div className="flex items-center gap-2 text-sm mt-1">
            <span className="opacity-70">
              {summaryData.total_truck_trips ? `${summaryData.total_truck_trips} total dispatches` : (fromDate && toDate ? 'Trucks in period' : 'Distinct trucks used')}
            </span>
          </div>
          <div className="flex items-center justify-between text-xs text-orange-600 font-medium mt-3 pt-2 border-t border-gray-100">
            <span>Click to view details</span>
            <span className="transition-transform group-hover:translate-x-1">→</span>
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


      {/* PO-wise Truck Usage Section */}
      {(() => {
        const filteredPoData = poTruckData.filter((item) =>
          (item.po_no && item.po_no.toLowerCase().includes(poSearchText.toLowerCase())) ||
          (item.supplier_name && item.supplier_name.toLowerCase().includes(poSearchText.toLowerCase())) ||
          (item.material_names && item.material_names.toLowerCase().includes(poSearchText.toLowerCase()))
        );
        const poTotalPages = Math.ceil(filteredPoData.length / poItemsPerPage);
        const poStart = (poCurrentPage - 1) * poItemsPerPage;
        const poPaginated = filteredPoData.slice(poStart, poStart + poItemsPerPage);

        // PO status: 1=Pending, 2=In-Transit, 3=Active, 4=Close
        const poStatusLabel = (s) => {
          const v = parseInt(s);
          if (v === 1) return { label: 'Pending',    cls: 'bg-yellow-100 text-yellow-800 border border-yellow-200' };
          if (v === 2) return { label: 'In-Transit', cls: 'bg-blue-100 text-blue-800 border border-blue-200' };
          if (v === 3) return { label: 'Active',     cls: 'bg-green-100 text-green-700 border border-green-200' };
          if (v === 4) return { label: 'Close',      cls: 'bg-red-100 text-red-700 border border-red-200' };
          return { label: '-', cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
        };

        // DC status: 0=Cancelled, 1=Active, 2=Cancelled, 3=Pending
        const dcStatusLabel = (s) => {
          const v = parseInt(s);
          if (v === 0) return { label: 'Cancelled', cls: 'bg-red-100 text-red-700 border border-red-200' };
          if (v === 1) return { label: 'Active',    cls: 'bg-green-100 text-green-700 border border-green-200' };
          if (v === 2) return { label: 'Cancelled', cls: 'bg-red-100 text-red-700 border border-red-200' };
          if (v === 3) return { label: 'Pending',   cls: 'bg-yellow-100 text-yellow-800 border border-yellow-200' };
          return { label: '-', cls: 'bg-gray-100 text-gray-600 border border-gray-200' };
        };

        return (
          <div id="po-truck-section" className="bg-white mx-3 rounded-lg shadow-md mt-6 p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-xl font-semibold">PO-wise Truck Usage</h2>
                <p className="text-sm text-gray-500 mt-0.5">Trucks dispatched per Purchase Order</p>
              </div>
              <input
                type="text"
                placeholder="Search by PO / supplier / material"
                value={poSearchText}
                onChange={(e) => { setPoSearchText(e.target.value); setPoCurrentPage(1); }}
                className="border px-3 py-2 rounded shadow-sm text-sm w-64"
              />
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-8"></th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">PO No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">RR No.</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Material(s)</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">PO Status</th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase">Trucks Used</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {poPaginated.length > 0 ? (
                    poPaginated.map((item, idx) => {
                      const isExpanded = expandedPo === item.po_id;
                      const trucks = Array.isArray(item.trucks) ? item.trucks : [];
                      return (
                        <React.Fragment key={item.po_id || idx}>
                          {/* PO Row */}
                          <tr
                            className="hover:bg-orange-50 cursor-pointer transition"
                            onClick={() => setExpandedPo(isExpanded ? null : item.po_id)}
                          >
                            <td className="px-4 py-3 text-center">
                              <span className={`inline-block transition-transform duration-200 text-gray-500 font-bold ${ isExpanded ? 'rotate-90' : '' }`}>
                                ▶
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm font-semibold text-gray-900">{item.po_no || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-600">{item.rr_no || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-700">{item.supplier_name || '-'}</td>
                            <td className="px-4 py-3 text-sm text-gray-800">{item.material_names || '-'}</td>
                            <td className="px-4 py-3 text-center">
                              {(() => { const ps = poStatusLabel(item.po_status); return <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${ps.cls}`}>{ps.label}</span>; })()}
                            </td>
                            <td className="px-4 py-3 text-center">
                              <div className="flex flex-col items-center">
                                <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full bg-orange-100 text-orange-700 font-bold text-sm">
                                  {item.distinct_trucks !== undefined ? item.distinct_trucks : (item.total_trucks || 0)}
                                </span>
                                {item.total_trucks > 0 && item.distinct_trucks !== undefined && Number(item.total_trucks) !== Number(item.distinct_trucks) && (
                                  <span className="text-[10px] text-gray-500 mt-0.5 whitespace-nowrap">({item.total_trucks} trips)</span>
                                )}
                              </div>
                            </td>
                          </tr>

                          {/* Expanded Truck Details Row */}
                          {isExpanded && (
                            <tr>
                              <td colSpan={7} className="px-4 py-0 bg-orange-50">
                                <div className="py-3 px-2">
                                  {trucks.length > 0 ? (
                                    <>
                                      <p className="text-xs font-semibold text-orange-700 mb-2 uppercase tracking-wide">
                                        Truck Details for PO: {item.po_no} ({trucks.length} {trucks.length === 1 ? 'Dispatch' : 'Dispatches'}{item.distinct_trucks !== undefined ? `, ${item.distinct_trucks} Trucks` : ''})
                                      </p>
                                      <table className="min-w-full text-sm border rounded-lg overflow-hidden">
                                        <thead>
                                          <tr className="bg-orange-100 text-orange-800">
                                            <th className="px-4 py-2 text-left font-semibold">#</th>
                                            <th className="px-4 py-2 text-left font-semibold">Truck No.</th>
                                            <th className="px-4 py-2 text-left font-semibold">DC No.</th>
                                            <th className="px-4 py-2 text-left font-semibold">Token No.</th>
                                            <th className="px-4 py-2 text-center font-semibold">Status</th>
                                            <th className="px-4 py-2 text-left font-semibold">Date</th>
                                          </tr>
                                        </thead>
                                        <tbody className="divide-y divide-orange-100 bg-white">
                                          {trucks.map((truck, ti) => {
                                            const st = dcStatusLabel(truck.status);
                                            return (
                                              <tr key={truck.dc_id || ti} className="hover:bg-orange-50 transition">
                                                <td className="px-4 py-2 text-gray-500">{ti + 1}</td>
                                                <td className="px-4 py-2 font-semibold text-gray-900">
                                                  <span className="inline-flex items-center gap-1">
                                                    <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v2m0 0h2l3 3v5a2 2 0 01-2 2h-1M8 17a2 2 0 104 0M8 17H12" /></svg>
                                                    {truck.truck_no || '-'}
                                                  </span>
                                                </td>
                                                <td className="px-4 py-2 text-gray-700">{truck.doc_no || '-'}</td>
                                                <td className="px-4 py-2 text-gray-700">{truck.token_no || '-'}</td>
                                                <td className="px-4 py-2 text-center">
                                                  <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${st.cls}`}>{st.label}</span>
                                                </td>
                                                <td className="px-4 py-2 text-gray-500 text-xs">{truck.created_at || '-'}</td>
                                              </tr>
                                            );
                                          })}
                                        </tbody>
                                      </table>
                                    </>
                                  ) : (
                                    <p className="text-sm text-gray-500 py-2">No trucks dispatched for this PO yet.</p>
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
                      <td colSpan={7} className="px-6 py-6 text-center text-sm text-gray-500">No PO truck data available.</td>
                    </tr>
                  )}
                </tbody>
              </table>

              {/* PO Table Pagination */}
              {poTotalPages > 1 && (
                <div className="flex justify-end font-dm items-center gap-2 mt-4">
                  <button
                    onClick={() => setPoCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={poCurrentPage === 1}
                    className={`px-3 py-1 border rounded ${poCurrentPage === 1 ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}
                  >&lt;</button>
                  <span className="px-3 py-1 border font-medium rounded bg-gray-200">{poCurrentPage} / {poTotalPages}</span>
                  <button
                    onClick={() => setPoCurrentPage((p) => Math.min(p + 1, poTotalPages))}
                    disabled={poCurrentPage === poTotalPages}
                    className={`px-3 py-1 border rounded ${poCurrentPage === poTotalPages ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}
                  >&gt;</button>
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Dashboard Details Modal */}
      {activeModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fadeIn"
          onClick={closeDetailModal}
        >
          <div
            className="bg-white w-full max-w-5xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gradient-to-r from-orange-50/60 via-white to-orange-50/40">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-lg shadow-sm">
                  {activeModal === 'po' && '📋'}
                  {activeModal === 'dc' && '🚚'}
                  {activeModal === 'supplier' && '🏢'}
                  {activeModal === 'truck' && '🚛'}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {activeModal === 'po' && "Purchase Orders (PO) Details"}
                      {activeModal === 'dc' && "Delivery Challans (DC) Details"}
                      {activeModal === 'supplier' && "Suppliers Details"}
                      {activeModal === 'truck' && "Trucks Used Details"}
                    </h3>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-orange-100 text-orange-800">
                      {modalData.length} Total
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {fromDate && toDate ? `Filtered period: ${fromDate} to ${toDate}` : 'All-time records summary'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {activeModal === 'po' && (
                  <button
                    onClick={() => navigate('/POMaster')}
                    className="px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition border border-orange-200 flex items-center gap-1 shadow-sm"
                  >
                    Open PO Master ↗
                  </button>
                )}
                {activeModal === 'dc' && (
                  <button
                    onClick={() => navigate('/dc')}
                    className="px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition border border-orange-200 flex items-center gap-1 shadow-sm"
                  >
                    Open DC Page ↗
                  </button>
                )}
                {activeModal === 'supplier' && (
                  <button
                    onClick={() => navigate('/supplierMaster')}
                    className="px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition border border-orange-200 flex items-center gap-1 shadow-sm"
                  >
                    Open Supplier Master ↗
                  </button>
                )}
                {activeModal === 'truck' && (
                  <button
                    onClick={() => {
                      closeDetailModal();
                      document.getElementById('po-truck-section')?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="px-3 py-1.5 text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 rounded-lg transition border border-orange-200 flex items-center gap-1 shadow-sm"
                  >
                    PO Truck Table ↓
                  </button>
                )}
                <button
                  onClick={closeDetailModal}
                  className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition text-base font-bold ml-1"
                  title="Close"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Search Bar */}
            <div className="px-6 py-3 border-b border-gray-100 bg-gray-50/60 flex justify-between items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder={
                    activeModal === 'po' ? "Search by PO No, RR No, supplier, material..." :
                    activeModal === 'dc' ? "Search by DC No, truck, RR, token..." :
                    activeModal === 'supplier' ? "Search by supplier name, ID..." :
                    "Search by truck number..."
                  }
                  value={modalSearch}
                  onChange={(e) => { setModalSearch(e.target.value); setModalPage(1); }}
                  className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 shadow-sm"
                  autoFocus
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <span className="text-xs text-gray-500 font-medium whitespace-nowrap">
                Showing {modalFilteredData.length} of {modalData.length} entries
              </span>
            </div>

            {/* Modal Table Content */}
            <div className="flex-1 overflow-y-auto px-6 py-3 min-h-[320px]">
              {isModalLoading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  <span className="text-sm text-gray-500 font-medium">Loading details...</span>
                </div>
              ) : modalFilteredData.length === 0 ? (
                <div className="text-center py-16 text-gray-500">
                  <p className="text-lg font-medium">No records found</p>
                  <p className="text-sm text-gray-400 mt-1">Try modifying your search query or date filters.</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                  <thead className="bg-gray-50 sticky top-0 shadow-sm">
                    {activeModal === 'po' && (
                      <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">PO No.</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">RR No.</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Supplier</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Material(s)</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">PO Date</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase">Trucks Used</th>
                      </tr>
                    )}
                    {activeModal === 'dc' && (
                      <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">DC / Doc No.</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Truck No.</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">RR No.</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Token No.</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Dispatch Date</th>
                      </tr>
                    )}
                    {activeModal === 'supplier' && (
                      <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Supplier ID</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Supplier Name</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase">Total POs</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase">Total DCs</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase">Status</th>
                      </tr>
                    )}
                    {activeModal === 'truck' && (
                      <tr>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">#</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Truck No.</th>
                        <th className="px-3 py-2.5 text-center text-xs font-semibold text-gray-600 uppercase">Total Dispatches / Trips</th>
                        <th className="px-3 py-2.5 text-left text-xs font-semibold text-gray-600 uppercase">Last Active Date</th>
                      </tr>
                    )}
                  </thead>
                  <tbody className="divide-y divide-gray-100 bg-white">
                    {modalPaginatedData.map((item, idx) => {
                      const rowIdx = (modalPage - 1) * modalPageSize + idx + 1;
                      if (activeModal === 'po') {
                        const st = poStatusLabel(item.status);
                        return (
                          <tr key={item.id || idx} className="hover:bg-orange-50/50 transition">
                            <td className="px-3 py-2.5 text-gray-400 text-xs">{rowIdx}</td>
                            <td className="px-3 py-2.5 font-semibold text-gray-900">{item.po_no || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-600">{item.rr_no || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-700">{item.supplier_name || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-600 max-w-xs truncate">{item.material_names || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-500 text-xs">{item.po_date || item.created_at || '-'}</td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${st.cls}`}>{st.label}</span>
                            </td>
                            <td className="px-3 py-2.5 text-center font-semibold text-orange-700">
                              {item.distinct_trucks || item.total_trucks || 0}
                              {item.total_trucks > 0 && item.distinct_trucks && Number(item.total_trucks) !== Number(item.distinct_trucks) && (
                                <span className="text-[10px] text-gray-400 font-normal ml-1">({item.total_trucks} trips)</span>
                              )}
                            </td>
                          </tr>
                        );
                      }
                      if (activeModal === 'dc') {
                        const st = dcStatusLabel(item.status);
                        return (
                          <tr key={item.id || idx} className="hover:bg-orange-50/50 transition">
                            <td className="px-3 py-2.5 text-gray-400 text-xs">{rowIdx}</td>
                            <td className="px-3 py-2.5 font-semibold text-gray-900">{item.doc_no || '-'}</td>
                            <td className="px-3 py-2.5 font-semibold text-orange-700 flex items-center gap-1">
                              <svg className="w-3.5 h-3.5 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v2m0 0h2l3 3v5a2 2 0 01-2 2h-1M8 17a2 2 0 104 0M8 17H12" /></svg>
                              {item.truck_no || '-'}
                            </td>
                            <td className="px-3 py-2.5 text-gray-600">{item.rr_no || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-600">{item.token_no || '-'}</td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${st.cls}`}>{st.label}</span>
                            </td>
                            <td className="px-3 py-2.5 text-gray-500 text-xs">{item.created_at || '-'}</td>
                          </tr>
                        );
                      }
                      if (activeModal === 'supplier') {
                        return (
                          <tr key={item.id || idx} className="hover:bg-orange-50/50 transition">
                            <td className="px-3 py-2.5 text-gray-400 text-xs">{rowIdx}</td>
                            <td className="px-3 py-2.5 font-mono text-xs text-gray-600">{item.supplier_id || '-'}</td>
                            <td className="px-3 py-2.5 font-semibold text-gray-900">{item.name || '-'}</td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                                {item.total_pos || 0}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                {item.total_dcs || 0}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                                item.status === 1 || item.status === '1'
                                  ? 'bg-green-100 text-green-700 border border-green-200'
                                  : 'bg-gray-100 text-gray-600 border border-gray-200'
                              }`}>
                                {item.status === 1 || item.status === '1' ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                          </tr>
                        );
                      }
                      if (activeModal === 'truck') {
                        return (
                          <tr key={item.truck_no || idx} className="hover:bg-orange-50/50 transition">
                            <td className="px-3 py-2.5 text-gray-400 text-xs">{rowIdx}</td>
                            <td className="px-3 py-2.5 font-bold text-gray-900 flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 17H5a2 2 0 01-2-2V7a2 2 0 012-2h10a2 2 0 012 2v2m0 0h2l3 3v5a2 2 0 01-2 2h-1M8 17a2 2 0 104 0M8 17H12" /></svg>
                              {item.truck_no}
                            </td>
                            <td className="px-3 py-2.5 text-center">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-200">
                                {item.total_trips} {item.total_trips === '1' ? 'Trip' : 'Trips'}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-gray-500 text-xs">{item.last_trip_date || '-'}</td>
                          </tr>
                        );
                      }
                      return null;
                    })}
                  </tbody>
                </table>
              )}
            </div>

            {/* Modal Pagination Footer */}
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center text-xs">
              <span className="text-gray-500 font-medium">
                Page {modalPage} of {modalTotalPages || 1}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setModalPage(1)}
                  disabled={modalPage === 1}
                  className={`px-2.5 py-1 rounded border text-xs ${modalPage === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  « First
                </button>
                <button
                  onClick={() => setModalPage((p) => Math.max(p - 1, 1))}
                  disabled={modalPage === 1}
                  className={`px-2.5 py-1 rounded border text-xs ${modalPage === 1 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  ‹ Prev
                </button>
                <span className="px-3 py-1 font-semibold text-orange-600 bg-orange-50 border border-orange-200 rounded">
                  {modalPage}
                </span>
                <button
                  onClick={() => setModalPage((p) => Math.min(p + 1, modalTotalPages))}
                  disabled={modalPage === modalTotalPages || modalTotalPages === 0}
                  className={`px-2.5 py-1 rounded border text-xs ${modalPage === modalTotalPages || modalTotalPages === 0 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  Next ›
                </button>
                <button
                  onClick={() => setModalPage(modalTotalPages)}
                  disabled={modalPage === modalTotalPages || modalTotalPages === 0}
                  className={`px-2.5 py-1 rounded border text-xs ${modalPage === modalTotalPages || modalTotalPages === 0 ? 'text-gray-300 border-gray-200 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-100'}`}
                >
                  Last »
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default DashBoard;