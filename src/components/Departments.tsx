import React, { useState } from 'react';
import { Search, Filter, Plus, Edit2, Trash2, Building2, User, AlertTriangle, Clock } from 'lucide-react';
import { useDepartments } from '../hooks/useDepartments';
import AddDepartmentModal from './AddDepartmentModal';
import EditDepartmentModal from './EditDepartmentModal';

const Departments: React.FC = () => {
  const { 
    departments, 
    loading, 
    error, 
    addDepartment, 
    updateDepartment, 
    deleteDepartment 
  } = useDepartments();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);

  const filteredDepartments = departments.filter(department => {
    const matchesSearch = department.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         department.supervisor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const handleEdit = (department: Department) => {
    setSelectedDepartment(department);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the department "${name}"?`)) {
      try {
        await deleteDepartment(id);
      } catch (err) {
        console.error('Failed to delete department:', err);
        alert('Failed to delete department. Please try again.');
      }
    }
  };

  const handleAddDepartment = async (departmentData: any) => {
    try {
      const newDepartment = await addDepartment(departmentData);
      setShowAddModal(false);
      return newDepartment;
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateDepartment = async (id: string, updates: any) => {
    try {
      const updatedDepartment = await updateDepartment(id, updates);
      setShowEditModal(false);
      setSelectedDepartment(null);
      return updatedDepartment;
    } catch (err) {
      throw err;
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="text-white text-lg">Loading departments...</span>
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
        <h1 className="text-3xl font-bold text-white mb-2">Departments</h1>
        <p className="text-gray-400">Manage organizational departments and supervisors</p>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search departments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add Department</span>
          </button>
        </div>
      </div>

      {/* Departments Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Department Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Supervisor
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
              {filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Building2 className="w-12 h-12 text-gray-500" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-400">No departments found</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {searchTerm 
                            ? 'Try adjusting your search criteria' 
                            : 'Get started by adding your first department'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((department) => (
                  <tr key={department.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{department.name}</div>
                          <div className="text-sm text-gray-400">ID: {department.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-300">{department.supervisor}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(department.createdDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(department)}
                          disabled={loading}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit department"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(department.id, department.name)}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete department"
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
              <p className="text-2xl font-bold text-white">{departments.length}</p>
              <p className="text-sm text-gray-400">Total Departments</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{new Set(departments.map(d => d.supervisor)).size}</p>
              <p className="text-sm text-gray-400">Unique Supervisors</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {departments.filter(d => new Date(d.createdDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length}
              </p>
              <p className="text-sm text-gray-400">Added This Month</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Plus className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Department Modal */}
      <AddDepartmentModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddDepartment}
      />

      {/* Edit Department Modal */}
      <EditDepartmentModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedDepartment(null);
        }}
        onUpdate={handleUpdateDepartment}
        department={selectedDepartment}
      />
    </div>
  );
};

export default Departments;