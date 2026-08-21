import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import axios from 'axios'
import CryptoJS from 'crypto-js'
import { jwtDecode } from 'jwt-decode'

axios.defaults.baseURL = import.meta.env.VITE_SERVER_URL;

// Global Axios Interceptor to attach Auth token and user headers to every request
axios.interceptors.request.use(
  (config) => {
    try {
      const encryptedToken = localStorage.getItem('authToken');
      const secretKey = import.meta.env.VITE_SECRET_KEY;
      if (encryptedToken && secretKey) {
        const bytes = CryptoJS.AES.decrypt(encryptedToken, secretKey);
        const decrypted = bytes.toString(CryptoJS.enc.Utf8);
        if (decrypted) {
          const parsed = JSON.parse(decrypted);
          const token = parsed?.token;
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            try {
              const decoded = jwtDecode(token);
              if (decoded) {
                if (decoded.username) config.headers['X-Admin-User'] = decoded.username;
                if (decoded.role) config.headers['X-Admin-Role'] = decoded.role;
                if (decoded.category) config.headers['X-Admin-Category'] = decoded.category;
              }
            } catch (_) {}
          }
        }
      }
    } catch (_) {}
    return config;
  },
  (error) => Promise.reject(error)
);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
