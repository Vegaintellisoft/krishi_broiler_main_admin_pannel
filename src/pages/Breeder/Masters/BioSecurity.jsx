import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import Select from "react-select";
import { FiArrowLeft } from "react-icons/fi";

const BioSecurity = () => {
  const navigate = useNavigate();
  // Master frequency options will be fetched from API
  const [masterFrequencies, setMasterFrequencies] = useState([]);

  // Category names will be fetched from API instead of hardcoded
  const [categories, setCategories] = useState([]);

  // State for sub-categories (activities)
  const [subCategories, setSubCategories] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    sortNo: "",
    group: [], // Multi–select array
    status: "Active",
    imageUpload: "Disable"
  });

  const [loading, setLoading] = useState(false);
  const [existingMappings, setExistingMappings] = useState([]);
  const [availableOptions, setAvailableOptions] = useState([]); // Dynamic options based on sub-category selection

  useEffect(() => {
    fetchCategories();
    fetchMasterFrequencies();
    fetchMappings();
  }, []);

  const fetchMasterFrequencies = async () => {
    // Static dummy frequencies
    setMasterFrequencies([
      { value: "daily", label: "Daily" },
      { value: "weekly", label: "Weekly" },
      { value: "monthly", label: "Monthly" },
      { value: "2 months once", label: "2 Months Once" },
      { value: "bi-annually", label: "Bi-Annually" }
    ]);
  };

  const fetchCategories = async () => {
    // Static dummy categories
    setCategories([
      { id: 1, label: "Cleaning & Disinfection" },
      { id: 2, label: "Vaccination" },
      { id: 3, label: "Pest Control" },
      { id: 4, label: "Staff Hygiene" }
    ]);
  };

  const fetchActivities = async (categoryId) => {
    // Static dummy activities based on category
    const activitiesMap = {
      1: [
        { id: 101, label: "Shed Cleaning", frequencies: [{ frequency: 'daily', is_active: true }] },
        { id: 102, label: "Equipment Wash", frequencies: [{ frequency: 'weekly', is_active: true }] }
      ],
      2: [
        { id: 201, label: "Bird Vaccination", frequencies: [{ frequency: 'monthly', is_active: true }] }
      ],
      3: [
        { id: 301, label: "Rodent Baiting", frequencies: [{ frequency: 'weekly', is_active: true }] }
      ],
      4: [
        { id: 401, label: "Hand Sanitization", frequencies: [{ frequency: 'daily', is_active: true }] }
      ]
    };
    setSubCategories(activitiesMap[categoryId] || []);
  };

  const handleCategoryChange = (e) => {
    const selectedLabel = e.target.value;

    // Find the full category object based on the selected label
    const selectedCategory = categories.find(cat => cat.label === selectedLabel);

    setFormData({
      ...formData,
      name: selectedLabel,
      sortNo: "", // Reset sub-category when category changes
      group: []   // Reset selected groups
    });

    setAvailableOptions([]); // Reset available options

    if (selectedCategory && selectedCategory.id) {
      fetchActivities(selectedCategory.id);
    } else {
      setSubCategories([]);
    }
  };

  const handleSubCategoryChange = (e) => {
    const subCatId = e.target.value;
    setFormData({
      ...formData,
      sortNo: subCatId,
      group: [] // Reset selected groups when sub-category changes
    });

    if (subCatId) {
      fetchAvailableFrequencies(subCatId);
    } else {
      setAvailableOptions([]);
    }
  };

  const fetchAvailableFrequencies = async (subCatId) => {
    try {
      const subCat = subCategories.find(s => s.id === parseInt(subCatId));

      if (subCat && subCat.frequencies && Array.isArray(subCat.frequencies)) {
        // Filter only active frequencies
        const activeFreqs = subCat.frequencies.filter(f => f.is_active);

        // Map API frequency keys to frontend keys/labels
        const mappedOptions = activeFreqs.map(f => {
          let value = f.frequency;

          // Map backend keys to frontend keys if they differ
          if (value === 'two_month_once') value = '2 months once';
          if (value === 'bi_annually') value = 'bi-annually';

          // Find matching label from master options
          const option = masterFrequencies.find(opt => opt.value === value);

          if (option) {
            return option;
          } else {
            // Fallback
            return {
              value: value,
              label: value.charAt(0).toUpperCase() + value.slice(1).replace(/_/g, ' ')
            };
          }
        });

        setAvailableOptions(mappedOptions);
      } else {
        setAvailableOptions([]);
      }
    } catch (error) {
      console.error("Error fetching frequencies:", error);
      setAvailableOptions([]);
    }
  };

  const fetchMappings = async () => {
    // Static dummy mappings
    setExistingMappings([
      { id: 1, label: "Shed Cleaning", frequencies: ["daily"] },
      { id: 2, label: "Bird Vaccination", frequencies: ["monthly"] }
    ]);
  };

  const showToast = (icon, title) => {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon: icon,
      title: title,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.sortNo || !formData.group || formData.group.length === 0) {
      showToast("error", "Please fill all required fields");
      return;
    }

    setLoading(true);
    try {
      const selectedSubCategoryLabel = subCategories.find(s => s.id === parseInt(formData.sortNo))?.label || "";
      console.log("🚀 Submitting Bio Security Mapping Data:", {
        ...formData,
        subCategoryLabel: selectedSubCategoryLabel
      });

      // Simulated backend delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      showToast("success", "Bio Security mapping saved successfully (Simulated)");
      setFormData({
        name: "",
        sortNo: "",
        group: [],
        status: "Active",
        imageUpload: "Disable"
      });
      setAvailableOptions([]); // Reset options
      fetchMappings(); // Refresh list
    } catch (error) {
      showToast("error", error.message || "Error simulating mapping save");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: "",
      sortNo: "",
      group: [],
      status: "Active",
      imageUpload: "Disable"
    });
  };

  return (
    <div className="w-full m-0 font-poppins py-[15px] px-[30px] bg-[#f9f9fc] min-h-screen">
      <div className="flex justify-between items-center mb-[20px]">
        <h3 className="text-[16px] font-bold m-0 text-[#1c1c1c]">Add Mapping</h3>
        <button 
            className="flex items-center gap-[8px] bg-white text-[#c9a42d] border border-[#c9a42d] py-[8px] px-[15px] rounded-[8px] text-[13px] font-semibold cursor-pointer transition-all duration-200 hover:bg-[#c9a42d] hover:text-white hover:-translate-x-[3px]" 
            onClick={() => navigate('/biosecurity')}
        >
          <FiArrowLeft /> Back
        </button>
      </div>

      {/* Main Card */}
      <div className="bg-white rounded-[1.5rem] shadow-[0_4px_25px_rgba(0,0,0,0.05)] p-8 max-w-5xl border border-gray-50">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-x-6 gap-y-8">

            {/* Category Field */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-[#1c1c1c]">
                Category : <span className="text-[#f86624] font-bold ml-[2px]">*</span>
              </label>
              <div className="relative">
                <select
                  className="w-full h-10 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 appearance-none text-xs text-gray-900"
                  value={formData.name}
                  onChange={handleCategoryChange}
                >
                  <option value="">Select Category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.label}>
                      {category.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Sub Category No Field */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-[#1c1c1c]">
                Sub Category No : <span className="text-[#f86624] font-bold ml-[2px]">*</span>
              </label>
              <div className="relative">
                <select
                  className="w-full h-10 px-4 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-1 focus:ring-gray-300 appearance-none text-xs text-gray-900"
                  value={formData.sortNo} // Now holds the ID
                  onChange={handleSubCategoryChange}
                >
                  <option value="">Select Sub Category</option>
                  {subCategories.map((subCat) => (
                    <option key={subCat.id} value={subCat.id}>
                      {subCat.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Image Upload Toggle Field */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-[#1c1c1c]">
                Image Upload : <span className="text-[#f86624] font-bold ml-[2px]">*</span>
              </label>
              <div className="flex gap-8 mt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="imageUpload"
                      value="Enable"
                      checked={formData.imageUpload === "Enable"}
                      onChange={(e) => setFormData({ ...formData, imageUpload: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-[2px] ${formData.imageUpload === "Enable" ? "border-gray-800" : "border-gray-400"} flex items-center justify-center`}>
                      {formData.imageUpload === "Enable" && <div className="w-[8px] h-[8px] rounded-full bg-gray-800"></div>}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-700">Enable</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="imageUpload"
                      value="Disable"
                      checked={formData.imageUpload === "Disable"}
                      onChange={(e) => setFormData({ ...formData, imageUpload: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-[2px] border-gray-400 flex items-center justify-center`}>
                      {formData.imageUpload === "Disable" && <div className="w-[8px] h-[8px] rounded-full bg-gray-800"></div>}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-700">Disable</span>
                </label>
              </div>
            </div>

            {/* Group Field (Multi Select) */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-[#1c1c1c]">
                Group : <span className="text-[#f86624] font-bold ml-[2px]">*</span>
              </label>
              <Select
                isMulti
                options={masterFrequencies}
                value={formData.group}
                onChange={(selected) => setFormData({ ...formData, group: selected })}
                isDisabled={!formData.sortNo} // Disable if no sub-category selected
                className="text-xs text-[12px]"
                styles={{
                  control: (base) => ({
                    ...base,
                    minHeight: '40px',
                    borderRadius: '0.5rem',
                    borderColor: '#e5e7eb',
                  })
                }}
                placeholder="Select groups..."
              />
            </div>

            {/* Status Field */}
            <div className="space-y-2.5">
              <label className="block text-xs font-bold text-[#1c1c1c]">
                Status : <span className="text-[#f86624] font-bold ml-[2px]">*</span>
              </label>
              <div className="flex gap-8 mt-2">
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === "Active"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-[2px] ${formData.status === "Active" ? "border-gray-800" : "border-gray-400"} flex items-center justify-center`}>
                      {formData.status === "Active" && <div className="w-[8px] h-[8px] rounded-full bg-gray-800"></div>}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-700">Active</span>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer select-none">
                  <div className="relative flex items-center justify-center">
                    <input
                      type="radio"
                      name="status"
                      value="In Active"
                      checked={formData.status === "In Active"}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="sr-only"
                    />
                    <div className={`w-5 h-5 rounded-full border-[2px] border-gray-400 flex items-center justify-center`}>
                      {formData.status === "In Active" && <div className="w-[8px] h-[8px] rounded-full bg-gray-800"></div>}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-700">In Active</span>
                </label>
              </div>
            </div>
          </div>

          {/* Buttons Row */}
          <div className="flex justify-end gap-x-5 mt-[35px]">
            <button
              type="button"
              onClick={handleCancel}
              className="py-[10px] px-[40px] border-none bg-[#8e8e8e] text-white rounded-[10px] font-bold text-[14px] shadow-sm hover:opacity-95 hover:-translate-y-[2px] transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="py-[10px] px-[40px] border-none bg-[#c9a42d] text-white rounded-[10px] font-bold text-[14px] shadow-[0_4px_15px_rgba(201,164,45,0.2)] hover:opacity-95 hover:-translate-y-[2px] transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? "Saving..." : "Submit"}
            </button>
          </div>
        </form>
      </div>

    </div>
  );
};

export default BioSecurity;
