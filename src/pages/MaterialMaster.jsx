import React, { useEffect, useRef, useState } from 'react'
import { Link, } from 'react-router-dom'
import { RiArrowUpSFill, RiDeleteBin6Line, RiSearchLine } from 'react-icons/ri'
import { LuImport, LuPlus } from "react-icons/lu";
import { FiEdit2 } from 'react-icons/fi';
import axios from 'axios';
import Swal from "sweetalert2";
import ExcelExport from '../utils/ExcelExport';
import { IoCloseSharp } from 'react-icons/io5';
import { useAuth } from '../auth/AuthContext';

const MaterialMaster = () => {
  const { getPermissions } = useAuth();
  const { materialMaster } = getPermissions();

  const calenderInputRef = useRef('')
  const [selectDate, setSelectDate] = useState('Select Dates');
  const [data, setData] = useState([]);
  const [selectedItems, setSelectedItems] = useState([])
  const [modalIsOpen, setIsOpen] = useState(false);
  const [updatedMaterialId, setUpdatedMaterialId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    hsn_code: '',
    material_code: '',
    is_taxable: true,
    status: '',
    cgst: '2.5',
    sgst: '2.5',
    e_way_bill: '',
    eway_exemption_notify: true,
  });

  const [isTaxable, setIsTaxable] = useState(true);

  useEffect(() => {
    fetchMaterialMaster();
  }, []);

  const fetchMaterialMaster = async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get("/material/getAll");
      setData(data.data);
    }
    catch (err) {
      console.log("Error fetching part master:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTaxableChange = (value) => {
    setIsTaxable(value);

    setFormData(prev => ({
      ...prev,
      is_taxable: value,
      cgst: value ? '2.5' : '0',
      sgst: value ? '2.5' : '0',
    }));
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitLoading(true)

    try {
      const cleanedFormData = Object.fromEntries(
        Object.entries(formData).map(([key, value]) => [
          key,
          typeof value === 'string' ? value.trim() : value
        ])
      );

      if (cleanedFormData.is_taxable === false || cleanedFormData.is_taxable === "false") {
        cleanedFormData.cgst = 0;
        cleanedFormData.sgst = 0;
      }
      
      // console.log("Material Data: ", cleanedFormData);
      // return;

      let response;

      if (updatedMaterialId) {
        response = await axios.put(`/material/update/${updatedMaterialId}`, cleanedFormData);

      } else {
        response = await axios.post("/material/add", cleanedFormData);
      }
      if (response.data.status) {
        fetchMaterialMaster();
        setIsOpen(false);

        setFormData({
          name: '',
          hsn_code: '',
          material_code: '',
          // rate_before_tax: '',
          status: '',
          cgst: '2.5',
          sgst: '2.5',
          e_way_bill: '',
          eway_exemption_notify: true,
        });
        setUpdatedMaterialId(null);
      } else {
        console.log("Error saving part master");
      }
    } catch (err) {
      console.log("Error saving part master:", err);
    } finally {
      setIsSubmitLoading(false)
    }
  };

  const handleEdit = (item) => {
    setFormData({
      name: item.name,
      hsn_code: item.hsn_code,
      material_code: item.material_code,
      // rate_before_tax: item.rate_before_tax,
      status: item.status,
      cgst: item.cgst,
      sgst: item.sgst,
      is_taxable: item.is_taxable,
      e_way_bill: item.e_way_bill,
      eway_exemption_notify: item?.eway_exemption_notify
    });
    setIsTaxable(item.is_taxable);
    setUpdatedMaterialId(item.id);
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
          const { data } = await axios.delete(`/material/delete/${id}`);
          if (data.status) {
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "The part has been deleted.",
              showConfirmButton: false,
              timer: 3000
            });

            fetchMaterialMaster();
          }
        } catch (err) {
          console.log("Error deleting data:", err);
        }
      }
    });
  };

  const handleExport = () => {
    ExcelExport(data, "Material_Master.xlsx");
  };

  function openModal() {
    setIsOpen(true);
  }

  function closeModal() {
    setIsOpen(false);
    setUpdatedMaterialId(null);
    setFormData({
      name: '',
      hsn_code: '',
      material_code: '',
      is_taxable: true,
      status: '',
      cgst: '2.5',
      sgst: '2.5',
      e_way_bill: '',
      eway_exemption_notify: true,
    });
  }


  const filteredData = data.filter((item) => {
    return (
      item.name.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hsn_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.material_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status.toString().toLowerCase().includes(searchQuery.toLowerCase())
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

    <div className={` rounded-lg shadow flex-1`}>

      {modalIsOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <form
            className="px-6 py-4 font-poppins rounded-lg bg-white w-[60em] shadow-lg"
            onSubmit={handleSubmit}
          >
            <div className="flex justify-between border-b py-2">
              <h1 className="header text-lg font-semibold">Add Material Master</h1>
              <button
                className=" text-white flex justify-center bg-primary rounded-full w-7 h-7 items-center"
                onClick={closeModal}
              >
                <IoCloseSharp />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 mt-2 gap-y-2">
              {/* Material Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Material Code</label>
                <input
                  type="text"
                  name="material_code"
                  value={formData.material_code}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>


              {/* Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* HSN Code Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">HSN Code</label>
                <input
                  type="text"
                  name="hsn_code"
                  value={formData.hsn_code}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>

              {/* Status Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="" disabled>Select Status</option>
                  <option value="1">Available</option>
                  <option value="2">Archive</option>
                </select>
              </div>


              {/* Basic Price (calculated from Rate Before Tax * Quantity) */}
              {/* <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Basic</label>
              <input
                type="text"
                name="rate_before_tax"
                value={formData.rate_before_tax}
                onChange={handleInputChange}
                className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div> */}

              {/* Is Taxable Radio */}
              <div className="mb-4">
                <label className="block mb-1">Is Taxable?</label>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isTaxable"
                      checked={isTaxable === true}
                      onChange={() => handleTaxableChange(true)}
                      className="mr-2"
                    />
                    Yes
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="isTaxable"
                      checked={isTaxable === false}
                      onChange={() => handleTaxableChange(false)}
                      className="mr-2"
                    />
                    No
                  </label>
                </div>
              </div>

              {/* Conditional CGST & SGST Fields */}
              {isTaxable && (
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">CGST (%)</label>
                    <input
                      type="number"
                      name="cgst"
                      value={formData.cgst}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    // disabled
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SGST (%)</label>
                    <input
                      type="number"
                      name="sgst"
                      value={formData.sgst}
                      onChange={handleInputChange}
                      className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    // disabled
                    />
                  </div>
                </div>
              )}

              {/* E way bill Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Require E Way Bill?</label>
                <select
                  name="e_way_bill"
                  value={formData.e_way_bill}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="" disabled>Select Status</option>
                  <option value={true}>Yes</option>
                  <option value={false}>No</option>
                </select>
              </div>

              {/* E way bill Exemption Select */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Eway Bill Exemption ?</label>
                <select
                  name="eway_exemption_notify"
                  value={formData.eway_exemption_notify}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  <option value="" disabled>Select Option</option>
                  <option selected value={true}>Yes</option>
                  <option value={false}>No</option>
                </select>
              </div>

            </div>

            <div className="flex justify-between gap-24 mt-8 mb-10">
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

        {/* Part Master Heading */}
        <div className=" space-y-4 pt-3 px-6 font-poppins">
          <h1 className="text-xl font-bold text-gray-900">Material Masters</h1>
          <div className="flex items-center gap-x-2 text-sm text-gray-500 ">
            <Link to="/" className='text-orange-500'>Masters</Link>
            <span>
              <RiArrowUpSFill className='rotate-90 ' size={20} />
            </span>
            <span>Material Master</span>
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
                materialMaster?.add && <button className="px-4 py-2 bg-orange-500 text-white border rounded-lg  hover:text-white" onClick={openModal}>
                  <div className='flex items-center gap-2 text-xs' >
                    <LuPlus size={16} />
                    <span >Add Data</span>
                  </div>
                </button>
              }


            </div>
          </div>

        </div>

        {/* Table */}
        <div className={`overflow px-6 mx-4 mt-5 bg-white `}>

          <table className={`w-full rounded-md `}>
            <thead className='font-poppins font-semibold'>
              <tr className="border-b">
                {/* <th className="p-4 text-center">
                  <input
                    type="checkbox"
                    checked={selectedItems.length === data.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </th> */}
                <th className="p-4 text-center text-sm text-black">S.No</th>
                <th className="p-4 text-center text-sm text-black">Material Code</th>
                <th className="p-4 text-center text-sm text-black">Name</th>
                <th className="p-4 text-center text-sm text-black">HSN code</th>
                {/* <th className="p-4 text-center text-sm text-black">Rate Before Tax</th> */}
                <th className="p-4 text-center text-sm text-black">Status</th>
                {
                  (!materialMaster.edit && !materialMaster.delete) ? "" : <th className="p-4 text-center text-sm text-black">Actions</th>
                }

              </tr>
            </thead>
            <tbody className="divide-y font-poppins">
              {paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 text-center">
                  {/* <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="w-4 h-4 rounded border-gray-300"
                    />
                  </td> */}
                  <td className="p-4 text-sm opacity-65">{startIndex + index + 1}</td>
                  <td className="p-4 text-sm opacity-65">{item.material_code}</td>
                  <td className="p-4 text-sm opacity-65">{item.name}</td>
                  <td className="p-4 text-sm opacity-65">{item.hsn_code}</td>
                  {/* <td className="p-4 text-sm opacity-65">{item.rate_before_tax}</td> */}
                  <td className="p-4 opacity-65">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold capitalize rounded-full ${item.status == 1 ? "text-green-500" : "text-red-500"}`}
                    >
                      {item.status == 1 ? "Available" : "Unavailable"}
                    </span>
                  </td>
                  {
                    (!materialMaster.edit && !materialMaster.delete) ?
                      "" :
                      <td className="p-4 text-right space-x-5 flex justify-center opacity-65">
                        {
                          materialMaster.edit && <button onClick={() => handleEdit(item)} className=" hover:text-gray-700">
                            <FiEdit2 size={20} />
                          </button>
                        }

                        {
                          materialMaster.delete && <button onClick={() => handleDelete(item.id)} className=" hover:text-gray-700">

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
                  <td colSpan="5" className="py-10 text-center text-gray-500 text-sm">
                    No Data Available
                  </td>
                </tr>
              }

              {isLoading && (
                <tr>
                  <td colSpan="5" className="py-10 text-center">
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

export default MaterialMaster