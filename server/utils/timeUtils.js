
export const formatToIST = (date) => {
    if (!date) return null;
    
    return new Date(date).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        hour12: true,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
    });
};

// Returns YYYY-MM-DD in the configured timezone (defaults to Asia/Kolkata)
export const getTodayDateString = (timeZone = process.env.APP_TIMEZONE || "Asia/Kolkata") => {
    const formatter = new Intl.DateTimeFormat("en-CA", {
        timeZone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit"
    });

    return formatter.format(new Date());
};