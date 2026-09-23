import React, { useState, useEffect, useMemo } from 'react';
import { RiArrowUpSFill, RiFileExcel2Line, RiUploadCloud2Line } from 'react-icons/ri';
import { Link } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import axios from 'axios';
import Swal from 'sweetalert2';

const COLUMNS = [
  { key: 'row_index',        label: 'S.No.',                        width: 55 },
  { key: 'po_no',            label: 'PO No.',                       width: 120 },
  { key: 'po_date',          label: 'PO Dt.',                       width: 100 },
  { key: 'rr_no',            label: 'RR No.',                       width: 140 },
  { key: 'rr_date',          label: 'RR Date',                      width: 100 },
  { key: 'supplier_code',    label: 'Supplier Code',                width: 110 },
  { key: 'supplier_name',    label: 'Supplier Name',                width: 160 },
  { key: 'supplier_inv_no',  label: 'Supplier Inv.No.',             width: 130 },
  { key: 'supplier_inv_date',label: 'Supplier Inv. Dt.',            width: 110 },
  { key: 'doc_no',           label: 'Delivery Challan No.',         width: 155 },
  { key: 'doc_date',         label: 'Delivery Challan Dt.',         width: 135 },
  { key: 'doc_time',         label: 'DC Generate Time',             width: 125 },
  { key: 'dispatch_from',    label: 'Item Dispatch From (Goodshed)',width: 175 },
  { key: 'branch_name',      label: 'Billed/Shipped To Branch',     width: 155 },
  { key: 'branch_address',   label: 'Billed/Shipped To Address',    width: 200 },
  { key: 'item_code',        label: 'Item Code',                    width: 100 },
  { key: 'item_name',        label: 'Item Name',                    width: 130 },
  { key: 'item_uom',         label: 'Item UOM',                     width: 90 },
  { key: 'hsn_code',         label: 'Item HSN Code',                width: 115 },
  { key: 'no_of_bags',       label: 'Qty (No. of Bags)',            width: 115 },
  { key: 'quantity',         label: 'Qty (in MTS/KGS/NOS)',         width: 135 },
  { key: 'item_rate',        label: 'Item Rate',                    width: 100 },
  { key: 'tax_rate',         label: 'GST Tax Rate',                 width: 105 },
  { key: 'taxable_value',    label: 'Taxable Value (Basic)',        width: 140 },
  { key: 'cgst',             label: 'CGST',                         width: 85 },
  { key: 'sgst',             label: 'SGST',                         width: 85 },
  { key: 'gross',            label: 'Total',                        width: 100 },
  { key: 'dc_status',        label: 'DC - Active or Cancelled',     width: 150 },
  { key: 'dc_reason',        label: 'DC Cancelled Reason',          width: 145 },
  { key: 'is_send_sap',      label: 'SAP Status',                   width: 110 },
  { key: 'truck_no',         label: 'Vehicle No.',                  width: 110 },
  { key: 'ewb_type',         label: 'E-Way Bill Type',              width: 120 },
  { key: 'e_way_bill_no',    label: 'E-way Bill No.',               width: 130 },
  { key: 'ewb_date',         label: 'E-Way Bill Date',              width: 120 },
  { key: 'ewb_status',       label: 'E-Way Bill Active or Cancelled', width: 170 },
  { key: 'ewb_reason',       label: 'E-Way Bill Cancelled Reason',  width: 170 },
];

// Numeric columns for totals row
const TOTAL_COLS = new Set(['no_of_bags', 'quantity', 'taxable_value', 'cgst', 'sgst', 'gross']);

// Helper to format any date string into DD-MM-YYYY format
const formatDate = (val) => {
  if (!val || val === '-' || val === 'null' || val === 'undefined') return '-';
  const str = String(val).trim();
  if (/^\d{2}-\d{2}-\d{4}$/.test(str)) return str;
  const matchYMD = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (matchYMD) return `${matchYMD[3]}-${matchYMD[2]}-${matchYMD[1]}`;
  const matchDMY = str.match(/^(\d{2})\/(\d{2})\/(\d{4})/);
  if (matchDMY) return `${matchDMY[1]}-${matchDMY[2]}-${matchDMY[3]}`;
  const d = new Date(val);
  if (!isNaN(d.getTime())) {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  }
  return str;
};

