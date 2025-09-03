import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Tag, User, AlertTriangle, Clock, CheckCircle, XCircle, Filter } from 'lucide-react';
import { useResourceTypes } from '../hooks/useResourceTypes';
import AddResourceTypeModal from './AddResourceTypeModal';
import EditResourceTypeModal from './EditResourceTypeModal';

const ResourceTypes: React.FC = () => {
  const { 
    resourceTypes, 
    loading, 
    error, 
    addResourceType, 
    updateResourceType, 
    deleteResourceType 
  } = useResourceTypes();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStaff, setFilterStaff] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState<any>(null);

  const filteredResourceTypes = resourceTypes.filter(resourceType => {
    const matchesSearch = resourceType.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStaff = filterStaff === 'all' || 
                        (filterStaff === 'staff' && resourceType.isStaff) ||
                        (filterStaff === 'non-staff' && !resourceType.isStaff);
    return matchesSearch && matchesStaff;
  });

  const handleEdit = (resourceType: any) => {
    setSelectedResourceType(resourceType);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string, type: string) => {
    if (window.confirm(`Are you sure you want to delete the resource type "${type}"?`)) {
      try {
        await deleteResourceType(id);
      } catch (err) {
        console.error('Failed to delete resource type:', err);
        alert('Failed to delete resource type. Please try again.');
      }
    }
  };

  const handleAddResourceType = async (resourceTypeData: any) => {
    try {
      const newResourceType = await addResourceType(resourceTypeData);
      setShowAddModal(false);
      return newResourceType;
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateResourceType = async (id: string, updates: any) => {
    try {
      const updatedResourceType = await updateResourceType(id, updates);
      setShowEditModal(false);
      setSelectedResourceType(null);
      return updatedResourceType;
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="text-white text-lg">Loading resource types...</span>
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
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Resource Types</h1>
        <p className="text-gray-400">Manage different types of resources and their properties</p>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search resource types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-green-400" />
              <select
                value={filterStaff}
                onChange={(e) => setFilterStaff(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="staff">Staff Only</option>
                <option value="non-staff">Non-Staff Only</option>
              </select>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add Resource Type</span>
          </button>
        </div>
      </div>

      {/* Resource Types Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Staff Resource
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
              {filteredResourceTypes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Tag className="w-12 h-12 text-gray-500" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-400">No resource types found</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {searchTerm 
                            ? 'Try adjusting your search or filter criteria' 
                            : 'Get started by adding your first resource type'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredResourceTypes.map((resourceType) => (
                  <tr key={resourceType.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <Tag className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{resourceType.type}</div>
                          <div className="text-sm text-gray-400">ID: {resourceType.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-6 rounded border border-gray-600"
                          style={{ backgroundColor: resourceType.color }}
                          title={resourceType.color}
                        ></div>
                        <span className="text-sm text-gray-300 font-mono">
                          {resourceType.color.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {resourceType.isStaff ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm font-medium ${resourceType.isStaff ? 'text-green-400' : 'text-red-400'}`}>
                          {resourceType.isStaff ? 'Staff' : 'Non-Staff'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(resourceType.createdDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(resourceType)}
                          disabled={loading}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit resource type"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(resourceType.id, resourceType.type)}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete resource type"
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{resourceTypes.length}</p>
              <p className="text-sm text-gray-400">Total Resource Types</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{resourceTypes.filter(rt => rt.isStaff).length}</p>
              <p className="text-sm text-gray-400">Staff Resource Types</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{resourceTypes.filter(rt => !rt.isStaff).length}</p>
              <p className="text-sm text-gray-400">Non-Staff Resource Types</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Tag className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Resource Type Modal */}
      <AddResourceTypeModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddResourceType}
      />

      {/* Edit Resource Type Modal */}
      <EditResourceTypeModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedResourceType(null);
        }}
        onUpdate={handleUpdateResourceType}
        resourceType={selectedResourceType}
      />
    </div>
  );
};

export default ResourceTypes;