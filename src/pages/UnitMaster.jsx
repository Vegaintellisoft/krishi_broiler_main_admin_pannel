import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowUpSFill, RiDeleteBin6Line, RiSearchLine } from 'react-icons/ri'
import { LuImport, LuPlus } from 'react-icons/lu'
import { FiEdit2 } from 'react-icons/fi'
import axios from 'axios';
import Swal from "sweetalert2";
import ExcelExport from '../utils/ExcelExport'
import { IoCloseSharp } from 'react-icons/io5'
import { useAuth } from '../auth/AuthContext'

const UnitMaster = () => {
    const { getPermissions } = useAuth();
    const { unitMaster } = getPermissions();

    const [data, setData] = useState([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [updatedUnitId, setUpdatedUnitId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");

    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitLoading, setIsSubmitLoading] = useState(false)


    const [formData, setFormData] = useState({
        unit: '',
        description: '',
    });

    useEffect(() => {
        fetchUnitMaster();
    }, []);

    const fetchUnitMaster = async () => {
        setIsLoading(true)
        try {
            const { data } = await axios.get("/unit/getAll");
            setData(data.data);
        }
        catch (err) {
            console.log("Error fetching units master:", err)
        } finally {
            setIsLoading(false)
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitLoading(true)
        try {
            let response;
            if (updatedUnitId) {
                response = await axios.put(`/unit/update/${updatedUnitId}`, formData);
            } else {
                response = await axios.post("/unit/add", formData);
            }
            if (response.data.status) {
                fetchUnitMaster();
                setIsOpen(false);

                setFormData({
                    unit: '',
                    description: '',
                });
                setUpdatedUnitId(null);
            } else {
                console.log("Error saving supplier master");
            }
        } catch (err) {
            console.log("Error saving supplier master:", err);
        } finally {
            setIsSubmitLoading(false)
        }
    };

    const handleEdit = (item) => {
        setFormData({
            unit: item.unit,
            description: item.description,
        });
        setUpdatedUnitId(item.id);
        setIsOpen(true);
    }

    const handleDelete = async (id) => {
        Swal.fire({
            title: "Are you sure?",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    const { data } = await axios.delete(`/unit/delete/${id}`);
                    if (data.status) {
                        Swal.fire({
                            toast: true,
                            position: "top-end",
                            icon: "success",
                            title: "Successfully deleted.",
                            showConfirmButton: false,
                            timer: 3000
                        });

                        fetchUnitMaster();
                    }
                } catch (err) {
                    console.log("Error deleting data:", err);
                }
            }
        });
    };

    const handleExport = () => {
        ExcelExport(data, "Unit_Master.xlsx");
    };

    function openModal() {
        setIsOpen(true);
    }
    function closeModal() {
        setIsOpen(false);
        setUpdatedUnitId(null);
        setFormData({
            unit: '',
            description: '',
        });
    }


    const filteredData = data.filter((item) => {
        return (
            item.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description.toLowerCase().includes(searchQuery.toLowerCase())
        );
    });

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);

    // Pagination logic
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Handle pagination
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    return (

        <div className={` rounded-lg shadow flex-1 `}>

            {modalIsOpen ? (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <form
                        className="px-6 py-4 font-poppins rounded-lg bg-white w-[60em] shadow-lg"
                        onSubmit={handleSubmit}
                    >
                        <div className="flex justify-between border-b py-2">
                            <h1 className="header text-lg font-semibold">Add Unit Master</h1>
                            <button
                                className=" text-white flex justify-center bg-primary rounded-full w-7 h-7 items-center"
                                onClick={closeModal}
                            >
                                <IoCloseSharp />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 mt-2 gap-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                                <input
                                    type="text"
                                    name="unit"
                                    value={formData.unit}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <input
                                    type="text"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>
                        </div>

                        <div className="flex justify-between gap-14 mt-4 mb-10">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-6 py-2.5 w-full bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 w-full bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center justify-center gap-2"
                                disabled={isSubmitLoading} // optional: disable while loading
                            >
                                {isSubmitLoading ? (
                                    <>
                                        <svg
                                            className="animate-spin h-5 w-5 text-white"
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                        >
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                            ></circle>
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8v8H4z"
                                            ></path>
                                        </svg>
                                        Submitting...
                                    </>
                                ) : (
                                    'Submit'
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            ) : null}


            <div className={` bg-[#F9F9FC] h-screen relative`}>

                {/* Part Master Heading */}
                <div className=" space-y-4 pt-3 px-6 font-poppins">
                    <h1 className="text-xl font-bold text-gray-900">Unit Masters</h1>
                    <div className="flex items-center gap-x-2 text-sm text-gray-500 ">
                        <Link to="/" className='text-orange-500'>Masters</Link>
                        <span>
                            <RiArrowUpSFill className='rotate-90 ' size={20} />
                        </span>
                        <span>Unit Master</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className=" space-x-4  flex">
                            <div>
                                <span className='absolute'>
                                    <RiSearchLine className='ms-2 mt-2 opacity-45' />
                                </span>
                                <input
                                    type="search"
                                    placeholder="Search Master..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className=" py-2 px-2 ps-10 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                                unitMaster?.add && <button className="px-4 py-2 bg-orange-500 text-white border rounded-lg  hover:text-white" onClick={openModal}>
                                    <div className='flex items-center gap-2 text-xs' >
                                        <LuPlus size={16} />
                                        <span >Add Data</span>
                                    </div>
                                </button>
                            }


                        </div>
                    </div>

                </div>

                {/* Table */}
                <div className={`overflow px-6 mx-4 mt-5 bg-white`}>

                    <table className={`w-full`}>
                        <thead className='font-poppins font-semibold'>
                            <tr className="border-b">
                                <th className="p-4 text-center text-sm text-black">S.No</th>
                                <th className="p-4 text-center text-sm text-black">Unit</th>
                                <th className="p-4 text-center text-sm text-black">Description</th>
                                {
                                    (!unitMaster?.edit && !unitMaster?.delete) ? "" : <th className="p-4 text-center text-sm text-black">Actions</th>
                                }

                            </tr>
                        </thead>
                        <tbody className="divide-y font-poppins">
                            {paginatedData.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 text-center">
                                    <td className="p-4 text-sm opacity-65">{startIndex + index + 1}</td>
                                    <td className="p-4 text-sm opacity-65">{item.unit}</td>
                                    <td className="p-4 text-sm w-[40%] opacity-65">{item.description}</td>

                                    {
                                        (!unitMaster?.edit && !unitMaster?.delete) ?
                                            ""
                                            :
                                            <td className="p-4 text-right space-x-5 flex justify-center opacity-65">
                                                {
                                                    unitMaster?.edit && <button onClick={() => handleEdit(item)} className=" hover:text-gray-700">
                                                        <FiEdit2 size={20} />
                                                    </button>
                                                }

                                                {
                                                    unitMaster?.delete && <button onClick={() => handleDelete(item.id)} className=" hover:text-gray-700">

                                                        <RiDeleteBin6Line size={20} />
                                                    </button>
                                                }

                                            </td>
                                    }


                                </tr>
                            ))}

                            {
                                (paginatedData?.length <= 0 && !isLoading) &&
                                <tr>
                                    <td colSpan="4" className="py-10 text-center text-gray-500 text-sm">
                                        No Data Available
                                    </td>
                                </tr>
                            }

                            {isLoading && (
                                <tr>
                                    <td colSpan="4" className="py-10 text-center">
                                        <div className="flex justify-center items-center">
                                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="flex justify-end font-dm items-center gap-2 mt-4">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 border  rounded ${currentPage === 1 ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}
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

                </div>

            </div>
        </div>
    )
}

export default UnitMaster