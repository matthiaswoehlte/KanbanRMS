import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Calendar, AlertCircle, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const utilizationData = [
  { name: 'Mon', utilization: 85 },
  { name: 'Tue', utilization: 92 },
  { name: 'Wed', utilization: 78 },
  { name: 'Thu', utilization: 95 },
  { name: 'Fri', utilization: 88 },
  { name: 'Sat', utilization: 65 },
  { name: 'Sun', utilization: 45 },
];

const resourceDistribution = [
  { name: 'People', value: 45, color: '#10b981' },
  { name: 'Equipment', value: 25, color: '#3b82f6' },
  { name: 'Locations', value: 20, color: '#8b5cf6' },
  { name: 'Materials', value: 10, color: '#f59e0b' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Resource management overview</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-400">Live data</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Active Resources</p>
              <p className="text-2xl font-bold text-white">247</p>
              <p className="text-sm text-green-400 flex items-center mt-2">
                <TrendingUp className="w-4 h-4 mr-1" />
                +12% from last week
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Planned Tasks</p>
              <p className="text-2xl font-bold text-white">89</p>
              <p className="text-sm text-blue-400 flex items-center mt-2">
                <Calendar className="w-4 h-4 mr-1" />
                Today's schedule
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Conflicts</p>
              <p className="text-2xl font-bold text-white">3</p>
              <p className="text-sm text-red-400 flex items-center mt-2">
                <AlertCircle className="w-4 h-4 mr-1" />
                Requires attention
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-lg flex items-center justify-center">
              <AlertCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-400 mb-1">Avg Utilization</p>
              <p className="text-2xl font-bold text-white">87%</p>
              <p className="text-sm text-green-400 flex items-center mt-2">
                <CheckCircle className="w-4 h-4 mr-1" />
                Optimal range
              </p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Weekly Utilization</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={utilizationData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="name" stroke="#9ca3af" />
                <YAxis stroke="#9ca3af" />
                <Bar dataKey="utilization" fill="url(#greenGradient)" radius={[4, 4, 0, 0]} />
                <defs>
                  <linearGradient id="greenGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.9}/>
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.7}/>
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="text-xl font-semibold text-white mb-4">Resource Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={resourceDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  stroke="none"
                >
                  {resourceDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {resourceDistribution.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-300">{item.name}</span>
                </div>
                <span className="text-sm text-white font-medium">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-xl font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[
            { action: 'Resource assigned', resource: 'Forklift #12', time: '2 minutes ago', status: 'success' },
            { action: 'Shift updated', resource: 'Team Alpha', time: '15 minutes ago', status: 'info' },
            { action: 'Conflict detected', resource: 'Loading Bay A', time: '32 minutes ago', status: 'warning' },
            { action: 'Task completed', resource: 'Delivery Route 7', time: '1 hour ago', status: 'success' },
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-4 p-3 rounded-lg bg-gray-700/50">
              <div className={`w-2 h-2 rounded-full ${
                activity.status === 'success' ? 'bg-green-400' :
                activity.status === 'warning' ? 'bg-yellow-400' : 'bg-blue-400'
              }`}></div>
              <div className="flex-1">
                <p className="text-white text-sm">{activity.action}</p>
                <p className="text-gray-400 text-xs">{activity.resource}</p>
              </div>
              <div className="text-xs text-gray-500 flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                {activity.time}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;