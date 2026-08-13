import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowUpSFill, RiDeleteBin6Line, RiSearchLine } from 'react-icons/ri'
import { LuImport, LuPlus } from 'react-icons/lu'
import { FiEdit2 } from 'react-icons/fi'
import axios from 'axios';
import Swal from "sweetalert2";
import FarmModal from './FarmModal'
import ExcelExport from '../../../../utils/ExcelExport';
import { useAuth } from '../../../../auth/AuthContext';

const FarmActivities = () => {
  
  const { getPermissions } = useAuth();
  // Ensure permissions exist to avoid crash
  const farmActivity = getPermissions().farmActivity || { add: false, edit: false, delete: false };

  const [data, setData] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null); // State to hold the item being edited

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      setTimeout(() => {
        // Added 'activities' array to mock data to simulate child data for the modal
        setData([
          { 
            id: 1, 
            date: '2025-10-24', 
            vehicleNo: 'TN-01-AB-1234', 
            totalFarms: 1, 
            startKm: 1000, 
            endKm: 1050, 
            runningKm: 50, 
            status: 'Posted', 
            plant: 'Chennai Unit 1',
            activities: [
                 { id: 101, farmer: 'FARM-001 | Krishnan', batchNo: 'BATCH-001', mortalityQty: 5, feedQty: 10 }
            ]
          },
          { 
            id: 2, 
            date: '2025-10-23', 
            vehicleNo: 'TN-01-XY-9876', 
            totalFarms: 0, 
            startKm: 5000, 
            endKm: 5120, 
            runningKm: 120, 
            status: 'Posted', 
            plant: 'Chennai Unit 1',
            activities: []
          },
        ]);
        setIsLoading(false);
      }, 500);
    }
    catch (err) {
      console.log("Error fetching activities:", err)
      setIsLoading(false)
    }
  }

  const handleExport = () => {
    ExcelExport(data, "Farm_Activities.xlsx");
  };

  function openModal() {
    setSelectedItem(null); // Reset edit state
    setIsOpen(true);
  }
  
  function closeModal() {
    setIsOpen(false);
    setSelectedItem(null); // Reset edit state on close
  }

  // --- Edit Handler ---
  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsOpen(true);
  };

  // --- Delete Handler ---
  const handleDelete = (id) => {
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Yes, delete it!"
    }).then((result) => {
        if (result.isConfirmed) {
            // Mock Deletion
            setData(prev => prev.filter(item => item.id !== id));
            Swal.fire({
                title: "Deleted!",
                text: "Your file has been deleted.",
                icon: "success"
            });
        }
    });
  };

  const filteredData = data.filter((item) => {
    return (
      item.vehicleNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.date.includes(searchQuery)
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
    <div className={`rounded-lg shadow flex-1`}>

      {/* Embed the Modal */}
      <FarmModal
        isOpen={modalIsOpen}
        closeModal={closeModal}
        refreshData={fetchActivities}
        editData={selectedItem} // Pass selected item to modal
      />

      <div className={`bg-[#F9F9FC] h-screen relative`}>

        {/* Heading */}
        <div className="space-y-4 pt-3 px-6 font-poppins">
          <h1 className="text-xl font-bold text-gray-900">Farm Activities</h1>
          <div className="flex items-center gap-x-2 text-sm text-gray-500 ">
            <Link to="/" className='text-orange-500'>Data Entry</Link>
            <span>
              <RiArrowUpSFill className='rotate-90 ' size={20} />
            </span>
            <span>Farm Activity Log</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-x-4 flex">
              <div>
                <span className='absolute'>
                  <RiSearchLine className='ms-2 mt-2 opacity-45' />
                </span>
                <input
                  type="search"
                  placeholder="Search Vehicle/Date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="py-2 px-2 ps-10 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
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
                farmActivity?.add && <button className="px-4 py-2 bg-orange-500 text-white border rounded-lg hover:text-white" onClick={openModal}>
                  <div className='flex items-center gap-2 text-xs' >
                    <LuPlus size={16} />
                    <span >Add Activity</span>
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
                <th className="p-4 text-center text-sm text-black">Date</th>
                <th className="p-4 text-center text-sm text-black">Vehicle No</th>
                <th className="p-4 text-center text-sm text-black">Total Farms</th>
                <th className="p-4 text-center text-sm text-black">Running KM</th>
                <th className="p-4 text-center text-sm text-black">Status</th>
                {/* Only show Action header if edit or delete permission exists */}
                {(farmActivity?.edit || farmActivity?.delete) && (
                    <th className="p-4 text-center text-sm text-black">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y font-poppins">
              {paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 text-center">
                  <td className="p-4 text-sm opacity-65">{startIndex + index + 1}</td>
                  <td className="p-4 text-sm opacity-65">{item.date}</td>
                  <td className="p-4 text-sm opacity-65">{item.vehicleNo}</td>
                  <td className="p-4 text-sm opacity-65">{item.totalFarms}</td>
                  <td className="p-4 text-sm opacity-65">{item.runningKm} km</td>
                  <td className="p-4 text-sm opacity-65">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs">
                      {item.status}
                    </span>
                  </td>
                  
                  {/* Action Buttons */}
                  {(farmActivity?.edit || farmActivity?.delete) && (
                      <td className="p-4 text-sm opacity-65 flex justify-center gap-4">
                        {farmActivity?.edit && (
                            <button 
                                onClick={() => handleEdit(item)}
                                className="hover:text-orange-500 transition-colors"
                                title="Edit"
                            >
                                <FiEdit2 size={18} />
                            </button>
                        )}
                        {farmActivity?.delete && (
                            <button 
                                onClick={() => handleDelete(item.id)}
                                className="hover:text-red-500 transition-colors"
                                title="Delete"
                            >
                                <RiDeleteBin6Line size={18} />
                            </button>
                        )}
                      </td>
                  )}

                </tr>
              ))}

              {(paginatedData?.length <= 0 && !isLoading) &&
                <tr>
                  <td colSpan={(farmActivity?.edit || farmActivity?.delete) ? 7 : 6} className="py-10 text-center text-gray-500 text-sm">
                    No Data Available
                  </td>
                </tr>
              }

              {isLoading && (
                <tr>
                  <td colSpan={(farmActivity?.edit || farmActivity?.delete) ? 7 : 6} className="py-10 text-center">
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-end font-dm items-center gap-2 mt-4 pb-4">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 border rounded ${currentPage === 1 ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}
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
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1 border text-sm rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400' : 'text-black'}`}
            >
              {totalPages || 1}
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages || totalPages === 0}
              className={`px-3 py-1 border rounded ${currentPage === totalPages || totalPages === 0 ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FarmActivities