import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Activity, Users, Calendar, Filter } from 'lucide-react';

const utilizationData = [
  { name: 'Week 1', people: 85, equipment: 78, location: 92, material: 65 },
  { name: 'Week 2', people: 88, equipment: 82, location: 89, material: 70 },
  { name: 'Week 3', people: 92, equipment: 75, location: 95, material: 68 },
  { name: 'Week 4', people: 87, equipment: 88, location: 91, material: 72 },
];

const dailyUtilization = [
  { day: 'Mon', utilization: 85, target: 80 },
  { day: 'Tue', utilization: 92, target: 80 },
  { day: 'Wed', utilization: 78, target: 80 },
  { day: 'Thu', utilization: 95, target: 80 },
  { day: 'Fri', utilization: 88, target: 80 },
  { day: 'Sat', utilization: 65, target: 80 },
  { day: 'Sun', utilization: 45, target: 80 },
];

const resourceBreakdown = [
  { name: 'People', value: 45, color: '#10b981' },
  { name: 'Equipment', value: 30, color: '#3b82f6' },
  { name: 'Locations', value: 15, color: '#8b5cf6' },
  { name: 'Materials', value: 10, color: '#f59e0b' },
];

const departmentUtilization = [
  { department: 'Logistics', current: 92, previous: 88, trend: 'up' },
  { department: 'Maintenance', current: 78, previous: 85, trend: 'down' },
  { department: 'Production', current: 95, previous: 92, trend: 'up' },
  { department: 'Quality', current: 82, previous: 79, trend: 'up' },
  { department: 'Shipping', current: 89, previous: 91, trend: 'down' },
];

const Utilization: React.FC = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('week');
  const [selectedResource, setSelectedResource] = useState('all');

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? 
      <TrendingUp className="w-4 h-4 text-green-400" /> : 
      <TrendingDown className="w-4 h-4 text-red-400" />;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-400' : 'text-red-400';
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Resource Utilization</h1>
        <p className="text-gray-400">Monitor and analyze resource usage across all departments</p>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="quarter">Quarterly</option>
              </select>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-green-400" />
              <select
                value={selectedResource}
                onChange={(e) => setSelectedResource(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="all">All Resources</option>
                <option value="people">People</option>
                <option value="equipment">Equipment</option>
                <option value="location">Locations</option>
                <option value="material">Materials</option>
              </select>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-400">
            <Activity className="w-4 h-4 text-green-400" />
            <span>Last updated: {new Date().toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Overall Utilization</p>
              <p className="text-3xl font-bold text-white">87%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-sm text-green-400">+5% vs last period</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Peak Utilization</p>
              <p className="text-3xl font-bold text-white">95%</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-yellow-400 mr-1" />
                <span className="text-sm text-yellow-400">Thursday 2-4 PM</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Idle Resources</p>
              <p className="text-3xl font-bold text-white">12</p>
              <div className="flex items-center mt-2">
                <TrendingDown className="w-4 h-4 text-red-400 mr-1" />
                <span className="text-sm text-red-400">Available for assignment</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Efficiency Score</p>
              <p className="text-3xl font-bold text-white">8.7</p>
              <div className="flex items-center mt-2">
                <TrendingUp className="w-4 h-4 text-blue-400 mr-1" />
                <span className="text-sm text-blue-400">Excellent performance</span>
              </div>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Activity className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Daily Utilization Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyUtilization}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="day" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Area 
                  type="monotone" 
                  dataKey="utilization" 
                  stroke="#10b981" 
                  fill="url(#utilizationGradient)" 
                />
                <Line 
                  type="monotone" 
                  dataKey="target" 
                  stroke="#ef4444" 
                  strokeDasharray="5 5" 
                />
                <defs>
                  <linearGradient id="utilizationGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Resource Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resourceBreakdown}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  stroke="none"
                >
                  {resourceBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {resourceBreakdown.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm text-gray-300">{item.name}</span>
                <span className="text-sm text-white font-medium ml-auto">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Resource Utilization by Type */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Weekly Resource Utilization</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={utilizationData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Bar dataKey="people" fill="#10b981" name="People" radius={[2, 2, 0, 0]} />
              <Bar dataKey="equipment" fill="#3b82f6" name="Equipment" radius={[2, 2, 0, 0]} />
              <Bar dataKey="location" fill="#8b5cf6" name="Location" radius={[2, 2, 0, 0]} />
              <Bar dataKey="material" fill="#f59e0b" name="Material" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Department Performance */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Department Utilization</h3>
        <div className="space-y-4">
          {departmentUtilization.map((dept, index) => (
            <div key={index} className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-white font-medium">{dept.department}</span>
              </div>
              <div className="flex items-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">Current:</span>
                  <span className="text-white font-semibold">{dept.current}%</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-400">vs Previous:</span>
                  <span className={`text-sm font-medium ${getTrendColor(dept.trend)}`}>
                    {dept.previous}%
                  </span>
                  {getTrendIcon(dept.trend)}
                </div>
                <div className="w-24 bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                    style={{ width: `${dept.current}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Utilization;