import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import DemandManagement from './components/DemandManagement';
import Resources from './components/Resources';
import ShiftPlanning from './components/ShiftPlanning';
import ShiftPlanningNew from './components/ShiftPlanningNew';
import GanttChart from './components/GanttChart';
import Utilization from './components/Utilization';
import Settings from './components/Settings';
import ResourceStatus from './components/ResourceStatus';
import Departments from './components/Departments';
import ResourceTypes from './components/ResourceTypes';
import Shifts from './components/Shifts';
import KanbanProjectManager from './components/KanbanProjectManager';

export type View = 'dashboard' | 'demand-management' | 'resources' | 'shift-planning' | 'gantt-chart' | 'utilization' | 'settings' | 'resource-status' | 'departments' | 'resource-types' | 'resources-crud' | 'shifts' | 'kanban';

function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'demand-management':
        return <DemandManagement />;
      case 'resources':
        return <Resources />;
      case 'shift-planning':
        return <ShiftPlanningNew />;
      case 'gantt-chart':
        return <GanttChart />;
      case 'utilization':
        return <Utilization />;
      case 'settings':
        return <Settings />;
      case 'resource-status':
        return <ResourceStatus />;
      case 'departments':
        return <Departments />;
      case 'resource-types':
        return <ResourceTypes />;
      case 'resources-crud':
        return <Resources />;
      case 'shifts':
        return <Shifts />;
      case 'kanban':
        return <KanbanProjectManager />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      <Sidebar currentView={currentView} onViewChange={setCurrentView} />
      <main className="flex-1 overflow-hidden">
        {renderCurrentView()}
      </main>
    </div>
  );
}

export default App;