import React, { useState } from 'react';
import { X, Plus, Loader2, Calendar } from 'lucide-react';

interface AddCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (year: number, month: number) => Promise<any>;
  existingCalendars: Array<{ year: number; month: number }>;
}

const AddCalendarModal: React.FC<AddCalendarModalProps> = ({ isOpen, onClose, onAdd, existingCalendars }) => {
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: parseInt(value)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check if calendar already exists
    const exists = existingCalendars.some(cal => 
      cal.year === formData.year && cal.month === formData.month
    );
    
    if (exists) {
      setError(`Calendar for ${months[formData.month - 1]} ${formData.year} already exists`);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAdd(formData.year, formData.month);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create calendar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        year: currentDate.getFullYear(),
        month: currentDate.getMonth() + 1
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Add Month Calendar</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Year Field */}
          <div>
            <label htmlFor="year" className="block text-sm font-medium text-gray-300 mb-2">
              Year
            </label>
            <select
              id="year"
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {Array.from({ length: 10 }, (_, i) => {
                const year = currentDate.getFullYear() - 2 + i;
                return (
                  <option key={year} value={year}>
                    {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Month Field */}
          <div>
            <label htmlFor="month" className="block text-sm font-medium text-gray-300 mb-2">
              Month
            </label>
            <select
              id="month"
              name="month"
              value={formData.month}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {months.map((month, index) => (
                <option key={index + 1} value={index + 1}>
                  {month}
                </option>
              ))}
            </select>
          </div>

          {/* Preview */}
          <div className="bg-gray-700/30 rounded-lg p-4">
            <div className="flex items-center space-x-2 text-gray-300">
              <Calendar className="w-4 h-4" />
              <span className="text-sm">
                Creating calendar for: <strong>{months[formData.month - 1]} {formData.year}</strong>
              </span>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>OK</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCalendarModal;