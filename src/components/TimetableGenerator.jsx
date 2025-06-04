import React, { useEffect, useState } from 'react';
import axios from '../utils/axios';

const TimetableViewer = ({
  schoolId,
  departmentId,
  allocatedSubjects,
  staffList,
  timeConfig,
  onGenerateComplete
}) => {
  const [timetableData, setTimetableData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  const generateTimetable = async () => {
    if (!schoolId || !departmentId) {
      setErrors(['School ID and Department ID are required']);
      return;
    }

    try {
      setLoading(true);
      setErrors([]);
      const token = localStorage.getItem("token");

      const currentYear = new Date().getFullYear();
      const semester = new Date().getMonth() + 1 >= 6 ? 2 : 1;
      const academic_year = `${currentYear}-${currentYear + 1}`;

      const res = await axios.post(
        '/api/timetable/generate',
        {
          school_id: schoolId,
          department_id: departmentId,
          academic_year,
          semester,
          timeConfig
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      const rawData = res.data.data;
      const daysMap = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

      const uniqueDays = [...new Set(rawData.map(i => i.day))].sort();
      const uniqueSlots = [...new Set(rawData.map(i => `${i.start_time}-${i.end_time}`))].sort(
        (a, b) => parseInt(a.split(':')[0]) - parseInt(b.split(':')[0])
      );

      const table = {};
      uniqueDays.forEach(day => {
        const dayName = daysMap[day] || `Day ${day}`;
        table[dayName] = {};
        uniqueSlots.forEach(slot => {
          table[dayName][slot] = rawData.filter(i => `${i.start_time}-${i.end_time}` === slot && i.day === day);
        });
      });

      const transformed = {
        days: uniqueDays.map(d => daysMap[d] || `Day ${d}`),
        slots: uniqueSlots,
        table
      };

      setTimetableData(transformed);
      onGenerateComplete?.(transformed);
    } catch (err) {
      console.error(err);
      setErrors([err.response?.data?.error || "Failed to fetch timetable"]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateTimetable();
  }, []);

  return (
    <div className="p-4 bg-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Department Timetable</h2>

      {errors.length > 0 && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">
          <ul>{errors.map((e, i) => <li key={i}>• {e}</li>)}</ul>
        </div>
      )}

      {loading && <p>Loading timetable...</p>}

      {timetableData && (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300">
            <thead>
              <tr>
                <th className="border p-2 bg-gray-100">Day / Time</th>
                {timetableData.slots.map(slot => (
                  <th key={slot} className="border p-2 bg-gray-100">{slot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {timetableData.days.map(day => (
                <tr key={day}>
                  <td className="border p-2 font-medium bg-gray-50">{day}</td>
                  {timetableData.slots.map(slot => {
                    const entry = timetableData.table[day][slot][0]; // take the first entry
                    const subject = allocatedSubjects.find(s => s.subject_id === entry?.subject_id);
                    const staff = staffList.find(s => s.staff_id === entry?.staff_id);

                    return (
                      <td key={slot} className="border p-2 text-sm">
                        {entry ? (
                          <>
                            <div className="font-semibold">{subject?.subject_name || 'Unknown Subject'}</div>
                            <div className="text-gray-600 text-xs">{staff?.staff_name || 'Unknown Staff'}</div>
                            <div className="text-xs capitalize text-gray-500">{entry.slot_type}</div>
                          </>
                        ) : (
                          <div className="text-gray-400">—</div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default TimetableViewer;
