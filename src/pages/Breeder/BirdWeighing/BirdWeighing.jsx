import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FiArrowLeft } from "react-icons/fi";
import Swal from "sweetalert2";

export default function BirdWeighing() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        entry_date: new Date().toISOString().split("T")[0],
        hen_type_id: "",
        gender: "",
        actual_weight_g: "",
        sample_weight_g: "",
        schedule: "",
        std_dev_pct: "",
        uniformity_pct: "",
    });

    const [sampleWeightPct, setSampleWeightPct] = useState("");
    const [submitStatus, setSubmitStatus] = useState({ message: "", type: "" });

    const resetForm = () => {
        setFormData({
            entry_date: new Date().toISOString().split("T")[0],
            hen_type_id: "",
            gender: "",
            actual_weight_g: "",
            sample_weight_g: "",
            schedule: "",
            std_dev_pct: "",
            uniformity_pct: "",
        });
        setSampleWeightPct("");
    };

    useEffect(() => {
        if (submitStatus.message) {
            const timer = setTimeout(() => setSubmitStatus({ message: "", type: "" }), 5000);
            return () => clearTimeout(timer);
        }
    }, [submitStatus.message]);

    // Auto-calculate Sample Weight %
    useEffect(() => {
        const actual = Number(formData.actual_weight_g);
        const sample = Number(formData.sample_weight_g);
        if (actual > 0 && sample > 0) {
            const pct = ((sample / actual) * 100).toFixed(2);
            setSampleWeightPct(pct);
        } else {
            setSampleWeightPct("");
        }
    }, [formData.actual_weight_g, formData.sample_weight_g]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleHenTypeChange = (e) => {
        const value = e.target.value;
        if (value === "1") {
            setFormData((prev) => ({ ...prev, hen_type_id: "1", gender: "male" }));
        } else if (value === "2") {
            setFormData((prev) => ({ ...prev, hen_type_id: "2", gender: "female" }));
        } else {
            setFormData((prev) => ({ ...prev, hen_type_id: "", gender: "" }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitStatus({ message: "", type: "" });

        if (!formData.hen_type_id) {
            setSubmitStatus({ message: "Please select Hen Type", type: "error" });
            return;
        }
        if (!formData.actual_weight_g || Number(formData.actual_weight_g) <= 0) {
            setSubmitStatus({ message: "Actual Weight is required", type: "error" });
            return;
        }

        try {
            await new Promise(resolve => setTimeout(resolve, 800));
            Swal.fire({
                icon: 'success',
                title: 'Weight Saved',
                text: 'Bird weighing saved successfully (Simulated)',
                confirmButtonColor: '#d4af37'
            });
            resetForm();
        } catch (error) {
            console.error("Submission Error:", error);
            setSubmitStatus({ message: "An error occurred while saving", type: "error" });
        }
    };

    return (
        <div className="p-6 font-poppins bg-[#f9f9fc] min-h-screen text-[#1c1c1c]">
            <div className="flex justify-between items-center mb-[20px]">
                <h3 className="text-[16px] font-bold m-0 text-[#1c1c1c]">Add Bird Weighing</h3>
                <button
                    type="button"
                    className="flex items-center gap-2 bg-white text-[#c9a42d] border border-[#c9a42d] px-4 py-2 rounded-lg text-[13px] font-semibold hover:bg-[#c9a42d] hover:text-white transition-all hover:-translate-x-1"
                    onClick={() => navigate('/birdweighing')}
                >
                    <FiArrowLeft /> Back
                </button>
            </div>

            {submitStatus.message && (
                <div className={`mb-4 px-4 py-2 rounded-lg text-sm font-semibold animate-fade-in inline-block ${submitStatus.type === "success" ? "bg-green-100 text-green-700 border border-green-200" : "bg-red-100 text-red-700 border border-red-200"
                    }`}>
                    {submitStatus.message}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                {/* Top Card */}
                <div className="bg-white p-6 rounded-2xl shadow-[0_3px_10px_rgba(0,0,0,0.08)] mb-6 flex flex-col gap-4">
                    <select
                        name="hen_type_id"
                        className="w-64 p-2.5 border border-[#ddd] rounded-lg text-sm bg-white outline-none focus:border-[#d4af37]"
                        value={formData.hen_type_id}
                        onChange={handleHenTypeChange}
                    >
                        <option value="">Select Hen Type *</option>
                        <option value="1">Male</option>
                        <option value="2">Female</option>
                    </select>
                </div>

                {/* Two Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Left Box - Subject Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-[0_3px_10px_rgba(0,0,0,0.08)] flex flex-col gap-3">
                        <h4 className="font-semibold text-[#d4af37] text-sm">Subject Details</h4>
                        <div className="border-b border-gray-200 mb-2"></div>

                        {[
                            { label: "Actual Weight (G)", name: "actual_weight_g", type: "number" },
                            { label: "Sample Weight (G)", name: "sample_weight_g", type: "number" },
                        ].map((item) => (
                            <div className="flex justify-between items-center text-[13px]" key={item.name}>
                                <label className="font-medium">{item.label} <span className="text-red-500">*</span></label>
                                <input
                                    type={item.type}
                                    name={item.name}
                                    value={formData[item.name]}
                                    onChange={handleInputChange}
                                    className="w-[90px] p-1.5 border border-[#ccc] rounded-md text-center text-xs outline-none focus:border-[#d4af37]"
                                />
                            </div>
                        ))}

                        <div className="flex justify-between items-center text-[13px]">
                            <label className="font-medium">Sample Weight (%)</label>
                            <input
                                type="text"
                                value={sampleWeightPct ? `${sampleWeightPct}%` : ""}
                                readOnly
                                className="w-[90px] p-1.5 border border-[#ccc] rounded-md text-center text-xs outline-none focus:border-[#d4af37]"
                            />
                        </div>
                    </div>

                    {/* Right Box - Grading Schedule */}
                    <div className="bg-white p-6 rounded-2xl shadow-[0_3px_10px_rgba(0,0,0,0.08)] flex flex-col gap-3">
                        <h4 className="font-semibold text-[#d4af37] text-sm">Grading Schedule</h4>
                        <div className="border-b border-gray-200 mb-2"></div>

                        {[
                            { label: "Schedule", name: "schedule", type: "text" },
                            { label: "Std. Dev. (%)", name: "std_dev_pct", type: "number" },
                            { label: "Uniformity (%)", name: "uniformity_pct", type: "number" },
                        ].map((item) => (
                            <div className="flex justify-between items-center text-[13px]" key={item.name}>
                                <label className="font-medium">{item.label} <span className="text-red-500">*</span></label>
                                <input
                                    type={item.type}
                                    name={item.name}
                                    value={formData[item.name]}
                                    onChange={handleInputChange}
                                    className="w-[90px] p-1.5 border border-[#ccc] rounded-md text-center text-xs outline-none focus:border-[#d4af37]"
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Bottom Buttons */}
                <div className="flex justify-end gap-4 mt-4">
                    <button
                        type="button"
                        className="px-8 py-2.5 bg-[#8c8c8c] text-white rounded-lg text-sm font-semibold cursor-pointer hover:bg-gray-500 transition-colors"
                        onClick={() => navigate('/birdweighing')}
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
