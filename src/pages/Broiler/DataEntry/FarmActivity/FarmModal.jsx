import React, { useState, useEffect } from 'react';
import { IoCloseSharp } from 'react-icons/io5';
import { RiDeleteBin6Line } from 'react-icons/ri';
import { LuUpload } from 'react-icons/lu';
import Swal from 'sweetalert2';
import axios from 'axios';

export default function FarmModal({ isOpen, closeModal, refreshData, editData }) {
  if (!isOpen) return null;

  // --- Initial States ---
  const initialGeneralInfo = {
    date: new Date().toISOString().split('T')[0],
    vehicleNo: '',
    startKm: '',
    endKm: '',
    runningKm: 0,
    plant: 'Chennai Unit 1',
    startTime: '',
    endTime: '',
  };

  const initialFarmData = {
    farmer: '',
    inTime: '',
    outTime: '',
    maintenance: '',
    litterQuality: '',
    drinkerCleaning: '',
    bodyWeight: '',
    batchNo: 'BATCH-001',
    age: '42',
    housed: '5000',
    stock: '4800',
    
    // Mortality
    mortalityQty: '',
    mortalityReason: '',
    mortalityPhoto: null,
    treatment: '',
    cumMortality: '120',
    cumMortalityPerc: '2.4%',

    // Feed
    feedMaterial: 'Broiler Finisher',
    feedStockBags: '50',
    feedQty: '',
    cumFeed: '1200',
    totalFeed: '15000',
  };

  // --- State Management ---
  const [generalInfo, setGeneralInfo] = useState(initialGeneralInfo);
  const [currentFarm, setCurrentFarm] = useState(initialFarmData);
  const [farmList, setFarmList] = useState([]); // Stores the list of added farms
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- Effects ---

  // 1. Set Start Time on Mount OR Populate Edit Data
  useEffect(() => {
    if (editData) {
        // Populate form if in Edit Mode
        setGeneralInfo({
            date: editData.date || initialGeneralInfo.date,
            vehicleNo: editData.vehicleNo || '',
            startKm: editData.startKm || '',
            endKm: editData.endKm || '',
            runningKm: editData.runningKm || 0,
            plant: editData.plant || 'Chennai Unit 1',
            startTime: editData.startTime || '09:00', // Mock time if missing
            endTime: editData.endTime || '',
        });

        // If the editData has child activities, populate them
        if (editData.activities && Array.isArray(editData.activities)) {
            setFarmList(editData.activities);
        } else {
            setFarmList([]);
        }

    } else {
        // Default New Entry Mode
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        setGeneralInfo(prev => ({ ...prev, startTime: timeString }));
        setFarmList([]);
    }
  }, [editData]); // Depend on editData to trigger this when modal opens with data

  // 2. Calculate Running KM
  useEffect(() => {
    const start = parseFloat(generalInfo.startKm) || 0;
    const end = parseFloat(generalInfo.endKm) || 0;
    // Only calculate if end is greater than start
    if (end > start) {
      setGeneralInfo(prev => ({ ...prev, runningKm: end - start }));
    } else {
      setGeneralInfo(prev => ({ ...prev, runningKm: 0 }));
    }
  }, [generalInfo.startKm, generalInfo.endKm]);

  // --- Handlers ---

  const handleGeneralChange = (e) => {
    const { name, value } = e.target;
    setGeneralInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleFarmChange = (e) => {
    const { name, value } = e.target;
    setCurrentFarm(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setCurrentFarm(prev => ({ ...prev, mortalityPhoto: e.target.files[0] }));
  };

  // Add Farm to Local List (Clear inputs except General Info)
  const handleAddFarm = () => {
    // Basic Validation
    if (!currentFarm.farmer || !currentFarm.bodyWeight) {
      Swal.fire({ icon: 'warning', title: 'Missing Info', text: 'Please fill required Farmer details.' });
      return;
    }
    if (currentFarm.mortalityQty && !currentFarm.mortalityPhoto) {
        Swal.fire({ icon: 'warning', title: 'Photo Required', text: 'Mortality photo is mandatory.' });
        return;
    }

    setFarmList([...farmList, { ...currentFarm, id: Date.now() }]); // Add to list
    setCurrentFarm(initialFarmData); // Reset Farm Form only
    
    Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Farm added to list",
        showConfirmButton: false,
        timer: 1500
    });
  };

  const removeFarmFromList = (id) => {
    setFarmList(farmList.filter(item => item.id !== id));
  };

  // Final Submit to Backend
  const handleFinalSubmit = async () => {
    if (farmList.length === 0) {
      Swal.fire({ icon: 'error', title: 'No Data', text: 'Please add at least one farm activity.' });
      return;
    }

    setIsSubmitting(true);
    
    // Calculate End Time
    const now = new Date();
    const endTimeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

    const finalPayload = {
        id: editData ? editData.id : null, // Include ID if editing
        ...generalInfo,
        endTime: endTimeString,
        totalFarms: farmList.length,
        activities: farmList
    };

    try {
      // Mock API Call logic
      // if (editData) await axios.put(`/activity/update/${editData.id}`, finalPayload);
      // else await axios.post('/activity/add', finalPayload);
      
      // Simulation success
      setTimeout(() => {
          console.log("Payload Submitted:", finalPayload);
          refreshData();
          closeModal();
          Swal.fire({ 
              icon: 'success', 
              title: editData ? 'Updated' : 'Saved', 
              text: `Activity ${editData ? 'Updated' : 'Logged'} Successfully` 
          });
      }, 1000);

    } catch (error) {
      console.error("Error submitting", error);
      Swal.fire({ icon: 'error', title: 'Error', text: 'Failed to save activity' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-start overflow-y-auto py-10 z-50 font-poppins">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-xl relative">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b px-6 py-4">
          <h2 className="text-xl font-bold text-gray-800">{editData ? 'Edit Farm Activity' : 'Add Farm Activity'}</h2>
          <button onClick={closeModal} className="bg-primary text-white rounded-full p-1 hover:bg-orange-600 transition">
            <IoCloseSharp size={20} />
          </button>
        </div>

        <div className="p-6 space-y-8 max-h-[80vh] overflow-y-auto scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-primary scrollbar-track-white">
          
          {/* --- SECTION 1: GENERAL INFO --- */}
          <div>
            <h3 className="text-lg font-semibold text-center mb-4">General Info</h3>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border">
              
              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 mb-1">Date <span className="text-red-500">*</span></label>
                <input type="date" name="date" value={generalInfo.date} readOnly className="border p-2 rounded text-sm bg-gray-100" />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 mb-1">Vehicle Number <span className="text-red-500">*</span></label>
                <input type="text" name="vehicleNo" value={generalInfo.vehicleNo} onChange={handleGeneralChange} placeholder="Enter Vehicle No" className="border p-2 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 mb-1">Start KM <span className="text-red-500">*</span></label>
                <input type="number" name="startKm" value={generalInfo.startKm} onChange={handleGeneralChange} placeholder="0" className="border p-2 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 mb-1">End KM <span className="text-red-500">*</span></label>
                <input type="number" name="endKm" value={generalInfo.endKm} onChange={handleGeneralChange} placeholder="0" className="border p-2 rounded text-sm focus:ring-2 focus:ring-orange-500 outline-none" />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 mb-1">Running KM</label>
                <input type="text" value={generalInfo.runningKm} readOnly className="border p-2 rounded text-sm bg-gray-200" />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 mb-1">Total Farms</label>
                <input type="text" value={farmList.length} readOnly className="border p-2 rounded text-sm bg-gray-200" />
              </div>

              <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 mb-1">Plant</label>
                <input type="text" value={generalInfo.plant} readOnly className="border p-2 rounded text-sm bg-gray-200" />
              </div>
              
               <div className="flex flex-col">
                <label className="text-xs font-bold text-gray-600 mb-1">Start Time</label>
                <input type="text" value={generalInfo.startTime} readOnly className="border p-2 rounded text-sm bg-gray-200" />
              </div>

            </div>
          </div>

          {/* --- SECTION 2: FARM INFO INPUTS --- */}
          <div className="border rounded-lg p-4">
             <h3 className="text-lg font-semibold text-center mb-4">Farm Info & Details</h3>
             
             {/* Header Data */}
             <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div>
                    <label className="text-xs font-bold text-gray-600">Farmer</label>
                    <select name="farmer" value={currentFarm.farmer} onChange={handleFarmChange} className="w-full border p-2 rounded text-sm mt-1">
                        <option value="">Select Farmer</option>
                        <option value="FARM-001 | Krishnan">FARM-001 | Krishnan</option>
                        <option value="FARM-002 | Balaji">FARM-002 | Balaji</option>
                        <option value="FARM-003 | Kumar">FARM-003 | Kumar</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-600">In Time</label>
                    <input type="time" name="inTime" value={currentFarm.inTime} onChange={handleFarmChange} className="w-full border p-2 rounded text-sm mt-1" />
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-600">Out Time</label>
                    <input type="time" name="outTime" value={currentFarm.outTime} onChange={handleFarmChange} className="w-full border p-2 rounded text-sm mt-1" />
                </div>
                 <div>
                    <label className="text-xs font-bold text-gray-600">Body Weight (Kg)</label>
                    <input type="number" name="bodyWeight" value={currentFarm.bodyWeight} onChange={handleFarmChange} className="w-full border p-2 rounded text-sm mt-1" placeholder="e.g. 1.2" />
                </div>

                {/* Quality Metrics */}
                <div>
                    <label className="text-xs font-bold text-gray-600">Farm Maint.</label>
                    <select name="maintenance" value={currentFarm.maintenance} onChange={handleFarmChange} className="w-full border p-2 rounded text-sm mt-1">
                        <option value="">Select</option>
                        <option value="A">Average</option>
                        <option value="G">Good</option>
                        <option value="P">Poor</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-600">Litter Quality</label>
                    <select name="litterQuality" value={currentFarm.litterQuality} onChange={handleFarmChange} className="w-full border p-2 rounded text-sm mt-1">
                        <option value="">Select</option>
                        <option value="A">Average</option>
                        <option value="G">Good</option>
                        <option value="P">Poor</option>
                    </select>
                </div>
                <div>
                    <label className="text-xs font-bold text-gray-600">Drinker Cleaning</label>
                    <select name="drinkerCleaning" value={currentFarm.drinkerCleaning} onChange={handleFarmChange} className="w-full border p-2 rounded text-sm mt-1">
                        <option value="">Select</option>
                        <option value="A">Average</option>
                        <option value="G">Good</option>
                        <option value="P">Poor</option>
                    </select>
                </div>
                
                {/* Read Only Autos */}
                 <div><label className="text-xs font-bold text-gray-600">Batch No</label><input className="w-full border p-2 rounded text-sm bg-gray-100 mt-1" disabled value={currentFarm.batchNo}/></div>
                 <div><label className="text-xs font-bold text-gray-600">Age</label><input className="w-full border p-2 rounded text-sm bg-gray-100 mt-1" disabled value={currentFarm.age}/></div>
                 <div><label className="text-xs font-bold text-gray-600">Housed</label><input className="w-full border p-2 rounded text-sm bg-gray-100 mt-1" disabled value={currentFarm.housed}/></div>
                 <div><label className="text-xs font-bold text-gray-600">Stock</label><input className="w-full border p-2 rounded text-sm bg-gray-100 mt-1" disabled value={currentFarm.stock}/></div>
             </div>

             <hr className="my-4"/>

             <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Mortality Section */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-md border-b pb-1">Mortality Details</h4>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="text-xs font-bold">Mortality Qty</label>
                            <input type="number" name="mortalityQty" value={currentFarm.mortalityQty} onChange={handleFarmChange} className="w-full border p-2 rounded text-sm" />
                        </div>
                         <div>
                            <label className="text-xs font-bold">Upload Photo</label>
                            <div className="flex items-center border rounded bg-white">
                                <label className="cursor-pointer p-2 py-2.5 w-full flex items-center justify-center">
                                    <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
                                    <LuUpload className="mr-2 text-orange-500"/> 
                                    <span className="text-xs truncate max-w-[100px]">
                                        {currentFarm.mortalityPhoto ? currentFarm.mortalityPhoto.name : 'Choose'}
                                    </span>
                                </label>
                            </div>
                        </div>
                        <div className="col-span-2">
                             <label className="text-xs font-bold">Reason</label>
                             <select name="mortalityReason" value={currentFarm.mortalityReason} onChange={handleFarmChange} className="w-full border p-2 rounded text-sm">
                                <option value="">Select Reason</option>
                                <option value="Sudden Death">Sudden Death</option>
                                <option value="Weakness">Weakness</option>
                                <option value="Disease">Disease</option>
                            </select>
                        </div>
                         <div className="col-span-2">
                             <label className="text-xs font-bold">Treatment</label>
                             <input type="text" name="treatment" value={currentFarm.treatment} onChange={handleFarmChange} className="w-full border p-2 rounded text-sm" />
                        </div>
                        {/* Autos */}
                         <div><label className="text-xs font-bold text-gray-600">Cum. Mort.</label><input className="w-full border p-2 rounded text-sm bg-gray-100 mt-1" disabled value={currentFarm.cumMortality}/></div>
                         <div><label className="text-xs font-bold text-gray-600">Cum. Mort %</label><input className="w-full border p-2 rounded text-sm bg-gray-100 mt-1" disabled value={currentFarm.cumMortalityPerc}/></div>
                    </div>
                </div>

                {/* Feed Section */}
                <div className="space-y-3">
                    <h4 className="font-semibold text-md border-b pb-1">Feed Consumption</h4>
                     <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                             <label className="text-xs text-gray-400">Feed Material</label>
                             <input className="w-full bg-gray-100 border p-2 text-sm rounded" disabled value={currentFarm.feedMaterial}/>
                        </div>
                         <div>
                             <label className="text-xs text-gray-400">Stock (Bags)</label>
                             <input className="w-full bg-gray-100 border p-2 text-sm rounded" disabled value={currentFarm.feedStockBags}/>
                        </div>
                         <div>
                            <label className="text-xs font-bold">Qty Used</label>
                            <input type="number" name="feedQty" value={currentFarm.feedQty} onChange={handleFarmChange} className="w-full border p-2 rounded text-sm" placeholder="Enter Qty"/>
                        </div>
                         {/* Autos */}
                         <div><label className="text-xs font-bold text-gray-600">Cum. Feed</label><input className="w-full border p-2 rounded text-sm bg-gray-100 mt-1" disabled value={currentFarm.cumFeed}/></div>
                         <div><label className="text-xs font-bold text-gray-600">Total Feed</label><input className="w-full border p-2 rounded text-sm bg-gray-100 mt-1" disabled value={currentFarm.totalFeed}/></div>
                     </div>
                </div>
             </div>

             {/* Add Button */}
             <div className="mt-6">
                <button 
                    onClick={handleAddFarm}
                    type="button" 
                    className="w-full bg-gray-100 text-gray-800 border border-gray-300 py-2 rounded-lg font-semibold hover:bg-gray-200 transition flex justify-center items-center gap-2"
                >
                    <span>+ Add Farm</span>
                </button>
             </div>
          </div>

          {/* --- SECTION 3: PREVIEW TABLE --- */}
          <div className="overflow-x-auto">
             <table className="w-full border text-xs text-left">
                <thead className="bg-gray-100 font-semibold text-gray-700 uppercase">
                    <tr>
                        <th className="p-2 border">Plant</th>
                        <th className="p-2 border">Farmer</th>
                        <th className="p-2 border">Batch</th>
                        <th className="p-2 border">Mortality</th>
                        <th className="p-2 border">Feed Qty</th>
                        <th className="p-2 border">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y">
                    {farmList.length === 0 ? (
                        <tr><td colSpan="6" className="p-4 text-center text-gray-400">No farms added yet.</td></tr>
                    ) : (
                        farmList.map((item, idx) => (
                            <tr key={item.id} className="hover:bg-gray-50">
                                <td className="p-2 border">{generalInfo.plant}</td>
                                <td className="p-2 border">{item.farmer}</td>
                                <td className="p-2 border">{item.batchNo}</td>
                                <td className="p-2 border">{item.mortalityQty || 0}</td>
                                <td className="p-2 border">{item.feedQty || 0}</td>
                                <td className="p-2 border text-center">
                                    <button onClick={() => removeFarmFromList(item.id)} className="text-red-500 hover:text-red-700"><RiDeleteBin6Line size={16}/></button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
             </table>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-4 mt-4 pb-4">
            <button onClick={closeModal} className="px-6 py-2.5 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Cancel</button>
            <button 
                onClick={handleFinalSubmit} 
                disabled={isSubmitting}
                className="px-6 py-2.5 bg-orange-500 text-white rounded-md hover:bg-orange-600 flex items-center gap-2 disabled:opacity-70"
            >
                {isSubmitting ? 'Saving...' : (editData ? 'Update' : 'Submit')}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}