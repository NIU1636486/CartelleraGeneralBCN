const DatePicker = ({ selectedDate, setSelectedDate }) => {
  const handleChange = (e) => {
    setSelectedDate(e.target.value);
  };

  return (
    <input
      type="date"
      value={selectedDate}
      onChange={handleChange}
      className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[140px] cursor-pointer"
    />
  );
};

export default DatePicker;
