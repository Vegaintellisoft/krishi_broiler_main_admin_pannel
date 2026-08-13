import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiFilter, FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import { FaSort } from 'react-icons/fa';

import Swal from 'sweetalert2';

const UnitNameList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const dummyData = [
        { id: 1, unitName: "farm unit A", date: "10-08-2025", flockNo: "FN-001", ageDay: 35, ageWeek: 2, openStockM: 100, openStockFm: 100, mortalityM: 2, mortalityFm: 2, cullKillM: 2, cullKillFm: 2 },
        { id: 2, unitName: "farm unit B", date: "10-08-2025", flockNo: "FN-002", ageDay: 43, ageWeek: 4, openStockM: 50, openStockFm: 50, mortalityM: 4, mortalityFm: 4, cullKillM: 4, cullKillFm: 4 },
        { id: 3, unitName: "farm unit A", date: "10-08-2025", flockNo: "FN-003", ageDay: 34, ageWeek: 5, openStockM: 40, openStockFm: 40, mortalityM: 5, mortalityFm: 5, cullKillM: 5, cullKillFm: 5 },
        { id: 4, unitName: "farm unit B", date: "10-08-2025", flockNo: "FN-004", ageDay: 28, ageWeek: 3, openStockM: 20, openStockFm: 20, mortalityM: 3, mortalityFm: 3, cullKillM: 3, cullKillFm: 3 },
        { id: 5, unitName: "farm unit A", date: "10-08-2025", flockNo: "FN-005", ageDay: 30, ageWeek: 2, openStockM: 23, openStockFm: 23, mortalityM: 2, mortalityFm: 2, cullKillM: 2, cullKillFm: 2 },
        { id: 6, unitName: "farm unit B", date: "10-08-2025", flockNo: "FN-006", ageDay: 54, ageWeek: 3, openStockM: 45, openStockFm: 45, mortalityM: 3, mortalityFm: 3, cullKillM: 3, cullKillFm: 3 },
        { id: 7, unitName: "farm unit A", date: "10-08-2025", flockNo: "FN-007", ageDay: 43, ageWeek: 4, openStockM: 56, openStockFm: 56, mortalityM: 4, mortalityFm: 4, cullKillM: 4, cullKillFm: 4 },
        { id: 8, unitName: "farm unit B", date: "10-08-2025", flockNo: "FN-008", ageDay: 54, ageWeek: 2, openStockM: 34, openStockFm: 34, mortalityM: 2, mortalityFm: 2, cullKillM: 2, cullKillFm: 2 },
        { id: 9, unitName: "farm unit A", date: "10-08-2025", flockNo: "FN-009", ageDay: 30, ageWeek: 1, openStockM: 23, openStockFm: 23, mortalityM: 1, mortalityFm: 1, cullKillM: 1, cullKillFm: 1 },
        { id: 10, unitName: "farm unit B", date: "10-08-2025", flockNo: "FN-010", ageDay: 30, ageWeek: 2, openStockM: 59, openStockFm: 59, mortalityM: 2, mortalityFm: 2, cullKillM: 2, cullKillFm: 2 },
    ];

    const [data, setData] = useState(dummyData);

    const handleAddData = () => {
        navigate('/unitname/add');
    };

    const handleEdit = (row) => {
        navigate('/unitname/add', { state: { editData: row } });
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
                setData(prev => prev.filter(item => item.id !== id));
                Swal.fire(
                    'Deleted!',
                    'Your record has been deleted.',
                    'success'
                )
            }
        })
    };

    const filteredData = data.filter(item =>
        item.unitName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.flockNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full m-0 font-poppins p-[20px] bg-[#f9f9fc] min-h-screen">
            <div className="flex justify-between items-center mb-[25px]">
                <h3 className="text-[18px] font-bold text-[#1c1c1c] m-0">Unit Name</h3>
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
                    <button 
                        className="h-[38px] px-[20px] bg-[#d4af37] text-white border-none rounded-[8px] font-semibold text-[14px] flex items-center gap-[8px] cursor-pointer transition-all duration-200 shadow-[0_4px_10px_rgba(212,175,55,0.2)] hover:bg-[#bc9a2f] hover:-translate-y-[1px]" 
                        onClick={handleAddData}
                    >
                        <FiPlus className="text-[18px]" />
                        Add data
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-[12px] overflow-x-auto shadow-[0_4px_25px_rgba(0,0,0,0.03)] border border-[#f0f0f0] mt-[10px]">
                <table className="w-full min-w-[1200px] border-collapse text-[13px]">
                    <thead>
                        <tr className="bg-[#f8f9fb]">
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">
                                <div className="flex items-center justify-center gap-[8px]">
                                    Unit Name <FaSort className="flex flex-col text-[9px] text-[#bbb]" />
                                </div>
                            </th>
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">
                                <div className="flex items-center justify-center gap-[8px]">
                                    Date <FaSort className="flex flex-col text-[9px] text-[#bbb]" />
                                </div>
                            </th>
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Flock No</th>
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Age (Day)</th>
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Age (Week)</th>
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Open stock (m)</th>
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Open stock (Fm)</th>
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Mortality (m)</th>
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Mortality (Fm)</th>
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Cull Kill (m)</th>
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Cull Kill (Fm)</th>
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((row) => (
                                <tr key={row.id} className="hover:bg-[#fcfcfd]">
                                    <td className="p-[16px_15px] text-center text-[#216ba5] font-medium border-b border-[#fafafa] whitespace-nowrap">{row.unitName}</td>
                                    <td className="p-[16px_15px] text-center text-[#4A4C56] border-b border-[#fafafa] whitespace-nowrap">{row.date}</td>
                                    <td className="p-[16px_15px] text-center text-[#4A4C56] border-b border-[#fafafa] whitespace-nowrap">{row.flockNo}</td>
                                    <td className="p-[16px_15px] text-center text-[#4A4C56] border-b border-[#fafafa] whitespace-nowrap">{row.ageDay}</td>
                                    <td className="p-[16px_15px] text-center text-[#4A4C56] border-b border-[#fafafa] whitespace-nowrap">{row.ageWeek}</td>
                                    <td className="p-[16px_15px] text-center text-[#4A4C56] border-b border-[#fafafa] whitespace-nowrap">{row.openStockM}</td>
                                    <td className="p-[16px_15px] text-center text-[#4A4C56] border-b border-[#fafafa] whitespace-nowrap">{row.openStockFm}</td>
                                    <td className="p-[16px_15px] text-center text-[#4A4C56] border-b border-[#fafafa] whitespace-nowrap">{row.mortalityM}</td>
                                    <td className="p-[16px_15px] text-center text-[#4A4C56] border-b border-[#fafafa] whitespace-nowrap">{row.mortalityFm}</td>
                                    <td className="p-[16px_15px] text-center text-[#4A4C56] border-b border-[#fafafa] whitespace-nowrap">{row.cullKillM}</td>
                                    <td className="p-[16px_15px] text-center text-[#4A4C56] border-b border-[#fafafa] whitespace-nowrap">{row.cullKillFm}</td>
                                    <td className="p-[16px_15px] text-center text-[#4A4C56] border-b border-[#fafafa] whitespace-nowrap">
                                        <div className="flex justify-center gap-[12px]">
                                            <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border border-[#eee] bg-white cursor-pointer transition-all duration-200 text-[#666] shadow-[0_2px_5px_rgba(0,0,0,0.05)] hover:bg-[#f5f5f5] hover:scale-[1.05]" onClick={() => handleEdit(row)}>
                                                <FiEdit className="text-[14px]" />
                                            </button>
                                            <button className="w-[28px] h-[28px] flex items-center justify-center rounded-[6px] border border-[#eee] bg-white cursor-pointer transition-all duration-200 text-[#666] shadow-[0_2px_5px_rgba(0,0,0,0.05)] hover:bg-[#f5f5f5] hover:scale-[1.05]" onClick={() => handleDelete(row.id)}>
                                                <FiTrash2 className="text-[14px]" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="12" className="p-[40px] text-center text-[#999] text-[15px] border-b border-[#fafafa] whitespace-nowrap">
                                    No records found matching your search
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default UnitNameList;
