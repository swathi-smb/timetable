import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiPath } from '../path/apiPath';

// Add print styles
const printStyles = `
  @media print {
    body * {
      visibility: hidden;
    }
    .timetable-container, .timetable-container * {
      visibility: visible;
    }
    .timetable-container {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
    }
    .no-print {
      display: none !important;
    }
    table {
      page-break-inside: avoid;
      border-collapse: collapse;
      width: 100%;
    }
    td, th {
      border: 1px solid #000;
      padding: 4px;
      font-size: 11px;
    }
    th {
      background-color: #f0f0f0 !important;
      -webkit-print-color-adjust: exact;
    }
  }
`;

const TimetableTable = ({ timetableData, timeConfig, courseList = [] }) => {
  if (!courseList) {
    console.warn("TimetableTable: courseList prop is undefined. Please ensure it is passed correctly.");
  } else {
    console.log("TimetableTable courseList prop:", courseList);
  }
  const [courseClassTables, setCourseClassTables] = useState([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [timetableName, setTimetableName] = useState('');
  const [saveStatus, setSaveStatus] = useState('');  const [editingCell, setEditingCell] = useState(null);
  const [editedData, setEditedData] = useState({});
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

  useEffect(() => {
    const processData = () => {
      if (!timetableData?.data) return;

      console.log('Processing timetable data:', {
        dataKeys: Object.keys(timetableData.data),
        sampleSlot: Object.values(timetableData.data)[0]?.[0]
      });

      // Group data by courseId first
      const courseGroups = Object.entries(timetableData.data).reduce((acc, [key, slots]) => {
        console.log('Processing course group:', {
          key,
          slotCount: slots.length,
          sampleSlot: slots[0]
        });

        const [courseId, semester] = key.split('-');
        if (!acc[courseId]) {
          acc[courseId] = { semesters: new Set(), slots: [] };
        }
        acc[courseId].semesters.add(semester);
        acc[courseId].slots.push(...slots);
        return acc;
      }, {});

      // Process each course's data
      const processedTables = Object.entries(courseGroups).map(([courseId, { semesters, slots }]) => {
        // Get unique time slots
        const timeSlots = [...new Set(slots.map(slot => 
          `${slot.start_time}-${slot.end_time}`
        ))].sort();

        // Add GE time slot
        if (timeConfig?.geStart && timeConfig?.geEnd) {
          timeSlots.push(`${timeConfig.geStart}-${timeConfig.geEnd}`);
        }

        // Create timetable structure
        const timetable = {};
        days.forEach((day, dayIndex) => {
          timetable[day] = {};
          timeSlots.forEach(timeSlot => {
            const [startTime, endTime] = timeSlot.split('-');
            // Group slots by semester for each time slot
            timetable[day][timeSlot] = {};
            [...semesters].sort().forEach(semester => {
              // For GE slots in semesters 1 and 2
              if (startTime === timeConfig?.geStart && ['1', '2'].includes(semester)) {
                timetable[day][timeSlot][semester] = [{
                  slot_type: 'ge',
                  subject_name: 'Generic Elective',
                  start_time: startTime,
                  end_time: endTime,
                  semester: semester,
                  day: dayIndex
                }];
              } else {
                timetable[day][timeSlot][semester] = slots.filter(slot => 
                  slot.day === dayIndex && 
                  slot.start_time === startTime && 
                  slot.end_time === endTime &&
                  String(slot.semester) === String(semester)
                );
              }
            });
          });
        });

        return {
          courseId,
          semesters: [...semesters].sort(),
          timeSlots,
          timetable
        };
      });

      setCourseClassTables(processedTables);
    };

    processData();
  }, [timetableData, timeConfig]);
  // Group slots by time
  const groupSlotsByTime = (slots) => {
    console.log('Grouping slots:', {
      count: slots.length,
      sampleSlot: slots[0]
    });

    const groups = slots.reduce((acc, slot) => {
      const timeKey = `${slot.day}-${slot.start_time}-${slot.end_time}`;
      if (!acc[timeKey]) {
        acc[timeKey] = [];
      }
      acc[timeKey].push(slot);
      
      // Debug: Check if this time group has potential staff conflicts
      if (acc[timeKey].length > 1) {
        console.log('Multiple slots in time group:', {
          timeKey,
          slots: acc[timeKey].map(s => ({
            staff: s.staff_name,
            staffId: s.staff_id,
            subject: s.subject_name,
            class: s.class_id,
            course: s.course_id
          }))
        });
      }
      
      return acc;
    }, {});

    return groups;
  };
  // Add this function to check for staff conflicts
  const checkStaffConflict = (currentSlot, allSlots) => {
    // Skip if no subject/staff or if it's a free/lunch slot
    if (!currentSlot.subject_name || 
        !currentSlot.staff_id || 
        !currentSlot.staff_name || 
        currentSlot.slot_type === 'free' || 
        currentSlot.slot_type === 'lunch') {
      return false;
    }

    // Only check against active teaching slots
    const activeSlots = allSlots.filter(s => 
      s.subject_name && // has subject
      s.staff_id && // has staff
      !['free', 'lunch'].includes(s.slot_type) // is a class slot
    );

    console.log('Checking active slot:', {
      subject: currentSlot.subject_name,
      staff: currentSlot.staff_name,
      staffId: currentSlot.staff_id,
      day: currentSlot.day,
      time: `${currentSlot.start_time}-${currentSlot.end_time}`,
      totalActive: activeSlots.length
    });

    const conflicts = activeSlots.filter(slot => {
      // Skip same slot
      if (slot === currentSlot) return false;

      // Handle both single staff IDs and comma-separated staff IDs
      const currentStaffIds = String(currentSlot.staff_id).split(',');
      const slotStaffIds = String(slot.staff_id).split(',');

      // Check if any staff member is shared between the slots
      const hasSharedStaff = currentStaffIds.some(id => slotStaffIds.includes(id));

      // Check for same staff at same time
      const isConflict = 
        hasSharedStaff && // Same staff
        slot.day === currentSlot.day && // Same day
        slot.start_time === currentSlot.start_time; // Same time

      if (isConflict) {
        console.log('Found conflict:', {
          current: {
            subject: currentSlot.subject_name,
            staff: currentSlot.staff_name,
            staffIds: currentStaffIds,
            semester: currentSlot.semester
          },
          conflict: {
            subject: slot.subject_name,
            staff: slot.staff_name,
            staffIds: slotStaffIds,
            semester: slot.semester
          }
        });
      }

      return isConflict;
    });

    return conflicts.length > 0;
  };

  const renderSlot = (slots) => {
    if (!slots || slots.length === 0) return <div className="text-gray-500 font-medium text-xs">-</div>;

    // Debug logging for slot data
    console.log('Rendering slot data:', {
      slots: slots.map(s => ({
        id: s.id,
        subject: s.subject_name,
        staff: s.staff_name,
        staffId: s.staff_id,
        type: s.slot_type,
        day: s.day,
        time: `${s.start_time}-${s.end_time}`,
        semester: s.semester
      }))
    });

    // Group slots by time
    const timeGroups = groupSlotsByTime(slots);
    
    // Debug logging for time groups
    console.log('Time groups:', {
      groups: Object.entries(timeGroups).map(([time, groupSlots]) => ({
        time,
        count: groupSlots.length,
        slots: groupSlots.map(s => ({
          subject: s.subject_name,
          staff: s.staff_name,
          staffId: s.staff_id
        }))
      }))
    });

    const firstTimeGroup = Object.values(timeGroups)[0];

    // Check for minor elective pair slots
    const isElectivePair = firstTimeGroup.length > 1 && firstTimeGroup.every(s => 
      s.subject_category === 'Minor(Elective)' || s.subject_category === 'Minor (Elective)' || 
      s.subject_category?.toLowerCase() === 'elective' || s.slot_type === 'minor'
    );

    if (isElectivePair) {
      const [subject1, subject2] = firstTimeGroup;
      return (
        <div className="text-sm p-1 bg-yellow-50 border-l-4 border-yellow-400">
          <div className="grid grid-cols-2 gap-1">
            <div className="border-r border-yellow-300 pr-1">
              <div className="font-medium text-xs truncate">{subject1.subject_name}</div>
              <div className="text-gray-500 text-xs truncate">{subject1.staff_name || 'No Staff'}</div>
            </div>
            <div className="pl-1">
              <div className="font-medium text-xs truncate">{subject2.subject_name}</div>
              <div className="text-gray-500 text-xs truncate">{subject2.staff_name || 'No Staff'}</div>
            </div>
          </div>
          <div className="text-xs text-center text-gray-500 mt-1 border-t border-yellow-300">
            Minor Elective
          </div>
        </div>
      );
    }    // Regular slot rendering
    const slot = firstTimeGroup[0]; // Get the first slot from the time group
      // Get all slots from all courses for staff conflict check
    const allSlots = Object.values(timetableData.data).flat();
    
    // Debug the raw timetable data structure
    console.log('Raw timetable data:', {
      keys: Object.keys(timetableData.data),
      structure: Object.entries(timetableData.data).map(([key, slots]) => ({
        key,
        slotsCount: slots.length,
        sampleSlot: slots[0]
      }))
    });
    
    // Debug all flattened slots
    console.log('All flattened slots:', {
      total: allSlots.length,
      slots: allSlots.map(s => ({
        staff: s.staff_name,
        staffId: s.staff_id,
        day: s.day,
        time: `${s.start_time}-${s.end_time}`,
        semester: s.semester,
        course: s.course_id,
        subject: s.subject_name
      }))
    });
    
    console.log('Checking conflicts for current slot:', {
      staff: slot.staff_name,
      staffId: slot.staff_id,
      subject: slot.subject_name,
      time: `${slot.start_time}-${slot.end_time}`,
      day: slot.day,
      semester: slot.semester,
      course: slot.course_id,
      totalSlotsToCheck: allSlots.length
    });
    
    const hasStaffConflict = checkStaffConflict(slot, allSlots);
    
    return (
      <div className={`text-sm p-1 ${
        hasStaffConflict ? 'bg-red-100 border-l-4 border-red-500' :
        slot.slot_type === 'lab' ? 'bg-[#e9e4f1ea]' :
        slot.slot_type === 'lunch' ? 'bg-gray-50' :
        slot.slot_type === 'free' ? 'bg-green-50' :
        slot.slot_type === 'ge' ? 'bg-purple-50' :
        slot.subject_category === 'Minor(Elective)' || slot.slot_type === 'minor' ? 'bg-[#f0dadcde]' : ''
      }`}>
        <div className={`font-medium text-xs ${hasStaffConflict ? 'text-red-700' : ''}`}>
          {slot.slot_type === 'free' ? 'FREE' :
           slot.slot_type === 'lunch' ? 'Lunch Break' :     
           slot.slot_type === 'ge' ? 'General Elective' :
           slot.slot_type === 'lab' ? `${slot.subject_name} (Lab)` :
           slot.subject_name}
        </div>
        {slot.slot_type !== 'free' && slot.slot_type !== 'lunch' && slot.slot_type !== 'ge' && (
          <div className={`text-xs ${hasStaffConflict ? 'text-red-600' : 'text-gray-600'}`}>
            {slot.staff_name || 'No Staff'}
            {hasStaffConflict && (
              <div className="text-red-500 text-xs font-medium mt-1">
                Staff Conflict!
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  const handleSaveTimetable = async () => {
    if (!timetableName.trim()) {
      setSaveStatus('Please enter a name for the timetable');
      return;
    }
    
    try {
      const courseId = Object.keys(timetableData.data)[0].split('-')[0];
      const course = courseList.find(c => String(c.course_id) === String(courseId));
      
      if (!course) {
        setSaveStatus('Error: Course not found');
        return;
      }

      // Get modified timetable data including any edits
      const modifiedData = getModifiedTimetableData();
      
      // Add the necessary properties to each slot
      Object.keys(modifiedData).forEach(key => {
        modifiedData[key] = modifiedData[key].map(slot => ({
          ...slot,
          start_time: slot.start_time,
          end_time: slot.end_time,
          semester: key.split('-')[1],
          course_id: parseInt(courseId),
          day: days.indexOf(slot.day)
        }));
      });      console.log('Saving timetable with data:', {
        name: timetableName,
        courseId,
        departmentId: course.department_id,
        schoolId: course.school_id
      });

      const response = await axios.post(`${apiPath}/api/saved-timetables/save`, {
        name: timetableName,
        timetable_data: modifiedData,
        course_id: parseInt(courseId),
        department_id: course.department_id,
        school_id: course.school_id,
        course_name: course.course_name
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });

      if (response.data.success) {
        setSaveStatus('Timetable saved successfully!');
        setTimeout(() => {
          setShowSaveDialog(false);
          setSaveStatus('');
          setTimetableName('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error saving timetable:', error);
      setSaveStatus('Error saving timetable. Please try again.');
    }
  };
  const handleCellEdit = (day, slot, semester, slotData) => {
    setCurrentEdit({
      day,
      slot,
      semester,
      data: Array.isArray(slotData) && slotData.length > 0 ? slotData[0] : {
        subject_name: '',
        staff_name: '',
        slot_type: 'theory'
      }
    });
    setShowEditDialog(true);
  };

  const handleCellUpdate = (updatedData) => {
    if (!currentEdit) return;
    
    const { day, slot, semester } = currentEdit;
    const cellKey = `${day}-${slot}-${semester}`;
    
    setEditedData(prev => ({
      ...prev,
      [cellKey]: [updatedData]
    }));
    
    setShowEditDialog(false);
    setCurrentEdit(null);
  };
  // Modify the slot data before saving
  const getModifiedTimetableData = () => {
    const modifiedData = { ...timetableData.data };
    
    // First apply any edits
    Object.entries(editedData).forEach(([key, value]) => {
      const [day, slot, semester] = key.split('-');
      const courseKey = Object.keys(modifiedData).find(k => k.endsWith(`-${semester}`));
      if (courseKey && modifiedData[courseKey]) {
        const dayIndex = days.indexOf(day);
        const [startTime, endTime] = slot.split('-');
        
        // Find if there's an existing slot to update
        const existingSlotIndex = modifiedData[courseKey].findIndex(s => 
          s.day === dayIndex && 
          s.start_time === startTime && 
          s.end_time === endTime
        );

        if (existingSlotIndex >= 0) {
          // Update existing slot
          modifiedData[courseKey][existingSlotIndex] = {
            ...modifiedData[courseKey][existingSlotIndex],
            ...value[0],
            day: day, // Store the day name instead of index for better readability
            start_time: startTime,
            end_time: endTime
          };
        } else {
          // Add new slot
          modifiedData[courseKey].push({
            ...value[0],
            day: day,
            start_time: startTime,
            end_time: endTime,
            semester: semester,
          });
        }
      }
    });
    
    return modifiedData;
  };

  useEffect(() => {
    // Inject print styles
    const style = document.createElement('style');
    style.innerHTML = printStyles;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const handlePrint = () => {
    window.print();
  };

  // Additional helper functions
  const convertTo12HourFormat = (time24) => {
    const [hours, minutes] = time24.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (!courseClassTables.length) {
    return <div>No timetable data to display.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setShowSaveDialog(true)}
          className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded no-print"
        >
          Save Timetable
        </button>
        <button
          onClick={handlePrint}
          className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded no-print"
        >
          Print Timetable
        </button>
      </div>
      
      <div className="timetable-container">
        {courseClassTables.map(({ courseId, semesters, timeSlots, timetable }) => {
          const courseName = courseList?.find(c => String(c.course_id) === String(courseId))?.course_name || `Course ${courseId}`;
          return (
            <div key={courseId} className="mb-8">
              <h3 className="text-lg font-bold mb-2">
                Course: {courseName}
              </h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead>
                    <tr>
                      <th className="border p-2 bg-gray-200" rowSpan={2}>Day</th>
                      <th className="border p-2 bg-gray-200" rowSpan={2}>Semester</th>
                      {timeSlots.map(slot => (
                        <th key={slot} className="border p-2 bg-gray-200">
                          {slot}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {days.map(day => (
                      semesters.map(semester => (
                        <tr key={`${day}-${semester}`}>
                          {semester === semesters[0] && (
                            <td className="border p-2 font-semibold bg-gray-100" rowSpan={semesters.length}>
                              {day}
                            </td>
                          )}
                          <td className="border p-2 bg-gray-50">Sem {semester}</td>                        
                          {timeSlots.map(slot => {
                            const cellKey = `${day}-${slot}-${semester}`;
                            const slotData = editedData[cellKey] || timetable[day][slot][semester] || [];
                            
                            return (
                              <td 
                                key={cellKey} 
                                className="border p-1 relative cursor-pointer hover:bg-gray-50"
                                onClick={() => handleCellEdit(day, slot, semester, slotData)}
                              >
                                {renderSlot(slotData)}
                              </td>
                            );
                          })}
                        </tr>
                      ))
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Dialog */}
      {showEditDialog && currentEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Edit Cell</h3>
            <form onSubmit={(e) => {
              e.preventDefault();
              handleCellUpdate(currentEdit.data);
            }}>
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Subject Name</label>
                <input
                  type="text"
                  value={currentEdit.data.subject_name || ''}
                  onChange={(e) => setCurrentEdit(prev => ({
                    ...prev,
                    data: { ...prev.data, subject_name: e.target.value }
                  }))}
                  className="w-full p-2 border rounded"
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Staff Name</label>
                <input
                  type="text"
                  value={currentEdit.data.staff_name || ''}
                  onChange={(e) => setCurrentEdit(prev => ({
                    ...prev,
                    data: { ...prev.data, staff_name: e.target.value }
                  }))}
                  className="w-full p-2 border rounded"
                />
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Slot Type</label>
                <select
                  value={currentEdit.data.slot_type || 'theory'}
                  onChange={(e) => setCurrentEdit(prev => ({
                    ...prev,
                    data: { ...prev.data, slot_type: e.target.value }
                  }))}
                  className="w-full p-2 border rounded"
                >
                  <option value="theory">Theory</option>
                  <option value="lab">Lab</option>
                  <option value="free">Free</option>
                  <option value="lunch">Lunch</option>
                </select>
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditDialog(false);
                    setCurrentEdit(null);
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-bold mb-4">Save Timetable</h3>
            <input
              type="text"
              value={timetableName}
              onChange={(e) => setTimetableName(e.target.value)}
              placeholder="Enter timetable name"
              className="w-full p-2 border rounded mb-4"
            />
            {saveStatus && (
              <p className={`text-sm mb-4 ${
                saveStatus.includes('success') ? 'text-green-600' : 'text-red-600'
              }`}>
                {saveStatus}
              </p>
            )}
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => {
                  setShowSaveDialog(false);
                  setSaveStatus('');
                  setTimetableName('');
                }}
                className="px-4 py-2 text-gray-600 hover:text-gray-800"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveTimetable}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableTable;
