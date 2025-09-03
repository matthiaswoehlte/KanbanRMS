import React, { useState } from 'react';
import { 
  BarChart3, 
  Calendar, 
  Users, 
  Layers, 
  GanttChartIcon, 
  Activity, 
  Settings as SettingsIcon,
  TrendingUp,
  Database,
  ChevronDown,
  ChevronRight,
  FolderKanban
} from 'lucide-react';
import { View } from '../App';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

const navigationItems = [
  { id: 'dashboard' as View, label: 'Dashboard', icon: BarChart3 },
  { id: 'demand-management' as View, label: 'Demand Management', icon: TrendingUp },
  { id: 'resources' as View, label: 'Resources', icon: Users },
  { id: 'shift-planning' as View, label: 'Shift Planning', icon: Calendar },
  { id: 'gantt-chart' as View, label: 'Gantt Chart', icon: GanttChartIcon },
  { id: 'utilization' as View, label: 'Utilization', icon: Activity },
  { id: 'kanban' as View, label: 'Kanban Projects', icon: FolderKanban },
  { id: 'settings' as View, label: 'Settings', icon: SettingsIcon },
];

const basicDataItems = [
  { id: 'resource-status' as View, label: 'Resource Status' },
  { id: 'departments' as View, label: 'Departments' },
  { id: 'resource-types' as View, label: 'Resource Types' },
  { id: 'resources-crud' as View, label: 'Resources' },
  { id: 'shifts' as View, label: 'Shifts' },
];
const Sidebar: React.FC<SidebarProps> = ({ currentView, onViewChange }) => {
  const [isBasicDataOpen, setIsBasicDataOpen] = useState(false);

  return (
    <div className="w-64 bg-gray-800 border-r border-gray-700 flex flex-col">
      {/* Logo/Brand */}
      <div className="p-6 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-green-600 rounded-lg flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">MANAGE EVERY</h1>
            <p className="text-xs text-green-400 font-medium">RESOURCE MES</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <li key={item.id}>
                <button
                  onClick={() => onViewChange(item.id)}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20'
                      : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.label}</span>
                </button>
              </li>
            );
          })}
          
          {/* Basic Data Dropdown */}
          <li>
            <button
              onClick={() => setIsBasicDataOpen(!isBasicDataOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-lg text-left transition-all duration-200 text-gray-300 hover:text-white hover:bg-gray-700/50"
            >
              <div className="flex items-center space-x-3">
                <Database className="w-5 h-5" />
                <span className="font-medium">Basic Data</span>
              </div>
              {isBasicDataOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
            
            {isBasicDataOpen && (
              <ul className="mt-2 ml-4 space-y-1">
                {basicDataItems.map((item) => {
                  const isActive = currentView === item.id;
                  
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => onViewChange(item.id)}
                        className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg text-left transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg shadow-green-500/20'
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }`}
                      >
                        <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
                        <span className="font-medium text-sm">{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;