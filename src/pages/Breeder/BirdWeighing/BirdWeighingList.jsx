import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';

const dummyData = [
    { id: 1, date: '2025-09-23', henType: 'Male', actualWeight: 1450, sampleWeight: 145, sampleWeightPct: 10, schedule: 'M-1', stdDev: 2.1, uniformity: 85 },
    { id: 2, date: '2025-09-23', henType: 'Female', actualWeight: 1250, sampleWeight: 125, sampleWeightPct: 10, schedule: 'F-1', stdDev: 1.8, uniformity: 88 },
    { id: 3, date: '2025-09-24', henType: 'Male', actualWeight: 1455, sampleWeight: 146, sampleWeightPct: 10.03, schedule: 'M-1', stdDev: 2.2, uniformity: 84 },
    { id: 4, date: '2025-09-24', henType: 'Female', actualWeight: 1260, sampleWeight: 126, sampleWeightPct: 10, schedule: 'F-1', stdDev: 1.9, uniformity: 87 },
    { id: 5, date: '2025-09-25', henType: 'Male', actualWeight: 1460, sampleWeight: 146, sampleWeightPct: 10, schedule: 'M-1', stdDev: 2.0, uniformity: 86 },
    { id: 6, date: '2025-09-25', henType: 'Female', actualWeight: 1270, sampleWeight: 127, sampleWeightPct: 10, schedule: 'F-1', stdDev: 1.7, uniformity: 89 },
    { id: 7, date: '2025-09-26', henType: 'Male', actualWeight: 1465, sampleWeight: 147, sampleWeightPct: 10.03, schedule: 'M-1', stdDev: 2.1, uniformity: 85 },
    { id: 8, date: '2025-09-26', henType: 'Female', actualWeight: 1280, sampleWeight: 128, sampleWeightPct: 10, schedule: 'F-2', stdDev: 2.0, uniformity: 84 },
    { id: 9, date: '2025-09-27', henType: 'Male', actualWeight: 1470, sampleWeight: 147, sampleWeightPct: 10, schedule: 'M-2', stdDev: 2.3, uniformity: 83 },
    { id: 10, date: '2025-09-27', henType: 'Female', actualWeight: 1290, sampleWeight: 129, sampleWeightPct: 10, schedule: 'F-2', stdDev: 1.9, uniformity: 88 },
    { id: 11, date: '2025-09-28', henType: 'Male', actualWeight: 1475, sampleWeight: 148, sampleWeightPct: 10.03, schedule: 'M-2', stdDev: 2.2, uniformity: 85 },
];

export default function BirdWeighingList() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState(dummyData);

    const handleEdit = (row) => {
         navigate('/birdweighing/add', { state: { editData: row } });
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
                if (typeof setData === 'function') setData(prev => prev.filter(item => item.id !== id));
                Swal.fire('Deleted!', 'Your record has been deleted.', 'success')
            }
        })
    };


    const filtered = data.filter(item =>
        item.henType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.includes(searchTerm)
    );

    return (
        <div className="w-full m-0 font-poppins p-[20px] bg-[#f9f9fc] min-h-screen text-[#1C1C1C]">
            {/* Header */}
            <div className="flex justify-between items-center mb-[25px]">
                <h3 className="text-[18px] font-bold text-[#1c1c1c] m-0">Bird Weighing</h3>
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
                        onClick={() => navigate('/birdweighing/add')}
                        className="h-[38px] px-[20px] bg-[#d4af37] text-white border-none rounded-[8px] font-semibold text-[14px] flex items-center gap-[8px] cursor-pointer transition-all duration-200 shadow-[0_4px_10px_rgba(212,175,55,0.2)] hover:bg-[#bc9a2f] hover:-translate-y-[1px]"
                    >
                        <FiPlus className="text-[18px]" /> Add data
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-x-auto border border-[#f0f0f0]">
                <table className="w-full border-collapse text-[13px] min-w-[1200px]">
                    <thead>
                        <tr className="bg-[#f8f9fb]">
                            <th className="py-3 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] sticky left-0 z-20 bg-[#f8f9fb] border-r">S.No</th>
                            <th className="py-3 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0]">Date</th>
                            <th className="py-3 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0]">Hen Type</th>
                            <th className="py-3 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0]">Actual Weight (G)</th>
                            <th className="py-3 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0]">Sample Weight (G)</th>
                            <th className="py-3 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0]">Sample Weight (%)</th>
                            <th className="py-3 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0]">Schedule</th>
                            <th className="py-3 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0]">Std. Dev. (%)</th>
                            <th className="py-3 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0]">Uniformity (%)</th>
                            <th className="py-3 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? (
                            filtered.map((row, index) => (
                                <tr key={row.id} className="border-b border-[#fafafa] transition-colors duration-200 hover:bg-[#fcfcfd] group">
                                    <td className="py-4 px-3 text-center text-[#4a4c56] sticky left-0 z-10 bg-white border-r group-hover:bg-[#fcfcfd]">{index + 1}</td>
                                    <td className="py-4 px-3 text-center text-[#4a4c56] whitespace-nowrap">{row.date}</td>
                                    <td className="py-4 px-3 text-center text-[#4a4c56]">{row.henType}</td>
                                    <td className="py-4 px-3 text-center text-[#4a4c56]">{row.actualWeight}</td>
                                    <td className="py-4 px-3 text-center text-[#4a4c56]">{row.sampleWeight}</td>
                                    <td className="py-4 px-3 text-center text-[#4a4c56]">{row.sampleWeightPct}%</td>
                                    <td className="py-4 px-3 text-center text-[#4a4c56]">{row.schedule}</td>
                                    <td className="py-4 px-3 text-center text-[#4a4c56]">{row.stdDev}</td>
                                    <td className="py-4 px-3 text-center text-[#4a4c56]">{row.uniformity}</td>
                                    <td className="py-4 px-3 whitespace-nowrap text-center">
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
                                <td colSpan="10" className="py-10 text-center text-[#999] text-[14px]">
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
