import React, { useState, useEffect } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import Swal from 'sweetalert2';

export default function SupplyModal({ isOpen, closeModal, refreshData, editData }) {
    if (!isOpen) return null;

    // --- Initial States ---
    const initialFormState = {
        // Header Details
        date: new Date().toISOString().split('T')[0], // 1. Automatic
        customerType: '',                             // 2. Manual (C/F)
        dcNo: '',                                     // 3. Manual
        customer: '',                                 // 4. Manual
        transportBy: '',                              // 5. Manual (P/N)
        salesType: '',                                // 6. Manual (N/W)
        vehicleNo: '',                                // 7. Manual
        orderBy: 'Current User',                      // 8. Automatic (Mocked)
        dispatchedBy: '',                             // 9. Manual

        // Farmer/Stock Details
        plant: 'Chennai Unit 1',                      // 10. Automatic
        farmer: '',                                   // 11. Manual Select -> Triggers Auto
        lineNo: '',                                   // 12. Automatic
        farmShedNo: '',                               // 13. Automatic
        batch: '',                                    // 14. Automatic
        age: '',                                      // 15. Automatic
        birdStock: '',                                // 16. Automatic
        
        // Calculations
        excess: '0',                                  // 17. Automatic
        shortage: '0',                                // 18. Automatic
        birdQty: '',                                  // 19. Manual (Triggers excess/shortage)
        emptyWeight: '',                              // 20. Manual
        loadWeight: '',                               // 21. Manual
        weight: '0',                                  // 22. Automatic (Load - Empty)
        avgWeight: '0',                               // 23. Automatic (Weight / Qty)
        rate: '',                                     // 24. Manual
        grossValue: '0',                              // 25. Automatic (Weight * Rate)
        tcs: '0',                                     // 26. Manual (If applicable)
        billValue: '0',                               // 27. Automatic (Gross + TCS)
    };

    const [formData, setFormData] = useState(initialFormState);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Mock Database for Auto-Populate ---
    const farmerDB = {
        "FARM-001": { name: "FARM-001 | Krishnan", line: "L-1", shed: "S-1", batch: "B-2025-01", age: 42, stock: 5000 },
        "FARM-002": { name: "FARM-002 | Balaji",   line: "L-2", shed: "S-3", batch: "B-2025-05", age: 38, stock: 4500 },
        "FARM-003": { name: "FARM-003 | Kumar",    line: "L-1", shed: "S-2", batch: "B-2025-08", age: 40, stock: 6000 },
    };

    // --- Effects ---

    // 1. Populate Edit Data
    useEffect(() => {
        if (editData) {
            setFormData({ ...initialFormState, ...editData });
        } else {
            setFormData(initialFormState);
        }
    }, [editData]);

    // 2. Calculations Effect
    useEffect(() => {
        const calculateValues = () => {
            const qty = parseFloat(formData.birdQty) || 0;
            const stock = parseFloat(formData.birdStock) || 0;
            const emptyWt = parseFloat(formData.emptyWeight) || 0;
            const loadWt = parseFloat(formData.loadWeight) || 0;
            const rate = parseFloat(formData.rate) || 0;
            const tcs = parseFloat(formData.tcs) || 0;

            // Weight Calc
            const netWeight = Math.max(0, loadWt - emptyWt);
            
            // Avg Weight
            const avgWt = qty > 0 ? (netWeight / qty).toFixed(2) : 0;

            // Gross Value
            const gross = (netWeight * rate).toFixed(2);

            // Bill Value
            const bill = (parseFloat(gross) + tcs).toFixed(2);

            // Excess / Shortage
            let excessVal = 0;
            let shortageVal = 0;
            
            // Simple logic: normally shortage calculated after final batch closure, 
            // but here we might show difference for this load if stock is tracking per load (unlikely)
            // or just leaving 0 for now. 
            // If user wants tracking against stock:
            // if (qty > stock) excessVal = qty - stock;
            // else shortageVal = stock - qty; 
            // *Assuming standard logic: manual entry might override, but let's calc simple diff*
            
            // NOTE: Usually stock decrements. Here we just display static diff for demo unless specific formula given.
            
            setFormData(prev => ({
                ...prev,
                weight: netWeight,
                avgWeight: avgWt,
                grossValue: gross,
                billValue: bill,
                // excess: excessVal,
                // shortage: shortageVal
            }));
        };
        
        calculateValues();
    }, [formData.birdQty, formData.emptyWeight, formData.loadWeight, formData.rate, formData.tcs, formData.birdStock]);


    // --- Handlers ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFarmerChange = (e) => {
        const selectedKey = e.target.value;
        if (farmerDB[selectedKey]) {
            const details = farmerDB[selectedKey];
            setFormData(prev => ({
                ...prev,
                farmer: details.name,
                lineNo: details.line,
                farmShedNo: details.shed,
                batch: details.batch,
                age: details.age,
                birdStock: details.stock,
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                farmer: selectedKey,
                lineNo: '', farmShedNo: '', batch: '', age: '', birdStock: ''
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API
        setTimeout(() => {
            console.log("Submitted Data:", formData);
            Swal.fire({ 
                icon: "success", 
                title: editData ? "Updated!" : "Saved!", 
                text: "Broiler Supply details saved successfully.", 
                timer: 1500, 
                showConfirmButton: false 
            });
            refreshData();
            closeModal();
            setIsSubmitting(false);
        }, 1000);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl mx-4 overflow-hidden font-poppins h-[90vh] flex flex-col">
                
                {/* Header */}
                <div className="flex justify-between items-center p-5 border-b bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">{editData ? "Edit Supply Entry" : "Add Broiler Supply"}</h2>
                    <button onClick={closeModal} className="text-gray-500 hover:text-red-500 transition">
                        <IoCloseSharp size={24} />
                    </button>
                </div>

                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="supplyForm" onSubmit={handleSubmit}>
                        
                        {/* --- SECTION 1: INVOICE / HEADER DETAILS --- */}
                        <div className="mb-8">
                            <h3 className="text-md font-semibold text-orange-600 border-b pb-2 mb-4">Invoice Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Date</label>
                                    <input type="date" name="date" value={formData.date} readOnly className="w-full p-2.5 bg-gray-100 border rounded text-sm text-gray-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Customer Type <span className="text-red-500">*</span></label>
                                    <select name="customerType" value={formData.customerType} onChange={handleInputChange} className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" required>
                                        <option value="">Select Type</option>
                                        <option value="C">Customer</option>
                                        <option value="F">Farmer</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">DC No <span className="text-red-500">*</span></label>
                                    <input type="text" name="dcNo" value={formData.dcNo} onChange={handleInputChange} className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" required placeholder="Enter DC No" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Customer Name <span className="text-red-500">*</span></label>
                                    <input type="text" name="customer" value={formData.customer} onChange={handleInputChange} className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" required placeholder="Enter Customer Name" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Transport By</label>
                                    <select name="transportBy" value={formData.transportBy} onChange={handleInputChange} className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                                        <option value="">Select</option>
                                        <option value="P">Party</option>
                                        <option value="N">None</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Sales Type</label>
                                    <select name="salesType" value={formData.salesType} onChange={handleInputChange} className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none">
                                        <option value="">Select</option>
                                        <option value="N">Normal Bird</option>
                                        <option value="W">Week Bird</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Vehicle No <span className="text-red-500">*</span></label>
                                    <input type="text" name="vehicleNo" value={formData.vehicleNo} onChange={handleInputChange} className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" required placeholder="e.g. TN-99-XX-9999" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Order By</label>
                                    <input type="text" name="orderBy" value={formData.orderBy} readOnly className="w-full p-2.5 bg-gray-100 border rounded text-sm text-gray-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Dispatched By</label>
                                    <input type="text" name="dispatchedBy" value={formData.dispatchedBy} onChange={handleInputChange} className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
                                </div>
                            </div>
                        </div>

                        {/* --- SECTION 2: FARMER / STOCK DETAILS --- */}
                        <div className="mb-8">
                            <h3 className="text-md font-semibold text-orange-600 border-b pb-2 mb-4">Source & Stock</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Plant</label>
                                    <input type="text" value={formData.plant} readOnly className="w-full p-2.5 bg-gray-100 border rounded text-sm text-gray-500" />
                                </div>
                                <div className="md:col-span-2">
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Farmer <span className="text-red-500">*</span></label>
                                    <select name="farmer" onChange={handleFarmerChange} value={Object.keys(farmerDB).find(key => farmerDB[key].name === formData.farmer) || formData.farmer} className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" required>
                                        <option value="">Select Farmer</option>
                                        {Object.keys(farmerDB).map(key => (
                                            <option key={key} value={key}>{farmerDB[key].name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Bird Stock</label>
                                    <input type="text" value={formData.birdStock} readOnly className="w-full p-2.5 bg-gray-100 border rounded text-sm text-gray-500 font-mono" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Line No</label>
                                    <input type="text" value={formData.lineNo} readOnly className="w-full p-2.5 bg-gray-100 border rounded text-sm text-gray-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Farm Shed No</label>
                                    <input type="text" value={formData.farmShedNo} readOnly className="w-full p-2.5 bg-gray-100 border rounded text-sm text-gray-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Batch</label>
                                    <input type="text" value={formData.batch} readOnly className="w-full p-2.5 bg-gray-100 border rounded text-sm text-gray-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Age</label>
                                    <input type="text" value={formData.age} readOnly className="w-full p-2.5 bg-gray-100 border rounded text-sm text-gray-500" />
                                </div>
                            </div>
                        </div>

                        {/* --- SECTION 3: WEIGHT & BILLING --- */}
                        <div>
                            <h3 className="text-md font-semibold text-orange-600 border-b pb-2 mb-4">Weight & Billing</h3>
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                
                                {/* Row 1: Quantity & Weights */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Bird Qty <span className="text-red-500">*</span></label>
                                    <input type="number" name="birdQty" value={formData.birdQty} onChange={handleInputChange} className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" required placeholder="Nos" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Empty Weight</label>
                                    <input type="number" name="emptyWeight" value={formData.emptyWeight} onChange={handleInputChange} className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Kg" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Load Weight</label>
                                    <input type="number" name="loadWeight" value={formData.loadWeight} onChange={handleInputChange} className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="Kg" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Net Weight</label>
                                    <input type="text" value={formData.weight} readOnly className="w-full p-2.5 bg-orange-50 border border-orange-200 rounded text-sm text-gray-700 font-bold" />
                                </div>

                                {/* Row 2: Rates & Totals */}
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Avg. Weight</label>
                                    <input type="text" value={formData.avgWeight} readOnly className="w-full p-2.5 bg-gray-100 border rounded text-sm text-gray-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Rate <span className="text-red-500">*</span></label>
                                    <input type="number" name="rate" value={formData.rate} onChange={handleInputChange} className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" required placeholder="₹" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">Gross Value</label>
                                    <input type="text" value={formData.grossValue} readOnly className="w-full p-2.5 bg-gray-100 border rounded text-sm text-gray-500" />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-700 mb-1">TCS (Amount)</label>
                                    <input type="number" name="tcs" value={formData.tcs} onChange={handleInputChange} className="w-full p-2.5 bg-white border rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" placeholder="₹" />
                                </div>
                            </div>
                            
                            {/* Final Total Row */}
                            <div className="mt-6 flex justify-end items-center bg-gray-100 p-4 rounded-lg">
                                <span className="text-lg font-bold text-gray-700 mr-4">Total Bill Value:</span>
                                <span className="text-2xl font-bold text-green-600">₹ {formData.billValue}</span>
                            </div>
                        </div>

                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="p-5 border-t bg-gray-50 flex justify-end gap-4">
                    <button onClick={closeModal} className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition">
                        Cancel
                    </button>
                    <button type="submit" form="supplyForm" disabled={isSubmitting} className="px-8 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition flex items-center gap-2 disabled:opacity-70">
                        {isSubmitting ? 'Saving...' : 'Submit'}
                    </button>
                </div>

            </div>
        </div>
    )
}