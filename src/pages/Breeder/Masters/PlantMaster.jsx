import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

export default function PlantMaster() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        plant: '',
        name: '',
        company_name: '',
        city1: '',
        address_version: '',
        name_2: '',
        postal_code: ''
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
            navigate('/plantmaster');
        }, 1000);
    };

    return (
        <div className="p-6 bg-[#F9F9FC] min-h-screen font-poppins text-[#1C1C1C]">
            <div className="flex justify-between items-center mb-6 max-w-4xl">
                <div>
                    <h1 className="text-lg font-bold">Add Plant Master</h1>
                    <p className="text-[10px] text-gray-500 mt-1">Create a new plant record in the system</p>
                </div>
                <button
                    className="flex items-center gap-2 bg-white text-[#D4AF37] border border-[#D4AF37] px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#D4AF37] hover:text-white transition-all shadow-sm"
                    onClick={() => navigate('/plantmaster')}
                >
                    <FiArrowLeft /> Back
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden max-w-4xl p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-700">
                                Plant ID <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="plant"
                                value={formData.plant}
                                onChange={handleChange}
                                placeholder="E.g. PS001"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-100 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white transition-all shadow-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-700">
                                Plant Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="E.g. Hosur Breeding Farm"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-100 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white transition-all shadow-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-700">
                                Company Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="company_name"
                                value={formData.company_name}
                                onChange={handleChange}
                                placeholder="E.g. Krishi Farms Ltd"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-100 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white transition-all shadow-sm"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-700">
                                City
                            </label>
                            <input
                                type="text"
                                name="city1"
                                value={formData.city1}
                                onChange={handleChange}
                                placeholder="E.g. Hosur"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-100 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white transition-all shadow-sm"
                            />
                        </div>
                        
                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-700">
                                Address Line 1
                            </label>
                            <input
                                type="text"
                                name="address_version"
                                value={formData.address_version}
                                onChange={handleChange}
                                placeholder="E.g. Industrial Area Phase II"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-100 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white transition-all shadow-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-700">
                                Address Line 2
                            </label>
                            <input
                                type="text"
                                name="name_2"
                                value={formData.name_2}
                                onChange={handleChange}
                                placeholder="E.g. Unit 1"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-100 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white transition-all shadow-sm"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="block text-[10px] font-bold text-gray-700">
                                Postal Code
                            </label>
                            <input
                                type="text"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                                placeholder="E.g. 635109"
                                className="w-full px-4 py-2.5 rounded-lg border border-gray-100 text-[10px] focus:outline-none focus:ring-1 focus:ring-[#D4AF37] bg-white transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-x-4 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate('/plantmaster')}
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
