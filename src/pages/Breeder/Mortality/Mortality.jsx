import React, { useState, useEffect, useRef } from "react";
import { FaArrowRight } from "react-icons/fa";
import Swal from "sweetalert2";

export default function Mortality() {
  const [henTypes, setHenTypes] = useState([]);
  const [formData, setFormData] = useState({
    entry_date: new Date().toISOString().split('T')[0],
    hen_type_id: "",
    shed_no: "",
    part_row_no: "",
    line_no: "",
    no_of_birds: "",
    male_count: "",
    female_count: "",
    reason: "",
    morning: "",
    afternoon: "",
    evening: "",
  });

  const [files, setFiles] = useState({
    collection_photo: [],
    dead_bird_collection_bin: [],
    hygiene_dead_bird_disposal: [],
    mortality_dip_ms_solution: [],
    mortality_pit_fly_control: [],
    mortality_pit_odour_control: [],
  });

  const [uploadTarget, setUploadTarget] = useState(null);
  const fileInputRef = useRef(null);
  const [submitStatus, setSubmitStatus] = useState({ message: "", type: "" });

  const resetForm = () => {
    setFormData({
      entry_date: new Date().toISOString().split('T')[0],
      hen_type_id: "",
      shed_no: "",
      part_row_no: "",
      line_no: "",
      no_of_birds: "",
      male_count: "",
      female_count: "",
      reason: "",
      morning: "",
      afternoon: "",
      evening: "",
    });
    setFiles({
      collection_photo: [],
      dead_bird_collection_bin: [],
      hygiene_dead_bird_disposal: [],
      mortality_dip_ms_solution: [],
      mortality_pit_fly_control: [],
      mortality_pit_odour_control: [],
    });
  };

  useEffect(() => {
    if (submitStatus.message) {
      const timer = setTimeout(() => setSubmitStatus({ message: "", type: "" }), 5000);
      return () => clearTimeout(timer);
    }
  }, [submitStatus]);

  useEffect(() => {
    const fetchHenTypes = async () => {
      // Static dummy data for hen types
      setHenTypes([
        { id: 1, type_name: "Lohmann Brown - Male" },
        { id: 2, type_name: "Lohmann Brown - Female" },
        { id: 3, type_name: "Hy-Line Silver - Male" },
        { id: 4, type_name: "Hy-Line Silver - Female" }
      ]);
    };
    fetchHenTypes();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    const total = (Number(formData.male_count) || 0) + (Number(formData.female_count) || 0);
    if (total > 0) {
      setFormData(prev => ({ ...prev, no_of_birds: total.toString() }));
    }
  }, [formData.male_count, formData.female_count]);

  const handleFileClick = (field) => {
    setUploadTarget(field);
    fileInputRef.current.click();
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles((prev) => ({
        ...prev,
        [uploadTarget]: [...prev[uploadTarget], ...newFiles],
      }));
      setUploadTarget(null);
    }
  };

  const removeFile = (field, index) => {
    setFiles((prev) => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitStatus({ message: "", type: "" });

    if (!formData.hen_type_id) {
      setSubmitStatus({ message: "Please select Hen Type", type: "error" });
      return;
    }
    if (!formData.shed_no.trim()) {
      setSubmitStatus({ message: "Shed No is required", type: "error" });
      return;
    }
    if (!formData.part_row_no.trim()) {
      setSubmitStatus({ message: "Part / Row No is required", type: "error" });
      return;
    }
    if (!formData.line_no.trim()) {
      setSubmitStatus({ message: "Line No is required", type: "error" });
      return;
    }
    if (!formData.no_of_birds || Number(formData.no_of_birds) <= 0) {
      setSubmitStatus({ message: "No of Birds is required", type: "error" });
      return;
    }
    if (formData.morning === "") {
      setSubmitStatus({ message: "Morning is required", type: "error" });
      return;
    }

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      Swal.fire({
        icon: 'success',
        title: 'Mortality Saved',
        text: 'Mortality entry saved successfully (Simulated)',
        confirmButtonColor: '#d4af37'
      });
      resetForm();
    } catch (error) {
      console.error("Submission Error:", error);
      setSubmitStatus({ message: "An error occurred while saving", type: "error" });
    }
  };

  const totalQty = (Number(formData.morning) || 0) + (Number(formData.afternoon) || 0) + (Number(formData.evening) || 0);

  return (
    <div className="p-6 font-poppins bg-[#f9f9fc] min-h-screen text-[#1c1c1c]">
      <div className="flex justify-between items-center mb-[20px]">
        <h3 className="text-[16px] font-bold m-0 text-[#1c1c1c]">Add Mortality</h3>
        {submitStatus.message && (
          <div className={`px-4 py-2 rounded-lg text-sm font-semibold animate-fade-in ${submitStatus.type === 'success' ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200'
            }`}>
            {submitStatus.message}
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit}>
        {/* Top Section */}
        <div className="bg-white p-5 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.08)] mb-5 w-full">
          <div className="flex gap-4">
            <select
              name="hen_type_id"
              className="w-64 p-2.5 border border-[#dadada] rounded-lg text-sm bg-white outline-none"
              value={formData.hen_type_id}
              onChange={handleInputChange}
            >
              <option value="">Select Hen Type</option>
              {henTypes.map((hen) => (
                <option key={hen.id} value={hen.id}>
                  {hen.type_name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Two Boxes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Left Items Box */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_3px_10px_rgba(0,0,0,0.1)] flex flex-col gap-3">
            <div className="flex justify-between font-semibold border-b pb-2 mb-2 text-[14px]">
              <span>Items</span>
              <span>Cont Qty</span>
            </div>

            {[
              { label: "Shed No", name: "shed_no" },
              { label: "Part / Row No", name: "part_row_no" },
              { label: "Line No", name: "line_no" },
              { label: "Male Count", name: "male_count" },
              { label: "Female Count", name: "female_count" },
              { label: "Total Birds", name: "no_of_birds" },
            ].map((item) => (
              <div className="flex justify-between items-center text-[13px]" key={item.name}>
                <label className="font-medium">{item.label} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name={item.name}
                  value={formData[item.name]}
                  onChange={handleInputChange}
                  className="w-[80px] p-1.5 border border-[#ddd] rounded-md text-center text-xs outline-none bg-white focus:border-[#d4af37]"
                />
              </div>
            ))}
          </div>

          {/* Reporting Schedule */}
          <div className="bg-white p-6 rounded-2xl shadow-[0_3px_10px_rgba(0,0,0,0.1)] flex flex-col gap-3">
            <div className="flex justify-between font-semibold border-b pb-2 mb-2 text-[14px]">
              <span>Reporting Schedule</span>
              <span>Cont Qty</span>
            </div>

            {[
              { label: "Morning", name: "morning" },
              { label: "Afternoon", name: "afternoon" },
              { label: "Evening", name: "evening" },
            ].map((item) => (
              <div className="flex justify-between items-center text-[13px]" key={item.name}>
                <label className="font-medium">{item.label} <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name={item.name}
                  value={formData[item.name]}
                  onChange={handleInputChange}
                  className="w-[80px] p-1.5 border border-[#ddd] rounded-md text-center text-xs outline-none bg-white focus:border-[#d4af37]"
                />
              </div>
            ))}

            <div className="flex justify-between items-center text-[13px] pt-2 border-t mt-2">
              <label className="font-semibold text-gray-700">Total</label>
              <input
                type="text"
                value={totalQty}
                readOnly
                className="w-[80px] p-1.5 border border-transparent rounded-md text-center text-sm font-semibold bg-[#e2ce8d]"
              />
            </div>
          </div>
        </div>

        {/* Remarks */}
        <div className="flex flex-col gap-1.5 mb-6">
          <label className="text-[13px] font-medium text-gray-600">Reason / Remarks</label>
          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleInputChange}
            className="w-full h-24 p-3 border border-[#ddd] rounded-xl text-sm outline-none resize-none bg-white focus:border-[#d4af37]"
          ></textarea>
        </div>

        {/* Photo Upload */}
        <h4 className="text-[14px] font-semibold mb-3">Photo Upload :</h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5 mb-10">
          {[
            { id: "collection_photo", label: "Upload Collection Photo :" },
            { id: "dead_bird_collection_bin", label: "Dead Bird Collection BIN :" },
            { id: "hygiene_dead_bird_disposal", label: "Hygiene Dead Bird Disposal :" },
            { id: "mortality_dip_ms_solution", label: "Mortality – Dip In MS Solution :" },
            { id: "mortality_pit_fly_control", label: "Mortality PIT – Spray (Fly Control) :" },
            { id: "mortality_pit_odour_control", label: "Mortality PIT – Spray (Odour Control) :" },
          ].map((item) => (
            <div key={item.id} className="flex flex-col">
              <button
                type="button"
                className="w-full bg-white p-4 flex justify-between items-center rounded-xl shadow-sm border border-[#f0f0f0] cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => handleFileClick(item.id)}
              >
                <span className="text-[13px] font-medium text-gray-700">{item.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400">({files[item.id].length} files)</span>
                  <FaArrowRight className="text-[#d9534f] text-[15px]" />
                </div>
              </button>
              {files[item.id].length > 0 && (
                <div className="mt-2 text-xs text-gray-500 flex flex-col gap-1">
                  {files[item.id].map((f, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-100 p-1 px-2 rounded">
                      <span className="truncate w-40">{f.name}</span>
                      <button type="button" onClick={() => removeFile(item.id, i)} className="text-red-500 font-bold px-1.5">✕</button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Hidden File Input */}
        <input
          type="file"
          multiple
          ref={fileInputRef}
          className="hidden"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Bottom Buttons */}
        <div className="flex justify-end gap-4 mt-6">
          <button
            type="button"
            className="px-8 py-2.5 bg-[#b3b3b3] text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-gray-500 transition-colors"
            onClick={() => window.location.reload()}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-8 py-2.5 bg-[#d4af37] text-white rounded-lg text-sm font-bold cursor-pointer hover:bg-[#bc9a2f] transition-colors shadow-sm"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
