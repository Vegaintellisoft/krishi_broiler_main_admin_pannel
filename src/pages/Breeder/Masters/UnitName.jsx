import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FiSearch, FiFilter, FiPlus, FiEdit, FiTrash2, FiArrowLeft } from 'react-icons/fi';

export default function UnitName() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    flockNo: '',
    age: '',
    day: '',
    week: ''
  });

  const [stockData, setStockData] = useState({
    openingStock: { male: 0, female: 0 },
    mortality: { male: '', female: '' },
    cullsKill: { male: '', female: '' },
    cullsSale: { male: '', female: '' },
    transferIn: { male: '', female: '' },
    transferOut: { male: '', female: '' },
    sales: { male: '', female: '' },
    closingStock: { male: '', female: '' },
  });

  const [productionData, setProductionData] = useState({
    feedingNotes: '',
    bodyWeightAvg: '',
    shedHygieneNotes: '',
    eggCollections: ''
  });

  const [environmentalData, setEnvironmentalData] = useState({
    tempMin: '',
    tempMax: '',
    humidityMin: '',
    humidityMax: '',
    lightingStart: '',
    lightingEnd: ''
  });

  const [remarks, setRemarks] = useState('');
  const [flocks, setFlocks] = useState([]);
  const [isLoadingStock, setIsLoadingStock] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [validationErrors, setValidationErrors] = useState(new Set());
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (validationErrors.has(name)) {
      const newErrors = new Set(validationErrors);
      newErrors.delete(name);
      setValidationErrors(newErrors);
      if (newErrors.size === 0) setGlobalError('');
    }
  };

  const handleStockChange = (category, gender, value) => {
    setStockData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [gender]: value
      }
    }));
    // Clear validation error when user types
    const errorKey = `${category}.${gender}`;
    if (validationErrors.has(errorKey)) {
      const newErrors = new Set(validationErrors);
      newErrors.delete(errorKey);
      setValidationErrors(newErrors);
      if (newErrors.size === 0) setGlobalError('');
    }
  };

  const handleProductionChange = (e) => {
    const { name, value } = e.target;
    setProductionData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (validationErrors.has(name)) {
      const newErrors = new Set(validationErrors);
      newErrors.delete(name);
      setValidationErrors(newErrors);
      if (newErrors.size === 0) setGlobalError('');
    }
  };

  const handleEnvironmentalChange = (e) => {
    const { name, value } = e.target;
    setEnvironmentalData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (validationErrors.has(name)) {
      const newErrors = new Set(validationErrors);
      newErrors.delete(name);
      setValidationErrors(newErrors);
      if (newErrors.size === 0) setGlobalError('');
    }
  };

  // Static flocks list
  useEffect(() => {
    setFlocks([
      { id: 1, flock_no: "FL-2024-001" },
      { id: 2, flock_no: "FL-2024-002" },
      { id: 3, flock_no: "FL-2025-001" }
    ]);
  }, []);

  useEffect(() => {
    const fetchOpeningStock = async () => {
      if (formData.date && formData.flockNo) {
        setIsLoadingStock(true);
        // Simulate API delay
        setTimeout(() => {
          setStockData(prev => ({
            ...prev,
            openingStock: {
              male: 500,
              female: 4500
            }
          }));
          setIsLoadingStock(false);
        }, 500);
      }
    };

    fetchOpeningStock();
  }, [formData.date, formData.flockNo]);

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      flockNo: '',
      age: '',
      day: '',
      week: ''
    });
    setStockData({
      openingStock: { male: 0, female: 0 },
      mortality: { male: '', female: '' },
      cullsKill: { male: '', female: '' },
      cullsSale: { male: '', female: '' },
      transferIn: { male: '', female: '' },
      transferOut: { male: '', female: '' },
      sales: { male: '', female: '' },
      closingStock: { male: '', female: '' },
    });
    setProductionData({
      feedingNotes: '',
      bodyWeightAvg: '',
      shedHygieneNotes: '',
      eggCollections: ''
    });
    setEnvironmentalData({
      tempMin: '',
      tempMax: '',
      humidityMin: '',
      humidityMax: '',
      lightingStart: '',
      lightingEnd: ''
    });
    setRemarks('');
    setValidationErrors(new Set());
    setGlobalError('');
  };

  // Recalculate Closing Stock whenever relevant data changes
  useEffect(() => {
    const calculateClosing = (gender) => {
      const opening = parseFloat(stockData.openingStock[gender]) || 0;
      const mortality = parseFloat(stockData.mortality[gender]) || 0;
      const cullsKill = parseFloat(stockData.cullsKill[gender]) || 0;
      const cullsSale = parseFloat(stockData.cullsSale[gender]) || 0;
      const transferIn = parseFloat(stockData.transferIn[gender]) || 0;
      const transferOut = parseFloat(stockData.transferOut[gender]) || 0;
      const sales = parseFloat(stockData.sales[gender]) || 0;

      return opening + transferIn - (mortality + cullsKill + cullsSale + transferOut + sales);
    };

    setStockData(prev => ({
      ...prev,
      closingStock: {
        male: calculateClosing('male'),
        female: calculateClosing('female')
      }
    }));
  }, [
    stockData.openingStock,
    stockData.mortality,
    stockData.cullsKill,
    stockData.cullsSale,
    stockData.transferIn,
    stockData.transferOut,
    stockData.sales
  ]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    const newErrors = new Set();
    const missingFields = [];

    // Top box
    if (!formData.date) { newErrors.add("date"); missingFields.push("Date"); }
    if (!formData.flockNo) { newErrors.add("flockNo"); missingFields.push("Flock No"); }
    if (!formData.age) { newErrors.add("age"); missingFields.push("Age"); }
    if (!formData.day) { newErrors.add("day"); missingFields.push("Day"); }
    if (!formData.week) { newErrors.add("week"); missingFields.push("Week"); }

    // Stock table
    if (stockData.mortality.male === '') { newErrors.add("mortality.male"); missingFields.push("Male Mortality"); }
    if (stockData.mortality.female === '') { newErrors.add("mortality.female"); missingFields.push("Female Mortality"); }
    if (stockData.cullsKill.male === '') { newErrors.add("cullsKill.male"); missingFields.push("Male Culls(kill)"); }
    if (stockData.cullsKill.female === '') { newErrors.add("cullsKill.female"); missingFields.push("Female Culls(kill)"); }
    if (stockData.cullsSale.male === '') { newErrors.add("cullsSale.male"); missingFields.push("Male Culls(sale)"); }
    if (stockData.cullsSale.female === '') { newErrors.add("cullsSale.female"); missingFields.push("Female Culls(sale)"); }
    if (stockData.transferIn.male === '') { newErrors.add("transferIn.male"); missingFields.push("Male Transfer In"); }
    if (stockData.transferIn.female === '') { newErrors.add("transferIn.female"); missingFields.push("Female Transfer In"); }
    if (stockData.transferOut.male === '') { newErrors.add("transferOut.male"); missingFields.push("Male Transfer Out"); }
    if (stockData.transferOut.female === '') { newErrors.add("transferOut.female"); missingFields.push("Female Transfer Out"); }
    if (stockData.sales.male === '') { newErrors.add("sales.male"); missingFields.push("Male Sales"); }
    if (stockData.sales.female === '') { newErrors.add("sales.female"); missingFields.push("Female Sales"); }

    // Production (Right Box)
    if (!productionData.feedingNotes) { newErrors.add("feedingNotes"); missingFields.push("Feeding Notes"); }
    if (productionData.bodyWeightAvg === '') { newErrors.add("bodyWeightAvg"); missingFields.push("Body Weight"); }
    if (!productionData.shedHygieneNotes) { newErrors.add("shedHygieneNotes"); missingFields.push("Shed Hygiene Notes"); }
    if (productionData.eggCollections === '') { newErrors.add("eggCollections"); missingFields.push("Egg Collections"); }

    // Environmental
    if (environmentalData.tempMin === '') { newErrors.add("tempMin"); missingFields.push("Min Temperature"); }
    if (environmentalData.tempMax === '') { newErrors.add("tempMax"); missingFields.push("Max Temperature"); }
    if (environmentalData.humidityMin === '') { newErrors.add("humidityMin"); missingFields.push("Min Humidity"); }
    if (environmentalData.humidityMax === '') { newErrors.add("humidityMax"); missingFields.push("Max Humidity"); }
    if (!environmentalData.lightingStart) { newErrors.add("lightingStart"); missingFields.push("Lighting Start"); }
    if (!environmentalData.lightingEnd) { newErrors.add("lightingEnd"); missingFields.push("Lighting End"); }

    // Remarks
    if (!remarks) { newErrors.add("remarks"); missingFields.push("Remarks"); }

    if (newErrors.size > 0) {
      setValidationErrors(newErrors);
      setGlobalError('Please fill in all mandatory fields highlighted in red');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setValidationErrors(new Set());
    setGlobalError('');

    setIsSubmitting(true);
    try {
      console.log("🚀 Submitting Unit Name Data:", {
        masterData: formData,
        stockData,
        productionData,
        environmentalData,
        remarks
      });

      // Simulated backend delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      setSuccessMsg('Entry saved successfully (Simulated)');
      setSuccess(true);
      resetForm();
      window.scrollTo({ top: 0, behavior: 'smooth' });

      // Clear message after 5 seconds
      setTimeout(() => {
        setSuccess(false);
        setSuccessMsg('');
      }, 5000);
    } catch (error) {
      console.error("❌ Submission Error:", error);
      setGlobalError(error.message || 'Failed to simulate submission');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrorClass = (field) => {
    return validationErrors.has(field) ? '!border-[#f86624] !bg-[#fff8f5]' : '';
  };

  return (
    <div className="w-full m-0 font-poppins p-[15px] bg-[#f9f9fc] min-h-screen">
      {success && (
        <div className="bg-[#f1f8e9] text-[#2e7d32] py-[10px] px-[15px] rounded-[10px] border border-[#c5e1a5] mb-[15px] font-semibold text-[12px] flex items-center gap-[8px] animate-fade-in-down">
          ✅ {successMsg}
        </div>
      )}

      {globalError && (
        <div className="bg-[#fff5f2] text-[#d84315] py-[10px] px-[15px] rounded-[10px] border border-[#ffccbc] mb-[15px] font-semibold text-[12px] flex items-center gap-[8px] animate-fade-in-down">
          ⚠️ {globalError}
        </div>
      )}

      <div className="flex justify-between items-center mb-[20px]">
        <h3 className="text-[16px] font-bold m-0 text-[#1c1c1c]">Add Unit Name</h3>
        <button
          className="flex items-center gap-[8px] bg-white text-[#c9a42d] border border-[#c9a42d] py-[8px] px-[15px] rounded-[8px] text-[13px] font-semibold cursor-pointer transition-all duration-200 ease-in-out hover:bg-[#c9a42d] hover:text-white hover:-translate-x-[3px]"
          onClick={() => navigate('/unitname')}
        >
          <FiArrowLeft /> Back
        </button>
      </div>

      <div className="bg-white py-[20px] px-[30px] rounded-[15px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] mb-[20px] border border-[#f0f0f0]">
        <div className="flex justify-start gap-[40px] mb-0 flex-col md:flex-row flex-nowrap overflow-x-auto">
          <div className="flex items-center gap-[10px] w-[260px] min-w-[260px]">
            <label className="font-semibold text-[13px] text-[#1c1c1c] whitespace-nowrap min-w-[85px]">Date <span className="text-[#f86624] font-bold ml-[2px]">*</span> :</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`flex-1 min-w-0 py-[6px] px-[12px] border border-[#eee] rounded-[6px] text-[12px] bg-[#fbfbfb] text-[#1c1c1c] outline-none placeholder:text-[#bbb] ${getErrorClass('date')}`}
            />
          </div>
          <div className="flex items-center gap-[10px] w-[260px] min-w-[260px]">
            <label className="font-semibold text-[13px] text-[#1c1c1c] whitespace-nowrap min-w-[85px]">Flock No <span className="text-[#f86624] font-bold ml-[2px]">*</span> :</label>
            <select
              name="flockNo"
              value={formData.flockNo}
              onChange={handleInputChange}
              className={`flex-1 min-w-0 py-[6px] px-[12px] border border-[#eee] rounded-[6px] text-[12px] bg-[#fbfbfb] text-[#1c1c1c] outline-none cursor-pointer ${getErrorClass('flockNo')}`}
            >
              <option value="">Select Flock</option>
              {flocks.map(flock => (
                <option key={flock.id} value={flock.id}>
                  {flock.flock_no}
                </option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-[10px] w-[260px] min-w-[260px]">
            <label className="font-semibold text-[13px] text-[#1c1c1c] whitespace-nowrap min-w-[85px]">Age <span className="text-[#f86624] font-bold ml-[2px]">*</span> :</label>
            <input
              type="text"
              name="age"
              placeholder="3"
              value={formData.age}
              onChange={handleInputChange}
              className={`flex-1 min-w-0 py-[6px] px-[12px] border border-[#eee] rounded-[6px] text-[12px] bg-[#fbfbfb] text-[#1c1c1c] outline-none placeholder:text-[#bbb] ${getErrorClass('age')}`}
            />
          </div>
        </div>

        <div className="flex justify-start gap-[40px] mb-0 mt-[15px] flex-nowrap overflow-x-auto">
          <div className="flex items-center gap-[10px] w-[260px] min-w-[260px]">
            <label className="font-semibold text-[13px] text-[#1c1c1c] whitespace-nowrap min-w-[85px]">Day <span className="text-[#f86624] font-bold ml-[2px]">*</span> :</label>
            <input
              type="text"
              name="day"
              placeholder="Monday"
              value={formData.day}
              onChange={handleInputChange}
              className={`flex-1 min-w-0 py-[6px] px-[12px] border border-[#eee] rounded-[6px] text-[12px] bg-[#fbfbfb] text-[#1c1c1c] outline-none placeholder:text-[#bbb] ${getErrorClass('day')}`}
            />
          </div>
          <div className="flex items-center gap-[10px] w-[260px] min-w-[260px]">
            <label className="font-semibold text-[13px] text-[#1c1c1c] whitespace-nowrap min-w-[85px]">Week <span className="text-[#f86624] font-bold ml-[2px]">*</span> :</label>
            <input
              type="text"
              name="week"
              placeholder="2nd Week"
              value={formData.week}
              onChange={handleInputChange}
              className={`flex-1 min-w-0 py-[6px] px-[12px] border border-[#eee] rounded-[6px] text-[12px] bg-[#fbfbfb] text-[#1c1c1c] outline-none placeholder:text-[#bbb] ${getErrorClass('week')}`}
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-[25px] mb-[30px]">
        <div className="relative flex-[1.5] bg-white p-[25px] rounded-[20px] shadow-[0_4px_25px_rgba(0,0,0,0.05)] border border-[#f0f0f0] overflow-x-auto">
          <table className="w-full border-collapse min-w-[400px]">
            <thead>
              <tr>
                <th className="text-left pb-[12px] font-bold text-[14px] border-b border-[#f0f0f0] uppercase tracking-[0.5px] text-[#c9a42d]">Name</th>
                <th className="text-center pb-[12px] font-bold text-[14px] border-b border-[#f0f0f0] uppercase tracking-[0.5px] text-[#c9a42d]">Male</th>
                <th className="text-center pb-[12px] font-bold text-[14px] border-b border-[#f0f0f0] uppercase tracking-[0.5px] text-[#c9a42d]">Female</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-left pl-[10px] py-[8px] border-b border-[#fafafa] font-semibold text-[13px] text-[#4a4c56]">Opening Stock :</td>
                <td className="text-center py-[8px] border-b border-[#fafafa]">
                  <input
                    type="number"
                    value={stockData.openingStock.male}
                    readOnly
                    className="w-[65px] p-[5px] border border-[#eee] rounded-[6px] text-center text-[12px] bg-[#f0f0f0] !border-[#ddd] !text-[#666] cursor-not-allowed font-semibold outline-none"
                  />
                </td>
                <td className="text-center py-[8px] border-b border-[#fafafa]">
                  <input
                    type="number"
                    value={stockData.openingStock.female}
                    readOnly
                    className="w-[65px] p-[5px] border border-[#eee] rounded-[6px] text-center text-[12px] bg-[#f0f0f0] !border-[#ddd] !text-[#666] cursor-not-allowed font-semibold outline-none"
                  />
                </td>
              </tr>
              {[
                { label: "Mortality", key: "mortality" },
                { label: "Culls(kill)", key: "cullsKill" },
                { label: "Culls(sale)", key: "cullsSale" },
                { label: "Transfer In", key: "transferIn" },
                { label: "Transfer Out", key: "transferOut" },
                { label: "Sales", key: "sales" },
                { label: "Closing Stock", key: "closingStock" },
              ].map((item) => (
                <tr key={item.key}>
                  <td className="text-left pl-[10px] py-[8px] border-b border-[#fafafa] font-semibold text-[13px] text-[#4a4c56]">
                    {item.label} {item.key !== 'closingStock' && <span className="text-[#f86624] font-bold ml-[2px]">*</span>} :
                  </td>
                  <td className="text-center py-[8px] border-b border-[#fafafa]">
                    <input
                      type="number"
                      value={stockData[item.key].male}
                      onChange={(e) => handleStockChange(item.key, 'male', e.target.value)}
                      readOnly={item.key === 'closingStock'}
                      className={`w-[65px] p-[5px] border border-[#eee] rounded-[6px] text-center text-[12px] bg-[#fbfbfb] outline-none ${item.key === 'closingStock' ? '!bg-[#f0f0f0] !border-[#ddd] !text-[#666] cursor-not-allowed font-semibold' : ''} ${getErrorClass(`${item.key}.male`)}`}
                    />
                  </td>
                  <td className="text-center py-[8px] border-b border-[#fafafa]">
                    <input
                      type="number"
                      value={stockData[item.key].female}
                      onChange={(e) => handleStockChange(item.key, 'female', e.target.value)}
                      readOnly={item.key === 'closingStock'}
                      className={`w-[65px] p-[5px] border border-[#eee] rounded-[6px] text-center text-[12px] bg-[#fbfbfb] outline-none ${item.key === 'closingStock' ? '!bg-[#f0f0f0] !border-[#ddd] !text-[#666] cursor-not-allowed font-semibold' : ''} ${getErrorClass(`${item.key}.female`)}`}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {isLoadingStock && (
            <div className="absolute inset-0 bg-white/60 flex justify-center items-center text-[14px] text-[#c9a42d] font-semibold rounded-[15px]">
              Updating stock...
            </div>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between gap-[15px]">
          <div className="bg-white py-[12px] px-[15px] rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#f0f0f0]">
            <label className="block font-bold text-[13px] mb-[6px] text-[#1c1c1c]">Feeding <span className="text-[#f86624] font-bold ml-[2px]">*</span></label>
            <div>
              <textarea
                name="feedingNotes"
                value={productionData.feedingNotes}
                onChange={handleProductionChange}
                placeholder="notes on feeding quantity"
                className={`w-full border border-[#eee] py-[8px] px-[12px] rounded-[8px] text-[12px] outline-none bg-white font-inherit placeholder:text-[#ccc] h-[45px] resize-none ${getErrorClass('feedingNotes')}`}
              ></textarea>
            </div>
          </div>

          <div className="bg-white py-[12px] px-[15px] rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#f0f0f0]">
            <label className="block font-bold text-[13px] mb-[6px] text-[#1c1c1c]">Body Weight (avg) <span className="text-[#f86624] font-bold ml-[2px]">*</span></label>
            <div>
              <input
                type="text"
                name="bodyWeightAvg"
                value={productionData.bodyWeightAvg}
                onChange={handleProductionChange}
                placeholder="3.125 kg"
                className={`w-full border border-[#eee] py-[8px] px-[12px] rounded-[8px] text-[12px] outline-none bg-white font-inherit placeholder:text-[#ccc] ${getErrorClass('bodyWeightAvg')}`}
              />
            </div>
          </div>

          <div className="bg-white py-[12px] px-[15px] rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#f0f0f0]">
            <label className="block font-bold text-[13px] mb-[6px] text-[#1c1c1c]">Shed Hygiene <span className="text-[#f86624] font-bold ml-[2px]">*</span></label>
            <div>
              <textarea
                name="shedHygieneNotes"
                value={productionData.shedHygieneNotes}
                onChange={handleProductionChange}
                placeholder="Cleaning, litter, issues"
                className={`w-full border border-[#eee] py-[8px] px-[12px] rounded-[8px] text-[12px] outline-none bg-white font-inherit placeholder:text-[#ccc] h-[45px] resize-none ${getErrorClass('shedHygieneNotes')}`}
              ></textarea>
            </div>
          </div>

          <div className="bg-white py-[12px] px-[15px] rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#f0f0f0]">
            <label className="block font-bold text-[13px] mb-[6px] text-[#1c1c1c]">Egg Collections <span className="text-[#f86624] font-bold ml-[2px]">*</span></label>
            <div>
              <input
                type="number"
                name="eggCollections"
                value={productionData.eggCollections}
                onChange={handleProductionChange}
                placeholder="23"
                className={`w-full border border-[#eee] py-[8px] px-[12px] rounded-[8px] text-[12px] outline-none bg-white font-inherit placeholder:text-[#ccc] ${getErrorClass('eggCollections')}`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-start gap-[25px] mb-[30px]">
        <div className="flex-1 lg:h-[200px] bg-white py-[15px] px-[20px] rounded-[15px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#f0f0f0] flex flex-col">
          <h4 className="text-[13px] font-bold mb-[12px] text-[#1c1c1c] border-l-[3px] border-[#c9a42d] pl-[8px]">Environmental Readings <span className="text-[#f86624] font-bold ml-[2px]">*</span></h4>
          <div className="flex flex-col gap-[10px] flex-1 justify-center">
            <div className="flex items-center gap-[15px] text-[13px]">
              <label className="min-w-[120px] font-semibold text-[#4a4c56]">Temperature <span className="text-[#f86624] font-bold ml-[2px]">*</span> :</label>
              <input
                name="tempMin"
                value={environmentalData.tempMin}
                onChange={handleEnvironmentalChange}
                placeholder="Min"
                className={`w-[70px] p-[6px] border border-[#eee] rounded-[6px] text-center text-[11px] bg-[#fbfbfb] outline-none ${getErrorClass('tempMin')}`}
              />
              <input
                name="tempMax"
                value={environmentalData.tempMax}
                onChange={handleEnvironmentalChange}
                placeholder="Max"
                className={`w-[70px] p-[6px] border border-[#eee] rounded-[6px] text-center text-[11px] bg-[#fbfbfb] outline-none ${getErrorClass('tempMax')}`}
              />
            </div>
            <div className="flex items-center gap-[15px] text-[13px]">
              <label className="min-w-[120px] font-semibold text-[#4a4c56]">Humidity <span className="text-[#f86624] font-bold ml-[2px]">*</span> :</label>
              <input
                name="humidityMin"
                value={environmentalData.humidityMin}
                onChange={handleEnvironmentalChange}
                placeholder="Min"
                className={`w-[70px] p-[6px] border border-[#eee] rounded-[6px] text-center text-[11px] bg-[#fbfbfb] outline-none ${getErrorClass('humidityMin')}`}
              />
              <input
                name="humidityMax"
                value={environmentalData.humidityMax}
                onChange={handleEnvironmentalChange}
                placeholder="Max"
                className={`w-[70px] p-[6px] border border-[#eee] rounded-[6px] text-center text-[11px] bg-[#fbfbfb] outline-none ${getErrorClass('humidityMax')}`}
              />
            </div>
            <div className="flex items-center gap-[15px] text-[13px]">
              <label className="min-w-[120px] font-semibold text-[#4a4c56]">Lighting Hours <span className="text-[#f86624] font-bold ml-[2px]">*</span> :</label>
              <div className="flex gap-[10px]">
                <input
                  type="time"
                  name="lightingStart"
                  value={environmentalData.lightingStart}
                  onChange={handleEnvironmentalChange}
                  placeholder="Start"
                  className={`w-[90px] p-[6px] border border-[#eee] rounded-[6px] text-center text-[11px] bg-[#fbfbfb] outline-none ${getErrorClass('lightingStart')}`}
                />
                <input
                  type="time"
                  name="lightingEnd"
                  value={environmentalData.lightingEnd}
                  onChange={handleEnvironmentalChange}
                  placeholder="End"
                  className={`w-[90px] p-[6px] border border-[#eee] rounded-[6px] text-center text-[11px] bg-[#fbfbfb] outline-none ${getErrorClass('lightingEnd')}`}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex-[1.2] lg:h-[200px] bg-white rounded-[15px] shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-[#f0f0f0] flex flex-col py-[15px] px-[20px]">
          <label className="block font-bold text-[13px] mb-[10px] text-[#1c1c1c]">Remarks <span className="text-[#f86624] font-bold ml-[2px]">*</span> :</label>
          <textarea
            className={`w-full flex-1 border border-[#eee] py-[10px] px-[12px] rounded-[10px] outline-none text-[12px] resize-none bg-white font-inherit ${getErrorClass('remarks')}`}
            value={remarks}
            onChange={(e) => {
              setRemarks(e.target.value);
              if (validationErrors.has('remarks')) {
                const newErrors = new Set(validationErrors);
                newErrors.delete('remarks');
                setValidationErrors(newErrors);
                if (newErrors.size === 0) setGlobalError('');
              }
            }}
          ></textarea>
        </div>
      </div>

      <div className="flex justify-end gap-[20px] mt-[20px]">
        <button
          className="py-[10px] px-[40px] border-none rounded-[10px] text-[14px] font-bold cursor-pointer transition-all duration-200 ease-in-out bg-[#8e8e8e] text-white hover:-translate-y-[2px] hover:opacity-95"
          onClick={() => navigate('/unitname')}
        >Cancel</button>
        <button
          className="py-[10px] px-[40px] border-none rounded-[10px] text-[14px] font-bold cursor-pointer transition-all duration-200 ease-in-out bg-[#c9a42d] text-white shadow-[0_4px_15px_rgba(201,164,45,0.2)] hover:-translate-y-[2px] hover:opacity-95"
          disabled={isLoadingStock || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </div>
    </div>
  );
}
