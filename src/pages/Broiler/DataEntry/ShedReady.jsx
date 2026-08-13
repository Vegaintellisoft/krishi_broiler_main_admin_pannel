import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowUpSFill, RiSearchLine, RiDeleteBin6Line } from 'react-icons/ri'
import { LuImport, LuPlus } from 'react-icons/lu'
import { IoCloseSharp } from 'react-icons/io5'
import { FiEdit2 } from 'react-icons/fi'
import Swal from "sweetalert2";
import axios from 'axios';
import { useAuth } from '../../../auth/AuthContext'
import ExcelExport from '../../../utils/ExcelExport'
import { formatDate } from '../../../utils/helper'

const ShedReady = () => {
    // --- Permissions (Mocked for safety if context is missing) ---
    const { getPermissions } = useAuth();
    const { shedReadiness } = getPermissions();

    // --- State Management ---
    const [data, setData] = useState([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editId, setEditId] = useState(null);

    // --- Form State ---
    const initialFormState = {
        plant: '1501',
        farmer: '',
        date: new Date().toISOString().split('T')[0],
        chickHouseCapacity: '',
        batchNo: '',
        prevBatch: '',
        excessHoused: ''
    };

    const [formData, setFormData] = useState(initialFormState);
    const farmerDB = {
        "FARM-001": { name: "FARM-001 | Krishnan", capacity: 5000, batch: "B-2025-01", prevBatch: "B-2024-12" },
        "FARM-002": { name: "FARM-002 | Balaji", capacity: 4500, batch: "B-2025-05", prevBatch: "B-2024-11" },
        "FARM-003": { name: "FARM-003 | Kumar", capacity: 6000, batch: "B-2025-08", prevBatch: "B-2025-01" },
    };

    // --- Fetch Data ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const shedReadyRes = await axios.get("/broiler/shed-readiness/getAll");
        console.log(shedReadyRes)

        if(shedReadyRes.data.status) {
            setData(shedReadyRes.data.data);
        } else {
            setData([]);
        }
    };

    // --- Handlers ---

    const openModal = (item = null) => {
        if (item) {
            setFormData(item);
            setEditId(item.id);
        } else {
            setFormData(initialFormState);
            setEditId(null);
        }
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setFormData(initialFormState);
        setEditId(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Special Handler for Farmer Selection to trigger Auto-population
    const handleFarmerChange = (e) => {
        const selectedKey = e.target.value;

        if (farmerDB[selectedKey]) {
            const details = farmerDB[selectedKey];
            setFormData(prev => ({
                ...prev,
                farmer: details.name,
                chickHouseCapacity: details.capacity,
                batchNo: details.batch,
                prevBatch: details.prevBatch
            }));
        } else {
            // Reset if cleared
            setFormData(prev => ({
                ...prev,
                farmer: selectedKey,
                chickHouseCapacity: '',
                batchNo: '',
                prevBatch: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API Call
        setTimeout(() => {
            if (editId) {
                setData(prev => prev.map(item => item.id === editId ? { ...formData, id: editId } : item));
                Swal.fire({ icon: "success", title: "Updated!", text: "Shed Readiness updated successfully.", timer: 1500, showConfirmButton: false });
            } else {
                setData(prev => [...prev, { ...formData, id: Date.now() }]);
                Swal.fire({ icon: "success", title: "Saved!", text: "Shed Readiness added successfully.", timer: 1500, showConfirmButton: false });
            }
            closeModal();
            setIsSubmitting(false);
        }, 1000);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then((result) => {
            if (result.isConfirmed) {
                setData(prev => prev.filter(item => item.id !== id));
                Swal.fire({ title: "Deleted!", text: "Record has been deleted.", icon: "success", timer: 1500, showConfirmButton: false });
            }
        });
    };

    const handleExport = () => {
        ExcelExport(data, "Shed_Readiness.xlsx");
    };

    // --- Filter & Pagination ---
    const filteredData = data.filter(item =>
        item.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batchNo.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Pagination Handlers
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    return (
        <div className="rounded-lg shadow flex-1">

            {/* --- PAGE CONTENT --- */}
            <div className="bg-[#F9F9FC] h-screen relative">

                {/* Header */}
                <div className="space-y-4 pt-3 px-6 font-poppins">
                    <h1 className="text-xl font-bold text-gray-900">Shed Readiness</h1>
                    <div className="flex items-center gap-x-2 text-sm text-gray-500">
                        <Link to="/" className='text-orange-500'>Data Entry</Link>
                        <span><RiArrowUpSFill className='rotate-90' size={20} /></span>
                        <span>Shed Readiness</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="relative">
                            <span className='absolute top-2.5 left-2 opacity-45'><RiSearchLine /></span>
                            <input
                                type="search"
                                placeholder="Search Farmer/Batch..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="py-2 px-2 ps-8 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                            />
                        </div>

                        <div className='space-x-4 flex'>
                            <button onClick={handleExport} className="px-4 py-2 bg-[#EFE8E0] text-[#F3890A] border rounded-lg hover:bg-orange-500 hover:text-white transition text-xs flex items-center gap-2">
                                <LuImport size={16} /> Export
                            </button>
                            {shedReadiness?.add && (
                                <button disabled onClick={() => openModal()} className="px-4 py-2 bg-gray-400 cursor-not-allowed text-white border rounded-lg hover:bg-gray-400 transition text-xs flex items-center gap-2">
                                    <LuPlus size={16} /> Add Entry
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto px-6 mx-4 mt-5 bg-white rounded-lg shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="text-black font-poppins font-semibold border-b">
                            <tr>
                                <th className="p-4 text-center">S.No</th>
                                <th className="p-4">Date</th>
                                <th className="p-4">Plant</th>
                                <th className="p-4">Farmer</th>
                                <th className="p-4">Batch No</th>
                                <th className="p-4 text-center">Capacity</th>
                                <th className="p-4 text-center">Excess Housed</th>
                                {(shedReadiness?.edit || shedReadiness?.delete) && <th className="p-4 text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y font-poppins">
                            {paginatedData.length > 0 ? paginatedData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="p-4 text-center opacity-65">{startIndex + index + 1}</td>
                                    <td className="p-4 opacity-65">{formatDate(item.date)}</td>
                                    <td className="p-4 opacity-65">{item.plant}</td>
                                    <td className="p-4 opacity-65">{item.farmer}</td>
                                    <td className="p-4 opacity-65">{item.batch}</td>
                                    <td className="p-4 text-center opacity-65">{item.chick_house_capacity}</td>
                                    <td className="p-4 text-center opacity-65">{item.chick_excess_housed}</td>
                                    {(shedReadiness?.edit || shedReadiness?.delete) && (
                                        <td className="p-4 flex justify-center gap-4">
                                            {shedReadiness?.edit && <button onClick={() => openModal(item)} disabled className="cursor-not-allowed hover:text-orange-500"><FiEdit2 size={18} /></button>}
                                            {shedReadiness?.delete && <button onClick={() => handleDelete(item.id)} disabled className="cursor-not-allowed hover:text-red-500"><RiDeleteBin6Line size={18} /></button>}
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr><td colSpan="8" className="p-8 text-center text-gray-500">No Data Available</td></tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="flex justify-end font-dm items-center gap-2 mt-4 mb-4 pt-4 border-t">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 border rounded ${currentPage === 1 ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}
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
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`px-3 py-1 border text-sm rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400' : 'text-black'}`}
                        >
                            {totalPages || 1}
                        </button>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages || totalPages === 0}
                            className={`px-3 py-1 border rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>

            {/* --- MODAL --- */}
            {modalIsOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden font-poppins">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">{editId ? "Edit Shed Readiness" : "Add Shed Readiness"}</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-red-500 transition">
                                <IoCloseSharp size={24} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">

                                {/* 1. Plant (Auto) */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Plant <span className="text-red-500">*</span></label>
                                    <input type="text" name="plant" value={formData.plant} readOnly className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm text-gray-600 focus:outline-none" />
                                </div>

                                {/* 2. Farmer (Select - Triggers Auto Fill) */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Farmer <span className="text-red-500">*</span></label>
                                    <select
                                        name="farmer"
                                        onChange={handleFarmerChange}
                                        // We use a simple check to match the name or the key for the value
                                        value={Object.keys(farmerDB).find(key => farmerDB[key].name === formData.farmer) || formData.farmer}
                                        className="w-full p-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                        required
                                    >
                                        <option value="">Select Farmer</option>
                                        {Object.keys(farmerDB).map(key => (
                                            <option key={key} value={key}>{farmerDB[key].name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* 3. Date (Auto) */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                                    <input type="date" name="date" value={formData.date} readOnly className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm text-gray-600 focus:outline-none" />
                                </div>

                                {/* 4. Chick House Capacity (Auto) */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Chick House Capacity</label>
                                    <input type="text" name="chickHouseCapacity" value={formData.chickHouseCapacity} readOnly className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm text-gray-600 focus:outline-none" placeholder="Auto-filled" />
                                </div>

                                {/* 5. Batch No (Auto) */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Batch No</label>
                                    <input type="text" name="batchNo" value={formData.batchNo} readOnly className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm text-gray-600 focus:outline-none" placeholder="Auto-filled" />
                                </div>

                                {/* 6. Previous Batch (Auto) */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Previous Batch</label>
                                    <input type="text" name="prevBatch" value={formData.prevBatch} readOnly className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm text-gray-600 focus:outline-none" placeholder="Auto-filled" />
                                </div>

                                {/* 7. Chick Excess Housed (Manual) */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Chick Excess Housed (Quantity)</label>
                                    <input
                                        type="number"
                                        name="excessHoused"
                                        value={formData.excessHoused}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 bg-white border border-gray-300 rounded-lg text-sm  outline-none"
                                        placeholder="Enter Quantity"
                                    />
                                    {/* <p className="text-[10px] text-orange-600 mt-1 italic">
                                        * Changing this will automatically update Farm Sq.ft in Master Data for the next batch.
                                    </p> */}
                                </div>

                            </div>

                            {/* Footer Buttons */}
                            <div className="flex justify-end gap-4 mt-8">
                                <button type="button" onClick={closeModal} className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition flex items-center gap-2 disabled:opacity-70">
                                    {isSubmitting ? 'Saving...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ShedReady