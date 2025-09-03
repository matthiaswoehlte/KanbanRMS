import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';

interface EditDepartmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: { name?: string; supervisor?: string }) => Promise<any>;
  department: any;
}

const EditDepartmentModal: React.FC<EditDepartmentModalProps> = ({ isOpen, onClose, onUpdate, department }) => {
  const [formData, setFormData] = useState({
    name: '',
    supervisor: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when department changes
  useEffect(() => {
    if (department) {
      setFormData({
        name: department.name,
        supervisor: department.supervisor
      });
    }
  }, [department]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Department name is required');
      return;
    }

    if (!formData.supervisor.trim()) {
      setError('Supervisor name is required');
      return;
    }

    if (!department) {
      setError('No department selected for editing');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onUpdate(department.id, formData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update department');
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

  if (!isOpen || !department) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Edit Department</h2>
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

          {/* Name Field */}
          <div>
            <label htmlFor="edit-name" className="block text-sm font-medium text-gray-300 mb-2">
              Department Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter department name"
              required
            />
          </div>

          {/* Supervisor Field */}
          <div>
            <label htmlFor="edit-supervisor" className="block text-sm font-medium text-gray-300 mb-2">
              Supervisor <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="edit-supervisor"
              name="supervisor"
              value={formData.supervisor}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter supervisor name"
              required
            />
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
              disabled={isSubmitting || !formData.name.trim() || !formData.supervisor.trim()}
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

export default EditDepartmentModal;