import React, { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, CheckCircle, XCircle, Clock, AlertTriangle, Activity } from 'lucide-react';
import { useResourceStatus, ResourceStatusItem } from '../hooks/useResourceStatus';
import AddStatusModal from './AddStatusModal';
import EditStatusModal from './EditStatusModal';

const ResourceStatus: React.FC = () => {
  const { 
    statuses, 
    loading, 
    error, 
    addStatus, 
    updateStatus, 
    deleteStatus, 
    toggleStatusActive 
  } = useResourceStatus();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<ResourceStatusItem | null>(null);

  const filteredStatuses = statuses.filter(status => {
    const matchesSearch = status.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         status.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && status.isActive) ||
                         (filterActive === 'inactive' && !status.isActive);
    return matchesSearch && matchesFilter;
  });

  const handleEdit = (status: ResourceStatusItem) => {
    setSelectedStatus(status);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the status "${name}"?`)) {
      try {
        await deleteStatus(id);
      } catch (err) {
        console.error('Failed to delete status:', err);
        alert('Failed to delete status. Please try again.');
      }
    }
  };

  const handleAddStatus = async (statusData: Omit<ResourceStatusItem, 'id' | 'createdDate' | 'usageCount'>) => {
    try {
      const newStatus = await addStatus(statusData);
      setShowAddModal(false);
      return newStatus;
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateStatus = async (id: string, updates: Partial<Omit<ResourceStatusItem, 'id' | 'createdDate' | 'usageCount'>>) => {
    try {
      const updatedStatus = await updateStatus(id, updates);
      setShowEditModal(false);
      setSelectedStatus(null);
      return updatedStatus;
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="text-white text-lg">Loading resource statuses...</span>
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
        <h1 className="text-3xl font-bold text-white mb-2">Resource Status</h1>
        <p className="text-gray-400">Manage and configure resource status definitions</p>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-green-400" />
              <select
                value={filterActive}
                onChange={(e) => setFilterActive(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active Only</option>
                <option value="inactive">Inactive Only</option>
              </select>
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Status</span>
          </button>
        </div>
      </div>

      {/* Status Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Active
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Usage Count
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredStatuses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Clock className="w-12 h-12 text-gray-500" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-400">No resource statuses found</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {searchTerm || filterActive !== 'all' 
                            ? 'Try adjusting your search or filter criteria' 
                            : 'Get started by adding your first resource status'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredStatuses.map((status) => (
                  <tr key={status.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{status.name}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-300 max-w-xs">
                        {status.description || <span className="text-gray-500 italic">No description</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-6 rounded border border-gray-600"
                          style={{ backgroundColor: status.color }}
                          title={status.color}
                        ></div>
                        <span className="text-sm text-gray-300 font-mono">
                          {status.color.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {status.isActive ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-400" />
                        )}
                        <span className={`text-sm font-medium ${status.isActive ? 'text-green-400' : 'text-red-400'}`}>
                          {status.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-white font-semibold">{status.usageCount}</span>
                        <span className="text-xs text-gray-400">times</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(status)}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors flex items-center space-x-1"
                          title="Edit status"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(status.id, status.name)}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors flex items-center space-x-1"
                          title="Delete status"
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
              <p className="text-2xl font-bold text-white">{statuses.length}</p>
              <p className="text-sm text-gray-400">Total Statuses</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Filter className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{statuses.filter(s => s.isActive).length}</p>
              <p className="text-sm text-gray-400">Active Statuses</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{statuses.filter(s => !s.isActive).length}</p>
              <p className="text-sm text-gray-400">Inactive Statuses</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {statuses.reduce((acc, status) => acc + status.usageCount, 0)}
              </p>
              <p className="text-sm text-gray-400">Total Usage</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Status Modal */}
      <AddStatusModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddStatus}
      />

      {/* Edit Status Modal */}
      <EditStatusModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedStatus(null);
        }}
        onUpdate={handleUpdateStatus}
        status={selectedStatus}
      />
    </div>
  );
};

export default ResourceStatus;