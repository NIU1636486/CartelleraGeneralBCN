// Format date to European format (DD/MM/YYYY)
export const formatDateToEuropean = (dateString) => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// Get today's date in YYYY-MM-DD format for input value
export const getTodayISO = () => {
  return new Date().toISOString().split('T')[0];
};

// Format time to locale
export const formatTime = (date) => {
  return date.toLocaleTimeString('ca-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
};
