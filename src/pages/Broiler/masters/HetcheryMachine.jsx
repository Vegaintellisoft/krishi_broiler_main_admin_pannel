import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { RiArrowUpSFill, RiSearchLine } from "react-icons/ri";
import { LuImport } from "react-icons/lu";
// Added: FaSpinner
import { FaSpinner } from "react-icons/fa";

// Assuming ExcelExport is still available
import ExcelExport from "../../../utils/ExcelExport";
import axios from "axios";

const HetcheryMachine = () => {
    // Retained the initial data structure
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // Retained state

    useEffect(() => {
        fetchMaster();
    }, []);

    const fetchMaster = async () => {
        setIsLoading(true)
        try {
            const { data } = await axios.get("broiler/master/getAll/hetchery_machine_master");
            setData(data.data);
        }
        catch (err) {
            console.log("Error fetching Hetchery Machine:", err)
        } finally {
            // This ensures isLoading is set to false after success or failure
            setIsLoading(false)
        }
    }

    const [searchQuery, setSearchQuery] = useState("");

    const handleExport = () => {
        // Keeps the export functionality
        ExcelExport(data, "hetchery_machine.xlsx");
    };

    // Filtered data logic is retained for search functionality
    const filteredData = data.filter(
        (item) =>
            item.mandt.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.zzbroMac.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.zzbroMacN.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.zzcapacity.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.zsetQty.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Pagination logic is retained
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
            <div className="bg-[#F9F9FC] h-screen relative">
                <div className="space-y-4 pt-3 px-6 font-poppins">
                    <h1 className="text-xl font-bold text-gray-900">Hetchery Machine Master</h1>
                    <div className="flex items-center gap-x-2 text-sm text-gray-500">
                        <Link to="/" className="text-orange-500">
                            Masters
                        </Link>
                        <RiArrowUpSFill className="rotate-90" size={20} />
                        <span>Hetchery Machine Master</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex space-x-4">
                            <div className="relative">
                                <RiSearchLine className="absolute left-2 top-2.5 text-gray-400" />
                                <input
                                    type="search"
                                    placeholder="Search Line..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="py-2 px-8 border rounded-lg text-xs focus:ring-2 focus:ring-orange-500"
                                    // Disable search while loading
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="space-x-5">
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
                                <th className="p-4 text-center text-sm text-black">Mandt</th>
                                <th className="p-4 text-center text-sm text-black">zzbroMac</th>
                                <th className="p-4 text-center text-sm text-black">zzbroMacN</th>
                                <th className="p-4 text-center text-sm text-black">zzcapacity</th>
                                <th className="p-4 text-center text-sm text-black">zsetQty</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y font-poppins capitalize">
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-gray-50 text-center">
                                        <td className="p-4 text-sm opacity-65">{index + startIndex + 1}</td>
                                        <td className="p-4 text-sm opacity-65">{item.mandt}</td>
                                        <td className="p-4 text-sm opacity-65">{item.zzbroMac}</td>
                                        <td className="p-4 text-sm opacity-65">{item.zzbroMacN}</td>
                                        <td className="p-4 text-sm opacity-65">{item.zzcapacity}</td>
                                        <td className="p-4 text-sm opacity-65"> {item.zsetQty} </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        colSpan="4" // Adjusted to 4 since only 4 columns remain (S.No, Mandt, Werks, zsetQty)
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

export default HetcheryMachine;