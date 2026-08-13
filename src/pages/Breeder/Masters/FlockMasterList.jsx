import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';
import { FaSort } from 'react-icons/fa';
import Swal from 'sweetalert2';

const FlockMasterList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleEdit = (row) => {
        navigate('/flockmaster/add', { state: { editData: row } });
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d4af37',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                setFlockData(prev => prev.filter(item => item.flock_no !== id));
                Swal.fire('Deleted!', 'Your record has been deleted.', 'success')
            }
        })
    };

    const [flockData, setFlockData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Static dummy data for flock master
    useEffect(() => {
        const dummyData = [
            { flock_no: "FL-2024-001", flock_name: "Batch A - 2024", hatchery_date: "2024-01-15", created_user: "admin", system_date: "2024-01-15", system_time: "10:00:00", status: "A" },
            { flock_no: "FL-2024-002", flock_name: "Batch B - 2024", hatchery_date: "2024-03-20", created_user: "admin", system_date: "2024-03-20", system_time: "11:30:00", status: "A" },
            { flock_no: "FL-2025-001", flock_name: "Batch C - 2025", hatchery_date: "2025-01-10", created_user: "admin", system_date: "2025-01-10", system_time: "09:15:00", status: "A" },
            { flock_no: "FL-2023-099", flock_name: "Old Batch", hatchery_date: "2023-11-05", created_user: "admin", system_date: "2023-11-05", system_time: "14:45:00", status: "I" }
        ];
        setFlockData(dummyData);
        setFilteredData(dummyData);
        setLoading(false);
    }, []);

    // Search / filter
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredData(flockData);
        } else {
            const term = searchTerm.toLowerCase();
            setFilteredData(
                flockData.filter(item =>
                    (item.flock_no && String(item.flock_no).toLowerCase().includes(term)) ||
                    (item.flock_name && item.flock_name.toLowerCase().includes(term)) ||
                    (item.updated_user && item.updated_user.toLowerCase().includes(term)) ||
                    (item.created_user && item.created_user.toLowerCase().includes(term))
                )
            );
        }
        setCurrentPage(1);
    }, [searchTerm, flockData]);

    // Helpers
    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
    };

    const formatDateTime = (dateStr, timeStr) => {
        if (!dateStr) return '—';
        const d = new Date(dateStr);
        if (isNaN(d)) return dateStr;
        const datePart = d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
        if (timeStr) {
            const timePart = timeStr.length > 5 ? timeStr.substring(0, 5) : timeStr;
            return `${datePart} ${timePart}`;
        }
        return datePart;
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIdx = (currentPage - 1) * rowsPerPage;
    const paginatedData = filteredData.slice(startIdx, startIdx + rowsPerPage);

    return (
        <div className="w-full m-0 font-poppins p-[20px] bg-[#f9f9fc] min-h-screen text-[#1C1C1C]">
            {/* Header */}
            <div className="flex justify-between items-center mb-[25px]">
                <h3 className="text-[18px] font-bold text-[#1c1c1c] m-0">Flock Master</h3>
                <div className="flex gap-[15px] items-center">
                    <div className="relative flex items-center">
                        <input
                            type="text"
                            placeholder="Search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="h-[38px] px-[35px] pl-[15px] rounded-[20px] border border-[#e0e0e0] bg-white text-[13px] text-[#666] outline-none transition-all duration-200 min-w-[220px]"
                        />
                        <FiSearch className="absolute right-[12px] text-[#bbb] text-[14px]" />
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-16 text-[#6b7280] text-[14px]">
                    <div className="w-[22px] h-[22px] border-[3px] border-[#e5e7eb] border-t-[#F3890A] rounded-full animate-spin mr-2.5"></div>
                    Loading flock master data...
                </div>
            ) : paginatedData.length === 0 ? (
                <div className="text-center py-12 text-[#9ca3af] text-[14px]">
                    {searchTerm ? 'No results found for your search.' : 'No flock master records found.'}
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="rounded-[10px] shadow-[0_1px_6px_rgba(0,0,0,0.07)] overflow-x-auto bg-white border border-[#f0f0f0]">
                        <table className="w-full border-collapse text-[13px]">
                            <thead className="bg-[#f1f3f5] border-b-2 border-[#e5e7eb]">
                                <tr>
                                    <th className="py-3 px-4 text-left font-semibold text-[#374151] whitespace-nowrap">Flock No</th>
                                    <th className="py-3 px-4 text-left font-semibold text-[#374151] whitespace-nowrap">Flock Name</th>
                                    <th className="py-3 px-4 text-left font-semibold text-[#374151] whitespace-nowrap">Hatchery Date</th>
                                    <th className="py-3 px-4 text-left font-semibold text-[#374151] whitespace-nowrap">User</th>
                                    <th className="py-3 px-4 text-left font-semibold text-[#374151] whitespace-nowrap">Last Update</th>
                                    <th className="py-3 px-4 text-left font-semibold text-[#374151] whitespace-nowrap">Status</th>
                                    <th className="py-3 px-4 text-center font-semibold text-[#374151] whitespace-nowrap">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((item, index) => {
                                    const statusClasses = item.status === 'A' ? 'bg-[#d1fae5] text-[#065f46]' : 'bg-[#fee2e2] text-[#991b1b]';
                                    const statusText = item.status === 'A' ? 'Active' : 'In Active';
                                    return (
                                        <tr key={item.flock_no || index} className="border-b border-[#f0f0f0] transition-colors duration-150 hover:bg-[#fef9f0]">
                                            <td className="py-[11px] px-4 text-[#4b5563] whitespace-nowrap">{item.flock_no ?? '—'}</td>
                                            <td className="py-[11px] px-4 text-[#4b5563] whitespace-nowrap">{item.flock_name || '—'}</td>
                                            <td className="py-[11px] px-4 text-[#4b5563] whitespace-nowrap">{formatDate(item.hatchery_date)}</td>
                                            <td className="py-[11px] px-4 text-[#4b5563] whitespace-nowrap">{item.updated_user || item.created_user || '—'}</td>
                                            <td className="py-[11px] px-4 text-[#4b5563] whitespace-nowrap">{formatDateTime(item.system_date, item.system_time)}</td>
                                            <td className="py-[11px] px-4 whitespace-nowrap">
                                                <span className={`inline-block py-1 px-3.5 rounded-[5px] text-[12px] font-semibold text-center min-w-[70px] ${statusClasses}`}>
                                                    {statusText}
                                                </span>
                                            </td>
                                            <td className="py-[11px] px-4 whitespace-nowrap">
                                                <div className="flex items-center justify-center gap-2">
                                                    <button className="p-1 px-[10px] bg-[#F2F4F7] text-gray-600 rounded-md hover:bg-blue-100 hover:text-blue-600 transition-colors tooltip text-[12px] font-medium" onClick={() => handleEdit(item)}>
                                                        Edit
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination Options */}
                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-4 text-[13px] text-[#6b7280]">
                            <span>
                                Showing {startIdx + 1}–{Math.min(startIdx + rowsPerPage, filteredData.length)} of {filteredData.length}
                            </span>
                            <div className="flex gap-1.5">
                                <button
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage(prev => prev - 1)}
                                    className="py-1.5 px-3.5 border border-[#d1d5db] bg-white rounded-md cursor-pointer text-[12px] font-medium text-[#374151] transition-all duration-150 hover:not-disabled:bg-[#F3890A] hover:not-disabled:text-white hover:not-disabled:border-[#F3890A] disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage(prev => prev + 1)}
                                    className="py-1.5 px-3.5 border border-[#d1d5db] bg-white rounded-md cursor-pointer text-[12px] font-medium text-[#374151] transition-all duration-150 hover:not-disabled:bg-[#F3890A] hover:not-disabled:text-white hover:not-disabled:border-[#F3890A] disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default FlockMasterList;
