import { useState } from 'react';
import { Coordinates } from '../types/weather';

interface RouteInputProps {
  onCalculateRoute: (start: string, end: string, pickupDate: string, deliveryDate: string) => void;
  loading: boolean;
}

export const RouteInput = ({ onCalculateRoute, loading }: RouteInputProps) => {
  const [startAddress, setStartAddress] = useState('');
  const [endAddress, setEndAddress] = useState('');
  
  // Set default dates: pickup = today, delivery = tomorrow
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  const [pickupDate, setPickupDate] = useState(formatDateForInput(today));
  const [deliveryDate, setDeliveryDate] = useState(formatDateForInput(tomorrow));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (startAddress.trim() && endAddress.trim() && pickupDate && deliveryDate) {
      // Validate dates
      const pickup = new Date(pickupDate);
      const delivery = new Date(deliveryDate);
      
      if (delivery < pickup) {
        alert('Delivery date must be after pickup date');
        return;
      }
      
      onCalculateRoute(startAddress.trim(), endAddress.trim(), pickupDate, deliveryDate);
    }
  };

  return (
    <div className="bg-white/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-gray-100 relative overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/50 to-purple-100/50 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-indigo-100/50 to-blue-100/50 rounded-full -ml-24 -mb-24"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-full shadow-lg"></div>
          <h2 className="text-2xl font-bold text-gray-800">Route Information</h2>
        </div>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="start" className="block text-sm font-semibold text-gray-700 mb-2">
            Origin
          </label>
          <input
            id="start"
            type="text"
            value={startAddress}
            onChange={(e) => setStartAddress(e.target.value)}
            placeholder="e.g., New York, NY"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
            disabled={loading}
          />
        </div>
        <div>
          <label htmlFor="end" className="block text-sm font-semibold text-gray-700 mb-2">
            Destination
          </label>
          <input
            id="end"
            type="text"
            value={endAddress}
            onChange={(e) => setEndAddress(e.target.value)}
            placeholder="e.g., Los Angeles, CA"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 placeholder-gray-400 disabled:bg-gray-50 disabled:cursor-not-allowed"
            disabled={loading}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="pickupDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Pick Up Date
            </label>
            <input
              id="pickupDate"
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={formatDateForInput(today)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 disabled:bg-gray-50 disabled:cursor-not-allowed"
              disabled={loading}
            />
          </div>
          <div>
            <label htmlFor="deliveryDate" className="block text-sm font-semibold text-gray-700 mb-2">
              Delivery Date
            </label>
            <input
              id="deliveryDate"
              type="date"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              min={pickupDate}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 text-gray-800 disabled:bg-gray-50 disabled:cursor-not-allowed"
              disabled={loading}
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading || !startAddress.trim() || !endAddress.trim()}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 px-6 rounded-xl font-semibold shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-300 focus:ring-offset-2 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:shadow-none transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Calculating Route...
            </span>
          ) : (
            'Get Weather Route'
          )}
        </button>
      </form>
      </div>
    </div>
  );
};

