import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiEdit, FiEye } from 'react-icons/fi';

const BioSecurityDataList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');



    const dummyData = [
        { id: 1, sortNo: 1, name: "Cleaning & Disinfection", group: "Daily" },
        { id: 2, sortNo: 2, name: "Vaccination", group: "Weekly" },
        { id: 3, sortNo: 3, name: "Pest Control", group: "Daily" },
        { id: 4, sortNo: 4, name: "Staff Hygiene", group: "Monthly" },
        { id: 5, sortNo: 5, name: "Water Quality", group: "Daily" },
        { id: 6, sortNo: 6, name: "Feed Quality", group: "Weekly" },
        { id: 7, sortNo: 7, name: "Health Monitoring", group: "Daily" },
        { id: 8, sortNo: 8, name: "Biosecurity Signage", group: "Daily" },
        { id: 9, sortNo: 9, name: "Vehicle Disinfection", group: "Weekly" },
        { id: 10, sortNo: 10, name: "Visitor Log", group: "Monthly" },
        { id: 11, sortNo: 11, name: "Waste Disposal", group: "Daily" },
    ];


    const [data, setData] = useState(dummyData);

    const handleEdit = (row) => {
         navigate('/biosecuritydata/add', { state: { editData: row } });
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

    const handleAddData = () => {
        navigate('/biosecuritydata/add');
    };

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.group.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full min-h-screen p-[20px] bg-[#f9f9fc] font-poppins">
            <div className="flex justify-between items-center mb-[25px]">
                <h3 className="text-[18px] font-bold text-[#1c1c1c] m-0">Bio Security Data</h3>
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

            <div className="bg-white rounded-[12px] mt-[10px] overflow-x-auto border border-[#f0f0f0] shadow-[0_4px_25px_rgba(0,0,0,0.03)]">
                <table className="w-full min-w-[1000px] border-collapse text-[13px]">
                    <thead>
                        <tr className="bg-[#f8f9fb]">
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Sort No</th>
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Name</th>
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Group</th>
                            <th className="p-[18px_15px] text-center font-bold text-[#1c1c1c] border-b border-[#f0f0f0] whitespace-nowrap">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.length > 0 ? (
                            filteredData.map((row) => (
                                <tr key={row.id} className="hover:bg-[#fcfcfd] transition-colors">
                                    <td className="p-[16px_15px] text-center text-[#4A4C56] border-b border-[#fafafa] whitespace-nowrap">{row.sortNo}</td>
                                    <td className="p-[16px_15px] text-center font-medium text-[#1a1a1a] border-b border-[#fafafa] whitespace-nowrap">{row.name}</td>
                                    <td className="p-[16px_15px] text-center text-[#4A4C56] border-b border-[#fafafa] whitespace-nowrap">{row.group}</td>
                                    <td className="p-[16px_15px] flex justify-center gap-[10px] border-b border-[#fafafa]">
                                        <button className="w-[32px] h-[32px] rounded-[8px] bg-white border border-[#eee] text-[#666] flex items-center justify-center cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:bg-[#f0f7ff] hover:text-[#007bff] hover:border-[#007bff]">
                                            <FiEdit className="text-[14px]" />
                                        </button>
                                        <button className="w-[32px] h-[32px] rounded-[8px] bg-white border border-[#eee] text-[#666] flex items-center justify-center cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:bg-[#f0fff4] hover:text-[#28a745] hover:border-[#28a745]">
                                            <FiEye className="text-[14px]" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center bg-white p-[40px] text-[#999] text-[14px]">
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

export default BioSecurityDataList;
