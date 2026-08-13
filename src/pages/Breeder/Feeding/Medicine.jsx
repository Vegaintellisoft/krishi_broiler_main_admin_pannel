import React from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Swal from "sweetalert2";

export default function Medicine() {
  const navigate = useNavigate();
  const items = [
    "BVCL02-100M TABLET",
    "AMIKACIN INJECTION IP 100ML",
    "MICROFLOX-10k",
    "koloxin sh-500ml",
    "SUPERFIX",
    "ibh k - 1000 doses",
    "kaysol forte 50gm",
    "selko ph (ml)",
    "bleaching powder-calcium hypochlorite35%",
    "inactivated nd 2000 (vwrd)",
    "biospark-v (5 liter)",
    "streswel (5 litter)",
    "aquamax (5 litter)",
    "lg094 (5 litter)",
    "ib multi killed - 1000 doses",
    "fowl pox - 1000 doses",
    "diluent",
    "formalin",
    "brotone vet",
    "nd r2live - 1000 doses",
    "roundup herbicide",
    "super snazz liquid(1ltr)",
    "flyuct power pellets(500gms)",
    "dynamutin 80%"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    Swal.fire({
      icon: 'success',
      title: 'Medicine Added',
      text: 'Medicine data submitted successfully (Simulated)',
      confirmButtonColor: '#d4af37'
    });
    navigate('/medicine');
  };

  return (
    <div className="p-5 font-poppins bg-[#f9f9fc] min-h-screen text-[#1c1c1c]">
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-lg font-bold m-0">Add Medicine</h2>
        <button 
          className="flex items-center gap-2 bg-white text-[#c9a42d] border border-[#c9a42d] px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#c9a42d] hover:text-white transition-all hover:-translate-x-0.5"
          onClick={() => navigate('/medicine')}
        >
          <FiArrowLeft /> Back
        </button>
      </div>

      <div className="bg-white p-6 rounded-[20px] shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-[#f0f0f0] w-full max-w-[900px]">
        <form onSubmit={handleSubmit}>
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#f0f0f0]">
                <th className="text-left py-3 text-[#c9a42d] text-[13px] font-bold uppercase tracking-[0.5px]">Items</th>
                <th className="text-left py-3 text-[#c9a42d] text-[13px] font-bold uppercase tracking-[0.5px]">Opening Stock</th>
                <th className="text-left py-3 text-[#c9a42d] text-[13px] font-bold uppercase tracking-[0.5px]">Con Qty</th>
              </tr>
            </thead>

            <tbody>
              {items.map((item, index) => (
                <tr key={index} className="border-b border-[#fafafa]">
                  <td className="py-4 text-[13px] font-semibold text-[#1c1c1c]">{item}</td>
                  <td className="py-4">
                    <input 
                      type="text" 
                      className="w-[100px] h-9 border border-[#eee] rounded-xl outline-none px-3 text-[13px] bg-[#fcfcfc] transition-all focus:border-[#c9a42d] focus:bg-white focus:shadow-[0_0_0_3px_rgba(201,164,45,0.1)]" 
                    />
                  </td>
                  <td className="py-4">
                    <input 
                      type="text" 
                      className="w-[100px] h-9 border border-[#eee] rounded-xl outline-none px-3 text-[13px] bg-[#fcfcfc] transition-all focus:border-[#c9a42d] focus:bg-white focus:shadow-[0_0_0_3px_rgba(201,164,45,0.1)]" 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="mt-10 flex justify-end gap-5">
            <button 
              type="button" 
              className="bg-[#f0f0f0] text-[#4a4c56] px-10 py-3 rounded-xl border-none font-semibold text-[14px] hover:bg-[#e5e5e5] transition-colors"
              onClick={() => navigate('/medicine')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="bg-[#c9a42d] text-white px-10 py-3 rounded-xl border-none font-semibold text-[14px] hover:bg-[#b39228] transition-all hover:-translate-y-0.5 shadow-[0_4px_15px_rgba(201,164,45,0.2)]"
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
