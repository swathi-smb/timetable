import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TimetableTable from './TimetableTable';
import { jwtDecode } from 'jwt-decode';
import { apiPath } from '../path/apiPath';

const StudentDashboard = () => {
  const [selectedSemesterType, setSelectedSemesterType] = useState('even');
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [studentDetails, setStudentDetails] = useState(null);
  const [courses, setCourses] = useState([]);
  const navigate = useNavigate();

  const timeConfig = {
    workingDays: 5,
    dayStart: '10:00',
    dayEnd: '18:30',
    lunchStart: '13:00',
    lunchEnd: '14:00',
    theoryDuration: 60,
    labDuration: 120,
    geStart: '17:30',
    geEnd: '18:30'
  };

  // Fetch student details when component mounts
  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    try {
      const decodedToken = jwtDecode(token);
      if (!decodedToken.userId) {
        console.error('No userId found in token:', decodedToken);
        setError('Invalid token: no user ID found');
        return;
      }
      console.log('Fetching student details for userId:', decodedToken.userId);
      fetchStudentDetails(decodedToken.userId);
    } catch (error) {
      console.error('Error decoding token:', error);
      setError('Invalid token');
      navigate('/login');
    }
  }, []);

  const handleGetTimetable = () => {
    fetchTimetable();
  };

  const fetchStudentDetails = async (userId) => {
    try {
      const token = sessionStorage.getItem('token');
      console.log('Fetching student details for userId:', userId);
      console.log('Using token:', token);
      
      const response = await axios.get(`${apiPath}/api/users/details/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Raw response from server:', response);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      console.log('Student details received:', response.data);
      
      // Validate required fields
      if (!response.data.school || !response.data.department || !response.data.course || !response.data.semester) {
        console.error('Missing required fields in student details:', {
          school: response.data.school,
          department: response.data.department,
          course: response.data.course,
          semester: response.data.semester
        });
        throw new Error('Missing required student information in server response');
      }

      setStudentDetails({
        name: response.data.name,
        school: response.data.school,
        department: response.data.department,
        course: response.data.course,
        schoolName: response.data.schoolName,
        departmentName: response.data.departmentName,
        courseName: response.data.courseName,
        semester: response.data.semester
      });

      console.log('Student details set in state:', {
        name: response.data.name,
        school: response.data.school,
        department: response.data.department,
        course: response.data.course,
        schoolName: response.data.schoolName,
        departmentName: response.data.departmentName,
        courseName: response.data.courseName,
        semester: response.data.semester
      });
    } catch (error) {
      console.error('Error fetching student details:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError('Failed to fetch student details: ' + (error.response.data.message || 'Server error'));
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('No response received from server');
      } else {
        setError('Failed to fetch student details: ' + error.message);
      }
    }
  };

  const fetchTimetable = async () => {
    if (!studentDetails) {
      setError('Student details not loaded. Please try again.');
      return;
    }

    // Validate all required student details
    if (!studentDetails.school || !studentDetails.department || !studentDetails.course || !studentDetails.semester) {
      setError('Missing required student information. Please contact your administrator.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const token = sessionStorage.getItem('token');
      
      console.log('Student Details:', {
        school: studentDetails.school,
        department: studentDetails.department,
        course: studentDetails.course,
        semester: studentDetails.semester
      });

      // Determine semester type (odd/even) based on student's semester
      const semesterType = parseInt(studentDetails.semester) % 2 === 0 ? 'even' : 'odd';

      // Fetch saved timetable for student's specific semester
      const timetableResponse = await axios.get(`${apiPath}/api/timetable/generated`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          school_id: studentDetails.school,
          department_id: studentDetails.department,
          semesterType: semesterType
        }
      });

      console.log('Raw Timetable Response:', timetableResponse.data);

      if (timetableResponse.data && timetableResponse.data.length > 0) {
        // Filter data for student's semester only
        const studentSemesterData = timetableResponse.data.filter(entry => {
          const matchesCourse = String(entry.course_id) === String(studentDetails.course);
          const matchesSemester = String(entry.semester) === String(studentDetails.semester);
          
          console.log('Checking entry:', {
            entryCourse: entry.course_id,
            entrySemester: entry.semester,
            studentCourse: studentDetails.course,
            studentSemester: studentDetails.semester,
            matchesCourse,
            matchesSemester
          });
          
          return matchesCourse && matchesSemester;
        });

        console.log('Filtered Timetable Data:', studentSemesterData);

        if (studentSemesterData.length === 0) {
          setTimetable(null);
          setError(`No timetable found for semester ${studentDetails.semester}. Please contact your administrator.`);
          return;
        }

        // Group data by course and semester
        const groupedData = studentSemesterData.reduce((acc, entry) => {
          const key = `${entry.course_id}-${entry.semester}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(entry);
          return acc;
        }, {});

        console.log('Grouped Timetable Data:', groupedData);

        setTimetable({ data: groupedData });
        setError(null);
      } else {
        setTimetable(null);
        setError('No timetable found for your semester. Please contact your administrator.');
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      if (error.response) {
        console.error('Error response:', error.response.data);
        setError(error.response.data.message || 'Failed to fetch timetable');
      } else if (error.request) {
        console.error('Error request:', error.request);
        setError('No response received from server');
      } else {
        setError(error.message || 'Failed to fetch timetable');
      }
      setTimetable(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    navigate('/');
  };

  if (!studentDetails) {
    return <div className="text-center p-4">Loading student details...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Student Dashboard</h2>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors"
          >
            Logout
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <p className="text-gray-600">Name: <span className="font-semibold">{studentDetails.name}</span></p>
            <p className="text-gray-600">School: <span className="font-semibold">{studentDetails.schoolName}</span></p>
            <p className="text-gray-600">Department: <span className="font-semibold">{studentDetails.departmentName}</span></p>
          </div>
          <div>
            <p className="text-gray-600">Course: <span className="font-semibold">{studentDetails.courseName}</span></p>
            <p className="text-gray-600">Semester: <span className="font-semibold">{studentDetails.semester}</span></p>
          </div>
        </div>

        {/* <div className="mb-4">
          <label className="block text-gray-700 text-sm font-bold mb-2">
            Semester Type
          </label>
          <select
            value={selectedSemesterType}
            onChange={(e) => setSelectedSemesterType(e.target.value)}
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          >
            <option value="odd">Odd Semester</option>
            <option value="even">Even Semester</option>
          </select>
        </div> */}

        <button
          onClick={fetchTimetable}
          disabled={loading}
          className={`w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors ${
            loading ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {loading ? 'Loading...' : 'View Timetable'}
        </button>

        {error && (
          <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {timetable && (
          <div className="mt-6">
            <TimetableTable
              timetableData={timetable}
              timeConfig={timeConfig}
              courseList={courses}
              isSavedTimetable={true}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;