import React, { useState, useEffect } from 'react';
import { X, Save, Loader2, Plus } from 'lucide-react';
import { Lane } from '../hooks/useKanban';

interface LaneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (laneData: {
    name: string;
    position?: number;
  }) => Promise<any>;
  lane: (Lane & { isNew?: boolean }) | null;
  existingLanes: Lane[];
}

const LaneModal: React.FC<LaneModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  lane,
  existingLanes 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    position: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when lane changes
  useEffect(() => {
    if (lane) {
      setFormData({
        name: lane.name || '',
        position: lane.isNew ? '' : lane.position.toString()
      });
    }
  }, [lane]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Lane name is required');
      return;
    }

    // Check for duplicate names (excluding current lane if editing)
    const duplicateName = existingLanes.some(existingLane => 
      existingLane.name.toLowerCase() === formData.name.toLowerCase() && 
      existingLane.id !== lane?.id
    );

    if (duplicateName) {
      setError('A lane with this name already exists');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const submitData: any = {
        name: formData.name
      };

      if (lane?.isNew && formData.position) {
        submitData.position = parseInt(formData.position);
      }

      await onSubmit(submitData);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save lane');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        position: ''
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen || !lane) return null;

  const positionOptions = Array.from({ length: existingLanes.length + 1 }, (_, i) => i + 1);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">
            {lane.isNew ? 'Add Lane' : 'Edit Lane'}
          </h2>
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
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Lane Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter lane name"
              required
            />
          </div>

          {/* Position Field - Only for new lanes */}
          {lane.isNew && (
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-300 mb-2">
                Position
              </label>
              <select
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Add to end</option>
                {positionOptions.map((pos) => (
                  <option key={pos} value={pos}>
                    Position {pos}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-400 mt-1">
                Leave empty to add at the end
              </p>
            </div>
          )}

          {/* Lane deletion warning */}
          {!lane.isNew && !lane.isDeletable && (
            <div className="bg-yellow-900/20 border border-yellow-500 rounded-lg p-3">
              <p className="text-yellow-400 text-sm">
                This is the first lane and cannot be deleted. It serves as the default lane for task migration.
              </p>
            </div>
          )}

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
              disabled={isSubmitting || !formData.name.trim()}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  {lane.isNew ? <Plus className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  <span>{lane.isNew ? 'Add Lane' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LaneModal;