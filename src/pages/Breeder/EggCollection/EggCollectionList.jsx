import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';

const dummyData = [
    { id: 1, date: '2025-09-23', shedNo: 'Shed 1', line: 'Line A', lineTotal: 1258 },
    { id: 2, date: '2025-09-23', shedNo: 'Shed 2', line: 'Line B', lineTotal: 1150 },
    { id: 3, date: '2025-09-24', shedNo: 'Shed 1', line: 'Line A', lineTotal: 1210 },
    { id: 4, date: '2025-09-24', shedNo: 'Shed 3', line: 'Line C', lineTotal: 1305 },
    { id: 5, date: '2025-09-25', shedNo: 'Shed 2', line: 'Line B', lineTotal: 1100 },
    { id: 6, date: '2025-09-25', shedNo: 'Shed 4', line: 'Line D', lineTotal: 1420 },
    { id: 7, date: '2025-09-26', shedNo: 'Shed 1', line: 'Line A', lineTotal: 1245 },
    { id: 8, date: '2025-09-26', shedNo: 'Shed 3', line: 'Line C', lineTotal: 1290 },
    { id: 9, date: '2025-09-27', shedNo: 'Shed 2', line: 'Line B', lineTotal: 1135 },
    { id: 10, date: '2025-09-27', shedNo: 'Shed 5', line: 'Line E', lineTotal: 1350 },
    { id: 11, date: '2025-09-28', shedNo: 'Shed 1', line: 'Line A', lineTotal: 1260 },
];

export default function EggCollectionList() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState(dummyData);

    const handleEdit = (row) => {
         navigate('/eggcollection/add', { state: { editData: row } });
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
                Swal.fire('Deleted!', 'Your record has been deleted.', 'success')
            }
        })
    };

    const filtered = data.filter(item =>
        item.shedNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.line.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.includes(searchTerm)
    );

    return (
        <div className="w-full m-0 font-poppins p-[20px] bg-[#f9f9fc] min-h-screen text-[#1C1C1C]">
            {/* Header */}
            <div className="flex justify-between items-center mb-[25px]">
                <h3 className="text-[18px] font-bold text-[#1c1c1c] m-0">Egg Collection</h3>
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
                        onClick={() => navigate('/eggcollection/add')}
                        className="h-[38px] px-[20px] bg-[#d4af37] text-white border-none rounded-[8px] font-semibold text-[14px] flex items-center gap-[8px] cursor-pointer transition-all duration-200 shadow-[0_4px_10px_rgba(212,175,55,0.2)] hover:bg-[#bc9a2f] hover:-translate-y-[1px]"
                    >
                        <FiPlus className="text-[18px]" /> Add data
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-x-auto border border-[#f0f0f0]">
                <table className="w-full border-collapse text-[13px]">
                    <thead>
                        <tr className="bg-[#f8f9fb]">
                            <th className="py-4 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">S.No</th>
                            <th className="py-4 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Shed No</th>
                            <th className="py-4 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Date</th>
                            <th className="py-4 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Line</th>
                            <th className="py-4 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Line Total</th>
                            <th className="py-4 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? (
                            filtered.map((row, index) => (
                                <tr key={row.id} className="border-b border-[#fafafa] transition-colors duration-200 hover:bg-[#fcfcfd]">
                                    <td className="py-4 px-3 text-center text-[#4a4c56] whitespace-nowrap">{index + 1}</td>
                                    <td className="py-4 px-3 text-center text-[#4a4c56] whitespace-nowrap">{row.shedNo}</td>
                                    <td className="py-4 px-3 text-center text-[#4a4c56] whitespace-nowrap">{row.date}</td>
                                    <td className="py-4 px-3 text-center text-[#4a4c56] whitespace-nowrap">{row.line}</td>
                                    <td className="py-4 px-3 text-center text-[#4a4c56] whitespace-nowrap">{row.lineTotal}</td>
                                    <td className="py-4 px-3 whitespace-nowrap">
                                        <div className="flex items-center justify-center gap-2">
                                            <button className="w-7 h-7 flex items-center justify-center rounded-md border border-[#eee] bg-white text-gray-600 hover:bg-gray-50 hover:scale-105 transition-all shadow-sm tooltip" title="Edit" onClick={() => handleEdit(row)}>
                                                <FiEdit size={14} />
                                            </button>
                                            <button className="w-7 h-7 flex items-center justify-center rounded-md border border-[#eee] bg-white text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500 hover:scale-105 transition-all shadow-sm tooltip" title="Delete" onClick={() => handleDelete(row.id)}>
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="py-10 text-center text-[#999] text-[14px]">
                                    No records found.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
