import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { RiArrowUpSFill, RiDeleteBin6Line, RiSearchLine } from 'react-icons/ri';
import { LuImport, LuPlus } from 'react-icons/lu';
import { FiEdit2 } from 'react-icons/fi';
import axios from 'axios';
import Swal from "sweetalert2";
import ExcelExport from '../utils/ExcelExport';
import { IoCloseSharp } from 'react-icons/io5';
import { useAuth } from '../auth/AuthContext';


const UserMaster = () => {
    const { getPermissions } = useAuth();
    const { userMaster } = getPermissions();

    const [data, setData] = useState([]);
    const [roles, setRoles] = useState([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [updatedUserId, setUpdatedUserId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [isSubmitLoading, setIsSubmitLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const [formData, setFormData] = useState({
        fullname: '',
        username: '',
        password: '',
        mobile: '',
        email: '',
        status: 'active',
        category: 'Wagon',
        role: ''
    });

    useEffect(() => {
        fetchUserData();
        fetchRoles();
    }, []);

    const fetchUserData = async () => {
        setIsLoading(true);
        try {
            const { data } = await axios.get("/driver/getAll", {
                params: { category: "Wagon" }
            });
            setData(data.data || []);
        } catch (err) {
            console.log("Error fetching user:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchRoles = async () => {
        try {
            const { data } = await axios.get("/roles/getAll/Wagon");
            if (data.status) {
                // Only show active roles
                const activeRoles = data.data.filter(r => r.status === true || r.status === 'active');
                setRoles(activeRoles);
            }
        } catch (err) {
            console.log("Error fetching roles:", err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitLoading(true);

        if (formData.mobile.length < 10) {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Mobile number must be 10 digits',
            });
            setIsSubmitLoading(false);
            return;
        }

        try {
            let response;
            if (updatedUserId) {
                response = await axios.put(`/driver/update/${updatedUserId}`, formData);
            } else {
                response = await axios.post("/driver/register", formData);
            }
            if (response.data.status) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: updatedUserId ? 'User updated successfully!' : 'User created successfully!',
                    showConfirmButton: false,
                    timer: 2500
                });
                await fetchUserData();
                closeModal();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: response.data.message || 'Error saving user'
                });
            }
        } catch (err) {
            console.log("server error: ", err);
            if (err.response && (err.response.status === 400 || err.response.status === 409)) {
                Swal.fire({
                    icon: 'error',
                    title: 'Username or Mobile Exists',
                    text: err.response.data.message,
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: err.response?.data?.message || 'Internal server error',
                });
            }
        } finally {
            setIsSubmitLoading(false);
        }
    };

    const handleEdit = (item) => {
        setFormData({
            fullname: item.fullname,
            username: item.username,
            password: "*******",
            mobile: item.mobile,
            email: item.email || '',
            status: item.status,
            role: item.role,
            category: item.category || 'Wagon'
        });
        setUpdatedUserId(item.id);
        setIsOpen(true);
    };

    const handleDelete = async (id, name) => {
        Swal.fire({
            title: "Delete User?",
            text: `Are you sure you want to delete user "${name || ''}"? This action cannot be undone!`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#808080",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { data } = await axios.delete(`/driver/delete/${id}`);
                    if (data.status) {
                        Swal.fire({
                            toast: true,
                            position: "top-end",
                            icon: "success",
                            title: "User deleted successfully.",
                            showConfirmButton: false,
                            timer: 2500
                        });
                        fetchUserData();
                    } else {
                        Swal.fire({
                            icon: "error",
                            title: "Error",
                            text: data.message || "Failed to delete user"
                        });
                    }
                } catch (err) {
                    console.log("Error deleting user:", err);
                    Swal.fire({
                        icon: "error",
                        title: "Error",
                        text: err.response?.data?.message || "Failed to delete user"
                    });
                }
            }
        });
    };

    const handleExport = () => {
        ExcelExport(data, "User_Master_Data.xlsx");
    };

    function openModal() {
        setIsOpen(true);
    }

    function closeModal() {
        setIsOpen(false);
        setUpdatedUserId(null);
        setFormData({
            fullname: '',
            username: '',
            password: '',
            mobile: '',
            email: '',
            status: 'active',
            category: 'Wagon',
            role: ''
        });
    }

    const filteredData = (data || []).filter((item) => {
        if (!item) return false;
        const q = (searchQuery || '').toLowerCase().trim();
        if (!q) return true;

        const fullname = (item.fullname || '').toString().toLowerCase();
        const username = (item.username || '').toString().toLowerCase();
        const password = (item.password || '').toString().toLowerCase();
        const mobile = (item.mobile || '').toString().toLowerCase();
        const status = (item.status || '').toString().toLowerCase();
        const role = (item.role || '').toString().toLowerCase();
        const email = (item.email || '').toString().toLowerCase();

        return (
            fullname.includes(q) ||
            username.includes(q) ||
            password.includes(q) ||
            mobile.includes(q) ||
            status.includes(q) ||
            role.includes(q) ||
            email.includes(q)
        );
    });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

    // Pagination logic
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Handle pagination
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    return (
        <div className="rounded-lg shadow flex-1">
            {modalIsOpen ? (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <form
                        className="px-6 py-4 font-poppins rounded-lg bg-white w-[60em] shadow-lg"
                        onSubmit={handleSubmit}
                    >
                        <div className="flex justify-between border-b py-2">
                            <h1 className="header text-lg font-semibold">
                                {updatedUserId ? 'Edit User' : 'User Create'}
                            </h1>
                            <button
                                type="button"
                                className="text-white flex justify-center bg-primary rounded-full w-7 h-7 items-center"
                                onClick={closeModal}
                            >
                                <IoCloseSharp />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 mt-2 gap-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                                <input
                                    type="text"
                                    name="fullname"
                                    value={formData.fullname}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-medium"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">User Name</label>
                                <input
                                    type="text"
                                    name="username"
                                    value={formData.username}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-medium"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Email ID (Optional)</label>
                                <input
                                    type="email"
                                    name="email"
                                    value={formData.email}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-medium"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                                <input
                                    type="number"
                                    name="mobile"
                                    value={formData.mobile}
                                    onChange={(e) => {
                                        const value = e.target.value;
                                        if (value.length <= 10) {
                                            handleInputChange(e);
                                        }
                                    }}
                                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-medium"
                                    required
                                    maxLength={10}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                                <input
                                    type="text"
                                    name="password"
                                    value={formData.password}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-medium"
                                    required={!updatedUserId}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
                                <select
                                    name="role"
                                    value={formData.role}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-medium"
                                    required
                                >
                                    <option value="" disabled>Select Role</option>
                                    {roles.length > 0 ? (
                                        roles.map((r) => (
                                            <option key={r.id} value={r.role_name}>{r.role_name}</option>
                                        ))
                                    ) : (
                                        <option value="" disabled>No roles available — create one in Admin &gt; Roles</option>
                                    )}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 text-xs font-medium"
                                >
                                    <option value="" disabled>Select Status</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex justify-between gap-14 mt-8 mb-4">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-6 py-2.5 w-full bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300 text-xs font-semibold"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 w-full bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center justify-center gap-2 text-xs font-semibold"
                                disabled={isSubmitLoading}
                            >
                                {isSubmitLoading ? 'Submitting...' : 'Submit'}
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}

            <div className="bg-[#F9F9FC] min-h-screen relative">
                <div className="space-y-4 pt-3 px-6 font-poppins">
                    <h1 className="text-xl font-bold text-gray-900">User Masters</h1>
                    <div className="flex items-center gap-x-2 text-sm text-gray-500 ">
                        <Link to="/" className='text-orange-500'>Masters</Link>
                        <span>
                            <RiArrowUpSFill className='rotate-90 ' size={20} />
                        </span>
                        <span>User Master</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="space-x-4 flex">
                            <div>
                                <span className='absolute'>
                                    <RiSearchLine className='ms-2 mt-2 opacity-45' />
                                </span>
                                <input
                                    type="search"
                                    placeholder="Search User..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="py-2 px-2 ps-10 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        <div className='space-x-5'>
                            <button onClick={handleExport} className="px-4 py-2 bg-[#EFE8E0] text-[#F3890A] border rounded-lg hover:bg-orange-500 hover:text-white">
                                <div className="flex gap-2 items-center text-xs ">
                                    <LuImport size={16} className='opacity-50' />
                                    <span>Export</span>
                                </div>
                            </button>

                            {
                                userMaster?.add !== false && (
                                    <button className="px-4 py-2 bg-orange-500 text-white border rounded-lg hover:text-white" onClick={openModal}>
                                        <div className='flex items-center gap-2 text-xs' >
                                            <LuPlus size={16} />
                                            <span>Add User</span>
                                        </div>
                                    </button>
                                )
                            }
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto px-6 mx-4 mt-5 bg-white rounded-xl shadow-sm border border-gray-100">
                    <table className="w-full text-left">
                        <thead className='font-poppins font-semibold text-xs text-gray-600 bg-gray-50 uppercase'>
                            <tr className="border-b">
                                <th className="p-4 text-center">S.No</th>
                                <th className="p-4">Full Name</th>
                                <th className="p-4">User Name</th>
                                <th className="p-4 text-center">Password</th>
                                <th className="p-4">Email ID</th>
                                <th className="p-4">Mobile</th>
                                <th className="p-4 text-center">Role</th>
                                <th className="p-4 text-center">Status</th>
                                <th className="p-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y font-poppins text-xs text-gray-700">
                            {paginatedData.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50/80 transition-all">
                                    <td className="p-4 text-center font-semibold text-gray-400">{startIndex + index + 1}</td>
                                    <td className="p-4 font-bold text-gray-900">{item.fullname}</td>
                                    <td className="p-4 font-mono text-gray-600">@{item.username}</td>
                                    <td className="p-4 text-center font-mono text-gray-400">{"••••••••••"}</td>
                                    <td className="p-4 text-gray-600">{item.email || "-"}</td>
                                    <td className="p-4 font-medium">{item.mobile}</td>
                                    <td className="p-4 text-center">
                                        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 rounded-md font-semibold text-[11px] capitalize">
                                            {item.role || 'User'}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <span
                                            className={`inline-flex px-2.5 py-0.5 text-[11px] font-bold capitalize rounded-full ${item.status === 'active'
                                                ? 'bg-green-100 text-green-700 border border-green-200'
                                                : 'bg-red-100 text-red-700 border border-red-200'
                                                }`}
                                        >
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                            {userMaster?.edit !== false && (
                                                <button
                                                    onClick={() => handleEdit(item)}
                                                    className="p-1.5 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-all"
                                                    title="Edit User"
                                                >
                                                    <FiEdit2 size={16} />
                                                </button>
                                            )}
                                            {userMaster?.delete !== false && (
                                                <button
                                                    onClick={() => handleDelete(item.id, item.fullname || item.username)}
                                                    className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                    title="Delete User"
                                                >
                                                    <RiDeleteBin6Line size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}

                            {
                                (paginatedData?.length <= 0 && !isLoading) &&
                                <tr>
                                    <td colSpan="9" className="py-10 text-center text-gray-400 text-xs font-medium">
                                        No Users Available
                                    </td>
                                </tr>
                            }

                            {isLoading && (
                                <tr>
                                    <td colSpan="9" className="py-10 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    {totalPages > 1 && (
                        <div className="flex justify-end font-dm items-center gap-2 py-4">
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
                                1
                            </button>
                            <span className="px-3 py-1 border font-medium rounded bg-gray-200">{currentPage}</span>
                            <button
                                onClick={goToLastPage}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 border text-sm rounded ${currentPage === totalPages ? 'text-gray-400' : 'text-black'}`}
                            >
                                {totalPages}
                            </button>
                            <button
                                onClick={goToNextPage}
                                disabled={currentPage === totalPages}
                                className={`px-3 py-1 border rounded ${currentPage === totalPages ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}
                            >
                                &gt;
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserMaster;