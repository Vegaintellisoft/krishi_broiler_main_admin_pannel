import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { RiArrowUpSFill, RiEyeLine, RiEyeOffLine, RiLockPasswordLine } from 'react-icons/ri';
import axios from 'axios';
import Swal from 'sweetalert2';
import { useAuth } from '../auth/AuthContext';

const PasswordField = ({ label, name, value, show, onToggle, onChange }) => (
    <div>
        <label className="mb-2 block text-sm font-medium text-gray-700">{label}</label>
        <div className="relative">
            <input
                type={show ? 'text' : 'password'}
                name={name}
                value={value}
                onChange={onChange}
                required
                className="w-full rounded-md bg-gray-100 p-3 pr-10 focus:outline-none focus:ring-2 focus:ring-orange-500"
                placeholder={`Enter ${label.toLowerCase()}`}
            />
            <button
                type="button"
                onClick={onToggle}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
                {show ? <RiEyeOffLine size={18} /> : <RiEyeLine size={18} />}
            </button>
        </div>
    </div>
);

const ChangePassword = () => {
    const { user } = useAuth();

    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.newPassword || formData.newPassword.length < 6) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'warning',
                title: 'New password must be at least 6 characters.',
                showConfirmButton: false,
                timer: 2500,
            });
            return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: "New Passwords Don't Match",
                showConfirmButton: false,
                timer: 2500,
            });
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await axios.put(`/admin/change-password/${user?.id}`, {
                currentPassword: formData.currentPassword,
                newPassword: formData.newPassword,
            });

            if (data.status === true) {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'success',
                    title: 'Password changed successfully!',
                    showConfirmButton: false,
                    timer: 2500,
                });
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: data.message || 'Failed to change password.',
                    showConfirmButton: false,
                    timer: 2500,
                });
            }
        } catch (err) {
            console.error('Change Password Error:', err);
            const msg =
                err?.response?.data?.message || 'Internal server error. Please try again.';
            Swal.fire({
                toast: true,
                position: 'top-end',
                icon: 'error',
                title: msg,
                showConfirmButton: false,
                timer: 2500,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 rounded-lg p-6 font-poppins bg-[#F9F9FC] min-h-screen">
            {/* Breadcrumb */}
            <div className="space-y-1 mb-6">
                <h1 className="text-xl font-bold text-gray-900">Change Password</h1>
                <div className="flex items-center gap-x-2 text-sm text-gray-500">
                    <Link to="/" className="text-orange-500">
                        Home
                    </Link>
                    <span>
                        <RiArrowUpSFill className="rotate-90" size={20} />
                    </span>
                    <span>Change Password</span>
                </div>
            </div>

            {/* Card */}
            <div className="max-w-lg mx-auto bg-white rounded-xl shadow-sm p-8 mt-6">
                {/* Icon Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-3">
                        <RiLockPasswordLine size={32} className="text-orange-500" />
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Update Your Password</h2>
                    <p className="text-sm text-gray-500 text-center mt-1">
                        Logged in as <span className="font-medium text-orange-500">{user?.username}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <PasswordField
                        label="Current Password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        show={showCurrent}
                        onToggle={() => setShowCurrent((p) => !p)}
                        onChange={handleChange}
                    />
                    <PasswordField
                        label="New Password"
                        name="newPassword"
                        value={formData.newPassword}
                        show={showNew}
                        onToggle={() => setShowNew((p) => !p)}
                        onChange={handleChange}
                    />
                    <PasswordField
                        label="Confirm New Password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        show={showConfirm}
                        onToggle={() => setShowConfirm((p) => !p)}
                        onChange={handleChange}
                    />

                    {/* Password strength hint */}
                    {formData.newPassword && (
                        <p
                            className={`text-xs ${formData.newPassword.length >= 8 ? 'text-green-600' : 'text-orange-500'
                                }`}
                        >
                            {formData.newPassword.length >= 8
                                ? '✓ Strong password'
                                : `Password strength: ${formData.newPassword.length}/8 characters minimum`}
                        </p>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full rounded-md bg-orange-500 px-6 py-3 text-white font-medium hover:bg-orange-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Updating...
                            </>
                        ) : (
                            'Change Password'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ChangePassword;
