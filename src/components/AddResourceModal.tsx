import React, { useState } from 'react';
import { X, Plus, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { createThumbnail, calculateImageSize } from '../utils/imageUtils';

interface AddResourceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (resource: {
    name: string;
    picture: string;
    thumbnail: string;
    resourceTypeId: string;
    resourceStatusId: string;
    departmentId?: string;
  }) => Promise<any>;
  resourceTypes: Array<{ id: string; type: string; color: string }>;
  resourceStatuses: Array<{ id: string; name: string; color: string }>;
  departments: Array<{ id: string; name: string }>;
}

const AddResourceModal: React.FC<AddResourceModalProps> = ({ 
  isOpen, 
  onClose, 
  onAdd, 
  resourceTypes, 
  resourceStatuses,
  departments
}) => {
  const [formData, setFormData] = useState({
    name: '',
    picture: '',
    thumbnail: '',
    resourceTypeId: '',
    resourceStatusId: '',
    departmentId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Reset department when resource type changes
    if (name === 'resourceTypeId') {
      setFormData(prev => ({
        ...prev,
        resourceTypeId: value,
        departmentId: ''
      }));
    }
  };

  const handleImagePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.type.indexOf('image') !== -1) {
        const file = item.getAsFile();
        if (file) {
          const reader = new FileReader();
          reader.onload = async (event) => {
            const result = event.target?.result as string;
            const img = new Image();
            img.onload = async () => {
              const size = calculateImageSize(img.width, img.height, 300, 300);
              setImageSize(size);
              
              try {
                const thumbnail = await createThumbnail(result);
                setFormData(prev => ({ ...prev, picture: result, thumbnail }));
              } catch (error) {
                console.error('Failed to create thumbnail:', error);
                setFormData(prev => ({ ...prev, picture: result, thumbnail: '' }));
              }
            };
            img.src = result;
          };
          reader.readAsDataURL(file);
        }
        break;
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const result = event.target?.result as string;
        const img = new Image();
        img.onload = async () => {
          const size = calculateImageSize(img.width, img.height, 300, 300);
          setImageSize(size);
          
          try {
            const thumbnail = await createThumbnail(result);
            setFormData(prev => ({ ...prev, picture: result, thumbnail }));
          } catch (error) {
            console.error('Failed to create thumbnail:', error);
            setFormData(prev => ({ ...prev, picture: result, thumbnail: '' }));
          }
        };
        img.src = result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { value } = e.target;
    
    if (value && value.trim()) {
      const img = new Image();
      img.onload = async () => {
        const size = calculateImageSize(img.width, img.height, 300, 300);
        setImageSize(size);
        
        try {
          const thumbnail = await createThumbnail(value);
          setFormData(prev => ({ ...prev, picture: value, thumbnail }));
        } catch (error) {
          console.error('Failed to create thumbnail:', error);
          setFormData(prev => ({ ...prev, picture: value, thumbnail: '' }));
        }
      };
      img.onerror = () => {
        console.error('Failed to load image from URL');
        setFormData(prev => ({ ...prev, picture: value, thumbnail: '' }));
      };
      img.src = value;
    } else if (!value) {
      setFormData(prev => ({ ...prev, picture: value, thumbnail: '' }));
      setImageSize({ width: 0, height: 0 });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      setError('Resource name is required');
      return;
    }

    if (!formData.resourceTypeId) {
      setError('Resource type is required');
      return;
    }

    if (!formData.resourceStatusId) {
      setError('Resource status is required');
      return;
    }

    // Check if department is required for staff resources
    const selectedResourceType = resourceTypes.find(rt => rt.id === formData.resourceTypeId);
    if (selectedResourceType?.isStaff && !formData.departmentId) {
      setError('Department is required for staff resources');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const resourceData = {
        name: formData.name,
        picture: formData.picture,
        thumbnail: formData.thumbnail,
        resourceTypeId: formData.resourceTypeId,
        resourceStatusId: formData.resourceStatusId,
        ...(formData.departmentId && { departmentId: formData.departmentId })
      };
      await onAdd(resourceData);
      // Reset form and close modal on success
      setFormData({
        name: '',
        picture: '',
        thumbnail: '',
        resourceTypeId: '',
        resourceStatusId: '',
        departmentId: ''
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        name: '',
        picture: '',
        thumbnail: '',
        resourceTypeId: '',
        resourceStatusId: '',
        departmentId: ''
      });
      setImageSize({ width: 0, height: 0 });
      setError(null);
      onClose();
    }
  };

  if (!isOpen) return null;

  // Check if selected resource type is staff
  const selectedResourceType = resourceTypes.find(rt => rt.id === formData.resourceTypeId);
  const isStaffResource = selectedResourceType?.isStaff || false;
  
  // Calculate column widths based on image size
  const imageWidth = formData.picture ? Math.max(imageSize.width, 200) : 200;
  const spacing = 24; // 1.5rem gap
  const fieldsWidth = `calc(100% - ${imageWidth + spacing}px)`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold text-white">Add Resource</h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-900/20 border border-red-500 rounded-lg p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Two Column Layout */}
          <div className="flex flex-col lg:flex-row gap-6 mb-6">
            {/* Left Column */}
            <div style={{ width: formData.picture ? fieldsWidth : '50%' }}>
              {/* Name Field */}
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Resource Name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="Enter resource name"
                  required
                />
              </div>

              {/* Resource Type Field */}
              <div className="mb-6">
                <label htmlFor="resourceTypeId" className="block text-sm font-medium text-gray-300 mb-2">
                  Resource Type <span className="text-red-400">*</span>
                </label>
                <select
                  id="resourceTypeId"
                  name="resourceTypeId"
                  value={formData.resourceTypeId}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select resource type</option>
                  {resourceTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Resource Status Field */}
              <div className="mb-6">
                <label htmlFor="resourceStatusId" className="block text-sm font-medium text-gray-300 mb-2">
                  Resource Status <span className="text-red-400">*</span>
                </label>
                <select
                  id="resourceStatusId"
                  name="resourceStatusId"
                  value={formData.resourceStatusId}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  required
                >
                  <option value="">Select resource status</option>
                  {resourceStatuses.map((status) => (
                    <option key={status.id} value={status.id}>
                      {status.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Department Field - Only for Staff Resources */}
              {isStaffResource && (
                <div>
                  <label htmlFor="departmentId" className="block text-sm font-medium text-gray-300 mb-2">
                    Department <span className="text-red-400">*</span>
                  </label>
                  <select
                    id="departmentId"
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleInputChange}
                    disabled={isSubmitting}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Right Column - Picture */}
            <div style={{ width: formData.picture ? `${imageWidth}px` : '50%', minWidth: '200px' }}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Picture
              </label>
              <div className="space-y-3">
                {/* Image Preview */}
                {formData.picture && (
                  <div className="relative flex justify-center">
                    <img 
                      src={formData.picture} 
                      alt="Preview" 
                     className="object-contain rounded-lg border border-gray-600"
                     style={{ 
                       width: `${imageSize.width || 300}px`, 
                       height: `${imageSize.height || 300}px`,
                       maxWidth: '300px',
                       maxHeight: '300px'
                     }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, picture: '', thumbnail: '' }));
                        setImageSize({ width: 0, height: 0 });
                      }}
                      className="absolute top-2 right-2 p-1 bg-red-600 hover:bg-red-700 rounded-full transition-colors"
                    >
                      <X className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}
                
                {/* Upload Options */}
                <div className="flex space-x-2">
                  <label className="flex-1 flex items-center justify-center px-4 py-2 bg-gray-700 hover:bg-gray-600 border border-gray-600 rounded-lg cursor-pointer transition-colors">
                    <Upload className="w-4 h-4 mr-2" />
                    <span className="text-sm text-gray-300">Upload File</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      disabled={isSubmitting}
                      className="hidden"
                    />
                  </label>
                </div>
                
                {/* Paste Area */}
                <textarea
                  placeholder="Paste image here (Ctrl+V) or enter image URL"
                  value={formData.picture.startsWith('data:') ? '' : formData.picture}
                  onChange={handleImageUrlChange}
                  onPaste={handleImagePaste}
                  disabled={isSubmitting}
                  rows={3}
                  className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed resize-none text-sm"
                />
              </div>
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
              disabled={isSubmitting || !formData.name.trim() || !formData.resourceTypeId || !formData.resourceStatusId || (isStaffResource && !formData.departmentId)}
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

export default AddResourceModal;