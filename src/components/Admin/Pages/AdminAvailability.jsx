import React, { useState, useEffect } from 'react';
import api from '../../../config/api';
import { toast ,Toaster} from 'react-hot-toast';
import LoadingSpinner from '../../../components/LoadingSpinner1';
import { ChevronLeft, ChevronRight, X, Check, Calendar as CalendarIcon, AlertTriangle } from 'lucide-react';

// Custom Confirmation Dialog Component
const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Yes", cancelText = "Cancel", isLoading = false }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-gray-700">
          <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0" />
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
        
        {/* Message */}
        <div className="p-6">
          <p className="text-gray-300 text-sm leading-relaxed">{message}</p>
        </div>
        
        {/* Actions */}
        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2 text-gray-400 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Processing...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const AdminAvailability = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [availability, setAvailability] = useState(null);
  const [calendarData, setCalendarData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  
  // Confirmation dialog states
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: null,
    isLoading: false
  });

  // Time slots from 9 AM to 8 PM
  const timeSlots = [
    { display: '09:00 AM', value: '09:00' },
    { display: '10:00 AM', value: '10:00' },
    { display: '11:00 AM', value: '11:00' },
    { display: '12:00 PM', value: '12:00' },
    { display: '01:00 PM', value: '13:00' },
    { display: '02:00 PM', value: '14:00' },
    { display: '03:00 PM', value: '15:00' },
    { display: '04:00 PM', value: '16:00' },
    { display: '05:00 PM', value: '17:00' },
    { display: '06:00 PM', value: '18:00' },
    { display: '07:00 PM', value: '19:00' },
    { display: '08:00 PM', value: '20:00' },
  ];

  useEffect(() => {
    fetchCalendarData();
  }, [currentMonth, currentYear]);

  useEffect(() => {
    if (selectedDate) {
      fetchAvailability();
    }
  }, [selectedDate]);

  const fetchCalendarData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/availability/admin/calendar', {
        params: {
          month: currentMonth + 1,
          year: currentYear,
        },
      });
      setCalendarData(response.data.data.calendar || []);
    } catch (error) {
      console.error('Failed to fetch calendar data:', error);
      toast.error('Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailability = async () => {
    try {
      const dateStr = formatDate(selectedDate);
      const response = await api.get(`/availability/check/${dateStr}`);
      setAvailability(response.data.data);
    } catch (error) {
      console.error('Failed to fetch availability:', error);
      // If no availability found, it means the date is fully available
      setAvailability({
        date: formatDate(selectedDate),
        isFullDayUnavailable: false,
        unavailableSlots: [],
      });
    }
  };

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getSelectedDateDisplay = () => {
    if (!selectedDate) return 'Select a date';
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return selectedDate.toLocaleDateString('en-US', options);
  };

  const closeConfirmDialog = () => {
    if (confirmDialog.isLoading) return; // Prevent closing while loading
    setConfirmDialog({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      isLoading: false
    });
  };

  const showConfirmDialog = (title, message, onConfirm) => {
    setConfirmDialog({
      isOpen: true,
      title,
      message,
      onConfirm,
      isLoading: false
    });
  };

  const executeConfirmAction = async () => {
    if (!confirmDialog.onConfirm) return;
    
    setConfirmDialog(prev => ({ ...prev, isLoading: true }));
    
    try {
      await confirmDialog.onConfirm();
      closeConfirmDialog();
    } catch (error) {
      setConfirmDialog(prev => ({ ...prev, isLoading: false }));
    }
  };

  const toggleFullDay = () => {
    const dateDisplay = getSelectedDateDisplay();
    const isCurrentlyUnavailable = availability?.isFullDayUnavailable;
    
    if (isCurrentlyUnavailable) {
      showConfirmDialog(
        "Make Full Day Available",
        `Are you sure you want to make ${dateDisplay} available for bookings? Customers will be able to book appointments on this day.`,
        async () => {
          const dateStr = formatDate(selectedDate);
          await api.post('/availability/mark-available', { date: dateStr });
          toast.success('Day marked as available');
          fetchAvailability();
          fetchCalendarData();
        }
      );
    } else {
      showConfirmDialog(
        "Make Full Day Unavailable",
        `Are you sure you want to make ${dateDisplay} completely unavailable? This will block all bookings for this entire day and cancel any existing appointments.`,
        async () => {
          const dateStr = formatDate(selectedDate);
          await api.post('/availability/mark-full-day-unavailable', {
            date: dateStr,
            reason: 'Holiday',
          });
          toast.success('Full day marked as unavailable');
          fetchAvailability();
          fetchCalendarData();
        }
      );
    }
  };

  const toggleTimeSlot = (timeValue, timeDisplay) => {
    const dateDisplay = getSelectedDateDisplay();
    const isUnavailable = availability?.unavailableSlots?.some(
      (slot) => slot.time === timeValue
    );

    if (isUnavailable) {
      showConfirmDialog(
        "Make Time Slot Available",
        `Are you sure you want to make ${timeDisplay} on ${dateDisplay} available for bookings? Customers will be able to book appointments during this time.`,
        async () => {
          const dateStr = formatDate(selectedDate);
          await api.post('/availability/mark-available', {
            date: dateStr,
            time: timeValue,
          });
          toast.success('Time slot marked as available');
          fetchAvailability();
          fetchCalendarData();
        }
      );
    } else {
      showConfirmDialog(
        "Make Time Slot Unavailable",
        `Are you sure you want to make ${timeDisplay} on ${dateDisplay} unavailable? This will block new bookings for this time slot.`,
        async () => {
          const dateStr = formatDate(selectedDate);
          await api.post('/availability/mark-slot-unavailable', {
            date: dateStr,
            time: timeValue,
          });
          toast.success('Time slot marked as unavailable');
          fetchAvailability();
          fetchCalendarData();
        }
      );
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  const getDaysInMonth = () => {
    return new Date(currentYear, currentMonth + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    return new Date(currentYear, currentMonth, 1).getDay();
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="h-12 bg-gray-800 border border-gray-700"></div>
      );
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentYear, currentMonth, day);
      const dateStr = formatDate(date);
      const dayData = calendarData.find((d) => d.date === dateStr);
      const isSelected =
        selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentMonth &&
        selectedDate.getFullYear() === currentYear;
      const isToday =
        new Date().getDate() === day &&
        new Date().getMonth() === currentMonth &&
        new Date().getFullYear() === currentYear;
      const isPast = date < new Date().setHours(0, 0, 0, 0);

      let bgColor = 'bg-gray-800 hover:bg-gray-700';
      let textColor = 'text-white';
      let borderColor = 'border-gray-700';

      if (isPast) {
        bgColor = 'bg-gray-900';
        textColor = 'text-gray-600';
      } else if (dayData?.isFullDayUnavailable) {
        bgColor = 'bg-red-900/30 border-red-500';
        textColor = 'text-red-400';
      } else if (dayData?.slotCount > 0) {
        bgColor = 'bg-orange-900/30 border-orange-500';
        textColor = 'text-orange-400';
      }

      if (isSelected) {
        borderColor = 'border-blue-500 border-2';
      }

      if (isToday && !isSelected) {
        borderColor = 'border-green-500';
      }

      days.push(
        <button
          key={day}
          onClick={() => !isPast && setSelectedDate(new Date(currentYear, currentMonth, day))}
          disabled={isPast}
          className={`h-12 border ${bgColor} ${borderColor} ${textColor} flex flex-col items-center justify-center cursor-pointer transition-all ${
            isPast ? 'cursor-not-allowed' : ''
          }`}
        >
          <span className="text-sm font-medium">{day}</span>
          {dayData?.isFullDayUnavailable && (
            <span className="text-xs">🚫</span>
          )}
          {!dayData?.isFullDayUnavailable && dayData?.slotCount > 0 && (
            <span className="text-xs">{dayData.slotCount}⚠️</span>
          )}
        </button>
      );
    }

    return days;
  };

  const getMonthName = () => {
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    return monthNames[currentMonth];
  };

  if (loading && !calendarData.length) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-900 p-6">
        <Toaster position="top-right" />
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg p-6 text-white">
          <div className="flex items-center gap-3">
            <CalendarIcon className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Manage Availability</h1>
              <p className="text-purple-100 mt-1">
                Set unavailable dates and time slots to control bookings
              </p>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <div className="flex flex-wrap gap-4 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 border border-gray-700 rounded"></div>
              <span className="text-gray-400">Available</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-orange-900/30 border border-orange-500 rounded"></div>
              <span className="text-gray-400">Partially Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-900/30 border border-red-500 rounded"></div>
              <span className="text-gray-400">Fully Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 border-2 border-blue-500 rounded"></div>
              <span className="text-gray-400">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-800 border border-green-500 rounded"></div>
              <span className="text-gray-400">Today</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Calendar Panel */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            {/* Month Navigation */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={handlePrevMonth}
                disabled={loading}
                className="p-2 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ChevronLeft className="w-5 h-5" />
                )}
              </button>
              <h2 className="text-xl font-semibold text-white">
                {getMonthName()} {currentYear}
              </h2>
              <button
                onClick={handleNextMonth}
                disabled={loading}
                className="p-2 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors text-white"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <ChevronRight className="w-5 h-5" />
                )}
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div
                  key={day}
                  className="h-10 flex items-center justify-center text-gray-400 text-sm font-medium"
                >
                  {day}
                </div>
              ))}
              {/* Calendar days */}
              {renderCalendar()}
            </div>

            {loading && (
              <div className="flex items-center justify-center mt-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  Loading calendar...
                </div>
              </div>
            )}
          </div>

          {/* Details Panel */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 space-y-6">
            {/* Selected Date */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-2">Selected Date</h3>
              <p className="text-gray-400">{getSelectedDateDisplay()}</p>
            </div>

            {/* Full Day Toggle */}
            <div>
              <button
                onClick={toggleFullDay}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                  availability?.isFullDayUnavailable
                    ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white'
                    : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white'
                }`}
              >
                {availability?.isFullDayUnavailable ? (
                  <>
                    <Check className="w-5 h-5" />
                    Mark Full Day as Available
                  </>
                ) : (
                  <>
                    <X className="w-5 h-5" />
                    Mark Full Day as Unavailable (Holiday)
                  </>
                )}
              </button>
            </div>

            {/* Time Slots */}
            {!availability?.isFullDayUnavailable && (
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Time Slots</h4>
                <div className="grid grid-cols-2 gap-3">
                  {timeSlots.map((slot) => {
                    const isUnavailable = availability?.unavailableSlots?.some(
                      (s) => s.time === slot.value
                    );
                    return (
                      <button
                        key={slot.value}
                        onClick={() => toggleTimeSlot(slot.value, slot.display)}
                        className={`py-2 px-3 rounded-lg font-medium transition-all text-sm flex items-center justify-center gap-2 ${
                          isUnavailable
                            ? 'bg-red-500 hover:bg-red-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-white border border-gray-600'
                        }`}
                      >
                        {slot.display}
                        {isUnavailable && <X className="w-4 h-4" />}
                      </button>
                    );
                  })}
                </div>
                <p className="text-gray-400 text-xs mt-4">
                  Click on a time slot to toggle its availability. Red slots are unavailable for booking.
                </p>
              </div>
            )}

            {availability?.isFullDayUnavailable && (
              <div className="bg-red-900/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-400 text-center">
                  This entire day is marked as unavailable. No bookings can be made.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={closeConfirmDialog}
        onConfirm={executeConfirmAction}
        title={confirmDialog.title}
        message={confirmDialog.message}
        confirmText="Yes, Continue"
        cancelText="Cancel"
        isLoading={confirmDialog.isLoading}
      />
    </div>
  );
};

export default AdminAvailability;
