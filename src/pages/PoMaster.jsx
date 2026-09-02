import React, { useEffect, useState, useMemo, useRef } from 'react'
import { Link, Links } from 'react-router-dom'
import { RiArrowUpSFill, RiDeleteBin6Line, RiSearchLine, RiRefreshLine } from 'react-icons/ri'
import { IoCloseSharp } from "react-icons/io5";
import { LuImport } from 'react-icons/lu'
import { MdFileDownload, MdDownloadForOffline } from 'react-icons/md';
import { BsCalendarDateFill } from 'react-icons/bs';
import axios from 'axios';
import Swal from "sweetalert2";
import ExcelExport from '../utils/ExcelExport'
import { FiEdit2 } from 'react-icons/fi';
import { CustomDropdown } from '../components/CustomDropdown';
import { useAuth } from '../auth/AuthContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import SearchableSelect, { SELECT_ALL_VALUE } from '../components/SearchableSelect';


const POMaster = () => {

  const { getPermissions } = useAuth();
  const { purchaseOrder } = getPermissions() || {};

  const [data, setData] = useState([]);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  // Bulk download modal state
  const [isBulkDownloadOpen, setIsBulkDownloadOpen] = useState(false);
  const [bulkFromDate, setBulkFromDate] = useState('');
  const [bulkToDate, setBulkToDate] = useState('');
  const [bulkSelectedPo, setBulkSelectedPo] = useState('');
  const [bulkSelectedSupplier, setBulkSelectedSupplier] = useState('');
  const [bulkSelectedRR, setBulkSelectedRR] = useState('');
  const [bulkSelectedMaterial, setBulkSelectedMaterial] = useState('');
  const [bulkSelectedStatus, setBulkSelectedStatus] = useState('');
  const [isBulkDownloading, setIsBulkDownloading] = useState(false);

  const [materialOption, setMaterialOption] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  const [statusOption, setStatusOption] = useState([
    { label: 'Pending', value: 1 },
    { label: 'In-Transit', value: 2 },
    { label: 'Active', value: 3 },
    { label: 'Close', value: 4 },
  ])

  const [selectedMaterial, setSelectedMaterial] = useState('');
  const [selectedUnit, setSelectedUnit] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(0);
  const [noOfBags, setNoOfBags] = useState(0);

  const [updatePoId, setUpdatePoId] = useState("")

  const [materialList, setMaterialList] = useState([]);
  const [unitList, setUnitList] = useState([]);

  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    po_no: "",
    supplier_id: "",
    bill_no: "",
    materials: [],
    rr_no: "",
    status: 1,
    po_date: "",
    rr_date: "",
    supplier_invoice_date: ""
  });

  const fetchDropdownData = async () => {
    try {
      const { data: matData } = await axios.get(`/material/getAll`);
      if (matData.status === true) {
        const formattedData = matData.data.map(item => ({
          label: item.name,
          value: `${item.name},${item.id}`,
        }));
        setMaterialOption(formattedData);
      } else {
        setMaterialOption([]);
      }

      const { data: supplierData } = await axios.get(`/supplier/getAll`);
      if (supplierData.status === true) {
        const formattedData = supplierData.data.map(item => ({
          label: item.name,
          value: item.id,
        }));
        setSuppliers(formattedData);
      } else {
        setSuppliers([]);
      }

      const { data: unitData } = await axios.get(`/unit/getAll`);
      if (unitData.status === true) {
        const formattedData = unitData.data.map(item => ({
          label: item.unit,
          value: `${item.unit},${item.id}`,
        }));
        setUnitList(formattedData);
      } else {
        setUnitList([]);
      }

    } catch (err) {
      console.error("Error loading dropdown data:", err);
    }
  };



  useEffect(() => {
    fetchPOMaster();
    fetchDropdownData()
  }, []);

  const fetchPOMaster = async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get("/po/getAll");

      const updatedData = data.data.map((item) => {
        const materialNames = item.materials.map(
          (mat) => `${mat.name} [₹${Number(mat.price || 0).toLocaleString('en-IN')}]`
        );
        return {
          ...item,
          material_view: materialNames.join(', '),
        };
      });

      setData(updatedData);

    }
    catch (err) {
      console.log("Error fetching PO master:", err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = async (item) => {

    try {

      setFormData({
        po_no: item.po_no || "",
        supplier_id: item.supplier__id || "",
        bill_no: item.bill_no || "",
        materials: [],
        rr_no: item.rr_no || "",
        status: item.status !== undefined ? item.status : 1,
        po_date: item.po_date || "",
        rr_date: item.rr_date || "",
        supplier_invoice_date: item.supplier_invoice_date || ""
      });

      setUpdatePoId(item.id)

      setMaterialList(item.materials);

      // await fetchDropdownData(item.rr_no);

      setIsOpen(true);

    } catch (error) {
      console.log("server error: ", error)
    } finally {
      // setLoadingId(null)
    }
  };


  const handleDelete = async (id) => {
    Swal.fire({
      title: "Are you sure?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const { data } = await axios.delete(`/po/delete/${id}`);
          if (data.status) {
            Swal.fire({
              toast: true,
              position: "top-end",
              icon: "success",
              title: "Successfullly deleted.",
              showConfirmButton: false,
              timer: 3000
            });

            fetchPOMaster();
          }
        } catch (err) {
          console.log("Error deleting data:", err);
        }
      }
    });
  };

  const handleAddMaterial = () => {
    if (!selectedMaterial || !quantity || !price || !noOfBags) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Please fill all material data.",
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }

    const mat_id = selectedMaterial.split(',')[1]


    const isAlreadyAdded = materialList.some(item => item.mat_id === mat_id);
    if (isAlreadyAdded) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "warning",
        title: "This material is already added / delete and change qty.",
        showConfirmButton: false,
        timer: 2000
      });
      return;
    }


    const newId = materialList.length > 0 ? materialList[materialList.length - 1].id + 1 : 1;

    const newItem = {
      id: newId,
      mat_id: selectedMaterial.split(',')[1],
      name: selectedMaterial.split(',')[0],
      quantity: parseInt(quantity, 10),
      price: parseFloat(price, 10),
      noOfBags: parseFloat(noOfBags, 10),
      unit_id: selectedUnit.split(',')[1],
      unit_name: selectedUnit.split(',')[0],
    };

    setMaterialList(prev => [...prev, newItem]);
    setSelectedMaterial('');
    setQuantity('');
    setPrice('');
    setNoOfBags('')
    setSelectedUnit('');


  };



  const handleDeleteMaterial = (id) => {
    const updated = materialList.filter((mat) => mat.id !== id);
    setMaterialList(updated);
  };



  const handleExport = () => {
    ExcelExport(data, "PO_Master.xlsx");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setIsSubmitLoading(true)

    const trimmedFormData = {
      po_no: formData.po_no ? formData.po_no.trim() : "",
      rr_no: formData.rr_no ? formData.rr_no.trim() : "",
      bill_no: formData.bill_no ? formData.bill_no.trim() : "",
      supplier__id: formData.supplier_id,
      materials: materialList,
      status: formData.status,
      po_date: formData.po_date || null,
      rr_date: formData.rr_date || null,
      supplier_invoice_date: formData.supplier_invoice_date || null
    };

    // Validation
    if (
      !trimmedFormData.rr_no ||
      !trimmedFormData.po_no ||
      !trimmedFormData.bill_no ||
      !trimmedFormData.supplier__id ||
      trimmedFormData.materials.length === 0
    ) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: "Please fill all required fields and add at least one material",
        showConfirmButton: false,
        timer: 2000
      });
      setIsSubmitLoading(false)
      return;
    }

    try {
      const { data } = await axios.put(`/po/update/${updatePoId}`, trimmedFormData);
      if (data.status == true) {
        await fetchPOMaster();

        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "Po updated successfully",
          showConfirmButton: false,
          timer: 2000
        });

      }
      else {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "error",
          title: "Something Error, Try Again",
          showConfirmButton: false,
          timer: 2000
        });
      }


    }
    catch (error) {
      console.error("Error update po:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.response?.data?.message || "Something went wrong. Please try again."
      });
    } finally {
      setIsSubmitLoading(false)
      closeModal()
    }
  };



  // Apply last 1 month date range
  const applyLastOneMonth = () => {
    const today = new Date();
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(today.getMonth() - 1);
    const fmt = (d) => d.toISOString().split('T')[0];
    setBulkFromDate(fmt(oneMonthAgo));
    setBulkToDate(fmt(today));
  };

  // Helper: get PO date from any available date field, as a local YYYY-MM-DD string
  const getPoDateStr = (item) => {
    const raw = item?.supplier_invoice_date || item?.po_date || item?.rr_date || item?.createdAt || item?.created_at || item?.updatedAt || null;
    if (!raw) return null;
    if (typeof raw === 'string') {
      const trimmed = raw.trim();
      const ymdMatch = trimmed.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
      if (ymdMatch) {
        const y = ymdMatch[1];
        const m = ymdMatch[2].padStart(2, '0');
        const d = ymdMatch[3].padStart(2, '0');
        return `${y}-${m}-${d}`;
      }
      const dmyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/);
      if (dmyMatch) {
        const d = dmyMatch[1].padStart(2, '0');
        const m = dmyMatch[2].padStart(2, '0');
        const y = dmyMatch[3];
        return `${y}-${m}-${d}`;
      }
    }
    const d = new Date(raw);
    if (isNaN(d.getTime())) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Helper: extract all material names from PO item
  const getPoMaterialNames = (item) => {
    if (!item) return [];
    let mats = [];
    if (Array.isArray(item.materials)) {
      mats = item.materials;
    } else if (typeof item.materials === 'string') {
      try {
        const parsed = JSON.parse(item.materials);
        if (Array.isArray(parsed)) mats = parsed;
        else if (parsed) mats = [parsed];
      } catch {
        if (item.materials.trim()) mats = [{ name: item.materials.trim() }];
      }
    }
    const names = [];
    mats.forEach(m => {
      if (typeof m === 'string' && m.trim()) names.push(m.trim());
      else if (m && typeof m === 'object' && m.name) names.push(String(m.name).trim());
    });
    if (names.length === 0 && item.material_view) {
      const parts = item.material_view.split(',').map(s => s.split('[')[0].trim()).filter(Boolean);
      names.push(...parts);
    }
    return names;
  };

  const getStatusText = (status) => {
    switch (Number(status)) {
      case 1: return 'Pending';
      case 2: return 'In-Transit';
      case 3: return 'Active';
      case 4: return 'Closed';
      default: return 'Unknown';
    }
  };

  // Filter PO items for bulk download (requires at least one active filter)
  // SELECT_ALL_VALUE ('__ALL__') on a field = include all values for that field
  const filterPOForBulk = (items, fromDate, toDate, poNo, supplier, rrNo, material, status) => {
    const hasAnyFilter = Boolean(poNo || supplier || rrNo || material || status || fromDate || toDate);
    if (!hasAnyFilter) {
      return [];
    }

    return items.filter((item) => {
      // Status filter — skip when SELECT_ALL_VALUE or empty
      if (status && status !== SELECT_ALL_VALUE) {
        if (String(item.status) !== String(status)) return false;
      }

      // PO No filter
      if (poNo && poNo !== SELECT_ALL_VALUE) {
        if (String(item.po_no || '').trim().toLowerCase() !== String(poNo).trim().toLowerCase()) return false;
      }

      // Supplier filter
      if (supplier && supplier !== SELECT_ALL_VALUE) {
        if (String(item.supplier_name || '').trim().toLowerCase() !== String(supplier).trim().toLowerCase()) return false;
      }

      // RR No filter
      if (rrNo && rrNo !== SELECT_ALL_VALUE) {
        if (String(item.rr_no || '').trim().toLowerCase() !== String(rrNo).trim().toLowerCase()) return false;
      }

      // Material filter
      if (material && material !== SELECT_ALL_VALUE) {
        const targetMat = String(material).trim().toLowerCase();
        const mats = getPoMaterialNames(item).map(m => m.toLowerCase());
        const hasMat = mats.some(m => m === targetMat || m.includes(targetMat) || targetMat.includes(m));
        if (!hasMat) return false;
      }

      // Date range filter
      if (fromDate && toDate) {
        const dateStr = getPoDateStr(item);
        if (dateStr && (dateStr < fromDate || dateStr > toDate)) return false;
      } else if (fromDate) {
        const dateStr = getPoDateStr(item);
        if (dateStr && dateStr < fromDate) return false;
      } else if (toDate) {
        const dateStr = getPoDateStr(item);
        if (dateStr && dateStr > toDate) return false;
      }

      return true;
    });
  };

  // Memoized options for filter dropdowns
  const poFilterOptions = useMemo(() => {
    const set = new Set();
    data.forEach(d => { if (d.po_no) set.add(String(d.po_no).trim()); });
    const vals = [...set].sort();
    return [{ label: 'All PO Numbers (Optional)', value: '' }, ...vals.map(v => ({ label: v, value: v }))];
  }, [data]);

  const supplierFilterOptions = useMemo(() => {
    const set = new Set();
    data.forEach(d => { if (d.supplier_name) set.add(String(d.supplier_name).trim()); });
    suppliers.forEach(s => { if (s.label) set.add(String(s.label).trim()); });
    const vals = [...set].sort();
    return [{ label: 'All Suppliers (Optional)', value: '' }, ...vals.map(v => ({ label: v, value: v }))];
  }, [data, suppliers]);

  const rrFilterOptions = useMemo(() => {
    const set = new Set();
    data.forEach(d => { if (d.rr_no) set.add(String(d.rr_no).trim()); });
    const vals = [...set].sort();
    return [{ label: 'All RR Numbers (Optional)', value: '' }, ...vals.map(v => ({ label: v, value: v }))];
  }, [data]);

  const materialFilterOptions = useMemo(() => {
    const set = new Set();
    data.forEach(d => {
      getPoMaterialNames(d).forEach(m => set.add(m));
    });
    materialOption.forEach(m => {
      if (m.label) set.add(String(m.label).trim());
    });
    const vals = [...set].sort();
    return [{ label: 'All Materials (Optional)', value: '' }, ...vals.map(v => ({ label: v, value: v }))];
  }, [data, materialOption]);

  const poStatusFilterOptions = [
    { label: 'All Status (Optional)', value: '' },
    { label: 'Pending', value: '1' },
    { label: 'In-Transit', value: '2' },
    { label: 'Active', value: '3' },
    { label: 'Closed', value: '4' },
  ];

  // Convert number to Indian currency words
  const numberToWords = (num) => {
    const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
    const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

    const inWords = (n) => {
      let str = '';
      if (n >= 10000000) {
        str += inWords(Math.floor(n / 10000000)) + ' Crore ';
        n %= 10000000;
      }
      if (n >= 100000) {
        str += inWords(Math.floor(n / 100000)) + ' Lakh ';
        n %= 100000;
      }
      if (n >= 1000) {
        str += inWords(Math.floor(n / 1000)) + ' Thousand ';
        n %= 1000;
      }
      if (n >= 100) {
        str += inWords(Math.floor(n / 100)) + ' Hundred ';
        n %= 100;
      }
      if (n > 0) {
        if (n < 20) str += a[n];
        else str += b[Math.floor(n / 10)] + (n % 10 ? ' ' + a[n % 10] : '');
      }
      return str.trim();
    };

    const rounded = Math.round(Number(num) || 0);
    if (rounded <= 0) return 'Zero Rupees Only';
    return `${inWords(rounded)} Rupees Only`;
  };

  // Load Krishi Logo as Base64 for PDF rendering (uses official /assets/krishi.png)
  const loadLogoBase64 = () => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch (e) {
          resolve(null);
        }
      };
      img.onerror = () => {
        const img2 = new Image();
        img2.crossOrigin = 'Anonymous';
        img2.onload = () => {
          try {
            const canvas = document.createElement('canvas');
            canvas.width = img2.naturalWidth || img2.width;
            canvas.height = img2.naturalHeight || img2.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img2, 0, 0);
            resolve(canvas.toDataURL('image/png'));
          } catch {
            resolve(null);
          }
        };
        img2.onerror = () => resolve(null);
        img2.src = '/krishi-logo.png';
      };
      img.src = '/assets/krishi.png';
    });
  };

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

  // Render Krishi Purchase Order Document — matches the DC header format
  const renderPoVoucher = (doc, item, logoImg = null, isBulk = false, currentIndex = 1, totalCount = 1) => {
    const startX = 12;
    const pageWidth = 210;
    const contentWidth = 186; // 210 - 24

    // ── 1. Background Watermark ─────────────────────────────────────────
    try {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(55);
      doc.setTextColor(244, 244, 246);
      doc.text('KRISHI', pageWidth / 2, 155, { align: 'center', angle: 35 });
    } catch (e) { /* skip if angle unsupported */ }

    // ── 2. Top Centered Document Title ──────────────────────────────────
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(0, 0, 0);
    doc.text('PURCHASE ORDER', pageWidth / 2, 15, { align: 'center' });

    // ── 3. Header: Left Logo & Right Company Address (Exact DC Layout) ──
    const logoW = 44;
    const logoH = 19;
    const logoX = startX + 2;
    const logoY = 21;
    if (logoImg) {
      try {
        doc.addImage(logoImg, 'PNG', logoX, logoY, logoW, logoH);
      } catch (e) {
        console.warn('Could not draw logo:', e);
      }
    }

    // Right Company Address (Purchaser / Buyer)
    const addressX = startX + 78;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.8);
    doc.setTextColor(0, 0, 0);
    doc.text('KRISHI NUTRITION COMPANY PRIVATE LIMITED', addressX, 23.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 30, 30);
    doc.text('Regd. Office : Plot No. KK8, KK9, 3rd Cross Road,', addressX, 27.8);
    doc.text('Sipcot Industrial Growth Center', addressX, 31.8);
    doc.text('PERUNDURAI - 638052, Erode, Tamil Nadu', addressX, 35.8);
    doc.text('CIN : U15200TZ2013PTC019958', addressX, 39.8);
    doc.text('GSTIN : 33AAFCK3415K1ZO', addressX, 43.8);

    if (isBulk) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(120, 120, 120);
      doc.text(`[ ${currentIndex} of ${totalCount} ]`, startX + contentWidth, 47, { align: 'right' });
    }

    // ── 4. Two-Column PO Details Info Box ────────────────────────────────
    const infoBoxY = 49;
    const infoBoxH = 48;
    const midX = startX + contentWidth / 2;

    // Info box border
    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.rect(startX, infoBoxY, contentWidth, infoBoxH);
    // vertical divider
    doc.line(midX, infoBoxY, midX, infoBoxY + infoBoxH);

    // Status colour helper
    const statusText = getStatusText(item.status);
    const statusColour = item.status === 3 ? [34, 139, 34]   // Active — green
      : item.status === 4 ? [180, 0, 0]                       // Closed — red
      : item.status === 2 ? [30, 100, 200]                    // In-Transit — blue
      : [160, 120, 0];                                         // Pending — amber

    // Generated date (DD-MM-YYYY)
    const today = new Date();
    const generatedDate = `${String(today.getDate()).padStart(2, '0')}-${String(today.getMonth() + 1).padStart(2, '0')}-${today.getFullYear()}`;

    // Left column rows
    const leftInfoRows = [
      { label: 'PO Number:',        value: String(item.po_no || '-'),                    bold: true },
      { label: 'PO Date:',          value: formatDate(item.po_date) },
      { label: 'Supplier Name:',    value: String(item.supplier_name || '-'),            bold: true },
      { label: 'Supplier Inv No:',  value: String(item.bill_no || '-') },
      { label: 'Supplier Inv Date:', value: formatDate(item.supplier_invoice_date) },
    ];

    // Right column rows
    const rightInfoRows = [
      { label: 'RR Number:',       value: String(item.rr_no || '-') },
      { label: 'RR Date:',         value: formatDate(item.rr_date) },
      { label: 'Status:',          value: statusText,      coloured: true },
      { label: 'Generated Date:',  value: generatedDate },
    ];

    const lInfoX = startX + 4;
    const lValX  = startX + 38;
    const rInfoX = midX + 4;
    const rValX  = midX + 34;
    const infoFontSz = 8;
    const infoLineH  = 8;

    leftInfoRows.forEach((row, i) => {
      const y = infoBoxY + 7 + i * infoLineH;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(infoFontSz);
      doc.setTextColor(70, 90, 120);
      doc.text(row.label, lInfoX, y);
      doc.setFont('helvetica', row.bold ? 'bold' : 'normal');
      doc.setTextColor(15, 15, 15);
      doc.text(String(row.value), lValX, y);
    });

    rightInfoRows.forEach((row, i) => {
      const y = infoBoxY + 7 + i * infoLineH;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(infoFontSz);
      doc.setTextColor(70, 90, 120);
      doc.text(row.label, rInfoX, y);
      if (row.coloured) {
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...statusColour);
      } else {
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(15, 15, 15);
      }
      doc.text(String(row.value), rValX, y);
    });

    // ── 5. "MATERIALS & PRICING BREAKDOWN" section heading ───────────────
    const matHeadY = infoBoxY + infoBoxH + 6;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(10, 10, 10);
    doc.text('MATERIALS & PRICING BREAKDOWN', startX, matHeadY);

    // ── 7. Materials Table ────────────────────────────────────────────────
    const materials = [];
    if (Array.isArray(item.materials)) {
      materials.push(...item.materials);
    } else if (typeof item.materials === 'string') {
      try {
        const parsed = JSON.parse(item.materials);
        if (Array.isArray(parsed)) materials.push(...parsed);
        else if (parsed) materials.push(parsed);
      } catch (e) { /* ignore */ }
    }

    let totalBagsSum  = 0;
    let totalQtySum   = 0;
    let grandTotalSum = 0;

    const tableRows = [];

    materials.forEach((mat, idx) => {
      const qty   = Number(mat.quantity)  || 0;
      const rate  = Number(mat.price)     || 0;
      const bags  = Number(mat.noOfBags)  || 0;
      const unit  = mat.unit_name || mat.unit || 'Mt';
      const total = qty * rate;

      totalBagsSum  += bags;
      totalQtySum   += qty;
      grandTotalSum += total;

      const bagsStr  = bags > 0 ? bags.toLocaleString('en-IN') : '-';
      const qtyStr   = qty  > 0 ? qty.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '-';
      const rateStr  = rate > 0 ? rate.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
      const totalStr = total > 0 ? total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';

      tableRows.push([
        String(idx + 1),
        String(mat.name || 'MAIZE').toUpperCase(),
        bagsStr,
        qtyStr,
        String(unit),
        rateStr,
        totalStr
      ]);
    });

    if (tableRows.length === 0) {
      tableRows.push([
        '1',
        String(item.material_view || 'MAIZE').toUpperCase(),
        '-', '-', 'Mt', '-', '-'
      ]);
    }

    const grandTotalStr  = grandTotalSum > 0 ? grandTotalSum.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-';
    const totalBagsStr   = totalBagsSum  > 0 ? totalBagsSum.toLocaleString('en-IN') : '-';
    const totalQtyStr    = totalQtySum   > 0 ? totalQtySum.toLocaleString('en-IN', { minimumFractionDigits: 3, maximumFractionDigits: 3 }) : '-';

    autoTable(doc, {
      startY: matHeadY + 3,
      margin: { left: startX, right: startX },
      head: [[
        'S.NO',
        'MATERIAL DESCRIPTION',
        'BAGS',
        'QUANTITY',
        'UNIT',
        'RATE (Rs.)',
        'TOTAL AMOUNT (Rs.)'
      ]],
      body: tableRows,
      foot: [[
        { content: 'GRAND TOTAL', colSpan: 2, styles: { halign: 'center', fontStyle: 'bold', textColor: [10, 10, 10] } },
        { content: totalBagsStr,  styles: { halign: 'center', fontStyle: 'bold' } },
        { content: totalQtyStr,   styles: { halign: 'center', fontStyle: 'bold' } },
        { content: '-',           styles: { halign: 'center', fontStyle: 'bold' } },
        { content: '-',           styles: { halign: 'center', fontStyle: 'bold' } },
        { content: grandTotalStr, styles: { halign: 'right',  fontStyle: 'bold', textColor: [10, 10, 10] } }
      ]],
      theme: 'grid',
      styles: {
        lineWidth: 0.3,
        lineColor: [180, 180, 180],
        textColor: [20, 20, 20],
        valign: 'middle',
        cellPadding: 2,
        fontSize: 7.5,
        overflow: 'linebreak'
      },
      headStyles: {
        fillColor:  [20, 24, 40],
        textColor:  [255, 255, 255],
        fontStyle:  'bold',
        fontSize:   7.5,
        halign:     'center',
        valign:     'middle',
        lineWidth:  0.3,
        lineColor:  [20, 24, 40],
        cellPadding: 2
      },
      footStyles: {
        fillColor:  [235, 235, 235],
        textColor:  [10, 10, 10],
        fontStyle:  'bold',
        fontSize:   7.5,
        valign:     'middle',
        lineWidth:  0.3,
        lineColor:  [180, 180, 180],
        cellPadding: 2
      },
      bodyStyles: {
        fontSize:  7.5,
        textColor: [20, 20, 20],
        halign:    'center',
        valign:    'middle',
        lineWidth: 0.3,
        lineColor: [200, 200, 200],
        cellPadding: 2
      },
      alternateRowStyles: {
        fillColor: [250, 250, 252]
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { halign: 'left',   cellWidth: 54 },
        2: { halign: 'center', cellWidth: 20 },
        3: { halign: 'center', cellWidth: 24 },
        4: { halign: 'center', cellWidth: 16 },
        5: { halign: 'right',  cellWidth: 26 },
        6: { halign: 'right',  cellWidth: 34 }
      }
    });

    const finalTableY = doc.lastAutoTable ? doc.lastAutoTable.finalY : matHeadY + 40;

    // ── 7. Amount in Words Box ────────────────────────────────────────────
    const wordsY = finalTableY + 5;
    doc.setDrawColor(200, 200, 200);
    doc.setFillColor(252, 252, 252);
    doc.setLineWidth(0.3);
    doc.rect(startX, wordsY, contentWidth, 10, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(10, 10, 10);
    doc.text('Amount in Words:', startX + 4, wordsY + 6.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    const words = numberToWords(grandTotalSum);
    doc.text(words, startX + 38, wordsY + 6.5);

    // ── 8. Signature Section ──────────────────────────────────────────────
    const sigY = wordsY + 20;

    // Left dashed signature line
    doc.setDrawColor(100, 100, 100);
    doc.setLineWidth(0.3);
    doc.setLineDashPattern([1.5, 1.5], 0);
    doc.line(startX + 4, sigY, startX + 66, sigY);

    // Right dashed signature line
    doc.line(startX + contentWidth - 66, sigY, startX + contentWidth - 4, sigY);
    doc.setLineDashPattern([], 0);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(20, 20, 20);
    doc.text('Prepared / Verified By', startX + 35, sigY + 5, { align: 'center' });
    doc.text('Authorized Signatory',   startX + contentWidth - 35, sigY + 5, { align: 'center' });

    // ── 9. Footer Note ───────────────────────────────────────────────────
    const footNoteY = sigY + 14;
    doc.setDrawColor(210, 210, 210);
    doc.setFillColor(248, 248, 250);
    doc.setLineWidth(0.2);
    doc.rect(startX, footNoteY, contentWidth, 8, 'FD');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(
      'This is a computer generated Purchase Order document and does not require a physical signature.',
      pageWidth / 2, footNoteY + 5, { align: 'center' }
    );
  };


  // Download Single PO as PDF Voucher
  const downloadSinglePoPdf = async (item) => {
    try {
      const doc = new jsPDF();
      const logoImg = await loadLogoBase64();
      renderPoVoucher(doc, item, logoImg, false, 1, 1);
      doc.save(`PO_${String(item.po_no || 'Document').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`);
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `PO PDF downloaded successfully`,
        showConfirmButton: false,
        timer: 2000
      });
    } catch (err) {
      console.error('Error generating single PO PDF:', err);
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to generate PDF', showConfirmButton: false, timer: 2000 });
    }
  };

  // Bulk download filtered POs as comprehensive PDF
  const handleBulkDownloadPO = async () => {
    const hasAnyFilter = bulkSelectedPo || bulkSelectedSupplier || bulkSelectedRR || bulkSelectedMaterial || bulkSelectedStatus || bulkFromDate || bulkToDate;
    if (!hasAnyFilter) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'Please select at least one filter or date range', showConfirmButton: false, timer: 2000 });
      return;
    }
    if (bulkFromDate && bulkToDate && bulkFromDate > bulkToDate) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'warning', title: 'From date cannot be after To date', showConfirmButton: false, timer: 2000 });
      return;
    }

    const filtered = filterPOForBulk(data, bulkFromDate, bulkToDate, bulkSelectedPo, bulkSelectedSupplier, bulkSelectedRR, bulkSelectedMaterial, bulkSelectedStatus);
    if (filtered.length === 0) {
      Swal.fire({ toast: true, position: 'top-end', icon: 'info', title: 'No Purchase Orders found for selected filter', showConfirmButton: false, timer: 2500 });
      return;
    }

    setIsBulkDownloading(true);
    try {
      const doc = new jsPDF();
      const logoImg = await loadLogoBase64();

      for (let i = 0; i < filtered.length; i++) {
        if (i > 0) doc.addPage();
        renderPoVoucher(doc, filtered[i], logoImg, true, i + 1, filtered.length);
      }

      let filename = 'Bulk_PO_Vouchers';
      if (bulkSelectedPo) filename += `_PO_${bulkSelectedPo.replace(/[^a-zA-Z0-9_-]/g, '_')}`;
      if (bulkFromDate && bulkToDate) filename += `_${bulkFromDate}_to_${bulkToDate}`;
      filename += '.pdf';

      doc.save(filename);

      setIsBulkDownloadOpen(false);
      setBulkSelectedPo('');
      setBulkSelectedSupplier('');
      setBulkSelectedRR('');
      setBulkSelectedMaterial('');
      setBulkSelectedStatus('');
      setBulkFromDate('');
      setBulkToDate('');

      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: `Downloaded PDF containing ${filtered.length} PO(s)`,
        showConfirmButton: false,
        timer: 3000
      });
    } catch (err) {
      console.error('Error generating bulk PO PDF:', err);
      Swal.fire({ toast: true, position: 'top-end', icon: 'error', title: 'Failed to generate bulk PDF', showConfirmButton: false, timer: 2000 });
    } finally {
      setIsBulkDownloading(false);
    }
  };

  const filteredData = data.filter((item) => {
    return (
      item.po_no.toString().toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.bill_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.material_view.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.rr_no.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  function closeModal() {
    setIsOpen(false);
    setFormData({
      po_no: "",
      supplier_id: "",
      bill_no: "",
      materials: [],
      rr_no: "",
      status: 1,
      po_date: "",
      rr_date: "",
      supplier_invoice_date: ""
    });
  }


  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  // Pagination logic
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);
  const goToFirstPage = () => setCurrentPage(1);
  const goToLastPage = () => setCurrentPage(totalPages);
  const goToNextPage = () => setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  const goToPreviousPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));

  return (
    <div className={` rounded-lg shadow flex-1 `}>

      {/* Bulk Download Modal */}
      {isBulkDownloadOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl font-poppins overflow-hidden flex flex-col max-h-[94vh] border border-gray-100">

            {/* Header */}
            <div className="flex justify-between items-center px-7 py-5 bg-gradient-to-r from-orange-500 via-orange-500 to-amber-500 shrink-0">
              <div className="flex items-center gap-3.5 text-white">
                <div className="p-2.5 bg-white/20 rounded-xl">
                  <MdDownloadForOffline size={24} className="text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-bold tracking-tight">Bulk Download — Purchase Orders</h2>
                  <p className="text-xs text-orange-100 mt-0.5">Apply filters below and export matching PO vouchers as a combined PDF</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setIsBulkDownloadOpen(false);
                  setBulkFromDate('');
                  setBulkToDate('');
                  setBulkSelectedPo('');
                  setBulkSelectedSupplier('');
                  setBulkSelectedRR('');
                  setBulkSelectedMaterial('');
                  setBulkSelectedStatus('');
                }}
                className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1.5 transition"
                title="Close"
              >
                <IoCloseSharp size={22} />
              </button>
            </div>

            {/* Body */}
            <div className="px-7 py-5 space-y-5 overflow-y-auto flex-1">

              {/* Quick Preset & Clear */}
              <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                <div>
                  <span className="text-xs font-semibold text-orange-900 uppercase tracking-wider block">Quick Presets</span>
                  <span className="text-xs text-orange-700/70">Use presets or set custom filters below</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={applyLastOneMonth}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition shadow-sm"
                  >
                    <BsCalendarDateFill size={12} />
                    Last 1 Month
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkFromDate('');
                      setBulkToDate('');
                      setBulkSelectedPo('');
                      setBulkSelectedSupplier('');
                      setBulkSelectedRR('');
                      setBulkSelectedMaterial('');
                      setBulkSelectedStatus('');
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-gray-300 text-gray-600 hover:text-red-600 hover:border-red-300 hover:bg-red-50 text-xs font-semibold rounded-lg transition shadow-sm"
                  >
                    <RiRefreshLine size={13} />
                    Clear All
                  </button>
                </div>
              </div>

              {/* Divider label */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Filter by</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Filter Dropdowns Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {/* PO Number */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">PO Number</label>
                  <SearchableSelect
                    options={poFilterOptions}
                    value={bulkSelectedPo}
                    onChange={setBulkSelectedPo}
                    placeholder="Select PO..."
                    searchPlaceholder="Search PO..."
                  />
                </div>

                {/* Supplier */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Supplier / Vendor</label>
                  <SearchableSelect
                    options={supplierFilterOptions}
                    value={bulkSelectedSupplier}
                    onChange={setBulkSelectedSupplier}
                    placeholder="Select Supplier..."
                    searchPlaceholder="Search supplier..."
                  />
                </div>

                {/* RR No */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">RR Number</label>
                  <SearchableSelect
                    options={rrFilterOptions}
                    value={bulkSelectedRR}
                    onChange={setBulkSelectedRR}
                    placeholder="Select RR No..."
                    searchPlaceholder="Search RR..."
                  />
                </div>

                {/* Material */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Material</label>
                  <SearchableSelect
                    options={materialFilterOptions}
                    value={bulkSelectedMaterial}
                    onChange={setBulkSelectedMaterial}
                    placeholder="Select Material..."
                    searchPlaceholder="Search material..."
                  />
                </div>

                {/* Status */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">PO Status</label>
                  <SearchableSelect
                    options={poStatusFilterOptions}
                    value={bulkSelectedStatus}
                    onChange={setBulkSelectedStatus}
                    placeholder="Select Status..."
                    searchPlaceholder="Search status..."
                  />
                </div>
              </div>

              {/* Dedicated Date Range Section */}
              <div className="bg-gradient-to-r from-orange-50/70 via-amber-50/40 to-orange-50/70 border border-orange-200/80 rounded-xl p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-md bg-orange-500 text-white flex items-center justify-center shadow-sm">
                      <BsCalendarDateFill size={11} />
                    </div>
                    <span className="text-xs font-bold text-orange-950 uppercase tracking-wider">Date Range Filter</span>
                    <span className="text-[11px] text-orange-700/80 font-medium">(Optional)</span>
                  </div>
                  {(bulkFromDate || bulkToDate) && (
                    <button
                      type="button"
                      onClick={() => { setBulkFromDate(''); setBulkToDate(''); }}
                      className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700 font-semibold hover:underline"
                    >
                      <RiRefreshLine size={12} />
                      Clear Dates
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      From Date
                    </label>
                    <input
                      type="date"
                      value={bulkFromDate}
                      onChange={(e) => setBulkFromDate(e.target.value)}
                      className="w-full h-10 px-3.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm transition"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wide">
                      To Date
                    </label>
                    <input
                      type="date"
                      value={bulkToDate}
                      onChange={(e) => setBulkToDate(e.target.value)}
                      className="w-full h-10 px-3.5 border border-gray-300 rounded-lg text-sm bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 shadow-sm transition"
                    />
                  </div>
                </div>
              </div>

              {/* Live Preview Count Card */}
              {(() => {
                const hasAnyFilter = Boolean(bulkSelectedPo || bulkSelectedSupplier || bulkSelectedRR || bulkSelectedMaterial || bulkSelectedStatus || bulkFromDate || bulkToDate);
                const matchingCount = filterPOForBulk(
                  data,
                  bulkFromDate,
                  bulkToDate,
                  bulkSelectedPo,
                  bulkSelectedSupplier,
                  bulkSelectedRR,
                  bulkSelectedMaterial,
                  bulkSelectedStatus
                ).length;

                return (
                  <div className={`rounded-xl p-4 flex items-center gap-4 border transition-all duration-200 ${hasAnyFilter && matchingCount > 0 ? 'bg-gradient-to-r from-orange-50 to-amber-50 border-orange-200' : 'bg-gray-50 border-gray-200'}`}>
                    <div className={`w-14 h-14 rounded-2xl font-bold text-xl flex items-center justify-center shadow shrink-0 ${hasAnyFilter && matchingCount > 0 ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-500'}`}>
                      {matchingCount}
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm font-bold block ${hasAnyFilter && matchingCount > 0 ? 'text-orange-900' : 'text-gray-600'}`}>
                        {hasAnyFilter
                          ? `${matchingCount} ${matchingCount === 1 ? 'Purchase Order' : 'Purchase Orders'} matched`
                          : 'No filter selected'}
                      </span>
                      <span className="text-xs text-gray-500 mt-0.5 block">
                        {hasAnyFilter
                          ? (matchingCount > 0 ? 'All matched records will be compiled into a single PDF download' : 'No records match this filter combination — try adjusting your selection')
                          : 'Choose at least one filter above to preview matching records'}
                      </span>
                    </div>
                    {hasAnyFilter && matchingCount > 0 && (
                      <div className="shrink-0 text-orange-500">
                        <MdFileDownload size={28} />
                      </div>
                    )}
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 px-7 py-4 bg-gray-50 border-t border-gray-100 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setIsBulkDownloadOpen(false);
                  setBulkFromDate('');
                  setBulkToDate('');
                  setBulkSelectedPo('');
                  setBulkSelectedSupplier('');
                  setBulkSelectedRR('');
                  setBulkSelectedMaterial('');
                  setBulkSelectedStatus('');
                }}
                disabled={isBulkDownloading}
                className="h-11 px-6 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 active:bg-gray-200 transition text-sm font-semibold shadow-sm"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkDownloadPO}
                disabled={isBulkDownloading || !(bulkSelectedPo || bulkSelectedSupplier || bulkSelectedRR || bulkSelectedMaterial || bulkSelectedStatus || bulkFromDate || bulkToDate)}
                className="flex-1 h-11 px-6 bg-orange-500 hover:bg-orange-600 active:bg-orange-700 text-white rounded-xl transition text-sm font-semibold flex items-center justify-center gap-2 shadow-md shadow-orange-500/30 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-orange-500"
              >
                {isBulkDownloading ? (
                  <>
                    <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span>Generating PDF...</span>
                  </>
                ) : (
                  <>
                    <MdFileDownload size={20} />
                    <span>Download Selected (PDF)</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {modalIsOpen ? (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <form
            className="px-6 py-4 font-poppins rounded-lg bg-white w-[60em] shadow-lg"
            onSubmit={handleSubmit}
          >
            <div className="flex justify-between border-b py-1">
              <h1 className="header text-lg font-semibold">Edit PO</h1>
              <button
                className=" text-white flex justify-center bg-primary rounded-full w-7 h-7 items-center"
                onClick={closeModal}
              >
                <IoCloseSharp />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-x-5 mt-2 gap-y-2">

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Purchase Order No</label>
                <input
                  type="text"
                  name="po_no"
                  value={formData.po_no}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <CustomDropdown
                  label="Supplier Name"
                  options={suppliers}
                  value={formData.supplier_id}
                  onChange={(val) => setFormData(prev => ({ ...prev, supplier_id: val }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bill No</label>
                <input
                  type="text"
                  name="bill_no"
                  value={formData.bill_no}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>


              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RR NO</label>
                <input
                  type="text"
                  name="rr_no"
                  value={formData.rr_no}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  onChange={(e) => setFormData(prev => ({ ...prev, rr_no: e.target.value }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Supplier Inv Date</label>
                <input
                  type="date"
                  name="supplier_invoice_date"
                  value={formData.supplier_invoice_date || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier_invoice_date: e.target.value }))}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">PO Date</label>
                <input
                  type="date"
                  name="po_date"
                  value={formData.po_date || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, po_date: e.target.value }))}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">RR Date</label>
                <input
                  type="date"
                  name="rr_date"
                  value={formData.rr_date || ""}
                  onChange={(e) => setFormData(prev => ({ ...prev, rr_date: e.target.value }))}
                  className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              <div>
                <CustomDropdown
                  label="Status"
                  options={statusOption}
                  value={formData.status}
                  onChange={(val) => setFormData(prev => ({ ...prev, status: val }))}
                />
              </div>

            </div>

            <div className="border border-dashed my-5"></div>

            <div className="w-full">
              <h1 className="header text-lg font-semibold">Material</h1>

              <div className="flex gap-4">

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4 items-center">
                  <div>
                    <CustomDropdown
                      label="Select Material"
                      options={materialOption}
                      value={selectedMaterial}
                      onChange={(val) => setSelectedMaterial(val)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity</label>
                    <input
                      type="number"
                      name="quantity"
                      placeholder="Quantity"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <CustomDropdown
                      label="Select Unit"
                      options={unitList}
                      value={selectedUnit}
                      onChange={(val) => setSelectedUnit(val)}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
                    <input
                      type="number"
                      name="price"
                      placeholder="Price"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">No of Bags</label>
                    <input
                      type="number"
                      name="noOfBags"
                      placeholder="No of bags"
                      value={noOfBags}
                      onChange={(e) => setNoOfBags(e.target.value)}
                      className="w-full p-3 bg-gray-100 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>

                  <button
                    className="px-3 self-end w-1/2 py-3 text-sm bg-primary text-white rounded hover:bg-orange-600 transition"
                    onClick={handleAddMaterial}
                    type="button"
                  >
                    Add Item
                  </button>
                </div>

                <div className="w-full mt-4 text-sm border">
                  <table className="w-full table-fixed">
                    <thead className="bg-gray-100 sticky top-0 z-10">
                      <tr>
                        <th className="p-2">S.No</th>
                        <th className="p-2">Material</th>
                        <th className="p-2">Price</th>
                        <th className="p-2">Quantity</th>
                        <th className="p-2">Bags</th>
                        <th className="p-2">Action</th>
                      </tr>
                    </thead>
                  </table>

                  <div className="h-16 overflow-y-auto">
                    <table className="w-full table-fixed">
                      <tbody>
                        {materialList.map((mat, idx) => (
                          <tr key={mat.id}>
                            <td className="p-2 text-center">{idx + 1}</td>
                            <td className="p-2 text-center">{mat.name}</td>
                            <td className="p-2 text-center">₹{Number(mat.price || 0).toLocaleString('en-IN')}</td>
                            <td className="p-2 text-center">{Number(mat.quantity || 0).toLocaleString('en-IN')} {mat.unit_name}</td>
                            <td className="p-2 text-center">{Number(mat.noOfBags || 0).toLocaleString('en-IN')}</td>
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleDeleteMaterial(mat.id)}
                                className="text-red-500 hover:text-red-700"
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>



              </div>


            </div>

            <div className="flex justify-between gap-24 mt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-6 py-2.5 w-full bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 w-full bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 flex items-center justify-center gap-2"
                disabled={isSubmitLoading}
              >
                {isSubmitLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit'
                )}
              </button>
            </div>
          </form>
        </div>
      ) : null}


      <div className={` bg-[#F9F9FC] h-screen relative`}>
        <div className=" space-y-4 pt-3 px-6 font-poppins">
          <h1 className="text-xl font-bold text-gray-900">Purchase Order</h1>
          <div className="flex items-center gap-x-2 text-sm text-gray-500 ">
            <Link to="/" className='text-orange-500'>Dashboard</Link>
            <span>
              <RiArrowUpSFill className='rotate-90 ' size={20} />
            </span>
            <span>Puchase Order</span>
          </div>
          <div className="flex items-center justify-between">
            <div className=" space-x-4  flex">
              <div>
                <span className='absolute'>
                  <RiSearchLine className='ms-2 mt-2 opacity-45' />
                </span>
                <input
                  type="search"
                  placeholder="Search PO..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className=" py-2 px-2 ps-10 border rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div className='space-x-3 flex items-center'>

              <button
                onClick={() => {
                  setBulkFromDate('');
                  setBulkToDate('');
                  setBulkSelectedPo('');
                  setBulkSelectedSupplier('');
                  setBulkSelectedRR('');
                  setBulkSelectedMaterial('');
                  setBulkSelectedStatus('');
                  setIsBulkDownloadOpen(true);
                }}
                className="px-4 py-2 bg-[#E8F0FE] text-[#1a73e8] border border-blue-200 rounded-lg hover:bg-blue-500 hover:text-white transition"
              >
                <div className="flex gap-2 items-center text-xs">
                  <MdDownloadForOffline size={16} />
                  <span>Bulk Download</span>
                </div>
              </button>

              <button onClick={handleExport} className="px-4 py-2 bg-[#EFE8E0] text-[#F3890A] border rounded-lg hover:bg-orange-500 hover:text-white">
                <div className="flex gap-2 items-center text-xs ">
                  <LuImport size={16} className='opacity-50' />
                  <span>Export</span>
                </div>
              </button>

            </div>
          </div>

        </div>

        <div className={`overflow px-6 mx-4 mt-5 bg-white`}>

          <table className={`w-full`}>
            <thead className='font-poppins font-semibold'>
              <tr className="border-b">
                <th className="p-4 text-center text-sm text-black">S.No</th>
                <th className="p-4 text-center text-sm text-black">PO No</th>
                <th className="p-4 text-center text-sm text-black">Supplier Name</th>
                <th className="p-4 text-center text-sm text-black">Bill No</th>
                <th className="p-4 text-center text-sm text-black">Supplier Inv Date</th>
                <th className="p-4 text-center text-sm text-black">RR No</th>
                <th className="p-4 text-center text-sm text-black">Status</th>
                <th className="p-4 text-center text-sm text-black">Materials</th>
                <th className="p-4 text-center text-sm text-black">Actions</th>

              </tr>
            </thead>
            <tbody className="divide-y font-poppins">
              {paginatedData.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50 text-center">
                  <td className="p-4 text-sm opacity-65">{startIndex + index + 1}</td>
                  <td className="p-4 text-sm opacity-65">{item.po_no}</td>
                  <td className="p-4 text-sm w-[20%] opacity-65">{item.supplier_name}</td>
                  <td className="p-4 text-sm opacity-65">{item.bill_no}</td>
                  <td className="p-4 text-sm opacity-65">{formatDate(item.supplier_invoice_date)}</td>
                  <td className="p-4 text-sm opacity-65">{item.rr_no}</td>

                  <td className="p-4 text-sm opacity-65">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold capitalize rounded-full
      ${item.status === 1
                          ? 'bg-yellow-100 text-yellow-800'
                          : item.status === 2
                            ? 'bg-blue-100 text-blue-800'
                            : item.status === 3
                              ? 'bg-green-100 text-green-700'
                              : item.status === 4
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                        }`}
                    >
                      {item.status === 1
                        ? 'Pending'
                        : item.status === 2
                          ? 'In-Transit'
                          : item.status === 3
                            ? 'Active'
                            : item.status === 4
                              ? 'Closed'
                              : 'Unknown'}
                    </span>
                  </td>

                  <td className="p-4 opacity-65 w-[20%] text-sm">{item.material_view}</td>
                  <td className="p-4 text-center space-x-4 flex justify-center items-center opacity-65">
                    <button
                      onClick={() => downloadSinglePoPdf(item)}
                      title="Download PO PDF"
                      className="hover:text-orange-500 text-gray-600 transition"
                    >
                      <MdFileDownload size={20} />
                    </button>

                    {
                      purchaseOrder?.edit && <button onClick={() => handleEdit(item)} title="Edit PO" className=" hover:text-gray-700">
                        <FiEdit2 size={18} />
                      </button>
                    }

                    {
                      purchaseOrder?.delete && <button onClick={() => handleDelete(item.id)} title="Delete PO" className=" hover:text-gray-700">
                        <RiDeleteBin6Line size={18} />
                      </button>
                    }

                  </td>

                </tr>
              ))}

              {
                (paginatedData?.length <= 0 && !isLoading) &&
                <tr>
                  <td colSpan="8" className="py-10 text-center text-gray-500 text-sm">
                    No Data Available
                  </td>
                </tr>
              }

              {isLoading && (
                <tr>
                  <td colSpan="8" className="py-10 text-center">
                    <div className="flex justify-center items-center">
                      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Pagination Controls */}
          <div className="flex justify-end font-dm items-center gap-2 mt-4">
            <button
              onClick={goToPreviousPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 border  rounded ${currentPage === 1 ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}
            >
              &lt;
            </button>
            <button
              onClick={goToFirstPage}
              disabled={currentPage === 1}
              className={`px-3 py-1 text-sm border rounded ${currentPage === 1 ? 'text-gray-400' : 'text-black'}`}
            >
              {currentPage === 1 ? "0" : "1"}
            </button>
            <span className="px-3 py-1 border font-medium rounded bg-gray-200">{currentPage}</span>
            <button
              onClick={goToLastPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border text-sm rounded ${currentPage === totalPages ? 'text-gray-400' : 'text-black'}`}
            >
              {totalPages}
            </button>
            <button
              onClick={goToNextPage}
              disabled={currentPage === totalPages}
              className={`px-3 py-1 border rounded ${currentPage === totalPages ? 'text-gray-400 bg-gray-200' : 'text-white bg-[#F3890A]'}`}
            >
              &gt;
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default POMaster