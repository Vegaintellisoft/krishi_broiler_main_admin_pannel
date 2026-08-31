import React, { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { RiArrowUpSFill, RiSearchLine, RiDeleteBin6Line } from 'react-icons/ri'
import { LuImport, LuPlus } from 'react-icons/lu'
import { FiEdit2, FiEye, FiSave } from 'react-icons/fi'
import { FiUploadCloud } from 'react-icons/fi'
import Swal from "sweetalert2";
import axios from 'axios'
import SupplyModal from './SupplyModal'
import BillOfSupplyEditModal from './BillOfSupplyEditModal'
import { useAuth } from '../../../../auth/AuthContext'
import ExcelExport from '../../../../utils/ExcelExport'
import { formatDate } from '../../../../utils/helper'

const BroilerSupply = () => {
    // --- Permissions ---
    const { getPermissions } = useAuth();
    // Assuming permission key is 'broilerSupply'
    const { broilerSupply } = getPermissions();

    // --- State Management ---
    const [data, setData] = useState([]);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [submittingDocNo, setSubmittingDocNo] = useState(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [rateEdits, setRateEdits] = useState({});
    const [savingDocNo, setSavingDocNo] = useState(null);
    const [sapPostDates, setSapPostDates] = useState({}); // { [doc_no]: 'YYYY-MM-DD' }
    // Lookup maps: customer_no / farmer_no → name
    const [customerMap, setCustomerMap] = useState({});
    const [farmerMap, setFarmerMap] = useState({});
    // Plant filter
    const [plants, setPlants] = useState([]);
    const [selectedPlant, setSelectedPlant] = useState('');
    const [selectedDate, setSelectedDate] = useState('');   // YYYY-MM-DD (internal)
    const [selectedDateDisplay, setSelectedDateDisplay] = useState(''); // DD-MM-YYYY (shown)
    const dateInputRef = useRef(null);

    const [allowedDays, setAllowedDays] = useState(3);

    const getMinDateString = (days) => {
        const d = new Date();
        d.setDate(d.getDate() - days);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    const getMaxDateString = () => {
        const d = new Date();
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    // Min allowed SAP post date = the bill (DC) date itself
    const getMinAllowedDateForDC = (dcDateStr) => {
        if (!dcDateStr) return getMaxDateString();
        const d = new Date(dcDateStr);
        if (isNaN(d.getTime())) return getMaxDateString();
        d.setHours(0, 0, 0, 0);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    // Max allowed SAP post date = bill_date + allowedDays
    const getMaxAllowedDateForDC = (dcDateStr, days) => {
        if (!dcDateStr) return getMaxDateString();
        const d = new Date(dcDateStr);
        if (isNaN(d.getTime())) return getMaxDateString();
        d.setHours(0, 0, 0, 0);
        d.setDate(d.getDate() + Number(days || 5));
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    // Returns the DC/bill date as YYYY-MM-DD string
    const getDCDateString = (dcDateStr) => {
        if (!dcDateStr) return getMaxDateString();
        const d = new Date(dcDateStr);
        if (isNaN(d.getTime())) return getMaxDateString();
        d.setHours(0, 0, 0, 0);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${y}-${m}-${day}`;
    };

    // --- Fetch Data ---
    useEffect(() => {
        fetchData();
        fetchLookups();
        fetchSapPostDateConfig();
    }, []);

    const fetchSapPostDateConfig = async () => {
        try {
            const res = await axios.get('broiler/sap-post-date-config');
            if (res.data?.status && res.data?.data) {
                setAllowedDays(Number(res.data.data.allowed_days));
            }
        } catch (err) {
            console.warn('Could not load SAP post date config:', err.message);
        }
    };

    // Fetch all customers (D* = type C) and farmers (FSZ* = type F) once
    // and build lookup maps so codes are resolved to names across ALL pages.
    const fetchLookups = async () => {
        try {
            const [custRes, farmRes, plantRes] = await Promise.allSettled([
                axios.get('broiler/farmer/get-customer/all'),
                axios.get('broiler/farmer/get-customer/F'),
                axios.get('broiler/plant/getAll'),
            ]);

            const custMap = {};
            if (custRes.status === 'fulfilled' && custRes.value.data?.success) {
                custRes.value.data.data.forEach(c => {
                    if (c.customer_no) custMap[c.customer_no] = c.customer_name || c.customer_no;
                });
            }
            setCustomerMap(custMap);

            const farmMap = {};
            if (farmRes.status === 'fulfilled' && farmRes.value.data?.success) {
                farmRes.value.data.data.forEach(f => {
                    if (f.customer_no) farmMap[f.customer_no] = f.customer_name || f.customer_no;
                });
            }
            setFarmerMap(farmMap);

            if (plantRes.status === 'fulfilled' && plantRes.value.data?.success) {
                setPlants(plantRes.value.data.data || []);
            }
        } catch (err) {
            console.warn('Could not load customer/farmer lookups:', err.message);
        }
    };

    // Resolve a customer code & name to a display string.
    const resolveCustomerName = (item) => {
        const custDetails = (() => {
            const d = item.customer_details || item.raw_data?.customer_details || {};
            if (typeof d === 'string') { try { return JSON.parse(d); } catch { return {}; } }
            return d;
        })();

        const code = item.customer || item.raw_data?.customer || custDetails?.customer_no || null;

        const name =
            (item.customer_name && item.customer_name !== code ? item.customer_name : null) ||
            custDetails?.customer_name ||
            custDetails?.name1 ||
            (code ? customerMap[code] : null) ||
            (code ? farmerMap[code] : null) ||
            item.raw_data?.customer_name ||
            null;

        if (code && name && name !== code) {
            return `${code} - ${name}`;
        }
        if (name) {
            return name;
        }
        if (code) {
            return code;
        }
        return '-';
    };

    const resolveFarmerName = (item) => {
        const farmDetails = (() => {
            const d = item.farmer_details || item.raw_data?.farmer_details || {};
            if (typeof d === 'string') { try { return JSON.parse(d); } catch { return {}; } }
            return d;
        })();

        const code = item.farmer || item.raw_data?.farmer || farmDetails?.farmer_supplier || null;

        const name =
            (item.farmer_name && item.farmer_name !== code ? item.farmer_name : null) ||
            farmDetails?.farmer_name ||
            farmDetails?.name1 ||
            (code ? farmerMap[code] : null) ||
            (code ? customerMap[code] : null) ||
            item.raw_data?.farmer_name ||
            null;

        if (code && name && name !== code) {
            return `${code} - ${name}`;
        }
        if (name) {
            return name;
        }
        if (code) {
            return code;
        }
        return '-';
    };


    const fetchData = async () => {
        setIsLoading(true);
        const res = await axios.get("broiler/bill-of-supply/getAll");
        console.log("Bill of supply response : ", res)

        if (res.data.status) {
            const parsedData = (res.data.data || []).map(item => {
                let parsedRaw = item.raw_data;
                if (typeof parsedRaw === 'string') {
                    try {
                        parsedRaw = JSON.parse(parsedRaw);
                    } catch (e) {
                        parsedRaw = {};
                    }
                }
                return {
                    ...item,
                    rate: item.rate !== undefined && item.rate !== null ? item.rate : parsedRaw?.rate,
                    raw_data: parsedRaw
                };
            });
            setData(parsedData);
        } else {
            setData([]);
        }
        setIsLoading(false);
        // setTimeout(() => {
        //     setData([
        //         { 
        //             id: 1, 
        //             date: '2025-10-24', 
        //             dcNo: 'DC-1001', 
        //             customer: 'Chicken Center A', 
        //             farmer: 'FARM-001 | Krishnan', 
        //             birdQty: 200, 
        //             weight: 450, 
        //             billValue: 45000, 
        //             status: 'Dispatched' 
        //     ]);
        //     setIsLoading(false);
        // }, 500);
    };

    // --- Handlers ---

    const openModal = (item = null) => {
        setSelectedItem(item);
        setIsOpen(true);
    };

    const closeModal = () => {
        setIsOpen(false);
        setSelectedItem(null);
    };

    const openEditModal = (item) => {
        setEditItem(item);
        setEditModalOpen(true);
    };

    const closeEditModal = () => {
        setEditModalOpen(false);
        setEditItem(null);
    };

    const handleRateChange = (docNo, value) => {
        setRateEdits(prev => ({ ...prev, [docNo]: value }));
    };

    const handleSaveRate = async (item) => {
        const newRate = rateEdits[item.doc_no] !== undefined ? rateEdits[item.doc_no] : (item.rate ?? item.raw_data?.rate);
        if (!item.doc_no) return;
        if (!newRate || Number(newRate) <= 0) {
            Swal.fire({ icon: "error", title: "Invalid rate", text: "Rate must be greater than 0." });
            return;
        }

        try {
            setSavingDocNo(item.doc_no);
            const customerType = item.customer_type || item.raw_data?.customer_type || 'all';
            const customer = item.customer || item.raw_data?.customer || '';
            const customerDetails = item.raw_data?.customer_details || null;

            const res = await axios.put('broiler/bill-of-supply/update', {
                rate: Number(newRate),
                customer_type: customerType,
                customer: customer,
                customer_details: customerDetails
            }, {
                params: { doc_no: item.doc_no }
            });

            if (res.data?.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Rate updated successfully.',
                    timer: 1500,
                    showConfirmButton: false
                });
                setRateEdits(prev => {
                    const next = { ...prev };
                    delete next[item.doc_no];
                    return next;
                });
                fetchData();
            } else {
                Swal.fire({ icon: 'error', title: 'Update failed', text: res.data?.message || 'Could not update record.' });
            }
        } catch (err) {
            console.error('Update error:', err);
            Swal.fire({ icon: 'error', title: 'Update failed', text: err?.response?.data?.message || err.message || 'Could not update record.' });
        } finally {
            setSavingDocNo(null);
        }
    };

    const handleSapPostDateChange = (docNo, value) => {
        setSapPostDates(prev => ({ ...prev, [docNo]: value }));
    };

    const handleSubmit = async (item) => {
        if (!item?.doc_no) {
            Swal.fire({ icon: "error", title: "Missing doc_no", text: "Cannot submit: doc_no is missing for this record." });
            return;
        }

        const newRate = rateEdits[item.doc_no] !== undefined ? rateEdits[item.doc_no] : (item.rate ?? item.raw_data?.rate);
        if (!newRate || Number(newRate) <= 0) {
            Swal.fire({ icon: "error", title: "Invalid rate", text: "Please enter a valid rate before submitting." });
            return;
        }

        // Default SAP post date = bill date
        const sapPostDate = sapPostDates[item.doc_no] || getDCDateString(item.date);

        // Validate: Min = bill date, Max = bill date + allowedDays
        const selectedD = new Date(sapPostDate);
        selectedD.setHours(0, 0, 0, 0);

        const minStr = getMinAllowedDateForDC(item.date);
        const minD = new Date(minStr);
        minD.setHours(0, 0, 0, 0);

        const maxStr = getMaxAllowedDateForDC(item.date, allowedDays);
        const maxD = new Date(maxStr);
        maxD.setHours(0, 0, 0, 0);

        if (selectedD < minD || selectedD > maxD) {
            Swal.fire({
                icon: "error",
                title: "Invalid SAP Post Date",
                text: `SAP Post Date must be between ${minD.toLocaleDateString('en-GB').replace(/\//g, '-')} and ${maxD.toLocaleDateString('en-GB').replace(/\//g, '-')} (${allowedDays} days from bill date: ${minD.toLocaleDateString('en-GB').replace(/\//g, '-')}).`
            });
            return;
        }

        const formattedPostDate = sapPostDate.split('-').reverse().join('-');
        const confirm = await Swal.fire({
            title: "Submit to SAP?",
            text: `This will save the rate and push DC No. ${item.dc_no || item.doc_no} (Doc: ${item.doc_no}) to SAP with Post Date ${formattedPostDate}.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#F3890A",
            cancelButtonColor: "#9CA3AF",
            confirmButtonText: "Yes, submit"
        });

        if (!confirm.isConfirmed) return;

        try {
            setSubmittingDocNo(item.doc_no);

            // Step 1: Save rate if it was edited
            const customerType = item.customer_type || item.raw_data?.customer_type || 'all';
            const customer = item.customer || item.raw_data?.customer || '';
            const customerDetails = item.raw_data?.customer_details || null;
            await axios.put('broiler/bill-of-supply/update', {
                rate: Number(newRate),
                customer_type: customerType,
                customer: customer,
                customer_details: customerDetails
            }, { params: { doc_no: item.doc_no } });

            // Step 2: Submit to SAP (with admin-selected SAP Post Date and Rate)
            const res = await axios.post("broiler/bill-of-supply/submit", { 
                doc_no: item.doc_no, 
                sap_post_date: sapPostDate,
                rate: Number(newRate)
            });

            if (res.data?.status) {
                Swal.fire({
                    icon: "success",
                    title: "Submitted!",
                    text: "Rate saved & SAP push complete. PDF generated.",
                    timer: 1800,
                    showConfirmButton: false
                });
                setRateEdits(prev => { const next = { ...prev }; delete next[item.doc_no]; return next; });
                setSapPostDates(prev => { const next = { ...prev }; delete next[item.doc_no]; return next; });
                fetchData();
            } else {
                Swal.fire({
                    icon: "error",
                    title: "Submit failed",
                    text: res.data?.message || res.data?.error || "Could not submit to SAP."
                });
            }
        } catch (err) {
            console.error("Submit error:", err);
            const apiMsg = err?.response?.data?.message;
            const apiErr = err?.response?.data?.error;
            let textMsg = apiMsg || err.message || "Could not submit to SAP.";
            // Strip any raw CSS/HTML code fragments if present in error message
            if (textMsg.includes('body {') || textMsg.includes('.content {')) {
                textMsg = textMsg.split('body {')[0].trim();
            }
            if (apiErr && typeof apiErr === 'string' && apiErr !== apiMsg && !apiErr.startsWith('<') && !apiErr.includes('body {')) {
                textMsg += `\n(${apiErr})`;
            }
            Swal.fire({
                icon: "error",
                title: "Submit failed",
                text: textMsg
            });
        } finally {
            setSubmittingDocNo(null);
        }
    };

    const handleDelete = async (id) => {
        const confirm = await Swal.fire({
            title: "Are you sure?",
            text: "You won't be able to revert this!",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#3085d6",
            confirmButtonText: "Yes, delete it!"
        });

        if (!confirm.isConfirmed) return;

        try {
            const res = await axios.delete(`broiler/bill-of-supply/remove/${id}`);
            if (res.data?.status) {
                Swal.fire({ title: "Deleted!", text: "Record has been deleted.", icon: "success", timer: 1500, showConfirmButton: false });
                fetchData();
            } else {
                Swal.fire({ icon: 'error', title: 'Delete failed', text: res.data?.message || 'Could not delete record.' });
            }
        } catch (err) {
            console.error('Delete error:', err);
            Swal.fire({ icon: 'error', title: 'Delete failed', text: err?.response?.data?.message || err.message || 'Could not delete record.' });
        }
    };

    const handleExport = () => {
        ExcelExport(data, "Broiler_Supply.xlsx");
    };

    // --- Filter & Pagination ---
    const filteredData = data.filter(item => {
        // Plant dropdown filter
        if (selectedPlant && String(item.plant) !== String(selectedPlant)) return false;

        // Date filter (selectedDate is YYYY-MM-DD from native date picker)
        if (selectedDate) {
            let itemDateStr = '';
            if (item.date) {
                const d = new Date(item.date);
                const y = d.getFullYear();
                const m = String(d.getMonth() + 1).padStart(2, '0');
                const day = String(d.getDate()).padStart(2, '0');
                itemDateStr = `${y}-${m}-${day}`;
            }
            console.log('[DateFilter] item.date raw:', item.date, '| parsed:', itemDateStr, '| selectedDate:', selectedDate, '| match:', itemDateStr === selectedDate);
            if (itemDateStr !== selectedDate) return false;
        }

        const q = searchQuery.toLowerCase();
        if (!q) return true;
        const custName = resolveCustomerName(item).toLowerCase();
        const farmName = resolveFarmerName(item).toLowerCase();
        const plantName = (item.plant_name || item.plant || '').toLowerCase();
        return (
            (item.dc_no || '').toLowerCase().includes(q) ||
            custName.includes(q) ||
            farmName.includes(q) ||
            plantName.includes(q)
        );
    });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    // Sums birdQty and weight across load_details (handles array OR stringified JSON).
    const getLoadTotals = (item) => {
        let details = item?.load_details;
        if (typeof details === 'string') {
            try { details = JSON.parse(details); } catch { details = []; }
        }
        if (!Array.isArray(details)) details = [];
        return details.reduce(
            (acc, row) => {
                acc.birds += Number(row.birdQty) || 0;
                acc.netWeight += Number(row.weight) || 0;
                return acc;
            },
            { birds: 0, netWeight: 0 }
        );
    };

    // Pagination Handlers
    const goToFirstPage = () => setCurrentPage(1);
    const goToLastPage = () => setCurrentPage(totalPages);
    const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
    const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

    return (
        <div className="rounded-lg shadow flex-1">

            <SupplyModal
                isOpen={modalIsOpen}
                closeModal={closeModal}
                refreshData={fetchData}
                editData={selectedItem}
            />

            <BillOfSupplyEditModal
                isOpen={editModalOpen}
                closeModal={closeEditModal}
                refreshData={fetchData}
                editData={editItem}
            />

            {/* --- PAGE CONTENT --- */}
            <div className="bg-[#F9F9FC] h-screen relative">

                {/* Header */}
                <div className="space-y-4 pt-3 px-6 font-poppins">
                    <h1 className="text-xl font-bold text-gray-900">Broiler Supply</h1>
                    <div className="flex items-center gap-x-2 text-sm text-gray-500">
                        <Link to="/" className='text-orange-500'>Sales</Link>
                        <span><RiArrowUpSFill className='rotate-90' size={20} /></span>
                        <span>Broiler Supply</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <span className='absolute top-2.5 left-2 opacity-45'><RiSearchLine /></span>
                                <input
                                    type="search"
                                    placeholder="Search DC No/Customer..."
                                    value={searchQuery}
                                    onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                                    className="py-2 px-2 ps-8 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 w-64"
                                />
                            </div>
                            <select
                                value={selectedPlant}
                                onChange={(e) => { setSelectedPlant(e.target.value); setCurrentPage(1); }}
                                className="py-2 px-3 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-poppins"
                            >
                                <option value="">All Plants</option>
                                {plants.map(p => (
                                    <option key={p.plant_id} value={p.plant_id}>
                                        {p.plant_id} - {p.plant_name || p.plant_id}
                                    </option>
                                ))}
                            </select>
                            {/* Date picker: shows DD-MM-YYYY label, opens native calendar on click */}
                            <div className="relative flex items-center">
                                {/* Display label in DD-MM-YYYY */}
                                <input
                                    type="text"
                                    readOnly
                                    value={selectedDateDisplay}
                                    placeholder="DD-MM-YYYY"
                                    onClick={() => dateInputRef.current?.showPicker?.() || dateInputRef.current?.click()}
                                    className="py-2 pl-3 pr-7 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white font-poppins text-gray-700 w-32 cursor-pointer"
                                />
                                {/* Calendar icon */}
                                <span
                                    className="absolute right-2 text-gray-400 cursor-pointer pointer-events-none"
                                    style={{ fontSize: 14 }}
                                >📅</span>
                                {/* Hidden native date input */}
                                <input
                                    ref={dateInputRef}
                                    type="date"
                                    value={selectedDate}
                                    onChange={(e) => {
                                        const raw = e.target.value; // YYYY-MM-DD
                                        setSelectedDate(raw);
                                        if (raw) {
                                            const [y, m, d] = raw.split('-');
                                            setSelectedDateDisplay(`${d}-${m}-${y}`);
                                        } else {
                                            setSelectedDateDisplay('');
                                        }
                                        setCurrentPage(1);
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    style={{ zIndex: -1 }}
                                />
                            </div>
                        </div>

                        <div className='space-x-4 flex'>
                            <button onClick={handleExport} className="px-4 py-2 bg-[#EFE8E0] text-[#F3890A] border rounded-lg hover:bg-orange-500 hover:text-white transition text-xs flex items-center gap-2">
                                <LuImport size={16} /> Export
                            </button>
                            {broilerSupply?.add && (
                                <button onClick={() => openModal()} className="px-4 py-2 bg-orange-500 text-white border rounded-lg hover:bg-orange-600 transition text-xs flex items-center gap-2">
                                    <LuPlus size={16} /> Add Supply
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto px-4 mx-4 mt-5 bg-white rounded-lg shadow-sm">
                    <table className="w-full text-sm text-left table-auto">
                        <thead className="text-black font-poppins font-semibold border-b">
                            <tr>
                                <th className="py-2.5 px-1 text-center font-medium">S.No</th>
                                <th className="py-2.5 px-1 font-medium">Date</th>
                                <th className="py-2.5 px-1 font-medium">DC No</th>
                                <th className="py-2.5 px-1 font-medium">Plant</th>
                                <th className="py-2.5 px-1.5 font-medium">Customer</th>
                                <th className="py-2.5 px-1.5 font-medium">Farmer</th>
                                <th className="py-2.5 px-1 text-center font-medium">Tentative Rate (₹)</th>
                                <th className="py-2.5 px-1 text-center font-medium">Rate (₹)</th>
                                <th className="py-2.5 px-1 text-center font-medium">SAP Post Date</th>
                                <th className="py-2.5 px-1 text-center font-medium">Bird Qty</th>
                                <th className="py-2.5 px-1 text-center font-medium">Net Weight</th>
                                <th className="py-2.5 px-1 text-center font-medium">Avg. Weight</th>
                                <th className="py-2.5 px-1 text-right font-medium">Bill Value</th>
                                <th className="py-2.5 px-1 text-right font-medium">DC</th>
                                <th className="py-2.5 px-1 text-center font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y font-poppins">
                            {paginatedData.length > 0 ? paginatedData.map((item, index) => {
                                const totals = getLoadTotals(item);
                                const isSubmitted = Boolean(item.is_send_sap || item.sap_post_date);

                                return (
                                    <tr key={item.id} className="hover:bg-gray-50 text-sm">
                                        <td className="py-2 px-1 text-center opacity-65">{startIndex + index + 1}</td>
                                        <td className="py-2 px-1 opacity-65 whitespace-nowrap">{formatDate(item.date)}</td>
                                        <td className="py-2 px-1 opacity-65">{item.dc_no}</td>
                                        <td className="py-2 px-1 opacity-65 whitespace-nowrap">{(item.plant_name || item.plant || '-').replace(/broiler/gi, '').trim() || '-'}</td>
                                        <td className="py-2 px-1.5 opacity-65 break-words max-w-[140px]">{resolveCustomerName(item)}</td>
                                        <td className="py-2 px-1.5 opacity-65 break-words max-w-[140px]">{resolveFarmerName(item)}</td>

                                        {/* Tentative Rate Column (from mobile app) */}
                                        <td className="py-2 px-1 text-center opacity-65">
                                            {(() => {
                                                let raw = item.raw_data || {};
                                                if (typeof raw === 'string') {
                                                    try { raw = JSON.parse(raw); } catch { raw = {}; }
                                                }
                                                const tentativeRate = item.tentative_rate || raw.tentative_rate || raw.rate || item.rate;
                                                return tentativeRate ? `₹ ${tentativeRate}` : '-';
                                            })()}
                                        </td>

                                        {/* Rate Column (editable by admin) */}
                                        <td className="py-2 px-1 text-center">
                                            {isSubmitted ? (
                                                <span className="opacity-65">₹ {item.rate ?? item.raw_data?.rate ?? '-'}</span>
                                            ) : (
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    min="0"
                                                    className="w-20 py-1 px-1 border border-gray-300 rounded text-center text-sm focus:ring-1 focus:ring-orange-500 outline-none appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                                                    value={rateEdits[item.doc_no] !== undefined ? rateEdits[item.doc_no] : (item.rate ?? item.raw_data?.rate ?? '')}
                                                    onChange={(e) => handleRateChange(item.doc_no, e.target.value)}
                                                />
                                            )}
                                        </td>

                                        {/* SAP Post Date Column */}
                                        <td className="py-2 px-1 text-center">
                                            {isSubmitted ? (
                                                <span className="opacity-65 whitespace-nowrap text-sm">
                                                    {formatDate(item.sap_post_date)}
                                                </span>
                                            ) : (
                                                <div className="relative flex items-center justify-center w-32 mx-auto">
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={
                                                            (() => {
                                                                const d = sapPostDates[item.doc_no] || getDCDateString(item.date);
                                                                return d.split('-').reverse().join('-');
                                                            })()
                                                        }
                                                        placeholder="DD-MM-YYYY"
                                                        onClick={(e) => {
                                                            const dateInput = e.currentTarget.parentElement.querySelector('input[type="date"]');
                                                            if (dateInput) {
                                                                dateInput.showPicker?.() || dateInput.click();
                                                            }
                                                        }}
                                                        className="py-1 px-2 border border-orange-300 rounded text-sm focus:ring-1 focus:ring-orange-500 outline-none bg-orange-50 w-full text-center cursor-pointer pr-6 font-poppins text-gray-700"
                                                        title="Select SAP Post Date"
                                                    />
                                                    <span
                                                        className="absolute right-2 text-gray-400 cursor-pointer"
                                                        style={{ fontSize: 12 }}
                                                        onClick={(e) => {
                                                            const dateInput = e.currentTarget.parentElement.querySelector('input[type="date"]');
                                                            if (dateInput) {
                                                                dateInput.showPicker?.() || dateInput.click();
                                                            }
                                                        }}
                                                    >
                                                        📅
                                                    </span>
                                                    <input
                                                        type="date"
                                                        value={sapPostDates[item.doc_no] || getDCDateString(item.date)}
                                                        onChange={(e) => handleSapPostDateChange(item.doc_no, e.target.value)}
                                                        className="absolute inset-0 w-full h-full opacity-0 pointer-events-none"
                                                        min={getMinAllowedDateForDC(item.date)}
                                                        max={getMaxAllowedDateForDC(item.date, allowedDays)}
                                                    />
                                                </div>
                                            )}
                                        </td>

                                        <td className="py-2 px-1 text-center opacity-65">{totals.birds}</td>
                                        <td className="py-2 px-1 text-center opacity-65 whitespace-nowrap">{(totals.netWeight ?? 0).toFixed(2)} kg</td>
                                        <td className="py-2 px-1 text-center opacity-65 whitespace-nowrap">{item.average_weight} kg</td>

                                        {/* Dynamic Bill Value Column */}
                                        <td className="py-2 px-1 text-right opacity-65 font-medium whitespace-nowrap">
                                            {(() => {
                                                if (isSubmitted) return `₹ ${item.bill_value}`;

                                                const currentRate = rateEdits[item.doc_no] !== undefined ? rateEdits[item.doc_no] : (item.rate ?? item.raw_data?.rate ?? 0);
                                                let details = item.load_details || item.raw_data?.load_details || [];
                                                if (typeof details === 'string') {
                                                    try { details = JSON.parse(details); } catch { details = []; }
                                                }
                                                if (!Array.isArray(details)) details = [];
                                                const r = Number(currentRate) || 0;
                                                const dynamicBillValue = details.reduce((sum, d) => sum + (Number(d.weight) || 0) * r, 0).toFixed(2);

                                                return `₹ ${dynamicBillValue}`;
                                            })()}
                                        </td>
                                        <td className="py-2 px-1 text-center opacity-80">
                                            {isSubmitted ? (
                                                <button onClick={() => window.open(item.pdf_link || item.mobile_pdf_link, '_blank')} title="View DC PDF" className="hover:text-orange-500">
                                                    <FiEye size={16} />
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleSubmit(item)}
                                                    disabled={!!item.doc_no && submittingDocNo === item.doc_no}
                                                    className="px-2 py-1 bg-orange-500 text-white rounded text-xs font-medium hover:bg-orange-600 transition flex items-center gap-1 mx-auto disabled:opacity-60 disabled:cursor-not-allowed"
                                                    title="Save rate & Submit to SAP"
                                                >
                                                    <FiUploadCloud size={12} />
                                                    {!!item.doc_no && submittingDocNo === item.doc_no ? 'Submitting...' : 'Submit'}
                                                </button>
                                            )}
                                        </td>
                                        <td className="py-2 px-1 text-center">
                                            <div className="flex justify-center gap-1.5">
                                                {!isSubmitted && (
                                                    <button onClick={() => openEditModal(item)} className="hover:text-orange-500 text-gray-500" title="Edit (rate / customer)">
                                                        <FiEdit2 size={15} />
                                                    </button>
                                                )}
                                                <button onClick={() => handleDelete(item.id)} className="hover:text-red-500 text-gray-500" title="Delete record">
                                                    <RiDeleteBin6Line size={15} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr><td colSpan="15" className="p-8 text-center text-gray-500">No Data Available</td></tr>
                            )}
                        </tbody>
                    </table>

                    {/* Pagination Controls */}
                    <div className="flex justify-end font-dm items-center gap-2 mt-4 mb-4 pt-4 border-t">
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

export default BroilerSupply