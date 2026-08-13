import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaClock, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiArrowLeft } from "react-icons/fi";
import Swal from "sweetalert2";

export default function EggCollection() {
  const navigate = useNavigate();
  const [maxShed, setMaxShed] = useState(12);
  const [activeShed, setActiveShed] = useState(1);
  const [activeGrade, setActiveGrade] = useState("7 To 8");

  const tabs = Array.from({ length: maxShed }, (_, i) => i + 1);

  const handleMaxShedChange = (e) => {
    const val = parseInt(e.target.value.replace("Shed ", "")) || 1;
    setMaxShed(val);
    if (activeShed > val) setActiveShed(1);
  };

  const handleNextShed = () => {
    setActiveShed((prev) => (prev < maxShed ? prev + 1 : 1));
  };

  const handlePrevShed = () => {
    setActiveShed((prev) => (prev > 1 ? prev - 1 : maxShed));
  };

  const [eggCounts, setEggCounts] = useState({
    broiler: "01",
    crack: "0",
    jumbo: "020",
    table: "03",
    waste: "1234"
  });

  const handleInputChange = (field, value) => {
    setEggCounts(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    Swal.fire({
      icon: 'success',
      title: 'Progress Saved',
      text: 'Draft saved successfully (Simulated)',
      timer: 1500,
      showConfirmButton: false
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: 'success',
      title: 'Submitted!',
      text: 'Egg collection submitted successfully (Simulated)',
      confirmButtonColor: '#d4af37'
    });
    navigate('/eggcollection');
  };

  const lineTotal = Object.values(eggCounts).reduce((acc, curr) => acc + (parseInt(curr) || 0), 0);

  return (
    <div className="p-5 font-poppins bg-[#f9f9fc] min-h-screen text-[#1c1c1c]">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold m-0">Add Egg collection</h2>
        <button
          className="flex items-center gap-2 bg-white text-[#c9a42d] border border-[#c9a42d] px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#c9a42d] hover:text-white transition-all hover:-translate-x-0.5"
          onClick={() => navigate('/eggcollection')}
        >
          <FiArrowLeft /> Back
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Top Form Card */}
        <div className="bg-white p-5 rounded-[20px] shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-[#f0f0f0] mb-5 flex flex-col gap-4">
          <div className="w-full">
            <select
              className="p-1.5 px-3 border border-[#f0f0f0] rounded-lg bg-white text-[13px] font-medium min-w-[160px]"
              value={`Shed ${maxShed}`}
              onChange={handleMaxShedChange}
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => (
                <option key={n} value={`Shed ${n}`}>Shed {n}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-between items-center gap-2 w-full">
            <div className="flex items-center gap-2">
              <label className="font-semibold text-[13px] text-[#1c1c1c] whitespace-nowrap">Date :</label>
              <input type="date" className="p-1.5 px-2 border border-[#f9f9f9] rounded-md bg-[#fbfbfb] text-xs text-center text-[#333] outline-none w-[120px]" defaultValue="2025-09-23" />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-[13px] text-[#1c1c1c] whitespace-nowrap">Schedule Time :</label>
              <div className="relative flex items-center">
                <input type="text" className="p-1.5 px-2 border border-[#f9f9f9] rounded-md bg-[#fbfbfb] text-xs text-center text-[#333] outline-none w-[85px] pr-6" value="9:00 am" readOnly />
                <FaClock className="absolute right-2 text-[#999] text-xs" />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-[13px] text-[#1c1c1c] whitespace-nowrap">Collection :</label>
              <input type="text" className="p-1.5 px-2 border border-[#f9f9f9] rounded-md bg-[#fbfbfb] text-xs text-center text-[#333] outline-none w-[85px]" value="monday" readOnly />
            </div>

            <div className="flex items-center gap-2">
              <label className="font-semibold text-[13px] text-[#1c1c1c] whitespace-nowrap">Collected Time :</label>
              <div className="relative flex items-center">
                <input type="text" className="p-1.5 px-2 border border-[#f9f9f9] rounded-md bg-[#fbfbfb] text-xs text-center text-[#333] outline-none w-[85px] pr-6" value="9:30 am" readOnly />
                <FaClock className="absolute right-2 text-[#e65127] text-xs" />
              </div>
            </div>
          </div>
        </div>

        {/* Main Interaction Card */}
        <div className="bg-white rounded-[20px] shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-[#f0f0f0] mb-8 overflow-hidden">
          {/* Shed Navigation Header */}
          <div className="bg-[#f4f4f4] py-2 flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-3">
              <button type="button" className="bg-[#b5b5b5] text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer text-xs" onClick={handlePrevShed}><FaChevronLeft /></button>
              <span className="text-[19px] font-bold text-[#1c1c1c]">Shed {activeShed}</span>
              <button type="button" className="bg-[#b5b5b5] text-white w-6 h-6 rounded-full flex items-center justify-center cursor-pointer text-xs" onClick={handleNextShed}><FaChevronRight /></button>
            </div>
            <div className="w-full overflow-x-auto flex justify-center py-1.5 scrollbar-thin scrollbar-thumb-gray-400">
              <div className="flex gap-2.5 px-5">
                {tabs.map(num => (
                  <button
                    type="button"
                    key={num}
                    className={`w-7 h-6 rounded-md border-none text-white cursor-pointer font-semibold text-[11px] relative ${activeShed === num ? "bg-[#8e8e8e]" : "bg-[#b5b5b5]"}`}
                    onClick={() => setActiveShed(num)}
                  >
                    {num}
                    {activeShed === num && <span className="absolute -top-1 -right-0.5 bg-[#4caf50] text-white w-3.5 h-3.5 rounded-full text-[9px] flex items-center justify-center border border-white">✔</span>}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-5">
            {/* Column 1: Egg Type\Line */}
            <div className="border border-[#f0f0f0] rounded-xl overflow-hidden">
              <div className="bg-white p-2 text-center font-bold text-[13px] border-b border-[#f0f0f0]">Egg Type\Line</div>
              <div className="p-4 flex flex-col gap-2.5">
                {[['BROILER EGG', 'broiler'], ['crack egg', 'crack'], ['JUMBO EGG', 'jumbo'], ['TABLE EGG', 'table'], ['WASTE /REJECT EGG', 'waste']].map(([label, field]) => (
                  <div className="flex justify-between items-center" key={field}>
                    <span className="text-[11px] font-semibold text-[#4a4c56] uppercase">{label}</span>
                    <input type="text" className="w-12 p-1 border border-[#eee] rounded text-center text-xs bg-white" value={eggCounts[field]} onChange={(e) => handleInputChange(field, e.target.value)} />
                  </div>
                ))}
              </div>
              <div className="p-2 px-4 bg-[#fcfcfc] border-top border-[#f0f0f0] flex justify-between font-bold text-[13px]">
                <span className="text-[#c9a42d]">Line Total</span>
                <span>{lineTotal}</span>
              </div>
            </div>

            {/* Column 2: Egg Grading (Quick) */}
            <div className="border border-[#f0f0f0] rounded-xl overflow-hidden">
              <div className="bg-white p-2 text-center font-bold text-[13px] border-b border-[#f0f0f0]">Egg Grading (Quick)</div>
              <div className="p-4 grid grid-cols-3 gap-2">
                {[
                  "7 To 8", "9 To 10", "10 To 11",
                  "11 To 1", "1 To 2", "2 To 3",
                  "3 To 4", "4 To 5:30", "7 To 8",
                  "CUM"
                ].map((slot, idx) => (
                  <button
                    type="button"
                    key={idx}
                    className={`border border-[#eee] bg-red p-2 rounded text-[10px] font-semibold text-[#4a4c56] cursor-pointer text-center ${activeGrade === slot ? "bg-[#e65127] text-white border-[#e65127]" : ""}`}
                    onClick={() => setActiveGrade(slot)}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Column 3: Summary */}
            <div className="border border-[#f0f0f0] rounded-xl overflow-hidden">
              <div className="bg-white p-2 text-center font-bold text-[13px] border-b border-[#f0f0f0]">Summary</div>
              <div className="p-4 flex flex-col gap-2.5">
                {["Hatching Egg", "Table Egg", "Jumbo Egg", "Crack Egg", "Waste/Reject Egg"].map((label) => (
                  <div className="flex justify-between items-center" key={label}>
                    <span className="text-[12px] font-semibold text-[#4a4c56]">{label}</span>
                    <input type="text" className="w-12 p-1 border border-[#eee] rounded text-center text-xs" value="0" readOnly />
                  </div>
                ))}
                <div className="mt-2.5 pt-2.5 border-t border-[#f0f0f0] flex justify-between items-center">
                  <span className="font-bold text-[#c9a42d] text-[13px]">Grand Total</span>
                  <input type="text" className="w-12 p-1 border border-[#eee] rounded text-center text-xs" value="0" readOnly />
                </div>
              </div>
            </div>
          </div>

          <div className="px-5 pb-5 flex justify-end">
            <button type="button" className="bg-[#e65127] text-white border-none px-9 py-1.5 rounded-lg font-bold text-[14px] cursor-pointer hover:opacity-90 hover:-translate-y-0.5 transition-all" onClick={handleSave}>Save</button>
          </div>
        </div>

        {/* Global Buttons */}
        <div className="flex justify-end gap-4 mt-4">
          <button
            type="button"
            className="bg-[#8e8e8e] text-white border-none px-9 py-1.5 rounded-lg font-bold text-[14px] cursor-pointer hover:opacity-90 hover:-translate-y-0.5 transition-all"
            onClick={() => navigate('/eggcollection')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="bg-[#c9a42d] text-white border-none px-9 py-1.5 rounded-lg font-bold text-[14px] cursor-pointer hover:opacity-90 hover:-translate-y-0.5 transition-all"
          >
            Submit
          </button>
        </div>
      </form>
    </div>
  );
}
