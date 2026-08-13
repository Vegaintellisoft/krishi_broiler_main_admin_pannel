import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { RiArrowUpSFill, RiDeleteBin6Line, RiSearchLine } from 'react-icons/ri'
import { LuImport } from 'react-icons/lu'
import { TbEdit } from "react-icons/tb";
import axios from 'axios';
import Swal from 'sweetalert2'
import ExcelExport from '../utils/ExcelExport'
import { CustomDropdown } from '../components/CustomDropdown'
import { IoCloseSharp } from 'react-icons/io5'
import { useAuth } from '../auth/AuthContext'

const DC = () => {

    const { getPermissions, getLocationId, user } = useAuth();
    const { deliveryChallan, adminPage } = getPermissions();
    const location_id = getLocationId();

    const [data, setData] = useState([])
    const [searchQuery, setSearchQuery] = useState("");
    const [tokenNo, setTokenNo] = useState(null);
    const [docNo, setDocNo] = useState(null);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [isUploadOpen, setIsUploadOpen] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isPageLoading, setIsPageLoading] = useState(false)
    const [isSubmitLoading, setIsSubmitLoading] = useState(false)
    const [loadingId, setLoadingId] = useState(null);

    const [selectedMaterial, setSelectedMaterial] = useState("")
    const [quantity, setQuantity] = useState(0);
    const [dcId, setDcId] = useState(0);

    const [rrOptions, setRROptions] = useState([]);
    const [materialOption, setMaterialOption] = useState([]);
    const [shipToOptions, setShipToOptions] = useState([]);
    const [dispatchOptions, setDispatchOptions] = useState([]);

    const cancelReasons = [
        { label: "Item quantity was wrongly entered", value: "Item quantity was wrongly entered" },
        { label: "Vehicle No. wrongly entered", value: "Vehicle No. wrongly entered" },
        { label: "Delivery place wrongly entered", value: "Delivery place wrongly entered" },
        { label: "Plan Changed in Delivery", value: "Plan Changed in Delivery" },
        { label: "Duplicate Entry", value: "Duplicate Entry" },
        { label: "Material rejected", value: "Material rejected" },
        { label: "Other", value: "Other" }
    ];

    const [selectedReason, setSelectedReason] = useState('');
    const [otherReason, setOtherReason] = useState('');


    const [materialList, setMaterialList] = useState([]);
    const [units, setUnits] = useState('');


    const [formData, setFormData] = useState({
        rr_no: "",
        dispatchFromId: "",
        ship_to__id: "",
        materials: [],
        truck_no: "",
    });

    const fetchDropdownData = async (rrNo) => {
        try {
            const { data: poData } = await axios.get(`/po/getAll`);
            const rr = poData.data;
            const rrOptions = rr.map((po) => ({
                label: po.rr_no,
                value: po.rr_no
            }));

            let material = [];
            rr.forEach((po) => {
                if (po.rr_no === rrNo) {
                    po.materials.forEach((materialObj) => {

                        const { mat_id, name, quantity, unit_name } = materialObj;
                        material.push({ label: name, value: `${mat_id},${quantity},${name},${unit_name}` });
                    });
                }
            }
            );

            const { data: shipData } = await axios.get(`/shipping/getAll`);
            const shipTo = shipData.data;
            const shipToOptions = shipTo.map((st) => ({
                label: st.address.full_address,
                value: st.id
            }));

            const { data: dispatchRes } = await axios.get(`/source/getAll`);
            const dispatch = dispatchRes.data;
            const dispatchOptions = dispatch.map((st) => ({
                label: st.address.full_address,
                value: st.id
            }));

            setRROptions(rrOptions);
            setShipToOptions(shipToOptions);
            setDispatchOptions(dispatchOptions);
            setMaterialOption(material);

        } catch (err) {
            console.error("Error loading dropdown data:", err);
        }
    };


    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value
        }));
    };

    const fetchDCData = async () => {
        setIsLoading(true)
        try {
            const loc_id = adminPage?.showAllCategories === true ? null : location_id;
            const { data } = await axios.get(`/dc/getAll/${loc_id}`);
            setData(data.data);
        }
        catch (err) {
            console.log("Error fetching DC data:", err)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchDCData();
        fetchDropdownData();
    }, []);

    useEffect(() => {
        const units = selectedMaterial?.split(',')[3]
        setUnits(units)
    }, [selectedMaterial])

    const viewChallan = async (dcData) => {
        setIsPageLoading(true)
        try {
            const { data } = await axios.post(`/dc/getChallanByView`, { dcData });
            const pdfLink = data.pdfLink;
            if (pdfLink) {
                window.open(pdfLink, '_blank');
            } else {
                console.error('PDF link is not available.');
            }
        } catch (error) {
            console.error('Error fetching the PDF:', error);
        } finally {
            setIsPageLoading(false)
        }
    }

    const handleCancelDc = async (e) => {
        e.preventDefault();
        setIsSubmitLoading(true)
        try {
            const finalReason = selectedReason === "Other" ? otherReason : selectedReason;

            const { data } = await axios.put(`/dc/cancelDc/${dcId}`, { status: 2, reason: finalReason })
            if (data.status == true) {
                await fetchDCData();
                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: `DC Cancelled Successfully.`,
                    showConfirmButton: false,
                    timer: 2000
                });
            }

        } catch (error) {
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "DC cancellation Error... Try Again",
                showConfirmButton: false,
                timer: 2000
            });
        } finally {
            setIsSubmitLoading(false)
            closeModal()
        }
    };

    const handleAddMaterial = () => {
        if (!selectedMaterial || !quantity) {
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: "Please select a material and enter a quantity.",
                showConfirmButton: false,
                timer: 2000
            });
            return;
        }



        const [mat_id, rawQty, name, unit_name] = selectedMaterial.split(',');
        const matQty = parseInt(rawQty, 10);
        const enteredQty = parseInt(quantity, 10);


        if (enteredQty > matQty) {
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "error",
                title: `Only ${matQty} is available.`,
                showConfirmButton: false,
                timer: 2000
            });
            return;
        }

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


        const balanceQty = matQty - enteredQty;

        Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: `Balance quantity: ${balanceQty}`,
            showConfirmButton: false,
            timer: 2000
        });

        const newId = materialList.length > 0 ? materialList[materialList.length - 1].id + 1 : 1;

        const newItem = {
            id: newId,
            mat_id,
            name,
            quantity: enteredQty,
            unit_name: unit_name
        };

        setMaterialList(prev => [...prev, newItem]);
        setSelectedMaterial('');
        setQuantity('');


    };



    const handleDeleteMaterial = (id) => {
        const updated = materialList.filter((mat) => mat.id !== id);
        setMaterialList(updated);
    };



    const handleEdit = async (item) => {
        setLoadingId(item.token_no)
        try {

            setFormData({
                rr_no: item.rr_no,
                dispatchFromId: item.dispatch_from_id,
                ship_to__id: item.ship_to__id,
                materials: [],
                truck_no: item.truck_no,
            });

            setMaterialList(item.materials);
            setTokenNo(item.token_no);
            setDocNo(item.doc_no)

            await fetchDropdownData(item.rr_no);

            setIsOpen(true);

        } catch (error) {
            console.log("server error: ", error)
        } finally {
            setLoadingId(null)
        }
    };




    const handleExport = () => {
        ExcelExport(data, "Delivery_Challan.xlsx");
    };


    function closeModal() {
        setIsOpen(false);
        setOtherReason('')
        setSelectedReason('')

    }

    const handleSubmit = async (e) => {
        e.preventDefault();

        setIsSubmitLoading(true)

        // Trim values
        const trimmedFormData = {
            rr_no: formData.rr_no.trim(),
            dispatchFromId: formData.dispatchFromId,
            ship_to__id: formData.ship_to__id,
            truck_no: formData.truck_no.trim(),
            materials: materialList,
            token_no: tokenNo,
            doc_no: docNo
        };


        // Validation
        if (
            !trimmedFormData.rr_no ||
            !trimmedFormData.dispatchFromId ||
            !trimmedFormData.ship_to__id ||
            !trimmedFormData.truck_no ||
            !trimmedFormData.token_no ||
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
            const { data } = await axios.post(`/dc/getChallan`, { dcData: trimmedFormData });
            if (data.status == true) {
                await fetchDCData();

                Swal.fire({
                    toast: true,
                    position: "top-end",
                    icon: "success",
                    title: "Challan updated successfully",
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
            console.error("Error fetching challan:", error);
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
            item.rr_no.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.ship_to__id.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.token_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
            String(item.truck_no).toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.materials[0].name.toString().toLowerCase().includes(searchQuery.toLowerCase())
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

            {isPageLoading && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                </div>
            )}

            {modalIsOpen ? (
                <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
                    <form
                        className="px-6 py-4 font-poppins rounded-lg bg-white w-[60em] shadow-lg"
                        onSubmit={handleCancelDc}
                    >
                        <div className="flex justify-between border-b py-2">
                            <h1 className="header text-lg font-semibold">Cancel DC</h1>
                            <button
                                className=" text-white flex justify-center bg-primary rounded-full w-7 h-7 items-center"
                                onClick={closeModal}
                            >
                                <IoCloseSharp />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 mt-2 gap-y-2">

                            <div>
                                <CustomDropdown
                                    label="Reason"
                                    options={cancelReasons}
                                    value={selectedReason}
                                    onChange={(val) => setSelectedReason(val)}
                                />
                            </div>

                            {selectedReason === "Other" && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Enter Reason</label>
                                    <input
                                        type="text"
                                        name="other_reason"
                                        value={otherReason}
                                        onChange={(e) => setOtherReason(e.target.value)}
                                        className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                                        placeholder="Enter custom reason"
                                    />
                                </div>
                            )}


                        </div>

                        <div className="flex justify-between gap-5 mt-8 mb-2">
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
                    <h1 className="text-xl font-bold text-gray-900">Delivery Challan</h1>
                    <div className="flex items-center gap-x-2 text-sm text-gray-500 ">
                        <Link to="/" className='text-orange-500'>Dashboard</Link>
                        <span>
                            <RiArrowUpSFill className='rotate-90 ' size={20} />
                        </span>
                        <span>Delivery Challan</span>
                    </div>
                    <div className="flex items-center justify-between">
                        <div className=" space-x-4  flex">
                            <div>
                                <span className='absolute'>
                                    <RiSearchLine className='ms-2 mt-2 opacity-45' />
                                </span>
                                <input
                                    type="search"
                                    placeholder="Search Dc..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className=" py-2 px-2 ps-10 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                                />
                            </div>
                        </div>

                        <div className='space-x-5 flex'>

                            <button onClick={handleExport} className="px-4 py-2 bg-[#EFE8E0] text-[#F3890A] border rounded-lg hover:bg-orange-500 hover:text-white">
                                <div className="flex gap-2 items-center text-xs ">
                                    <LuImport size={16} className='opacity-50' />
                                    <span>Export</span>
                                </div>
                            </button>



                        </div>
                    </div>

                </div>

                <div className={`overflow px-6 mx-4 mt-5 bg-white`}>
                    <table className="w-full border-collapse">
                        <thead className="font-poppins font-semibold bg-white sticky top-0 z-10">
                            <tr className="border-b">
                                <th className="p-4 text-center text-sm text-black bg-white">S.No</th>
                                <th className="p-4 text-center text-sm text-black bg-white">RR No</th>
                                <th className="p-4 text-center text-sm text-black bg-white">Token No</th>
                                <th className="p-4 text-center text-sm text-black bg-white">Ship To</th>
                                <th className="p-4 text-center text-sm text-black bg-white">Truck No</th>
                                <th className="p-4 text-center text-sm text-black bg-white">Material</th>
                                <th className="p-4 text-center text-sm text-black bg-white">Status</th>
                                <th className="p-4 text-center text-sm text-black bg-white">Arrived Status</th>
                                {
                                    (!deliveryChallan?.view && !deliveryChallan?.cancel) ? "" : <th className="p-4 text-center text-sm text-black bg-white">Actions</th>
                                }

                            </tr>
                        </thead>
                        <tbody className="divide-y font-poppins">
                            {paginatedData.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 text-center">
                                    <td className="p-4 text-sm opacity-65">{startIndex + index + 1}</td>
                                    <td className="p-4 text-sm opacity-65">{item.rr_no}</td>
                                    <td className="p-4 text-sm opacity-65">{item.token_no}</td>
                                    <td className="p-4 text-sm opacity-65">{item.sap_name}</td>
                                    <td className="p-4 text-sm opacity-65">{item.truck_no}</td>
                                    <td className="p-4 text-sm opacity-65">
                                        {item.materials?.map((m) => m.name).join(', ')}
                                    </td>

                                    <td className="p-4 text-sm opacity-65">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold capitalize rounded-full
      ${item.status === 1
                                                    ? 'bg-green-100 text-green-800'
                                                    : item.status === 2
                                                        ? 'bg-red-100 text-red-800'
                                                        : item.status === 3
                                                            ? 'bg-orange-100 text-orange-800'
                                                            : 'bg-gray-100 text-gray-700'
                                                }`}
                                        >
                                            {item.status === 1
                                                ? 'Active'
                                                : item.status === 2
                                                    ? 'Cancelled' :
                                                    item.status === 3
                                                        ? 'Pending'
                                                        : 'Unknown'}
                                        </span>
                                    </td>

                                    <td className="p-4 text-sm opacity-65">
                                        <span
                                            className={`inline-flex px-2 py-1 text-xs font-semibold capitalize rounded-full
                                            ${item?.is_arrived
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-orange-100 text-orange-800'
                                                }
                                            `}
                                        >{item?.is_arrived ? "Yes" : "No"}</span>
                                    </td>

                                    {
                                        (!deliveryChallan?.view && !deliveryChallan?.cancel) ?
                                            ""
                                            :
                                            <td className="p-4 flex justify-center items-center space-x-3">

                                                {/* <button
                                            onClick={() => handleEdit(item)}
                                            className="px-3 py-1.5 flex justify-center items-center gap-1 text-sm bg-primary text-white rounded hover:bg-orange-600 transition"
                                            disabled={loadingId === item.token_no}
                                        >
                                            {loadingId === item.token_no ? (
                                                <>
                                                    <svg
                                                        className="animate-spin h-4 w-4 text-white"
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
                                                </>
                                            ) : (
                                                <TbEdit size={16} />
                                            )}

                                        </button> */}

                                                {
                                                    deliveryChallan?.view && <button
                                                        onClick={() => viewChallan(item)}
                                                        className={`px-3 py-1 text-sm ${item.status == 3 ? "bg-gray-400" : "bg-primary hover:bg-orange-600"} text-white rounded transition`}
                                                        disabled={item.status === 3}
                                                    >
                                                        View
                                                    </button>
                                                }

                                                {
                                                    deliveryChallan?.cancel && <button
                                                        onClick={() => {
                                                            setDcId(item.id)
                                                            setIsOpen(true)
                                                        }}
                                                        disabled={item.status == 2 || item.status == 3}
                                                        className={`px-3 py-1 text-sm ${item.status == 2 || item.status == 3 ? "bg-gray-400" : "bg-red-600 hover:bg-red-700"}  text-white rounded  transition`}
                                                    >
                                                        Cancel
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
        </div >
    )
}

export default DC