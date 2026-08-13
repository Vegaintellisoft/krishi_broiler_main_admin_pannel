import React, { useEffect, useState } from 'react'
import { Link, Links } from 'react-router-dom'
import { RiArrowUpSFill, RiDeleteBin6Line, RiSearchLine } from 'react-icons/ri'
import { IoCloseSharp } from "react-icons/io5";
import { LuImport } from 'react-icons/lu'
import axios from 'axios';
import Swal from "sweetalert2";
import ExcelExport from '../utils/ExcelExport'
import { FiEdit2 } from 'react-icons/fi';
import { CustomDropdown } from '../components/CustomDropdown';
import { useAuth } from '../auth/AuthContext';


const POMaster = () => {

  const { getPermissions } = useAuth();
  const { purchaseOrder } = getPermissions();

  const [data, setData] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  const [materialOption, setMaterialOption] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [statusOption, setStatusOption] = useState([
    { label: 'Pending', value: 1 },
    { label: 'In-Transit', value: 2 },
    { label: 'Active', value: 3 },
    { label: 'Close', value: 4 },
  ])

  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(0);
  const [noOfBags, setNoOfBags] = useState(0);

  const [updatePoId, setUpdatePoId] = useState("")

  const [materialList, setMaterialList] = useState([]);
  const [unitList, setUnitList] = useState([]);

  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    po_no: "",
    supplier_id: "",
    bill_no: "",
    materials: [],
    rr_no: "",
    status: 1

  });

  const fetchDropdownData = async () => {
    try {
      const { data: matData } = await axios.get(`/material/getAll`);
      if (matData.status === true) {
        const formattedData = matData.data.map(item => ({
          label: item.name,
          value: `${item.name},${item.id}`,
        }));
        setMaterialOption(formattedData);
      } else {
        setMaterialOption([]);
      }

      const { data: supplierData } = await axios.get(`/supplier/getAll`);
      if (supplierData.status === true) {
        const formattedData = supplierData.data.map(item => ({
          label: item.name,
          value: item.id,
        }));
        setSuppliers(formattedData);
      } else {
        setSuppliers([]);
      }

      const { data: unitData } = await axios.get(`/unit/getAll`);
      if (unitData.status === true) {
        const formattedData = unitData.data.map(item => ({
          label: item.unit,
          value: `${item.unit},${item.id}`,
        }));
        setUnitList(formattedData);
      } else {
        setUnitList([]);
      }

    } catch (err) {
      console.error("Error loading dropdown data:", err);
    }
  };



  useEffect(() => {
    fetchPOMaster();
    fetchDropdownData()
  }, []);

  const fetchPOMaster = async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get("/po/getAll");

      const updatedData = data.data.map((item) => {
        const materialNames = item.materials.map(
          (mat) => `${mat.name} [₹${mat.price}]`
        );
        return {
          ...item,
          material_view: materialNames.join(', '),
        };
      });

      setData(updatedData);

    }
    catch (err) {
      console.log("Error fetching PO master:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (item) => {

    try {

      setFormData({
        po_no: item.po_no,
        supplier_id: item.supplier__id,
        bill_no: item.bill_no,
        materials: [],
        rr_no: item.rr_no,
        status: item.status
      });

      setUpdatePoId(item.id)

      setMaterialList(item.materials);

      // await fetchDropdownData(item.rr_no);

      setIsOpen(true);

    } catch (error) {
      console.log("server error: ", error)
    } finally {
      // setLoadingId(null)
    }
  };


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
          const { data } = await axios.delete(`/po/delete/${id}`);
          if (data.status) {
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "Successfullly deleted.",
              showConfirmButton: false,
              timer: 3000
            });

            fetchPOMaster();
          }
        } catch (err) {
          console.log("Error deleting data:", err);
        }
      }
    });
  };

  const handleAddMaterial = () => {
    if (!selectedMaterial || !quantity || !price || !noOfBags) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Please fill all material data.",
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    const mat_id = selectedMaterial.split(',')[1]


    const isAlreadyAdded = materialList.some(item => item.mat_id === mat_id);
    if (isAlreadyAdded) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "This material is already added / delete and change qty.",
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }


    const newId = materialList.length > 0 ? materialList[materialList.length - 1].id + 1 : 1;

    const newItem = {
      id: newId,
      mat_id: selectedMaterial.split(',')[1],
      name: selectedMaterial.split(',')[0],
      quantity: parseInt(quantity, 10),
      price: parseFloat(price, 10),
      noOfBags: parseFloat(noOfBags, 10),
      unit_id: selectedUnit.split(',')[1],
      unit_name: selectedUnit.split(',')[0],
    };

    setMaterialList(prev => [...prev, newItem]);
    setSelectedMaterial('');
    setQuantity('');
    setPrice('');
    setNoOfBags('')
    setSelectedUnit('');


  };



  const handleDeleteMaterial = (id) => {
    const updated = materialList.filter((mat) => mat.id !== id);
    setMaterialList(updated);
  };



  const handleExport = () => {
    ExcelExport(data, "PO_Master.xlsx");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitLoading(true)

    const trimmedFormData = {
      po_no: formData.po_no.trim(),
      rr_no: formData.rr_no.trim(),
      bill_no: formData.bill_no.trim(),
      supplier__id: formData.supplier_id,
      materials: materialList,
      status: formData.status
    };

    // Validation
    if (
      !trimmedFormData.rr_no ||
      !trimmedFormData.po_no ||
      !trimmedFormData.bill_no ||
      !trimmedFormData.supplier__id ||
      trimmedFormData.materials.length === 0
    ) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Please fill all required fields and add at least one material",
        showConfirmButton: false,
        timer: 2000
      });
      setIsSubmitLoading(false)
      return;
    }

    try {
      const { data } = await axios.put(`/po/update/${updatePoId}`, trimmedFormData);
      if (data.status == true) {
        await fetchPOMaster();

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Po updated successfully",
          showConfirmButton: false,
          timer: 2000
        });

      }
      else {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Something Error, Try Again",
          showConfirmButton: false,
          timer: 2000
        });
      }


    }
    catch (error) {
      console.error("Error update po:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Something went wrong. Please try again."
      });
    } finally {
      setIsSubmitLoading(false)
      closeModal()
    }
  };



  const filteredData = data.filter((item) => {
    return (
      item.po_no.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bill_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.material_view.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rr_no.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  function closeModal() {
    setIsOpen(false);
    setFormData({
      po_no: "",
      supplier_id: "",
      bill_no: "",
      materials: [],
      rr_no: "",
      status: 1
    });


  }


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
            <div className="flex justify-between border-b py-1">
              <h1 className="header text-lg font-semibold">Edit PO</h1>
              <button
                className=" text-white flex justify-center bg-primary rounded-full w-7 h-7 items-center"
                onClick={closeModal}
              >
                <IoCloseSharp />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-x-5 mt-2 gap-y-2">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Order No</label>
                <input
                  type="text"
                  name="po_no"
                  value={formData.po_no}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <CustomDropdown
                  label="Supplier Name"
                  options={suppliers}
                  value={formData.supplier_id}
                  onChange={(val) => setFormData(prev => ({ ...prev, supplier_id: val }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bill No</label>
                <input
                  type="text"
                  name="bill_no"
                  value={formData.bill_no}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RR NO</label>
                <input
                  type="text"
                  name="rr_no"
                  value={formData.rr_no}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <CustomDropdown
                  label="Status"
                  options={statusOption}
                  value={formData.status}
                  onChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                  statusColor={`border ${formData.status == 1
                    ? "border-yellow-700 bg-yellow-50"
                    : formData.status == 2
                      ? "border-blue-700 bg-[#edf3ff]"
                      : formData.status == 3
                        ? "border-green-700 bg-green-50"
                        : formData.status == 4
                          ? "border-red-700 bg-red-50"
                          : "border-gray-400 bg-gray-50"
                    }`}

                />
              </div>

              <div className='border col-span-3 rounded-lg p-3'>
                {/* <div className='flex items-center justify-between gap-x-6'> */}
                <div className='grid-cols-3 grid gap-x-5'>

                  <div className='w-full'>
                    <CustomDropdown
                      label="Materials"
                      options={materialOption}
                      value={selectedMaterial}
                      onChange={(val) => setSelectedMaterial(val)}
                    />
                  </div>


                  <div className='w-full'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      value={quantity}
                      className="w-full p-3 py-2.5 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder='Enter Material Quantity'
                    />
                  </div>

                  <CustomDropdown
                    label="Unit"
                    options={unitList}
                    value={selectedUnit}
                    onChange={(val) => setSelectedUnit(val)}
                  />

                  <div className='w-full'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      name="price"
                      value={price}
                      className="w-full p-3 py-2.5 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder='Enter Material Price'
                    />
                  </div>

                  <div className='w-full'>
                    <label className="block text-sm font-medium text-gray-700 mb-2">No Of Bags</label>
                    <input
                      type="number"
                      name="bags"
                      value={noOfBags}
                      className="w-full p-3 py-2.5 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      onChange={(e) => setNoOfBags(e.target.value)}
                      placeholder='Enter No Of Bags'
                    />
                  </div>

                  <button
                    className="px-3 self-end w-1/2 py-3 text-sm bg-primary text-white rounded hover:bg-orange-600 transition"
                    onClick={handleAddMaterial}
                    type="button"
                  >
                    Add Item
                  </button>
                </div>

                <div className="w-full mt-4 text-sm border">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="p-2">S.No</th>
                        <th className="p-2">Material</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Quantity</th>
                        <th className="p-2">Bags</th>
                        <th className="p-2">Action</th>
                      </tr>
                    </thead>
                  </table>

                  <div className="h-16 overflow-y-auto">
                    <table className="w-full table-fixed">
                      <tbody>
                        {materialList.map((mat, idx) => (
                          <tr key={mat.id}>
                            <td className="p-2 text-center">{idx + 1}</td>
                            <td className="p-2 text-center">{mat.name}</td>
                            <td className="p-2 text-center">{mat.price}</td>
                            <td className="p-2 text-center">{mat.quantity} {mat.unit_name}</td>
                            <td className="p-2 text-center">{mat.noOfBags}</td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleDeleteMaterial(mat.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>



              </div>


            </div>

            <div className="flex justify-between gap-24 mt-2">
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
                disabled={isSubmitLoading}
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
          <h1 className="text-xl font-bold text-gray-900">Purchase Order</h1>
          <div className="flex items-center gap-x-2 text-sm text-gray-500 ">
            <Link to="/" className='text-orange-500'>Dashboard</Link>
            <span>
              <RiArrowUpSFill className='rotate-90 ' size={20} />
            </span>
            <span>Puchase Order</span>
          </div>
          <div className="flex items-center justify-between">
            <div className=" space-x-4  flex">
              <div>
                <span className='absolute'>
                  <RiSearchLine className='ms-2 mt-2 opacity-45' />
                </span>
                <input
                  type="search"
                  placeholder="Search PO..."
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

              {/* <button className="px-4 py-2 bg-orange-500 text-white border rounded-lg  hover:text-white" onClick={openModal}>
                <div className='flex items-center gap-2 text-xs' >
                  <LuPlus size={16} />
                  <span >Add Data</span>
                </div>
              </button> */}

            </div>
          </div>

        </div>

        <div className={`overflow px-6 mx-4 mt-5 bg-white`}>

          <table className={`w-full`}>
            <thead className='font-poppins font-semibold'>
              <tr className="border-b">
                <th className="p-4 text-center text-sm text-black">S.No</th>
                <th className="p-4 text-center text-sm text-black">PO No</th>
                <th className="p-4 text-center text-sm text-black">Supplier Name</th>
                <th className="p-4 text-center text-sm text-black">Bill No</th>
                <th className="p-4 text-center text-sm text-black">RR No</th>
                <th className="p-4 text-center text-sm text-black">Status</th>
                <th className="p-4 text-center text-sm text-black">Materials</th>
                {
                  (!purchaseOrder?.edit && !purchaseOrder?.delete) ? "" : <th className="p-4 text-center text-sm text-black">Actions</th>
                }

              </tr>
            </thead>
            <tbody className="divide-y font-poppins">
              {paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 text-center">
                  <td className="p-4 text-sm opacity-65">{startIndex + index + 1}</td>
                  <td className="p-4 text-sm opacity-65">{item.po_no}</td>
                  <td className="p-4 text-sm w-[20%] opacity-65">{item.supplier_name}</td>
                  <td className="p-4 text-sm opacity-65">{item.bill_no}</td>
                  <td className="p-4 text-sm opacity-65">{item.rr_no}</td>
                  {/* <td className="p-4 text-sm opacity-65">{item.st}</td> */}

                  <td className="p-4 text-sm opacity-65">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold capitalize rounded-full
      ${item.status === 1
                          ? 'bg-yellow-100 text-yellow-800'
                          : item.status === 2
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 3
                              ? 'bg-green-100 text-green-700'
                              : item.status === 4
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {item.status === 1
                        ? 'Pending'
                        : item.status === 2
                          ? 'In-Transit'
                          : item.status === 3
                            ? 'Active'
                            : item.status === 4
                              ? 'Closed'
                              : 'Unknown'}
                    </span>
                  </td>

                  <td className="p-4 opacity-65 w-[20%] text-sm">{item.material_view}</td>
                  {
                    (!purchaseOrder?.edit && !purchaseOrder?.delete) ?
                      ""
                      :
                      <td className="p-4 text-right space-x-5 flex justify-center opacity-65">
                        {
                          purchaseOrder?.edit && <button onClick={() => handleEdit(item)} className=" hover:text-gray-700">
                            <FiEdit2 size={20} />
                          </button>
                        }

                        {
                          purchaseOrder?.delete && <button onClick={() => handleDelete(item.id)} className=" hover:text-gray-700">

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
                  <td colSpan="8" className="py-10 text-center text-gray-500 text-sm">
                    No Data Available
                  </td>
                </tr>
              }

              {isLoading && (
                <tr>
                  <td colSpan="8" className="py-10 text-center">
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

export default POMaster