import { useRef, useState, useEffect } from 'react';

const DatePicker = ({ selectedDate, setSelectedDate }) => {
  const inputRef = useRef(null);
  const [displayValue, setDisplayValue] = useState('');

  // Format YYYY-MM-DD to DD/MM/YYYY for display
  const formatDateForDisplay = (isoDate) => {
    if (!isoDate) return '';
    const [year, month, day] = isoDate.split('-');
    return `${day}/${month}/${year}`;
  };

  // Update display value when selectedDate changes
  useEffect(() => {
    setDisplayValue(formatDateForDisplay(selectedDate));
  }, [selectedDate]);

  const handleChange = (e) => {
    const value = e.target.value;

    // Allow user to type
    setDisplayValue(value);

    // Try to parse DD/MM/YYYY format
    const match = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) {
      const day = match[1].padStart(2, '0');
      const month = match[2].padStart(2, '0');
      const year = match[3];

      // Validate date
      const date = new Date(`${year}-${month}-${day}`);
      if (!isNaN(date.getTime())) {
        setSelectedDate(`${year}-${month}-${day}`);
      }
    }
  };

  const handleFocus = () => {
    // On focus, show the native date picker by switching to type="date"
    if (inputRef.current) {
      inputRef.current.type = 'date';
      inputRef.current.value = selectedDate;
      inputRef.current.showPicker?.();
    }
  };

  const handleBlur = (e) => {
    // On blur, switch back to text type and format the display
    if (inputRef.current) {
      inputRef.current.type = 'text';
      setDisplayValue(formatDateForDisplay(selectedDate));
    }
  };

  const handleDateChange = (e) => {
    if (e.target.type === 'date') {
      setSelectedDate(e.target.value);
      e.target.type = 'text';
      setDisplayValue(formatDateForDisplay(e.target.value));
    }
  };

  return (
    <input
      ref={inputRef}
      type="text"
      value={displayValue}
      onChange={handleChange}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onInput={handleDateChange}
      placeholder="DD/MM/YYYY"
      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px]"
    />
  );
};

export default DatePicker;
