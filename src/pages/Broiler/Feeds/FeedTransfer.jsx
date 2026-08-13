import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowUpSFill, RiSearchLine, RiDeleteBin6Line } from 'react-icons/ri'
import { LuImport, LuPlus } from 'react-icons/lu'
import { IoCloseSharp } from 'react-icons/io5'
import { FiEdit2, FiEye } from 'react-icons/fi'
import Swal from "sweetalert2";
import axios from 'axios'
import { useAuth } from '../../../auth/AuthContext'
import ExcelExport from '../../../utils/ExcelExport'
import { formatDate } from '../../../utils/helper'

const FeedTransfer = () => {
    // --- Permissions ---
    const { getPermissions } = useAuth();
    const { feedTransfer } = getPermissions();

    // --- State Management ---
    const [data, setData] = useState([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editId, setEditId] = useState(null);

    // --- Form State ---
    const initialFormState = {
        date: new Date().toISOString().split('T')[0],
        plant: '1501',
        transferType: '',
        fromFarmer: '',
        fromBatch: '',
        fromBirdStock: '',
        fromAge: '',
        toFarmer: '',
        toBatch: '',
        toBirdStock: '',
        toAge: '',
        vehicleNo: '',
        iftCharges: '',
        material: '',
        storageLoc: '0012',
        transferQty: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    // --- Mock Database for Auto-Populate Logic ---
    // In real app, this comes from an API
    const farmerDB = {
        "FARM-001": { name: "FARM-001 | Krishnan", batch: "B-2025-01", stock: 5000, age: 12 },
        "FARM-002": { name: "FARM-002 | Balaji", batch: "B-2025-05", stock: 4500, age: 8 },
        "FARM-003": { name: "FARM-003 | Kumar", batch: "B-2025-08", stock: 6000, age: 2 },
    };

    // --- Fetch Data ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        const res = await axios.get("broiler/feed-transfer/getAll");
        console.log(res)

        if (res.data.status) {
            setData(res.data.data);
        } else {
            setData([]);
        }
        // setTimeout(() => {
        //     setData([
        //         {
        //             id: 1,
        //             date: '2025-10-24',
        //             plant: 'Chennai Unit 1',
        //             transferType: 'BT',
        //             fromFarmer: 'FARM-001 | Krishnan',
        //             toFarmer: 'FARM-002 | Balaji',
        //             material: 'Broiler Finisher',
        //             transferQty: 20,
        //             vehicleNo: 'TN-01-AX-1234',
        //             // Hidden fields for completeness if needed in edit
        //             fromBatch: 'B-2025-01', fromBirdStock: 5000, fromAge: 12,
        //             toBatch: 'B-2025-05', toBirdStock: 4500, toAge: 8,
        //             iftCharges: 500, storageLoc: '0012'
        //         }
        //     ]);
        //     setIsLoading(false);
        // }, 500);
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

    // Logic: Auto-fill "From" fields
    const handleFromFarmerChange = (e) => {
        const selectedKey = e.target.value;
        if (farmerDB[selectedKey]) {
            const details = farmerDB[selectedKey];
            setFormData(prev => ({
                ...prev,
                fromFarmer: details.name,
                fromBatch: details.batch,
                fromBirdStock: details.stock,
                fromAge: details.age
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                fromFarmer: selectedKey,
                fromBatch: '', fromBirdStock: '', fromAge: ''
            }));
        }
    };

    // Logic: Auto-fill "To" fields
    const handleToFarmerChange = (e) => {
        const selectedKey = e.target.value;
        if (farmerDB[selectedKey]) {
            const details = farmerDB[selectedKey];
            setFormData(prev => ({
                ...prev,
                toFarmer: details.name,
                toBatch: details.batch,
                toBirdStock: details.stock,
                toAge: details.age
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                toFarmer: selectedKey,
                toBatch: '', toBirdStock: '', toAge: ''
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
                Swal.fire({ icon: "success", title: "Updated!", text: "Feed Transfer updated successfully.", timer: 1500, showConfirmButton: false });
            } else {
                setData(prev => [...prev, { ...formData, id: Date.now() }]);
                Swal.fire({ icon: "success", title: "Saved!", text: "Feed Transfer added successfully.", timer: 1500, showConfirmButton: false });
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
        ExcelExport(data, "Feed_Transfer.xlsx");
    };

    // --- Filter & Pagination ---
    const filteredData = data.filter(item =>
        item.from_farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.to_farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.vehicle_no.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h1 className="text-xl font-bold text-gray-900">Feed Transfer</h1>
                    <div className="flex items-center gap-x-2 text-sm text-gray-500">
                        <Link to="/" className='text-orange-500'>Feed</Link>
                        <span><RiArrowUpSFill className='rotate-90' size={20} /></span>
                        <span>Feed Transfer</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="relative">
                            <span className='absolute top-2.5 left-2 opacity-45'><RiSearchLine /></span>
                            <input
                                type="search"
                                placeholder="Search Farmer/Vehicle..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="py-2 px-2 ps-8 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                            />
                        </div>

                        <div className='space-x-4 flex'>
                            <button onClick={handleExport} className="px-4 py-2 bg-[#EFE8E0] text-[#F3890A] border rounded-lg hover:bg-orange-500 hover:text-white transition text-xs flex items-center gap-2">
                                <LuImport size={16} /> Export
                            </button>
                            {feedTransfer?.add && (
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
                                <th className="p-4">Type</th>
                                <th className="p-4">From Farmer</th>
                                <th className="p-4">To Farmer</th>
                                <th className="p-4">Material</th>
                                <th className="p-4 text-center">Qty</th>
                                {/* <th className="p-4">Vehicle</th> */}
                                <th className="p-4">DC</th>
                                {(feedTransfer?.edit || feedTransfer?.delete) && <th className="p-4 text-center">Actions</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y font-poppins">
                            {paginatedData.length > 0 ? paginatedData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="p-4 text-center opacity-65">{startIndex + index + 1}</td>
                                    <td className="p-4 opacity-65">{formatDate(item.date)}</td>
                                    <td className="p-4 opacity-65">{item.transfer_type}</td>
                                    <td className="p-4 opacity-65">{item.from_farmer}</td>
                                    <td className="p-4 opacity-65">{item.to_farmer}</td>
                                    <td className="p-4 opacity-65">{item.material}</td>
                                    <td className="p-4 text-center opacity-65">{item.transfer_quantity}</td>
                                    {/* <td className="p-4 opacity-65">{item.vehicle_no}</td> */}
                                    <td className="p-4 text-center opacity-65"><button onClick={() => window.open(item.pdf_url, '_blank')}><FiEye size={18} /></button></td>
                                    {(feedTransfer?.edit || feedTransfer?.delete) && (
                                        <td className="p-4 flex justify-center gap-4">
                                            {feedTransfer?.edit && <button onClick={() => openModal(item)} className="hover:text-orange-500"><FiEdit2 size={18} /></button>}
                                            {feedTransfer?.delete && <button onClick={() => handleDelete(item.id)} className="hover:text-red-500"><RiDeleteBin6Line size={18} /></button>}
                                        </td>
                                    )}
                                </tr>
                            )) : (
                                <tr><td colSpan="9" className="p-8 text-center text-gray-500">No Data Available</td></tr>
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
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden font-poppins h-[80vh] overflow-y-auto">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-5 border-b bg-gray-50 sticky top-0 z-10">
                            <h2 className="text-lg font-bold text-gray-800">{editId ? "Edit Feed Transfer" : "Add Feed Transfer"}</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-red-500 transition">
                                <IoCloseSharp size={24} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="flex flex-col gap-5">

                                {/* --- COLUMN 1: GENERAL DETAILS --- */}
                                <div className="space-y-4 border p-4 rounded-lg bg-gray-50 h-fit">
                                    <h3 className="font-semibold text-gray-700 border-b pb-2">General Details</h3>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Transfer Type <span className="text-red-500">*</span></label>
                                        <select
                                            name="transferType"
                                            value={formData.transfer_type}
                                            onChange={handleInputChange}
                                            className="w-full p-2 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                            required
                                        >
                                            <option value="">Select Type</option>
                                            <option value="BT">BT: Balance Feed Transfer</option>
                                            <option value="RT">RT: Running Feed Transfer</option>
                                        </select>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                                        <input type="date" name="date" value={formatDate(formData.date)} readOnly className="w-full p-2 bg-gray-100 border rounded text-sm text-gray-500" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Plant</label>
                                        <input type="text" name="plant" value={formData.plant} readOnly className="w-full p-2 bg-gray-100 border rounded text-sm text-gray-500" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle No <span className="text-red-500">*</span></label>
                                        <input type="text" name="vehicleNo" value={formData.vehicle_no} onChange={handleInputChange} className="w-full p-2 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" required placeholder="e.g. TN-01-AB-1234" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">IFT Charges <span className="text-red-500">*</span></label>
                                        <input type="number" name="iftCharges" value={formData.ift_charges} onChange={handleInputChange} className="w-full p-2 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" required placeholder="Enter Amount" />
                                    </div>
                                </div>

                                {/* --- COLUMN 2: FARMER INFO (FROM & TO) --- */}
                                <div className="grid grid-cols-2 gap-3">
                                    {/* From Farmer Section */}
                                    <div className="space-y-3 border p-4 rounded-lg bg-white">
                                        <h3 className="font-semibold text-orange-600 border-b pb-1 text-sm uppercase">From Farmer</h3>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Farmer Name <span className="text-red-500">*</span></label>
                                            <select name="fromFarmer" onChange={handleFromFarmerChange} value={Object.keys(farmerDB).find(key => farmerDB[key].name === formData.fromFarmer) || formData.fromFarmer} className="w-full p-2 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" required>
                                                <option value="">Select Farmer</option>
                                                {Object.keys(farmerDB).map(key => (
                                                    <option key={key} value={key}>{farmerDB[key].name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className="text-[10px] text-gray-500">Batch</label><input value={formData.from_batch} readOnly className="w-full p-1.5 bg-gray-100 border rounded text-xs" /></div>
                                            <div><label className="text-[10px] text-gray-500">Age</label><input value={formData.from_age} readOnly className="w-full p-1.5 bg-gray-100 border rounded text-xs" /></div>
                                            <div className="col-span-2"><label className="text-[10px] text-gray-500">Bird Stock</label><input value={formData.from_bird_stock} readOnly className="w-full p-1.5 bg-gray-100 border rounded text-xs" /></div>
                                        </div>
                                    </div>

                                    {/* To Farmer Section */}
                                    <div className="space-y-3 border p-4 rounded-lg bg-white">
                                        <h3 className="font-semibold text-green-600 border-b pb-1 text-sm uppercase">To Farmer</h3>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1">Farmer Name <span className="text-red-500">*</span></label>
                                            <select name="toFarmer" onChange={handleToFarmerChange} value={Object.keys(farmerDB).find(key => farmerDB[key].name === formData.toFarmer) || formData.toFarmer} className="w-full p-2 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" required>
                                                <option value="">Select Farmer</option>
                                                {Object.keys(farmerDB).map(key => (
                                                    <option key={key} value={key}>{farmerDB[key].name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div><label className="text-[10px] text-gray-500">Batch</label><input value={formData.to_batch} readOnly className="w-full p-1.5 bg-gray-100 border rounded text-xs" /></div>
                                            <div><label className="text-[10px] text-gray-500">Age</label><input value={formData.to_age} readOnly className="w-full p-1.5 bg-gray-100 border rounded text-xs" /></div>
                                            <div className="col-span-2"><label className="text-[10px] text-gray-500">Bird Stock</label><input value={formData.to_bird_stock} readOnly className="w-full p-1.5 bg-gray-100 border rounded text-xs" /></div>
                                        </div>
                                    </div>
                                </div>

                                {/* --- COLUMN 3: MATERIAL TRANSFER --- */}
                                <div className="space-y-4 border p-4 rounded-lg bg-gray-50 h-fit">
                                    <h3 className="font-semibold text-gray-700 border-b pb-2">Material Transfer</h3>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Material (FG Only) <span className="text-red-500">*</span></label>
                                        <input type="text" name="material" value={formData.material} onChange={handleInputChange} className="w-full p-2 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" required placeholder="Enter Material Name" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Transfer Quantity <span className="text-red-500">*</span></label>
                                        <input type="number" name="transferQty" value={formData.transfer_quantity} onChange={handleInputChange} className="w-full p-2 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" required placeholder="Enter Qty" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Storage Loc</label>
                                        <input type="text" name="storageLoc" value={formData.storage_loc || '0001'} readOnly className="w-full p-2 bg-gray-200 border rounded text-sm text-gray-600 font-mono" />
                                    </div>
                                </div>

                            </div>

                            {/* Footer Buttons */}
                            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100">
                                <button type="button" onClick={closeModal} className="px-6 py-2.5 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-primary text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-70">
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

export default FeedTransfer