import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { Project } from '../hooks/useProjects';
import { Resource } from '../hooks/useResources';

interface EditProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, updates: {
    name?: string;
    description?: string;
    ownerId?: string;
  }) => Promise<any>;
  project: Project | null;
  resources: Resource[];
}

const EditProjectModal: React.FC<EditProjectModalProps> = ({ 
  isOpen, 
  onClose, 
  onUpdate, 
  project,
  resources 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    ownerId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Update form data when project changes
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        description: project.description,
        ownerId: project.ownerId || ''
      });
    }
  }, [project]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Project name is required');
      return;
    }

    if (!project) {
      setError('No project selected for editing');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onUpdate(project.id, {
        name: formData.name,
        description: formData.description,
        ownerId: formData.ownerId || undefined
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
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

  if (!isOpen || !project) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Edit Project</h2>
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
              Project Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="edit-name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter project name"
              required
            />
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="edit-description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="edit-description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              disabled={isSubmitting}
              rows={3}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none"
              placeholder="Enter project description (optional)"
            />
          </div>

          {/* Owner Field */}
          <div>
            <label htmlFor="edit-ownerId" className="block text-sm font-medium text-gray-300 mb-2">
              Project Owner
            </label>
            <select
              id="edit-ownerId"
              name="ownerId"
              value={formData.ownerId}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">No owner assigned</option>
              {resources.map((resource) => (
                <option key={resource.id} value={resource.id}>
                  {resource.name}
                </option>
              ))}
            </select>
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
              disabled={isSubmitting || !formData.name.trim()}
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
                  <span>Save Changes</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProjectModal;