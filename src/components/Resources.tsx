import React, { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Package, User, AlertTriangle, Clock, Image as ImageIcon } from 'lucide-react';
import { useResources } from '../hooks/useResources';
import { useResourceTypes } from '../hooks/useResourceTypes';
import { useResourceStatus } from '../hooks/useResourceStatus';
import { useDepartments } from '../hooks/useDepartments';
import AddResourceModal from './AddResourceModal';
import EditResourceModal from './EditResourceModal';

const Resources: React.FC = () => {
  const { 
    resources, 
    loading, 
    error, 
    addResource, 
    updateResource, 
    deleteResource
  } = useResources();
  
  const { resourceTypes } = useResourceTypes();
  const { statuses } = useResourceStatus();
  const { departments } = useDepartments();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResourceType, setFilterResourceType] = useState<string>('all');
  const [filterResourceStatus, setFilterResourceStatus] = useState<string>('all');
  const [filterStaffOnly, setFilterStaffOnly] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<any>(null);
  const [hoveredImage, setHoveredImage] = useState<{ src: string; name: string } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const filteredResources = resources.filter(resource => {
    const matchesSearch = resource.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterResourceType === 'all' || resource.resourceTypeId === filterResourceType;
    const matchesStatus = filterResourceStatus === 'all' || resource.resourceStatusId === filterResourceStatus;
    const matchesStaff = !filterStaffOnly || resource.resourceTypeIsStaff;
    return matchesSearch && matchesType && matchesStatus && matchesStaff;
  });

  const handleImageHover = (e: React.MouseEvent, imageSrc: string, imageName: string) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
    setHoveredImage({ src: imageSrc, name: imageName });
  };

  const handleImageLeave = () => {
    setHoveredImage(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (hoveredImage) {
      setMousePosition({ x: e.clientX, y: e.clientY });
    }
  };
  const handleEdit = (resource: any) => {
    setSelectedResource(resource);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the resource "${name}"?`)) {
      try {
        await deleteResource(id);
      } catch (err) {
        console.error('Failed to delete resource:', err);
        alert('Failed to delete resource. Please try again.');
      }
    }
  };

  const handleAddResource = async (resourceData: any) => {
    try {
      const newResource = await addResource(resourceData);
      setShowAddModal(false);
      return newResource;
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateResource = async (id: string, updates: any) => {
    try {
      const updatedResource = await updateResource(id, updates);
      setShowEditModal(false);
      setSelectedResource(null);
      return updatedResource;
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="text-white text-lg">Loading resources...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="text-red-400 font-semibold">Error Loading Data</h3>
              <p className="text-red-300 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen relative" onMouseMove={handleMouseMove}>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Resources</h1>
        <p className="text-gray-400">Manage all resources with their types and status</p>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-green-400" />
              <select
                value={filterResourceType}
                onChange={(e) => setFilterResourceType(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                {resourceTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.type}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={filterResourceStatus}
              onChange={(e) => setFilterResourceStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              {statuses.filter(status => status.isActive).map((status) => (
                <option key={status.id} value={status.id}>
                  {status.name}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="filterStaffOnly"
                checked={filterStaffOnly}
                onChange={(e) => setFilterStaffOnly(e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
              />
              <label htmlFor="filterStaffOnly" className="text-sm font-medium text-gray-300">
                Staff Only
              </label>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {/* Resources Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Created Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredResources.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Package className="w-12 h-12 text-gray-500" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-400">No resources found</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {searchTerm || filterResourceType !== 'all' || filterResourceStatus !== 'all' || filterStaffOnly
                            ? 'Try adjusting your search or filter criteria' 
                            : 'Get started by adding your first resource'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredResources.map((resource) => (
                  <tr key={resource.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-12 h-12 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden cursor-pointer"
                          onMouseEnter={resource.picture ? (e) => handleImageHover(e, resource.picture, resource.name) : undefined}
                          onMouseLeave={handleImageLeave}
                        >
                          {resource.thumbnail ? (
                            <img 
                              src={resource.thumbnail} 
                              alt={resource.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : resource.picture ? (
                            <img 
                              src={resource.picture} 
                              alt={resource.name}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <Package className={`w-6 h-6 text-gray-400 ${resource.thumbnail || resource.picture ? 'hidden' : ''}`} />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{resource.name}</div>
                          <div className="text-sm text-gray-400">ID: {resource.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: resource.resourceTypeColor }}
                        ></div>
                        <span className="text-sm text-gray-300">{resource.resourceTypeName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-4 h-4 rounded"
                          style={{ backgroundColor: resource.resourceStatusColor }}
                        ></div>
                        <span className="text-sm text-gray-300">{resource.resourceStatusName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {resource.resourceTypeIsStaff && resource.departmentName ? (
                        <span className="text-sm text-gray-300">{resource.departmentName}</span>
                      ) : (
                        <span className="text-sm text-gray-500 italic">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(resource.createdDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(resource)}
                          disabled={loading}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit resource"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(resource.id, resource.name)}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete resource"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{resources.length}</p>
              <p className="text-sm text-gray-400">Total Resources</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Package className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{resourceTypes.length}</p>
              <p className="text-sm text-gray-400">Resource Types</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Filter className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{resources.filter(r => r.picture).length}</p>
              <p className="text-sm text-gray-400">With Images</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <ImageIcon className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{statuses.filter(s => s.isActive).length}</p>
              <p className="text-sm text-gray-400">Active Statuses</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Resource Modal */}
      <AddResourceModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddResource}
        resourceTypes={resourceTypes}
        resourceStatuses={statuses.filter(s => s.isActive)}
        departments={departments}
      />

      {/* Edit Resource Modal */}
      <EditResourceModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedResource(null);
        }}
        onUpdate={handleUpdateResource}
        resource={selectedResource}
        resourceTypes={resourceTypes}
        resourceStatuses={statuses.filter(s => s.isActive)}
        departments={departments}
      />

      {/* Image Hover Overlay */}
      {hoveredImage && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: mousePosition.x + 15,
            top: mousePosition.y - 10,
            transform: 'translateY(-50%)'
          }}
        >
          <div className="bg-gray-800 border border-gray-600 rounded-lg shadow-2xl p-2 max-w-sm">
            <img
              src={hoveredImage.src}
              alt={hoveredImage.name}
              className="max-w-full max-h-64 object-contain rounded"
              style={{ minWidth: '200px', minHeight: '150px' }}
            />
            <p className="text-white text-sm mt-2 text-center font-medium">
              {hoveredImage.name}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Resources;