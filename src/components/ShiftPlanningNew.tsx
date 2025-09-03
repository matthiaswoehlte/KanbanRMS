import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Calendar, Plus, ChevronDown, AlertTriangle, Clock, User, Loader2, Copy, Clipboard } from 'lucide-react';
import { useShiftPlanning } from '../hooks/useShiftPlanning';
import { useShifts } from '../hooks/useShifts';
import AddCalendarModal from './AddCalendarModal';

const ShiftPlanningNew: React.FC = () => {
  const { 
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
    addNewStaffToCalendar
  } = useShiftPlanning();
  
  const { shifts } = useShifts();
  
  const [selectedCalendarId, setSelectedCalendarId] = useState<string>('');
  const [selectedStaffIds, setSelectedStaffIds] = useState<Set<string>>(new Set());
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [copiedRow, setCopiedRow] = useState<{ [day: number]: string | null } | null>(null);
  const [dropdownPositions, setDropdownPositions] = useState<{ [key: string]: 'up' | 'down' }>({});

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  useEffect(() => {
    if (selectedCalendarId) {
      fetchAssignments(selectedCalendarId);
    }
  }, [selectedCalendarId, fetchAssignments]);

  // Create a lookup map for assignments for better performance
  const assignmentsMap = useMemo(() => {
    const map = new Map<string, any>();
    assignments.forEach(assignment => {
      const key = `${assignment.resourceId}-${assignment.day}`;
      map.set(key, assignment);
    });
    return map;
  }, [assignments]);

  const getAssignmentForResourceAndDay = useCallback((resourceId: string, day: number) => {
    const key = `${resourceId}-${day}`;
    return assignmentsMap.get(key);
  }, [assignmentsMap]);

  const handleCopyRow = (staffId: string) => {
    const calendar = getSelectedCalendar();
    if (!calendar) return;
    
    const daysInMonth = getDaysInMonth();
    const rowData: { [day: number]: string | null } = {};
    
    for (let day = 1; day <= daysInMonth; day++) {
      const assignment = getAssignmentForResourceAndDay(staffId, day);
      rowData[day] = assignment?.shiftId || null;
    }
    
    setCopiedRow(rowData);
  };

  const handlePasteRow = async (staffId: string) => {
    if (!copiedRow) return;
    
    const calendar = getSelectedCalendar();
    if (!calendar) return;
    
    const daysInMonth = getDaysInMonth();
    
    for (let day = 1; day <= daysInMonth; day++) {
      const assignment = getAssignmentForResourceAndDay(staffId, day);
      const shiftIdToPaste = copiedRow[day];
      
      if (assignment && assignment.shiftId !== shiftIdToPaste) {
        try {
          await updateAssignment(assignment.id, shiftIdToPaste);
        } catch (err) {
          console.error(`Failed to update assignment for day ${day}:`, err);
        }
      }
    }
  };

  const handleAddNewStaff = async () => {
    if (!selectedCalendarId) return;
    
    try {
      await addNewStaffToCalendar(selectedCalendarId);
    } catch (err) {
      console.error('Failed to add new staff:', err);
      alert('Failed to add new staff. Please try again.');
    }
  };
  const handleCalendarSelect = (calendarId: string) => {
    setSelectedCalendarId(calendarId);
    // Clear selected staff when changing calendar
    setSelectedStaffIds(new Set());
  };

  const handleAddCalendar = async (year: number, month: number) => {
    try {
      const newCalendar = await createCalendar(year, month);
      setSelectedCalendarId(newCalendar.id);
      setSelectedStaffIds(new Set());
      setShowAddModal(false);
    } catch (err) {
      throw err;
    }
  };

  const handleStaffCheckboxChange = (staffId: string, checked: boolean) => {
    setSelectedStaffIds(prev => {
      const newSet = new Set(prev);
      if (checked) {
        newSet.add(staffId);
      } else {
        newSet.delete(staffId);
      }
      return newSet;
    });
  };

  const handleSelectAllStaff = (checked: boolean) => {
    if (checked) {
      setSelectedStaffIds(new Set(staffResources.map(staff => staff.id)));
    } else {
      setSelectedStaffIds(new Set());
    }
  };
  const handleDropdownToggle = (assignmentId: string) => {
    if (activeDropdown === assignmentId) {
      setActiveDropdown(null);
      setDropdownPositions(prev => {
        const newPositions = { ...prev };
        delete newPositions[assignmentId];
        return newPositions;
      });
    } else {
      setActiveDropdown(assignmentId);
      
      // Calculate position after a brief delay to ensure DOM is updated
      setTimeout(() => {
        const button = document.querySelector(`[data-assignment-id="${assignmentId}"]`);
        if (button) {
          const buttonRect = button.getBoundingClientRect();
          const scrollContainer = button.closest('.overflow-x-auto');
          const containerRect = scrollContainer?.getBoundingClientRect();
          
          if (containerRect) {
            const spaceBelow = containerRect.bottom - buttonRect.bottom;
            const dropdownHeight = 200; // Approximate height of dropdown with shifts
            
            setDropdownPositions(prev => ({
              ...prev,
              [assignmentId]: spaceBelow < dropdownHeight ? 'up' : 'down'
            }));
          }
        }
      }, 10);
    }
  };

  const handleShiftSelect = async (assignmentId: string, shiftId: string | null) => {
    try {
      await updateAssignment(assignmentId, shiftId);
      setActiveDropdown(null);
    } catch (err) {
      console.error('Failed to update assignment:', err);
    }
  };

  const getSelectedCalendar = () => {
    return calendars.find(cal => cal.id === selectedCalendarId);
  };

  const getDaysInMonth = () => {
    const calendar = getSelectedCalendar();
    if (!calendar) return 0;
    return new Date(calendar.year, calendar.month, 0).getDate();
  };

  const isWeekend = (year: number, month: number, day: number) => {
    const date = new Date(year, month - 1, day);
    const dayOfWeek = date.getDay();
    return dayOfWeek === 0 || dayOfWeek === 6; // Sunday = 0, Saturday = 6
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-400"></div>
          <span className="text-white text-lg">Loading shift planning...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-gray-900 min-h-screen flex items-center justify-center">
        <div className="bg-red-900/20 border border-red-500 rounded-lg p-6 max-w-md">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            <div>
              <h3 className="text-red-400 font-semibold">Error Loading Data</h3>
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
        <div className="flex items-center space-x-4">
          <h1 className="text-3xl font-bold text-white">Shift Planning</h1>
          <p className="text-gray-400">Plan and manage staff shifts by month</p>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0 lg:space-x-4">
          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-green-400" />
              <select
                value={selectedCalendarId}
                onChange={(e) => handleCalendarSelect(e.target.value)}
                className="px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Select a calendar</option>
                {calendars.map((calendar) => (
                  <option key={calendar.id} value={calendar.id}>
                    {months[calendar.month - 1]} {calendar.year}
                  </option>
                ))}
              </select>
            </div>
            {selectedCalendarId && newStaffResources.length > 0 && (
              <button 
                onClick={handleAddNewStaff}
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg font-medium hover:from-blue-600 hover:to-blue-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Staff ({newStaffResources.length})</span>
              </button>
            )}
          </div>
          <div className="flex items-center space-x-4">
            {selectedCalendarId && (
              <div className="text-sm text-gray-400">
                {staffResources.length} staff members • {getDaysInMonth()} days
              </div>
            )}
            <button 
              onClick={() => setShowAddModal(true)}
              disabled={loading}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              <span>Add Month</span>
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Table */}
      {selectedCalendarId ? (
        <div className="space-y-4">
          {/* Two-Table Layout */}
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="flex">
              {/* Left Table - Fixed Staff Names */}
              <div className="flex-shrink-0">
                <table className="border-collapse">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider w-12 border-r border-gray-600">
                        <input
                          type="checkbox"
                          checked={selectedStaffIds.size === staffResources.length && staffResources.length > 0}
                          onChange={(e) => handleSelectAllStaff(e.target.checked)}
                          className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                          title="Select all staff"
                        />
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[200px] border-r border-gray-600 h-[52px]">
                        Staff Member
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {staffResources.map((staff) => (
                      <tr key={staff.id} className="hover:bg-gray-700/30 transition-colors h-16">
                        <td className="px-3 py-2 text-center bg-gray-800 border-r border-gray-600 h-16 align-middle">
                          <input
                            type="checkbox"
                            checked={selectedStaffIds.has(staff.id)}
                            onChange={(e) => handleStaffCheckboxChange(staff.id, e.target.checked)}
                            className="w-4 h-4 text-green-600 bg-gray-700 border-gray-600 rounded focus:ring-green-500 focus:ring-2"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap bg-gray-800 border-r border-gray-600 h-16 align-middle">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-700 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {staff.thumbnail ? (
                                <img 
                                  src={staff.thumbnail} 
                                  alt={staff.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : staff.picture ? (
                                <img 
                                  src={staff.picture} 
                                  alt={staff.name}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.style.display = 'none';
                                    target.nextElementSibling?.classList.remove('hidden');
                                  }}
                                />
                              ) : null}
                              <User className={`w-4 h-4 text-gray-400 ${staff.thumbnail || staff.picture ? 'hidden' : ''}`} />
                            </div>
                            <div className="text-sm font-medium text-white">{staff.name}</div>
                            </div>
                            <div className="flex flex-col space-y-1">
                              <button
                                onClick={() => handleCopyRow(staff.id)}
                                className="p-1 hover:bg-gray-600 rounded text-gray-400 hover:text-white transition-colors"
                                title="Copy row"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => handlePasteRow(staff.id)}
                                disabled={!copiedRow}
                                className={`p-1 rounded transition-colors ${
                                  copiedRow 
                                    ? 'hover:bg-gray-600 text-gray-400 hover:text-white' 
                                    : 'text-gray-600 cursor-not-allowed'
                                }`}
                                title="Paste row"
                              >
                                <Clipboard className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Right Table - Scrollable Calendar Grid */}
              <div className="flex-grow overflow-x-auto overflow-y-visible">
                <table className="w-full border-collapse">
                  <thead className="bg-gray-700/50 sticky top-0 z-10">
                    <tr>
                      {(() => {
                        const calendar = getSelectedCalendar();
                        const daysInMonth = getDaysInMonth();
                        const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                        
                        return days.map(day => (
                          <th key={day} className={`px-2 py-3 text-center text-xs font-medium text-gray-400 uppercase tracking-wider min-w-[160px] h-[52px] ${
                            calendar && isWeekend(calendar.year, calendar.month, day) ? 'bg-red-900/50' : ''
                          }`}>
                            {(() => {
                              const date = new Date(calendar.year, calendar.month - 1, day);
                              const weekdayShort = date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 2);
                              return `${weekdayShort} ${day}`;
                            })()}
                          </th>
                        ));
                      })()}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {assignmentsLoading ? (
                      <tr>
                        <td colSpan={getDaysInMonth()} className="px-6 py-12 text-center">
                          <div className="flex items-center justify-center space-x-3">
                            <Loader2 className="w-6 h-6 text-green-400 animate-spin" />
                            <span className="text-white text-lg">Loading shift assignments...</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      staffResources.map((staff) => (
                        <tr key={staff.id} className="hover:bg-gray-700/30 transition-colors h-16">
                          {(() => {
                            const calendar = getSelectedCalendar();
                            const daysInMonth = getDaysInMonth();
                            const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
                            
                            return days.map(day => {
                              const assignment = getAssignmentForResourceAndDay(staff.id, day);
                              const isWeekendDay = calendar && isWeekend(calendar.year, calendar.month, day);
                              
                              return (
                                <td key={day} className={`px-2 py-2 text-center relative min-w-[160px] h-16 align-middle ${
                                  isWeekendDay ? 'bg-red-900/30' : ''
                                }`}>
                                  <button
                                    data-assignment-id={assignment?.id}
                                    onClick={() => assignment && handleDropdownToggle(assignment.id)}
                                    className="w-full h-10 px-3 text-sm font-bold rounded border border-gray-600 bg-gray-700 hover:bg-gray-600 transition-colors flex items-center justify-between"
                                    style={{ color: assignment?.shiftColor || '#d1d5db' }}
                                  >
                                    <span className="truncate">
                                      {assignment?.shiftShortName || '-'}
                                    </span>
                                    <ChevronDown className="w-3 h-3 flex-shrink-0" />
                                  </button>
                                  
                                  {/* Inline Dropdown */}
                                  {activeDropdown === assignment?.id && (
                                    <div className={`absolute left-0 z-50 w-full bg-gray-800 border border-gray-600 rounded shadow-lg max-h-48 overflow-y-auto ${
                                      dropdownPositions[assignment.id] === 'up' 
                                        ? 'bottom-full mb-1' 
                                        : 'top-full mt-1'
                                    }`}>
                                      <button
                                        onClick={() => handleShiftSelect(assignment.id, null)}
                                        className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-gray-700 transition-colors text-gray-300 h-11 flex items-center"
                                      >
                                        No Shift
                                      </button>
                                      {shifts.map((shift) => (
                                        <button
                                          key={shift.id}
                                          onClick={() => handleShiftSelect(assignment.id, shift.id)}
                                          className="w-full px-4 py-3 text-left text-sm font-bold hover:bg-gray-700 transition-colors flex items-center space-x-2 whitespace-nowrap h-11"
                                          style={{ color: shift.color }}
                                        >
                                          <span className="flex-shrink-0">{shift.shortName}</span>
                                          <span className="text-gray-400">-</span>
                                          <span className="truncate">{shift.name}</span>
                                        </button>
                                      ))}
                                    </div>
                                  )}
                                </td>
                              );
                            });
                          })()}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-800 rounded-xl p-12 border border-gray-700 text-center">
          <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-400 mb-2">No Calendar Selected</h3>
          <p className="text-gray-500 mb-6">
            Select an existing calendar or create a new one to start planning shifts
          </p>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-6 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-medium hover:from-green-600 hover:to-green-700 transition-all duration-200 flex items-center space-x-2 mx-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Create First Calendar</span>
          </button>
        </div>
      )}

      {/* Summary Stats */}
      {selectedCalendarId && (
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{staffResources.length}</p>
                <p className="text-sm text-gray-400">Staff Members</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{selectedStaffIds.size}</p>
                <p className="text-sm text-gray-400">Selected Staff</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <User className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">{getDaysInMonth()}</p>
                <p className="text-sm text-gray-400">Days in Month</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-white">
                  {Math.round((assignments.filter(a => a.shiftId !== null).length / assignments.length) * 100) || 0}%
                </p>
                <p className="text-sm text-gray-400">Coverage</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Calendar Modal */}
      <AddCalendarModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddCalendar}
        existingCalendars={calendars}
      />


      {/* Click outside to close dropdown */}
      {activeDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setActiveDropdown(null)}
        />
      )}
    </div>
  );
};

export default ShiftPlanningNew;