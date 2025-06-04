import React, { useState } from 'react';
import TimetableTable from './TimetableTable';

const TimetableViewer = ({ timetableData, allocatedSubjects, staffList, courseList }) => {
  const [selectedCourseId, setSelectedCourseId] = useState(
    Object.keys(timetableData?.data || {})[0] || ''
  );

  if (!timetableData || !timetableData.data || Object.keys(timetableData.data).length === 0) {
    return <div>No timetable data to display.</div>;
  }

  const handleCourseChange = (e) => {
    setSelectedCourseId(e.target.value);
  };

  const selectedTimetable = timetableData.data[selectedCourseId];
  const filteredSubjects = allocatedSubjects.filter(
    (sub) => sub.course_id === Number(selectedCourseId)
  );

  const courseName = courseList?.find(c => c.course_id === Number(selectedCourseId))?.course_name || `Course ${selectedCourseId}`;

  return (
    <div className="p-4 bg-white rounded shadow mt-4">
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Select Course:</label>
        <select
          value={selectedCourseId}
          onChange={handleCourseChange}
          className="border border-gray-300 rounded p-2"
        >
          {Object.keys(timetableData.data).map(courseId => {
            const name = courseList?.find(c => c.course_id === Number(courseId))?.course_name;
            return (
              <option key={courseId} value={courseId}>
                {name || `Course ${courseId}`}
              </option>
            );
          })}
        </select>
      </div>

      <h2 className="text-lg font-bold mb-2">
        Timetable for {courseName}
      </h2>

      <TimetableTable
        timetableData={selectedTimetable}
        allocatedSubjects={filteredSubjects}
        staffList={staffList}
      />
    </div>
  );
};

export default TimetableViewer;
