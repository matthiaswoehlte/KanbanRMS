import React, { useState, useRef } from 'react';
import { Plus, MoreVertical, ArrowLeft, Settings, Trash2, Edit2 } from 'lucide-react';
import { useKanban, KanbanCallbacks } from '../hooks/useKanban';
import { useResources } from '../hooks/useResources';
import { useProjects } from '../hooks/useProjects';
import { useUserPreferences } from '../hooks/useUserPreferences';
import TaskCard from './TaskCard';
import TaskModal from './TaskModal';
import LaneModal from './LaneModal';

interface KanbanBoardProps {
  projectId: string | null;
  onBackToProjects?: () => void;
  callbacks?: KanbanCallbacks;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ 
  projectId, 
  onBackToProjects,
  callbacks 
}) => {
  const { 
    lanes, 
    tasks, 
    loading, 
    error, 
    addTask, 
    updateTask, 
    deleteTask,
    addLane,
    updateLane,
    deleteLane,
    moveTask
  } = useKanban(projectId, callbacks);
  
  const { resources } = useResources();
  const { projects } = useProjects();
  
  // Use a simple user ID for demo purposes - in production this would come from auth
  const userId = 'demo-user';
  const { updateCollapseTiles, getCollapseTiles } = useUserPreferences(userId);
  
  const [collapseTiles, setCollapseTiles] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showLaneModal, setShowLaneModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const [selectedLane, setSelectedLane] = useState<any>(null);
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [dragOverLane, setDragOverLane] = useState<string | null>(null);
  const [laneMenuOpen, setLaneMenuOpen] = useState<string | null>(null);
  const [dropPosition, setDropPosition] = useState<number | null>(null);

  const dragCounter = useRef(0);

  const currentProject = projects.find(p => p.id === projectId);

  // Load collapse tiles preference when project changes
  React.useEffect(() => {
    if (projectId) {
      setCollapseTiles(getCollapseTiles(projectId));
    }
  }, [projectId, getCollapseTiles]);

  const handleCollapseTilesChange = async (checked: boolean) => {
    setCollapseTiles(checked);
    if (projectId) {
      try {
        await updateCollapseTiles(projectId, checked);
      } catch (err) {
        console.error('Failed to save collapse tiles preference:', err);
      }
    }
  };

  const handleAddTask = (laneId: string) => {
    setSelectedTask({ laneId, isNew: true });
    setShowTaskModal(true);
  };

  const handleEditTask = (task: any) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error('Failed to delete task:', err);
        alert('Failed to delete task. Please try again.');
      }
    }
  };

  const handleTaskSubmit = async (taskData: any) => {
    try {
      if (selectedTask?.isNew) {
        await addTask({
          title: taskData.title,
          description: taskData.description,
          laneId: selectedTask.laneId,
          resourceId: taskData.resourceId
        });
      } else {
        await updateTask(selectedTask.id, {
          title: taskData.title,
          description: taskData.description,
          resourceId: taskData.resourceId,
          laneId: taskData.laneId
        });
      }
      setShowTaskModal(false);
      setSelectedTask(null);
    } catch (err) {
      throw err;
    }
  };

  const handleAddLane = () => {
    setSelectedLane({ isNew: true });
    setShowLaneModal(true);
  };

  const handleEditLane = (lane: any) => {
    setSelectedLane(lane);
    setShowLaneModal(true);
  };

  const handleDeleteLane = async (laneId: string, laneName: string) => {
    if (window.confirm(`Are you sure you want to delete the lane "${laneName}"? All tasks will be moved to the first lane.`)) {
      try {
        await deleteLane(laneId);
        setLaneMenuOpen(null);
      } catch (err) {
        console.error('Failed to delete lane:', err);
        alert('Failed to delete lane. Please try again.');
      }
    }
  };

  const handleLaneSubmit = async (laneData: any) => {
    try {
      if (selectedLane?.isNew) {
        await addLane(laneData.name, laneData.position);
      } else {
        await updateLane(selectedLane.id, laneData.name);
      }
      setShowLaneModal(false);
      setSelectedLane(null);
    } catch (err) {
      throw err;
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, task: any) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDragEnter = (e: React.DragEvent, laneId: string) => {
    e.preventDefault();
    dragCounter.current++;
    setDragOverLane(laneId);
  };

  const handleDragOverTask = (e: React.DragEvent, laneId: string, position: number) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverLane(laneId);
    setDropPosition(position);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setDragOverLane(null);
      setDropPosition(null);
    }
  };

  const handleDrop = async (e: React.DragEvent, laneId: string) => {
    e.preventDefault();
    dragCounter.current = 0;
    setDragOverLane(null);
    const targetPosition = dropPosition;
    setDropPosition(null);

    if (!draggedTask) return;

    try {
      // Only move if actually changing lanes
      if (draggedTask.laneId !== laneId) {
        const tasksInLane = tasks.filter(t => t.laneId === laneId);
        const newPosition = targetPosition || (tasksInLane.length + 1);
        
        await moveTask(draggedTask.id, laneId, newPosition);
      } else if (targetPosition && targetPosition !== draggedTask.position) {
        // Moving within the same lane to a different position
        await moveTask(draggedTask.id, laneId, targetPosition);
      }
    } catch (err) {
      console.error('Failed to move task:', err);
    }

    setDraggedTask(null);
  };

  if (!projectId) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">No Project Selected</h2>
          <p className="text-gray-400 mb-6">Please select a project to view its Kanban board</p>
          <button
            onClick={onBackToProjects}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="text-white text-lg">Loading Kanban board...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-3">
            <div>
              <h3 className="text-red-400 font-semibold">Error Loading Board</h3>
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
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={onBackToProjects}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-400" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-white">{currentProject?.name || 'Kanban Board'}</h1>
              <p className="text-gray-400">{currentProject?.description || 'Project board'}</p>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="collapseTiles"
                checked={collapseTiles}
                onChange={(e) => handleCollapseTilesChange(e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
              />
              <label htmlFor="collapseTiles" className="text-sm text-gray-300 font-medium">
                Collapse Tiles
              </label>
            </div>
            <button
              onClick={handleAddLane}
              className="px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Lane</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex space-x-6 overflow-x-auto h-[calc(100vh-200px)]">
        {lanes.map((lane) => {
          const laneTasks = tasks.filter(task => task.laneId === lane.id);
          const isDragOver = dragOverLane === lane.id;

          return (
            <div
              key={lane.id}
              className={`flex-shrink-0 w-80 bg-gray-800 rounded-xl border border-gray-700 flex flex-col h-full ${
                isDragOver ? 'border-green-500 bg-gray-700/50' : ''
              }`}
              onDragOver={handleDragOver}
              onDragEnter={(e) => handleDragEnter(e, lane.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, lane.id)}
            >
              {/* Lane Header */}
              <div className="p-4 border-b border-gray-700 flex-shrink-0 bg-gray-800 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <h3 className="font-semibold text-white">{lane.name}</h3>
                    <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                      {laneTasks.length}
                    </span>
                  </div>
                  <div className="relative">
                    <button
                      onClick={() => setLaneMenuOpen(laneMenuOpen === lane.id ? null : lane.id)}
                      className="p-1 hover:bg-gray-700 rounded transition-colors"
                    >
                      <MoreVertical className="w-4 h-4 text-gray-400" />
                    </button>
                    
                    {laneMenuOpen === lane.id && (
                      <div className="absolute right-0 top-8 bg-gray-800 border border-gray-600 rounded-lg shadow-lg z-10 min-w-[150px]">
                        <button
                          onClick={() => {
                            handleEditLane(lane);
                            setLaneMenuOpen(null);
                          }}
                          className="w-full px-4 py-2 text-left text-sm text-gray-300 hover:bg-gray-700 flex items-center space-x-2"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit Lane</span>
                        </button>
                        {lane.isDeletable && (
                          <button
                            onClick={() => handleDeleteLane(lane.id, lane.name)}
                            className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-gray-700 flex items-center space-x-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete Lane</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Tasks */}
              <div className="p-4 space-y-3 flex-1 overflow-y-auto scrollbar-dark">
                {laneTasks.map((task, index) => (
                  <div key={task.id}>
                    {/* Drop zone above task */}
                    {!collapseTiles && <div
                      className={`h-2 transition-all duration-200 ${
                        isDragOver && dropPosition === task.position ? 'bg-green-500/30 rounded' : ''
                      }`}
                      onDragOver={(e) => handleDragOverTask(e, lane.id, task.position)}
                      onDrop={(e) => handleDrop(e, lane.id)}
                    />}
                    
                    {collapseTiles ? (
                      <div
                        draggable
                        onDragStart={(e) => handleDragStart(e, task)}
                        className={`bg-gray-700 rounded-lg p-2 border border-gray-600 hover:border-gray-500 transition-all cursor-move group ${
                          draggedTask?.id === task.id ? 'opacity-50 rotate-2 scale-105' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <h4 className="text-white font-medium text-sm leading-tight flex-1 pr-2">
                            {task.title}
                          </h4>
                          <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditTask(task);
                              }}
                              className="p-1 hover:bg-gray-600 rounded transition-colors"
                              title="Edit task"
                            >
                              <Edit2 className="w-3 h-3 text-gray-400" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTask(task.id);
                              }}
                              className="p-1 hover:bg-gray-600 rounded transition-colors"
                              title="Delete task"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <TaskCard
                        task={task}
                        resourcePicture={task.resourcePicture}
                        resourceThumbnail={task.resourceThumbnail}
                        onEdit={() => handleEditTask(task)}
                        onDelete={() => handleDeleteTask(task.id)}
                        onDragStart={(e) => handleDragStart(e, task)}
                        isDragging={draggedTask?.id === task.id}
                      />
                    )}
                    
                    {/* Drop zone after last task */}
                    {!collapseTiles && index === laneTasks.length - 1 && (
                      <div
                        className={`h-2 transition-all duration-200 ${
                          isDragOver && dropPosition === (task.position + 1) ? 'bg-green-500/30 rounded' : ''
                        }`}
                        onDragOver={(e) => handleDragOverTask(e, lane.id, task.position + 1)}
                        onDrop={(e) => handleDrop(e, lane.id)}
                      />
                    )}
                  </div>
                ))}
                
                {/* Drop zone for empty lane or after all tasks */}
                {!collapseTiles && laneTasks.length === 0 && (
                  <div
                    className={`h-8 transition-all duration-200 ${
                      isDragOver && !dropPosition ? 'bg-green-500/30 rounded' : ''
                    }`}
                    onDragOver={(e) => handleDragOverTask(e, lane.id, 1)}
                    onDrop={(e) => handleDrop(e, lane.id)}
                  />
                )}
                
                {/* Add Task Button */}
                {!collapseTiles && (
                  <button
                    onClick={() => handleAddTask(lane.id)}
                    className="w-full p-3 border-2 border-dashed border-gray-600 rounded-lg text-gray-400 hover:border-green-500 hover:text-green-400 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Task</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Task Modal */}
      <TaskModal
        isOpen={showTaskModal}
        onClose={() => {
          setShowTaskModal(false);
          setSelectedTask(null);
        }}
        onSubmit={handleTaskSubmit}
        task={selectedTask}
        lanes={lanes}
        resources={resources}
      />

      {/* Lane Modal */}
      <LaneModal
        isOpen={showLaneModal}
        onClose={() => {
          setShowLaneModal(false);
          setSelectedLane(null);
        }}
        onSubmit={handleLaneSubmit}
        lane={selectedLane}
        existingLanes={lanes}
      />

      {/* Click outside to close lane menu */}
      {laneMenuOpen && (
        <div
          className="fixed inset-0 z-5"
          onClick={() => setLaneMenuOpen(null)}
        />
      )}

      {/* Scrollbar Styles for Dark Mode */}
      <style jsx>{`
        .scrollbar-dark::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-dark::-webkit-scrollbar-track {
          background: #374151;
          border-radius: 4px;
        }
        
        .scrollbar-dark::-webkit-scrollbar-thumb {
          background: #6b7280;
          border-radius: 4px;
        }
        
        .scrollbar-dark::-webkit-scrollbar-thumb:hover {
          background: #9ca3af;
        }
        
        /* Firefox */
        .scrollbar-dark {
          scrollbar-width: thin;
          scrollbar-color: #6b7280 #374151;
        }
      `}</style>
    </div>
  );
};

export default KanbanBoard;