export default function Report() {
  const [isTableLoading, setIsTableLoading] = useState(true);
  const [reportData, setReportData]         = useState([]);
  const [isSapLoad, setIsSapLoad]           = useState(false);
  const [search, setSearch]                 = useState('');
  const [startDate, setStartDate]           = useState('');
  const [endDate, setEndDate]               = useState('');
  const [currentPage, setCurrentPage]       = useState(1);
  const itemsPerPage = 20;

  const fetchReports = async (sDate, eDate) => {
    setIsTableLoading(true);
    try {
      const params = {};
      if (sDate) params.startDate = sDate;
      if (eDate) params.endDate = eDate;
      const response = await axios.get('/reports/getall', { params });
      if (response.data.success) {
        setReportData(response.data.data);
      } else {
        setReportData([]);
      }
    } catch (error) {
      console.error('Server Error: ', error);
      setReportData([]);
    } finally {
      setIsTableLoading(false);
    }
  };

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    fetchReports(today, today);
  }, []);

  const handleFilter = () => {
    if (startDate && endDate) {
      setCurrentPage(1);
      fetchReports(startDate, endDate);
    } else {
      alert('Please select both a start and end date.');
    }
  };

  const handleClearFilter = () => {
    setCurrentPage(1);
    const today = new Date().toISOString().split('T')[0];
    setStartDate(today);
    setEndDate(today);
    fetchReports(today, today);
  };

  // Filtered data by search
  const filteredData = useMemo(() => {
    if (!search.trim()) return reportData;
    const q = search.toLowerCase();
    return reportData.filter(r =>
      COLUMNS.some(c => String(r[c.key] ?? '').toLowerCase().includes(q))
    );
  }, [reportData, search]);

  // Totals row
  const totals = useMemo(() => {
    const t = {};
    TOTAL_COLS.forEach(k => {
      t[k] = filteredData.reduce((sum, r) => sum + (parseFloat(r[k]) || 0), 0);
    });
    return t;
  }, [filteredData]);

  // Pagination
  const { paginatedData, totalPages, startIndex } = useMemo(() => {
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
    return { paginatedData, totalPages, startIndex };
  }, [filteredData, currentPage]);

  const goToNextPage     = () => setCurrentPage(p => Math.min(p + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage(p => Math.max(p - 1, 1));
  const goToFirstPage    = () => setCurrentPage(1);
  const goToLastPage     = () => setCurrentPage(totalPages);

  // Excel Export — with company header, all 35 columns, and totals row
  const handleExport = () => {
    if (filteredData.length === 0) {
      alert('No data to export!');
      return;
    }

    const wb = XLSX.utils.book_new();
    const headers = COLUMNS.map(c => c.label);

    // Build rows array: company header first
    const rows = [
      ['Krishi Nutrition Company Private Limited'],
      ['Goodshed Wagon Mobile application - Delivery Challan with E-Way Bill register'],
      [], // blank spacer
      headers,
      ...filteredData.map((item, idx) =>
        COLUMNS.map(c => {
          if (c.key === 'row_index') return idx + 1;
          if (c.key === 'is_send_sap') return item.is_send_sap ? 'Sent' : 'Pending';
          if (['po_date', 'rr_date', 'supplier_inv_date', 'doc_date', 'ewb_date'].includes(c.key)) {
            return formatDate(item[c.key]);
          }
          return item[c.key] ?? '-';
        })
      ),
      // Totals row
      COLUMNS.map(c => {
        if (c.key === 'row_index') return 'Total';
        if (TOTAL_COLS.has(c.key)) {
          const val = totals[c.key];
          return c.key === 'quantity' ? val.toFixed(3) : val.toFixed(2);
        }
        return '';
      }),
    ];

    const ws = XLSX.utils.aoa_to_sheet(rows);

    // Style column widths
    ws['!cols'] = COLUMNS.map(c => ({ wch: Math.round(c.width / 7) }));

    // Merge the two header title cells across all columns
    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: COLUMNS.length - 1 } },
      { s: { r: 1, c: 0 }, e: { r: 1, c: COLUMNS.length - 1 } },
    ];

    XLSX.utils.book_append_sheet(wb, ws, 'DC E-Way Bill Register');
    const buf = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([buf], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8',
    });
    saveAs(blob, `DC_EWayBill_Register_${startDate}_to_${endDate}.xlsx`);
  };

  const handleUploadToSAP = async () => {
    const uniqueDcIds = [...new Set(filteredData.filter(r => !r.is_send_sap && r.dc_status === 'Active').map(r => r.s_no))];
    if (uniqueDcIds.length === 0) {
      Swal.fire({ icon: 'info', title: 'Nothing to upload', text: 'All active records are already sent to SAP.' });
      return;
    }

    const confirm = await Swal.fire({
      title: 'Upload to SAP?',
      text: `Upload ${uniqueDcIds.length} active Delivery Challan(s) to SAP?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#F3890A',
      cancelButtonColor: '#9CA3AF',
      confirmButtonText: 'Yes, upload'
    });
    if (!confirm.isConfirmed) return;

    setIsSapLoad(true);
    try {

      const results = await Promise.allSettled(
        uniqueDcIds.map(id => axios.post(`/reports/send-to-sap/${id}`))
      );

      let successCount = 0, failedCount = 0;
      const failedRows = [];
      results.forEach((res, i) => {
        if (res.status === 'fulfilled') successCount++;
        else { failedCount++; failedRows.push(uniqueDcIds[i]); }
      });

      if (successCount > 0) {
        await fetchReports(startDate, endDate);
        Swal.fire({ icon: 'success', title: 'Uploaded to SAP', text: `${successCount} DC(s) successfully uploaded.`, timer: 2000, showConfirmButton: false });
      }
      if (failedCount > 0) {
        Swal.fire({ icon: 'error', title: 'Some Uploads Failed', html: `Failed DC IDs: <b>${failedRows.join(', ')}</b>` });
      }
    } catch (err) {
      console.error(err);
      Swal.fire({ icon: 'error', title: 'Unexpected Error', text: 'Something went wrong.' });
    } finally {
      setIsSapLoad(false);
    }
  };

  const statusBadge = (val) => {
    if (!val || val === '-') return <span className="text-gray-400">-</span>;
    const isActive = val.toLowerCase() === 'active';
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
        isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
      }`}>
        {val}
      </span>
    );
  };

  const renderCell = (col, item) => {
    const val = item[col.key];
    if (col.key === 'dc_status' || col.key === 'ewb_status') return statusBadge(val);
    if (col.key === 'is_send_sap') {
      const isSent = Boolean(item.is_send_sap);
      return (
        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap ${
          isSent ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
        }`}>
          {isSent ? 'Sent' : 'Pending'}
        </span>
      );
    }
    if (['po_date', 'rr_date', 'supplier_inv_date', 'doc_date', 'ewb_date'].includes(col.key)) {
      return <span>{formatDate(val)}</span>;
    }
    if (['taxable_value', 'cgst', 'sgst', 'gross', 'item_rate', 'rate_incl_tax'].includes(col.key)) {
      const num = parseFloat(val);
      if (!isNaN(num) && num > 0) return <span className="font-mono tabular-nums">₹{Number(val).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>;
    }
    return <span className={`${val === '-' ? 'text-gray-300' : ''}`}>{val ?? '-'}</span>;
  };

  return (
    <div className="bg-[#F9F9FC] min-h-screen font-poppins">

      {/* Page Header */}
      <div className="px-6 pt-5 pb-3">
        <h1 className="text-xl font-bold text-gray-900">Delivery Challan & E-Way Bill Register</h1>
        <div className="flex items-center gap-x-2 text-sm text-gray-500 mt-1">
          <Link to="/" className="text-orange-500">Dashboard</Link>
          <RiArrowUpSFill className="rotate-90" size={18} />
          <span>Report</span>
        </div>
        <p className="text-xs text-gray-400 mt-0.5">Goodshed Wagon Mobile Application — Krishi Nutrition Company Private Limited</p>
      </div>

      {/* Controls */}
      <div className="px-6 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left: Filters */}
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <div className="flex items-center gap-2">
            <label className="text-gray-600 font-medium">From:</label>
            <input
              type="date" value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-gray-600 font-medium">To:</label>
            <input
              type="date" value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 outline-none"
            />
          </div>
          <button onClick={handleFilter}      className="px-4 py-1.5 bg-orange-500 text-white rounded-lg text-sm font-medium hover:bg-orange-600 transition">Filter</button>
          <button onClick={handleClearFilter} className="px-4 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition">Clear</button>
          <input
            type="text" placeholder="Search…" value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-400 outline-none w-44"
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500 mr-1">{filteredData.length} records</span>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-1.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition"
          >
            <RiFileExcel2Line size={16} /> Export Excel
          </button>
          <button
            onClick={handleUploadToSAP}
            disabled={isSapLoad}
            className={`flex items-center gap-2 px-4 py-1.5 text-white bg-[#F3890A] hover:bg-orange-600 rounded-lg text-sm font-medium transition ${
              isSapLoad ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isSapLoad ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <RiUploadCloud2Line size={16} />
                <span>Upload to SAP</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="mx-6 bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-50">
          <table className="w-full text-sm border-collapse" style={{ minWidth: '3800px' }}>
            <thead>
              <tr className="bg-[#FDF3E6] border-b-2 border-orange-200">
                {COLUMNS.map(col => (
                  <th
                    key={col.key}
                    className="px-3 py-3 text-center text-xs font-semibold text-gray-700 whitespace-nowrap border-r border-orange-100 last:border-r-0"
                    style={{ minWidth: col.width }}
                  >
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isTableLoading ? (
                <tr>
                  <td colSpan={COLUMNS.length} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-sm text-gray-400">Loading report data…</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedData.length > 0 ? (
                <>
                  {paginatedData.map((item, idx) => (
                    <tr
                      key={`${item.s_no}-${item.item_code}-${idx}`}
                      className={`hover:bg-orange-50/50 transition-colors ${
                        item.dc_status === 'Cancelled' ? 'bg-red-50/30' : ''
                      }`}
                    >
                      {COLUMNS.map(col => (
                        <td
                          key={col.key}
                          className="px-3 py-2.5 text-center text-xs text-gray-700 border-r border-gray-100 last:border-r-0"
                          title={col.key === 'branch_address' ? String(item[col.key] ?? '') : undefined}
                        >
                          {col.key === 'row_index'
                            ? startIndex + idx + 1
                            : renderCell(col, item)
                          }
                        </td>
                      ))}
                    </tr>
                  ))}
                </>
              ) : (
                <tr>
                  <td colSpan={COLUMNS.length} className="py-14 text-center text-gray-400 text-sm">
                    No data available for the selected date range.
                  </td>
                </tr>
              )}
            </tbody>

            {/* Totals Footer */}
            {!isTableLoading && filteredData.length > 0 && (
              <tfoot>
                <tr className="bg-orange-50 border-t-2 border-orange-300 font-semibold">
                  {COLUMNS.map((col, i) => (
                    <td
                      key={col.key}
                      className="px-3 py-3 text-center text-xs text-gray-800 border-r border-orange-200 last:border-r-0"
                    >
                      {i === 0 ? (
                        <span className="font-bold text-orange-700">Total</span>
                      ) : TOTAL_COLS.has(col.key) ? (
                        <span className={`font-mono tabular-nums ${['taxable_value','cgst','sgst','gross'].includes(col.key) ? 'text-orange-700' : 'text-gray-800'}`}>
                          {col.key === 'quantity'
                            ? totals[col.key].toFixed(3)
                            : col.key === 'no_of_bags'
                            ? totals[col.key].toLocaleString('en-IN')
                            : `₹${totals[col.key].toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                          }
                        </span>
                      ) : (
                        ''
                      )}
                    </td>
                  ))}
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <span className="text-xs text-gray-500">
              Showing {startIndex + 1}–{Math.min(startIndex + itemsPerPage, filteredData.length)} of {filteredData.length} rows
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPreviousPage} disabled={currentPage === 1}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${currentPage === 1 ? 'text-gray-400 bg-gray-200 cursor-not-allowed' : 'text-white bg-orange-500 hover:bg-orange-600'}`}
              >
                &lt; Prev
              </button>
              {currentPage > 2 && <button onClick={goToFirstPage} className="px-3 py-1.5 rounded-lg text-xs border hover:bg-gray-100">1</button>}
              {currentPage > 3 && <span className="px-2 text-gray-400 text-xs">…</span>}
              {currentPage > 1 && (
                <button onClick={() => setCurrentPage(currentPage - 1)} className="px-3 py-1.5 rounded-lg text-xs border hover:bg-gray-100">
                  {currentPage - 1}
                </button>
              )}
              <span className="px-3 py-1.5 rounded-lg text-xs bg-orange-500 text-white font-bold">{currentPage}</span>
              {currentPage < totalPages && (
                <button onClick={() => setCurrentPage(currentPage + 1)} className="px-3 py-1.5 rounded-lg text-xs border hover:bg-gray-100">
                  {currentPage + 1}
                </button>
              )}
              {currentPage < totalPages - 2 && <span className="px-2 text-gray-400 text-xs">…</span>}
              {currentPage < totalPages - 1 && (
                <button onClick={goToLastPage} className="px-3 py-1.5 rounded-lg text-xs border hover:bg-gray-100">{totalPages}</button>
              )}
              <button
                onClick={goToNextPage} disabled={currentPage === totalPages}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${currentPage === totalPages ? 'text-gray-400 bg-gray-200 cursor-not-allowed' : 'text-white bg-orange-500 hover:bg-orange-600'}`}
              >
                Next &gt;
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="h-6" />
    </div>
  );
}