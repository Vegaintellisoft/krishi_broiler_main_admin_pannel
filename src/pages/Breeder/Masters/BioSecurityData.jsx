import React, { useState, useEffect, useCallback, useMemo } from "react";
import { MdOutlineKeyboardArrowDown, MdAddAPhoto, MdClose } from "react-icons/md";
import { FiArrowLeft } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
// import dailyTasksAPI from "../../../utils/dailyTasksAPI.js"; // if needed
// import { useNotifications } from "../../../context/NotificationContext"; // if needed

const BioSecurityData = () => {
    const navigate = useNavigate();
    // const { addNotifications } = useNotifications();
    const [expandedItems, setExpandedItems] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [validationErrors, setValidationErrors] = useState([]);
    const [taskData, setTaskData] = useState({});
    const [expandedCategory, setExpandedCategory] = useState("biosecurity_disinfection");
    const [categoryData, setCategoryData] = useState({});

    const categories = useMemo(() => [
        { id: "biosecurity_disinfection", title: "Biosecurity & Disinfection" },
        { id: "water_quality", title: "Water Quality" },
        { id: "feed_inventory", title: "Feed Inventory" },
        { id: "fly_feather_control", title: "Fly & Feather Control:" },
        { id: "flock_inventory", title: "Flock Inventory:" },
        { id: "semen_collection", title: "Semen Collection" },
        { id: "insemanation", title: "Insemanation" },
    ], []);

    useEffect(() => {
        const initialCategoryData = {};
        categories.forEach(cat => {
            initialCategoryData[cat.id] = {
                frequency: "daily",
                date: new Date().toISOString().split('T')[0]
            };
        });
        setCategoryData(initialCategoryData);
    }, [categories]);

    const toggleCategory = useCallback((id) => {
        setExpandedCategory((prev) => (prev === id ? null : id));
    }, []);

    const handleDateChange = (categoryId, date) => {
        setCategoryData(prev => ({
            ...prev,
            [categoryId]: { ...prev[categoryId], date }
        }));
    };

    const handleFrequencyChange = (categoryId, frequency) => {
        setCategoryData(prev => ({
            ...prev,
            [categoryId]: { ...prev[categoryId], frequency }
        }));
    };

    const toggleItem = useCallback((id) => {
        setExpandedItems((prevExpanded) => {
            if (prevExpanded.includes(id)) {
                return [];
            } else {
                return [id];
            }
        });
    }, []);

    const tasks = useMemo(() => [
        { id: 1, title: "Water Quality Checking (PH / TDS)", hasSpecialFields: true },
        { id: 2, title: "Water Sanitation - 1st / 2nd / 3rd Time" },
        { id: 3, title: "Sub Tank Cleaning" },
        { id: 4, title: "Nipple Pressure Checking" },
        { id: 5, title: "Nipple Leakage Checking" },
        { id: 6, title: "Fogger Tank Sanitation" },
        { id: 7, title: "Fogger Nozzle Leakage Checking" },
        { id: 8, title: "Waste Egg Collection (Litter)" },
        { id: 9, title: "Feeder Cleaning - Wet Cloth Only" },
        { id: 10, title: "Mat Cleaning - Dry & Wet Cleaning" },
        { id: 11, title: "Egg Rope Tension Checking" },
    ], []);

    const disinfectionTasks = useMemo(() => [
        { id: 101, title: "Refill Hand Wash Solution - At Gate/Office/Shed" },
        { id: 102, title: "Foot Dip Water Changed - At Gate/Office/Shed" },
        { id: 103, title: "Vehicle Spray Running Condition" },
        { id: 104, title: "Cold Store Mopping (4 Times/Day)" },
    ], []);

    const feedInventoryTasks = useMemo(() => [
        { id: 201, title: "Line-Wise Feed Allocation" },
        { id: 202, title: "Arrange Line-Wise Feed Box With Marking" },
        { id: 203, title: "10 Bags Sample Weighing For 50kg" },
        { id: 204, title: "Line-Wise Feed Weighing" },
        { id: 205, title: "Feed Shortage /Excess" },
    ], []);

    const flyFeatherControlTasks = useMemo(() => [
        { id: 301, title: "Feather Control" },
        { id: 302, title: "Fly Larvae Control - Spray" },
        { id: 303, title: "Wet Litter Removal/Racking" },
        { id: 304, title: "Litter Treatment - Lime Powder" },
        { id: 305, title: "Adult Fly Control - Spray" },
        { id: 306, title: "Adult Fly Control - Tape/Bait" },
        { id: 307, title: "Platform Cleaning" },
    ], []);

    const flockInventoryTasks = useMemo(() => [
        { id: 401, title: "Mortality Removal (3 Times)" },
        { id: 402, title: "Weak Birds Removal - Female & Male", counts: true },
        { id: 403, title: "Non Layer Removal", counts: true },
        { id: 404, title: "Weak Birds Stock", counts: true },
        { id: 405, title: "Line Stock Adjustment" },
        { id: 406, title: "Cut Line Stock For Feed Allocation" },
        { id: 407, title: "Birds Stock" },
        { id: 408, title: "Used PP Bags - Fold And Stack It In Store Room" },
        { id: 409, title: "Genset Fuel Stock: Min. 200 Lit", toggle: true },
        { id: 410, title: "Dirty Plastic Egg Tray Cleaning", toggle: true },
        { id: 411, title: "Feed, Medicine, HE & TE- Stock", toggle: true },
        { id: 412, title: "Scrap & Agri Products Sales", toggle: true },
    ], []);

    const semenCollectionTasks = useMemo(() => [
        { id: 501, title: "Flock" },
        { id: 502, title: "Shed No" },
        { id: 503, title: "Part / Row No." },
        { id: 504, title: "No. Of Birds Milked" },
        { id: 505, title: "No Of Cups ( Two Birds/ Cup)" },
        { id: 506, title: "No. Of Tips (1 Bird / 1 Tip)" },
        { id: 507, title: "Males With Watery Semen - Removal" },
        { id: 508, title: "Good Males - No's & %" },
        { id: 509, title: "No. Of Good Males Milked - No's & %" },
        { id: 510, title: "Weak Males - No's & %" },
        { id: 511, title: "Watery Semen Males - No's & %" },
        { id: 512, title: "Semen Milked By" },
        { id: 513, title: "Supervised By" },
    ], []);

    const inseminationTasks = useMemo(() => [
        { id: 601, title: "Flock" },
        { id: 602, title: "Shed No" },
        { id: 603, title: "Part / Row No." },
        { id: 604, title: "No Of Females Inseminated" },
        { id: 605, title: "No Of Females With Repeated AI" },
        { id: 606, title: "Inseminated By (Person 1, 2, 3, 4)" },
        { id: 607, title: "AI Supervised By" },
    ], []);

    useEffect(() => {
        const resetData = {};
        tasks.forEach((task) => {
            resetData[task.id] = { enabled: task.id === 1, remarks: "", qualityType: "", phLevel: "", tdsLevel: "", tdsTime: "", images: [null, null, null, null], imageFiles: [null, null, null, null] };
        });
        disinfectionTasks.forEach((task) => {
            resetData[task.id] = { enabled: true, remarks: "", images: [null, null, null, null], imageFiles: [null, null, null, null] };
        });
        feedInventoryTasks.forEach((task) => {
            resetData[task.id] = { enabled: true, remarks: "", images: [null, null, null, null], imageFiles: [null, null, null, null] };
        });
        flyFeatherControlTasks.forEach((task) => {
            resetData[task.id] = { enabled: true, remarks: "", images: [null, null, null, null], imageFiles: [null, null, null, null] };
        });
        flockInventoryTasks.forEach((task) => {
            resetData[task.id] = { enabled: true, remarks: "", images: [null, null, null, null], imageFiles: [null, null, null, null], femaleBirds: "", maleBirds: "", stockToggle: false };
        });
        semenCollectionTasks.forEach((task) => {
            resetData[task.id] = { enabled: true, remarks: "", images: [null, null, null, null], imageFiles: [null, null, null, null], stockToggle: false };
        });
        inseminationTasks.forEach((task) => {
            resetData[task.id] = { enabled: true, remarks: "", images: [null, null, null, null], imageFiles: [null, null, null, null] };
        });
        setTaskData(resetData);
        setExpandedItems([disinfectionTasks[0]?.id]);
    }, [tasks, disinfectionTasks, feedInventoryTasks, flyFeatherControlTasks, flockInventoryTasks, semenCollectionTasks, inseminationTasks]);

    const handleTaskChange = (taskId, field, value) => {
        setTaskData((prev) => ({
            ...prev,
            [taskId]: {
                ...prev[taskId],
                [field]: value,
            },
        }));
    };

    const handleFileSelect = (taskId, slotIndex, event) => {
        const file = event.target.files[0];
        if (file) {
            setValidationErrors((prev) => prev.filter((id) => id !== taskId));
            const reader = new FileReader();
            reader.onload = (e) => {
                setTaskData((prev) => {
                    const task = prev[taskId];
                    const newImages = [...task.images];
                    const newImageFiles = [...(task.imageFiles || [null, null, null, null])];
                    newImages[slotIndex] = e.target.result;
                    newImageFiles[slotIndex] = file;
                    return {
                        ...prev,
                        [taskId]: {
                            ...task,
                            images: newImages,
                            imageFiles: newImageFiles,
                        },
                    };
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = (taskId, slotIndex) => {
        setTaskData((prev) => {
            const task = prev[taskId];
            const newImages = [...task.images];
            const newImageFiles = [...(task.imageFiles || [null, null, null, null])];
            newImages[slotIndex] = null;
            newImageFiles[slotIndex] = null;
            return {
                ...prev,
                [taskId]: {
                    ...task,
                    images: newImages,
                    imageFiles: newImageFiles,
                },
            };
        });
    };

    const resetForm = useCallback(() => {
        const resetData = {};
        tasks.forEach((task) => {
            resetData[task.id] = { enabled: task.id === 1, remarks: "", qualityType: "", phLevel: "", tdsLevel: "", tdsTime: "", images: [null, null, null, null], imageFiles: [null, null, null, null] };
        });
        disinfectionTasks.forEach((task) => {
            resetData[task.id] = { enabled: true, remarks: "", images: [null, null, null, null], imageFiles: [null, null, null, null] };
        });
        feedInventoryTasks.forEach((task) => {
            resetData[task.id] = { enabled: true, remarks: "", images: [null, null, null, null], imageFiles: [null, null, null, null] };
        });
        flyFeatherControlTasks.forEach((task) => {
            resetData[task.id] = { enabled: true, remarks: "", images: [null, null, null, null], imageFiles: [null, null, null, null] };
        });
        flockInventoryTasks.forEach((task) => {
            resetData[task.id] = { enabled: true, remarks: "", images: [null, null, null, null], imageFiles: [null, null, null, null], femaleBirds: "", maleBirds: "", stockToggle: false };
        });
        semenCollectionTasks.forEach((task) => {
            resetData[task.id] = { enabled: true, remarks: "", images: [null, null, null, null], imageFiles: [null, null, null, null], stockToggle: false };
        });
        inseminationTasks.forEach((task) => {
            resetData[task.id] = { enabled: true, remarks: "", images: [null, null, null, null], imageFiles: [null, null, null, null] };
        });
        setTaskData(resetData);
        setExpandedItems([disinfectionTasks[0]?.id]);
    }, [tasks, disinfectionTasks, feedInventoryTasks, flyFeatherControlTasks, flockInventoryTasks, semenCollectionTasks, inseminationTasks]);

    const handleSubmit = async () => {
        try {
            console.log("🚀 Submitting Bio Security Data (DUMMY MODE):", taskData);
            setLoading(true);
            setError(null);
            setSuccess(false);

            await new Promise(resolve => setTimeout(resolve, 1500));

            setSuccess(true);
            // addNotifications([{ id: Date.now(), title: "Successfully Saved", message: "Bio security data has been saved successfully in dummy mode.", type: "success" }]);

            setTimeout(() => setSuccess(false), 3000);
            resetForm();
        } catch (err) {
            console.error("Error:", err);
            setError("Failed to save data.");
            setTimeout(() => setError(null), 5000);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/biosecuritydata');
    };

    return (
        <div className="p-6 bg-[#F9F9FC] min-h-screen font-poppins text-[#1C1C1C]">
            <div className="flex justify-between items-center mb-6 max-w-6xl">
                <h1 className="text-lg font-bold">Bio security Data</h1>
                <button
                    className="flex items-center gap-2 bg-white text-[#D4AF37] border border-[#D4AF37] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#D4AF37] hover:text-white transition-all shadow-sm"
                    onClick={() => navigate('/biosecuritydata')}
                >
                    <FiArrowLeft /> Back
                </button>
            </div>

            {error && (
                <div className="mb-4 max-w-6xl bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <p className="text-red-700 font-bold text-sm">{error}</p>
                </div>
            )}

            {success && (
                <div className="mb-4 max-w-6xl bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <p className="text-green-700 font-bold text-sm">Bio security data saved successfully!</p>
                </div>
            )}

            <div className="max-w-6xl space-y-4 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
                {categories.map((category) => {
                    const isCategoryOpen = expandedCategory === category.id;
                    return (
                        <div key={category.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300">
                            <button
                                onClick={() => toggleCategory(category.id)}
                                className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50/50 transition-colors"
                            >
                                <span className="text-sm font-bold text-[#1C1C1C]">{category.title}</span>
                                <MdOutlineKeyboardArrowDown size={20} className={`text-[#1C1C1C] transition-transform duration-300 ${isCategoryOpen ? "rotate-180" : ""}`} />
                            </button>
                            {isCategoryOpen && (
                                <div className="p-4 md:p-6 bg-white border-t border-gray-50">
                                    <div className="flex flex-col md:flex-row justify-between items-end gap-4 mb-8">
                                        <div className="w-full md:w-auto">
                                            <label className="block text-[10px] font-bold mb-2">Select Range : <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <select
                                                    className="w-full md:w-48 h-10 px-4 pr-10 rounded-lg border border-gray-100 bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-[10px] text-gray-700 appearance-none cursor-pointer shadow-sm"
                                                    value={categoryData[category.id]?.frequency || "daily"}
                                                    onChange={(e) => handleFrequencyChange(category.id, e.target.value)}
                                                >
                                                    <option value="daily">Daily</option>
                                                    <option value="weekly">Weekly</option>
                                                    <option value="monthly">Monthly</option>
                                                    <option value="fortnightly">Fortnightly</option>
                                                    <option value="two_month_once">2 months once</option>
                                                    <option value="quarterly">Quarterly</option>
                                                    <option value="bi_annually">Bi-Annually</option>
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                    <MdOutlineKeyboardArrowDown size={16} className="text-[#D4AF37]" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full md:w-auto">
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    className="w-full md:w-48 h-10 px-4 rounded-lg border border-gray-100 bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-[10px] text-gray-700 placeholder:text-gray-400 shadow-sm"
                                                    value={categoryData[category.id]?.date || ""}
                                                    onChange={(e) => handleDateChange(category.id, e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    {category.id === "biosecurity_disinfection" ? (
                                        <div className="space-y-4">
                                            {disinfectionTasks.map((task, index) => {
                                                const isOpen = expandedItems.includes(task.id);
                                                const data = taskData[task.id];
                                                if (!data) return null;
                                                return (
                                                    <div key={task.id} className={`rounded-xl overflow-hidden transition-all duration-300 border ${validationErrors.includes(task.id) ? 'border-red-500 shadow-sm' : 'border-gray-100 shadow-sm'} bg-white`}>
                                                        <button onClick={() => toggleItem(task.id)} className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${isOpen ? "bg-white" : "bg-white hover:bg-gray-50/50"}`}>
                                                            <span className="text-sm font-bold text-[#1C1C1C]">{index + 1}. {task.title}</span>
                                                            <MdOutlineKeyboardArrowDown size={20} className={`text-[#D4AF37] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                                                        </button>
                                                        <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
                                                            <div className="px-6 pb-6 pt-2 space-y-6 text-[10px]">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-bold text-[#1C1C1C]">Upload File</span>
                                                                        <span className="text-red-500 font-bold text-lg">*</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg p-1 pr-4 shadow-sm w-fit">
                                                                        <label className="bg-[#808080] text-white px-4 py-1.5 rounded-md text-[10px] font-bold cursor-pointer hover:bg-gray-700 transition-all shadow-sm">
                                                                            Choosen file
                                                                            <input type="file" className="hidden" onChange={(e) => handleFileSelect(task.id, 0, e)} accept="image/*" />
                                                                        </label>
                                                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{data.images.filter(img => img).length > 0 ? `${data.images.filter(img => img).length} images selected` : "No file choosen"}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-3">
                                                                    {[0, 1, 2, 3].map((i) => (
                                                                        <label key={i} className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50/50 overflow-hidden flex items-center justify-center group relative cursor-pointer hover:border-[#D4AF37]/50 transition-all shadow-sm">
                                                                            {data.images[i] ? (
                                                                                <>
                                                                                    <img src={data.images[i]} alt="" className="w-full h-full object-cover" />
                                                                                    <button type="button" onClick={(e) => { e.preventDefault(); removeImage(task.id, i); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                                                        <MdClose size={10} />
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <MdAddAPhoto className="text-gray-300 group-hover:text-[#D4AF37] transition-colors" size={18} />
                                                                                    <input type="file" className="hidden" onChange={(e) => handleFileSelect(task.id, i, e)} accept="image/*" />
                                                                                </>
                                                                            )}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-bold text-[#1C1C1C]">Remarks</span>
                                                                        <span className="text-red-500 font-bold text-lg">*</span>
                                                                    </div>
                                                                    <textarea className="w-full min-h-[80px] p-4 rounded-xl border border-gray-100 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none text-[10px] shadow-sm" value={data.remarks} onChange={(e) => handleTaskChange(task.id, "remarks", e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : category.id === "insemanation" ? (
                                        <div className="space-y-4">
                                            {inseminationTasks.map((task, index) => {
                                                const isOpen = expandedItems.includes(task.id);
                                                const data = taskData[task.id];
                                                if (!data) return null;
                                                return (
                                                    <div key={task.id} className={`rounded-xl overflow-hidden transition-all duration-300 border ${validationErrors.includes(task.id) ? 'border-red-500 shadow-sm' : 'border-gray-100 shadow-sm'} bg-white`}>
                                                        <button onClick={() => toggleItem(task.id)} className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${isOpen ? "bg-white" : "bg-white hover:bg-gray-50/50"}`}>
                                                            <span className="text-sm font-bold text-[#1C1C1C]">{index + 1}. {task.title}</span>
                                                            <MdOutlineKeyboardArrowDown size={20} className={`text-[#D4AF37] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                                                        </button>
                                                        <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
                                                            <div className="px-6 pb-6 pt-2 space-y-6 text-[10px]">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-bold text-[#1C1C1C]">Upload File</span>
                                                                        <span className="text-red-500 font-bold text-lg">*</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg p-1 pr-4 shadow-sm w-fit">
                                                                        <label className="bg-[#808080] text-white px-4 py-1.5 rounded-md text-[10px] font-bold cursor-pointer hover:bg-gray-700 transition-all shadow-sm">
                                                                            Choosen file
                                                                            <input type="file" className="hidden" onChange={(e) => handleFileSelect(task.id, 0, e)} accept="image/*" />
                                                                        </label>
                                                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{data.images.filter(img => img).length > 0 ? `${data.images.filter(img => img).length} images selected` : "No file choosen"}</span>
                                                                    </div>
                                                                </div>
                                                                {data.images.some(img => img) && (
                                                                    <div className="flex gap-3">
                                                                        {data.images.map((img, i) => img && (
                                                                            <div key={i} className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50/50 overflow-hidden flex items-center justify-center group relative shadow-sm">
                                                                                <img src={img} alt="" className="w-full h-full object-cover" />
                                                                                <button type="button" onClick={() => removeImage(task.id, i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                                                    <MdClose size={10} />
                                                                                </button>
                                                                            </div>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-bold text-[#1C1C1C]">Remarks</span>
                                                                        <span className="text-red-500 font-bold text-lg">*</span>
                                                                    </div>
                                                                    <textarea className="w-full min-h-[80px] p-4 rounded-xl border border-gray-100 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none text-[10px] shadow-sm" value={data.remarks} onChange={(e) => handleTaskChange(task.id, "remarks", e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : category.id === "feed_inventory" ? (
                                        <div className="space-y-4">
                                            {feedInventoryTasks.map((task, index) => {
                                                const isOpen = expandedItems.includes(task.id);
                                                const data = taskData[task.id];
                                                if (!data) return null;
                                                return (
                                                    <div key={task.id} className={`rounded-xl overflow-hidden transition-all duration-300 border ${validationErrors.includes(task.id) ? 'border-red-500 shadow-sm' : 'border-gray-100 shadow-sm'} bg-white`}>
                                                        <button onClick={() => toggleItem(task.id)} className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${isOpen ? "bg-white" : "bg-white hover:bg-gray-50/50"}`}>
                                                            <span className="text-sm font-bold text-[#1C1C1C]">{index + 1}. {task.title}</span>
                                                            <MdOutlineKeyboardArrowDown size={20} className={`text-[#D4AF37] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                                                        </button>
                                                        <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
                                                            <div className="px-6 pb-6 pt-2 space-y-6 text-[10px]">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-bold text-[#1C1C1C]">Remarks</span>
                                                                        <span className="text-red-500 font-bold text-lg">*</span>
                                                                    </div>
                                                                    <textarea className="w-full min-h-[80px] p-4 rounded-xl border border-gray-100 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none text-[10px] shadow-sm" value={data.remarks} onChange={(e) => handleTaskChange(task.id, "remarks", e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : category.id === "fly_feather_control" ? (
                                        <div className="space-y-4">
                                            {flyFeatherControlTasks.map((task, index) => {
                                                const isOpen = expandedItems.includes(task.id);
                                                const data = taskData[task.id];
                                                if (!data) return null;
                                                return (
                                                    <div key={task.id} className={`rounded-xl overflow-hidden transition-all duration-300 border ${validationErrors.includes(task.id) ? 'border-red-500 shadow-sm' : 'border-gray-100 shadow-sm'} bg-white`}>
                                                        <button onClick={() => toggleItem(task.id)} className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${isOpen ? "bg-white" : "bg-white hover:bg-gray-50/50"}`}>
                                                            <span className="text-sm font-bold text-[#1C1C1C]">{index + 1}. {task.title}</span>
                                                            <MdOutlineKeyboardArrowDown size={20} className={`text-[#D4AF37] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                                                        </button>
                                                        <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
                                                            <div className="px-6 pb-6 pt-2 space-y-6 text-[10px]">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-bold text-[#1C1C1C]">Upload File</span>
                                                                        <span className="text-red-500 font-bold text-lg">*</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg p-1 pr-4 shadow-sm w-fit">
                                                                        <label className="bg-[#808080] text-white px-4 py-1.5 rounded-md text-[10px] font-bold cursor-pointer hover:bg-gray-700 transition-all shadow-sm">
                                                                            Choosen file
                                                                            <input type="file" className="hidden" onChange={(e) => handleFileSelect(task.id, 0, e)} accept="image/*" />
                                                                        </label>
                                                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{data.images.filter(img => img).length > 0 ? `${data.images.filter(img => img).length} images selected` : "No file choosen"}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-3">
                                                                    {[0, 1, 2, 3].map((i) => (
                                                                        <label key={i} className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50/50 overflow-hidden flex items-center justify-center group relative cursor-pointer hover:border-[#D4AF37]/50 transition-all shadow-sm">
                                                                            {data.images[i] ? (
                                                                                <>
                                                                                    <img src={data.images[i]} alt="" className="w-full h-full object-cover" />
                                                                                    <button type="button" onClick={(e) => { e.preventDefault(); removeImage(task.id, i); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                                                        <MdClose size={10} />
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <MdAddAPhoto className="text-gray-300 group-hover:text-[#D4AF37] transition-colors" size={18} />
                                                                                    <input type="file" className="hidden" onChange={(e) => handleFileSelect(task.id, i, e)} accept="image/*" />
                                                                                </>
                                                                            )}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-bold text-[#1C1C1C]">Remarks</span>
                                                                        <span className="text-red-500 font-bold text-lg">*</span>
                                                                    </div>
                                                                    <textarea className="w-full min-h-[80px] p-4 rounded-xl border border-gray-100 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none text-[10px] shadow-sm" value={data.remarks} onChange={(e) => handleTaskChange(task.id, "remarks", e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : category.id === "water_quality" ? (
                                        <div className="space-y-4">
                                            {tasks.map((task, index) => {
                                                const isOpen = expandedItems.includes(task.id);
                                                const data = taskData[task.id];
                                                if (!data) return null;
                                                return (
                                                    <div key={task.id} className={`rounded-xl overflow-hidden transition-all duration-300 border ${validationErrors.includes(task.id) ? 'border-red-500 shadow-sm' : 'border-gray-100 shadow-sm'} bg-white`}>
                                                        <button onClick={() => toggleItem(task.id)} className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${isOpen ? "bg-white" : "bg-white hover:bg-gray-50/50"}`}>
                                                            <span className="text-sm font-bold text-[#1C1C1C]">{index + 1}. {task.title}</span>
                                                            <MdOutlineKeyboardArrowDown size={20} className={`text-[#D4AF37] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                                                        </button>
                                                        <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
                                                            <div className="px-6 pb-6 pt-2 space-y-6 text-[10px]">
                                                                {task.hasSpecialFields && (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="font-bold text-[#1C1C1C]">Type</span>
                                                                                <span className="text-red-500 font-bold text-lg">*</span>
                                                                            </div>
                                                                            <div className="relative">
                                                                                <select className="w-full h-10 px-4 pr-10 rounded-lg border border-gray-100 bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-[10px] text-gray-700 appearance-none cursor-pointer shadow-sm" value={data.qualityType} onChange={(e) => handleTaskChange(task.id, 'qualityType', e.target.value)}>
                                                                                    <option value="">Select Option</option>
                                                                                    <option value="good">Good</option>
                                                                                    <option value="average">Average</option>
                                                                                    <option value="poor">Poor</option>
                                                                                </select>
                                                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                                                                                    <MdOutlineKeyboardArrowDown size={16} className="text-[#D4AF37]" />
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="font-bold text-[#1C1C1C]">Ph Level</span>
                                                                                <span className="text-red-500 font-bold text-lg">*</span>
                                                                            </div>
                                                                            <input type="text" className="w-full h-10 px-4 rounded-lg border border-gray-100 bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-[10px] text-gray-700 placeholder:text-gray-400 shadow-sm" placeholder="Enter ph level" value={data.phLevel} onChange={(e) => handleTaskChange(task.id, 'phLevel', e.target.value)} />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="font-bold text-[#1C1C1C]">TDS Level</span>
                                                                                <span className="text-red-500 font-bold text-lg">*</span>
                                                                            </div>
                                                                            <input type="text" className="w-full h-10 px-4 rounded-lg border border-gray-100 bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-[10px] text-gray-700 placeholder:text-gray-400 shadow-sm" placeholder="Enter tds level" value={data.tdsLevel} onChange={(e) => handleTaskChange(task.id, 'tdsLevel', e.target.value)} />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="font-bold text-[#1C1C1C]">TDS Checking Time</span>
                                                                                <span className="text-red-500 font-bold text-lg">*</span>
                                                                            </div>
                                                                            <input type="time" className="w-full h-10 px-4 rounded-lg border border-gray-100 bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-[10px] text-gray-700 placeholder:text-gray-400 shadow-sm" value={data.tdsTime} onChange={(e) => handleTaskChange(task.id, 'tdsTime', e.target.value)} />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-bold text-[#1C1C1C]">Upload File</span>
                                                                        <span className="text-red-500 font-bold text-lg">*</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg p-1 pr-4 shadow-sm w-fit">
                                                                        <label className="bg-[#808080] text-white px-4 py-1.5 rounded-md text-[10px] font-bold cursor-pointer hover:bg-gray-700 transition-all shadow-sm">
                                                                            Choosen file
                                                                            <input type="file" className="hidden" onChange={(e) => handleFileSelect(task.id, 0, e)} accept="image/*" />
                                                                        </label>
                                                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{data.images.filter(img => img).length > 0 ? `${data.images.filter(img => img).length} images selected` : "No file choosen"}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-3">
                                                                    {[0, 1, 2, 3].map((i) => (
                                                                        <label key={i} className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50/50 overflow-hidden flex items-center justify-center group relative cursor-pointer hover:border-[#D4AF37]/50 transition-all shadow-sm">
                                                                            {data.images[i] ? (
                                                                                <>
                                                                                    <img src={data.images[i]} alt="" className="w-full h-full object-cover" />
                                                                                    <button type="button" onClick={(e) => { e.preventDefault(); removeImage(task.id, i); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                                                        <MdClose size={10} />
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <MdAddAPhoto className="text-gray-300 group-hover:text-[#D4AF37] transition-colors" size={18} />
                                                                                    <input type="file" className="hidden" onChange={(e) => handleFileSelect(task.id, i, e)} accept="image/*" />
                                                                                </>
                                                                            )}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-bold text-[#1C1C1C]">Remarks</span>
                                                                        <span className="text-red-500 font-bold text-lg">*</span>
                                                                    </div>
                                                                    <textarea className="w-full min-h-[80px] p-4 rounded-xl border border-gray-100 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none text-[10px] shadow-sm" value={data.remarks} onChange={(e) => handleTaskChange(task.id, "remarks", e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : category.id === "flock_inventory" ? (
                                        <div className="space-y-4">
                                            {flockInventoryTasks.map((task, index) => {
                                                const isOpen = expandedItems.includes(task.id);
                                                const data = taskData[task.id];
                                                if (!data) return null;
                                                return (
                                                    <div key={task.id} className={`rounded-xl overflow-hidden transition-all duration-300 border ${validationErrors.includes(task.id) ? 'border-red-500 shadow-sm' : 'border-gray-100 shadow-sm'} bg-white`}>
                                                        <button onClick={() => toggleItem(task.id)} className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${isOpen ? "bg-white" : "bg-white hover:bg-gray-50/50"}`}>
                                                            <span className="text-sm font-bold text-[#1C1C1C]">{index + 1}. {task.title}</span>
                                                            <div className="flex items-center gap-4">
                                                                {task.toggle && (
                                                                    <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                                        <span className="text-[10px] font-bold text-gray-500">No</span>
                                                                        <label className="relative inline-flex items-center cursor-pointer">
                                                                            <input type="checkbox" className="sr-only peer" checked={data.stockToggle || false} onChange={(e) => handleTaskChange(task.id, "stockToggle", e.target.checked)} />
                                                                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                                                                        </label>
                                                                        <span className="text-[10px] font-bold text-gray-500">Yes</span>
                                                                    </div>
                                                                )}
                                                                <MdOutlineKeyboardArrowDown size={20} className={`text-[#D4AF37] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                                                            </div>
                                                        </button>
                                                        <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
                                                            <div className="px-6 pb-6 pt-2 space-y-6 text-[10px]">
                                                                {task.counts && (
                                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="font-bold text-[#1C1C1C]">Female Birds</span>
                                                                                <span className="text-red-500 font-bold text-lg">*</span>
                                                                            </div>
                                                                            <input type="number" className="w-full h-10 px-4 rounded-lg border border-gray-100 bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-[10px] text-gray-700 placeholder:text-gray-400 shadow-sm" placeholder="Enter female birds count" value={data.femaleBirds || ""} onChange={(e) => handleTaskChange(task.id, 'femaleBirds', e.target.value)} />
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <div className="flex items-center gap-1">
                                                                                <span className="font-bold text-[#1C1C1C]">Male Birds</span>
                                                                                <span className="text-red-500 font-bold text-lg">*</span>
                                                                            </div>
                                                                            <input type="number" className="w-full h-10 px-4 rounded-lg border border-gray-100 bg-white focus:outline-none focus:ring-1 focus:ring-[#D4AF37] text-[10px] text-gray-700 placeholder:text-gray-400 shadow-sm" placeholder="Enter male birds count" value={data.maleBirds || ""} onChange={(e) => handleTaskChange(task.id, 'maleBirds', e.target.value)} />
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-bold text-[#1C1C1C]">Upload File</span>
                                                                        <span className="text-red-500 font-bold text-lg">*</span>
                                                                    </div>
                                                                    <div className="flex items-center gap-3 bg-white border border-gray-100 rounded-lg p-1 pr-4 shadow-sm w-fit">
                                                                        <label className="bg-[#808080] text-white px-4 py-1.5 rounded-md text-[10px] font-bold cursor-pointer hover:bg-gray-700 transition-all shadow-sm">
                                                                            Choosen file
                                                                            <input type="file" className="hidden" onChange={(e) => handleFileSelect(task.id, 0, e)} accept="image/*" />
                                                                        </label>
                                                                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">{data.images.filter(img => img).length > 0 ? `${data.images.filter(img => img).length} images selected` : "No file choosen"}</span>
                                                                    </div>
                                                                </div>
                                                                <div className="flex gap-3">
                                                                    {[0, 1, 2, 3].map((i) => (
                                                                        <label key={i} className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50/50 overflow-hidden flex items-center justify-center group relative cursor-pointer hover:border-[#D4AF37]/50 transition-all shadow-sm">
                                                                            {data.images[i] ? (
                                                                                <>
                                                                                    <img src={data.images[i]} alt="" className="w-full h-full object-cover" />
                                                                                    <button type="button" onClick={(e) => { e.preventDefault(); removeImage(task.id, i); }} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                                                                                        <MdClose size={10} />
                                                                                    </button>
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <MdAddAPhoto className="text-gray-300 group-hover:text-[#D4AF37] transition-colors" size={18} />
                                                                                    <input type="file" className="hidden" onChange={(e) => handleFileSelect(task.id, i, e)} accept="image/*" />
                                                                                </>
                                                                            )}
                                                                        </label>
                                                                    ))}
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-bold text-[#1C1C1C]">Remarks</span>
                                                                        <span className="text-red-500 font-bold text-lg">*</span>
                                                                    </div>
                                                                    <textarea className="w-full min-h-[80px] p-4 rounded-xl border border-gray-100 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none text-[10px] shadow-sm" value={data.remarks} onChange={(e) => handleTaskChange(task.id, "remarks", e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : category.id === "semen_collection" ? (
                                        <div className="space-y-4">
                                            {semenCollectionTasks.map((task, index) => {
                                                const isOpen = expandedItems.includes(task.id);
                                                const data = taskData[task.id];
                                                if (!data) return null;
                                                return (
                                                    <div key={task.id} className={`rounded-xl overflow-hidden transition-all duration-300 border ${validationErrors.includes(task.id) ? 'border-red-500 shadow-sm' : 'border-gray-100 shadow-sm'} bg-white`}>
                                                        <button onClick={() => toggleItem(task.id)} className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors ${isOpen ? "bg-white" : "bg-white hover:bg-gray-50/50"}`}>
                                                            <span className="text-sm font-bold text-[#1C1C1C]">{index + 1}. {task.title}</span>
                                                            <div className="flex items-center gap-4">
                                                                <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                                                                    <span className="text-[10px] font-bold text-gray-500">No</span>
                                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                                        <input type="checkbox" className="sr-only peer" checked={data.stockToggle || false} onChange={(e) => handleTaskChange(task.id, "stockToggle", e.target.checked)} />
                                                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                                                                    </label>
                                                                    <span className="text-[10px] font-bold text-gray-500">Yes</span>
                                                                </div>
                                                                <MdOutlineKeyboardArrowDown size={20} className={`text-[#D4AF37] transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                                                            </div>
                                                        </button>
                                                        <div className={`transition-all duration-300 ease-in-out ${isOpen ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0 overflow-hidden"}`}>
                                                            <div className="px-6 pb-6 pt-2 space-y-6 text-[10px]">
                                                                <div className="space-y-2">
                                                                    <div className="flex items-center gap-1">
                                                                        <span className="font-bold text-[#1C1C1C]">Remarks</span>
                                                                        <span className="text-red-500 font-bold text-lg">*</span>
                                                                    </div>
                                                                    <textarea className="w-full min-h-[80px] p-4 rounded-xl border border-gray-100 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] resize-none text-[10px] shadow-sm" value={data.remarks} onChange={(e) => handleTaskChange(task.id, "remarks", e.target.value)} />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : null}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #D4AF37; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #B8962F; }
            ` }} />

            <div className="flex justify-end gap-x-4 mt-8 max-w-6xl">
                <button onClick={handleCancel} disabled={loading} className="px-8 py-2 bg-[#F3F4F6] text-[#4B5563] rounded-lg font-bold text-[10px] hover:bg-gray-200 transition-all min-w-[120px] shadow-sm">
                    Cancel
                </button>
                <button onClick={handleSubmit} disabled={loading} className="px-10 py-2.5 bg-[#D4AF37] text-white rounded-lg font-bold text-[10px] hover:bg-[#B8962F] shadow-md transition-all min-w-[140px] disabled:opacity-50">
                    {loading ? "Submitting..." : "Submit"}
                </button>
            </div>
        </div>
    );
};

export default BioSecurityData;
