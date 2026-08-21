import React, { useState, useMemo, useEffect } from 'react';
import { RiArrowUpSFill, RiSearchLine } from 'react-icons/ri';
import { LuPlus } from 'react-icons/lu';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import { IoCloseSharp } from 'react-icons/io5';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { formatDateTime } from '../../utils/helper';
import Swal from 'sweetalert2';
import { useAuth } from '../../auth/AuthContext';


const Moderator = () => {
  const [moderators, setModerators] = useState([]);
  const [roles, setRoles] = useState([]);
  const { user, getPermissions } = useAuth();
  const permissions = getPermissions() || {};
  const { adminPage, userMaster, broilerUsers } = permissions;
  const isAdmin = adminPage?.showAllCategories === true;

  // Permissions flags (default to true if not explicitly defined/false)
  const canAdd = userMaster ? userMaster.add : (broilerUsers ? broilerUsers.add : true);
  const canEdit = userMaster ? userMaster.edit : (broilerUsers ? broilerUsers.edit : true);
  const canDelete = userMaster ? userMaster.delete : (broilerUsers ? broilerUsers.delete : true);

  const [categories, setCategories] = useState([
    { id: 1, name: "Wagon" },
    { id: 2, name: "Broiler" },
    { id: 3, name: "Breeder" },
  ]);

  const [modalIsOpen, setIsOpen] = useState(false);
  const [editingModerator, setEditingModerator] = useState(null);
  const [updateUserId, setUpdateUserId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitLoading, setIsSubmitLoading] = useState(false)

  // --- Pagination State ---
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const currentCategory = user?.category || 'Wagon';

  const defaultForm = {
    role: '',
    category: currentCategory,
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    status: true,
  }

  const [formData, setFormData] = useState({
    role: '',
    category: currentCategory,
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    status: true,
  });

  const filteredRoles = useMemo(() => {
    return roles.filter(role => role.category === (formData.category || currentCategory));
  }, [roles, formData.category, currentCategory]);

  const fetchAdminData = async () => {
    setIsLoading(true)
    try {
      const url = `/admin/getAll/${currentCategory}`;
      const { data } = await axios.get(url);

      if (data.status == true) {
        setModerators(data.data)
      } else {
        setModerators([])
      }
    }
    catch (error) {
      console.log("Server Error: ", error)
      setModerators([])
    } finally {
      setIsLoading(false)
    }
  }

  const fetchRolesData = async () => {
    setIsLoading(true)
    try {
      const { data } = await axios.get(`/roles/getAll/${currentCategory}`);
      if (data.status === true) {
        const activeRoles = data.data.filter(role => role.status === true);
        setRoles(activeRoles);
      } else {
        setRoles([]);
      }
    }
    catch (error) {
      console.log("Server Error: ", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdminData()
    fetchRolesData()
  }, [user?.category])

  // --- Modal and Form Handling ---
  const openModal = (moderator = null) => {
    if (moderator) {
      setEditingModerator(moderator);
      setUpdateUserId(moderator.id)
      setFormData({ ...moderator, password: '', confirmPassword: '' });
    } else {
      const defaultRolesForCategory = roles.filter(role => role.category === currentCategory);
      const initialRoleName = defaultRolesForCategory.length > 0 ? defaultRolesForCategory[0].role_name : '';

      setEditingModerator(null);
      setFormData({
        ...defaultForm,
        role: initialRoleName,
        category: currentCategory,
      });
    }
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setEditingModerator(null);
    setFormData({ ...defaultForm, category: currentCategory })
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      let newFormData = { ...prev, [name]: value };
      if (name === 'category') {
        const newRoles = roles.filter(role => role.category === value);
        const initialRoleName = newRoles.length > 0 ? newRoles[0].role_name : '';
        newFormData.role = initialRoleName;
      }

      return newFormData;
    });
  };

  const handleStatusToggle = (e) => {
    setFormData((prev) => ({ ...prev, status: e.target.checked }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitLoading(true)

    if (formData.password != formData.confirmPassword) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "error",
        title: `Password Doesn't Match`,
        showConfirmButton: false,
        timer: 2000
      });
      setIsSubmitLoading(false)
      return
    }

    try {
      if (editingModerator) {
        const { data } = await axios.put(`/admin/update/${updateUserId}`, formData);

        if (data.status == true) {
          await fetchAdminData()
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "User Updated Successfully.",
            showConfirmButton: false,
            timer: 2000
          });
        }
      }
      else {
        const { data } = await axios.post("/admin/register", formData);
        if (data.status == true) {
          await fetchAdminData()
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "Role Created Successfully.",
            showConfirmButton: false,
            timer: 2000
          });
        }
      }
    }
    catch (err) {
      console.log("Server Error: ", err)
      if (err.response && err.response.status === 409) {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: 'error',
          text: err.response.data.message,
          showConfirmButton: false,
          timer: 2000
        });
      } else {
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: 'error',
          title: 'Internal server error, Try Again',
          showConfirmButton: false,
          timer: 2000
        });
      }


    }
    finally {
      closeModal();
      setFormData(defaultForm)
      setIsSubmitLoading(false)
    }
  };

  // --- Table Data, Filtering, and Pagination Logic ---
  const handleToggleTableRowStatus = async (item) => {

    setIsSubmitLoading(true)

    try {
      const { data } = await axios.put(`/admin/update/${item?.id}`, { status: !item.status });
      // const { data } = await axios.put(`/admin/update/${item?.id}`, { ...item, status: !item.status });

      if (data.status == true) {
        await fetchAdminData()
        Swal.fire({
          toast: true,
          position: "top-end",
          icon: "success",
          title: "User Status Updated Successfully.",
          showConfirmButton: false,
          timer: 2000
        });
      }
    }
    catch (err) {
      console.log("Server Error: ", err)
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Internal server error, Try Again',
      });
    } finally {
      closeModal();
      setIsSubmitLoading(false);
    }
  };

  const handleDeleteModerator = async (item) => {
    try {
      const { isConfirmed } = await Swal.fire({
        title: 'Are you sure?',
        text: `Do you want to delete user "${item?.username}"?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#ea580c',
        cancelButtonColor: '#808080',
        confirmButtonText: 'Yes, delete it!'
      });

      if (isConfirmed) {
        setIsSubmitLoading(true);
        const { data } = await axios.delete(`/admin/delete/${item.id}`);
        if (data.status) {
          await fetchAdminData();
          Swal.fire({
            toast: true,
            position: "top-end",
            icon: "success",
            title: "User deleted successfully.",
            showConfirmButton: false,
            timer: 2000
          });
        }
      }
    } catch (err) {
      console.log("Delete error:", err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.response?.data?.message || 'Failed to delete user.',
      });
    } finally {
      setIsSubmitLoading(false);
    }
  };

  const filteredData = useMemo(() => {
    let data = moderators;

    // Apply search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      data = data.filter(item =>
        item.username.toLowerCase().includes(query) ||
        item.role.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        (item.first_name + " " + item.last_name).toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active';
      data = data.filter(item => item.status === isActive);
    }

    return data;
  }, [moderators, searchQuery, statusFilter]);


  // --- Pagination Calculations ---
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (pageNumber) => {
    setCurrentPage(Math.max(1, Math.min(pageNumber, totalPages)));
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    let startPage, endPage;

    if (totalPages <= 3) {
      startPage = 1;
      endPage = totalPages;
    } else {
      if (currentPage <= 2) {
        startPage = 1;
        endPage = 3;
      } else if (currentPage + 1 >= totalPages) {
        startPage = totalPages - 2;
        endPage = totalPages;
      } else {
        startPage = currentPage - 1;
        endPage = currentPage + 1;
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => goToPage(i)}
          className={`rounded px-3 py-1 text-sm ${currentPage === i ? 'bg-orange-500 text-white' : 'bg-gray-200 text-black'}`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  const LoadingOverlay = () => (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="h-16 w-16 animate-spin rounded-full border-8 border-solid border-white border-t-transparent"></div>
      <p className="mt-4 text-lg font-semibold text-white">Saving...</p>
    </div>
  );


  return (
    <div className="flex-1 rounded-lg p-6 font-poppins bg-[#F9F9FC] h-screen">

      {isSubmitLoading && <LoadingOverlay />}

      {/* --- Modal for Add/Edit --- */}
      {modalIsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <form onSubmit={handleSubmit} className="w-[60em] rounded-lg bg-white px-6 py-4 shadow-lg">
            <div className="flex items-center justify-between border-b py-2">
              <h1 className="text-lg font-semibold">{editingModerator ? "Edit User" : "Create User"}</h1>
              <button type="button" onClick={closeModal} className="text-white flex justify-center bg-primary rounded-full w-7 h-7 items-center">
                <IoCloseSharp />
              </button>
            </div>

            <div className="mt-4 grid grid-cols-1 gap-x-7 gap-y-2 md:grid-cols-2">
              <div className='col-span-2'>
                <label className="mb-2 block text-sm font-medium text-gray-700">Category</label>
                <select disabled name="category" value={formData.category || currentCategory} onChange={handleInputChange} className="w-full rounded-md bg-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500 opacity-70 cursor-not-allowed">
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Role</label>
                <select name="role" value={formData.role} onChange={handleInputChange} className="w-full rounded-md bg-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500">
                  {filteredRoles?.map((role) => (
                    <option key={role.id} value={role.role_name}>
                      {role.role_name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex w-[30%] flex-col justify-center">
                <label className="mb-2 block text-sm font-medium text-gray-700">Active Status</label>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input type="checkbox" name="status" checked={formData.status} onChange={handleStatusToggle} className="peer sr-only" />
                  <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:start-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  <span className="ms-3 text-sm font-medium text-gray-900">{formData.status ? 'Active' : 'Inactive'}</span>
                </label>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">First Name</label>
                <input type="text" name="first_name" value={formData.first_name} onChange={handleInputChange} required className="w-full rounded-md bg-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Last Name</label>
                <input type="text" name="last_name" value={formData.last_name} onChange={handleInputChange} required className="w-full rounded-md bg-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Username</label>
                <input type="text" name="username" value={formData.username} onChange={handleInputChange} required className="w-full rounded-md bg-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Email Address</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className="w-full rounded-md bg-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required={!editingModerator} className="w-full rounded-md bg-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">Confirm Password</label>
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required={!editingModerator} className="w-full rounded-md bg-gray-100 p-3 focus:outline-none focus:ring-2 focus:ring-orange-500" />
              </div>
            </div>

            <div className="mb-10 mt-8 flex justify-between gap-7">
              <button type="button" onClick={closeModal} className="w-full rounded-md bg-gray-200 px-6 py-2.5 text-gray-800 hover:bg-gray-300">Cancel</button>
              <button type="submit" className="w-full rounded-md bg-orange-500 px-6 py-2.5 text-white hover:bg-orange-600">{editingModerator ? "Update" : "Create"}</button>
            </div>
          </form>
        </div>
      )}

      {/* --- Main Content: Header, Search, and Filters --- */}
      <div className="space-y-4 ">
        <h1 className="text-xl font-bold text-gray-900">User Management</h1>
        <div className="flex items-center gap-x-2 text-sm text-gray-500 ">
          <Link to="/" className='text-orange-500'>Admin</Link>
          <span>
            <RiArrowUpSFill className='rotate-90 ' size={20} />
          </span>
          <span>Users</span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span className="absolute left-2 top-2.5"><RiSearchLine className="opacity-45" /></span>
              <input
                type="search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="rounded-lg border py-2 pl-8 pr-2 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-lg border bg-white py-2 pl-3 pr-8 text-xs focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          {canAdd && (
            <button onClick={() => openModal()} className="rounded-lg bg-orange-500 px-4 py-2 text-white hover:bg-orange-600">
              <div className='flex items-center gap-2 text-xs'>
                <LuPlus size={16} />
                <span>Add New</span>
              </div>
            </button>
          )}
        </div>
      </div>

      {/* --- Moderators Table --- */}
      <div className="mt-5 overflow-x-auto rounded-lg bg-white">
        <table className="w-full">
          <thead className='font-semibold'>
            <tr className="border-b">
              <th className="p-4 text-center text-sm text-black">S.No</th>
              <th className="p-4 text-left text-sm text-black">Username</th>
              <th className="p-4 text-left text-sm text-black">Role</th>
              <th className="p-4 text-left text-sm text-black">Category</th>
              <th className="p-4 text-left text-sm text-black">Email</th>
              <th className="p-4 text-left text-sm text-black">Last Login</th>
              <th className="p-4 text-center text-sm text-black">Status</th>
              {(canEdit || canDelete) && <th className="p-4 text-center text-sm text-black">Action</th>}
            </tr>
          </thead>
          <tbody className="divide-y">
            {paginatedData.map((item, index) => (
              <tr key={index} className="hover:bg-gray-50">
                <td className="p-4 text-center text-sm text-gray-600">{startIndex + index + 1}</td>
                <td className="p-4 text-left text-sm text-gray-600">{item?.username}</td>
                <td className="p-4 text-left text-sm text-gray-600">{item?.role}</td>
                <td className="p-4 text-left text-sm text-gray-600">{item?.category}</td>
                <td className="p-4 text-left text-sm text-gray-600">{item?.email}</td>
                <td className="p-4 text-left text-sm text-gray-600">{formatDateTime(item?.last_login)}</td>
                <td className="p-4 text-center text-sm text-gray-600">
                  <label className={`relative inline-flex items-center ${canEdit ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}`}>
                    <input type="checkbox" checked={item?.status} disabled={!canEdit} onChange={() => canEdit && handleToggleTableRowStatus(item)} className="peer sr-only" />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-0.5 after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-green-600 peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </label>
                </td>
                {(canEdit || canDelete) && (
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-3">
                      {canEdit && (
                        <button onClick={() => openModal(item)} className="text-gray-500 hover:text-orange-500 transition-colors" title="Edit User">
                          <FiEdit2 size={18} />
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => handleDeleteModerator(item)}
                          disabled={item?.username === 'admin'}
                          className={`text-gray-500 hover:text-red-600 transition-colors ${item?.username === 'admin' ? 'opacity-30 cursor-not-allowed' : ''}`}
                          title={item?.username === 'admin' ? "Primary admin user cannot be deleted" : "Delete User"}
                        >
                          <FiTrash2 size={18} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
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

        {/* --- Pagination Controls --- */}
        {totalPages > 0 && (
          <div className="flex items-center justify-end gap-2 p-4">
            <button
              onClick={() => goToPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="rounded border bg-white px-3 py-1 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              &lt;
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => goToPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="rounded border bg-white px-3 py-1 text-sm text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Moderator;
