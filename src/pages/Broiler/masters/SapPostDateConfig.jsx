import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RiArrowUpSFill } from "react-icons/ri";
import { FiSave } from "react-icons/fi";
import { FaSpinner } from "react-icons/fa";
import Swal from "sweetalert2";
import axios from "axios";
import { useAuth } from "../../../auth/AuthContext";

const SapPostDateConfig = () => {
    const [allowedDays, setAllowedDays] = useState(3);
    const [configData, setConfigData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        fetchConfig();
    }, []);

    const fetchConfig = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get("broiler/sap-post-date-config");
            if (response.data?.status && response.data?.data) {
                setConfigData(response.data.data);
                setAllowedDays(response.data.data.allowed_days);
            }
        } catch (err) {
            console.error("Error fetching SAP post date config:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: "Failed to fetch configuration. Please try again."
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();
        
        if (allowedDays === "" || allowedDays === null) {
            Swal.fire({
                icon: "error",
                title: "Validation Error",
                text: "Allowed days is required."
            });
            return;
        }

        const days = Number(allowedDays);
        if (!Number.isInteger(days) || days < 0) {
            Swal.fire({
                icon: "error",
                title: "Validation Error",
                text: "Allowed days must be a non-negative integer."
            });
            return;
        }

        setIsSaving(true);
        try {
            const response = await axios.put("broiler/sap-post-date-config", {
                allowed_days: days,
                updated_by: user?.username || user?.name || "Admin"
            });

            if (response.data?.status) {
                Swal.fire({
                    icon: "success",
                    title: "Success",
                    text: response.data.message || "SAP Post Date configuration updated successfully.",
                    timer: 2000,
                    showConfirmButton: false
                });
                fetchConfig();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Update Failed",
                    text: response.data?.message || "Could not update configuration."
                });
            }
        } catch (err) {
            console.error("Error updating configuration:", err);
            Swal.fire({
                icon: "error",
                title: "Error",
                text: err.response?.data?.message || err.message || "Failed to update configuration."
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-[#F9F9FC] min-h-screen relative p-6 font-poppins">
            {/* Header */}
            <div className="space-y-4 mb-6">
                <h1 className="text-xl font-bold text-gray-900">SAP Post Date Configuration</h1>
                <div className="flex items-center gap-x-2 text-sm text-gray-500">
                    <Link to="/" className="text-orange-500">Masters</Link>
                    <span><RiArrowUpSFill className="rotate-90" size={20} /></span>
                    <span>SAP Post Date Config</span>
                </div>
            </div>

            {/* Config Form Card */}
            <div className="max-w-2xl bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                        <FaSpinner className="animate-spin text-orange-500" size={32} />
                        <p className="text-gray-500 text-sm mt-3">Loading configuration...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSave} className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Allowed Days for SAP Posting
                            </label>
                            <p className="text-xs text-gray-500 mb-3">
                                Specify the maximum number of days in the past the admin can select for the SAP post date.
                                For example, if set to 3 days, today (23rd) allows posting back to the 20th.
                            </p>
                            <input
                                type="number"
                                min="0"
                                step="1"
                                className="w-full md:w-1/2 py-2 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                                value={allowedDays}
                                onChange={(e) => setAllowedDays(e.target.value)}
                                placeholder="e.g. 3"
                            />
                        </div>

                        {configData && (
                            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100 space-y-2 text-xs text-gray-600">
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-500">Last Updated By:</span>
                                    <span>{configData.updated_by || "System"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="font-medium text-gray-500">Last Updated At:</span>
                                    <span>
                                        {configData.updated_at
                                            ? new Date(configData.updated_at).toLocaleString()
                                            : "-"}
                                    </span>
                                </div>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isSaving}
                                className="px-5 py-2.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition text-sm font-medium flex items-center gap-2 disabled:opacity-60"
                            >
                                {isSaving ? (
                                    <>
                                        <FaSpinner className="animate-spin" size={16} />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <FiSave size={16} />
                                        Save Configuration
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default SapPostDateConfig;
