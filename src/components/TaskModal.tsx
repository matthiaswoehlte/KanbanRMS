import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Loader2, User, Palette, Package } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { Task, Lane } from '../hooks/useKanban';
import { Resource } from '../hooks/useResources';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (taskData: {
    title: string;
    description: string;
    laneId: string;
    resourceId?: string;
  }) => Promise<any>;
  task: (Task & { isNew?: boolean }) | null;
  lanes: Lane[];
  resources: Resource[];
}

const TaskModal: React.FC<TaskModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  task, 
  lanes,
  resources 
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    laneId: '',
    resourceId: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  
  const editorRef = useRef<HTMLDivElement>(null);

  // Filter resources to only show staff resources
  const staffResources = resources.filter(resource => resource.resourceTypeIsStaff);

  // Update form data when task changes
  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        laneId: task.laneId || '',
        resourceId: task.resourceId || ''
      });
      
      // Set editor content
      if (editorRef.current) {
        editorRef.current.innerHTML = task.description || '';
      }
      
      // Set selected resource
      const resource = staffResources.find(r => r.id === task.resourceId);
      setSelectedResource(resource || null);
    }
  }, [task]);

  // Update selected resource when staffResources change or resourceId changes
  useEffect(() => {
    const resource = staffResources.find(r => r.id === formData.resourceId);
    setSelectedResource(resource || null);
  }, [staffResources, formData.resourceId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Update selected resource when resourceId changes
    if (name === 'resourceId') {
      const resource = staffResources.find(r => r.id === value);
      setSelectedResource(resource || null);
    }
  };

  const handleEditorChange = () => {
    if (editorRef.current) {
      setFormData(prev => ({
        ...prev,
        description: editorRef.current!.innerHTML
      }));
    }
  };

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
    handleEditorChange();
  };

  const applyColor = () => {
    formatText('foreColor', selectedColor);
    setShowColorPicker(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      setError('Task title is required');
      return;
    }

    if (!formData.laneId) {
      setError('Lane selection is required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit({
        title: formData.title,
        description: formData.description,
        laneId: formData.laneId,
        resourceId: formData.resourceId || undefined
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setFormData({
        title: '',
        description: '',
        laneId: '',
        resourceId: ''
      });
      setError(null);
      onClose();
    }
  };

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div className="flex items-center space-x-4">
            {selectedResource && (
              <div className="w-16 h-16 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden">
                {selectedResource.thumbnail ? (
                  <img 
                    src={selectedResource.thumbnail} 
                    alt={selectedResource.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : selectedResource.picture ? (
                  <img 
                    src={selectedResource.picture} 
                    alt={selectedResource.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                      target.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <User className={`w-6 h-6 text-gray-400 ${selectedResource.thumbnail || selectedResource.picture ? 'hidden' : ''}`} />
              </div>
            )}
            <h2 className="text-xl font-semibold text-white">
              {task.isNew ? 'Add Task' : 'Edit Task'}
            </h2>
          </div>
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

          {/* Title Field */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-300 mb-2">
              Task Title <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="Enter task title"
              required
            />
          </div>

          {/* Description Field with Rich Text Editor */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            
            {/* Toolbar */}
            <div className="flex items-center space-x-2 p-2 bg-gray-700 border border-gray-600 rounded-t-lg">
              <button
                type="button"
                onClick={() => formatText('bold')}
                className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                title="Bold"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => formatText('italic')}
                className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                title="Italic"
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => formatText('underline')}
                className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                title="Underline"
              >
                <u>U</u>
              </button>
              <div className="w-px h-4 bg-gray-500"></div>
              <button
                type="button"
                onClick={() => formatText('insertUnorderedList')}
                className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                title="Bullet List"
              >
                •
              </button>
              <button
                type="button"
                onClick={() => formatText('insertOrderedList')}
                className="px-2 py-1 text-xs bg-gray-600 hover:bg-gray-500 text-white rounded transition-colors"
                title="Numbered List"
              >
                1.
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowColorPicker(!showColorPicker)}
                  className="p-2 rounded hover:bg-gray-600 transition-colors"
                  title="Text Color"
                >
                  <Palette className="w-4 h-4" />
                </button>
                {showColorPicker && (
                  <div className="absolute top-full left-0 mt-2 z-50 bg-white rounded-lg shadow-lg border p-3">
                    <HexColorPicker color={selectedColor} onChange={setSelectedColor} />
                    <div className="mt-3 flex gap-2">
                      <button
                        type="button"
                        onClick={applyColor}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowColorPicker(false)}
                        className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
              <input
                type="color"
                onChange={(e) => formatText('foreColor', e.target.value)}
                className="w-6 h-6 bg-gray-600 border border-gray-500 rounded cursor-pointer"
                title="Text Color"
              />
            </div>
            
            {/* Editor */}
            <div
              ref={editorRef}
              contentEditable
              onInput={handleEditorChange}
              className="w-full min-h-[120px] p-4 bg-gray-700 border border-gray-600 border-t-0 rounded-b-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              style={{ whiteSpace: 'pre-wrap' }}
              data-placeholder="Enter task description..."
            />
          </div>

          {/* Lane and Resource Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Lane Field */}
            <div>
              <label htmlFor="laneId" className="block text-sm font-medium text-gray-300 mb-2">
                Status/Lane <span className="text-red-400">*</span>
              </label>
              <select
                id="laneId"
                name="laneId"
                value={formData.laneId}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                required
              >
                <option value="">Select lane</option>
                {lanes.map((lane) => (
                  <option key={lane.id} value={lane.id}>
                    {lane.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Resource Field */}
            <div>
              <label htmlFor="resourceId" className="block text-sm font-medium text-gray-300 mb-2">
                Assigned Resource
              </label>
              <select
                id="resourceId"
                name="resourceId"
                value={formData.resourceId}
                onChange={handleInputChange}
                disabled={isSubmitting}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="">Unassigned</option>
                {staffResources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.name}
                  </option>
                ))}
              </select>
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
              disabled={isSubmitting || !formData.title.trim() || !formData.laneId}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>{task.isNew ? 'Add Task' : 'Save Changes'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;