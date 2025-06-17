import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface DatePickerProps {
  pickupDate: string;
  dropDate: string;
  onPickupDateChange: (date: string) => void;
  onDropDateChange: (date: string) => void;
}

export const DatePicker: React.FC<DatePickerProps> = ({
  pickupDate,
  dropDate,
  onPickupDateChange,
  onDropDateChange
}) => {
  const today = new Date().toISOString().split('T')[0];
  
  // Generate time slots in 30-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });
        slots.push({ value: timeString, display: displayTime });
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();
  
  const calculateDuration = () => {
    if (pickupDate && dropDate) {
      const pickup = new Date(pickupDate);
      const drop = new Date(dropDate);
      const diffTime = drop.getTime() - pickup.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      const diffHours = Math.floor((diffTime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const diffMinutes = Math.floor((diffTime % (1000 * 60 * 60)) / (1000 * 60));
      
      if (diffTime > 0) {
        let duration = '';
        if (diffDays > 0) duration += `${diffDays} day${diffDays !== 1 ? 's' : ''}`;
        if (diffHours > 0) duration += `${duration ? ', ' : ''}${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
        if (diffMinutes > 0) duration += `${duration ? ', ' : ''}${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
        return duration || '0 minutes';
      }
    }
    return null;
  };

  const parseDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return { date: '', time: '09:00' };
    const [date, time] = dateTimeString.split('T');
    return { date: date || '', time: time?.slice(0, 5) || '09:00' };
  };

  const combineDateTime = (date: string, time: string) => {
    if (!date || !time) return '';
    return `${date}T${time}`;
  };

  const pickupDateTime = parseDateTime(pickupDate);
  const dropDateTime = parseDateTime(dropDate);

  const handlePickupDateChange = (date: string) => {
    onPickupDateChange(combineDateTime(date, pickupDateTime.time));
  };

  const handlePickupTimeChange = (time: string) => {
    onPickupDateChange(combineDateTime(pickupDateTime.date, time));
  };

  const handleDropDateChange = (date: string) => {
    onDropDateChange(combineDateTime(date, dropDateTime.time));
  };

  const handleDropTimeChange = (time: string) => {
    onDropDateChange(combineDateTime(dropDateTime.date, time));
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
        <Calendar className="w-5 h-5 mr-2 text-blue-600" />
        Select Dates & Times
      </h3>
      
      <div className="space-y-6">
        {/* Pickup Date & Time */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Pickup Date
            </label>
            <input
              type="date"
              value={pickupDateTime.date}
              onChange={(e) => handlePickupDateChange(e.target.value)}
              min={today}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Pickup Time
            </label>
            <select
              value={pickupDateTime.time}
              onChange={(e) => handlePickupTimeChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.display}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Drop Date & Time */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              Drop Date
            </label>
            <input
              type="date"
              value={dropDateTime.date}
              onChange={(e) => handleDropDateChange(e.target.value)}
              min={pickupDateTime.date || today}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Drop Time
            </label>
            <select
              value={dropDateTime.time}
              onChange={(e) => handleDropTimeChange(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.display}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      
      {calculateDuration() && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-blue-900 font-medium">Total Duration:</span>
            <span className="text-blue-900 font-bold">{calculateDuration()}</span>
          </div>
          {pickupDate && dropDate && (
            <div className="mt-2 text-sm text-blue-700">
              <div>Pickup: {new Date(pickupDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} at {new Date(pickupDate).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
              })}</div>
              <div>Drop: {new Date(dropDate).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} at {new Date(dropDate).toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit', 
                hour12: true 
              })}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};