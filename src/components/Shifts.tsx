import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Clock, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { useShifts } from '../hooks/useShifts';
import AddShiftModal from './AddShiftModal';
import EditShiftModal from './EditShiftModal';

const Shifts: React.FC = () => {
  const { 
    shifts, 
    loading, 
    error, 
    addShift, 
    updateShift, 
    deleteShift 
  } = useShifts();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedShift, setSelectedShift] = useState<any>(null);

  const filteredShifts = shifts.filter(shift => {
    const matchesSearch = shift.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         shift.shortName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || shift.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleEdit = (shift: any) => {
    setSelectedShift(shift);
    setShowEditModal(true);
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete the shift "${name}"?`)) {
      try {
        await deleteShift(id);
      } catch (err) {
        console.error('Failed to delete shift:', err);
        alert('Failed to delete shift. Please try again.');
      }
    }
  };

  const handleAddShift = async (shiftData: any) => {
    try {
      const newShift = await addShift(shiftData);
      setShowAddModal(false);
      return newShift;
    } catch (err) {
      throw err;
    }
  };

  const handleUpdateShift = async (id: string, updates: any) => {
    try {
      const updatedShift = await updateShift(id, updates);
      setShowEditModal(false);
      setSelectedShift(null);
      return updatedShift;
    } catch (err) {
      throw err;
    }
  };

  const formatTime = (time: string, isFullDay: boolean) => {
    if (isFullDay) {
      return 'Full Day';
    }
    return time;
  };

  const getTypeIcon = (type: string) => {
    return type === 'presence' ? 
      <CheckCircle className="w-4 h-4 text-green-400" /> : 
      <XCircle className="w-4 h-4 text-red-400" />;
  };

  const getTypeColor = (type: string) => {
    return type === 'presence' ? 'text-green-400' : 'text-red-400';
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="text-white text-lg">Loading shifts...</span>
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
        <h1 className="text-3xl font-bold text-white mb-2">Shifts</h1>
        <p className="text-gray-400">Manage shift definitions for presence and absence scheduling</p>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search shifts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Types</option>
              <option value="presence">Presence</option>
              <option value="absence">Absence</option>
            </select>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            disabled={loading}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add Shift</span>
          </button>
        </div>
      </div>

      {/* Shifts Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-700/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Shift Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Short Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Time
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                  Color
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
              {filteredShifts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <Clock className="w-12 h-12 text-gray-500" />
                      <div>
                        <h3 className="text-lg font-medium text-gray-400">No shifts found</h3>
                        <p className="text-sm text-gray-500 mt-1">
                          {searchTerm || filterType !== 'all'
                            ? 'Try adjusting your search or filter criteria' 
                            : 'Get started by adding your first shift'}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredShifts.map((shift) => (
                  <tr key={shift.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-sm font-medium text-white">{shift.name}</div>
                          <div className="text-sm text-gray-400">ID: {shift.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-white">{shift.shortName}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {shift.isFullDay ? (
                          <span className="font-medium">Full Day</span>
                        ) : (
                          <span>{shift.startTime} - {shift.endTime}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getTypeIcon(shift.type)}
                        <span className={`text-sm font-medium capitalize ${getTypeColor(shift.type)}`}>
                          {shift.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-3">
                        <div 
                          className="w-8 h-6 rounded border border-gray-600"
                          style={{ backgroundColor: shift.color }}
                          title={shift.color}
                        ></div>
                        <span className="text-sm text-gray-300 font-mono">
                          {shift.color.toUpperCase()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                      {new Date(shift.createdDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleEdit(shift)}
                          disabled={loading}
                          className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit shift"
                        >
                          <Edit2 className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button 
                          onClick={() => handleDelete(shift.id, shift.name)}
                          disabled={loading}
                          className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-xs transition-colors flex items-center space-x-1 disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Delete shift"
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
              <p className="text-2xl font-bold text-white">{shifts.length}</p>
              <p className="text-sm text-gray-400">Total Shifts</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{shifts.filter(s => s.type === 'presence').length}</p>
              <p className="text-sm text-gray-400">Presence Shifts</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{shifts.filter(s => s.type === 'absence').length}</p>
              <p className="text-sm text-gray-400">Absence Shifts</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{shifts.filter(s => s.isFullDay).length}</p>
              <p className="text-sm text-gray-400">Full Day Shifts</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Add Shift Modal */}
      <AddShiftModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddShift}
      />

      {/* Edit Shift Modal */}
      <EditShiftModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedShift(null);
        }}
        onUpdate={handleUpdateShift}
        shift={selectedShift}
      />
    </div>
  );
};

export default Shifts;