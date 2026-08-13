import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowUpSFill, RiSearchLine } from 'react-icons/ri'
import { IoCloseSharp } from 'react-icons/io5'
import { FiEdit2 } from 'react-icons/fi'
import Swal from "sweetalert2";
import { useAuth } from '../../../auth/AuthContext'

const FeedApproval = () => {
    // --- Permissions ---
    const { getPermissions } = useAuth();
    // Assuming permission key is 'feedApproval' or similar
    const { feedApproval } = getPermissions() || { feedApproval: { edit: true } };

    // --- State Management ---
    const [data, setData] = useState([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedId, setSelectedId] = useState(null);

    // --- Form State ---
    const initialFormState = {
        plant: '',
        farmer: '',
        requestDate: '',
        fg1: '',
        fg2: '',
        fg3: '',
        supplyingPlant: '',
        status: '',
        rejectReason: ''
    };

    const [formData, setFormData] = useState(initialFormState);

    // --- Fetch Data ---
    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        // Simulate API Fetch - Fetching "Pending" requests
        setTimeout(() => {
            setData([
                {
                    id: 1,
                    plant: 'Chennai Unit 1',
                    farmer: 'FARM-001 | Krishnan',
                    requestDate: '2025-10-20',
                    fg1: 'Broiler Starter - 10 Bags',
                    fg2: 'Broiler Finisher - 5 Bags',
                    fg3: '-',
                    status: 'Pending'
                },
                {
                    id: 2,
                    plant: 'Chennai Unit 1',
                    farmer: 'FARM-002 | Balaji',
                    requestDate: '2025-10-21',
                    fg1: 'Chick Crumble - 20 Bags',
                    fg2: '-',
                    fg3: '-',
                    status: 'Pending'
                },
            ]);
            setIsLoading(false);
        }, 500);
    };

    // --- Handlers ---

    const openModal = (item) => {
        // Populate modal with existing request data
        setFormData({
            plant: item.plant,
            farmer: item.farmer,
            requestDate: item.requestDate,
            fg1: item.fg1,
            fg2: item.fg2,
            fg3: item.fg3,
            supplyingPlant: '', // Reset manual fields
            status: '',
            rejectReason: ''
        });
        setSelectedId(item.id);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setFormData(initialFormState);
        setSelectedId(null);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.supplyingPlant && formData.status === 'Approved') {
            Swal.fire({ icon: 'warning', title: 'Missing Input', text: 'Please select a Supplying Plant.' });
            return;
        }
        if (formData.status === 'Rejected' && !formData.rejectReason) {
            Swal.fire({ icon: 'warning', title: 'Missing Input', text: 'Please provide a reason for rejection.' });
            return;
        }
        if (!formData.status) {
            Swal.fire({ icon: 'warning', title: 'Missing Input', text: 'Please select an approval status.' });
            return;
        }

        setIsSubmitting(true);

        // Simulate API Call
        setTimeout(() => {
            // Update local state
            setData(prev => prev.map(item =>
                item.id === selectedId
                    ? { ...item, status: formData.status }
                    : item
            ));

            Swal.fire({
                icon: "success",
                title: formData.status === 'Approved' ? "Approved!" : "Rejected!",
                text: `Request has been ${formData.status.toLowerCase()}.`,
                timer: 1500,
                showConfirmButton: false
            });

            closeModal();
            setIsSubmitting(false);
        }, 1000);
    };

    // --- Filter & Pagination ---
    const filteredData = data.filter(item =>
        item.farmer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.plant.toLowerCase().includes(searchQuery.toLowerCase())
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
                    <h1 className="text-xl font-bold text-gray-900">Feed Approval</h1>
                    <div className="flex items-center gap-x-2 text-sm text-gray-500">
                        <Link to="/" className='text-orange-500'>Feed</Link>
                        <span><RiArrowUpSFill className='rotate-90' size={20} /></span>
                        <span>Feed Approval</span>
                    </div>

                    {/* Search Bar Only (No Export/Add) */}
                    <div className="flex items-center justify-between">
                        <div className="relative">
                            <span className='absolute top-2.5 left-2 opacity-45'><RiSearchLine /></span>
                            <input
                                type="search"
                                placeholder="Search Farmer/Plant..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="py-2 px-2 ps-8 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                            />
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto px-6 mx-4 mt-5 bg-white rounded-lg shadow-sm">
                    <table className="w-full text-sm text-left">
                        <thead className="text-black font-poppins font-semibold border-b">
                            <tr>
                                <th className="p-4 text-center">S.No</th>
                                <th className="p-4">Request Date</th>
                                <th className="p-4">Plant</th>
                                <th className="p-4">Farmer</th>
                                <th className="p-4">FG 1</th>
                                <th className="p-4">Status</th>
                                <th className="p-4 text-center">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y font-poppins">
                            {paginatedData.length > 0 ? paginatedData.map((item, index) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="p-4 text-center opacity-65">{startIndex + index + 1}</td>
                                    <td className="p-4 opacity-65">{item.requestDate}</td>
                                    <td className="p-4 opacity-65">{item.plant}</td>
                                    <td className="p-4 opacity-65">{item.farmer}</td>
                                    <td className="p-4 opacity-65">{item.fg1}</td>
                                    <td className="p-4 opacity-65">
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium 
                                            ${item.status === 'Approved' ? 'bg-green-100 text-green-800' :
                                                item.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'}`}>
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 flex justify-center gap-4">
                                        {/* Only Edit Button for Approval Action */}
                                        <button onClick={() => openModal(item)} className="hover:text-orange-500" title="Approve/Reject">
                                            <FiEdit2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr><td colSpan="7" className="p-8 text-center text-gray-500">No Requests Pending</td></tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="flex justify-end font-dm items-center gap-2 mt-4 mb-4 pt-4 border-t">
                        <button onClick={goToPreviousPage} disabled={currentPage === 1} className={`px-3 py-1 border rounded ${currentPage === 1 ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}>&lt;</button>
                        <button onClick={goToFirstPage} disabled={currentPage === 1} className={`px-3 py-1 text-sm border rounded ${currentPage === 1 ? 'text-gray-400' : 'text-black'}`}>{currentPage === 1 ? "0" : "1"}</button>
                        <span className="px-3 py-1 border font-medium rounded bg-gray-200">{currentPage}</span>
                        <button onClick={goToLastPage} disabled={currentPage === totalPages || totalPages === 0} className={`px-3 py-1 border text-sm rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400' : 'text-black'}`}>{totalPages || 1}</button>
                        <button onClick={goToNextPage} disabled={currentPage === totalPages || totalPages === 0} className={`px-3 py-1 border rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}>&gt;</button>
                    </div>
                </div>
            </div>

            {/* --- APPROVAL MODAL --- */}
            {modalIsOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl mx-4 overflow-hidden font-poppins animate-in fade-in zoom-in duration-200">

                        {/* Modal Header */}
                        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">Approve Feed Request</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-red-500 transition">
                                <IoCloseSharp size={24} />
                            </button>
                        </div>

                        {/* Modal Form */}
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">

                                {/* Row 1: Plant, Farmer, Request Date (Read Only) */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Plant <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.plant} readOnly className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm text-gray-600 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Farmer <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.farmer} readOnly className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm text-gray-600 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Requested Date <span className="text-red-500">*</span></label>
                                    <input type="date" value={formData.requestDate} readOnly className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm text-gray-600 focus:outline-none" />
                                </div>

                                {/* Row 2: FG1, FG2, FG3 (Read Only) */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">FG 1 <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.fg1} readOnly className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm text-gray-600 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">FG 2 <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.fg2} readOnly className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm text-gray-600 focus:outline-none" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">FG 3 <span className="text-red-500">*</span></label>
                                    <input type="text" value={formData.fg3} readOnly className="w-full p-2.5 bg-gray-100 border rounded-lg text-sm text-gray-600 focus:outline-none" />
                                </div>

                                {/* Row 3: Supplying Plant & Actions */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Supplying Plant <span className="text-red-500">*</span></label>
                                    <select
                                        name="supplyingPlant"
                                        value={formData.supplyingPlant}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                        required={formData.status === 'Approved'}
                                    >
                                        <option value="">Select Supplying Plant</option>
                                        <option value="Chennai Unit 1">Chennai Unit 1</option>
                                        <option value="Chennai Unit 2">Chennai Unit 2</option>
                                        <option value="Vellore Feed Mill">Vellore Feed Mill</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Action <span className="text-red-500">*</span></label>
                                    <select
                                        name="status"
                                        value={formData.status}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 bg-white border rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                        required
                                    >
                                        <option value="">Select Action</option>
                                        <option value="Approved">Approve</option>
                                        <option value="Rejected">Reject</option>
                                    </select>
                                </div>

                                {/* Conditional Reject Reason */}
                                {formData.status === 'Rejected' && (
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1">Reject Reason <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="rejectReason"
                                            value={formData.rejectReason}
                                            onChange={handleInputChange}
                                            placeholder="Enter reason..."
                                            className="w-full p-2.5 bg-white border border-red-300 rounded-lg text-sm focus:ring-2 focus:ring-red-500 outline-none"
                                            required
                                        />
                                    </div>
                                )}

                            </div>

                            {/* Footer Buttons */}
                            <div className="flex justify-end gap-4 mt-8 pt-4 border-t border-gray-100">
                                <button type="button" onClick={closeModal} className="px-6 py-2.5 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition">
                                    Cancel
                                </button>
                                <button type="submit" disabled={isSubmitting} className="px-8 py-2.5 bg-primary text-white rounded-lg font-medium transition flex items-center gap-2 disabled:opacity-70">
                                    {isSubmitting ? 'Processing...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default FeedApproval