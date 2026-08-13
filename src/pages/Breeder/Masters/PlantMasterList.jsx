import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEdit, FiTrash2, FiEye, FiPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';

const PlantMasterList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const handleEdit = (row) => {
        navigate('/plantmaster/add', { state: { editData: row } });
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
                setPlantData(prev => prev.filter(item => item.plant !== id));
                Swal.fire('Deleted!', 'Your record has been deleted.', 'success')
            }
        })
    };

    const [plantData, setPlantData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const rowsPerPage = 10;

    // Static dummy data for plant master
    useEffect(() => {
        const dummyData = [
            { plant: "PS001", name: "Hosur Breeding Farm", company_name: "Krishi Farms Ltd", city1: "Hosur", address_version: "Industrial Area Phase II", name_2: "Unit 1", postal_code: "635109" },
            { plant: "PS002", name: "Mysore Hatchery", company_name: "Krishi Farms Ltd", city1: "Mysore", address_version: "Outer Ring Road", name_2: "Block B", postal_code: "570008" },
            { plant: "PS003", name: "Coimbatore Feed Mill", company_name: "Krishi Industries", city1: "Coimbatore", address_version: "Near Airport", name_2: "Plant 3", postal_code: "641014" },
            { plant: "PS004", name: "Salem Global Exports", company_name: "Krishi Farms Ltd", city1: "Salem", address_version: "Steel Plant Road", name_2: "HQ", postal_code: "636013" }
        ];
        setPlantData(dummyData);
        setFilteredData(dummyData);
        setLoading(false);
    }, []);

    // Search / filter
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredData(plantData);
        } else {
            const term = searchTerm.toLowerCase();
            setFilteredData(
                plantData.filter(item =>
                    (item.plant && String(item.plant).toLowerCase().includes(term)) ||
                    (item.name && item.name.toLowerCase().includes(term)) ||
                    (item.company_name && item.company_name.toLowerCase().includes(term)) ||
                    (item.city1 && item.city1.toLowerCase().includes(term)) ||
                    (item.search_term_1 && item.search_term_1.toLowerCase().includes(term)) ||
                    (item.search_term_2 && item.search_term_2.toLowerCase().includes(term))
                )
            );
        }
        setCurrentPage(1);
    }, [searchTerm, plantData]);

    // Build address string from available fields
    const buildAddress = (item) => {
        const parts = [];
        if (item.address_version) parts.push(item.address_version);
        if (item.name_2) parts.push(item.name_2);
        if (parts.length > 0) return parts.join(', ');
        return '—';
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredData.length / rowsPerPage);
    const startIdx = (currentPage - 1) * rowsPerPage;
    const paginatedData = filteredData.slice(startIdx, startIdx + rowsPerPage);

    return (
        <div className="w-full m-0 font-poppins p-[20px] bg-[#f9f9fc] min-h-screen text-[#1C1C1C]">
            {/* Header */}
            <div className="flex justify-between items-center mb-[25px]">
                <h3 className="text-[18px] font-bold text-[#1c1c1c] m-0">Plant Master</h3>
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
                    Loading plant master data...
                </div>
            ) : paginatedData.length === 0 ? (
                <div className="text-center py-12 text-[#9ca3af] text-[14px]">
                    {searchTerm ? 'No results found for your search.' : 'No plant master records found.'}
                </div>
            ) : (
                <>
                    {/* Table */}
                    <div className="rounded-[10px] shadow-[0_1px_6px_rgba(0,0,0,0.07)] overflow-x-auto bg-white border border-[#f0f0f0]">
                        <table className="w-full border-collapse text-[13px]">
                            <thead className="bg-[#f1f3f5] border-b-2 border-[#e5e7eb]">
                                <tr>
                                    <th className="py-3 px-4 text-center font-semibold text-[#374151] whitespace-nowrap">Plant ID</th>
                                    <th className="py-3 px-4 text-center font-semibold text-[#374151] whitespace-nowrap">Plant Name</th>
                                    <th className="py-3 px-4 text-center font-semibold text-[#374151] whitespace-nowrap">Company Name</th>
                                    <th className="py-3 px-4 text-center font-semibold text-[#374151] whitespace-nowrap">City</th>
                                    <th className="py-3 px-4 text-center font-semibold text-[#374151] whitespace-nowrap">Address</th>
                                    <th className="py-3 px-4 text-center font-semibold text-[#374151] whitespace-nowrap">Postal Code</th>
                                </tr>
                            </thead>
                            <tbody>
                                {paginatedData.map((item, index) => (
                                    <tr key={item.plant || index} className="border-b border-[#f0f0f0] transition-colors duration-150 hover:bg-[#fef9f0]">
                                        <td className="py-[11px] px-4 text-center text-[#4b5563] whitespace-nowrap">{item.plant ?? '—'}</td>
                                        <td className="py-[11px] px-4 text-center text-[#4b5563] whitespace-nowrap">{item.name || '—'}</td>
                                        <td className="py-[11px] px-4 text-center text-[#4b5563] whitespace-nowrap">{item.company_name || '—'}</td>
                                        <td className="py-[11px] px-4 text-center text-[#4b5563] whitespace-nowrap">{item.city1 || '—'}</td>
                                        <td className="py-[11px] px-4 text-center text-[#4b5563] whitespace-normal max-w-[220px] mx-auto">{buildAddress(item)}</td>
                                        <td className="py-[11px] px-4 text-center text-[#4b5563] whitespace-nowrap">{item.postal_code ?? '—'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
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

export default PlantMasterList;
