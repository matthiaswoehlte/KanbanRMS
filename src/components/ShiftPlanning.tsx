import React, { useState } from 'react';
import { Calendar, Clock, Users, Plus, Edit2, Trash2 } from 'lucide-react';

interface Shift {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  date: string;
  assignedStaff: number;
  requiredStaff: number;
  department: string;
  priority: 'high' | 'medium' | 'low';
}

const mockShifts: Shift[] = [
  {
    id: '1',
    title: 'Morning Shift - Loading',
    startTime: '06:00',
    endTime: '14:00',
    date: '2024-04-15',
    assignedStaff: 8,
    requiredStaff: 10,
    department: 'Logistics',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Afternoon Shift - Maintenance',
    startTime: '14:00',
    endTime: '22:00',
    date: '2024-04-15',
    assignedStaff: 5,
    requiredStaff: 5,
    department: 'Maintenance',
    priority: 'medium'
  },
  {
    id: '3',
    title: 'Night Shift - Security',
    startTime: '22:00',
    endTime: '06:00',
    date: '2024-04-15',
    assignedStaff: 3,
    requiredStaff: 4,
    department: 'Security',
    priority: 'high'
  }
];

const ShiftPlanning: React.FC = () => {
  const [shifts] = useState<Shift[]>(mockShifts);
  const [selectedDate, setSelectedDate] = useState('2024-04-15');

  const filteredShifts = shifts.filter(shift => shift.date === selectedDate);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'medium': return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
      case 'low': return 'text-green-400 bg-green-400/10 border-green-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getStaffingStatus = (assigned: number, required: number) => {
    const percentage = (assigned / required) * 100;
    if (percentage >= 100) return { color: 'text-green-400', status: 'Full' };
    if (percentage >= 80) return { color: 'text-yellow-400', status: 'Adequate' };
    return { color: 'text-red-400', status: 'Understaffed' };
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Shift Planning</h1>
        <p className="text-gray-400">Plan and manage work shifts and staff assignments</p>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-400" />
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <span>Shifts for {new Date(selectedDate).toLocaleDateString()}</span>
            </div>
          </div>
          <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2">
            <Plus className="w-4 h-4" />
            <span>Create Shift</span>
          </button>
        </div>
      </div>

      {/* Shifts Timeline */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <h3 className="text-xl font-semibold text-white mb-4">Daily Timeline</h3>
        <div className="relative">
          <div className="grid grid-cols-24 gap-1 h-16 bg-gray-700/30 rounded-lg p-2">
            {Array.from({ length: 24 }, (_, i) => (
              <div key={i} className="flex flex-col items-center text-xs text-gray-400">
                <span className="mb-1">{i.toString().padStart(2, '0')}</span>
                <div className="w-full h-8 bg-gray-700 rounded"></div>
              </div>
            ))}
          </div>
          {filteredShifts.map((shift) => {
            const startHour = parseInt(shift.startTime.split(':')[0]);
            const endHour = parseInt(shift.endTime.split(':')[0]);
            const duration = endHour > startHour ? endHour - startHour : (24 - startHour) + endHour;
            const left = (startHour / 24) * 100;
            const width = (duration / 24) * 100;
            
            return (
              <div
                key={shift.id}
                className="absolute top-8 h-6 bg-gradient-to-r from-green-500 to-green-600 rounded text-xs text-white flex items-center px-2 shadow-lg"
                style={{ left: `${left}%`, width: `${width}%` }}
              >
                <span className="truncate">{shift.title}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Shifts List */}
      <div className="space-y-4">
        {filteredShifts.map((shift) => {
          const staffingStatus = getStaffingStatus(shift.assignedStaff, shift.requiredStaff);
          
          return (
            <div key={shift.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{shift.title}</h3>
                    <span className={`px-2 py-1 rounded-md text-xs font-medium border ${getPriorityColor(shift.priority)}`}>
                      {shift.priority} priority
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">{shift.department}</p>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-gray-300" />
                  </button>
                  <button className="p-2 bg-gray-700 hover:bg-red-600 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-gray-300" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center space-x-3">
                  <Clock className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="text-sm text-gray-400">Time</p>
                    <p className="text-white font-medium">{shift.startTime} - {shift.endTime}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Users className="w-5 h-5 text-blue-400" />
                  <div>
                    <p className="text-sm text-gray-400">Staffing</p>
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-medium">
                        {shift.assignedStaff}/{shift.requiredStaff}
                      </p>
                      <span className={`text-xs ${staffingStatus.color}`}>
                        {staffingStatus.status}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center">
                  <div className="w-full bg-gray-700 rounded-full h-2 mr-2">
                    <div
                      className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((shift.assignedStaff / shift.requiredStaff) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-white">
                    {Math.round((shift.assignedStaff / shift.requiredStaff) * 100)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{filteredShifts.length}</p>
              <p className="text-sm text-gray-400">Total Shifts</p>
            </div>
            <Calendar className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {filteredShifts.reduce((acc, shift) => acc + shift.assignedStaff, 0)}
              </p>
              <p className="text-sm text-gray-400">Staff Assigned</p>
            </div>
            <Users className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {filteredShifts.reduce((acc, shift) => acc + shift.requiredStaff, 0)}
              </p>
              <p className="text-sm text-gray-400">Staff Required</p>
            </div>
            <Users className="w-8 h-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {Math.round((filteredShifts.reduce((acc, shift) => acc + shift.assignedStaff, 0) / 
                            filteredShifts.reduce((acc, shift) => acc + shift.requiredStaff, 0)) * 100)}%
              </p>
              <p className="text-sm text-gray-400">Coverage</p>
            </div>
            <Clock className="w-8 h-8 text-purple-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftPlanning;