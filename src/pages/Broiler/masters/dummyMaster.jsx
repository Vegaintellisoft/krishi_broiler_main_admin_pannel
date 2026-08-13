import React, { useState } from "react";
import { Link } from "react-router-dom";
import { RiArrowUpSFill, RiSearchLine } from "react-icons/ri";
import { LuImport, LuPlus } from "react-icons/lu";
import { FiEdit2 } from "react-icons/fi";
import { IoCloseSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import ExcelExport from "../../../utils/ExcelExport";

const BroilerStockLocation = () => {
    const [data, setData] = useState([
        {
            id: 1,
            field: "Shed",
            plant: "Shed-1",
            supplier: "AC-005",
            plant_name: "CH-Shed",
            farmer_name: "Ranjith",
        },
        {
            id: 2,
            field: "Shed",
            plant: "Shed-2",
            supplier: "AC-006",
            plant_name: "KL-Shed",
            farmer_name: "Sathish",
        }
    ]);

    const [searchQuery, setSearchQuery] = useState("");
    const [modalIsOpen, setIsOpen] = useState(false);
    const [updatedUserId, setUpdatedUserId] = useState(null);
    const [formData, setFormData] = useState({
        field: "",
        plant: "",
        supplier: "",
        plant_name: "",
        farmer_name: "",
    });

    const openModal = () => setIsOpen(true);
    const closeModal = () => {
        setIsOpen(false);
        setUpdatedUserId(null);
        setFormData({
            field: "",
            plant: "",
            supplier: "",
            plant_name: "",
            farmer_name: "",
        });
    };

    const handleExport = () => {
        ExcelExport(data, "Stock_Location.xlsx");
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Simple frontend-only add/edit logic
        if (updatedUserId) {
            setData((prev) =>
                prev.map((user) =>
                    user.id === updatedUserId ? { ...user, ...formData } : user
                )
            );
        } else {
            const newUser = { id: Date.now(), ...formData };
            setData((prev) => [...prev, newUser]);
        }

        closeModal();
    };

    const handleEdit = (item) => {
        setFormData(item);
        setUpdatedUserId(item.id);
        setIsOpen(true);
    };

    const handleDelete = (id) => {
        Swal.fire({
            title: "Are you sure?",
            text: "This will remove the user.",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        }).then((result) => {
            if (result.isConfirmed) {
                setData((prev) => prev.filter((user) => user.id !== id));
                Swal.fire("Deleted!", "User removed successfully.", "success");
            }
        });
    };

    const filteredData = data.filter(
        (item) =>
            item.field.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.plant.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.supplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.plant_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.farmer_name.toLowerCase().includes(searchQuery.toLowerCase()) 
    );

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);


    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    return (
        <div className="rounded-lg shadow flex-1">
            {/* Modal */}
            {modalIsOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <form
                        className="px-6 py-4 font-poppins rounded-lg bg-white w-[60em] shadow-lg"
                        onSubmit={handleSubmit}
                    >
                        <div className="flex justify-between border-b py-2">
                            <h1 className="header text-lg font-semibold">
                                {updatedUserId ? "Edit User" : "Add User"}
                            </h1>
                            <button
                                type="button"
                                className="text-white flex justify-center bg-orange-500 rounded-full w-7 h-7 items-center"
                                onClick={closeModal}
                            >
                                <IoCloseSharp />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-14 mt-2 gap-y-3">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Field
                                </label>
                                <input
                                    type="text"
                                    name="field"
                                    value={formData.field}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-100 rounded-md focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Plant
                                </label>
                                <input
                                    type="text"
                                    name="plant"
                                    value={formData.plant}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-100 rounded-md focus:ring-2 focus:ring-orange-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Account No.of.Supplier
                                </label>
                                <input
                                    type="text"
                                    name="supplier"
                                    value={formData.supplier}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-100 rounded-md focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Plant Name
                                </label>
                                <input
                                    type="text"
                                    name="plant_name"
                                    value={formData.plant_name}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-100 rounded-md focus:ring-2 focus:ring-orange-500"
                                    maxLength={10}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Farmer Name
                                </label>
                                <input
                                    type="text"
                                    name="farmer_name"
                                    value={formData.farmer_name}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-100 rounded-md focus:ring-2 focus:ring-orange-500"
                                />
                            </div>

                            {/* <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Status
                                </label>
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleInputChange}
                                    className="w-full p-3 bg-gray-100 rounded-md focus:ring-2 focus:ring-orange-500"
                                >
                                    <option value="">Select</option>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                </select>
                            </div> */}
                        </div>

                        <div className="flex justify-between gap-14 mt-8 mb-10">
                            <button
                                type="button"
                                onClick={closeModal}
                                className="px-6 py-2.5 w-full bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 w-full bg-orange-500 text-white rounded-md hover:bg-orange-600"
                            >
                                Submit
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Header */}
            <div className="bg-[#F9F9FC] h-screen relative">
                <div className="space-y-4 pt-3 px-6 font-poppins">
                    <h1 className="text-xl font-bold text-gray-900">Broiler Stock Location</h1>
                    <div className="flex items-center gap-x-2 text-sm text-gray-500">
                        <Link to="/" className="text-orange-500">
                            Masters
                        </Link>
                        <RiArrowUpSFill className="rotate-90" size={20} />
                        <span>Broiler Stock Location</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex space-x-4">
                            <div className="relative">
                                <RiSearchLine className="absolute left-2 top-2.5 text-gray-400" />
                                <input
                                    type="search"
                                    placeholder="Search Stock..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="py-2 px-8 border rounded-lg text-xs focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        <div className="space-x-5">

                            <button onClick={handleExport} className="px-4 py-2 bg-[#EFE8E0] text-[#F3890A] border rounded-lg hover:bg-orange-500 hover:text-white">
                                <div className="flex gap-2 items-center text-xs ">
                                    <LuImport size={16} className='opacity-50' />
                                    <span>Export</span>
                                </div>
                            </button>

                            <button
                                onClick={openModal}
                                className="px-4 py-2 bg-orange-500 text-white border rounded-lg hover:bg-orange-600"
                            >
                                <div className="flex items-center gap-2 text-xs">
                                    <LuPlus size={16} />
                                    <span>Add User</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow py-4 px-6 mx-4 mt-5 bg-white">
                    <table className="w-full">
                        <thead className="font-poppins font-semibold">
                            <tr className="border-b">
                                <th className="p-4 text-center text-sm text-black">S.No</th>
                                <th className="p-4 text-center text-sm text-black">Field</th>
                                <th className="p-4 text-center text-sm text-black">Plant</th>
                                <th className="p-4 text-center text-sm text-black">Account No.of.Supplier</th>
                                <th className="p-4 text-center text-sm text-black">Plant Name</th>
                                <th className="p-4 text-center text-sm text-black">Farmer Name</th>
                                {/* <th className="p-4 text-center text-sm text-black">Status</th> */}
                                <th className="p-4 text-center text-sm text-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y font-poppins capitalize">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, index) => (
                                    <tr key={index} className="hover:bg-gray-50 text-center">
                                        <td className="p-4 text-sm opacity-65">{index + startIndex + 1}</td>
                                        <td className="p-4 text-sm opacity-65">{item.field}</td>
                                        <td className="p-4 text-sm opacity-65">{item.plant}</td>
                                        <td className="p-4 text-sm opacity-65"> {item.supplier} </td>
                                        <td className="p-4 text-sm opacity-65">{item.plant_name}</td>
                                        <td className="p-4 text-sm opacity-65">{item.farmer_name} </td>
                                        {/* <td className="p-4 opacity-65">
                                            <span
                                                className={`inline-flex px-2 py-1 text-xs font-semibold capitalize rounded-full ${item.status === "active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td> */}
                                        <td className="p-4 text-center space-x-5">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="text-gray-600 hover:text-orange-500"
                                            >
                                                <FiEdit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-gray-600 hover:text-red-500"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="8"
                                        className="py-10 text-center text-gray-500 text-sm"
                                    >
                                        No Data Available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
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
    );
};

export default BroilerStockLocation;
