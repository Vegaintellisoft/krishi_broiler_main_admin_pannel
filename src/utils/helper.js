// utils/dateFormatter.js
export const formatDateTime = (dateString) => {
    if (!dateString) return '-';
    try {
        const date = new Date(dateString);
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