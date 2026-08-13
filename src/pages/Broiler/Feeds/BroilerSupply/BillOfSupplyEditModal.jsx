import React, { useEffect, useMemo, useState } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function BillOfSupplyEditModal({ isOpen, closeModal, refreshData, editData }) {
    if (!isOpen || !editData) return null;

    const initialCustomerType = editData.customer_type || editData.raw_data?.customer_type || 'all';
    const initialCustomer = editData.customer || editData.raw_data?.customer || '';
    const initialCustomerDetails = editData.raw_data?.customer_details || null;
    const initialRate = editData.rate ?? editData.raw_data?.rate ?? '';

    const [customerType, setCustomerType] = useState(initialCustomerType);
    const [rate, setRate] = useState(String(initialRate));
    const [customerCode, setCustomerCode] = useState(initialCustomer);
    const [customerDetails, setCustomerDetails] = useState(initialCustomerDetails);
    const [customers, setCustomers] = useState([]);
    const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        setCustomerType(initialCustomerType);
        setRate(String(initialRate));
        setCustomerCode(initialCustomer);
        setCustomerDetails(initialCustomerDetails);
    }, [editData]);

    useEffect(() => {
        const fetchCustomers = async () => {
            try {
                setIsLoadingCustomers(true);
                const res = await axios.get(`broiler/farmer/get-customer/${customerType}`);
                if (res.data?.success) {
                    setCustomers(res.data.data || []);
                } else {
                    setCustomers([]);
                }
            } catch (err) {
                console.error('Failed to load customers:', err);
                setCustomers([]);
            } finally {
                setIsLoadingCustomers(false);
            }
        };

        fetchCustomers();
    }, [customerType]);

    const selectedCustomer = useMemo(
        () => customers.find((c) => c.customer_no === customerCode) || null,
        [customers, customerCode]
    );

    const previewBillValue = useMemo(() => {
        const loadDetails = editData.load_details || editData.raw_data?.load_details || [];
        const r = Number(rate) || 0;
        return loadDetails.reduce((sum, item) => sum + (Number(item.weight) || 0) * r, 0).toFixed(2);
    }, [rate, editData]);

    const handleCustomerTypeChange = (e) => {
        const newType = e.target.value;
        setCustomerType(newType);
        // Customer list will refetch via the customerType-dep effect.
        // Reset the previous selection since it likely won't appear in the new list.
        setCustomerCode('');
        setCustomerDetails(null);
    };

    const handleCustomerChange = (e) => {
        const code = e.target.value;
        setCustomerCode(code);
        const match = customers.find((c) => c.customer_no === code);
        if (match) {
            setCustomerDetails(match);
        }
    };

    const handleSave = async (e) => {
        e.preventDefault();

        if (!editData.doc_no) {
            Swal.fire({ icon: 'error', title: 'Missing doc_no', text: 'Cannot update: doc_no is missing.' });
            return;
        }

        if (!rate || Number(rate) <= 0) {
            Swal.fire({ icon: 'error', title: 'Invalid rate', text: 'Rate must be greater than 0.' });
            return;
        }

        if (!customerCode) {
            Swal.fire({ icon: 'error', title: 'Customer required', text: 'Please select a customer.' });
            return;
        }

        try {
            setIsSubmitting(true);
            const res = await axios.put('broiler/bill-of-supply/update', {
                rate: Number(rate),
                customer_type: customerType,
                customer: customerCode,
                customer_details: customerDetails
            }, {
                params: { doc_no: editData.doc_no }
            });

            if (res.data?.status) {
                Swal.fire({
                    icon: 'success',
                    title: 'Updated!',
                    text: 'Bill of supply updated successfully.',
                    timer: 1500,
                    showConfirmButton: false
                });
                refreshData();
                closeModal();
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Update failed',
                    text: res.data?.message || 'Could not update record.'
                });
            }
        } catch (err) {
            console.error('Update error:', err);
            Swal.fire({
                icon: 'error',
                title: 'Update failed',
                text: err?.response?.data?.message || err.message || 'Could not update record.'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4 overflow-hidden font-poppins flex flex-col">

                <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">
                        Edit Bill of Supply — {editData.doc_no}
                    </h2>
                    <button onClick={closeModal} className="text-gray-500 hover:text-red-500 transition">
                        <IoCloseSharp size={24} />
                    </button>
                </div>

                <form onSubmit={handleSave} className="p-6 space-y-6">

                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">DC No</label>
                            <input type="text" value={editData.dc_no || '-'} readOnly className="w-full p-2.5 bg-gray-100 border rounded text-gray-500" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Customer Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={customerType}
                                onChange={handleCustomerTypeChange}
                                required
                                className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            >
                                <option value="C">Customer</option>
                                <option value="F">Farmer</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-700 mb-1">
                            Customer <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={customerCode}
                            onChange={handleCustomerChange}
                            disabled={isLoadingCustomers}
                            required
                            className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        >
                            <option value="">
                                {isLoadingCustomers ? 'Loading customers...' : 'Select Customer'}
                            </option>
                            {customers.map((c) => (
                                <option key={c.customer_no} value={c.customer_no}>
                                    {c.customer_no} | {c.customer_name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {selectedCustomer && (
                        <div className="bg-orange-50 border border-orange-200 rounded p-3 text-xs space-y-1">
                            <div><span className="font-semibold">Name:</span> {selectedCustomer.customer_name || '-'}</div>
                            {/* <div><span className="font-semibold">Short Name:</span> {selectedCustomer.customer_short_name || '-'}</div> */}
                            <div><span className="font-semibold">Address:</span> {selectedCustomer.street1 || ''} {selectedCustomer.street2 || ''}</div>
                            <div><span className="font-semibold">City / Pin:</span> {selectedCustomer.city || selectedCustomer.street2 || '-'} / {selectedCustomer.pincode || '-'}</div>
                        </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">
                                Rate (₹) <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                value={rate}
                                onChange={(e) => setRate(e.target.value)}
                                required
                                className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-700 mb-1">New Bill Value (preview)</label>
                            <input
                                type="text"
                                value={`₹ ${previewBillValue}`}
                                readOnly
                                className="w-full p-2.5 bg-orange-50 border border-orange-200 rounded text-sm text-gray-700 font-bold"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t">
                        <button
                            type="button"
                            onClick={closeModal}
                            className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition disabled:opacity-60"
                        >
                            {isSubmitting ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
