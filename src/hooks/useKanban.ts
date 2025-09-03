import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface Lane {
  id: string;
  projectId: string;
  name: string;
  position: number;
  isDeletable: boolean;
  createdAt: string;
}

export interface Task {
  id: string;
  projectId: string;
  laneId: string;
  title: string;
  description: string;
  status: string;
  resourceId: string | null;
  resourceName: string | null;
  resourcePicture: string | null;
  resourceThumbnail: string | null;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanCallbacks {
  onTaskUpdated?: (task: Task) => void;
  onTaskDeleted?: (taskId: string) => void;
  onLaneAdded?: (lane: Lane) => void;
  onLaneUpdated?: (lane: Lane) => void;
  onLaneDeleted?: (laneId: string) => void;
  onLaneReordered?: (lanes: Lane[]) => void;
}

export const useKanban = (projectId: string | null, callbacks?: KanbanCallbacks) => {
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchKanbanData = useCallback(async () => {
    if (!projectId) {
      setLanes([]);
      setTasks([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Fetch lanes
      const { data: lanesData, error: lanesError } = await supabase
        .from('lanes')
        .select('*')
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      if (lanesError) throw lanesError;

      // Fetch tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select(`
          *,
          resources(name, picture, thumbnail)
        `)
        .eq('project_id', projectId)
        .order('position', { ascending: true });

      if (tasksError) throw tasksError;

      const formattedLanes: Lane[] = lanesData.map(item => ({
        id: item.id,
        projectId: item.project_id,
        name: item.name,
        position: item.position,
        isDeletable: item.is_deletable,
        createdAt: item.created_at
      }));

      const formattedTasks: Task[] = tasksData.map(item => ({
        id: item.id,
        projectId: item.project_id,
        laneId: item.lane_id,
        title: item.title,
        description: item.description || '',
        status: item.status,
        resourceId: item.resource_id,
        resourceName: item.resources?.name || null,
        resourcePicture: item.resources?.picture || null,
        resourceThumbnail: item.resources?.thumbnail || null,
        position: item.position,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));

      setLanes(formattedLanes);
      setTasks(formattedTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch kanban data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const addTask = async (taskData: {
    title: string;
    description?: string;
    laneId: string;
    resourceId?: string;
  }) => {
    if (!projectId) throw new Error('No project selected');

    try {
      // Get the lane to determine status and position
      const lane = lanes.find(l => l.id === taskData.laneId);
      if (!lane) throw new Error('Lane not found');

      // Get max position in the lane
      const maxPosition = Math.max(
        0,
        ...tasks.filter(t => t.laneId === taskData.laneId).map(t => t.position)
      );

      const { data, error } = await supabase
        .from('tasks')
        .insert({
          project_id: projectId,
          lane_id: taskData.laneId,
          title: taskData.title,
          description: taskData.description || '',
          status: lane.name,
          resource_id: taskData.resourceId || null,
          position: maxPosition + 1
        })
        .select(`
          *,
          resources(name, picture, thumbnail)
        `)
        .single();

      if (error) throw error;

      const newTask: Task = {
        id: data.id,
        projectId: data.project_id,
        laneId: data.lane_id,
        title: data.title,
        description: data.description || '',
        status: data.status,
        resourceId: data.resource_id,
        resourceName: data.resources?.name || null,
        resourcePicture: data.resources?.picture || null,
        resourceThumbnail: data.resources?.thumbnail || null,
        position: data.position,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setTasks(prev => [...prev, newTask]);
      callbacks?.onTaskUpdated?.(newTask);
      return newTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add task');
      throw err;
    }
  };

  const updateTask = async (taskId: string, updates: {
    title?: string;
    description?: string;
    laneId?: string;
    resourceId?: string;
    position?: number;
  }) => {
    try {
      const dbUpdates: any = {};
      if (updates.title !== undefined) dbUpdates.title = updates.title;
      if (updates.description !== undefined) dbUpdates.description = updates.description;
      if (updates.resourceId !== undefined) dbUpdates.resource_id = updates.resourceId;
      if (updates.position !== undefined) dbUpdates.position = updates.position;
      
      // If lane changes, update status and lane_id
      if (updates.laneId !== undefined) {
        const lane = lanes.find(l => l.id === updates.laneId);
        if (lane) {
          dbUpdates.lane_id = updates.laneId;
          dbUpdates.status = lane.name;
        }
      }

      const { data, error } = await supabase
        .from('tasks')
        .update(dbUpdates)
        .eq('id', taskId)
        .select(`
          *,
          resources(name, picture, thumbnail)
        `)
        .single();

      if (error) throw error;

      const updatedTask: Task = {
        id: data.id,
        projectId: data.project_id,
        laneId: data.lane_id,
        title: data.title,
        description: data.description || '',
        status: data.status,
        resourceId: data.resource_id,
        resourceName: data.resources?.name || null,
        resourcePicture: data.resources?.picture || null,
        resourceThumbnail: data.resources?.thumbnail || null,
        position: data.position,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };

      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
      callbacks?.onTaskUpdated?.(updatedTask);
      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      throw err;
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;

      setTasks(prev => prev.filter(task => task.id !== taskId));
      callbacks?.onTaskDeleted?.(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      throw err;
    }
  };

  const addLane = async (laneName: string, position?: number) => {
    if (!projectId) throw new Error('No project selected');

    try {
      let targetPosition = position || lanes.length + 1;

      // If inserting at a specific position, shift existing lanes
      if (position && position <= lanes.length) {
        const lanesToShift = lanes.filter(l => l.position >= position);
        for (const lane of lanesToShift) {
          const { error: shiftError } = await supabase
            .from('lanes')
            .update({ position: lane.position + 1 })
            .eq('id', lane.id);
          
          if (shiftError) throw shiftError;
        }
      }

      const { data, error } = await supabase
        .from('lanes')
        .insert({
          project_id: projectId,
          name: laneName,
          position: targetPosition,
          is_deletable: true
        })
        .select()
        .single();

      if (error) throw error;

      const newLane: Lane = {
        id: data.id,
        projectId: data.project_id,
        name: data.name,
        position: data.position,
        isDeletable: data.is_deletable,
        createdAt: data.created_at
      };

      await fetchKanbanData(); // Refresh to get correct positions
      callbacks?.onLaneAdded?.(newLane);
      return newLane;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add lane');
      throw err;
    }
  };

  const updateLane = async (laneId: string, newName: string) => {
    try {
      const { data, error } = await supabase
        .from('lanes')
        .update({ name: newName })
        .eq('id', laneId)
        .select()
        .single();

      if (error) throw error;

      // Update tasks status to match new lane name
      await supabase
        .from('tasks')
        .update({ status: newName })
        .eq('lane_id', laneId);

      await fetchKanbanData(); // Refresh data
      callbacks?.onLaneUpdated?.(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update lane');
      throw err;
    }
  }

  const deleteLane = async (laneId: string) => {
    try {
      const { error } = await supabase
        .from('lanes')
        .delete()
        .eq('id', laneId);

      if (error) throw error;

      setLanes(prev => prev.filter(lane => lane.id !== laneId));
      setTasks(prev => prev.filter(task => task.laneId !== laneId));
      callbacks?.onLaneDeleted?.(laneId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete lane');
      throw err;
    }
  };

  const reorderLane = async (laneId: string, newPosition: number) => {
    try {
      const laneToMove = lanes.find(l => l.id === laneId);
      if (!laneToMove) throw new Error('Lane not found');

      const oldPosition = laneToMove.position;
      if (oldPosition === newPosition) return; // No change needed

      // Shift other lanes
      if (oldPosition < newPosition) {
        // Moving right: shift affected lanes left
        const lanesToShift = lanes.filter(l => 
          l.position > oldPosition && l.position <= newPosition
        );
        for (const laneToShift of lanesToShift) {
          const { error: shiftError } = await supabase
            .from('lanes')
            .update({ position: laneToShift.position - 1 })
            .eq('id', laneToShift.id);
          
          if (shiftError) throw shiftError;
        }
      } else {
        // Moving left: shift affected lanes right
        const lanesToShift = lanes.filter(l => 
          l.position >= newPosition && l.position < oldPosition
        );
        for (const laneToShift of lanesToShift) {
          const { error: shiftError } = await supabase
            .from('lanes')
            .update({ position: laneToShift.position + 1 })
            .eq('id', laneToShift.id);
          
          if (shiftError) throw shiftError;
        }
      }

      // Update the moved lane to its new position
      const { error: updateError } = await supabase
        .from('lanes')
        .update({ position: newPosition })
        .eq('id', laneId);

      if (updateError) throw updateError;

      await fetchKanbanData(); // Refresh to get correct positions
      callbacks?.onLaneReordered?.(lanes);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reorder lane');
      throw err;
    }
  };

      if (oldLaneId === targetLaneId) {
        // Moving within same lane - reorder positions
        if (oldPosition === targetPosition) return; // No change needed

        // Get all tasks in the lane except the one being moved
        const laneTasks = tasks.filter(t => t.laneId === targetLaneId && t.id !== taskId);
        
        if (oldPosition < targetPosition) {
          // Moving down: shift tasks between old and new position up by 1
          const tasksToShift = laneTasks.filter(t => 
            t.position > oldPosition && t.position <= targetPosition
          );
          
          for (const task of tasksToShift) {
            const { error: shiftError } = await supabase
              .from('tasks')
              .update({ position: task.position - 1 })
              .eq('id', task.id);
            
            if (shiftError) throw shiftError;
          }
        } else {
          // Moving up: shift tasks between new and old position down by 1
          const tasksToShift = laneTasks.filter(t => 
            t.position >= targetPosition && t.position < oldPosition
          );
          
          for (const task of tasksToShift) {
            const { error: shiftError } = await supabase
              .from('tasks')
              .update({ position: task.position + 1 })
              .eq('id', task.id);
            
            if (shiftError) throw shiftError;
          }
        }

        // Update the moved task's position
        const { error: updateError } = await supabase
          .from('tasks')
          .update({ position: targetPosition })
          .eq('id', taskId);

        if (updateError) throw updateError;
      } else {
        // Moving between lanes
        // Get tasks in target lane that need to be shifted
        const targetLaneTasks = tasks.filter(t => 
          t.laneId === targetLaneId && t.position >= targetPosition
        );
        
        // Shift tasks in target lane to make room
        for (const task of targetLaneTasks) {
          const { error: shiftError } = await supabase
            .from('tasks')
            .update({ position: task.position + 1 })
            .eq('id', task.id);
          
          if (shiftError) throw shiftError;
        }

        // Move task to new lane and position
        const targetLane = lanes.find(l => l.id === targetLaneId);
        const { error: moveError } = await supabase
          .from('tasks')
          .update({
            lane_id: targetLaneId,
            status: targetLane?.name || 'Unknown',
            position: targetPosition
          })
          .eq('id', taskId);

        if (moveError) throw moveError;

        // Compact positions in the old lane
        const oldLaneTasks = tasks.filter(t => 
          t.laneId === oldLaneId && t.position > oldPosition
        );
        
        for (const task of oldLaneTasks) {
          const { error: compactError } = await supabase
            .from('tasks')
            .update({ position: task.position - 1 })
            .eq('id', task.id);
          
          if (compactError) throw compactError;
        }
      }

      // Refresh data to ensure UI consistency
      await fetchKanbanData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to move task');
      throw err;
    }
  };

  useEffect(() => {
    fetchKanbanData();
  }, [fetchKanbanData]);

  return {
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
    reorderLane,
    moveTask,
    refetch: fetchKanbanData
  };
};