import React, { useState } from 'react';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import { FiSearch, FiPlus, FiEdit, FiTrash2, FiEye } from 'react-icons/fi';

const BioSecurityList = () => {
    const navigate = useNavigate();
    const [searchTerm, setSearchTerm] = useState('');

    const dummyData = [
        { id: 1, sortNo: 1, name: "Cleaning & Disinfection", group: "Daily, Weekly" },
        { id: 2, sortNo: 2, name: "Vaccination", group: "Monthly" },
        { id: 3, sortNo: 3, name: "Pest Control", group: "Weekly" },
        { id: 4, sortNo: 4, name: "Staff Hygiene", group: "Daily" },
        { id: 5, sortNo: 5, name: "Water Quality", group: "Daily, Weekly" },
        { id: 6, sortNo: 6, name: "Feed Quality", group: "Weekly" },
        { id: 7, sortNo: 7, name: "Health Monitoring", group: "Daily" },
        { id: 8, sortNo: 8, name: "Biosecurity Signage", group: "Monthly" },
        { id: 9, sortNo: 9, name: "Vehicle Disinfection", group: "Daily" },
        { id: 10, sortNo: 10, name: "Visitor Log", group: "Daily" },
        { id: 11, sortNo: 11, name: "Waste Disposal", group: "Weekly" },
    ];

    const [data, setData] = useState(dummyData);

    const handleEdit = (row) => {
         navigate('/biosecurity/add', { state: { editData: row } });
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
        navigate('/biosecurity/add');
    };

    const filteredData = data.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.group.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="w-full m-0 p-[20px] bg-[#f9f9fc] min-h-screen font-poppins">
            <div className="flex justify-between items-center mb-[25px]">
                <h3 className="text-[18px] font-bold text-[#1c1c1c] m-0">Mapping</h3>
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
                                <tr key={row.id} className="hover:bg-[#fcfcfd]">
                                    <td className="p-[16px_15px] text-center text-[#4A4C56] border-b border-[#fafafa] whitespace-nowrap">{row.sortNo}</td>
                                    <td className="p-[16px_15px] text-center font-medium text-[#1a1a1a] border-b border-[#fafafa] whitespace-nowrap">{row.name}</td>
                                    <td className="p-[16px_15px] text-center text-[#4A4C56] border-b border-[#fafafa] whitespace-nowrap">{row.group}</td>
                                    <td className="flex gap-[10px] justify-center p-[16px_15px] border-b border-[#fafafa]">
                                        <button className="w-[32px] h-[32px] rounded-[8px] bg-white text-[#666] border border-[#eee] flex items-center justify-center cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:bg-[#f0f7ff] hover:text-[#007bff] hover:border-[#007bff]" onClick={() => handleEdit(row)}>
                                            <FiEdit className="text-[14px]" />
                                        </button>
                                        <button className="w-[32px] h-[32px] rounded-[8px] bg-white text-[#666] border border-[#eee] flex items-center justify-center cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:bg-[#f0fff4] hover:text-[#28a745] hover:border-[#28a745]">
                                            <FiEye className="text-[14px]" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="4" className="text-center p-[40px] text-[#999] text-[14px] bg-white border-b border-[#fafafa]">
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

export default BioSecurityList;
