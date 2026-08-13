import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RiArrowUpSFill, RiSearchLine } from "react-icons/ri";
import { LuImport } from "react-icons/lu";
// Added: FaSpinner
import { FaSpinner } from "react-icons/fa";

// Assuming ExcelExport is still available
import ExcelExport from "../../../utils/ExcelExport";
import axios from "axios";
import { useAuth } from "../../../auth/AuthContext";

const TentativeRate = () => {
    // Retained the initial data structure
    console.log("Tentative Rate Page Loaded");
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Retained state
    const { user } = useAuth();
    console.log("Logged User", user);

    useEffect(() => {
        fetchMaster();
    }, []);

    const fetchMaster = async () => {
        setIsLoading(true)
        try {
            const response = await axios.get("broiler/tentative-rate");
            console.log("Response", response.data);
            setData(response.data.data);
        }
        catch (err) {
            console.log("Error fetching tentative rate:", err)
        } finally {
            // This ensures isLoading is set to false after success or failure
            setIsLoading(false)
        }
    }

    const [searchQuery, setSearchQuery] = useState("");

    const handleExport = () => {
        // Keeps the export functionality
        ExcelExport(data, "tentative_rate.xlsx");
    };

    // Filtered data logic is retained for search functionality
    const filteredData = data.filter(
        (item) =>
            item?.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(item?.min_rate || "").includes(searchQuery) ||
            String(item?.max_rate || "").includes(searchQuery) ||
            String(item?.start_date || "").includes(searchQuery)
    );

    // Pagination logic is retained
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.max(
        1,
        Math.ceil(filteredData.length / itemsPerPage)
    );

    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(
        startIndex,
        startIndex + itemsPerPage
    );

    const [showEditModal, setShowEditModal] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);

    const [selected, setSelected] = useState(null);

    const [formData, setFormData] = useState({
        start_date: "",
        min_rate: "",
        max_rate: ""
    });

    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
    const openEdit = (item) => {

        const today = new Date();

        setSelected(item);

        setFormData({
            start_date: today.toISOString().split("T")[0],
            min_rate: item.min_rate,
            max_rate: item.max_rate
        });

        setShowEditModal(true);
    };


    const updateRate = async () => {

        if (!formData.start_date) {
            alert("Please Select Date");
            return;
        }

        if (Number(formData.min_rate) >= Number(formData.max_rate)) {
    alert("Max Rate should be greater than Min Rate");
    return;
}

        // Duplicate validation: check if min_rate and max_rate are unchanged
        if (
            String(formData.min_rate) === String(selected.min_rate) &&
            String(formData.max_rate) === String(selected.max_rate)
        ) {
            alert("No changes detected. Please update the Min Rate or Max Rate before saving.");
            return;
        }

        try {

            await axios.put(
                `broiler/tentative-rate/${selected.id}`,
                {
                    ...formData,
                    updated_by: user?.username || "Admin"
                }
            );

            alert("Updated Successfully");

            setShowEditModal(false);

            fetchMaster();

        } catch (err) {

            alert(
                err?.response?.data?.message ||
                "Update Failed"
            );

            console.log(err);
        }
    };

    const addRate = async () => {

        if (!formData.start_date) {
            alert("Please Select Date");
            return;
        }
        if (Number(formData.min_rate) >= Number(formData.max_rate)) {
    alert("Max Rate should be greater than Min Rate");
    return;
}

        try {

            await axios.post(
                "broiler/tentative-rate",
                {
                    ...formData,
                    created_by: user?.username || "Admin",
                    updated_by: user?.username || "Admin"
                }
            );

            alert("Rate Added Successfully");

            setShowAddModal(false);

            setFormData({
                start_date: "",
                min_rate: "",
                max_rate: ""
            });

            fetchMaster();

        } catch (err) {

            alert(
                err?.response?.data?.message ||
                "Add Failed"
            );

            console.log(err);
        }
    };

    return (
        <div className="rounded-lg shadow flex-1">
            <div className="bg-[#F9F9FC] h-screen relative">
                <div className="space-y-4 pt-3 px-6 font-poppins">
                    <h1 className="text-xl font-bold text-gray-900">
                        Tentative Rate Master
                    </h1>
                    <div className="flex items-center gap-x-2 text-sm text-gray-500">
                        <Link to="/" className="text-orange-500">
                            Masters
                        </Link>
                        <RiArrowUpSFill className="rotate-90" size={20} />
                        <span>Tentative Rate </span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex space-x-4">
                            <div className="relative">
                                <RiSearchLine className="absolute left-2 top-2.5 text-gray-400" />
                                <input
                                    type="search"
                                    placeholder="Search Tentative Rate..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="py-2 px-8 border rounded-lg text-xs focus:ring-2 focus:ring-orange-500"
                                    // Disable search while loading
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        {data.filter(item => item.status === "Active").length === 0 && (
                            <button
                                onClick={() => {
                                    setFormData({
                                        start_date: new Date().toISOString().split("T")[0],
                                        min_rate: "",
                                        max_rate: ""
                                    });

                                    setShowAddModal(true);
                                }}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg"
                            >
                                Add Rate
                            </button>
                        )}

                        <div className="flex gap-3">
                            {/* Export Button */}
                            <button
                                onClick={handleExport}
                                className={`px-4 py-2 border rounded-lg hover:bg-orange-500 hover:text-white ${isLoading ? 'bg-gray-300 text-gray-500 cursor-not-allowed' : 'bg-[#EFE8E0] text-[#F3890A]'}`}
                                // Disable export while loading
                                disabled={isLoading}
                            >
                                <div className="flex gap-2 items-center text-xs ">
                                    <LuImport size={16} className='opacity-50' />
                                    <span>Export</span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
                {showEditModal && (
                    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                        <div className="bg-white p-6 rounded-lg w-[450px]">

                            <h2 className="text-2xl font-bold mb-5">
                                Edit Tentative Rate
                            </h2>

                            {/* Date */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">
                                    Date
                                </label>

                                <input
                                    type="text"
                                    value={
                                        formData.start_date
                                            ? new Date(formData.start_date)
                                                .toLocaleDateString("en-GB")
                                            : ""
                                    }
                                    readOnly
                                    className="border p-3 w-full rounded bg-gray-100"
                                />
                            </div>

                            {/* Min Rate */}
                            <div className="mb-4">
                                <label className="block text-sm font-semibold mb-2">
                                    Min Rate
                                </label>

                                <input
                                    type="number"
                                    value={formData.min_rate}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            min_rate: e.target.value
                                        })
                                    }
                                    className="border p-3 w-full rounded"
                                />
                            </div>

                            {/* Max Rate */}
                            <div className="mb-5">
                                <label className="block text-sm font-semibold mb-2">
                                    Max Rate
                                </label>

                                <input
                                    type="number"
                                    value={formData.max_rate}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            max_rate: e.target.value
                                        })
                                    }
                                    className="border p-3 w-full rounded"
                                />
                            </div>

                            <div className="flex justify-end gap-3">

                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-5 py-3 border rounded"
                                >
                                    Cancel
                                </button>

                                <button
                                    onClick={updateRate}
                                    className="px-5 py-3 bg-orange-500 text-white rounded"
                                >
                                    Update
                                </button>

                            </div>

                        </div>

                    </div>
                )}

                {
                    showAddModal && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

                            <div className="bg-white p-6 rounded-lg w-[450px]">

                                <h2 className="text-2xl font-bold mb-5">
                                    Add Tentative Rate
                                </h2>

                                <div className="mb-4">
                                    <label className="block text-sm font-semibold mb-2">
                                        Date
                                    </label>

                                    <input
                                        type="date"
                                        value={formData.start_date}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                start_date: e.target.value
                                            })
                                        }
                                        className="border p-3 w-full rounded"
                                    />
                                </div>

                                <div className="mb-4">
                                    <label className="block text-sm font-semibold mb-2">
                                        Min Rate
                                    </label>

                                    <input
                                        type="number"
                                        value={formData.min_rate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                min_rate: e.target.value
                                            })
                                        }
                                        className="border p-3 w-full rounded"
                                    />
                                </div>

                                <div className="mb-5">
                                    <label className="block text-sm font-semibold mb-2">
                                        Max Rate
                                    </label>

                                    <input
                                        type="number"
                                        value={formData.max_rate}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                max_rate: e.target.value
                                            })
                                        }
                                        className="border p-3 w-full rounded"
                                    />
                                </div>

                                <div className="flex justify-end gap-3">

                                    <button
                                        onClick={() => setShowAddModal(false)}
                                        className="px-5 py-3 border rounded"
                                    >
                                        Cancel
                                    </button>

                                    <button
                                        onClick={addRate}
                                        className="px-5 py-3 bg-green-600 text-white rounded"
                                    >
                                        Save
                                    </button>

                                </div>

                            </div>

                        </div>
                    )}


                {/* Table with Loading Overlay */}
                <div className="overflow-x-auto py-4 px-6 mx-4 mt-5 bg-white relative">

                    {/* Conditional Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white bg-opacity-80">
                            <FaSpinner className="animate-spin text-orange-500 text-3xl" />
                            <span className="ml-3 text-lg text-gray-700">Loading data...</span>
                        </div>
                    )}

                    <table className="min-w-full">
                        <thead className="font-poppins font-semibold">
                            <tr className="border-b">
                                <th className="p-4 text-center text-sm text-black">S.No</th>
                                <th className="p-4 text-center text-sm text-black">Date</th>
                                <th className="p-4 text-center text-sm text-black">Min Rate</th>
                                <th className="p-4 text-center text-sm text-black">Max Rate</th>
                                <th className="p-4 text-center text-sm text-black">End Date</th>
                                <th className="p-4 text-center text-sm text-black">Status</th>

                                <th className="p-4 text-center text-sm text-black">
                                    Updated By
                                </th>

                                <th className="p-4 text-center text-sm text-black">
                                    Updated Time
                                </th>

                                <th className="p-4 text-center text-sm text-black">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y font-poppins capitalize">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 text-center">
                                        <td className="p-4 text-sm opacity-65">
                                            {index + startIndex + 1}
                                        </td>

                                        <td className="p-4 text-sm opacity-65">
                                            {new Date(item.start_date).toLocaleDateString("en-GB")}
                                        </td>

                                        <td className="p-4 text-sm opacity-65">
                                            {item.min_rate}
                                        </td>

                                        <td className="p-4 text-sm opacity-65">
                                            {item.max_rate}
                                        </td>

                                        <td className="p-4 text-sm opacity-65">
                                            {item.end_date
                                                ? new Date(item.end_date).toLocaleDateString("en-GB")
                                                : "-"
                                            }
                                        </td>

                                        <td className="p-4 text-sm text-center">
                                            <span
                                                className={`px-3 py-1 rounded-full text-xs font-semibold ${item.status === "Active"
                                                    ? "bg-green-100 text-green-700"
                                                    : "bg-red-100 text-red-700"
                                                    }`}
                                            >
                                                {item.status}
                                            </span>
                                        </td>

                                        <td className="p-4 text-sm opacity-65">
                                            {item.updated_by || "-"}
                                        </td>

                                        <td className="p-4 text-sm opacity-65">
                                            {
                                                item.updated_at
                                                    ? new Date(item.updated_at).toLocaleString("en-GB")
                                                    : "-"
                                            }
                                        </td>

                                        <td className="p-4 text-sm opacity-65">
                                            {item.status === "Active" && (
                                                <button
                                                    onClick={() => openEdit(item)}
                                                    className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium shadow-md transition-all duration-200"
                                                >
                                                    Edit
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="9" // Adjusted to 4 since only 4 columns remain (S.No, Mandt, Werks, allPer)
                                        className="py-10 text-center text-gray-500 text-sm"
                                    >
                                        {!isLoading && "No Data Available"}
                                        {/* No Data message only shows if not loading */}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination */}
                    <div className={`flex justify-end font-dm items-center gap-2 mt-4 ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <button
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1 || isLoading}
                            className={`px-3 py-1 border rounded ${currentPage === 1 || isLoading ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}
                        >
                            &lt;
                        </button>
                        <button
                            onClick={goToFirstPage}
                            disabled={currentPage === 1 || isLoading}
                            className={`px-3 py-1 text-sm border rounded ${currentPage === 1 || isLoading ? 'text-gray-400' : 'text-black'}`}
                        >
                            {currentPage === 1 ? "0" : "1"}
                        </button>
                        <span className="px-3 py-1 border font-medium rounded bg-gray-200">{currentPage}</span>
                        <button
                            onClick={goToLastPage}
                            disabled={currentPage === totalPages || isLoading}
                            className={`px-3 py-1 text-sm border rounded ${currentPage === totalPages || isLoading ? 'text-gray-400' : 'text-black'}`}
                        >
                            {totalPages}
                        </button>
                        <button
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages || isLoading}
                            className={`px-3 py-1 border rounded ${currentPage === totalPages || isLoading ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}
                        >
                            &gt;
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );


};



export default TentativeRate;