import React, { useState } from 'react';
import { Search, Filter, Plus, Calendar, Users, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface Demand {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'assigned' | 'completed';
  requiredResources: number;
  assignedResources: number;
  dueDate: string;
  department: string;
}

const mockDemands: Demand[] = [
  {
    id: '1',
    title: 'Loading Bay Operations',
    priority: 'high',
    status: 'pending',
    requiredResources: 8,
    assignedResources: 5,
    dueDate: '2024-04-15',
    department: 'Logistics'
  },
  {
    id: '2',
    title: 'Equipment Maintenance',
    priority: 'medium',
    status: 'assigned',
    requiredResources: 3,
    assignedResources: 3,
    dueDate: '2024-04-18',
    department: 'Maintenance'
  },
  {
    id: '3',
    title: 'Quality Inspection',
    priority: 'low',
    status: 'completed',
    requiredResources: 2,
    assignedResources: 2,
    dueDate: '2024-04-12',
    department: 'Quality'
  }
];

const DemandManagement: React.FC = () => {
  const [demands] = useState<Demand[]>(mockDemands);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredDemands = demands.filter(demand => {
    const matchesSearch = demand.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         demand.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || demand.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10';
      case 'low': return 'text-green-400 bg-green-400/10';
      default: return 'text-gray-400 bg-gray-400/10';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'assigned': return <Users className="w-4 h-4 text-blue-400" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Demand Management</h1>
        <p className="text-gray-400">Manage resource demands and assignments</p>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search demands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="assigned">Assigned</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>New Demand</span>
          </button>
        </div>
      </div>

      {/* Demands Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredDemands.map((demand) => (
          <div key={demand.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-white mb-1">{demand.title}</h3>
                <p className="text-sm text-gray-400">{demand.department}</p>
              </div>
              <div className="flex items-center space-x-2">
                {getStatusIcon(demand.status)}
                <span className={`px-2 py-1 rounded-md text-xs font-medium ${getPriorityColor(demand.priority)}`}>
                  {demand.priority}
                </span>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-400">Resource Coverage</span>
                <span className="text-sm text-white">
                  {demand.assignedResources}/{demand.requiredResources}
                </span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(demand.assignedResources / demand.requiredResources) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center text-gray-400">
                <Calendar className="w-4 h-4 mr-1" />
                <span>Due: {new Date(demand.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center space-x-2">
                <button className="px-3 py-1 bg-gray-700 hover:bg-gray-600 text-white rounded text-xs transition-colors">
                  View
                </button>
                <button className="px-3 py-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded text-xs transition-all duration-200">
                  Assign
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{demands.filter(d => d.status === 'pending').length}</p>
              <p className="text-sm text-gray-400">Pending Demands</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{demands.filter(d => d.status === 'assigned').length}</p>
              <p className="text-sm text-gray-400">Assigned</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{demands.filter(d => d.status === 'completed').length}</p>
              <p className="text-sm text-gray-400">Completed</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {Math.round((demands.reduce((acc, d) => acc + d.assignedResources, 0) / demands.reduce((acc, d) => acc + d.requiredResources, 0)) * 100)}%
              </p>
              <p className="text-sm text-gray-400">Coverage Rate</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DemandManagement;