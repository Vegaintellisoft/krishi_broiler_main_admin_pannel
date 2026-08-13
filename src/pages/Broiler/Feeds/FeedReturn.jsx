import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowUpSFill, RiSearchLine, RiDeleteBin6Line } from 'react-icons/ri'
import { LuImport, LuPlus } from 'react-icons/lu'
import { IoCloseSharp } from 'react-icons/io5'
import { FiEdit2 } from 'react-icons/fi'
import Swal from "sweetalert2";
import { useAuth } from '../../../auth/AuthContext'
import ExcelExport from '../../../utils/ExcelExport'

const FeedReturn = () => {
    // --- Permissions ---
    const { getPermissions } = useAuth();
    const { feedReturn } = getPermissions();

    // --- State Management ---
    const [data, setData] = useState([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editId, setEditId] = useState(null);

    const initialFormState = {
        date: new Date().toISOString().split('T')[0],
        plant: 'Chennai Unit 1',
        farmer: '',
        batchNo: '',
        birdStock: '',
        material: '',
        storageLoc: '0012',
        transferQty: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    // --- Mock Database for Auto-Populate Logic ---
    const farmerDB = {
        "FARM-001": { name: "FARM-001 | Krishnan", batch: "B-2025-01", stock: 5000 },
        "FARM-002": { name: "FARM-002 | Balaji", batch: "B-2025-05", stock: 4500 },
        "FARM-003": { name: "FARM-003 | Kumar", batch: "B-2025-08", stock: 6000 },
    };

    // --- Fetch Data ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        // Simulate API Fetch
        setTimeout(() => {
            setData([
                { id: 1, date: '2025-10-24', plant: 'Chennai Unit 1', farmer: 'FARM-001 | Krishnan', batchNo: 'B-2025-01', birdStock: 5000, material: 'Broiler Finisher', transferQty: 10, storageLoc: '0012' },
                { id: 2, date: '2025-10-25', plant: 'Chennai Unit 1', farmer: 'FARM-002 | Balaji', batchNo: 'B-2025-05', birdStock: 4500, material: 'Broiler Starter', transferQty: 5, storageLoc: '0012' },
            ]);
            setIsLoading(false);
        }, 500);
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
                batchNo: details.batch,
                birdStock: details.stock,
            }));
        } else {
            // Reset if cleared
            setFormData(prev => ({
                ...prev,
                farmer: selectedKey,
                batchNo: '',
                birdStock: '',
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
                Swal.fire({ icon: "success", title: "Updated!", text: "Feed Return updated successfully.", timer: 1500, showConfirmButton: false });
            } else {
                setData(prev => [...prev, { ...formData, id: Date.now() }]);
                Swal.fire({ icon: "success", title: "Saved!", text: "Feed Return added successfully.", timer: 1500, showConfirmButton: false });
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
        ExcelExport(data, "Feed_Return.xlsx");
    };

    // --- Filter & Pagination ---
    const filteredData = data.filter(item =>
        item.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.batchNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.material.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h1 className="text-xl font-bold text-gray-900">Feed Return</h1>
                    <div className="flex items-center gap-x-2 text-sm text-gray-500">
                        <Link to="/" className='text-orange-500'>Feed</Link>
                        <span><RiArrowUpSFill className='rotate-90' size={20} /></span>
                        <span>Feed Return</span>
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
                            {feedReturn?.add && (
                                <button onClick={() => openModal()} className="px-4 py-2 bg-orange-500 text-white border rounded-lg hover:bg-orange-600 transition text-xs flex items-center gap-2">
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
                                <th className="p-4">Material</th>
                                <th className="p-4 text-center">Qty</th>
                                {(feedReturn?.edit || feedReturn?.delete) && <th className="p-4 text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y font-poppins">
                            {paginatedData.length > 0 ? paginatedData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="p-4 text-center opacity-65">{startIndex + index + 1}</td>
                                    <td className="p-4 opacity-65">{item.date}</td>
                                    <td className="p-4 opacity-65">{item.plant}</td>
                                    <td className="p-4 opacity-65">{item.farmer}</td>
                                    <td className="p-4 opacity-65">{item.batchNo}</td>
                                    <td className="p-4 opacity-65">{item.material}</td>
                                    <td className="p-4 text-center opacity-65">{item.transferQty}</td>
                                    {(feedReturn?.edit || feedReturn?.delete) && (
                                        <td className="p-4 flex justify-center gap-4">
                                            {feedReturn?.edit && <button onClick={() => openModal(item)} className="hover:text-orange-500"><FiEdit2 size={18} /></button>}
                                            {feedReturn?.delete && <button onClick={() => handleDelete(item.id)} className="hover:text-red-500"><RiDeleteBin6Line size={18} /></button>}
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
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden font-poppins animate-in fade-in zoom-in duration-200">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">{editId ? "Edit Feed Return" : "Add Feed Return"}</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-red-500 transition">
                                <IoCloseSharp size={24} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">

                                {/* Row 1: Date, Plant, Batch (Using 3 cols based on similar layouts provided) */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
                                    <input type="date" name="date" value={formData.date} readOnly className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm text-gray-600 focus:outline-none" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Plant <span className="text-red-500">*</span></label>
                                    <input type="text" name="plant" value={formData.plant} readOnly className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm text-gray-600 focus:outline-none" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Farmer <span className="text-red-500">*</span></label>
                                    <select
                                        name="farmer"
                                        onChange={handleFarmerChange}
                                        // Match selected name to key or directly use value if editing from string
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

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Batch <span className="text-red-500">*</span></label>
                                    <input type="text" name="batchNo" value={formData.batchNo} readOnly className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm text-gray-600 focus:outline-none" placeholder="Auto-filled" />
                                </div>

                                {/* Row 2: Bird Stock, Farmer, Material */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Bird Stock <span className="text-red-500">*</span></label>
                                    <input type="text" name="birdStock" value={formData.birdStock} readOnly className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm text-gray-600 focus:outline-none" placeholder="Auto-filled" />
                                </div>



                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Material (FG Only) <span className="text-red-500">*</span></label>
                                    <select
                                        name="material"
                                        value={formData.material}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                        required
                                    >
                                        <option value="">Select Material</option>
                                        <option value="Broiler Starter">Broiler Starter</option>
                                        <option value="Broiler Finisher">Broiler Finisher</option>
                                    </select>
                                </div>

                                {/* Row 3: Transfer Quantity (Full width or specific col) */}
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Transfer Quantity <span className="text-red-500">*</span></label>
                                    <input
                                        type="number"
                                        name="transferQty"
                                        value={formData.transferQty}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Enter Quantity in Kg"
                                        required
                                    />
                                </div>

                                {/* Hidden Storage Loc (Requirement: Default '0012') */}
                                <input type="hidden" name="storageLoc" value="0012" />

                            </div>

                            {/* Footer Buttons */}
                            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100">
                                <button type="button" onClick={closeModal} className="px-6 py-2.5 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-orange-500 text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-70">
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

export default FeedReturn