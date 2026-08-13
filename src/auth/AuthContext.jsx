import React, { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import CryptoJS from 'crypto-js';
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import Swal from 'sweetalert2';

const AuthContext = createContext();
const SECRET_KEY = import.meta.env.VITE_SECRET_KEY;
const ACCESS_KEY = import.meta.env.VITE_ACCESS_KEY;

const getUserFromToken = (token) => {
    try {
        const decoded = jwtDecode(token);
        return decoded;
    } catch (error) {
        console.error('Token Decode Error:', error);
        return null;
    }
};

export const AuthProvider = ({ children }) => {


    const [user, setUser] = useState(() => {
        try {
            const token = localStorage.getItem('authToken');
            if (!token) return null;

            const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
            const decryptedToken = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedToken) return null; // decryption failed or wrong key

            const parsed = JSON.parse(decryptedToken);
            return getUserFromToken(parsed?.token);
        } catch (err) {
            console.error("Error reading stored user:", err);
            return null;
        }
    });


    const navigate = useNavigate();

    // Encrypt token
    const storeToken = (tokenObj) => {
        const encryptedData = CryptoJS.AES.encrypt(
            JSON.stringify(tokenObj),
            SECRET_KEY
        ).toString();
        localStorage.setItem('authToken', encryptedData);
    };

    const storePermissions = (permissions) => {
        const encryptedPermission = CryptoJS.AES
            .encrypt(JSON.stringify(permissions), ACCESS_KEY)
            .toString();
        localStorage.setItem('usersAccess', encryptedPermission);
    };

    const getPermissions = () => {
        try {
            const encrypted = localStorage.getItem('usersAccess');
            if (!encrypted) return null;

            const decrypted = CryptoJS.AES.decrypt(encrypted, ACCESS_KEY)
                .toString(CryptoJS.enc.Utf8);

            if (!decrypted) return null;

            return JSON.parse(decrypted);
        } catch (err) {
            console.error("Error decrypting permissions:", err);
            return null;
        }
    };

    const getToken = () => {
        try {
            const encryptedData = localStorage.getItem('authToken');
            if (!encryptedData) return null;

            const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedData) return null;

            const parsed = JSON.parse(decryptedData);
            return parsed?.token || null;
        } catch (err) {
            console.error("Error decrypting token:", err);
            return null;
        }
    };

    const getLocationId = () => {
        try {
            const encryptedData = localStorage.getItem('authToken');
            if (!encryptedData) return null;

            const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
            const decryptedData = bytes.toString(CryptoJS.enc.Utf8);

            if (!decryptedData) return null;

            const parsed = JSON.parse(decryptedData);
            return parsed?.user_location_id || null;
        } catch (err) {
            console.error("Error decrypting token:", err);
            return null;
        }
    };


    const checkTokenExpiration = () => {
        const token = getToken();
        if (token) {
            const decoded = getUserFromToken(token);
            if (decoded && decoded.exp * 1000 < Date.now()) {
                logout();
            } else {
                setUser(decoded);
            }
        }
    };

    const login = async (username, password, category) => {
        try {
            const { data } = await axios.post("/admin/login", { username, password, category });
            console.log(data)
            if (data.status) {
                const token = { token: data.token, user_location_id: data?.user.location_id || null };
                storeToken(token);
                storePermissions(data.permissions);
                setUser(getUserFromToken(data.token));
                navigate('/');
            }
        } catch (error) {
            if (error.response) {
                const errorMessage = error.response.data.message;
                Swal.fire({
                    toast: true,
                    position: 'top-end',
                    icon: 'error',
                    title: errorMessage,
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                });
            } else {
                console.error('Login Error:', error);
            }
            console.error('Login Error:', error);
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        localStorage.removeItem('usersAccess');
        setUser(null);
        navigate('/login');
    };

    useEffect(() => {
        checkTokenExpiration();
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, getToken, getPermissions, getLocationId }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
