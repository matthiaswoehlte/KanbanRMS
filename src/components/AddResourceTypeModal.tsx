import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';

interface AddResourceTypeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (resourceType: { type: string; color: string; isStaff: boolean }) => Promise<any>;
}

const AddResourceTypeModal: React.FC<AddResourceTypeModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState({
    type: '',
    color: '#10b981',
    isStaff: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.type.trim()) {
      setError('Resource type is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onAdd(formData);
      // Reset form and close modal on success
      setFormData({
        type: '',
        color: '#10b981',
        isStaff: false
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add resource type');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        type: '',
        color: '#10b981',
        isStaff: false
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
          <h2 className="text-xl font-semibold text-white">Add Resource Type</h2>
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

          {/* Type Field */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-300 mb-2">
              Resource Type <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter resource type name"
              required
            />
          </div>

          {/* Color Field */}
          <div>
            <label htmlFor="color" className="block text-sm font-medium text-gray-300 mb-2">
              Color
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="color"
                id="color"
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

          {/* Staff Checkbox */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="isStaff"
              name="isStaff"
              checked={formData.isStaff}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <label htmlFor="isStaff" className="text-sm font-medium text-gray-300">
              This is a staff resource type
            </label>
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
              disabled={isSubmitting || !formData.type.trim()}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Adding...</span>
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

export default AddResourceTypeModal;