import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend
} from 'recharts';
import ExcelExport from '../../utils/ExcelExport';
import { RiSearchLine } from 'react-icons/ri';
import { LuImport, LuRefreshCw } from 'react-icons/lu';
import { FiUsers, FiFileText, FiLogIn, FiActivity, FiChevronDown, FiChevronUp, FiImage, FiExternalLink, FiDownload, FiX, FiAlertCircle } from 'react-icons/fi';

const BroilerDashBoard = () => {
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState({
    active_users: 0,
    total_entries: 0,
    total_logins: 0,
    unique_login_users: 0
  });
  const [reportDetails, setReportDetails] = useState([]);
  const [loginDetails, setLoginDetails] = useState([]);
  const [expandedRow, setExpandedRow] = useState(null);
  const [farmActivityDetails, setFarmActivityDetails] = useState(null);
  const [farmActivityLoading, setFarmActivityLoading] = useState(false);
  const [farmActivityError, setFarmActivityError] = useState(null);

  // Login History expanded states
  const [expandedLoginRow, setExpandedLoginRow] = useState(null);
  const [loginDetailsData, setLoginDetailsData] = useState(null);
  const [loginDetailsLoading, setLoginDetailsLoading] = useState(false);
  const [loginDetailsError, setLoginDetailsError] = useState(null);

  // Filter states
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [period, setPeriod] = useState('daily');
  const [searchText, setSearchText] = useState('');
  const [selectedReason, setSelectedReason] = useState('');
  const [availableReasonsList, setAvailableReasonsList] = useState([]);
  const [entrySearchText, setEntrySearchText] = useState('');

  // Photo modal state supporting Mortality, Start KM, and End KM tabs
  const [photoModal, setPhotoModal] = useState(null);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);
  const [imageError, setImageError] = useState(false);

  const backendBaseUrl = (import.meta.env.VITE_SERVER_URL || 'http://localhost:4010/api').replace(/\/api\/?$/, '');

  const normalizePhotosList = (raw, defaultName = 'photo.jpg') => {
    if (typeof raw === 'string') {
      try { raw = JSON.parse(raw); } catch (_) { raw = raw ? [raw] : []; }
    }
    if (raw && !Array.isArray(raw) && typeof raw === 'object') raw = [raw];
    else if (!Array.isArray(raw)) raw = raw ? [raw] : [];

    return (raw || []).map(p => {
      if (!p) return null;
      if (typeof p === 'string') {
        let url = p;
        if (!url.startsWith('http://') && !url.startsWith('https://') && !url.startsWith('data:')) {
          url = `${backendBaseUrl}/${url.replace(/^\/+/, '')}`;
        }
        return { url, name: p.split('/').pop() || defaultName };
      }
      if (typeof p === 'object') {
        let photoUrl = '';
        if (p.base64) {
          photoUrl = p.base64.startsWith('data:') ? p.base64 : `data:image/jpeg;base64,${p.base64}`;
        } else if (p.url && (p.url.startsWith('http://') || p.url.startsWith('https://') || p.url.startsWith('data:'))) {
          // If URL has an unreachable IP like 192.168.5.224, rewrite it with active backendBaseUrl
          if (p.url.includes('/uploads/broiler/')) {
            const fname = p.url.split('/uploads/broiler/').pop();
            photoUrl = `${backendBaseUrl}/uploads/broiler/${fname}`;
          } else {
            photoUrl = p.url;
          }
        } else if (p.fileName) {
          photoUrl = `${backendBaseUrl}/uploads/broiler/${p.fileName}`;
        } else if (p.url) {
          photoUrl = `${backendBaseUrl}/${p.url.replace(/^\/+/, '')}`;
        } else if (p.uri && (p.uri.startsWith('http://') || p.uri.startsWith('https://') || p.uri.startsWith('data:'))) {
          photoUrl = p.uri;
        }

        return {
          ...p,
          url: photoUrl,
          name: p.fileName || p.name || (photoUrl ? photoUrl.split('/').pop() : defaultName),
          fileSize: p.fileSize || p.size,
          width: p.width,
          height: p.height,
          type: p.type || 'image/jpeg',
          uri: p.uri || null,
        };
      }
      return null;
    }).filter(Boolean);
  };

  const openPhotoModal = (entry, initialTab = null) => {
    // 1. Mortality photos
    let mortalityPhotos = entry.photos && Array.isArray(entry.photos) && entry.photos.length > 0
      ? normalizePhotosList(entry.photos, 'mortality_photo.jpg')
      : normalizePhotosList(entry.upload_mortality, 'mortality_photo.jpg');
    if (!mortalityPhotos.length && entry.photo_url) {
      mortalityPhotos = normalizePhotosList([entry.photo_url], 'mortality_photo.jpg');
    }

    // 2. Start KM photos
    let startKmPhotos = entry.start_km_photos && Array.isArray(entry.start_km_photos) && entry.start_km_photos.length > 0
      ? normalizePhotosList(entry.start_km_photos, 'start_km_photo.jpg')
      : normalizePhotosList(entry.upload_start_km, 'start_km_photo.jpg');
    if (!startKmPhotos.length && (entry.start_km_photo_url || farmActivityDetails?.trip?.start_km_photos)) {
      startKmPhotos = normalizePhotosList(entry.start_km_photo_url || farmActivityDetails?.trip?.start_km_photos, 'start_km_photo.jpg');
    }

    // 3. End KM photos
    let endKmPhotos = entry.end_km_photos && Array.isArray(entry.end_km_photos) && entry.end_km_photos.length > 0
      ? normalizePhotosList(entry.end_km_photos, 'end_km_photo.jpg')
      : normalizePhotosList(entry.upload_end_km, 'end_km_photo.jpg');
    if (!endKmPhotos.length && (entry.end_km_photo_url || farmActivityDetails?.trip?.end_km_photos)) {
      endKmPhotos = normalizePhotosList(entry.end_km_photo_url || farmActivityDetails?.trip?.end_km_photos, 'end_km_photo.jpg');
    }

    const startKmVal = entry.start_km || farmActivityDetails?.trip?.start_km || null;
    const endKmVal = entry.end_km || farmActivityDetails?.trip?.end_km || null;
    const vehicleVal = entry.vehicle_no || farmActivityDetails?.trip?.vehicle_no || null;

    let chosenTab = initialTab;
    if (!chosenTab) {
      if (mortalityPhotos.length > 0) chosenTab = 'mortality';
      else if (startKmPhotos.length > 0) chosenTab = 'start_km';
      else if (endKmPhotos.length > 0) chosenTab = 'end_km';
      else chosenTab = 'mortality';
    }

    setPhotoModal({
      entry,
      activeTab: chosenTab,
      mortalityPhotos,
      startKmPhotos,
      endKmPhotos,
      startKm: startKmVal,
      endKm: endKmVal,
      vehicleNo: vehicleVal
    });
    setActivePhotoIdx(0);
    setImageError(false);
  };

  const handleSwitchPhotoTab = (tabKey) => {
    if (photoModal) {
      setPhotoModal(prev => ({ ...prev, activeTab: tabKey }));
      setActivePhotoIdx(0);
      setImageError(false);
    }
  };

  const closePhotoModal = () => {
    setPhotoModal(null);
    setActivePhotoIdx(0);
    setImageError(false);
  };

  // Pagination states for main report
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Pagination states for login report
  const [loginCurrentPage, setLoginCurrentPage] = useState(1);
  const loginItemsPerPage = 5;

  const fetchReportData = async (fromVal, toVal, periodVal, reasonVal) => {
    setLoading(true);
    try {
      const activeReason = reasonVal !== undefined ? reasonVal : selectedReason;
      const { data } = await axios.get('/admin/broiler-dashboard-report', {
        params: {
          from: fromVal || '',
          to: toVal || '',
          period: periodVal || 'daily',
          reason: activeReason || ''
        }
      });
      if (data.status && data.data) {
        setSummary(data.data.summary || {
          active_users: 0,
          total_entries: 0,
          total_logins: 0,
          unique_login_users: 0
        });
        setReportDetails(data.data.reportDetails || []);
        setLoginDetails(data.data.loginDetails || []);
        if (data.data.available_mortality_reasons) {
          setAvailableReasonsList(data.data.available_mortality_reasons);
        }
        if (data.data.fromDate) setFromDate(data.data.fromDate);
        if (data.data.toDate) setToDate(data.data.toDate);
      }
    } catch (err) {
      console.error("Error fetching broiler dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportData(fromDate, toDate, period, selectedReason);
  }, []);

  const handleRefresh = () => {
    fetchReportData(fromDate, toDate, period, selectedReason);
  };

  const handleFilterChange = (type, value) => {
    let nextFrom = fromDate;
    let nextTo = toDate;
    let nextPeriod = period;
    let nextReason = selectedReason;

    if (type === 'from') {
      setFromDate(value);
      nextFrom = value;
    } else if (type === 'to') {
      setToDate(value);
      nextTo = value;
    } else if (type === 'period') {
      setPeriod(value);
      nextPeriod = value;
    } else if (type === 'reason') {
      setSelectedReason(value);
      nextReason = value;
    }

    fetchReportData(nextFrom, nextTo, nextPeriod, nextReason);
    setCurrentPage(1);
    setLoginCurrentPage(1);
  };

  const fetchFarmActivityDetails = async (date, plant, reasonVal) => {
    setFarmActivityLoading(true);
    setFarmActivityDetails(null);
    setFarmActivityError(null);
    try {
      const activeReason = reasonVal !== undefined ? reasonVal : selectedReason;
      const { data } = await axios.get('/admin/broiler-farm-activity-details', {
        params: { 
          date, 
          plant: String(plant), 
          period, 
          reason: activeReason || '' 
        }
      });
      if (data.status && data.data) {
        setFarmActivityDetails(data.data);
      } else {
        setFarmActivityError(data.message || 'No data returned from server.');
      }
    } catch (err) {
      console.error("Error fetching farm activity details:", err);
      setFarmActivityError(err?.response?.data?.message || err.message || 'Failed to load farm activity details.');
    } finally {
      setFarmActivityLoading(false);
    }
  };

  const handleRowExpand = (rowKey, row) => {
    if (expandedRow === rowKey) {
      setExpandedRow(null);
      setFarmActivityDetails(null);
      setFarmActivityError(null);
      setEntrySearchText('');
    } else {
      setExpandedRow(rowKey);
      setEntrySearchText('');
      fetchFarmActivityDetails(row.period_date, row.plant, selectedReason);
    }
  };

  const fetchLoginDetails = async (date) => {
    setLoginDetailsLoading(true);
    setLoginDetailsData(null);
    setLoginDetailsError(null);
    try {
      const { data } = await axios.get('/admin/broiler-login-details', {
        params: { date, period }
      });
      if (data.status && data.data) {
        setLoginDetailsData(data.data);
      } else {
        setLoginDetailsError(data.message || 'No login details returned from server.');
      }
    } catch (err) {
      console.error("Error fetching login details:", err);
      setLoginDetailsError(err?.response?.data?.message || err.message || 'Failed to load login details.');
    } finally {
      setLoginDetailsLoading(false);
    }
  };

  const handleLoginRowExpand = (rowKey, row) => {
    if (expandedLoginRow === rowKey) {
      setExpandedLoginRow(null);
      setLoginDetailsData(null);
      setLoginDetailsError(null);
    } else {
      setExpandedLoginRow(rowKey);
      fetchLoginDetails(row.period_date);
    }
  };

  // Known standard reasons combined with any reasons present in the backend database
  const standardReasons = ['Sudden Death', 'Weakness', 'Disease', 'Heat Stress', 'Ascites', 'Cannibalism', 'Culling', 'Toxic / Poisoning', 'Other'];
  const extractedFromReport = reportDetails
    .flatMap(r => (r.mortality_reasons ? r.mortality_reasons.split(', ') : []))
    .map(s => s.trim())
    .filter(Boolean);
  const allKnownReasons = [...new Set([...availableReasonsList, ...extractedFromReport, ...standardReasons])].filter(Boolean);

  // Search filtering on main report
  const filteredReportData = reportDetails.filter((item) => {
    const matchesSearch =
      String(item.plant_name || '').toLowerCase().includes(searchText.toLowerCase()) ||
      String(item.plant || '').toLowerCase().includes(searchText.toLowerCase()) ||
      String(item.mortality_reasons || '').toLowerCase().includes(searchText.toLowerCase());

    const matchesReason = !selectedReason || (
      item.mortality_reasons &&
      item.mortality_reasons.toLowerCase().includes(selectedReason.toLowerCase())
    );

    return matchesSearch && matchesReason;
  });

  // Pagination for main report table
  const totalPages = Math.ceil(filteredReportData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredReportData.slice(startIndex, startIndex + itemsPerPage);

  // Pagination for login report table
  const totalLoginPages = Math.ceil(loginDetails.length / loginItemsPerPage);
  const startLoginIndex = (loginCurrentPage - 1) * loginItemsPerPage;
  const paginatedLoginData = loginDetails.slice(startLoginIndex, startLoginIndex + loginItemsPerPage);

  const [exportingDetails, setExportingDetails] = useState(false);

  // Export handlers
  const handleExportDetailedReport = async () => {
    if (!filteredReportData || filteredReportData.length === 0) {
      alert("No report entries available to export.");
      return;
    }

    setExportingDetails(true);
    try {
      // Fetch detailed farm activities for all matching plant and date combinations
      const fetchPromises = filteredReportData.map(async (row) => {
        try {
          const { data } = await axios.get('/admin/broiler-farm-activity-details', {
            params: {
              date: row.period_date,
              plant: String(row.plant),
              period,
              reason: selectedReason || ''
            }
          });

          if (data?.status && data?.data?.entries && Array.isArray(data.data.entries)) {
            const pName = data.data.plant_name || row.plant_name;
            const pCode = data.data.plant || row.plant;
            const pDate = data.data.date || row.period_date;

            return data.data.entries.map((entry) => ({
              ...entry,
              plant_name: pName,
              plant_code: pCode,
              period_date: pDate
            }));
          }
          return [];
        } catch (err) {
          console.error(`Error fetching detail entries for plant ${row.plant}:`, err);
          return [];
        }
      });

      const results = await Promise.all(fetchPromises);
      let allEntries = results.flat();

      // Additional client-side filter by reason if selectedReason is active
      if (selectedReason) {
        allEntries = allEntries.filter(entry => {
          const r = String(entry.mortality_reason || entry.reason || '').toLowerCase();
          return r.includes(selectedReason.toLowerCase());
        });
      }

      if (allEntries.length > 0) {
        let sNo = 1;
        const exportData = allEntries.map((entry) => {
          // Format multiple feed materials and quantities if present
          let feedMaterialStr = entry.material || '-';
          let feedQtyStr = entry.quantity_bags || '-';
          let feedStockStr = entry.stock_bags || '-';
          let cumFeedStr = entry.cum_feed || '-';

          if (entry.materials && Array.isArray(entry.materials) && entry.materials.length > 0) {
            feedMaterialStr = entry.materials.map(m => m.material_label || m.material || '-').join(', ');
            feedQtyStr = entry.materials.map(m => m.qty || '0').join(', ');
            feedStockStr = entry.materials.map(m => m.stock || '0').join(', ');
            cumFeedStr = entry.materials.map(m => m.cum_feed || '-').join(', ');
          }

          return {
            "S.No": sNo++,
            "Entry Date": entry.date || entry.period_date || '-',
            "Plant Code": entry.plant_code || entry.plant || '-',
            "Plant Name": entry.plant_name || '-',
            "Farmer / Farm Code": entry.farmer || '-',
            "Farmer Name": entry.farmer_name || '-',
            "Batch No": entry.batch || '-',
            "Age (Days)": entry.age || '-',
            "Housed Chicks": entry.housed || '-',
            "Current Stock": entry.stock || '-',
            "Mortality Count": Number(entry.mortality) || 0,
            "Mortality Reason": entry.mortality_reason || entry.reason || 'Not Specified',
            "Cum Mortality %": entry.cum_mortality_percentage ? `${entry.cum_mortality_percentage}%` : '-',
            "Body Weight (g)": entry.body_weight || '-',
            "Farm Maintenance": entry.farms_maintenance || '-',
            "Litter Quality": entry.litter_quality || '-',
            "Drinker Cleaning": entry.drinker_cleaning || '-',
            "Feed Material": feedMaterialStr,
            "Feed Bags (Qty)": feedQtyStr,
            "Feed Stock Bags": feedStockStr,
            "Cum Feed": cumFeedStr,
            "Treatment": entry.treatment || '-',
            "Posted By": entry.user_display_name || entry.user_id || '-'
          };
        });

        const reasonSuffix = selectedReason ? `_${selectedReason.replace(/\s+/g, '_')}` : '';
        const fileName = `Broiler_Farm_Activity_Details${reasonSuffix}_${period}_${fromDate}_to_${toDate}.xlsx`;
        ExcelExport(exportData, fileName);
      } else {
        // If no detailed entries found, export plant summary
        const summaryExportData = filteredReportData.map(item => ({
          "Period Date": item.period_date,
          "Plant Code": item.plant,
          "Plant Name": item.plant_name,
          "Entries Posted": item.posted,
          "Total Mortality": item.total_mortality || 0,
          "Mortality Reasons": item.mortality_reasons || 'None',
          "Active User Count": item.user_count,
          "User List": item.usernames || '-'
        }));
        const reasonSuffix = selectedReason ? `_${selectedReason.replace(/\s+/g, '_')}` : '';
        ExcelExport(summaryExportData, `Broiler_Plant_Summary${reasonSuffix}_${period}_${fromDate}_to_${toDate}.xlsx`);
      }
    } catch (err) {
      console.error("Export process encountered an error:", err);
      alert("Failed to export detailed data. Please try again.");
    } finally {
      setExportingDetails(false);
    }
  };

  const handleExportDetailedFarmActivities = () => {
    if (!farmActivityDetails || !farmActivityDetails.entries || farmActivityDetails.entries.length === 0) {
      return;
    }
    const exportData = farmActivityDetails.entries.map((entry, idx) => ({
      "S.No": idx + 1,
      "Entry Date": entry.date || farmActivityDetails.date,
      "Plant Code": entry.plant || farmActivityDetails.plant,
      "Plant Name": farmActivityDetails.plant_name,
      "Farmer / Farm Code": entry.farmer || '-',
      "Farmer Name": entry.farmer_name || '-',
      "Batch No": entry.batch || '-',
      "Age (Days)": entry.age || '-',
      "Housed Chicks": entry.housed || '-',
      "Current Stock": entry.stock || '-',
      "Mortality Count": Number(entry.mortality) || 0,
      "Mortality Reason": entry.mortality_reason || entry.reason || 'Not Specified',
      "Cum Mortality %": entry.cum_mortality_percentage ? `${entry.cum_mortality_percentage}%` : '-',
      "Body Weight (g)": entry.body_weight || '-',
      "Treatment": entry.treatment || '-',
      "Feed Material": Array.isArray(entry.materials) && entry.materials.length > 0
        ? entry.materials.map(m => m.material_label || m.material).join(', ')
        : (entry.material || '-'),
      "Feed Quantity": Array.isArray(entry.materials) && entry.materials.length > 0
        ? entry.materials.map(m => m.qty || 0).join(', ')
        : (entry.quantity_bags || '-'),
      "Posted By": entry.user_display_name || entry.user_id || '-'
    }));

    const plantLabel = (farmActivityDetails.plant_name || 'Plant').replace(/\s+/g, '_');
    const reasonSuffix = selectedReason ? `_${selectedReason.replace(/\s+/g, '_')}` : '';
    ExcelExport(exportData, `Farm_Activities_${plantLabel}${reasonSuffix}_${farmActivityDetails.date}.xlsx`);
  };

  const handleExportLogins = () => {
    const exportData = loginDetails.map(item => ({
      "Period Date": item.period_date,
      "Total Logins": item.login_count
    }));
    ExcelExport(exportData, `Broiler_Logins_Report_${period}_${fromDate}_to_${toDate}.xlsx`);
  };

  // ── Bill of Supply Section ──────────────────────────────────
  const [bosData, setBosData] = useState([]);
  const [bosLoading, setBosLoading] = useState(false);
  const [bosCustomerMap, setBosCustomerMap] = useState({});
  const [bosFarmerMap, setBosFarmerMap] = useState({});
  const [bosPlants, setBosPlants] = useState([]);
  // BOS filter states
  const [bosFromDate, setBosFromDate] = useState('');
  const [bosToDate, setBosToDate] = useState('');
  const [bosSearchText, setBosSearchText] = useState('');
  const [bosSelectedPlant, setBosSelectedPlant] = useState('');
  const [bosSelectedCustomer, setBosSelectedCustomer] = useState('');
  const [bosSelectedFarmer, setBosSelectedFarmer] = useState('');
  const [bosCurrentPage, setBosCurrentPage] = useState(1);
  const bosItemsPerPage = 10;

  const fetchBosData = async () => {
    setBosLoading(true);
    try {
      const [bosRes, custRes, farmRes, plantRes] = await Promise.allSettled([
        axios.get('broiler/bill-of-supply/getAll'),
        axios.get('broiler/farmer/get-customer/all'),
        axios.get('broiler/farmer/get-customer/F'),
        axios.get('broiler/plant/getAll'),
      ]);

      if (bosRes.status === 'fulfilled' && bosRes.value.data?.status) {
        const parsed = (bosRes.value.data.data || []).map(item => {
          let raw = item.raw_data;
          if (typeof raw === 'string') { try { raw = JSON.parse(raw); } catch { raw = {}; } }
          return { ...item, raw_data: raw };
        });
        setBosData(parsed);
      }

      const custMap = {};
      if (custRes.status === 'fulfilled' && custRes.value.data?.success) {
        custRes.value.data.data.forEach(c => { if (c.customer_no) custMap[c.customer_no] = c.customer_name || c.customer_no; });
      }
      setBosCustomerMap(custMap);

      const farmMap = {};
      if (farmRes.status === 'fulfilled' && farmRes.value.data?.success) {
        farmRes.value.data.data.forEach(f => { if (f.customer_no) farmMap[f.customer_no] = f.customer_name || f.customer_no; });
      }
      setBosFarmerMap(farmMap);

      if (plantRes.status === 'fulfilled' && plantRes.value.data?.success) {
        setBosPlants(plantRes.value.data.data || []);
      }
    } catch (err) {
      console.error('Error fetching Bill of Supply data:', err);
    } finally {
      setBosLoading(false);
    }
  };

  useEffect(() => { fetchBosData(); }, []);

  const bosResolveName = (map1, map2, code, nameField, item) => {
    if (!code) return '-';
    const name = nameField || map1[code] || map2[code] || null;
    if (name && name !== code) return `${code} - ${name}`;
    return code;
  };

  const bosResolveCustomer = (item) => {
    const code = item.customer || item.raw_data?.customer || '';
    const custDetails = (() => { const d = item.customer_details || item.raw_data?.customer_details || {}; if (typeof d === 'string') { try { return JSON.parse(d); } catch { return {}; } } return d; })();
    const name = (item.customer_name && item.customer_name !== code ? item.customer_name : null) || custDetails?.customer_name || custDetails?.name1 || (code ? bosCustomerMap[code] : null) || (code ? bosFarmerMap[code] : null) || null;
    if (!code) return '-';
    if (name && name !== code) return `${code} - ${name}`;
    return code;
  };

  const bosResolveFarmer = (item) => {
    const farmDetails = (() => { const d = item.farmer_details || item.raw_data?.farmer_details || {}; if (typeof d === 'string') { try { return JSON.parse(d); } catch { return {}; } } return d; })();
    const code = item.farmer || item.raw_data?.farmer || farmDetails?.farmer_supplier || '';
    const name = (item.farmer_name && item.farmer_name !== code ? item.farmer_name : null) || farmDetails?.farmer_name || farmDetails?.name1 || (code ? bosFarmerMap[code] : null) || (code ? bosCustomerMap[code] : null) || null;
    if (!code) return '-';
    if (name && name !== code) return `${code} - ${name}`;
    return code;
  };

  const bosGetLoadTotals = (item) => {
    let details = item?.load_details;
    if (typeof details === 'string') { try { details = JSON.parse(details); } catch { details = []; } }
    if (!Array.isArray(details)) details = [];
    return details.reduce((acc, row) => {
      acc.birds += Number(row.birdQty) || 0;
      acc.netWeight += Number(row.weight) || 0;
      return acc;
    }, { birds: 0, netWeight: 0 });
  };

  const bosGetAvgWeight = (item) => {
    const { birds, netWeight } = bosGetLoadTotals(item);
    if (birds > 0 && netWeight > 0) return (netWeight / birds * 1000).toFixed(0);
    const aw = item.avg_weight || item.raw_data?.avg_weight;
    return aw ? Number(aw).toFixed(0) : '-';
  };

  // Derive unique customers and farmers for filter dropdowns
  const bosUniqueCustomers = [...new Map(bosData.map(d => {
    const code = d.customer || d.raw_data?.customer || '';
    return [code, code];
  }).filter(([k]) => k)).values()];

  const bosUniqueFarmers = [...new Map(bosData.map(d => {
    const code = d.farmer || d.raw_data?.farmer || '';
    return [code, code];
  }).filter(([k]) => k)).values()];

  const bosParseDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const bosFilteredData = bosData.filter(item => {
    const itemDate = bosParseDate(item.date);
    if (bosFromDate && itemDate < bosFromDate) return false;
    if (bosToDate && itemDate > bosToDate) return false;
    if (bosSelectedPlant && String(item.plant) !== String(bosSelectedPlant)) return false;
    const custCode = item.customer || item.raw_data?.customer || '';
    if (bosSelectedCustomer && custCode !== bosSelectedCustomer) return false;
    const farmCode = item.farmer || item.raw_data?.farmer || '';
    if (bosSelectedFarmer && farmCode !== bosSelectedFarmer) return false;
    if (bosSearchText) {
      const q = bosSearchText.toLowerCase();
      const custLabel = bosResolveCustomer(item).toLowerCase();
      const farmLabel = bosResolveFarmer(item).toLowerCase();
      const plantLabel = (item.plant_name || item.plant || '').toLowerCase();
      const dcLabel = (item.dc_no || '').toLowerCase();
      if (!custLabel.includes(q) && !farmLabel.includes(q) && !plantLabel.includes(q) && !dcLabel.includes(q)) return false;
    }
    return true;
  });

  const bosTotalPages = Math.ceil(bosFilteredData.length / bosItemsPerPage);
  const bosStartIdx = (bosCurrentPage - 1) * bosItemsPerPage;
  const bosPaginatedData = bosFilteredData.slice(bosStartIdx, bosStartIdx + bosItemsPerPage);

  // Aggregated summary for BOS dashboard cards
  const bosSummary = bosFilteredData.reduce((acc, item) => {
    const { birds, netWeight } = bosGetLoadTotals(item);
    acc.totalBills += 1;
    acc.totalBirds += birds;
    acc.totalWeight += netWeight;
    acc.totalValue += Number(item.bill_value || item.raw_data?.bill_value || 0);
    return acc;
  }, { totalBills: 0, totalBirds: 0, totalWeight: 0, totalValue: 0 });

  const handleBosExport = () => {
    if (!bosFilteredData.length) { alert('No data to export.'); return; }
    const exportRows = bosFilteredData.map((item, idx) => {
      const { birds, netWeight } = bosGetLoadTotals(item);
      const avgWt = bosGetAvgWeight(item);
      return {
        'S.No': idx + 1,
        'Date': bosParseDate(item.date) || '-',
        'DC No': item.dc_no || '-',
        'Plant': item.plant_name || item.plant || '-',
        'Customer': bosResolveCustomer(item),
        'Farmer': bosResolveFarmer(item),
        'Bird Qty': birds || Number(item.bird_qty || item.raw_data?.bird_qty || 0),
        'Net Weight (kg)': netWeight || Number(item.net_weight || item.raw_data?.net_weight || 0),
        'Avg Weight (g)': avgWt,
        'Rate (₹/kg)': Number(item.rate || item.raw_data?.rate || 0),
        'Bill Value (₹)': Number(item.bill_value || item.raw_data?.bill_value || 0),
        'Status': item.sap_status || item.status || 'Pending',
      };
    });
    const suffix = bosFromDate && bosToDate ? `_${bosFromDate}_to_${bosToDate}` : '';
    ExcelExport(exportRows, `BillOfSupply_Report${suffix}.xlsx`);
  };

  // Chart transformations
  // Get top plants by entries posted
  const plantChartData = reportDetails.reduce((acc, current) => {
    const existing = acc.find(item => item.name === current.plant_name);
    if (existing) {
      existing.posted += current.posted;
      existing.users = Math.max(existing.users, current.user_count);
    } else {
      acc.push({
        name: current.plant_name,
        posted: current.posted,
        users: current.user_count
      });
    }
    return acc;
  }, []).sort((a, b) => b.posted - a.posted).slice(0, 8);

  // Get chronological trends
  const trendChartData = [...reportDetails].reduce((acc, current) => {
    const existing = acc.find(item => item.date === current.period_date);
    if (existing) {
      existing.entries += current.posted;
    } else {
      acc.push({
        date: current.period_date,
        entries: current.posted,
        logins: 0
      });
    }
    return acc;
  }, []);

  // Merge logins into trend
  loginDetails.forEach(log => {
    const existing = trendChartData.find(t => t.date === log.period_date);
    if (existing) {
      existing.logins = log.login_count;
    } else {
      trendChartData.push({
        date: log.period_date,
        entries: 0,
        logins: log.login_count
      });
    }
  });

  trendChartData.sort((a, b) => String(a.date || '').localeCompare(String(b.date || '')));

  return (
    <div className="flex-1 bg-[#F9F9FC] p-6 font-poppins min-h-screen">
      {/* Upper Title Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Broiler Dashboard</h1>
          <p className="text-gray-500 mt-1">Real-time mobile entries, logins, and operational insights.</p>
        </div>

        {/* Global Controls */}
        <div className="flex flex-wrap items-center gap-3 bg-white p-2 rounded-xl shadow-sm border border-gray-100">
          {/* Period selector */}
          <select
            value={period}
            onChange={(e) => handleFilterChange('period', e.target.value)}
            className="border-gray-200 focus:ring-orange-500 focus:border-orange-500 rounded-lg text-sm p-2 bg-gray-50 font-medium text-gray-700 outline-none"
          >
            <option value="daily">Daily View</option>
            <option value="weekly">Weekly View</option>
            <option value="monthly">Monthly View</option>
          </select>

          {/* Date Picker - From */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 uppercase ml-2">From</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => handleFilterChange('from', e.target.value)}
              className="border-gray-200 focus:ring-orange-500 focus:border-orange-500 rounded-lg text-sm p-1.5 bg-gray-50 outline-none font-medium text-gray-700"
            />
          </div>

          {/* Date Picker - To */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 uppercase">To</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => handleFilterChange('to', e.target.value)}
              className="border-gray-200 focus:ring-orange-500 focus:border-orange-500 rounded-lg text-sm p-1.5 bg-gray-50 outline-none font-medium text-gray-700"
            />
          </div>

          <button
            onClick={handleRefresh}
            className="p-2 bg-gray-50 hover:bg-orange-50 hover:text-orange-500 text-gray-600 rounded-lg transition-all"
            title="Refresh Data"
          >
            <LuRefreshCw className={`h-4 w-4 ${loading ? 'animate-spin text-orange-500' : ''}`} />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Total Entries */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Entries</p>
            <h3 className="text-3xl font-bold text-gray-900">{summary?.total_entries || 0}</h3>
            <p className="text-xs text-green-500 font-medium">Farm activities & challans</p>
          </div>
          <div className="p-4 bg-orange-50 text-orange-500 rounded-2xl">
            <FiFileText className="h-6 w-6" />
          </div>
        </div>

        {/* Active Users */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Active Users</p>
            <h3 className="text-3xl font-bold text-gray-900">{summary?.active_users || 0}</h3>
            <p className="text-xs text-indigo-500 font-medium">Supervisors entering data</p>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-500 rounded-2xl">
            <FiUsers className="h-6 w-6" />
          </div>
        </div>

        {/* Total Logins */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:-translate-y-1 flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Logins</p>
            <h3 className="text-3xl font-bold text-gray-900">{summary?.total_logins || 0}</h3>
            <p className="text-xs text-blue-500 font-medium">Mobile login sessions logged</p>
          </div>
          <div className="p-4 bg-blue-50 text-blue-500 rounded-2xl">
            <FiLogIn className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Entries by Plant */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-950">Top Plants by Activity</h3>
            <p className="text-sm text-gray-500">Cumulative entries submitted per plant</p>
          </div>
          <div className="h-80 w-full">
            {plantChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={plantChartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#6B7280' }} angle={25} tickMargin={12} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', fontFamily: 'Poppins' }}
                    labelStyle={{ fontWeight: 'bold', color: '#111827' }}
                  />
                  <Bar dataKey="posted" fill="#F3890A" radius={[8, 8, 0, 0]} name="Entries Posted" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No entries data for selected date range.</div>
            )}
          </div>
        </div>

        {/* Trends over Time */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-gray-950">Submissions & Logins Trend</h3>
            <p className="text-sm text-gray-500">Comparing activities and user logins chronologically</p>
          </div>
          <div className="h-80 w-full">
            {trendChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendChartData} margin={{ top: 10, right: 10, left: -20, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#6B7280' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', fontFamily: 'Poppins' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'Poppins' }} />
                  <Line type="monotone" dataKey="entries" stroke="#F3890A" strokeWidth={2.5} name="Entries Posted" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="logins" stroke="#3B82F6" strokeWidth={2.5} name="User Logins" dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm">No trend data for selected date range.</div>
            )}
          </div>
        </div>
      </div>

      {/* Main Report Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-gray-950">Farm Activity Report</h3>
              {selectedReason && (
                <span className="px-2.5 py-0.5 bg-rose-100 text-rose-700 rounded-full text-xs font-bold flex items-center gap-1">
                  <FiAlertCircle size={12} />
                  Reason: {selectedReason}
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mt-0.5">Farm activity entries per plant — click a count to view farmer-wise details.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Period selector */}
            <select
              value={period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-xl text-xs p-2 bg-gray-50 font-medium text-gray-700 outline-none"
            >
              <option value="daily">Daily View</option>
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly View</option>
            </select>

            {/* Mortality Reason Dropdown Filter */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-1.5 px-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Reason</span>
              <select
                value={selectedReason}
                onChange={(e) => handleFilterChange('reason', e.target.value)}
                className="bg-transparent outline-none text-xs font-semibold text-gray-700 cursor-pointer max-w-[140px]"
              >
                <option value="">All Reasons</option>
                {allKnownReasons.map((r, idx) => (
                  <option key={idx} value={r}>{r}</option>
                ))}
              </select>
              {selectedReason && (
                <button
                  onClick={() => handleFilterChange('reason', '')}
                  className="text-gray-400 hover:text-red-500 text-xs font-bold cursor-pointer"
                  title="Clear reason filter"
                >
                  <FiX size={13} />
                </button>
              )}
            </div>

            {/* From Date */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-2 px-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="bg-transparent outline-none text-xs font-medium text-gray-700"
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-2 px-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="bg-transparent outline-none text-xs font-medium text-gray-700"
              />
            </div>

            {/* Search */}
            <div className="relative flex-1 md:flex-none">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <RiSearchLine className="text-gray-400" />
              </span>
              <input
                type="text"
                placeholder="Search Plant..."
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-9 pr-4 py-2 border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none rounded-xl text-xs w-full md:w-44 bg-gray-50 font-medium"
              />
            </div>

            {/* Export */}
            <button
              onClick={handleExportDetailedReport}
              disabled={exportingDetails}
              className={`px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-500 hover:text-white border border-orange-100 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all shadow-sm ${
                exportingDetails ? 'opacity-70 cursor-wait' : 'cursor-pointer'
              }`}
              title="Download detailed Excel report with Entry Date, Plant, Farm, Mortality Count, and Mortality Reason"
            >
              {exportingDetails ? (
                <LuRefreshCw className="animate-spin" size={14} />
              ) : (
                <LuImport size={14} />
              )}
              <span>{exportingDetails ? "Exporting Details..." : "Export Excel"}</span>
            </button>
          </div>
        </div>

        {/* Table container */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold text-xs text-left">
                <th className="px-6 py-4 rounded-l-xl">Period Date</th>
                <th className="px-6 py-4">Plant Code</th>
                <th className="px-6 py-4">Plant Name</th>
                <th className="px-6 py-4 text-center rounded-r-xl">Farm Activities</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {paginatedData.length > 0 ? (
                paginatedData.map((row, idx) => {
                  const rowKey = `${row.period_date}-${row.plant}-${idx}`;
                  const isExpanded = expandedRow === rowKey;

                  return (
                    <React.Fragment key={idx}>
                      <tr className={`hover:bg-gray-50 transition-all cursor-pointer ${isExpanded ? 'bg-orange-50/50' : ''}`} onClick={() => handleRowExpand(rowKey, row)}>
                        <td className="px-6 py-4 font-semibold text-gray-900">{row.period_date}</td>
                        <td className="px-6 py-4 text-gray-500">{row.plant}</td>
                        <td className="px-6 py-4 font-medium text-gray-800">{row.plant_name}</td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className="px-3 py-1 bg-orange-50 text-orange-600 font-bold rounded-full text-xs cursor-pointer hover:bg-orange-100 hover:shadow-md transition-all inline-flex items-center gap-1"
                            title="Click to view farmer details"
                          >
                            {row.posted}
                            {isExpanded ? <FiChevronUp size={12} /> : <FiChevronDown size={12} />}
                          </span>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr>
                          <td colSpan="4" className="p-0">
                            <div className="bg-gradient-to-br from-orange-50/60 to-amber-50/40 border-t border-b border-orange-100 px-6 py-5">
                              {farmActivityLoading ? (
                                <div className="flex items-center justify-center py-8 gap-2">
                                  <LuRefreshCw className="animate-spin text-orange-500" size={18} />
                                  <span className="text-sm text-gray-500 font-medium">Loading farm activity details...</span>
                                </div>
                              ) : farmActivityError ? (
                                <div className="flex items-center gap-2 py-5 px-3 bg-red-50 rounded-xl border border-red-100">
                                  <span className="text-red-500 text-xs font-semibold">⚠ Error: {farmActivityError}</span>
                                </div>
                              ) : farmActivityDetails ? (
                                <div className="space-y-3">
                                  {/* Farmer-level Entries Table Header with Search and Export */}
                                  <div>
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-3">
                                      <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                        <FiActivity className="text-orange-500" size={15} />
                                        Farm Activity Entries — {farmActivityDetails.plant_name}
                                        <span className="ml-1 px-2 py-0.5 bg-orange-100 text-orange-600 rounded-full text-[10px] font-bold">
                                          {farmActivityDetails.summary.total_entries} entries · {farmActivityDetails.summary.unique_farmers} farmers
                                        </span>
                                        {selectedReason && (
                                          <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full text-[10px] font-bold">
                                            Reason: {selectedReason}
                                          </span>
                                        )}
                                      </h4>

                                      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                                        {/* Entry search by farmer or reason */}
                                        <div className="relative flex-1 sm:flex-none">
                                          <span className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-gray-400">
                                            <RiSearchLine size={13} />
                                          </span>
                                          <input
                                            type="text"
                                            placeholder="Search Farm / Reason..."
                                            value={entrySearchText}
                                            onChange={(e) => setEntrySearchText(e.target.value)}
                                            className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs outline-none focus:ring-2 focus:ring-orange-500 w-full sm:w-48 shadow-2xs font-medium"
                                          />
                                        </div>

                                        {entrySearchText && (
                                          <button
                                            onClick={() => setEntrySearchText('')}
                                            className="text-xs text-gray-400 hover:text-red-500 font-semibold px-1 cursor-pointer"
                                          >
                                            Clear
                                          </button>
                                        )}

                                        <button
                                          type="button"
                                          onClick={handleExportDetailedFarmActivities}
                                          className="px-3 py-1.5 bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition shadow-2xs cursor-pointer"
                                          title="Export detailed entries with Mortality Reasons to Excel"
                                        >
                                          <LuImport size={13} />
                                          <span>Export Farm Details</span>
                                        </button>
                                      </div>
                                    </div>

                                    {/* Entries Table */}
                                    {(() => {
                                      const displayedEntries = (farmActivityDetails.entries || []).filter(entry => {
                                        if (!entrySearchText) return true;
                                        const query = entrySearchText.toLowerCase();
                                        return (
                                          String(entry.farmer_name || '').toLowerCase().includes(query) ||
                                          String(entry.farmer || '').toLowerCase().includes(query) ||
                                          String(entry.batch || '').toLowerCase().includes(query) ||
                                          String(entry.mortality_reason || entry.reason || '').toLowerCase().includes(query) ||
                                          String(entry.treatment || '').toLowerCase().includes(query)
                                        );
                                      });

                                      return (
                                        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                                          <table className="min-w-full text-xs">
                                            <thead>
                                              <tr className="bg-gray-50 text-gray-500 font-semibold text-[10px] uppercase tracking-wider border-b border-gray-200">
                                                <th className="px-3 py-2.5 text-left">Farmer / Farm</th>
                                                <th className="px-3 py-2.5 text-left">Batch</th>
                                                <th className="px-3 py-2.5 text-center">Age</th>
                                                <th className="px-3 py-2.5 text-center">Housed</th>
                                                <th className="px-3 py-2.5 text-center">Stock</th>
                                                <th className="px-3 py-2.5 text-center">Mortality</th>
                                                <th className="px-3 py-2.5 text-center bg-rose-50/70 text-rose-800">Mortality Reason</th>
                                                <th className="px-3 py-2.5 text-center">Photo</th>
                                                <th className="px-3 py-2.5 text-center">Cum Mort %</th>
                                                <th className="px-3 py-2.5 text-center">Body Wt</th>
                                                <th className="px-3 py-2.5 text-center">Farm Maint.</th>
                                                <th className="px-3 py-2.5 text-center">Litter Qlty</th>
                                                <th className="px-3 py-2.5 text-center">Drinker Clean</th>
                                                <th className="px-3 py-2.5 text-left">Material</th>
                                                <th className="px-3 py-2.5 text-center">Feed Bags (Qty)</th>
                                                <th className="px-3 py-2.5 text-center">Balance Stock</th>
                                                <th className="px-3 py-2.5 text-center">Cum Feed</th>
                                                <th className="px-3 py-2.5 text-left">Treatment</th>
                                                <th className="px-3 py-2.5 text-left">Posted By</th>
                                              </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                              {displayedEntries.length > 0 ? (
                                                displayedEntries.map((entry, eIdx) => (
                                                  <tr key={eIdx} className="bg-white hover:bg-gray-50 transition-all">
                                                    <td className="px-3 py-2.5 whitespace-nowrap">
                                                      {entry.farmer_name ? (
                                                        <>
                                                          <div className="font-semibold text-gray-800">{entry.farmer_name}</div>
                                                          <div className="text-[10px] text-gray-400 font-medium mt-0.5">{entry.farmer}</div>
                                                        </>
                                                      ) : (
                                                        <>
                                                          <div className="font-semibold text-gray-800">{entry.farmer || '-'}</div>
                                                          <div className="text-[10px] text-gray-400 font-medium mt-0.5">Name N/A</div>
                                                        </>
                                                      )}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-gray-600 whitespace-nowrap">{entry.batch || '-'}</td>
                                                    <td className="px-3 py-2.5 text-center text-gray-600">{entry.age || '-'}</td>
                                                    <td className="px-3 py-2.5 text-center">
                                                      <span className="px-2 py-0.5 bg-green-50 text-green-700 rounded-full font-semibold">{entry.housed || '-'}</span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full font-semibold">{entry.stock || '-'}</span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center">
                                                      <span className={`px-2 py-0.5 rounded-full font-semibold ${Number(entry.mortality) > 0 ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-500'}`}>
                                                        {entry.mortality || '0'}
                                                      </span>
                                                    </td>

                                                    {/* Mortality Reason Column */}
                                                    <td className="px-3 py-2.5 text-center whitespace-nowrap bg-rose-50/30">
                                                      {(entry.mortality_reason || entry.reason) ? (
                                                        <span className="px-2.5 py-1 bg-rose-50 text-rose-700 border border-rose-200/80 rounded-full font-bold text-[11px] shadow-2xs inline-block">
                                                          {entry.mortality_reason || entry.reason}
                                                        </span>
                                                      ) : (
                                                        <span className="text-gray-300 font-medium">-</span>
                                                      )}
                                                    </td>

                                                    {/* Farm Activity Photo Column */}
                                                    <td className="px-3 py-2.5 text-center whitespace-nowrap">
                                                      {((entry.photos && entry.photos.length > 0) || entry.upload_mortality || entry.photo_url || 
                                                        (entry.start_km_photos && entry.start_km_photos.length > 0) || entry.upload_start_km || entry.start_km_photo_url ||
                                                        (entry.end_km_photos && entry.end_km_photos.length > 0) || entry.upload_end_km || entry.end_km_photo_url) ? (
                                                        <button
                                                          type="button"
                                                          onClick={(e) => { e.stopPropagation(); openPhotoModal(entry); }}
                                                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-900 border border-amber-200/80 rounded-lg font-semibold text-[11px] inline-flex items-center gap-1.5 transition-all shadow-2xs hover:shadow-xs group cursor-pointer"
                                                          title="Click to view farm activity photos (Mortality, Start KM, End KM)"
                                                        >
                                                          <FiImage className="text-amber-600 group-hover:scale-110 transition-transform" size={13} />
                                                          <span>View Photo</span>
                                                          {(() => {
                                                            const mCount = entry.photos?.length || (entry.upload_mortality ? 1 : 0);
                                                            const sCount = entry.start_km_photos?.length || (entry.upload_start_km ? 1 : 0);
                                                            const eCount = entry.end_km_photos?.length || (entry.upload_end_km ? 1 : 0);
                                                            const total = mCount + sCount + eCount;
                                                            return total > 1 ? (
                                                              <span className="ml-0.5 px-1 py-0.2 bg-amber-200 text-amber-800 rounded-full text-[9px] font-bold">
                                                                {total}
                                                              </span>
                                                            ) : null;
                                                          })()}
                                                        </button>
                                                      ) : (
                                                        <span className="text-gray-300 font-medium">-</span>
                                                      )}
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center text-gray-600">{entry.cum_mortality_percentage || '-'}%</td>
                                                    <td className="px-3 py-2.5 text-center">
                                                      <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded-full font-semibold">{entry.body_weight || '-'}</span>
                                                    </td>
                                                    <td className="px-3 py-2.5 text-center text-gray-600">{entry.farms_maintenance || '-'}</td>
                                                    <td className="px-3 py-2.5 text-center text-gray-600">{entry.litter_quality || '-'}</td>
                                                    <td className="px-3 py-2.5 text-center text-gray-600">{entry.drinker_cleaning || '-'}</td>

                                                    {/* Material Details - supports multiple materials */}
                                                    {entry.materials && Array.isArray(entry.materials) && entry.materials.length > 0 ? (
                                                      <>
                                                        <td className="px-3 py-2.5 text-left">
                                                          <div className="flex flex-col gap-1">
                                                            {entry.materials.map((m, mIdx) => (
                                                              <span key={mIdx} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full font-semibold text-[10px] whitespace-nowrap block w-fit">
                                                                {m.material_label || m.material || '-'}
                                                              </span>
                                                            ))}
                                                          </div>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-center">
                                                          <div className="flex flex-col gap-1 items-center">
                                                            {entry.materials.map((m, mIdx) => (
                                                              <span key={mIdx} className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-semibold">
                                                                {m.qty || '0'}
                                                              </span>
                                                            ))}
                                                          </div>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-center">
                                                          <div className="flex flex-col gap-1 items-center">
                                                            {entry.materials.map((m, mIdx) => (
                                                              <span key={mIdx} className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-full font-semibold">
                                                                {m.stock || '0'}
                                                              </span>
                                                            ))}
                                                          </div>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-center">
                                                          <div className="flex flex-col gap-1 items-center">
                                                            {entry.materials.map((m, mIdx) => (
                                                              <span key={mIdx} className="text-gray-600">
                                                                {m.cum_feed || '-'}
                                                              </span>
                                                            ))}
                                                          </div>
                                                        </td>
                                                      </>
                                                    ) : (
                                                      <>
                                                        <td className="px-3 py-2.5 text-left">
                                                          <span className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-full font-semibold text-[10px] whitespace-nowrap">
                                                            {entry.material || '-'}
                                                          </span>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-center">
                                                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full font-semibold">{entry.quantity_bags || '-'}</span>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-center">
                                                          <span className="px-2 py-0.5 bg-cyan-50 text-cyan-700 rounded-full font-semibold">{entry.stock_bags || '-'}</span>
                                                        </td>
                                                        <td className="px-3 py-2.5 text-center text-gray-600">{entry.cum_feed || '-'}</td>
                                                      </>
                                                    )}
                                                    <td className="px-3 py-2.5 text-gray-600 max-w-[120px] truncate" title={entry.treatment}>{entry.treatment || '-'}</td>
                                                    <td className="px-3 py-2.5 text-gray-500 whitespace-nowrap">{entry.user_display_name}</td>
                                                  </tr>
                                                ))
                                              ) : (
                                                <tr>
                                                  <td colSpan="19" className="px-4 py-6 text-center text-gray-400 font-medium">
                                                    {entrySearchText
                                                      ? `No farm activity entries matching "${entrySearchText}".`
                                                      : "No farm activity entries found for this date and plant."}
                                                  </td>
                                                </tr>
                                              )}
                                            </tbody>
                                          </table>
                                        </div>
                                      );
                                    })()}
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-6 text-gray-400 text-sm">No farm activity data available.</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-gray-400 font-medium">
                    {loading ? "Loading report data..." : "No reports available for selected period and filters."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-3 py-1.5 border rounded-lg text-xs font-semibold ${currentPage === 1 ? 'text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed' : 'text-white bg-orange-500 border-orange-500 hover:bg-orange-600'}`}
            >
              Prev
            </button>
            <span className="text-xs text-gray-500 font-semibold px-2">Page {currentPage} of {totalPages}</span>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`px-3 py-1.5 border rounded-lg text-xs font-semibold ${currentPage === totalPages ? 'text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed' : 'text-white bg-orange-500 border-orange-500 hover:bg-orange-600'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* ═══════════ Bill of Supply Section ═══════════ */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-6 bg-gradient-to-b from-green-500 to-teal-400 rounded-full inline-block" />
              Bill of Supply
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">Farmer &amp; Customer dispatch summary with weights and bill values</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchBosData}
              className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-600 rounded-xl flex items-center gap-1.5 text-xs font-semibold transition-all"
            >
              <LuRefreshCw size={13} className={bosLoading ? 'animate-spin' : ''} />
              Refresh
            </button>
            <button
              onClick={handleBosExport}
              className="px-4 py-2 bg-green-50 text-green-700 hover:bg-green-500 hover:text-white border border-green-200 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all shadow-sm"
            >
              <LuImport size={14} />
              Export Excel
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Total Bills', value: bosSummary.totalBills, color: 'from-teal-400 to-green-500', icon: '🧾' },
            { label: 'Total Birds', value: bosSummary.totalBirds.toLocaleString(), color: 'from-orange-400 to-amber-500', icon: '🐔' },
            { label: 'Net Weight (kg)', value: bosSummary.totalWeight.toLocaleString(undefined, { maximumFractionDigits: 1 }), color: 'from-blue-400 to-indigo-500', icon: '⚖️' },
            { label: 'Bill Value (₹)', value: bosSummary.totalValue.toLocaleString(undefined, { maximumFractionDigits: 0 }), color: 'from-purple-400 to-pink-500', icon: '💰' },
          ].map((card, i) => (
            <div key={i} className="relative bg-white rounded-xl border border-gray-100 p-4 shadow-sm overflow-hidden">
              <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-5 rounded-xl`} />
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">{card.label}</p>
                  <p className="text-xl font-extrabold text-gray-900 mt-1">{bosLoading ? '—' : card.value}</p>
                </div>
                <span className="text-2xl">{card.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3 bg-gray-50 rounded-xl p-3 mb-5 border border-gray-100">
          {/* Search */}
          <div className="relative flex-1 min-w-[160px] max-w-xs">
            <RiSearchLine className="absolute top-2.5 left-2.5 text-gray-400" size={14} />
            <input
              type="search"
              placeholder="Search DC No / Customer / Farmer..."
              value={bosSearchText}
              onChange={e => { setBosSearchText(e.target.value); setBosCurrentPage(1); }}
              className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-green-400 bg-white"
            />
          </div>
          {/* From Date */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 uppercase">From</span>
            <input
              type="date"
              value={bosFromDate}
              onChange={e => { setBosFromDate(e.target.value); setBosCurrentPage(1); }}
              className="border border-gray-200 rounded-lg text-xs p-2 bg-white focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>
          {/* To Date */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-semibold text-gray-400 uppercase">To</span>
            <input
              type="date"
              value={bosToDate}
              onChange={e => { setBosToDate(e.target.value); setBosCurrentPage(1); }}
              className="border border-gray-200 rounded-lg text-xs p-2 bg-white focus:ring-2 focus:ring-green-400 outline-none"
            />
          </div>
          {/* Plant Filter */}
          <select
            value={bosSelectedPlant}
            onChange={e => { setBosSelectedPlant(e.target.value); setBosCurrentPage(1); }}
            className="border border-gray-200 rounded-lg text-xs p-2 bg-white focus:ring-2 focus:ring-green-400 outline-none min-w-[130px]"
          >
            <option value="">All Plants</option>
            {bosPlants.map(p => (
              <option key={p.plant_id} value={p.plant_id}>{p.plant_id} - {p.plant_name || p.plant_id}</option>
            ))}
          </select>
          {/* Customer Filter */}
          <select
            value={bosSelectedCustomer}
            onChange={e => { setBosSelectedCustomer(e.target.value); setBosCurrentPage(1); }}
            className="border border-gray-200 rounded-lg text-xs p-2 bg-white focus:ring-2 focus:ring-green-400 outline-none min-w-[130px]"
          >
            <option value="">All Customers</option>
            {bosUniqueCustomers.map(code => (
              <option key={code} value={code}>{bosCustomerMap[code] ? `${code} - ${bosCustomerMap[code]}` : code}</option>
            ))}
          </select>
          {/* Farmer Filter */}
          <select
            value={bosSelectedFarmer}
            onChange={e => { setBosSelectedFarmer(e.target.value); setBosCurrentPage(1); }}
            className="border border-gray-200 rounded-lg text-xs p-2 bg-white focus:ring-2 focus:ring-green-400 outline-none min-w-[130px]"
          >
            <option value="">All Farmers</option>
            {bosUniqueFarmers.map(code => (
              <option key={code} value={code}>{bosFarmerMap[code] ? `${code} - ${bosFarmerMap[code]}` : code}</option>
            ))}
          </select>
          {/* Clear Filters */}
          {(bosSearchText || bosFromDate || bosToDate || bosSelectedPlant || bosSelectedCustomer || bosSelectedFarmer) && (
            <button
              onClick={() => { setBosSearchText(''); setBosFromDate(''); setBosToDate(''); setBosSelectedPlant(''); setBosSelectedCustomer(''); setBosSelectedFarmer(''); setBosCurrentPage(1); }}
              className="px-3 py-2 text-xs font-semibold text-red-500 hover:bg-red-50 rounded-lg border border-red-100 transition-all flex items-center gap-1"
            >
              <FiX size={12} /> Clear
            </button>
          )}
          <span className="ml-auto text-xs text-gray-400 font-medium">{bosFilteredData.length} record{bosFilteredData.length !== 1 ? 's' : ''}</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border border-gray-100 shadow-sm">
          <table className="min-w-full divide-y divide-gray-100 text-sm">
            <thead>
              <tr className="bg-gradient-to-r from-gray-50 to-white text-gray-500 font-semibold text-xs uppercase tracking-wide">
                <th className="px-4 py-3.5 text-center w-10">#</th>
                <th className="px-4 py-3.5 text-left">Date</th>
                <th className="px-4 py-3.5 text-left">DC No</th>
                <th className="px-4 py-3.5 text-left">Plant</th>
                <th className="px-4 py-3.5 text-left">Farmer</th>
                <th className="px-4 py-3.5 text-left">Customer</th>
                <th className="px-4 py-3.5 text-center">Bird Qty</th>
                <th className="px-4 py-3.5 text-center">Net Wt (kg)</th>
                <th className="px-4 py-3.5 text-center">Avg Wt (g)</th>
                <th className="px-4 py-3.5 text-center">Rate (₹/kg)</th>
                <th className="px-4 py-3.5 text-center">Bill Value (₹)</th>
                <th className="px-4 py-3.5 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-gray-700">
              {bosLoading ? (
                <tr>
                  <td colSpan="12" className="py-10 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <LuRefreshCw className="animate-spin" size={18} />
                      <span className="text-sm font-medium">Loading Bill of Supply data...</span>
                    </div>
                  </td>
                </tr>
              ) : bosPaginatedData.length > 0 ? (
                bosPaginatedData.map((item, idx) => {
                  const { birds, netWeight } = bosGetLoadTotals(item);
                  const avgWt = bosGetAvgWeight(item);
                  const rate = Number(item.rate || item.raw_data?.rate || 0);
                  const billValue = Number(item.bill_value || item.raw_data?.bill_value || 0);
                  const status = item.sap_status || item.status || 'Pending';
                  const statusColor = status === 'Submitted' || status === 'Posted' ? 'bg-green-50 text-green-700' : status === 'Failed' ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-700';
                  return (
                    <tr key={item.id || idx} className="hover:bg-green-50/30 transition-colors">
                      <td className="px-4 py-3 text-center text-gray-400 font-medium text-xs">{bosStartIdx + idx + 1}</td>
                      <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{bosParseDate(item.date) || '-'}</td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">{item.dc_no || '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-700">{item.plant_name || item.plant || '-'}</td>
                      <td className="px-4 py-3 text-xs text-gray-700 max-w-[150px] truncate" title={bosResolveFarmer(item)}>{bosResolveFarmer(item)}</td>
                      <td className="px-4 py-3 text-xs text-gray-700 max-w-[150px] truncate" title={bosResolveCustomer(item)}>{bosResolveCustomer(item)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-0.5 bg-orange-50 text-orange-700 rounded-full font-bold text-xs">{(birds || Number(item.bird_qty || 0)).toLocaleString()}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 rounded-full font-bold text-xs">{(netWeight || Number(item.net_weight || 0)).toLocaleString(undefined, { maximumFractionDigits: 1 })}</span>
                      </td>
                      <td className="px-4 py-3 text-center text-xs text-gray-700">{avgWt}</td>
                      <td className="px-4 py-3 text-center text-xs font-semibold text-gray-700">₹{rate.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2.5 py-0.5 bg-green-50 text-green-700 rounded-full font-bold text-xs">₹{billValue.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>{status}</span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="12" className="py-10 text-center">
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <FiFileText size={28} className="text-gray-300" />
                      <span className="text-sm font-medium">No Bill of Supply records found.</span>
                      {(bosFromDate || bosToDate || bosSelectedPlant || bosSelectedCustomer || bosSelectedFarmer) && (
                        <span className="text-xs text-gray-400">Try adjusting your filters.</span>
                      )}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {bosTotalPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-5">
            <button
              onClick={() => setBosCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={bosCurrentPage === 1}
              className={`px-3 py-1.5 border rounded-lg text-xs font-semibold ${bosCurrentPage === 1 ? 'text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed' : 'text-white bg-green-500 border-green-500 hover:bg-green-600'}`}
            >
              Prev
            </button>
            <span className="text-xs text-gray-500 font-semibold px-2">Page {bosCurrentPage} of {bosTotalPages}</span>
            <button
              onClick={() => setBosCurrentPage(prev => Math.min(prev + 1, bosTotalPages))}
              disabled={bosCurrentPage === bosTotalPages}
              className={`px-3 py-1.5 border rounded-lg text-xs font-semibold ${bosCurrentPage === bosTotalPages ? 'text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed' : 'text-white bg-green-500 border-green-500 hover:bg-green-600'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Login History Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold text-gray-950">User Login History Report</h3>
            <p className="text-sm text-gray-500">Chronological count of logins and distinct users in the period.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Period selector */}
            <select
              value={period}
              onChange={(e) => handleFilterChange('period', e.target.value)}
              className="border border-gray-200 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 rounded-xl text-xs p-2 bg-gray-50 font-medium text-gray-700 outline-none"
            >
              <option value="daily">Daily View</option>
              <option value="weekly">Weekly View</option>
              <option value="monthly">Monthly View</option>
            </select>

            {/* From Date */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-2 px-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">From</span>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => handleFilterChange('from', e.target.value)}
                className="bg-transparent outline-none text-xs font-medium text-gray-700"
              />
            </div>

            {/* To Date */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-xl p-2 px-2.5">
              <span className="text-[10px] font-bold text-gray-400 uppercase">To</span>
              <input
                type="date"
                value={toDate}
                onChange={(e) => handleFilterChange('to', e.target.value)}
                className="bg-transparent outline-none text-xs font-medium text-gray-700"
              />
            </div>

            {/* Export */}
            <button
              onClick={handleExportLogins}
              className="px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-500 hover:text-white border border-blue-100 rounded-xl flex items-center gap-2 text-xs font-semibold transition-all shadow-sm"
            >
              <LuImport size={14} />
              <span>Export Logins</span>
            </button>
          </div>
        </div>

        {/* Table container */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr className="bg-gray-50 text-gray-500 font-semibold text-xs text-left">
                <th className="px-6 py-4 rounded-l-xl">Period Date</th>
                <th className="px-6 py-4 text-center rounded-r-xl">Total Logins</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
              {paginatedLoginData.length > 0 ? (
                paginatedLoginData.map((row, idx) => {
                  const rowKey = `login-${row.period_date}-${idx}`;
                  const isExpanded = expandedLoginRow === rowKey;
                  return (
                    <React.Fragment key={idx}>
                      <tr
                        className={`hover:bg-gray-50 transition-all cursor-pointer ${isExpanded ? 'bg-orange-50/40' : ''}`}
                        onClick={() => handleLoginRowExpand(rowKey, row)}
                      >
                        <td className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
                          <span className={`p-1 rounded-md transition-colors ${isExpanded ? 'bg-orange-100 text-orange-600' : 'text-gray-400'}`}>
                            {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                          </span>
                          <span>{row.period_date}</span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span
                            className="px-4 py-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 font-bold rounded-full text-xs cursor-pointer inline-flex items-center gap-1.5 transition-all shadow-2xs"
                            title="Click to view logged in user details"
                          >
                            <span>{row.login_count}</span>
                            <span className="text-[10px] text-blue-400 font-normal">logins</span>
                          </span>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr>
                          <td colSpan="2" className="p-0">
                            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 border-t border-b border-blue-100 px-6 py-5">
                              {loginDetailsLoading ? (
                                <div className="flex items-center justify-center py-8 gap-2">
                                  <LuRefreshCw className="animate-spin text-blue-500" size={18} />
                                  <span className="text-sm text-gray-500 font-medium">Loading logged-in user details...</span>
                                </div>
                              ) : loginDetailsError ? (
                                <div className="flex items-center gap-2 py-4 px-4 bg-red-50 rounded-xl border border-red-100 text-red-600 text-xs font-semibold">
                                  <span>⚠ Error: {loginDetailsError}</span>
                                </div>
                              ) : loginDetailsData ? (
                                <div className="space-y-4">
                                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                    <h4 className="text-sm font-bold text-gray-800 flex items-center gap-2">
                                      <FiUsers className="text-blue-500" size={16} />
                                      <span>Logged-In Users on {loginDetailsData.date}</span>
                                      <span className="ml-1 px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-extrabold">
                                        {loginDetailsData.total_logins} Total Logins
                                      </span>
                                    </h4>
                                  </div>

                                  {/* Logged in users table */}
                                  <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm bg-white">
                                    <table className="min-w-full text-xs">
                                      <thead>
                                        <tr className="bg-gray-50 text-gray-600 font-semibold text-[11px] uppercase tracking-wider border-b border-gray-200">
                                          <th className="px-6 py-3 text-center w-14">#</th>
                                          <th className="px-6 py-3 text-left">User</th>
                                          <th className="px-6 py-3 text-left">Role</th>
                                          <th className="px-6 py-3 text-left">Plant / Branch</th>
                                          <th className="px-6 py-3 text-left">Login Time</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-100">
                                        {loginDetailsData.allLogins && loginDetailsData.allLogins.length > 0 ? (
                                          loginDetailsData.allLogins.map((item, uIdx) => (
                                            <tr key={uIdx} className="hover:bg-blue-50/40 transition-colors">
                                              <td className="px-6 py-3.5 text-center font-bold text-gray-400">
                                                {uIdx + 1}
                                              </td>
                                              <td className="px-6 py-3.5">
                                                <div className="font-bold text-gray-900">{item.fullname || item.username}</div>
                                                <div className="text-[10px] text-gray-400 font-mono">@{item.username}</div>
                                              </td>
                                              <td className="px-6 py-3.5">
                                                <span className="px-3 py-1 bg-gray-100 text-gray-700 font-semibold rounded-md text-[11px]">
                                                  {item.role || 'Supervisor'}
                                                </span>
                                              </td>
                                              <td className="px-6 py-3.5">
                                                {item.plant_name && item.plant_name !== '-' ? (
                                                  <span className="px-2.5 py-0.5 bg-orange-50 text-orange-700 border border-orange-200 font-semibold rounded-md text-[11px]">
                                                    {item.plant_name}
                                                  </span>
                                                ) : (
                                                  <span className="text-gray-400 font-medium">-</span>
                                                )}
                                              </td>
                                              <td className="px-6 py-3.5 text-gray-800 font-semibold whitespace-nowrap">
                                                {item.login_time
                                                  ? new Date(item.login_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })
                                                  : item.time_only || '-'}
                                              </td>
                                            </tr>
                                          ))
                                        ) : (
                                          <tr>
                                            <td colSpan="5" className="px-6 py-6 text-center text-gray-400 font-medium">
                                              No login logs found for this date.
                                            </td>
                                          </tr>
                                        )}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ) : (
                                <div className="text-center py-6 text-gray-400 text-sm">No login data available.</div>
                              )}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="2" className="px-6 py-8 text-center text-gray-400 font-medium">
                    No login logs recorded in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination controls */}
        {totalLoginPages > 1 && (
          <div className="flex justify-end items-center gap-2 mt-6">
            <button
              onClick={() => setLoginCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={loginCurrentPage === 1}
              className={`px-3 py-1.5 border rounded-lg text-xs font-semibold ${loginCurrentPage === 1 ? 'text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed' : 'text-white bg-orange-500 border-orange-500 hover:bg-orange-600'}`}
            >
              Prev
            </button>
            <span className="text-xs text-gray-500 font-semibold px-2">Page {loginCurrentPage} of {totalLoginPages}</span>
            <button
              onClick={() => setLoginCurrentPage(prev => Math.min(prev + 1, totalLoginPages))}
              disabled={loginCurrentPage === totalLoginPages}
              className={`px-3 py-1.5 border rounded-lg text-xs font-semibold ${loginCurrentPage === totalLoginPages ? 'text-gray-400 bg-gray-50 border-gray-100 cursor-not-allowed' : 'text-white bg-orange-500 border-orange-500 hover:bg-orange-600'}`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Photo Viewer Modal with Mortality, Start KM, and End KM Tabs */}
      {photoModal && (() => {
        const currentPhotosList = (photoModal.activeTab === 'start_km' 
          ? photoModal.startKmPhotos 
          : photoModal.activeTab === 'end_km' 
          ? photoModal.endKmPhotos 
          : photoModal.mortalityPhotos) || [];
        
        const currentPhoto = currentPhotosList[activePhotoIdx] || currentPhotosList[0] || null;
        const currentUrl = currentPhoto?.url || currentPhoto?.uri || null;

        const isStartKm = photoModal.activeTab === 'start_km';
        const isEndKm = photoModal.activeTab === 'end_km';
        const isMortality = photoModal.activeTab === 'mortality';

        return (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
            onClick={closePhotoModal}
          >
            <div 
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh] border border-gray-100 font-poppins"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className={`flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gradient-to-r ${
                isStartKm ? 'from-blue-50/90 to-sky-50/60' :
                isEndKm ? 'from-green-50/90 to-emerald-50/60' :
                'from-orange-50/90 to-amber-50/60'
              }`}>
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 text-white rounded-xl shadow-xs ${
                    isStartKm ? 'bg-blue-600' :
                    isEndKm ? 'bg-green-600' :
                    'bg-orange-500'
                  }`}>
                    <FiImage size={20} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">
                      {isStartKm ? 'Start KM Photo' : isEndKm ? 'End KM Photo' : 'Mortality Photo'}
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {photoModal.entry.farmer_name || photoModal.entry.farmer || 'Farmer Entry'}
                      {photoModal.entry.batch ? ` · Batch #${photoModal.entry.batch}` : ''}
                      {isMortality && photoModal.entry.mortality !== undefined ? ` · ${photoModal.entry.mortality} Mortality` : ''}
                      {isMortality && (photoModal.entry.mortality_reason || photoModal.entry.reason) ? ` · Reason: ${photoModal.entry.mortality_reason || photoModal.entry.reason}` : ''}
                      {isStartKm && photoModal.startKm ? ` · Start: ${photoModal.startKm} KM` : ''}
                      {isEndKm && photoModal.endKm ? ` · End: ${photoModal.endKm} KM` : ''}
                      {photoModal.vehicleNo && (isStartKm || isEndKm) ? ` · 🚗 ${photoModal.vehicleNo}` : ''}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closePhotoModal}
                  className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
                  title="Close"
                >
                  <FiX size={20} />
                </button>
              </div>

              {/* Modal Tabs Navigation Bar */}
              <div className="px-6 py-2.5 bg-gray-50/90 border-b border-gray-200/70 flex items-center gap-2 overflow-x-auto">
                {/* Mortality Tab */}
                <button
                  type="button"
                  onClick={() => handleSwitchPhotoTab('mortality')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isMortality
                      ? 'bg-orange-500 text-white shadow-xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                  }`}
                >
                  <span>Mortality Photo</span>
                  {photoModal.mortalityPhotos?.length > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isMortality ? 'bg-orange-600 text-white' : 'bg-orange-100 text-orange-700'
                    }`}>
                      {photoModal.mortalityPhotos.length}
                    </span>
                  )}
                </button>

                {/* Start KM Tab */}
                <button
                  type="button"
                  onClick={() => handleSwitchPhotoTab('start_km')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isStartKm
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                  }`}
                >
                  <span>Start KM</span>
                  {photoModal.startKm && (
                    <span className={`text-[10px] font-semibold opacity-90 px-1 py-0.2 rounded ${isStartKm ? 'bg-blue-700 text-white' : 'bg-blue-50 text-blue-700'}`}>
                      {photoModal.startKm}
                    </span>
                  )}
                  {photoModal.startKmPhotos?.length > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isStartKm ? 'bg-blue-700 text-white' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {photoModal.startKmPhotos.length}
                    </span>
                  )}
                </button>

                {/* End KM Tab */}
                <button
                  type="button"
                  onClick={() => handleSwitchPhotoTab('end_km')}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isEndKm
                      ? 'bg-green-600 text-white shadow-xs'
                      : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200/80'
                  }`}
                >
                  <span>End KM</span>
                  {photoModal.endKm && (
                    <span className={`text-[10px] font-semibold opacity-90 px-1 py-0.2 rounded ${isEndKm ? 'bg-green-700 text-white' : 'bg-green-50 text-green-700'}`}>
                      {photoModal.endKm}
                    </span>
                  )}
                  {photoModal.endKmPhotos?.length > 0 && (
                    <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isEndKm ? 'bg-green-700 text-white' : 'bg-green-100 text-green-700'
                    }`}>
                      {photoModal.endKmPhotos.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-gray-50/50 min-h-[320px]">
                {currentPhotosList.length > 0 && currentPhoto ? (
                  <div className="w-full flex flex-col items-center space-y-4">
                    {/* Photo Display Frame */}
                    <div className="relative w-full bg-slate-900/5 rounded-xl border border-gray-200 overflow-hidden flex items-center justify-center min-h-[260px] max-h-[480px]">
                      {!imageError && currentUrl ? (
                        <img
                          src={currentUrl}
                          alt={currentPhoto.name || "Photo"}
                          onError={() => setImageError(true)}
                          className="max-h-[460px] w-auto max-w-full object-contain rounded-lg shadow-xs"
                        />
                      ) : (
                        <div className="p-8 text-center flex flex-col items-center justify-center space-y-2">
                          <FiAlertCircle className={isStartKm ? 'text-blue-500' : isEndKm ? 'text-green-500' : 'text-amber-500'} size={36} />
                          <p className="text-sm font-semibold text-gray-800">Photo Details Captured from Mobile App</p>
                          <p className="text-xs text-gray-500 max-w-sm">
                            File: <span className="font-mono text-[11px] text-gray-700 font-medium break-all">{currentPhoto.fileName || currentPhoto.name || currentPhoto.uri || 'photo.jpg'}</span>
                          </p>
                          {currentUrl && (
                            <button
                              onClick={() => window.open(currentUrl, '_blank')}
                              className={`mt-2 px-3.5 py-1.5 text-white rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-xs cursor-pointer ${
                                isStartKm ? 'bg-blue-600 hover:bg-blue-700' : isEndKm ? 'bg-green-600 hover:bg-green-700' : 'bg-orange-500 hover:bg-orange-600'
                              }`}
                            >
                              <FiExternalLink size={14} /> Open Image Link
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Multiple Photos Thumbnails Strip */}
                    {currentPhotosList.length > 1 && (
                      <div className="flex items-center gap-2 overflow-x-auto p-1 max-w-full">
                        {currentPhotosList.map((p, pIdx) => (
                          <button
                            key={pIdx}
                            onClick={() => {
                              setActivePhotoIdx(pIdx);
                              setImageError(false);
                            }}
                            className={`p-1 border-2 rounded-lg transition overflow-hidden h-14 w-14 flex-shrink-0 bg-white cursor-pointer ${
                              activePhotoIdx === pIdx 
                                ? (isStartKm ? 'border-blue-500 shadow-sm' : isEndKm ? 'border-green-500 shadow-sm' : 'border-orange-500 shadow-sm') 
                                : 'border-gray-200 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={p.url || p.uri}
                              alt={`thumb-${pIdx}`}
                              className="w-full h-full object-cover rounded"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Photo Metadata Details */}
                    <div className="w-full grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-white p-3.5 rounded-xl border border-gray-200/80 shadow-2xs">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">File Name</span>
                        <span className="font-medium text-gray-800 truncate block" title={currentPhoto.name || currentPhoto.fileName || '-'}>
                          {currentPhoto.name || currentPhoto.fileName || (isStartKm ? 'start_km.jpg' : isEndKm ? 'end_km.jpg' : 'mortality.jpg')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Reading / Info</span>
                        <span className="font-medium text-gray-800 block">
                          {isStartKm ? (photoModal.startKm ? `Start: ${photoModal.startKm} KM` : 'Start Odometer') :
                           isEndKm ? (photoModal.endKm ? `End: ${photoModal.endKm} KM` : 'End Odometer') :
                           `${photoModal.entry.mortality || 0} Mortality`}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">File Size</span>
                        <span className="font-medium text-gray-800 block">
                          {currentPhoto.fileSize ? `${(currentPhoto.fileSize / 1024).toFixed(1)} KB` : (currentPhoto.width && currentPhoto.height ? `${currentPhoto.width} × ${currentPhoto.height}` : 'Standard')}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-gray-400 block">Recorded By</span>
                        <span className="font-medium text-gray-800 truncate block">
                          {photoModal.entry.user_display_name || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center flex flex-col items-center justify-center space-y-3 max-w-sm">
                    <div className={`p-4 rounded-2xl ${
                      isStartKm ? 'bg-blue-50 text-blue-500' :
                      isEndKm ? 'bg-green-50 text-green-500' :
                      'bg-amber-50 text-amber-500'
                    }`}>
                      <FiImage size={32} />
                    </div>
                    <p className="text-sm font-semibold text-gray-800">
                      {isStartKm ? 'No Start KM Photo Attached' :
                       isEndKm ? 'No End KM Photo Attached' :
                       'No Mortality Photo Attached'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {isStartKm ? (
                        photoModal.startKm ? `Recorded Odometer: ${photoModal.startKm} KM (No image file attached)` : 'No start KM photo recorded for this trip.'
                      ) : isEndKm ? (
                        photoModal.endKm ? `Recorded Odometer: ${photoModal.endKm} KM (No image file attached)` : 'No end KM photo recorded for this trip.'
                      ) : (
                        `Recorded Mortality: ${photoModal.entry.mortality || 0} count (No photo uploaded).`
                      )}
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between px-6 py-3.5 border-t border-gray-100 bg-white">
                <div className="text-xs text-gray-400 font-medium">
                  {currentPhotosList.length > 0 
                    ? (currentPhotosList.length > 1 ? `Photo ${activePhotoIdx + 1} of ${currentPhotosList.length}` : '1 photo attached')
                    : '0 photos in this tab'
                  }
                </div>
                <div className="flex items-center gap-2">
                  {currentUrl && (
                    <button
                      onClick={() => window.open(currentUrl, '_blank')}
                      className={`px-3.5 py-1.5 border rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition shadow-2xs cursor-pointer ${
                        isStartKm ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border-blue-200/80' :
                        isEndKm ? 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200/80' :
                        'bg-orange-50 text-orange-600 hover:bg-orange-100 border-orange-200/80'
                      }`}
                    >
                      <FiExternalLink size={13} />
                      <span>Open in Tab</span>
                    </button>
                  )}
                  <button
                    onClick={closePhotoModal}
                    className="px-4 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default BroilerDashBoard;
