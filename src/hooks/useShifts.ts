import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Shift {
  id: string;
  name: string;
  shortName: string;
  startTime: string;
  endTime: string;
  isFullDay: boolean;
  type: 'presence' | 'absence';
  color: string;
  createdDate: string;
}

export const useShifts = () => {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShifts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shifts')
        .select('*')
        .order('created_at', { ascending: true });

      if (error) throw error;

      const formattedData: Shift[] = data.map(item => ({
        id: item.id,
        name: item.name,
        shortName: item.short_name,
        startTime: item.start_time,
        endTime: item.end_time,
        isFullDay: item.is_full_day,
        type: item.type,
        color: item.color,
        createdDate: item.created_at.split('T')[0]
      }));

      setShifts(formattedData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addShift = async (shift: Omit<Shift, 'id' | 'createdDate'>) => {
    try {
      const { data, error } = await supabase
        .from('shifts')
        .insert({
          name: shift.name,
          short_name: shift.shortName,
          start_time: shift.startTime,
          end_time: shift.endTime,
          is_full_day: shift.isFullDay,
          type: shift.type,
          color: shift.color
        })
        .select()
        .single();

      if (error) throw error;

      const newShift: Shift = {
        id: data.id,
        name: data.name,
        shortName: data.short_name,
        startTime: data.start_time,
        endTime: data.end_time,
        isFullDay: data.is_full_day,
        type: data.type,
        color: data.color,
        createdDate: data.created_at.split('T')[0]
      };

      setShifts(prev => [...prev, newShift]);
      return newShift;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add shift');
      throw err;
    }
  };

  const updateShift = async (id: string, updates: Partial<Omit<Shift, 'id' | 'createdDate'>>) => {
    try {
      const dbUpdates: any = {};
      if (updates.name !== undefined) dbUpdates.name = updates.name;
      if (updates.shortName !== undefined) dbUpdates.short_name = updates.shortName;
      if (updates.startTime !== undefined) dbUpdates.start_time = updates.startTime;
      if (updates.endTime !== undefined) dbUpdates.end_time = updates.endTime;
      if (updates.isFullDay !== undefined) dbUpdates.is_full_day = updates.isFullDay;
      if (updates.type !== undefined) dbUpdates.type = updates.type;
      if (updates.color !== undefined) dbUpdates.color = updates.color;

      const { data, error } = await supabase
        .from('shifts')
        .update(dbUpdates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;

      const updatedShift: Shift = {
        id: data.id,
        name: data.name,
        shortName: data.short_name,
        startTime: data.start_time,
        endTime: data.end_time,
        isFullDay: data.is_full_day,
        type: data.type,
        color: data.color,
        createdDate: data.created_at.split('T')[0]
      };

      setShifts(prev => prev.map(shift => 
        shift.id === id ? updatedShift : shift
      ));
      return updatedShift;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update shift');
      throw err;
    }
  };

  const deleteShift = async (id: string) => {
    try {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setShifts(prev => prev.filter(shift => shift.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete shift');
      throw err;
    }
  };

  useEffect(() => {
    fetchShifts();
  }, []);

  return {
    shifts,
    loading,
    error,
    addShift,
    updateShift,
    deleteShift,
    refetch: fetchShifts
  };
};