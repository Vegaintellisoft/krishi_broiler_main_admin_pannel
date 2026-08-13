import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function FlockMaster() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        flockNo: '',
        flockName: '',
        hatcheryDate: '',
        status: 'A'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        // Simulate API call
        setTimeout(() => {
            setLoading(false);
            navigate('/flockmaster');
        }, 1000);
    };

    return (
        <div className="p-6 bg-[#F9F9FC] min-h-screen font-poppins text-[#1C1C1C]">
            <div className="flex justify-between items-center mb-6 max-w-4xl">
                <div>
                    <h1 className="text-lg font-bold">Add Flock Master</h1>
                    <p className="text-[10px] text-gray-500 mt-1">Create a new flock record in the system</p>
                </div>
                <button
                    className="flex items-center gap-2 bg-white text-[#D4AF37] border border-[#D4AF37] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#D4AF37] hover:text-white transition-all shadow-sm"
                    onClick={() => navigate('/flockmaster')}
                >
                    <FiArrowLeft /> Back
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-700">
                                Flock No <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="flockNo"
                                value={formData.flockNo}
                                onChange={handleChange}
                                placeholder="E.g. FL-2024-001"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-100 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white transition-all shadow-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-700">
                                Flock Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="flockName"
                                value={formData.flockName}
                                onChange={handleChange}
                                placeholder="Enter flock name"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-100 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white transition-all shadow-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-700">
                                Hatchery Date <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="date"
                                name="hatcheryDate"
                                value={formData.hatcheryDate}
                                onChange={handleChange}
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-100 text-[10px] text-gray-500 focus:text-gray-700 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white transition-all shadow-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-700">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    name="status"
                                    value={formData.status}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-100 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white transition-all appearance-none cursor-pointer shadow-sm"
                                >
                                    <option value="A">Active</option>
                                    <option value="I">Inactive</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-[#D4AF37]">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end gap-x-4 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/flockmaster')}
                            disabled={loading}
                            className="px-8 py-2 bg-[#F3F4F6] text-[#4B5563] rounded-lg font-bold text-[10px] hover:bg-gray-200 transition-all min-w-[120px] shadow-sm"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-10 py-2.5 bg-[#D4AF37] text-white rounded-lg font-bold text-[10px] hover:bg-[#B8962F] shadow-md transition-all min-w-[140px] disabled:opacity-50 flex justify-center items-center"
                        >
                            {loading ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Submitting...
                                </div>
                            ) : (
                                "Submit"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
