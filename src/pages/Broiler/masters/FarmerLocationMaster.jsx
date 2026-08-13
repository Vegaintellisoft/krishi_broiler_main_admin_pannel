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

const DEFAULT_FIELDS = ["plant", "farmer_no", "farmer_name", "lat", "long"];

const EXCLUDED_COLUMNS = ["id", "created_at", "updated_at"];

// Column names treated as the plant / farmer column on broiler.farmer_location
const PLANT_FIELDS = new Set(["plant"]);
const FARMER_FIELDS = new Set(["farmer_no"]);
// Auto-derived from a dropdown pick (kept in formData & sent to backend, but not rendered as inputs).
const HIDDEN_AUTOFILLED = new Set(["plant_name", "farmer_name", "farmer_supplier"]);

const formatHeader = (text) =>
    text
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");

const FarmerLocationMaster = () => {
    const [data, setData] = useState([]);
    const [columnData, setColumnData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [formData, setFormData] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [plants, setPlants] = useState([]);
    const [farmers, setFarmers] = useState([]);
    const [isLoadingPlants, setIsLoadingPlants] = useState(false);
    const [isLoadingFarmers, setIsLoadingFarmers] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
        fetchPlants();
    }, []);


    // Reload farmers whenever the selected plant changes while the modal is open.
    useEffect(() => {
        if (!modalOpen) return;
        if (formData.plant) {
            fetchFarmers(formData.plant);
        } else {
            setFarmers([]);
        }
    }, [modalOpen, formData.plant]);

    const fetchPlants = async () => {
        try {
            setIsLoadingPlants(true);
            const res = await axios.get("broiler/plant/getAll");
            if (res.data?.success) {
                setPlants(res.data.data || []);
                // console.log("PLAnt data: ", res.data.data)
            }

            else setPlants([]);
        } catch (err) {
            console.error("Failed to load plants:", err);
            setPlants([]);
        } finally {
            setIsLoadingPlants(false);
        }
    };

    const fetchFarmers = async (plantId) => {
        try {
            setIsLoadingFarmers(true);
            const res = await axios.get("broiler/farmer/get-by-farmer", {
                params: { plant: plantId },
            });
            if (res.data?.success) {
                setFarmers(res.data.data || []);
                // console.log("Farmers Data: ", res.data.data)
            }

            else setFarmers([]);
        } catch (err) {
            console.error("Failed to load farmers:", err);
            setFarmers([]);
        } finally {
            setIsLoadingFarmers(false);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get("broiler/farmer/farmer-location/getAll");
            const rows = res.data?.data || [];
            setData(rows);

            if (rows.length > 0) {
                const cols = Object.keys(rows[0]).filter((c) => !EXCLUDED_COLUMNS.includes(c));
                setColumnData(cols);
            } else {
                setColumnData(DEFAULT_FIELDS);
            }
        } catch (err) {
            console.error("Error fetching farmer locations:", err);
            setColumnData(DEFAULT_FIELDS);
        } finally {
            setIsLoading(false);
        }
    };

    const openCreateModal = () => {
        const fields = columnData.length ? columnData : DEFAULT_FIELDS;
        const blank = fields.reduce((acc, c) => ({ ...acc, [c]: "" }), {});
        setEditItem(null);
        setFormData(blank);
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        const fields = columnData.length ? columnData : DEFAULT_FIELDS;
        const filled = fields.reduce((acc, c) => ({ ...acc, [c]: item[c] ?? "" }), {});
        setEditItem(item);
        setFormData(filled);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditItem(null);
        setFormData({});
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handlePlantChange = (newPlantId) => {
        const plant = plants.find((p) => String(p.plant_id) === String(newPlantId));
        setFormData((prev) => ({
            ...prev,
            plant: newPlantId,
            // Only touch fields that the table actually has (i.e., are already keys on the form)
            ...("plant_name" in prev ? { plant_name: plant?.plant_name ?? "" } : {}),
            // Reset farmer selection — previous farmer may belong to a different plant
            farmer_no: "",
            ...("farmer_name" in prev ? { farmer_name: "" } : {}),
            ...("farmer_supplier" in prev ? { farmer_supplier: "" } : {}),
        }));
    };

    const handleFarmerChange = (newFarmerNo) => {
        // The option value is the farmer's `farmer_supplier` (e.g. "FSZ00869"),
        // which is what our farmer_location.farmer_no column stores.
        const farmer = farmers.find((f) => String(f.farmer_supplier) === String(newFarmerNo));
        setFormData((prev) => ({
            ...prev,
            farmer_no: newFarmerNo,
            ...("farmer_name" in prev ? { farmer_name: farmer?.farmer_name ?? "" } : {}),
            ...("farmer_supplier" in prev ? { farmer_supplier: farmer?.farmer_supplier ?? "" } : {}),
        }));
    };

    // Options for the CustomDropdown components
    const plantOptions = plants.map((p) => ({
        label: `${p.plant_id} | ${p.plant_name}`,
        value: p.plant_id,
    }));

    const farmerOptions = [
        // If editing and the saved farmer isn't (yet) in the fresh list, keep a stub so the label still renders
        ...(formData.farmer_no &&
            !farmers.some((f) => String(f.farmer_supplier) === String(formData.farmer_no))
            ? [{
                label: `${formData.farmer_name || formData.farmer_no} (${formData.farmer_no})`,
                value: formData.farmer_no,
            }]
            : []),
        ...farmers.map((f) => ({
            label: `${f.farmer_name} (${f.farmer_supplier})`,
            value: f.farmer_supplier,
        })),
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);

            if (!formData.plant) {
                Swal.fire({ icon: "warning", title: "Plant required", text: "Please select a plant." });
                return;
            }
            if (!formData.farmer_no) {
                Swal.fire({ icon: "warning", title: "Farmer required", text: "Please select a farmer." });
                return;
            }

            // Drop empty strings — let DB defaults / nulls apply
            const cleaned = Object.fromEntries(
                Object.entries(formData).filter(([, v]) => v !== "" && v !== null && v !== undefined)
            );

            if (Object.keys(cleaned).length === 0) {
                Swal.fire({ icon: "warning", title: "Nothing to save", text: "Please fill at least one field." });
                return;
            }

            let res;
            if (editItem?.id) {
                res = await axios.put(`broiler/farmer/farmer-location/update/${editItem.id}`, cleaned);
            } else {
                res = await axios.post("broiler/farmer/farmer-location/create", cleaned);
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
            text: `This will permanently delete the farmer location for ${item.farmer_no || "this record"}.`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await axios.delete(`broiler/farmer/farmer-location/delete/${item.id}`);
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

    const handleExport = () => ExcelExport(data, "farmer_location.xlsx");

    const tableColumns = columnData.length ? columnData : DEFAULT_FIELDS;

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

    return (
        <div className="rounded-lg shadow flex-1">
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl mx-4 overflow-hidden font-poppins flex flex-col max-h-[90vh]">
                        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">
                                {editItem ? "Edit Farmer Location" : "Add Farmer Location"}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-red-500 transition">
                                <IoCloseSharp size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                {Object.keys(formData)
                                    .filter((field) => !HIDDEN_AUTOFILLED.has(field))
                                    .map((field) => {
                                        const isPlant = PLANT_FIELDS.has(field);
                                        const isFarmer = FARMER_FIELDS.has(field);

                                        if (isPlant) {
                                            return (
                                                <div key={field}>
                                                    <CustomDropdown
                                                        label="Plant *"
                                                        name={field}
                                                        value={formData.plant ?? ""}
                                                        onChange={handlePlantChange}
                                                        options={plantOptions}
                                                        isDisabled={isLoadingPlants}
                                                    />
                                                </div>
                                            );
                                        }

                                        if (isFarmer) {
                                            const farmerLabel = !formData.plant
                                                ? "Farmer * (pick a plant first)"
                                                : isLoadingFarmers
                                                    ? "Farmer * (loading...)"
                                                    : "Farmer *";
                                            return (
                                                <div key={field}>
                                                    <CustomDropdown
                                                        label={farmerLabel}
                                                        name={field}
                                                        value={formData.farmer_no ?? ""}
                                                        onChange={handleFarmerChange}
                                                        options={farmerOptions}
                                                        isDisabled={!formData.plant || isLoadingFarmers}
                                                    />
                                                </div>
                                            );
                                        }

                                        return (
                                            <div key={field} className={field === "address" ? "col-span-2" : ""}>
                                                <label className="block text-xs font-bold text-gray-700 mb-1">
                                                    {formatHeader(field)}
                                                </label>
                                                <input
                                                    type="text"
                                                    name={field}
                                                    value={formData[field] ?? ""}
                                                    onChange={handleInputChange}
                                                    className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                                                    placeholder={`Enter ${formatHeader(field)}`}
                                                />
                                            </div>
                                        );
                                    })}
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
                    <h1 className="text-xl font-bold text-gray-900">Farmer Location</h1>
                    <div className="flex items-center gap-x-2 text-sm text-gray-500">
                        <Link to="/" className="text-orange-500">Masters</Link>
                        <RiArrowUpSFill className="rotate-90" size={20} />
                        <span>Farmer Location</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="relative">
                            <RiSearchLine className="absolute left-2 top-2.5 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search Farmer Location..."
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
                                {tableColumns.map((col, i) => (
                                    <th key={i} className="p-4 text-center text-sm text-black">
                                        {formatHeader(col)}
                                    </th>
                                ))}
                                <th className="p-4 text-center text-sm text-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-center font-poppins capitalize">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, rowIndex) => (
                                    <tr key={item.id ?? rowIndex} className="hover:bg-gray-50 text-center">
                                        <td className="p-4 text-sm opacity-65">{rowIndex + startIndex + 1}</td>
                                        {tableColumns.map((col, colIndex) => (
                                            <td key={colIndex} className="p-4 text-sm opacity-65">
                                                {item[col] ?? "-"}
                                            </td>
                                        ))}
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
                                        colSpan={tableColumns.length + 2}
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

export default FarmerLocationMaster;
