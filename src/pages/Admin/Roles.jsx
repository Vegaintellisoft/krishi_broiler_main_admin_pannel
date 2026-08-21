import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { RiArrowUpSFill, RiSearchLine } from 'react-icons/ri';
import { LuPlus } from 'react-icons/lu';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { IoCloseSharp } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatDateTime } from '../../utils/helper';
import Swal from 'sweetalert2';
import { useAuth } from '../../auth/AuthContext';

// --- Broiler sections for grouped role UI ---
const BROILER_SECTIONS = [
    {
        title: "Masters",
        modules: [
            { key: "allMasters", label: "All Masters" },
        ]
    },
    {
        title: "Data Entry",
        modules: [
            { key: "farmActivity", label: "Farm Activity" },
            { key: "shedReadiness", label: "Shed Ready" },
            { key: "chickReceipt", label: "Chick Receipt" },
            { key: "medicineIssued", label: "Issue Medicine" },
        ]
    },
    {
        title: "Feeds",
        modules: [
            { key: "feedRequest", label: "Feed Order Request" },
            { key: "feedApproval", label: "Feed Approval" },
            { key: "feedTransfer", label: "Feed Transfer" },
            { key: "feedReturn", label: "Feed Return" },
            { key: "broilerSupply", label: "Delivery Challan (BOS)" },
        ]
    },
    {
        title: "Users & Admin",
        modules: [
            { key: "broilerUsers", label: "Broiler Users" },
            { key: "adminPage", label: "Admin Page" },
        ]
    }
];

// --- Configuration Data for Divisions ---
const DIVISION_CONFIG = {
    "Wagon": {
        defaultRoleName: "Wagon Logistics Head (e.g., Fleet Manager)",
        accessRules: [
            "unitMaster", "userMaster", "sourceMaster", "purchaseOrder", "materialMaster",
            "shippingMaster", "supplierMaster", "deliveryChallan", "adminPage"
        ],
    },
    "Broiler": {
        defaultRoleName: "Broiler Supervisor (e.g., Broiler Head)",
        sections: BROILER_SECTIONS,
        accessRules: BROILER_SECTIONS.flatMap(s => s.modules.map(m => m.key)),
    },
    "Breeder": {
        defaultRoleName: "Breeder Manager (e.g., Breeder QC)",
        accessRules: [
            "UnitName", "Feeding", "EggCollection", "Mortality", "BioSecurity"
        ],
    }
};

// Default actions for modules not in SPECIAL_ACTIONS
const DEFAULT_ACCESS_ACTIONS = ["show", "edit", "add", "delete"];

// Per-module action overrides
const SPECIAL_ACTIONS = {
    // Wagon
    "purchaseOrder": ["show", "edit", "delete"],
    "deliveryChallan": ["show", "add", "view", "cancel"],
    // Shared
    "adminPage": ["show", "showRoles", "showModerators", "showAllCategories"],
    // Broiler - Farm Activity has additional specific actions
    "farmActivity": ["all", "dvrEntrySave", "sapSubmit", "locationEntry", "bluetoothEntry"],
    // Broiler - single "all" toggle for full access
    "shedReadiness": ["all"],
    "chickReceipt": ["all"],
    "medicineIssued": ["all"],
    "feedRequest": ["all"],
    "feedApproval": ["all"],
    "feedTransfer": ["all"],
    "feedReturn": ["all"],
    "broilerSupply": ["all"],
};

// Display names for action column headers
const ACTION_DISPLAY_NAMES = {
    all: "All",
    dvrEntrySave: "DVR Entry Save",
    sapSubmit: "SAP Submit",
    locationEntry: "Location Entry",
    bluetoothEntry: "Bluetooth Entry",
    showRoles: "Show Roles",
    showModerators: "Show Users",
    showAllCategories: "All Categories Access",
};

const INITIAL_CATEGORY = "Wagon";

