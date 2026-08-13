import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import Swal from 'sweetalert2';

const medicineItems = [
    "BVCL02-100M TABLET",
    "AMIKACIN INJECTION IP 100ML",
    "MICROFLOX-10k",
    "koloxin sh-500ml",
    "SUPERFIX",
    "ibh k - 1000 doses",
    "kaysol forte 50gm",
    "selko ph (ml)",
    "bleaching powder-calcium hypochlorite35%",
    "inactivated nd 2000 (vwrd)",
    "biospark-v (5 liter)",
    "streswel (5 litter)",
    "aquamax (5 litter)",
    "lg094 (5 litter)",
    "ib multi killed - 1000 doses",
    "fowl pox - 1000 doses",
    "diluent",
    "formalin",
    "brotone vet",
    "nd r2live - 1000 doses",
    "roundup herbicide",
    "super snazz liquid(1ltr)",
    "flyuct power pellets(500gms)",
    "dynamutin 80%",
];

const makeRow = () =>
    Object.fromEntries(medicineItems.map((_, i) => [`item_${i}`, Math.floor(Math.random() * 10) + 1]));

const dummyData = [
    { id: 1,  date: '10-08-2025', flockNo: 'FN-001', ...makeRow() },
    { id: 2,  date: '11-08-2025', flockNo: 'FN-002', ...makeRow() },
    { id: 3,  date: '12-08-2025', flockNo: 'FN-003', ...makeRow() },
    { id: 4,  date: '13-08-2025', flockNo: 'FN-004', ...makeRow() },
    { id: 5,  date: '14-08-2025', flockNo: 'FN-005', ...makeRow() },
    { id: 6,  date: '15-08-2025', flockNo: 'FN-006', ...makeRow() },
    { id: 7,  date: '16-08-2025', flockNo: 'FN-007', ...makeRow() },
    { id: 8,  date: '17-08-2025', flockNo: 'FN-008', ...makeRow() },
    { id: 9,  date: '18-08-2025', flockNo: 'FN-009', ...makeRow() },
    { id: 10, date: '19-08-2025', flockNo: 'FN-010', ...makeRow() },
    { id: 11, date: '20-08-2025', flockNo: 'FN-011', ...makeRow() },
];

export default function MedicineList() {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');
    const [data, setData] = useState(dummyData);

    const handleEdit = (row) => {
         navigate('/medicine/add', { state: { editData: row } });
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
        item.flockNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.date.includes(searchTerm)
    );

    return (
        <div className="w-full m-0 font-poppins p-[20px] bg-[#f9f9fc] min-h-screen text-[#1C1C1C]">
            {/* Header */}
            <div className="flex justify-between items-center mb-[25px]">
                <h3 className="text-[18px] font-bold text-[#1c1c1c] m-0">Medicine</h3>
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
                        onClick={() => navigate('/medicine/add')}
                        className="h-[38px] px-[20px] bg-[#d4af37] text-white border-none rounded-[8px] font-semibold text-[14px] flex items-center gap-[8px] cursor-pointer transition-all duration-200 shadow-[0_4px_10px_rgba(212,175,55,0.2)] hover:bg-[#bc9a2f] hover:-translate-y-[1px]"
                    >
                        <FiPlus className="text-[18px]" /> Add data
                    </button>
                </div>
            </div>

            {/* Scrollable Table */}
            <div className="bg-white rounded-xl shadow-[0_4px_25px_rgba(0,0,0,0.03)] overflow-x-auto border border-[#f0f0f0]">
                <table className="w-full border-collapse text-[13px] min-w-[2800px]">
                    <thead>
                        <tr className="bg-[#f8f9fb]">
                            <th className="py-2.5 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] sticky left-0 z-20 bg-[#f8f9fb] border-r">S.No</th>
                            {medicineItems.map((item, i) => (
                                <th key={i} className="py-2.5 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] text-[11px] leading-snug whitespace-normal max-w-[100px] word-break break-all">
                                    {item}
                                </th>
                            ))}
                            <th className="py-2.5 px-3 text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0]">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filtered.length > 0 ? (
                            filtered.map((row, index) => (
                                <tr key={row.id} className="border-b border-[#fafafa] transition-colors duration-200 hover:bg-[#fcfcfd] group">
                                    <td className="py-4 px-3 text-center text-[#4a4c56] sticky left-0 z-10 bg-white border-r group-hover:bg-[#fcfcfd]">{index + 1}</td>
                                    {medicineItems.map((_, i) => (
                                        <td key={i} className="py-4 px-3 text-center text-[#4a4c56] whitespace-nowrap">
                                            {row[`item_${i}`] ?? '—'}
                                        </td>
                                    ))}
                                    <td className="py-4 px-3 whitespace-nowrap text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            <button 
                                                className="w-7 h-7 flex items-center justify-center rounded-md border border-[#eee] bg-white text-gray-600 hover:bg-gray-50 hover:scale-105 transition-all shadow-sm tooltip" 
                                                title="Edit"
                                                onClick={() => handleEdit(row)}
                                            >
                                                <FiEdit size={14} />
                                            </button>
                                            <button 
                                                className="w-7 h-7 flex items-center justify-center rounded-md border border-[#eee] bg-white text-gray-600 hover:bg-red-50 hover:border-red-200 hover:text-red-500 hover:scale-105 transition-all shadow-sm tooltip" 
                                                title="Delete"
                                                onClick={() => handleDelete(row.id)}
                                            >
                                                <FiTrash2 size={14} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={medicineItems.length + 2} className="py-10 text-center text-[#999] text-[14px]">
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
