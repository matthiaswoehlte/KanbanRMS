import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Clock } from 'lucide-react';
import { Shift } from '../hooks/useShifts';

interface EditShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: Partial<Omit<Shift, 'id' | 'createdDate'>>) => Promise<Shift>;
  shift: Shift | null;
}

const EditShiftModal: React.FC<EditShiftModalProps> = ({ isOpen, onClose, onUpdate, shift }) => {
  const [formData, setFormData] = useState({
    name: '',
    shortName: '',
    startTime: '09:00',
    endTime: '17:00',
    isFullDay: false,
    type: 'presence' as 'presence' | 'absence',
    color: '#10b981'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when shift changes
  useEffect(() => {
    if (shift) {
      setFormData({
        name: shift.name ?? '',
        shortName: shift.shortName ?? '',
        startTime: shift.startTime,
        endTime: shift.endTime,
        isFullDay: shift.isFullDay,
        type: shift.type,
        color: shift.color
      });
    }
  }, [shift]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type, checked } = e.target as HTMLInputElement;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Auto-set times for full day
    if (name === 'isFullDay' && checked) {
      setFormData(prev => ({
        ...prev,
        isFullDay: true,
        startTime: '00:00',
        endTime: '23:59'
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name?.trim()) {
      setError('Shift name is required');
      return;
    }

    if (!formData.shortName?.trim()) {
      setError('Short name is required');
      return;
    }

    if (!formData.isFullDay && formData.startTime >= formData.endTime) {
      setError('End time must be after start time');
      return;
    }

    if (!shift) {
      setError('No shift selected for editing');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onUpdate(shift.id, formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shift');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      onClose();
    }
  };

  if (!isOpen || !shift) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Edit Shift</h2>
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

          {/* Short Name Field */}
          <div>
            <label htmlFor="edit-shortName" className="block text-sm font-medium text-gray-300 mb-2">
              Short Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="edit-shortName"
              name="shortName"
              value={formData.shortName}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter short name"
              required
            />
          </div>

          {/* Name Field */}
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-300 mb-2">
              Shift Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter shift name"
              required
            />
          </div>

          {/* Full Day Checkbox */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="edit-isFullDay"
              name="isFullDay"
              checked={formData.isFullDay}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label htmlFor="edit-isFullDay" className="text-sm font-medium text-gray-300">
              Full Day (00:00 - 23:59)
            </label>
          </div>

          {/* Time Fields */}
          {!formData.isFullDay && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="edit-startTime" className="block text-sm font-medium text-gray-300 mb-2">
                  Start Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="time"
                    id="edit-startTime"
                    name="startTime"
                    value={formData.startTime}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="edit-endTime" className="block text-sm font-medium text-gray-300 mb-2">
                  End Time
                </label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="time"
                    id="edit-endTime"
                    name="endTime"
                    value={formData.endTime}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Type Field */}
          <div>
            <label htmlFor="edit-type" className="block text-sm font-medium text-gray-300 mb-2">
              Type
            </label>
            <select
              id="edit-type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="presence">Presence (Availability)</option>
              <option value="absence">Absence (Unavailability)</option>
            </select>
          </div>

          {/* Color Field */}
          <div>
            <label htmlFor="edit-color" className="block text-sm font-medium text-gray-300 mb-2">
              Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                id="edit-color"
                name="color"
                value={formData.color}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-12 h-10 bg-gray-700 border border-gray-600 rounded-lg cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              />
              <input
                type="text"
                value={formData.color}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed font-mono text-sm"
                placeholder="#000000"
                pattern="^#[0-9A-Fa-f]{6}$"
              />
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
              disabled={isSubmitting || !formData.name?.trim() || !formData.shortName?.trim()}
              className="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
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

export default EditShiftModal;