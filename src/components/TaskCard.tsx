import React from 'react';
import { Edit2, Trash2, User, Package } from 'lucide-react';
import { Task } from '../hooks/useKanban';

interface TaskCardProps {
  task: Task;
  resourcePicture?: string;
  resourceThumbnail?: string;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: (e: React.DragEvent) => void;
  isDragging?: boolean;
}

const TaskCard: React.FC<TaskCardProps> = ({ 
  task, 
  resourcePicture,
  resourceThumbnail,
  onEdit, 
  onDelete, 
  onDragStart,
  isDragging = false 
}) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className={`bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-gray-500 transition-all cursor-move group ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : ''
      }`}
    >
      <div className="flex items-start justify-between mb-3">
        <h4 className="text-white font-medium text-sm leading-tight flex-1 pr-2">
          {task.title}
        </h4>
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1 hover:bg-gray-600 rounded transition-colors"
            title="Edit task"
          >
            <Edit2 className="w-3 h-3 text-gray-400" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 hover:bg-gray-600 rounded transition-colors"
            title="Delete task"
          >
            <Trash2 className="w-3 h-3 text-red-400" />
          </button>
        </div>
      </div>

      {task.description && (
        <div 
          className="text-gray-300 text-xs mb-3 line-clamp-3"
          dangerouslySetInnerHTML={{ __html: task.description }}
        />
      )}

      <div className="flex items-center justify-between">
        {task.resourceName ? (
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center overflow-hidden">
              {resourceThumbnail ? (
                <img 
                  src={resourceThumbnail} 
                  alt={task.resourceName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : resourcePicture ? (
                <img 
                  src={resourcePicture} 
                  alt={task.resourceName}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <User className={`w-3 h-3 text-gray-300 ${resourceThumbnail || resourcePicture ? 'hidden' : ''}`} />
            </div>
            <span className="text-xs text-gray-300">{task.resourceName}</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 text-gray-500">
            <div className="w-6 h-6 bg-gray-600 rounded-full flex items-center justify-center">
              <Package className="w-3 h-3 text-gray-400" />
            </div>
            <span className="text-xs">Unassigned</span>
          </div>
        )}

        <div className="text-xs text-gray-500">
          {new Date(task.createdAt).toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default TaskCard;