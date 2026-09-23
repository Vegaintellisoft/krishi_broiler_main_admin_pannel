import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RiArrowUpSFill, RiSearchLine, RiDeleteBin6Line } from "react-icons/ri";
import { LuImport, LuPlus } from "react-icons/lu";
import { FiEdit2, FiChevronDown } from "react-icons/fi";
import { FaSpinner, FaTimes } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { MdSync } from "react-icons/md";
import Swal from "sweetalert2";
import axios from "axios";
import ExcelExport from "../../../utils/ExcelExport";
import { CustomDropdown } from "../../../components/CustomDropdown";

// â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const parseIds = (ids) => {
    if (!ids) return [];
    if (Array.isArray(ids)) return ids;
    if (typeof ids === "string") {
        try {
            const parsed = JSON.parse(ids);
            if (Array.isArray(parsed)) return parsed;
        } catch (e) {
            return ids.split(",").map((s) => s.trim()).filter(Boolean);
        }
    }
    return [];
};

const isUserInPlant = (userPlantId, targetPlant) => {
    if (!targetPlant) return true;
    if (!userPlantId) return true;
    const pStr = String(userPlantId).trim().toLowerCase();
    if (pStr === "all") return true;
    const userPlants = pStr.split(",").map((p) => p.trim().toLowerCase());
    return userPlants.includes(String(targetPlant).trim().toLowerCase());
};

