import React, { useState, useEffect, useMemo } from 'react';
import { RiArrowUpSFill, RiFileExcel2Line, RiUploadCloud2Line } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Report() {
  const [isPageLoading, setIsPageLoading] = useState(false);
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [reportData, setReportData] = useState([]); // Single state for data from API

  const [isSapLoad, setIsSapLoad] = useState(false);

  // --- State for Filters ---
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // --- State for Pagination ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- 1. Updated Data Fetching Logic ---
  const fetchReports = async (sDate, eDate) => {
    setIsTableLoading(true);
    try {
      const params = {};
      if (sDate) params.startDate = sDate;
      if (eDate) params.endDate = eDate;

      const response = await axios.get("/reports/getall", { params });

      console.log("Report Data==========> : ", response.data)

      if (response.data.success) {
        const filtered = response.data.data.filter(r => r.is_send_sap === false);
        setReportData(filtered);
      } else {
        setReportData([]);
      }

    } catch (error) {
      console.error("Server Error: ", error);
      setReportData([]);
    } finally {
      setIsTableLoading(false);
    }
  };


  // --- 2. useEffect for Initial Load (Today's Report) ---
  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    fetchReports(today, today);
  }, []);

  // --- 3. Updated Filter Handler ---
  const handleFilter = () => {
    if (startDate && endDate) {
      setCurrentPage(1); // Reset to first page on new filter
      fetchReports(startDate, endDate);
    } else {
      alert("Please select both a start and end date.");
    }
  };

  // --- 4. Updated Clear Filter Handler ---
  const handleClearFilter = () => {
    setCurrentPage(1);
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    fetchReports(today, today); // Fetch today's data again
  };

  // --- Pagination Logic (Now uses 'reportData') ---
  const { paginatedData, totalPages, startIndex } = useMemo(() => {
    const totalPages = Math.ceil(reportData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = reportData.slice(startIndex, endIndex);
    return { paginatedData, totalPages, startIndex };
  }, [reportData, currentPage, itemsPerPage]);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);

  // --- Export to Excel Logic (Now uses 'reportData') ---
  const handleExport = () => {
    if (reportData.length === 0) {
      alert("No data to export!");
      return;
    }
    const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
    const fileExtension = '.xlsx';

    const dataToExport = reportData.map((item, index) => ({
      "S.No": index + 1,
      "Doc Date": item.doc_date,
      "Doc No": item.doc_no,
      "To": item.to,
      "Address": item.address,
      "Truck No": item.truck_no,
      "Materials": item.materials,
      "HSN Code": item.hsn_code,
      "Quantity": item.quantity,
      "Rate (Incl. Tax)": item.rate_incl_tax,
      "Tax Rate (%)": item.tax_rate,
      "Taxable Value": item.taxable_value,
      "CGST": item.cgst,
      "SGST": item.sgst,
      "Gross": item.gross,
      "E Way Bill No": item.e_way_bill_no,
      "Distance (km)": item.distance,
      "Status": item?.status,
      "Reason": item?.reason
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = { Sheets: { 'data': ws }, SheetNames: ['data'] };
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: fileType });
    saveAs(data, 'ReportData' + fileExtension);
  };

  // const handleUploadToSAP = async () => {
  //   setIsSapLoad(true);

  //   try {
  //     const convertToSAPFormat = (item) => ({
  //       id: item.s_no,
  //       BLDAT: item.doc_date,
  //       XBLNR: item.doc_no,
  //       ZTO: item.to,
  //       ZADDRESS: item.address,
  //       ZTRUCK_NO: item.truck_no,
  //       MAKTX: item.materials,
  //       MATNR: item.material_number,
  //       ZHSN_CODE: item.hsn_code,
  //       MENGED: item.quantity,
  //       ZRATE: item.rate_incl_tax,
  //       ZCGST_PER: item.tax_rate,
  //       ZTAXABLE_VAL: item.taxable_value,
  //       ZCGST_AMT: item.cgst,
  //       ZSGST_AMT: item.sgst,
  //       ZGROSS_AMT: item.gross,
  //       ZEWAY: item.e_way_bill_no || "",
  //       ZSD_DISTANCE: item.distance || 0
  //     });

  //     const payload = reportData.map(convertToSAPFormat);

  //     const results = await Promise.allSettled(
  //       payload.map(row => axios.post('/reports/send-to-sap', row))
  //     );

  //     let successCount = 0;
  //     let failedCount = 0;
  //     const failedRows = [];

  //     results.forEach((result, i) => {
  //       if (result.status === "fulfilled") {
  //         successCount++;
  //       } else {
  //         failedCount++;
  //         failedRows.push(i + 1);
  //       }
  //     });

  //     if (successCount > 0) {
  //       await fetchReports();
  //       Swal.fire({
  //         icon: "success",
  //         title: "Uploaded to SAP",
  //         text: `${successCount} records successfully uploaded.`,
  //         timer: 2000,
  //         showConfirmButton: false
  //       });
  //     }

  //     if (failedCount > 0) {
  //       Swal.fire({
  //         icon: "error",
  //         title: "Some Uploads Failed",
  //         html: `
  //         Failed rows: <b>${failedRows.join(", ")}</b><br/><br/>
  //         Check console for full error details.
  //       `,
  //       });
  //     }

  //   } catch (error) {
  //     Swal.fire({
  //       icon: "error",
  //       title: "Unexpected Error",
  //       text: "Something went wrong. Check console.",
  //     });
  //     console.error(error);
  //   } finally {
  //     setIsSapLoad(false);
  //   }
  // };


  const handleUploadToSAP = async () => {
    setIsSapLoad(true);

    try {
      const results = await Promise.allSettled(
        reportData.map(item =>
          axios.post(`/reports/send-to-sap/${item.s_no}`)
        )
      );

      let successCount = 0;
      let failedCount = 0;
      const failedRows = [];

      results.forEach((res, index) => {
        if (res.status === "fulfilled") {
          successCount++;
        } else {
          failedCount++;
          failedRows.push(index + 1);
        }
      });

      if (successCount > 0) {
        await fetchReports();
        Swal.fire({
          icon: "success",
          title: "Uploaded to SAP",
          text: `${successCount} records successfully uploaded.`,
          timer: 2000,
          showConfirmButton: false
        });
      }

      if (failedCount > 0) {
        Swal.fire({
          icon: "error",
          title: "Some Uploads Failed",
          html: `Failed rows: <b>${failedRows.join(", ")}</b>`,
        });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Unexpected Error",
        text: "Something went wrong.",
      });
    } finally {
      setIsSapLoad(false);
    }
  };


  return (
    <div className={`rounded-lg shadow flex-1`}>
      {isPageLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="text-center text-white">
            <div className="w-12 h-12 mx-auto border-4 border-white border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-2">Uploading to SAP...</p>
          </div>
        </div>
      )}

      <div className={`bg-[#F9F9FC] min-h-screen relative`}>
        {/* Header */}
        <div className="space-y-4 pt-3 px-6 font-poppins">
          <h1 className="text-xl font-bold text-gray-900">Report</h1>
          <div className="flex items-center gap-x-2 text-sm text-gray-500 ">
            <Link to="/" className='text-orange-500'>Dashboard</Link>
            <span><RiArrowUpSFill className='rotate-90' size={20} /></span>
            <span>Report</span>
          </div>
        </div>

        {/* Filter and Action Controls */}
        <div className="px-4 mx-4 mt-3 py-4 font-poppins">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-sm">
              <div className='flex items-center gap-2'>
                <label htmlFor="startDate">From:</label>
                <input type="date" id="startDate" value={startDate} onChange={(e) => setStartDate(e.target.value)} className='p-2 border rounded-md focus:ring-2 focus:ring-orange-500' />
              </div>
              <div className='flex items-center gap-2'>
                <label htmlFor="endDate">To:</label>
                <input type="date" id="endDate" value={endDate} onChange={(e) => setEndDate(e.target.value)} className='p-2 border rounded-md focus:ring-2 focus:ring-orange-500' />
              </div>
              <button onClick={handleFilter} className='px-4 py-2 text-white bg-primary rounded-md'>Filter</button>
              <button onClick={handleClearFilter} className='px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300'>Clear</button>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleExport} className='flex items-center gap-2 px-4 py-2 text-sm text-white bg-secondary rounded-md hover:bg-secondary'>
                <RiFileExcel2Line size={18} /> Export
              </button>

              <button
                onClick={handleUploadToSAP}
                disabled={isSapLoad}
                className={`flex items-center gap-2 px-4 py-2 text-sm text-white bg-primary rounded-md 
  ${isSapLoad ? "opacity-60 cursor-not-allowed" : "hover:bg-primary"}`}
              >
                {isSapLoad ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                    </svg>
                    Uploading...
                  </div>
                ) : (
                  <>
                    <RiUploadCloud2Line size={18} /> Upload to SAP
                  </>
                )}
              </button>


            </div>
          </div>
        </div>

        {/* Table Container */}
        <div className="mx-4 bg-white border border-gray-300">
          <div className="overflow-x-auto scrollbar-thumb-rounded-full scrollbar-track-rounded-full scrollbar-thin scrollbar-thumb-gray scrollbar-track-white">
            <table className="w-full min-w-[1600px]">
              <thead className='font-poppins font-semibold'>
                <tr className="border-b bg-gray-50">
                  <th className="p-4 text-center text-sm text-black">S.No</th>
                  <th className="p-4 text-center text-sm text-black">Doc Date</th>
                  <th className="p-4 text-center text-sm text-black">Doc No</th>
                  <th className="p-4 text-center text-sm text-black">supplier ID</th>
                  <th className="p-4 text-center text-sm text-black">To</th>
                  <th className="p-4 text-center text-sm text-black">Address</th>
                  <th className="p-4 text-center text-sm text-black">Truck No</th>
                  <th className="p-4 text-center text-sm text-black">Materials</th>
                  <th className="p-4 text-center text-sm text-black">HSN Code</th>
                  <th className="p-4 text-center text-sm text-black">Quantity</th>
                  <th className="p-4 text-center text-sm  whitespace-nowrap text-black">Rate (Incl. Tax)</th>
                  <th className="p-4 text-center text-sm text-black">Tax Rate</th>
                  <th className="p-4 text-center text-sm text-black">Taxable Value</th>
                  <th className="p-4 text-center text-sm text-black">CGST</th>
                  <th className="p-4 text-center text-sm text-black">SGST</th>
                  <th className="p-4 text-center text-sm text-black">Gross</th>
                  <th className="p-4 text-center text-sm text-black">E Way Bill No</th>
                  <th className="p-4 text-center text-sm text-black">Distance</th>
                </tr>
              </thead>
              <tbody className="divide-y font-poppins">
                {isTableLoading ? (
                  <tr>
                    <td colSpan="18" className="py-10 text-center">
                      <div className="flex justify-center items-center">
                        <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    </td>
                  </tr>
                ) : paginatedData.length > 0 ? (
                  paginatedData.map((item, index) => (
                    <tr key={`${item.s_no}-${item.materials}`} className="hover:bg-gray-50 text-center">
                      <td className="p-4 text-sm opacity-80">{startIndex + index + 1}</td>
                      <td className="p-4 text-sm opacity-80 whitespace-nowrap">{item.doc_date}</td>
                      <td className="p-4 text-sm whitespace-nowrap opacity-80">{item.doc_no}</td>
                      <td className="p-4 text-sm whitespace-nowrap opacity-80">{item.supplier_id}</td>
                      <td className="p-4 text-sm opacity-80 max-w-[200px] truncate">{item.to}</td>
                      <td
                        className="p-4 text-sm opacity-80 max-w-[200px] truncate"
                        title={item.address}
                      >
                        {item.address}
                      </td>

                      <td className="p-4 text-sm opacity-80 whitespace-nowrap">{item.truck_no}</td>
                      <td className="p-4 text-sm opacity-80">{item.materials}</td>
                      <td className="p-4 text-sm opacity-80">{item.hsn_code}</td>
                      <td className="p-4 text-sm opacity-80">{item.quantity}</td>
                      <td className="p-4 text-sm opacity-80">{item.rate_incl_tax}</td>
                      <td className="p-4 text-sm opacity-80">{item.tax_rate}%</td>
                      <td className="p-4 text-sm opacity-80">{item.taxable_value}</td>
                      <td className="p-4 text-sm opacity-80">{item.cgst}</td>
                      <td className="p-4 text-sm opacity-80">{item.sgst}</td>
                      <td className="p-4 text-sm opacity-80">{item.gross}</td>
                      <td className="p-4 text-sm  whitespace-nowrap opacity-80">{item.e_way_bill_no || '-'}</td>
                      <td className="p-4 text-sm opacity-80">{item.distance || '-'} km</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="18" className="py-10 text-center text-gray-500 text-sm">
                      No Data Available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-end font-dm mr-4 items-center gap-2 mt-4 pb-4">
              <button
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 border rounded ${currentPage === 1 ? 'text-gray-400 bg-gray-200 cursor-not-allowed' : 'text-white bg-[#F3890A] hover:bg-orange-600'}`}
              >
                &lt;
              </button>
              {currentPage > 1 && (
                <button onClick={goToFirstPage} className="px-3 py-1 text-sm border rounded text-black hover:bg-gray-200">1</button>
              )}
              {currentPage > 2 && <span className="px-3 py-1">...</span>}
              <span className="px-3 py-1 border font-medium rounded bg-gray-200">{currentPage}</span>
              {currentPage < totalPages - 1 && <span className="px-3 py-1">...</span>}
              {currentPage < totalPages && (
                <button onClick={goToLastPage} className="px-3 py-1 border text-sm rounded text-black hover:bg-gray-200">{totalPages}</button>
              )}
              <button
                onClick={goToNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 border rounded ${currentPage === totalPages ? 'text-gray-400 bg-gray-200 cursor-not-allowed' : 'text-white bg-[#F3890A] hover:bg-orange-600'}`}
              >
                &gt;
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}