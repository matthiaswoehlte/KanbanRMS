import React, { useState, useMemo } from 'react';
import { Calendar, Filter, Plus, ChevronLeft, ChevronRight, User, Wrench, MapPin, Package, Clock, DollarSign } from 'lucide-react';

interface Task {
  id: string;
  name: string;
  resourceType: 'people' | 'equipment' | 'location' | 'material' | 'time' | 'financial';
  startDate: string;
  endDate: string;
  progress: number;
  assignee: string;
  department: string;
  priority: 'high' | 'medium' | 'low';
}

const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Loading Bay Operations',
    resourceType: 'people',
    startDate: '2024-04-13',
    endDate: '2024-04-16',
    progress: 65,
    assignee: 'Team Alpha',
    department: 'Logistics',
    priority: 'high'
  },
  {
    id: '2',
    name: 'Forklift Maintenance',
    resourceType: 'equipment',
    startDate: '2024-04-14',
    endDate: '2024-04-18',
    progress: 30,
    assignee: 'Maintenance Crew',
    department: 'Maintenance',
    priority: 'medium'
  },
  {
    id: '3',
    name: 'Warehouse Space Allocation',
    resourceType: 'location',
    startDate: '2024-04-15',
    endDate: '2024-04-20',
    progress: 80,
    assignee: 'Space Manager',
    department: 'Operations',
    priority: 'high'
  }
];

const resourceTypes = [
  { value: 'people', label: 'People', icon: User, color: 'text-green-400' },
  { value: 'equipment', label: 'Equipment', icon: Wrench, color: 'text-blue-400' },
  { value: 'location', label: 'Location', icon: MapPin, color: 'text-purple-400' },
  { value: 'material', label: 'Material', icon: Package, color: 'text-yellow-400' },
  { value: 'time', label: 'Time', icon: Clock, color: 'text-orange-400' },
  { value: 'financial', label: 'Financial', icon: DollarSign, color: 'text-pink-400' }
];

const timeScaleOptions = [
  { value: 0, label: '1 Hour (5min)', description: '1 hour view with 5 minute intervals' },
  { value: 1, label: '2 Hours (10min)', description: '2 hour view with 10 minute intervals' },
  { value: 2, label: '4 Hours (15min)', description: '4 hour view with quarter hours' },
  { value: 3, label: '8 Hours (15min)', description: '8 hour view with quarter hours' },
  { value: 4, label: '12 Hours (30min)', description: '12 hour view with half hours' },
  { value: 5, label: '24 Hours', description: '24 hour view with hourly scale' },
  { value: 6, label: 'Week (No Weekends)', description: 'One full week without weekends' },
  { value: 7, label: 'Week (Full)', description: 'One full week with weekends' },
  { value: 8, label: 'Half Month', description: 'Half month view with scrolling' },
  { value: 9, label: 'Full Month', description: 'Full month view' }
];