// â”€â”€â”€ Multi-Select with search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const MultiSelectDropdown = ({ label, options, selected, onChange, isDisabled }) => {
    const [search, setSearch] = useState("");
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const filtered = options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
    );

    const isSelected = (val) => {
        return (selected || []).some((s) => String(s) === String(val));
    };

    const toggle = (value) => {
        const exists = isSelected(value);
        const newSelected = exists
            ? (selected || []).filter((v) => String(v) !== String(value))
            : [...(selected || []), value];
        onChange(newSelected);
    };

    const selectedItems = options.filter((o) => isSelected(o.value));

    return (
        <div className="relative w-full" ref={ref}>
            <label className="block text-xs font-bold text-gray-700 mb-1">{label}</label>
            <div
                onClick={() => { if (!isDisabled) setOpen((p) => !p); }}
                className={`min-h-[40px] p-2 bg-gray-100 rounded-md flex items-center justify-between cursor-pointer border ${isDisabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
                <div className="flex flex-wrap gap-1 flex-1">
                    {selectedItems.length === 0 ? (
                        <span className="text-gray-400 text-sm">Select {label}...</span>
                    ) : (
                        selectedItems.map((item, i) => (
                            <span key={i} className="bg-orange-100 text-orange-700 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                                {item.label}
                                <FaTimes
                                    className="cursor-pointer"
                                    size={10}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggle(item.value);
                                    }}
                                />
                            </span>
                        ))
                    )}
                </div>
                {!isDisabled && <FiChevronDown className="ml-2 text-gray-500 shrink-0" />}
            </div>

            {open && (
                <div className="absolute z-[9999] bg-white shadow-lg rounded-md mt-1 w-full max-h-56 overflow-y-auto border">
                    <input
                        type="text"
                        placeholder={`Search ${label}...`}
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full px-3 py-2 border-b outline-none text-sm"
                        autoFocus
                    />
                    {filtered.length === 0 ? (
                        <div className="px-3 py-2 text-gray-400 text-sm">No matches found</div>
                    ) : (
                        filtered.map((opt) => (
                            <div
                                key={opt.value}
                                onClick={() => toggle(opt.value)}
                                className={`flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-gray-50 text-sm ${isSelected(opt.value) ? "bg-orange-50" : ""}`}
                            >
                                <input
                                    type="checkbox"
                                    readOnly
                                    checked={isSelected(opt.value)}
                                    className="accent-orange-500"
                                />
                                <span>{opt.label}</span>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

// â”€â”€â”€ Main Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const FarmerLineMaster = () => {
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

    const [modalOpen, setModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [syncingLineId, setSyncingLineId] = useState(null);
    const [isSyncingAll, setIsSyncingAll] = useState(false);

    const [formData, setFormData] = useState({
        line_farm_id: "",
        line_id: "",
        name: "",
        plant: "",
        farmer_ids: [],
        user_ids: [],
    });

    const [lineFarms, setLineFarms] = useState([]);
    const [isLoadingLineFarms, setIsLoadingLineFarms] = useState(false);

    const [farmers, setFarmers] = useState([]);
    const [isLoadingFarmers, setIsLoadingFarmers] = useState(false);

    const [users, setUsers] = useState([]);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    const [plants, setPlants] = useState([]);
    const [allFarmers, setAllFarmers] = useState([]);

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        fetchData();
        fetchLineFarms();
        fetchUsers();
        fetchPlants();
        fetchAllFarmers();
    }, []);

    useEffect(() => {
        if (!modalOpen) return;
        if (formData.plant) {
            fetchFarmersByPlant(formData.plant);
        } else {
            setFarmers([]);
        }
    }, [modalOpen, formData.plant]);

    const fetchLineFarms = async () => {
        try {
            setIsLoadingLineFarms(true);
            const res = await axios.get("broiler/line-farm/getAll");
            setLineFarms(res.data?.data || []);
        } catch (err) {
            console.error("Failed to load line farms:", err);
            setLineFarms([]);
        } finally {
            setIsLoadingLineFarms(false);
        }
    };

    const fetchFarmersByPlant = async (plantId) => {
        try {
            setIsLoadingFarmers(true);
            const res = await axios.get("broiler/farmer/get-by-farmer", {
                params: { plant: plantId },
            });
            setFarmers(res.data?.data || []);
        } catch (err) {
            console.error("Failed to load farmers:", err);
            setFarmers([]);
        } finally {
            setIsLoadingFarmers(false);
        }
    };

    const fetchUsers = async () => {
        try {
            setIsLoadingUsers(true);
            const res = await axios.get("/driver/getAll", { params: { category: "Broiler" } });
            setUsers(res.data?.data || []);
        } catch (err) {
            console.error("Failed to load users:", err);
            setUsers([]);
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const fetchPlants = async () => {
        try {
            const res = await axios.get("broiler/plant/getAll");
            setPlants(res.data?.data || []);
        } catch (err) {
            console.error("Failed to load plants:", err);
            setPlants([]);
        }
    };

    const fetchAllFarmers = async () => {
        try {
            const res = await axios.get("broiler/farmer/getAll");
            setAllFarmers(res.data?.data || []);
        } catch (err) {
            console.error("Failed to load all farmers:", err);
            setAllFarmers([]);
        }
    };

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get("broiler/farmer-line/getAll");
            setData(res.data?.data || []);
        } catch (err) {
            console.error("Error fetching farmer line master:", err);
        } finally {
            setIsLoading(false);
        }
    };

    const lineFarmOptions = lineFarms.map((lf) => {
        const plant = plants.find((p) => String(p.plant_id) === String(lf.plant));
        const plantStr = plant ? ` (${plant.plant_id} | ${plant.plant_name})` : ` (${lf.plant})`;
        return {
            label: `${lf.line_id} | ${lf.name}${plantStr}`,
            value: lf.id,
            _line_id: lf.line_id,
            _name: lf.name,
            _plant: lf.plant,
        };
    });

    const farmerOptions = farmers.map((f) => ({
        label: `${f.farmer_name} (${f.farmer_supplier})`,
        value: f.farmer_supplier,
    }));

    const userOptions = users
        .filter((u) => isUserInPlant(u.plant_id, formData.plant))
        .map((u) => ({
            label: u.username || u.fullname || u.emp_id || String(u.id),
            value: u.id,
        }));

    const openCreateModal = () => {
        setEditItem(null);
        setFormData({ line_farm_id: "", line_id: "", name: "", plant: "", farmer_ids: [], user_ids: [] });
        setModalOpen(true);
    };

    const openEditModal = (item) => {
        setEditItem(item);
        setFormData({
            line_farm_id: item.line_farm_id ?? "",
            line_id: item.line_id ?? "",
            name: item.name ?? "",
            plant: item.plant ?? "",
            farmer_ids: parseIds(item.farmer_ids),
            user_ids: parseIds(item.user_ids),
        });
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
        setEditItem(null);
        setFormData({ line_farm_id: "", line_id: "", name: "", plant: "", farmer_ids: [], user_ids: [] });
    };

    const handleLineFarmChange = async (selectedId) => {
        const lf = lineFarms.find((l) => String(l.id) === String(selectedId));

        const allowedUserIds = users
            .filter((u) => isUserInPlant(u.plant_id, lf?.plant))
            .map((u) => u.id);

        let plantFarmers = [];
        if (lf?.plant) {
            try {
                setIsLoadingFarmers(true);
                const res = await axios.get("broiler/farmer/get-by-farmer", {
                    params: { plant: lf.plant },
                });
                plantFarmers = res.data?.data || [];
                setFarmers(plantFarmers);
            } catch (err) {
                console.error("Failed to load farmers:", err);
            } finally {
                setIsLoadingFarmers(false);
            }
        }

        // Auto-select all farmers from this plant by default!
        const autoFarmerIds = plantFarmers.map((f) => f.farmer_supplier).filter(Boolean);

        setFormData((prev) => ({
            ...prev,
            line_farm_id: selectedId,
            line_id: lf?.line_id ?? "",
            name: lf?.name ?? "",
            plant: lf?.plant ?? "",
            farmer_ids: autoFarmerIds,
            user_ids: (prev.user_ids || []).filter((uid) =>
                allowedUserIds.some((allowedId) => String(allowedId) === String(uid))
            ),
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsSubmitting(true);

            if (!formData.line_farm_id) {
                Swal.fire({ icon: "warning", title: "Line required", text: "Please select a Line." });
                return;
            }
            if (formData.farmer_ids.length === 0) {
                Swal.fire({ icon: "warning", title: "Farmer required", text: "Please select at least one Farmer." });
                return;
            }
            if (formData.user_ids.length === 0) {
                Swal.fire({ icon: "warning", title: "User required", text: "Please select at least one User." });
                return;
            }

            const payload = {
                line_farm_id: formData.line_farm_id,
                line_id: formData.line_id,
                name: formData.name,
                plant: formData.plant,
                farmer_ids: formData.farmer_ids,
                user_ids: formData.user_ids,
            };

            let res;
            if (editItem?.id) {
                res = await axios.put(`broiler/farmer-line/update/${editItem.id}`, payload);
            } else {
                res = await axios.post("broiler/farmer-line/create", payload);
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
                Swal.fire({ icon: "error", title: "Save failed", text: res.data?.message || "Could not save record." });
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
            text: `This will permanently delete the Farmer Line record for "${item.line_id || "this record"}".`,
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!",
        });
        if (!confirm.isConfirmed) return;
        try {
            const res = await axios.delete(`broiler/farmer-line/delete/${item.id}`);
            if (res.data?.success) {
                Swal.fire({ icon: "success", title: "Deleted!", timer: 1500, showConfirmButton: false });
                fetchData();
            } else {
                Swal.fire({ icon: "error", title: "Delete failed", text: res.data?.message });
            }
        } catch (err) {
            Swal.fire({ icon: "error", title: "Delete failed", text: err?.response?.data?.message || err.message });
        }
    };


    const handleSyncPlantFarmers = async (item) => {
        const confirmResult = await Swal.fire({
            title: "Sync Plant Farmers?",
            html: `This will automatically add all <b>unassigned farmers</b> from plant <b>${getPlantDisplay(item.line_farm_id)}</b> to line <b>${item.line_id || item.name}</b>.<br/><br/>Farmers already assigned to other lines will not be moved.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#f97316",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Sync Now!",
        });
        if (!confirmResult.isConfirmed) return;

        try {
            setSyncingLineId(item.id);
            const res = await axios.post("broiler/farmer-line/sync-plant-farmers", {
                line_farm_id: item.line_farm_id,
            });
            if (res.data?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Sync Complete!",
                    text: res.data.message || "Farmers synced successfully.",
                    timer: 2000,
                    showConfirmButton: false,
                });
                await fetchData();
            } else {
                Swal.fire({ icon: "error", title: "Sync failed", text: res.data?.message || "Could not sync." });
            }
        } catch (err) {
            console.error("Sync error:", err);
            Swal.fire({
                icon: "error",
                title: "Sync failed",
                text: err?.response?.data?.message || err.message || "Request failed.",
            });
        } finally {
            setSyncingLineId(null);
        }
    };

    const handleSyncAllLines = async () => {
        const confirmResult = await Swal.fire({
            title: "Sync All Lines?",
            html: "This will automatically populate all plant farmers into their respective lines across all plants.",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#f97316",
            cancelButtonColor: "#6b7280",
            confirmButtonText: "Yes, Sync All Lines!",
        });
        if (!confirmResult.isConfirmed) return;

        try {
            setIsSyncingAll(true);
            const res = await axios.post("broiler/farmer-line/sync-all-lines");
            if (res.data?.success) {
                Swal.fire({
                    icon: "success",
                    title: "Sync Complete!",
                    text: res.data.message || "All lines synced successfully.",
                    timer: 2500,
                    showConfirmButton: false,
                });
                await fetchData();
            } else {
                Swal.fire({ icon: "error", title: "Sync failed", text: res.data?.message || "Could not sync." });
            }
        } catch (err) {
            console.error("Sync error:", err);
            Swal.fire({
                icon: "error",
                title: "Sync failed",
                text: err?.response?.data?.message || err.message || "Request failed.",
            });
        } finally {
            setIsSyncingAll(false);
        }
    };

    const handleExport = () => ExcelExport(data, "farmer_line_master.xlsx");

    const getPlantDisplay = (plantId) => {
        const plant = plants.find((p) => String(p.plant_id) === String(plantId));
        return plant ? `${plant.plant_id} | ${plant.plant_name}` : plantId || "-";
    };

    const renderFarmerIds = (ids) => {
        const list = parseIds(ids);
        if (list.length === 0) return "-";
        const names = list.map((id) => {
            const f = allFarmers.find((o) => String(o.farmer_supplier) === String(id));
            return f ? `${f.farmer_name} (${f.farmer_supplier})` : id;
        });
        return (
            <div className="flex flex-col items-start gap-1" title={names.join(", ")}>
                <span className="font-semibold text-orange-700 bg-orange-100 px-2.5 py-0.5 rounded-full text-xs inline-flex items-center gap-1">
                    {list.length} Farmers
                </span>
                <span className="text-xs text-gray-500 line-clamp-1 max-w-[240px]">
                    {names.slice(0, 2).join(", ")}{list.length > 2 ? ` +${list.length - 2} more` : ""}
                </span>
            </div>
        );
    };

    const renderUserIds = (ids) => {
        const list = parseIds(ids);
        if (list.length === 0) return "-";
        return list
            .map((id) => {
                const u = users.find((o) => String(o.id) === String(id));
                return u ? (u.username || u.fullname || id) : id;
            })
            .join(", ");
    };

    // â”€â”€ Pagination & Search â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const filteredData = data.filter((item) => {
        const queryLower = searchQuery.toLowerCase();

        if (item.line_id?.toString().toLowerCase().includes(queryLower)) return true;
        if (item.name?.toString().toLowerCase().includes(queryLower)) return true;

        const plantDisp = getPlantDisplay(item.plant);
        if (plantDisp.toLowerCase().includes(queryLower)) return true;

        const farmersDisp = renderFarmerIds(item.farmer_ids);
        if (farmersDisp.toLowerCase().includes(queryLower)) return true;

        const usersDisp = renderUserIds(item.user_ids);
        if (usersDisp.toLowerCase().includes(queryLower)) return true;

        return false;
    });

    const totalPages = Math.max(1, Math.ceil(filteredData.length / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    useEffect(() => { setCurrentPage(1); }, [searchQuery]);

    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToNextPage = () => setCurrentPage((p) => Math.min(p + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((p) => Math.max(p - 1, 1));

    return (
        <div className="rounded-lg shadow flex-1">
            {/* â”€â”€ Modal â”€â”€ */}
            {modalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden font-poppins flex flex-col max-h-[92vh]">
                        <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                            <h2 className="text-lg font-bold text-gray-800">
                                {editItem ? "Edit Farmer Line" : "Add Farmer Line"}
                            </h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-red-500 transition">
                                <IoCloseSharp size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
                            {/* Line Farm Dropdown */}
                            <CustomDropdown
                                label="Line *"
                                name="line_farm_id"
                                value={formData.line_farm_id ?? ""}
                                onChange={handleLineFarmChange}
                                options={lineFarmOptions}
                                isDisabled={isLoadingLineFarms}
                            />

                            {/* Auto-filled read-only fields */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Line Id</label>
                                    <input
                                        type="text"
                                        value={formData.line_id}
                                        readOnly
                                        className="w-full p-2.5 bg-gray-100 border rounded text-sm text-gray-600 cursor-not-allowed"
                                        placeholder="Auto-filled from line selection"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={formData.name}
                                        readOnly
                                        className="w-full p-2.5 bg-gray-100 border rounded text-sm text-gray-600 cursor-not-allowed"
                                        placeholder="Auto-filled from line selection"
                                    />
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Plant</label>
                                    <input
                                        type="text"
                                        value={formData.plant}
                                        readOnly
                                        className="w-full p-2.5 bg-gray-100 border rounded text-sm text-gray-600 cursor-not-allowed"
                                        placeholder="Auto-filled from line selection"
                                    />
                                </div>
                            </div>

                            {/* Farmer Multi-Select */}
                            <MultiSelectDropdown
                                label={
                                    !formData.plant
                                        ? "Farmer * (select a line first)"
                                        : isLoadingFarmers
                                            ? "Farmer * (loading...)"
                                            : "Farmer *"
                                }
                                options={farmerOptions}
                                selected={formData.farmer_ids}
                                onChange={(vals) => setFormData((p) => ({ ...p, farmer_ids: vals }))}
                                isDisabled={!formData.plant || isLoadingFarmers}
                            />

                            {/* User Multi-Select */}
                            <MultiSelectDropdown
                                label={isLoadingUsers ? "User * (loading...)" : "User *"}
                                options={userOptions}
                                selected={formData.user_ids}
                                onChange={(vals) => setFormData((p) => ({ ...p, user_ids: vals }))}
                                isDisabled={isLoadingUsers}
                            />

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

            {/* â”€â”€ Page â”€â”€ */}
            <div className="bg-[#F9F9FC] h-screen relative">
                <div className="space-y-4 pt-3 px-6 font-poppins">
                    <h1 className="text-xl font-bold text-gray-900">Farmer Line Master</h1>
                    <div className="flex items-center gap-x-2 text-sm text-gray-500">
                        <Link to="/" className="text-orange-500">Masters</Link>
                        <RiArrowUpSFill className="rotate-90" size={20} />
                        <span>Farmer Line Master</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="relative">
                            <RiSearchLine className="absolute left-2 top-2.5 text-gray-400" />
                            <input
                                type="search"
                                placeholder="Search Farmer Line..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="py-2 px-8 border rounded-lg text-xs focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={handleSyncAllLines}
                                disabled={isSyncingAll}
                                className="px-4 py-2 bg-emerald-50 text-emerald-700 border border-emerald-300 rounded-lg hover:bg-emerald-600 hover:text-white text-xs flex items-center gap-2 transition disabled:opacity-50"
                                title="Auto-sync all farmers from each plant into their respective line"
                            >
                                {isSyncingAll ? <FaSpinner className="animate-spin" size={16} /> : <MdSync size={16} />}
                                Sync All Lines
                            </button>
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
                                <th className="p-4 text-center text-sm text-black">Farmers</th>
                                <th className="p-4 text-center text-sm text-black">Users</th>
                                <th className="p-4 text-center text-sm text-black">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y text-center font-poppins">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, rowIndex) => (
                                    <tr key={item.id ?? rowIndex} className="hover:bg-gray-50">
                                        <td className="p-4 text-sm opacity-65">{rowIndex + startIndex + 1}</td>
                                        <td className="p-4 text-sm opacity-65">{item.line_id ?? "-"}</td>
                                        <td className="p-4 text-sm opacity-65">{item.name ?? "-"}</td>
                                        <td className="p-4 text-sm opacity-65">{getPlantDisplay(item.plant)}</td>
                                        <td className="p-4 text-sm opacity-65 max-w-[200px] text-left">
                                            {renderFarmerIds(item.farmer_ids)}
                                        </td>
                                        <td className="p-4 text-sm opacity-65 max-w-[200px] text-left">
                                            {renderUserIds(item.user_ids)}
                                        </td>
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
                                                    onClick={() => handleSyncPlantFarmers(item)}
                                                    className="hover:text-green-600 text-gray-500 disabled:opacity-40"
                                                    title="Auto-sync all unassigned plant farmers into this line"
                                                    disabled={syncingLineId === item.id}
                                                >
                                                    {syncingLineId === item.id
                                                        ? <FaSpinner size={16} className="animate-spin" />
                                                        : <MdSync size={18} />
                                                    }
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
                                    <td colSpan={7} className="py-10 text-center text-gray-500 text-sm">
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
                        >&lt;</button>
                        <button
                            onClick={goToFirstPage}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 text-sm border rounded ${currentPage === 1 ? "text-gray-400" : "text-black"}`}
                        >{currentPage === 1 ? "0" : "1"}</button>
                        <span className="px-3 py-1 border font-medium rounded bg-gray-200">{currentPage}</span>
                        <button
                            onClick={goToLastPage}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 border text-sm rounded ${currentPage === totalPages ? "text-gray-400" : "text-black"}`}
                        >{totalPages}</button>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 border rounded ${currentPage === totalPages ? "text-gray-400 bg-gray-200" : "text-white bg-[#F3890A]"}`}
                        >&gt;</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FarmerLineMaster;
