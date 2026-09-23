// utils/dateFormatter.js
export const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
        let date;
        if (typeof dateString === 'string') {
            const s = dateString.trim();
            // If string is in SQL format "YYYY-MM-DD HH:mm:ss..." without timezone offset, append 'Z' so it is treated as UTC
            if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}:\d{2}/.test(s) && !s.endsWith('Z') && !/[+-]\d{2}(:\d{2})?$/.test(s)) {
                date = new Date(s.replace(' ', 'T') + 'Z');
            } else {
                date = new Date(s);
            }
        } else {
            date = new Date(dateString);
        }

        if (isNaN(date.getTime())) return String(dateString);

        // Format in Indian Standard Time (IST - Asia/Kolkata)
        const options = {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };

        const formatter = new Intl.DateTimeFormat('en-GB', options);
        const parts = formatter.formatToParts(date);

        let day = '', month = '', year = '', hour = '', minute = '', dayPeriod = '';
        for (const p of parts) {
            if (p.type === 'day') day = p.value;
            if (p.type === 'month') month = p.value;
            if (p.type === 'year') year = p.value;
            if (p.type === 'hour') hour = p.value;
            if (p.type === 'minute') minute = p.value;
            if (p.type === 'dayPeriod') dayPeriod = p.value.toUpperCase();
        }

        return `${day}-${month}-${year} ${hour}:${minute} ${dayPeriod}`;
    } catch (_) {
        return String(dateString);
    }
};

export const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
        if (typeof dateString === 'string') {
            const s = dateString.trim();
            // If already YYYY-MM-DD, direct format to DD-MM-YYYY
            const ymdMatch = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
            if (ymdMatch) {
                return `${ymdMatch[3]}-${ymdMatch[2]}-${ymdMatch[1]}`;
            }
            // If already DD-MM-YYYY
            const dmyMatch = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
            if (dmyMatch) {
                return s;
            }
        }

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return String(dateString);

        const options = {
            timeZone: 'Asia/Kolkata',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        };

        const formatter = new Intl.DateTimeFormat('en-GB', options);
        const parts = formatter.formatToParts(date);

        let day = '', month = '', year = '';
        for (const p of parts) {
            if (p.type === 'day') day = p.value;
            if (p.type === 'month') month = p.value;
            if (p.type === 'year') year = p.value;
        }

        return `${day}-${month}-${year}`;
    } catch (_) {
        return String(dateString);
    }
};

/**
 * Safely converts any date object or date string into YYYY-MM-DD string
 * in Asia/Kolkata timezone for <input type="date" /> fields.
 */
export const toDateInputString = (input) => {
    if (!input) {
        const now = new Date();
        const y = now.getFullYear();
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const d = String(now.getDate()).padStart(2, '0');
        return `${y}-${m}-${d}`;
    }
    if (typeof input === 'string') {
        const s = input.trim();
        // If YYYY-MM-DD
        if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
        // If DD-MM-YYYY
        const dmyMatch = s.match(/^(\d{2})-(\d{2})-(\d{4})$/);
        if (dmyMatch) return `${dmyMatch[3]}-${dmyMatch[2]}-${dmyMatch[1]}`;
    }
    try {
        const date = new Date(input);
        if (isNaN(date.getTime())) return '';
        const formatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: 'Asia/Kolkata',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
        return formatter.format(date); // en-CA outputs YYYY-MM-DD
    } catch (_) {
        return '';
    }
};