const GanttChart: React.FC = () => {
  const [tasks] = useState<Task[]>(mockTasks);
  const [selectedResourceType, setSelectedResourceType] = useState<string>('all');
  const [referenceDate, setReferenceDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeScale, setTimeScale] = useState(7); // Default to full week view
  const [scrollPosition, setScrollPosition] = useState(0);

  const filteredTasks = tasks.filter(task => 
    selectedResourceType === 'all' || task.resourceType === selectedResourceType
  );

  // Generate time periods based on scale and reference date
  const timePeriods = useMemo(() => {
    const refDate = new Date(referenceDate);
    const periods: Array<{ 
      date: Date; 
      label: string; 
      isAlternate: boolean;
      hourNumber?: string;
      dayName?: string;
      dayAbbr?: string;
      dayNumber?: string;
    }> = [];

    switch (timeScale) {
      case 9: // Full month
        {
          const year = refDate.getFullYear();
          const month = refDate.getMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          
          for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayAbbr = date.toLocaleDateString('en-US', { weekday: 'short' });
            periods.push({
              date,
              label: `${dayAbbr} ${day}`,
              isAlternate: day % 2 === 0,
              dayAbbr,
              dayNumber: day.toString()
            });
          }
        }
        break;

      case 8: // Half month
        {
          const year = refDate.getFullYear();
          const month = refDate.getMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const windowSize = 15; // Show 15 days at a time
          const maxScrollPosition = Math.max(0, daysInMonth - windowSize);
          const actualScrollPosition = Math.min(scrollPosition, maxScrollPosition);
          const startDay = actualScrollPosition + 1;
          const endDay = Math.min(startDay + windowSize - 1, daysInMonth);
          
          for (let day = startDay; day <= endDay; day++) {
            const date = new Date(year, month, day);
            const dayAbbr = date.toLocaleDateString('en-US', { weekday: 'short' });
            periods.push({
              date,
              label: `${dayAbbr} ${day}`,
              isAlternate: day % 2 === 0,
              dayAbbr,
              dayNumber: day.toString()
            });
          }
        }
        break;

      case 7: // Full week with weekends
        {
          const year = refDate.getFullYear();
          const month = refDate.getMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const maxScrollPosition = Math.max(0, daysInMonth - 7);
          const actualScrollPosition = Math.min(scrollPosition, maxScrollPosition);
          const startDay = actualScrollPosition + 1;
          const endDay = Math.min(startDay + 6, daysInMonth);
          
          for (let day = startDay; day <= endDay; day++) {
            const date = new Date(year, month, day);
            const dayAbbr = date.toLocaleDateString('en-US', { weekday: 'short' });
            periods.push({
              date,
              label: `${dayAbbr} ${day}`,
              isAlternate: day % 2 === 0,
              dayAbbr,
              dayNumber: day.toString()
            });
          }
        }
        break;

      case 6: // Week without weekends
        {
          const year = refDate.getFullYear();
          const month = refDate.getMonth();
          const daysInMonth = new Date(year, month + 1, 0).getDate();
          const maxScrollPosition = Math.max(0, daysInMonth - 5);
          const actualScrollPosition = Math.min(scrollPosition, maxScrollPosition);
          let currentDay = actualScrollPosition + 1;
          let addedDays = 0;
          
          while (addedDays < 5 && currentDay <= daysInMonth) {
            const date = new Date(year, month, currentDay);
            const dayOfWeek = date.getDay();
            
            // Skip weekends (0 = Sunday, 6 = Saturday)
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
              const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
              periods.push({
                date,
                label: `${dayName} ${currentDay}`,
                isAlternate: addedDays % 2 === 0,
                dayName,
                dayNumber: currentDay.toString()
              });
              addedDays++;
            }
            currentDay++;
          }
        }
        break;

      case 5: // 24 hours
        {
          for (let hour = 0; hour < 24; hour++) {
            const date = new Date(refDate);
            date.setHours(hour, 0, 0, 0);
            const hourNumber = (hour === 0 ? 12 : hour > 12 ? hour - 12 : hour).toString();
            periods.push({
              date,
              label: `${hourNumber}`,
              isAlternate: hour % 2 === 0,
              hourNumber
            });
          }
        }
        break;

      case 4: // 12 hours with 30min intervals
        {
          const startHour = scrollPosition * 12;
          for (let i = 0; i < 24; i++) { // 12 hours * 2 (30min intervals)
            const hour = Math.floor(startHour + i / 2);
            const minutes = (i % 2) * 30;
            const date = new Date(refDate);
            date.setHours(hour, minutes, 0, 0);
            const hourNumber = (hour === 0 ? 12 : hour > 12 ? hour - 12 : hour).toString();
            periods.push({
              date,
              label: `${hourNumber}:${minutes.toString().padStart(2, '0')}`,
              isAlternate: Math.floor(i / 2) % 2 === 0,
              hourNumber: minutes === 0 ? hourNumber : ''
            });
          }
        }
        break;

      case 3: // 8 hours with 15min intervals
        {
          const startHour = scrollPosition * 8;
          for (let i = 0; i < 32; i++) { // 8 hours * 4 (15min intervals)
            const hour = Math.floor(startHour + i / 4);
            const minutes = (i % 4) * 15;
            const date = new Date(refDate);
            date.setHours(hour, minutes, 0, 0);
            const hourNumber = (hour === 0 ? 12 : hour > 12 ? hour - 12 : hour).toString();
            periods.push({
              date,
              label: `${hourNumber}:${minutes.toString().padStart(2, '0')}`,
              isAlternate: Math.floor(i / 4) % 2 === 0,
              hourNumber: minutes === 0 ? hourNumber : ''
            });
          }
        }
        break;

      case 2: // 4 hours with 15min intervals
        {
          const startHour = scrollPosition * 4;
          for (let i = 0; i < 16; i++) { // 4 hours * 4 (15min intervals)
            const hour = Math.floor(startHour + i / 4);
            const minutes = (i % 4) * 15;
            const date = new Date(refDate);
            date.setHours(hour, minutes, 0, 0);
            const hourNumber = (hour === 0 ? 12 : hour > 12 ? hour - 12 : hour).toString();
            periods.push({
              date,
              label: `${hourNumber}:${minutes.toString().padStart(2, '0')}`,
              isAlternate: Math.floor(i / 4) % 2 === 0,
              hourNumber: minutes === 0 ? hourNumber : ''
            });
          }
        }
        break;

      case 1: // 2 hours with 10min intervals
        {
          const startHour = scrollPosition * 2;
          for (let i = 0; i < 12; i++) { // 2 hours * 6 (10min intervals)
            const hour = Math.floor(startHour + i / 6);
            const minutes = (i % 6) * 10;
            const date = new Date(refDate);
            date.setHours(hour, minutes, 0, 0);
            const hourNumber = (hour === 0 ? 12 : hour > 12 ? hour - 12 : hour).toString();
            periods.push({
              date,
              label: `${hourNumber}:${minutes.toString().padStart(2, '0')}`,
              isAlternate: Math.floor(i / 6) % 2 === 0,
              hourNumber: minutes === 0 ? hourNumber : ''
            });
          }
        }
        break;

      case 0: // 1 hour with 5min intervals
        {
          const startHour = scrollPosition;
          for (let i = 0; i < 12; i++) { // 1 hour * 12 (5min intervals)
            const hour = startHour;
            const minutes = i * 5;
            const date = new Date(refDate);
            date.setHours(hour, minutes, 0, 0);
            const hourNumber = (hour === 0 ? 12 : hour > 12 ? hour - 12 : hour).toString();
            periods.push({
              date,
              label: `${hourNumber}:${minutes.toString().padStart(2, '0')}`,
              isAlternate: hour % 2 === 0,
              hourNumber: minutes === 0 ? hourNumber : ''
            });
          }
        }
        break;
    }

    return periods;
  }, [referenceDate, timeScale, scrollPosition]);

  const navigateTime = (direction: 'prev' | 'next') => {
    if (timeScale === 9) {
      // Full month view - navigate between months
      const newDate = new Date(referenceDate);
      if (direction === 'next') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else {
        newDate.setMonth(newDate.getMonth() - 1);
      }
      setReferenceDate(newDate.toISOString().split('T')[0]);
      setScrollPosition(0);
    } else if (timeScale >= 6) {
      // For half month and week views, adjust scroll position within the month
      const refDate = new Date(referenceDate);
      const daysInMonth = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0).getDate();
      
      let step = 1;
      let maxPosition = daysInMonth - 1;
      
      if (timeScale === 8) {
        step = 7; // Half month view - scroll by week
        maxPosition = Math.max(0, daysInMonth - 15);
      } else if (timeScale === 7) {
        step = 7; // Full week view - scroll by week
        maxPosition = Math.max(0, daysInMonth - 7);
      } else if (timeScale === 6) {
        step = 5; // Week without weekends - scroll by 5 weekdays
        maxPosition = Math.max(0, daysInMonth - 5);
      }
      
      setScrollPosition(prev => {
        if (direction === 'next') {
          return Math.min(prev + step, maxPosition);
        } else {
          return Math.max(0, prev - step);
        }
      });
    } else {
      // For hour views, adjust reference date
      const newDate = new Date(referenceDate);
      const adjustment = timeScale === 5 ? 24 : timeScale === 4 ? 12 : timeScale === 3 ? 8 : timeScale === 2 ? 4 : timeScale === 1 ? 2 : 1;
      newDate.setHours(newDate.getHours() + (direction === 'next' ? adjustment : -adjustment));
      setReferenceDate(newDate.toISOString().split('T')[0]);
      setScrollPosition(0);
    }
  };

  const getTaskPosition = (task: Task) => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    
    if (timePeriods.length === 0) return { left: 0, width: 0 };
    
    const periodStart = timePeriods[0].date;
    const periodEnd = timePeriods[timePeriods.length - 1].date;
    
    // Calculate position within the visible timeframe
    const totalDuration = periodEnd.getTime() - periodStart.getTime();
    const taskStartOffset = Math.max(0, taskStart.getTime() - periodStart.getTime());
    const taskDuration = Math.min(taskEnd.getTime(), periodEnd.getTime()) - Math.max(taskStart.getTime(), periodStart.getTime());
    
    const left = (taskStartOffset / totalDuration) * 100;
    const width = Math.max(2, (taskDuration / totalDuration) * 100);
    
    return { left, width };
  };

  const getResourceIcon = (type: string) => {
    const resource = resourceTypes.find(r => r.value === type);
    if (!resource) return User;
    return resource.icon;
  };

  const getResourceColor = (type: string) => {
    const resource = resourceTypes.find(r => r.value === type);
    return resource?.color || 'text-gray-400';
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-l-red-400';
      case 'medium': return 'border-l-yellow-400';
      case 'low': return 'border-l-green-400';
      default: return 'border-l-gray-400';
    }
  };

  const getTimeScaleDescription = () => {
    const option = timeScaleOptions.find(opt => opt.value === timeScale);
    return option?.description || '';
  };

  return (
    <div className="p-6 bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Gantt Chart</h1>
        <p className="text-gray-400">Resource planning and task management timeline</p>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="space-y-4">
          {/* First Row - Resource Filter and Add Task */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-green-400" />
                <select
                  value={selectedResourceType}
                  onChange={(e) => setSelectedResourceType(e.target.value)}
                  className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                >
                  <option value="all">All Resource Types</option>
                  {resourceTypes.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Task</span>
            </button>
          </div>

          {/* Second Row - Date Picker and Navigation */}
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-400" />
              <label className="text-sm text-gray-300">Reference Date:</label>
              <input
                type="date"
                value={referenceDate}
                onChange={(e) => {
                  setReferenceDate(e.target.value);
                  setScrollPosition(0); // Reset scroll when date changes
                }}
                className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2 bg-gray-700 rounded-lg p-1">
              <button
                onClick={() => navigateTime('prev')}
                className="p-1 hover:bg-gray-600 rounded transition-colors"
                title="Previous period"
              >
                <ChevronLeft className="w-4 h-4 text-white" />
              </button>
              <span className="px-3 py-1 text-sm text-white min-w-[120px] text-center">
                {timeScale === 9 ? new Date(referenceDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) :
                 timeScale >= 6 ? `Day ${scrollPosition + 1}` : 
                 new Date(referenceDate).toLocaleDateString()}
              </span>
              <button
                onClick={() => navigateTime('next')}
                className="p-1 hover:bg-gray-600 rounded transition-colors"
                title="Next period"
              >
                <ChevronRight className="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          {/* Third Row - Time Scale Slider */}
          <div className="space-y-3">
            <div className="flex items-center space-x-4">
              <label className="text-sm text-gray-300 min-w-[80px]">Time Scale:</label>
              <div className="flex-1 max-w-md">
                <input
                  type="range"
                  min="0"
                  max="9"
                  value={timeScale}
                  onChange={(e) => {
                    setTimeScale(parseInt(e.target.value));
                    setScrollPosition(0); // Reset scroll when scale changes
                  }}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #10b981 0%, #10b981 ${(timeScale / 9) * 100}%, #374151 ${(timeScale / 9) * 100}%, #374151 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1h</span>
                  <span>2h</span>
                  <span>4h</span>
                  <span>8h</span>
                  <span>12h</span>
                  <span>24h</span>
                  <span>Week</span>
                  <span>Week+</span>
                  <span>½Month</span>
                  <span>Month</span>
                </div>
              </div>
              <div className="min-w-[200px]">
                <div className="text-sm font-medium text-white">
                  {timeScaleOptions[timeScale]?.label}
                </div>
                <div className="text-xs text-gray-400">
                  {getTimeScaleDescription()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-x-auto">
        {/* Header */}
        <div className="flex bg-gray-700/50">
          <div className="col-span-4 px-6 py-4 border-r border-gray-600">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">Task Details</h3>
          </div>
          <div className="flex" style={{ minWidth: `${timePeriods.length * 120}px` }}>
            {timePeriods.map((period, index) => (
              <div
                key={index}
                className={`w-[120px] border-r border-gray-600 last:border-r-0 ${
                  period.isAlternate ? 'bg-green-900/20' : 'bg-blue-900/20'
                }`}
              >
                {/* Timeline Header Content */}
                {timeScale <= 5 ? (
                  // Hourly Timeline Layout
                  <div className="px-2 py-4 text-center">
                    <div className="text-lg font-bold text-white mb-1">
                      {period.hourNumber}
                    </div>
                    <div className="flex justify-center">
                      <div className="w-px h-4 bg-gray-400"></div>
                    </div>
                  </div>
                ) : timeScale === 6 ? (
                  // Work Week Timeline Layout (Monday-Friday)
                  <div className="px-2 py-3">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-white mb-1">
                        {period.dayName}
                      </div>
                      <div className="text-lg font-bold text-gray-300">
                        {period.dayNumber}
                      </div>
                    </div>
                  </div>
                ) : timeScale === 7 ? (
                  // Full Week Timeline Layout (Sun-Sat)
                  <div className="px-2 py-3">
                    <div className="text-center">
                      <div className="text-sm font-semibold text-white mb-1">
                        {period.dayAbbr}
                      </div>
                      <div className="text-lg font-bold text-gray-300">
                        {period.dayNumber}
                      </div>
                    </div>
                  </div>
                ) : (
                  // Month Timeline Layout
                  <div className="px-2 py-4 text-center">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                      {period.dayAbbr}
                    </div>
                    <div className="text-sm font-medium text-white">
                      {period.dayNumber}
                    </div>
                  </div>
                )}
                </div>
            ))}
          </div>
        </div>

        {/* Tasks */}
        <div className="divide-y divide-gray-700">
          {filteredTasks.map((task) => {
            const Icon = getResourceIcon(task.resourceType);
            const position = getTaskPosition(task);
            
            return (
              <div key={task.id} className="flex hover:bg-gray-700/30 transition-colors">
                <div className="col-span-4 px-6 py-4 border-r border-gray-600">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center ${getResourceColor(task.resourceType)}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-white truncate">{task.name}</h4>
                        <span className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)} bg-current`}></span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{task.assignee} • {task.department}</p>
                      <div className="flex items-center space-x-2 mt-2">
                        <div className="flex-1 bg-gray-700 rounded-full h-1.5">
                          <div
                            className="bg-gradient-to-r from-green-500 to-green-600 h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-gray-400">{task.progress}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="py-4 relative" style={{ minWidth: `${timePeriods.length * 120}px` }}>
                  <div className="flex h-full">
                    {timePeriods.map((period, index) => (
                      <div 
                        key={index} 
                        className={`w-[120px] border-r border-gray-600 last:border-r-0 ${
                          period.isAlternate ? 'bg-green-900/10' : 'bg-blue-900/10'
                        }`}
                      />
                    ))}
                  </div>
                  {position.width > 0 && (
                    <div
                      className={`absolute top-1/2 transform -translate-y-1/2 h-8 bg-gradient-to-r from-green-500 to-green-600 rounded-lg border-l-4 ${getPriorityColor(task.priority)} shadow-lg flex items-center px-3 min-w-[80px]`}
                      style={{
                        left: `${position.left}%`,
                        width: `${Math.max(position.width, 6)}%`
                      }}
                    >
                      <span className="text-xs text-white font-medium truncate">
                        {task.name}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resource Type Legend */}
      <div className="mt-6 bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Resource Types</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {resourceTypes.map((type) => {
            const Icon = type.icon;
            return (
              <div key={type.value} className="flex items-center space-x-3 p-3 bg-gray-700/30 rounded-lg">
                <div className={`w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center ${type.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm text-gray-300">{type.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Task Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{filteredTasks.length}</p>
              <p className="text-sm text-gray-400">Active Tasks</p>
            </div>
            <Calendar className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{filteredTasks.filter(t => t.priority === 'high').length}</p>
              <p className="text-sm text-gray-400">High Priority</p>
            </div>
            <div className="w-8 h-8 bg-red-400 rounded-lg"></div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">
                {Math.round(filteredTasks.reduce((acc, task) => acc + task.progress, 0) / filteredTasks.length)}%
              </p>
              <p className="text-sm text-gray-400">Avg Progress</p>
            </div>
            <div className="w-8 h-8 bg-blue-400 rounded-lg"></div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-white">{filteredTasks.filter(t => t.progress >= 100).length}</p>
              <p className="text-sm text-gray-400">Completed</p>
            </div>
            <div className="w-8 h-8 bg-green-400 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};

export default GanttChart;