// --- Main Component ---
export default function Roles() {
    const { user, getPermissions } = useAuth();
    const permissions = getPermissions() || {};
    const { adminPage } = permissions;
    const isAdmin = adminPage?.showAllCategories === true;
    const userCategory = user?.category || INITIAL_CATEGORY;

    const [roles, setRoles] = useState([]);
    const [modalIsOpen, setModalIsOpen] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [updateRoleId, setUpdateRoleId] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false)
    const [isSubmitLoading, setIsSubmitLoading] = useState(false)
    const itemsPerPage = 5;

    const [formData, setFormData] = useState({
        role_name: '',
        status: true,
        category: userCategory,
    });

    const currentConfig = DIVISION_CONFIG[formData.category] || DIVISION_CONFIG[userCategory];
    const currentAccessRules = currentConfig.accessRules;

    // --- Utility Function to Initialize/Reset Division Access Rules ---
    const initializeDivisionAccessRules = useCallback((initialCategory = userCategory, existingRole = {}) => {
        const config = DIVISION_CONFIG[initialCategory] || DIVISION_CONFIG[INITIAL_CATEGORY];
        const newAccess = {};
        const oldPermissions = existingRole.permissions || {};

        // Find all unique actions across all modules in the new table UI
        const allPossibleActions = new Set();
        config.accessRules.forEach(menuItem => {
            const actions = SPECIAL_ACTIONS[menuItem] || DEFAULT_ACCESS_ACTIONS;
            actions.forEach(action => allPossibleActions.add(action));
        });


        config.accessRules.forEach(menuItem => {
            const actions = SPECIAL_ACTIONS[menuItem] || DEFAULT_ACCESS_ACTIONS;

            actions.forEach(action => {
                const key = `${menuItem}_${action}`;

                let isChecked = false;

                // 1. Check for flat key (for new data)
                if (existingRole.hasOwnProperty(key)) {
                    isChecked = existingRole[key];
                }
                // 2. Check for nested key (for old/Wagon data)
                else if (oldPermissions[menuItem] && oldPermissions[menuItem].hasOwnProperty(action)) {
                    isChecked = oldPermissions[menuItem][action];
                }

                newAccess[key] = isChecked;
            });
        });

        // Ensure every possible action for every rule is initialized (needed for consistent toggle logic)
        config.accessRules.forEach(menuItem => {
            allPossibleActions.forEach(action => {
                const key = `${menuItem}_${action}`;
                if (!newAccess.hasOwnProperty(key)) {
                    newAccess[key] = false;
                }
            });
        });

        return newAccess;
    }, [userCategory]);

    // --- API Calls ---
    const fetchRolesData = async () => {
        setIsLoading(true)
        try {
            const url = `/roles/getAll/${userCategory}`;
            const { data } = await axios.get(url);

            if (data.status === true) {
                setRoles(data.data)
            } else {
                setRoles([])
            }
        }
        catch (error) {
            console.log("Server Error: ", error)
            setRoles([])
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchRolesData()
    }, [user?.category])

    // --- Modal and Form Logic ---
    const closeModal = () => {
        setModalIsOpen(false);
        setEditingRole(null);
        setUpdateRoleId(null);

        // Reset form data to initial state for a new role
        setFormData({
            role_name: '',
            status: true,
            category: userCategory,
            ...initializeDivisionAccessRules(userCategory)
        });
    };

    const openModal = (role = null) => {
        if (role) {
            const roleCategory = role.category || userCategory;

            const roleFormData = {
                ...role,
                role_name: role.role_name,
                status: role.status,
                category: roleCategory,
            };

            const divisionAccess = initializeDivisionAccessRules(roleCategory, role);

            setEditingRole(role);
            setUpdateRoleId(role.id)
            setFormData({ ...roleFormData, ...divisionAccess });

        } else {
            setEditingRole(null);
            setUpdateRoleId(null);
            setFormData({
                role_name: '',
                status: true,
                category: userCategory,
                ...initializeDivisionAccessRules(userCategory)
            });
        }
        setModalIsOpen(true);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Handler for the Division-based permissions (Toggle Switch)
    const handleDivisionAccessChange = (menuItem, action, isChecked) => {
        setFormData((prev) => {
            const newForm = {
                ...prev,
                [`${menuItem}_${action}`]: isChecked,
            };

            // Cascading Logic: If the primary permission is turned OFF,
            // all other associated permissions for that module must also be turned OFF.
            if (!isChecked && (action === "show" || action === "list" || action === "all")) {
                const actionsToClear = (SPECIAL_ACTIONS[menuItem] || DEFAULT_ACCESS_ACTIONS).filter(a => a !== action);

                actionsToClear.forEach(a => {
                    newForm[`${menuItem}_${a}`] = false;
                });
            }

            return newForm;
        });
    };

    const handleCategoryChange = (newCategory) => {
        const newConfig = DIVISION_CONFIG[newCategory];

        setFormData(prev => {
            const newForm = {
                ...prev,
                role_name: prev.role_name,
                status: prev.status,
                category: newCategory,
            };

            // Clear ALL existing module access flags
            Object.keys(newForm).forEach(key => {
                if (key.includes('_')) {
                    delete newForm[key];
                }
            });

            // Initialize access rule flags for modules in the NEW category (default to false)
            newConfig.accessRules.forEach(menuItem => {
                const actions = SPECIAL_ACTIONS[menuItem] || DEFAULT_ACCESS_ACTIONS;

                actions.forEach(action => {
                    newForm[`${menuItem}_${action}`] = false;
                });
            });

            return newForm;
        });
    };

    // --- CRUD Operations ---
    const handleToggleRoleStatus = async (role) => {
        setIsSubmitLoading(true)
        try {
            const { data } = await axios.put(`/roles/update/${role?.id}`, { ...role, status: !role.status });
            if (data.status === true) {
                await fetchRolesData()
                Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Role Status Updated Successfully.", showConfirmButton: false, timer: 2000 });
            }
        }
        catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: 'Internal server error, Try Again', });
        } finally {
            setIsSubmitLoading(false)
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitLoading(true);

        const payload = {
            role_name: formData.role_name,
            status: formData.status,
            category: formData.category
        };

        const currentCategory = formData.category;
        const accessRules = DIVISION_CONFIG[currentCategory].accessRules;
        let permissionsObject = {};

        Object.keys(formData).forEach(key => {
            if (key.includes('_')) {
                const parts = key.split('_');
                const action = parts.pop();
                const moduleName = parts.join('_');

                if (accessRules.includes(moduleName)) {
                    const viewActions = ["show", "list", "all"];
                    const isSubPermission = !viewActions.includes(action) && !["view", "cancel", "showRoles", "showModerators"].includes(action);
                    const isViewEnabled = viewActions.some(viewAction => formData[`${moduleName}_${viewAction}`]);
                    let isChecked = formData[key];

                    if (isSubPermission && !isViewEnabled) {
                        isChecked = false;
                    }

                    if (!permissionsObject[moduleName]) {
                        permissionsObject[moduleName] = {};
                    }
                    permissionsObject[moduleName][action] = isChecked;
                }
            }
        });

        payload.permissions = permissionsObject;

        try {
            let response;
            if (editingRole) {
                response = await axios.put(`/roles/update/${updateRoleId}`, payload);
                if (response.data.status === true) {
                    await fetchRolesData()
                    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Role Updated Successfully.", showConfirmButton: false, timer: 2000 });
                }
            } else {
                response = await axios.post("/roles/add", payload);
                if (response.data.status === true) {
                    await fetchRolesData()
                    Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Role Created Successfully.", showConfirmButton: false, timer: 2000 });
                }
            }
        } catch (err) {
            console.error("API Submission Error:", err);
            Swal.fire({ toast: true, position: "top-end", icon: 'error', title: 'Internal server error, Try Again', showConfirmButton: false, timer: 2000 });
        } finally {
            closeModal();
            setIsSubmitLoading(false)
        }
    };

    const handleDeleteRole = async (role) => {
        try {
            const { data } = await axios.get(`/roles/checkUsers/${role.id}`);
            if (data.hasUsers) {
                // we have users, just alert the user names and prevent deletion
                const userNames = data.users.map(u => u.first_name ? `${u.first_name} ${u.last_name || ''} (${u.username})` : u.username).join(', ');
                Swal.fire({
                    icon: 'warning',
                    title: 'Cannot Delete Role!',
                    html: `This role is currently assigned to the following user(s):<br/><br/><b>${userNames}</b><br/><br/>Please change their roles before attempting to delete this role.`,
                    confirmButtonColor: '#ea580c',
                });
            } else {
                // no users, just delete normally
                const { isConfirmed } = await Swal.fire({
                    title: 'Are you sure?',
                    text: "You want to delete this role?",
                    icon: 'warning',
                    showCancelButton: true,
                    confirmButtonColor: '#ea580c',
                    confirmButtonText: 'Yes, delete it!'
                });
                if (isConfirmed) {
                    setIsSubmitLoading(true);
                    const response = await axios.post(`/roles/reassignAndDelete/${role.id}`, {});
                    if (response.data.status) {
                        fetchRolesData();
                        Swal.fire({ toast: true, position: "top-end", icon: "success", title: "Role has been deleted.", showConfirmButton: false, timer: 2000 });
                    }
                }
            }
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Error', text: err.response?.data?.message || 'Something went wrong.' });
        } finally {
            setIsSubmitLoading(false);
        }
    }


    const filteredData = useMemo(() => {
        return roles
            ?.filter(role => {
                if (statusFilter === 'all') return true;
                const isActive = role?.status === true || role?.status === "active";
                return statusFilter === 'active' ? isActive : !isActive;
            })
            ?.filter(role =>
                role?.role_name?.toLowerCase().includes(searchQuery.toLowerCase())
            );
    }, [roles, searchQuery, statusFilter]);

    const totalPages = Math.ceil(filteredData?.length / itemsPerPage);
    const paginatedData = filteredData?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const goToPage = (pageNumber) => {
        setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
    };

    const renderPageNumbers = () => {
        const pageNumbers = [];
        let startPage, endPage;

        if (totalPages <= 3) {
            startPage = 1;
            endPage = totalPages;
        } else {
            if (currentPage <= 2) {
                startPage = 1;
                endPage = 3;
            } else if (currentPage + 1 >= totalPages) {
                startPage = totalPages - 2;
                endPage = totalPages;
            } else {
                startPage = currentPage - 1;
                endPage = currentPage + 1;
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(
                <button
                    key={i}
                    onClick={() => goToPage(i)}
                    className={`rounded px-3 py-1 text-sm transition-colors ${currentPage === i ? 'bg-orange-500 text-white font-semibold' : 'bg-gray-200 text-black hover:bg-gray-300'}`}
                >
                    {i}
                </button>
            );
        }
        return pageNumbers;
    };

    const LoadingOverlay = () => (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
            <div className="h-16 w-16 animate-spin rounded-full border-8 border-solid border-white border-t-transparent"></div>
            <p className="mt-4 text-lg font-semibold text-white">Saving...</p>
        </div>
    );


    // --- Render Component ---
    return (
        <div className="flex-1 rounded-lg bg-[#F9F9FC] h-screen p-6 font-poppins">
            {isSubmitLoading && <LoadingOverlay />}

            {/* --- Modal for Add/Edit Role --- */}
            {modalIsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 p-4">
                    <form onSubmit={handleSubmit} className="w-full max-w-5xl rounded-xl bg-white shadow-2xl overflow-hidden max-h-[95vh] flex flex-col">

                        {/* Header */}
                        <div className="flex items-center justify-between border-b p-4 px-8 sticky top-0 bg-white z-10">
                            <h2 className="text-xl font-bold text-gray-800">{editingRole ? 'Edit Role' : 'Create New Role'}</h2>
                            <button type="button" onClick={closeModal} className="text-white flex justify-center bg-orange-600 rounded-full w-8 h-8 items-center text-lg hover:bg-orange-700 transition-colors">
                                <IoCloseSharp />
                            </button>
                        </div>

                        {/* Content Area: Scrollable and well-padded */}
                        <div className="h-[75vh] space-y-8 overflow-y-auto p-8">

                            {/* Role Name Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Role Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    name="role_name"
                                    value={formData.role_name}
                                    onChange={handleInputChange}
                                    placeholder={currentConfig.defaultRoleName || "Enter Role Name"}
                                    required
                                    className={`w-full rounded-lg border bg-gray-50 p-3 text-base focus:outline-none focus:ring-2 focus:ring-orange-500 ${editingRole ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    disabled={!!editingRole}
                                />
                            </div>

                            {/* --- Division Selector --- */}
                            <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
                                <h3 className="text-md font-semibold text-gray-700 mb-3">
                                    Select Category
                                </h3>
                                <div className="flex flex-wrap gap-6">
                                    {Object.keys(DIVISION_CONFIG).map((option) => {
                                         const isDisabledOption = !isAdmin && option !== userCategory;
                                         return (
                                             <label
                                                 key={option}
                                                 className={`flex items-center gap-3 text-sm font-medium p-2 pr-4 rounded-full border transition-all duration-200 ${isDisabledOption ? 'opacity-50 cursor-not-allowed bg-gray-100' : 'cursor-pointer'} ${formData.category === option
                                                     ? "bg-orange-50 border-orange-500 text-orange-600 shadow-sm ring-2 ring-orange-200"
                                                     : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                                                     }`}
                                             >
                                                 <input
                                                     type="radio"
                                                     name="category"
                                                     value={option}
                                                     disabled={isDisabledOption}
                                                     checked={formData.category === option}
                                                     onChange={() => handleCategoryChange(option)}
                                                     className="hidden"
                                                 />
                                                 {/* Custom Radio Icon */}
                                                 <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors duration-200 ${formData.category === option ? 'border-orange-600 bg-white' : 'border-gray-400'}`}>
                                                     {formData.category === option && (
                                                         <span className="w-2 h-2 bg-orange-600 rounded-full"></span>
                                                     )}
                                                 </span>
                                                 {option}
                                             </label>
                                         );
                                     })}
                                </div>
                            </div>
                            {/* --- END Division Selector --- */}


                            {/* --- Division Access Rules --- */}
                            <div>
                                <h2 className="text-lg font-bold text-gray-800 mb-4 border-l-4 border-orange-500 pl-3">Access Rules ({formData.category})</h2>

                                {currentConfig.sections ? (
                                    /* Section-based rendering for Broiler */
                                    <div className="space-y-5">
                                        {currentConfig.sections.map((section) => {
                                            const sectionActions = section.modules.reduce((acc, mod) => {
                                                const actions = SPECIAL_ACTIONS[mod.key] || DEFAULT_ACCESS_ACTIONS;
                                                actions.forEach(a => { if (!acc.includes(a)) acc.push(a); });
                                                return acc;
                                            }, []);

                                            return (
                                                <div key={section.title} className="rounded-xl border border-gray-200 overflow-hidden">
                                                    <div className="bg-gray-800 text-white py-2.5 px-6 font-semibold text-sm tracking-wide">
                                                        {section.title}
                                                    </div>
                                                    <table className="min-w-full text-sm text-center border-collapse">
                                                        <thead className="bg-gray-100">
                                                            <tr>
                                                                <th className="py-3 px-6 text-left font-semibold text-gray-600 text-xs uppercase tracking-wider">Module</th>
                                                                {sectionActions.map(action => (
                                                                    <th key={action} className="py-3 px-4 font-semibold text-gray-600 text-xs uppercase tracking-wider">
                                                                        {ACTION_DISPLAY_NAMES[action] || action}
                                                                    </th>
                                                                ))}
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {section.modules.map((mod, index) => {
                                                                const moduleActions = SPECIAL_ACTIONS[mod.key] || DEFAULT_ACCESS_ACTIONS;
                                                                const isShowEnabled = formData[`${mod.key}_show`] === true || formData[`${mod.key}_all`] === true;

                                                                return (
                                                                    <tr key={mod.key}
                                                                        className={`transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-orange-50 border-b border-gray-100 last:border-b-0`}
                                                                    >
                                                                        <td className="text-left py-3 px-6 font-semibold text-gray-800">{mod.label}</td>
                                                                        {sectionActions.map(action => {
                                                                            const isModuleAction = moduleActions.includes(action);
                                                                            const key = `${mod.key}_${action}`;
                                                                            const isSubPermission = !['show', 'list', 'view', 'all'].includes(action);
                                                                            const isDisabledByRule = isSubPermission && !isShowEnabled && isModuleAction;
                                                                            const isDisabledFinal = isDisabledByRule;
                                                                            let isChecked = formData[key] || false;
                                                                            if (isDisabledByRule) isChecked = false;

                                                                            return (
                                                                                <td key={key} className="py-3 px-4">
                                                                                    {isModuleAction ? (
                                                                                        <label className={`relative inline-flex items-center cursor-pointer ${isDisabledFinal ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                                                            <input type="checkbox" className="sr-only peer"
                                                                                                onChange={(e) => handleDivisionAccessChange(mod.key, action, e.target.checked)}
                                                                                                checked={isChecked} disabled={isDisabledFinal}
                                                                                            />
                                                                                            <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:bg-orange-600 transition-all duration-300 shadow-inner"></div>
                                                                                            <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow-sm"></span>
                                                                                        </label>
                                                                                    ) : (
                                                                                        <span className="text-gray-300">—</span>
                                                                                    )}
                                                                                </td>
                                                                            );
                                                                        })}
                                                                    </tr>
                                                                );
                                                            })}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    /* Flat table rendering for Wagon/Breeder */
                                    <div className="overflow-x-auto rounded-xl border border-gray-100">
                                        <table className="min-w-full text-sm text-center border-collapse">
                                            <thead className="bg-gray-800 text-white sticky top-0">
                                                <tr>
                                                    <th className="py-4 px-6 text-left font-semibold text-base rounded-tl-xl">Module</th>
                                                    {currentAccessRules.reduce((acc, moduleName) => {
                                                        const actions = SPECIAL_ACTIONS[moduleName] || DEFAULT_ACCESS_ACTIONS;
                                                        actions.forEach(action => { if (!acc.includes(action)) acc.push(action); });
                                                        return acc;
                                                    }, []).map((header) => (
                                                        <th key={header} className="py-4 px-4 font-semibold text-base capitalize">
                                                            {ACTION_DISPLAY_NAMES[header] || header}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {currentAccessRules.map((menuItem, index) => {
                                                    const moduleActions = SPECIAL_ACTIONS[menuItem] || DEFAULT_ACCESS_ACTIONS;
                                                    const allPossibleActions = currentAccessRules.reduce((acc, moduleName) => {
                                                        const actions = SPECIAL_ACTIONS[moduleName] || DEFAULT_ACCESS_ACTIONS;
                                                        actions.forEach(action => { if (!acc.includes(action)) acc.push(action); });
                                                        return acc;
                                                    }, []);

                                                    const isShowEnabled = formData[`${menuItem}_show`] === true || formData[`${menuItem}_all`] === true;

                                                    return (
                                                        <tr key={menuItem}
                                                            className={`transition-colors duration-150 ${index % 2 === 0 ? "bg-white" : "bg-gray-50"} hover:bg-orange-50 border-b border-gray-100 last:border-b-0`}
                                                        >
                                                            <td className="text-left py-3 capitalize px-6 font-semibold text-gray-800">{menuItem}</td>
                                                            {allPossibleActions.map((action) => {
                                                                const isModuleAction = moduleActions.includes(action);
                                                                const key = `${menuItem}_${action}`;
                                                                const isSubPermission = !['show', 'list', 'view', 'all'].includes(action);
                                                                const isDisabledByRule = isSubPermission && !isShowEnabled && isModuleAction;
                                                                const isDisabledFinal = isDisabledByRule;
                                                                let isChecked = formData[key] || false;
                                                                if (isDisabledByRule) isChecked = false;

                                                                return (
                                                                    <td key={key} className="py-3 px-4">
                                                                        {isModuleAction ? (
                                                                            <label className={`relative inline-flex items-center cursor-pointer ${isDisabledFinal ? 'opacity-50 cursor-not-allowed' : ''}`}>
                                                                                <input type="checkbox" className="sr-only peer"
                                                                                    onChange={(e) => handleDivisionAccessChange(menuItem, action, e.target.checked)}
                                                                                    checked={isChecked} disabled={isDisabledFinal}
                                                                                />
                                                                                <div className="w-10 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-orange-500 rounded-full peer peer-checked:bg-orange-600 transition-all duration-300 shadow-inner"></div>
                                                                                <span className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform duration-300 peer-checked:translate-x-5 shadow-sm"></span>
                                                                            </label>
                                                                        ) : (
                                                                            <span className="text-gray-300">—</span>
                                                                        )}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    );
                                                })}
                                                {currentAccessRules.length === 0 && (
                                                    <tr>
                                                        <td colSpan={7} className="py-8 text-gray-500">No access rules configured for this division.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                            {/* --- END Division Access Rules --- */}

                        </div>

                        {/* Footer Buttons */}
                        <div className="flex justify-end gap-4 border-t p-4 px-8 sticky bottom-0 bg-white z-10 shadow-t-lg">
                            <button type="button" onClick={closeModal} className="px-6 py-2.5 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors">Discard</button>
                            <button
                                type="submit"
                                className="px-6 py-2.5 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition-colors shadow-lg shadow-orange-300/50"
                            >
                                {editingRole ? 'Update Role' : 'Save Role'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* --- Main Page Content (Table is unchanged) --- */}
            <div className="space-y-4">
                <h1 className="text-xl font-bold text-gray-900">Role Management</h1>
                <div className="flex items-center gap-x-2 text-sm text-gray-500 ">
                    <Link to="/" className='text-orange-500'>Admin</Link>
                    <span>
                        <RiArrowUpSFill className='rotate-90 ' size={20} />
                    </span>
                    <span>Roles</span>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <span className="absolute left-2 top-2.5"><RiSearchLine className="opacity-45" /></span>
                            <input
                                type="search"
                                placeholder="Search Role..."
                                value={searchQuery}
                                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                className="rounded-lg border py-2 pl-8 pr-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                            className="rounded-lg border bg-white py-2 pl-3 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <button onClick={() => openModal()} className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-xs text-white hover:bg-orange-600">
                        <LuPlus size={16} />
                        <span>Create Role</span>
                    </button>
                </div>
            </div>

            {/* --- Roles Table --- */}
            <div className="mt-5 overflow-x-auto rounded-lg bg-white shadow-md">
                <table className="w-full">
                    <thead className="font-semibold">
                        <tr className="border-b">
                            <th className="p-4 text-center text-sm text-black">S.No</th>
                            <th className="p-4 text-left text-sm text-black">Role Name</th>
                            <th className="p-4 text-left text-sm text-black">Category</th>
                            <th className="p-4 text-center text-sm text-black">Status</th>
                            <th className="p-4 text-left text-sm text-black">Created At</th>
                            <th className="p-4 text-center text-sm text-black">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y">
                        {paginatedData?.map((role, index) => (
                            <tr key={role.id} className="hover:bg-gray-50">
                                <td className="p-4 text-center text-sm text-gray-600">{(currentPage - 1) * itemsPerPage + index + 1}</td>
                                <td className="p-4 text-left font-medium text-sm text-gray-800">{role.role_name}</td>
                                <td className="p-4 text-left text-sm text-gray-600">{role.category || INITIAL_CATEGORY}</td>
                                <td className="p-4 text-center">
                                    <label className="relative inline-flex items-center cursor-pointer" title="Toggle role status">
                                        <input
                                            type="checkbox"
                                            checked={role.status === true || role.status === "active"}
                                            onChange={() => handleToggleRoleStatus(role)}
                                            className="peer sr-only"
                                        />
                                        <div
                                            className={`peer h-6 w-11 rounded-full bg-gray-200 
            after:absolute after:start-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full 
            after:border after:border-gray-300 after:bg-white after:transition-all 
            peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white`}
                                        ></div>
                                    </label>
                                </td>
                                <td className="p-4 text-left text-sm text-gray-600">{formatDateTime(role.created_at)}</td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-3">
                                        <button
                                            onClick={() => openModal(role)}
                                            className="text-gray-500 hover:text-orange-500"
                                            title="Edit Role"
                                        >
                                            <FiEdit2 size={20} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteRole(role)}
                                            disabled={role?.role_name === "Administrator"}
                                            className={`text-gray-500 hover:text-red-500 ${role?.role_name === "Administrator" ? "opacity-50 cursor-not-allowed hover:text-gray-500" : ""}`}
                                            title="Delete Role"
                                        >
                                            <FiTrash2 size={20} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}

                        {
                            (paginatedData?.length === 0 && !isLoading) &&
                            <tr>
                                <td colSpan="6" className="py-10 text-center text-gray-500 text-sm">
                                    No Data Available
                                </td>
                            </tr>
                        }

                        {isLoading && (
                            <tr>
                                <td colSpan="6" className="py-10 text-center">
                                    <div className="flex justify-center items-center">
                                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>

                {/* --- Pagination Controls --- */}
                {totalPages > 0 && (
                    <div className="flex items-center justify-end gap-2 p-4">
                        <span className='mr-2 text-sm text-gray-600'>Page {currentPage} of {totalPages}</span>
                        <button
                            onClick={() => goToPage(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="rounded border bg-white px-3 py-1 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100"
                        >
                            &lt;
                        </button>
                        {renderPageNumbers()}
                        <button
                            onClick={() => goToPage(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="rounded border bg-white px-3 py-1 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50 hover:bg-gray-100"
                        >
                            &gt;
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}