import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';

export interface ShiftCalendar {
  id: string;
  year: number;
  month: number;
  createdDate: string;
}

export interface ShiftAssignment {
  id: string;
  calendarId: string;
  resourceId: string;
  resourceName: string;
  resourcePicture: string;
  resourceThumbnail: string;
  day: number;
  shiftId: string | null;
  shiftName: string | null;
  shiftShortName: string | null;
  shiftColor: string | null;
}

export interface StaffResource {
  id: string;
  name: string;
}

export const useShiftPlanning = () => {
  const [calendars, setCalendars] = useState<ShiftCalendar[]>([]);
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);
  const [staffResources, setStaffResources] = useState<StaffResource[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [newStaffResources, setNewStaffResources] = useState<StaffResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCalendars = async () => {
    try {
      const { data, error } = await supabase
        .from('shift_calendars')
        .select('*')
        .order('year', { ascending: false })
        .order('month', { ascending: false });

      if (error) throw error;

      const formattedData: ShiftCalendar[] = data.map(item => ({
        id: item.id,
        year: item.year,
        month: item.month,
        createdDate: item.created_at.split('T')[0]
      }));

      setCalendars(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch calendars');
    }
  };

  const fetchStaffResources = async () => {
    try {
      const { data, error } = await supabase
        .from('resources')
        .select(`
          id,
          name,
          picture,
          thumbnail,
          resource_types!inner(is_staff)
        `)
        .eq('resource_types.is_staff', true)
        .order('name', { ascending: true });

      if (error) throw error;

      const formattedData: StaffResource[] = data.map(item => ({
        id: item.id,
        name: item.name,
        picture: item.picture || '',
        thumbnail: item.thumbnail || ''
      }));

      setStaffResources(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staff resources');
    }
  };

  const fetchAssignments = useCallback(async (calendarId: string) => {
    try {
      setAssignmentsLoading(true);
      const { data, error } = await supabase
        .from('shift_assignments')
        .select(`
          *,
          resources!inner(name),
          shifts(id, name, short_name, color)
        `)
        .eq('calendar_id', calendarId)
        .order('day', { ascending: true });

      if (error) throw error;

      const formattedData: ShiftAssignment[] = data.map(item => ({
        id: item.id,
        calendarId: item.calendar_id,
        resourceId: item.resource_id,
        resourceName: item.resources.name,
        resourcePicture: '',
        resourceThumbnail: '',
        day: item.day,
        shiftId: item.shift_id,
        shiftName: item.shifts?.name || null,
        shiftShortName: item.shifts?.short_name || null,
        shiftColor: item.shifts?.color || null
      }));

      setAssignments(formattedData);
      
      // Check for new staff resources not in current assignments
      const assignedResourceIds = new Set(formattedData.map(a => a.resourceId));
      const newStaff = staffResources.filter(staff => !assignedResourceIds.has(staff.id));
      setNewStaffResources(newStaff);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assignments');
    } finally {
      setAssignmentsLoading(false);
    }
  }, [staffResources]);

  const createCalendar = async (year: number, month: number) => {
    try {
      setLoading(true);
      
      // Create the calendar
      const { data: calendarData, error: calendarError } = await supabase
        .from('shift_calendars')
        .insert({ year, month })
        .select()
        .single();

      if (calendarError) throw calendarError;

      // Get staff resources
      const { data: staffData, error: staffError } = await supabase
        .from('resources')
        .select(`
          id,
          resource_types!inner(is_staff)
        `)
        .eq('resource_types.is_staff', true);

      if (staffError) throw staffError;

      // Calculate days in month
      const daysInMonth = new Date(year, month, 0).getDate();
      
      // Create assignments for each staff member for each day
      const assignmentsToCreate = [];
      for (const staff of staffData) {
        for (let day = 1; day <= daysInMonth; day++) {
          assignmentsToCreate.push({
            calendar_id: calendarData.id,
            resource_id: staff.id,
            day: day,
            shift_id: null
          });
        }
      }

      const { error: assignmentsError } = await supabase
        .from('shift_assignments')
        .insert(assignmentsToCreate);

      if (assignmentsError) throw assignmentsError;

      const newCalendar: ShiftCalendar = {
        id: calendarData.id,
        year: calendarData.year,
        month: calendarData.month,
        createdDate: calendarData.created_at.split('T')[0]
      };

      setCalendars(prev => [newCalendar, ...prev]);
      return newCalendar;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create calendar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addNewStaffToCalendar = async (calendarId: string) => {
    try {
      setLoading(true);
      
      // Get the calendar to determine days in month
      const calendar = calendars.find(cal => cal.id === calendarId);
      if (!calendar) throw new Error('Calendar not found');
      
      const daysInMonth = new Date(calendar.year, calendar.month, 0).getDate();
      
      // Create assignments for each new staff member for each day
      const assignmentsToCreate = [];
      for (const staff of newStaffResources) {
        for (let day = 1; day <= daysInMonth; day++) {
          assignmentsToCreate.push({
            calendar_id: calendarId,
            resource_id: staff.id,
            day: day,
            shift_id: null
          });
        }
      }

      const { error: assignmentsError } = await supabase
        .from('shift_assignments')
        .insert(assignmentsToCreate);

      if (assignmentsError) throw assignmentsError;
      
      // Clear new staff resources and refresh assignments
      setNewStaffResources([]);
      await fetchAssignments(calendarId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add new staff to calendar');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateAssignment = async (assignmentId: string, shiftId: string | null) => {
    try {
      const { data, error } = await supabase
        .from('shift_assignments')
        .update({ shift_id: shiftId })
        .eq('id', assignmentId)
        .select(`
          *,
          resources!inner(name),
          shifts(id, name, short_name, color)
        `)
        .single();

      if (error) throw error;

      const updatedAssignment: ShiftAssignment = {
        id: data.id,
        calendarId: data.calendar_id,
        resourceId: data.resource_id,
        resourceName: data.resources.name,
        day: data.day,
        shiftId: data.shift_id,
        shiftName: data.shifts?.name || null,
        shiftShortName: data.shifts?.short_name || null,
        shiftColor: data.shifts?.color || null
      };

      setAssignments(prev => prev.map(assignment => 
        assignment.id === assignmentId ? updatedAssignment : assignment
      ));
      
      return updatedAssignment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update assignment');
      throw err;
    }
  };

  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      await Promise.all([fetchCalendars(), fetchStaffResources()]);
      setLoading(false);
    };
    initialize();
  }, []);

  return {
    calendars,
    assignments,
    assignmentsLoading,
    staffResources,
    newStaffResources,
    loading,
    error,
    createCalendar,
    updateAssignment,
    fetchAssignments,
    addNewStaffToCalendar,
    refetch: fetchCalendars
  };
};