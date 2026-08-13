import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RiArrowUpSFill, RiSearchLine, RiDeleteBin6Line } from "react-icons/ri";
import { LuImport, LuPlus } from "react-icons/lu";
import { FiEdit2 } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import Swal from "sweetalert2";
import axios from "axios";
import ExcelExport from "../../../utils/ExcelExport";
import { CustomDropdown } from "../../../components/CustomDropdown";

const formatHeader = (text) =>
    text
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

const LineFarmMaster = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({ line_id: "", name: "", plant: "" });
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [plants, setPlants] = useState([]);
    const [isLoadingPlants, setIsLoadingPlants] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
        fetchPlants();
    }, []);

    const fetchPlants = async () => {
        try {
            setIsLoadingPlants(true);
            const res = await axios.get("broiler/plant/getAll");
            if (res.data?.success) {
                setPlants(res.data.data || []);
            } else {
                setPlants([]);
            }
        } catch (err) {
            console.error("Failed to load plants:", err);
            setPlants([]);
        } finally {
            setIsLoadingPlants(false);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get("broiler/line-farm/getAll");
            const rows = res.data?.data || [];
            setData(rows);
        } catch (err) {
            console.error("Error fetching line farm master:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        setEditItem(null);
        setFormData({ line_id: "", name: "", plant: "" });
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditItem(item);
        setFormData({
            line_id: item.line_id ?? "",
            name: item.name ?? "",
            plant: item.plant ?? "",
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditItem(null);
        setFormData({ line_id: "", name: "", plant: "" });
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePlantChange = (newPlantId) => {
        setFormData((prev) => ({
            ...prev,
            plant: newPlantId,
        }));
    };

    // Options for the CustomDropdown
    const plantOptions = plants.map((p) => ({
        label: `${p.plant_id} | ${p.plant_name}`,
        value: p.plant_id,
    }));

    // Duplicate validation for line_id and name
    const isDuplicate = (field, value) => {
        if (!value) return false;
        return data.some(
            (item) =>
                item[field]?.toString().toLowerCase().trim() === value.toString().toLowerCase().trim() &&
                // When editing, exclude the current record from duplicate check
                (!editItem || item.id !== editItem.id)
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);

            if (!formData.line_id?.trim()) {
                Swal.fire({ icon: "warning", title: "Line Id required", text: "Please enter a Line Id." });
                return;
            }
            if (!formData.name?.trim()) {
                Swal.fire({ icon: "warning", title: "Name required", text: "Please enter a Name." });
                return;
            }
            if (!formData.plant) {
                Swal.fire({ icon: "warning", title: "Plant required", text: "Please select a Plant." });
                return;
            }

            // Duplicate checks
            if (isDuplicate("line_id", formData.line_id)) {
                Swal.fire({
                    icon: "warning",
                    title: "Duplicate Line Id",
                    text: `Line Id "${formData.line_id}" already exists. Please enter a unique Line Id.`,
                });
                return;
            }
            if (isDuplicate("name", formData.name)) {
                Swal.fire({
                    icon: "warning",
                    title: "Duplicate Name",
                    text: `Name "${formData.name}" already exists. Please enter a unique Name.`,
                });
                return;
            }

            const cleaned = {
                line_id: formData.line_id.trim(),
                name: formData.name.trim(),
                plant: formData.plant,
            };

            let res;
            if (editItem?.id) {
                res = await axios.put(`broiler/line-farm/update/${editItem.id}`, cleaned);
            } else {
                res = await axios.post("broiler/line-farm/create", cleaned);
            }

            if (res.data?.success) {
                Swal.fire({
                    icon: "success",
                    title: editItem ? "Updated!" : "Created!",
                    timer: 1500,
                    showConfirmButton: false,
                });
                await fetchData();
                closeModal();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Save failed",
                    text: res.data?.message || "Could not save record.",
                });
            }
        } catch (err) {
            console.error("Save error:", err);
            Swal.fire({
                icon: "error",
                title: "Save failed",
                text: err?.response?.data?.message || err.message || "Request failed.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (item) => {
        if (!item?.id) {
            Swal.fire({ icon: "error", title: "Missing id", text: "Cannot delete: record id is missing." });
            return;
        }

        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: `This will permanently delete Line "${item.line_id || "this record"}".`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await axios.delete(`broiler/line-farm/delete/${item.id}`);
            if (res.data?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Deleted!",
                    text: "Record has been deleted.",
                    timer: 1500,
                    showConfirmButton: false,
                });
                fetchData();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Delete failed",
                    text: res.data?.message || "Could not delete record.",
                });
            }
        } catch (err) {
            console.error("Delete error:", err);
            Swal.fire({
                icon: "error",
                title: "Delete failed",
                text: err?.response?.data?.message || err.message || "Request failed.",
            });
        }
    };

    const handleExport = () => ExcelExport(data, "line_farm_master.xlsx");

    const tableColumns = ["line_id", "name", "plant"];

    const filteredData = data.filter((item) =>
        tableColumns.some((col) =>
            item[col]?.toString().toLowerCase().includes(searchQuery.toLowerCase())
        )
    );

    const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

    // Resolve plant_id to plant_name for display in the table
    const getPlantDisplay = (plantId) => {
        const plant = plants.find((p) => String(p.plant_id) === String(plantId));
        return plant ? `${plant.plant_id} | ${plant.plant_name}` : plantId || "-";
    };

    return (
        <div className="rounded-lg shadow flex-1">
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden font-poppins flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">
                                {editItem ? "Edit Line Farm" : "Add Line Farm"}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-red-500 transition">
                                <IoCloseSharp size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Line Id */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Line Id *
                                    </label>
                                    <input
                                        type="text"
                                        name="line_id"
                                        value={formData.line_id}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Enter Line Id"
                                    />
                                </div>

                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">
                                        Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                        placeholder="Enter Name"
                                    />
                                </div>

                                {/* Plant Dropdown */}
                                <div className="col-span-2">
                                    <CustomDropdown
                                        label="Plant *"
                                        name="plant"
                                        value={formData.plant ?? ""}
                                        onChange={handlePlantChange}
                                        options={plantOptions}
                                        isDisabled={isLoadingPlants}
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button
                                    type="button"
                                    onClick={closeModal}
                                    className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-60"
                                >
                                    {isSubmitting ? "Saving..." : editItem ? "Update" : "Create"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="bg-[#F9F9FC] h-screen relative">
                <div className="space-y-4 pt-3 px-6 font-poppins">
                    <h1 className="text-xl font-bold text-gray-900">Line Farm Master</h1>
                    <div className="flex items-center gap-x-2 text-sm text-gray-500">
                        <Link to="/" className="text-orange-500">Masters</Link>
                        <RiArrowUpSFill className="rotate-90" size={20} />
                        <span>Line Farm Master</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="relative">
                            <RiSearchLine className="absolute left-2 top-2.5 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search Line Farm..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="py-2 px-8 border rounded-lg text-xs focus:ring-2 focus:ring-orange-500"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={handleExport}
                                className="px-4 py-2 bg-[#EFE8E0] text-[#F3890A] border rounded-lg hover:bg-orange-500 hover:text-white text-xs flex items-center gap-2"
                            >
                                <LuImport size={16} /> Export
                            </button>
                            <button
                                onClick={openCreateModal}
                                className="px-4 py-2 bg-orange-500 text-white border rounded-lg hover:bg-orange-600 text-xs flex items-center gap-2"
                            >
                                <LuPlus size={16} /> Add
                            </button>
                        </div>
                    </div>
                </div>

                <div className="overflow-x-auto py-4 px-6 mx-4 mt-5 bg-white relative">
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-80">
                            <FaSpinner className="animate-spin text-orange-500 text-3xl" />
                        </div>
                    )}

                    <table className="min-w-full">
                        <thead className="font-poppins font-semibold">
                            <tr className="border-b">
                                <th className="p-4 text-center text-sm text-black">S.No</th>
                                <th className="p-4 text-center text-sm text-black">Line Id</th>
                                <th className="p-4 text-center text-sm text-black">Name</th>
                                <th className="p-4 text-center text-sm text-black">Plant</th>
                                <th className="p-4 text-center text-sm text-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-center font-poppins capitalize">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, rowIndex) => (
                                    <tr key={item.id ?? rowIndex} className="hover:bg-gray-50 text-center">
                                        <td className="p-4 text-sm opacity-65">{rowIndex + startIndex + 1}</td>
                                        <td className="p-4 text-sm opacity-65">{item.line_id ?? "-"}</td>
                                        <td className="p-4 text-sm opacity-65">{item.name ?? "-"}</td>
                                        <td className="p-4 text-sm opacity-65">{getPlantDisplay(item.plant)}</td>
                                        <td className="p-4 text-sm">
                                            <div className="flex justify-center gap-4">
                                                <button
                                                    onClick={() => openEditModal(item)}
                                                    className="hover:text-orange-500"
                                                    title="Edit"
                                                >
                                                    <FiEdit2 size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="hover:text-red-500"
                                                    title="Delete"
                                                >
                                                    <RiDeleteBin6Line size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="py-10 text-center text-gray-500 text-sm"
                                    >
                                        No Data Available
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    <div className="flex justify-end font-dm items-center gap-2 mt-4">
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 border rounded ${currentPage === 1 ? "text-gray-400 bg-gray-200" : "text-white bg-[#F3890A]"}`}
                        >
                            &lt;
                        </button>
                        <button
                            onClick={goToFirstPage}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 text-sm border rounded ${currentPage === 1 ? "text-gray-400" : "text-black"}`}
                        >
                            {currentPage === 1 ? "0" : "1"}
                        </button>
                        <span className="px-3 py-1 border font-medium rounded bg-gray-200">{currentPage}</span>
                        <button
                            onClick={goToLastPage}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 border text-sm rounded ${currentPage === totalPages ? "text-gray-400" : "text-black"}`}
                        >
                            {totalPages}
                        </button>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 border rounded ${currentPage === totalPages ? "text-gray-400 bg-gray-200" : "text-white bg-[#F3890A]"}`}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LineFarmMaster;
