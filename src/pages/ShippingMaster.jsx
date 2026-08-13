import React, { useEffect, useRef, useState } from 'react'
import { Link, } from 'react-router-dom'
import { RiArrowUpSFill, RiDeleteBin6Line, RiSearchLine } from 'react-icons/ri'
import { LuImport, LuPlus } from 'react-icons/lu'
import { FiEdit2 } from 'react-icons/fi'
import axios from 'axios';
import Swal from "sweetalert2";
import ExcelExport from '../utils/ExcelExport'
import { CustomDropdown } from '../components/CustomDropdown'
import { stateOptions } from '../utils/store'
import { IoCloseSharp } from 'react-icons/io5'
import { useAuth } from '../auth/AuthContext'

const ShippingMaster = () => {

  const { getPermissions } = useAuth();
  const { shippingMaster } = getPermissions();

  const [data, setData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([])
  const [modalIsOpen, setIsOpen] = useState(false);
  const [updatedShippingId, setUpdatedShippingId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)


  const [formData, setFormData] = useState({
    sap_code: '',
    sap_name: '',
    address: {
      state: '',
      city: '',
      street: '',
      company: '',
      door_no: '',
      pincode: '',
      district: '',
      gst_in: ''
    }
  });

  useEffect(() => {
    fetchShippingMaster();
  }, []);

  const fetchShippingMaster = async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get("/shipping/getAll");
      setData(data.data);
    }
    catch (err) {
      console.log("Error fetching user master:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nameParts = name.split('.');

    setFormData((prev) => {
      if (nameParts.length === 2) {
        return {
          ...prev,
          [nameParts[0]]: {
            ...prev[nameParts[0]],
            [nameParts[1]]: value,
          },
        };
      }

      return {
        ...prev,
        [name]: value,
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true)
    try {
      let response;
      if (updatedShippingId) {
        response = await axios.put(`/shipping/update/${updatedShippingId}`, formData);
      } else {
        response = await axios.post("/shipping/add", formData);
      }
      if (response.data.status) {
        fetchShippingMaster();
        setIsOpen(false);

        setFormData({
          sap_code: '',
          sap_name: '',
          address: {
            state: '',
            city: '',
            street: '',
            company: '',
            door_no: '',
            pincode: '',
            district: '',
            gst_in: ''
          }
        });
        setUpdatedShippingId(null);
      } else {
        console.log("Error saving user master");
      }
    } catch (err) {
      console.log("Error saving user master:", err);
    } finally {
      setIsSubmitLoading(false)
    }
  };

  const handleEdit = (item) => {
    setFormData({
      sap_code: item.sap_code,
      sap_name: item.sap_name,
      address: item.address
    });
    setUpdatedShippingId(item.id);
    setIsOpen(true);
  }

  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data } = await axios.delete(`/shipping/delete/${id}`);
          if (data.status) {
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "Successfully deleted.",
              showConfirmButton: false,
              timer: 3000
            });

            fetchShippingMaster();
          }
        } catch (err) {
          console.log("Error deleting data:", err);
        }
      }
    });
  };

  const handleExport = () => {
    ExcelExport(data, "Shipping_Master.xlsx");
  };

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setUpdatedShippingId(null);
    setFormData({
      sap_code: '',
      sap_name: '',
      address: {
        state: '',
        city: '',
        street: '',
        company: '',
        door_no: '',
        pincode: '',
        district: '',
        gst_in: ''
      }
    });
  }


  const filteredData = data.filter((item) => {
    return (
      item.sap_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sap_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.address.full_address.toString().toLowerCase().includes(searchQuery.toLowerCase())
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
    <div className={` rounded-lg shadow flex-1 `}>

      {modalIsOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <form
            className="px-6 py-4 font-poppins rounded-lg bg-white w-[60em] shadow-lg"
            onSubmit={handleSubmit}
          >
            <div className="flex justify-between border-b py-2">
              <h1 className="header text-lg font-semibold">Add Shipping Master</h1>
              <button
                className=" text-white flex justify-center bg-primary rounded-full w-7 h-7 items-center"
                onClick={closeModal}
              >
                <IoCloseSharp />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 mt-2 gap-y-5">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Code</label>
                <input
                  type="text"
                  name="sap_code"
                  value={formData.sap_code}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Branch Name</label>
                <input
                  type="text"
                  name="sap_name"
                  value={formData.sap_name}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              <div className='col-span-2'>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <div className='grid grid-cols-2  gap-x-10 gap-2'>
                  <input
                    type="text"
                    placeholder='Door / Gate No. (Optional)'
                    name="address.door_no"
                    value={formData.address.door_no}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    placeholder='Company'
                    name="address.company"
                    value={formData.address.company}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    placeholder='Street'
                    name="address.street"
                    value={formData.address.street}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    placeholder='City'
                    name="address.city"
                    value={formData.address.city}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                  <input
                    type="text"
                    placeholder='District'
                    name="address.district"
                    value={formData.address.district}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />

                  <div>
                    <CustomDropdown
                      name={"State"}
                      options={stateOptions}
                      value={formData.address.state}
                      onChange={(val) =>
                        setFormData((prev) => ({
                          ...prev,
                          address: {
                            ...prev.address,
                            state: val,
                          },
                        }))
                      }
                    />
                  </div>
                  <input
                    type="text"
                    pattern="\d{6}"
                    maxLength={6}
                    placeholder="Pincode"
                    name="address.pincode"
                    value={formData.address.pincode}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />

                  <input
                    type="text"
                    placeholder='GST IN'
                    name="address.gst_in"
                    value={formData.address.gst_in}
                    onChange={handleInputChange}
                    className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    required
                  />

                </div>
              </div>
            </div>

            <div className="flex justify-between gap-10 mt-8 mb-10">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 w-full bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 w-full bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center justify-center gap-2"
                disabled={isSubmitLoading} // optional: disable while loading
              >
                {isSubmitLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <div className={` bg-[#F9F9FC] h-screen relative`}>


        <div className=" space-y-4 pt-3 px-6 font-poppins">
          <h1 className="text-xl font-bold text-gray-900">Shipping Masters</h1>
          <div className="flex items-center gap-x-2 text-sm text-gray-500 ">
            <Link to="/" className='text-orange-500'>Masters</Link>
            <span>
              <RiArrowUpSFill className='rotate-90 ' size={20} />
            </span>
            <span>Shipping Master</span>
          </div>
          <div className="flex items-center justify-between">
            <div className=" space-x-4  flex">
              <div>
                <span className='absolute'>
                  <RiSearchLine className='ms-2 mt-2 opacity-45' />
                </span>
                <input
                  type="search"
                  placeholder="Search Master..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className=" py-2 px-2 ps-10 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* <div className="px-2 py-2  border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500  shadow-sm cursor-pointer" onChange={() => setSelectDate(calenderInputRef.current.value)}>
                <span className=' text-xs px-4 opacity-50 '>{selectDate}</span>
                <input type="date" className='w-4' ref={calenderInputRef} />
              </div> */}
            </div>

            <div className='space-x-5'>

              <button onClick={handleExport} className="px-4 py-2 bg-[#EFE8E0] text-[#F3890A] border rounded-lg hover:bg-orange-500 hover:text-white">
                <div className="flex gap-2 items-center text-xs ">
                  <LuImport size={16} className='opacity-50' />
                  <span>Export</span>
                </div>
              </button>

              {
                shippingMaster?.add && <button className="px-4 py-2 bg-orange-500 text-white border rounded-lg  hover:text-white" onClick={openModal}>
                  <div className='flex items-center gap-2 text-xs' >
                    <LuPlus size={16} />
                    <span >Add Data</span>
                  </div>
                </button>
              }



            </div>
          </div>

        </div>

        <div className={`overflow px-6 mx-4 mt-5 bg-white `}>
          <table className="w-full">
            <thead className='font-poppins font-semibold'>
              <tr className="border-b">
                <th className="p-4 text-center text-sm text-black">S.No</th>
                <th className="p-4 text-center text-sm text-black">Branch Code</th>
                <th className="p-4 text-center text-sm text-black">Branch Name</th>
                <th className="p-4 text-center text-sm text-black">Address</th>
                {/* <th className="p-4 text-center text-sm text-black">Status</th> */}
                {
                  (!shippingMaster?.edit && !shippingMaster?.delete) ? "" : <th className="p-4 text-center text-sm text-black">Actions</th>
                }

              </tr>
            </thead>
            <tbody className="divide-y font-poppins">
              {paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 text-center">
                  <td className="p-4 text-sm opacity-65">{startIndex + index + 1}</td>
                  <td className="p-4 text-sm opacity-65">{item.sap_code}</td>
                  <td className="p-4 text-sm opacity-65">{item.sap_name}</td>
                  <td className="p-4 text-sm w-[40%] opacity-65">{item.address.full_address}</td>

                  {
                    (!shippingMaster?.edit && !shippingMaster?.delete) ?
                      ""
                      :
                      <td className="p-4 text-right space-x-5 flex justify-center opacity-65">
                        {
                          shippingMaster?.edit && <button onClick={() => handleEdit(item)} className=" hover:text-gray-700">
                            <FiEdit2 size={20} />
                          </button>
                        }
                        {
                          shippingMaster?.delete && <button onClick={() => handleDelete(item.id)} className=" hover:text-gray-700">

                            <RiDeleteBin6Line size={20} />
                          </button>
                        }

                      </td>
                  }



                </tr>
              ))}

              {
                (paginatedData?.length <= 0 && !isLoading) &&
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
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              )}

            </tbody>
          </table>

          {/* Pagination Controls */}
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
  )
}

export default ShippingMaster