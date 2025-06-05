import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import TimetableTable from './TimetableTable';
import { jwtDecode } from 'jwt-decode';
import { apiPath } from '../path/apiPath';

const StaffDashboard = () => {
  const [selectedSemesterType, setSelectedSemesterType] = useState('even');
  const [timetable, setTimetable] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [staffDetails, setStaffDetails] = useState(null);
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

  // Fetch staff details when component mounts
  useEffect(() => {
    const token = localStorage.getItem('token');
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
      console.log('Fetching staff details for userId:', decodedToken.userId);
      fetchStaffDetails(decodedToken.userId);
    } catch (error) {
      console.error('Error decoding token:', error);
      setError('Invalid token');
      navigate('/login');
    }
  }, []);

  const handleGetTimetable = () => {
    fetchTimetable();
  };

  const fetchStaffDetails = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      console.log('[StaffDashboard] Fetching staff details:', {
        userId,
        token: token ? 'Present' : 'Missing'
      });
      
      const response = await axios.get(`${apiPath}/api/users/details/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('[StaffDashboard] Raw response:', response);
      
      if (!response.data) {
        throw new Error('No data received from server');
      }
      
      console.log('[StaffDashboard] Staff details received:', response.data);
      
      setStaffDetails({
        name: response.data.name,
        school: response.data.school,
        department: response.data.department,
        schoolName: response.data.schoolName,
        departmentName: response.data.departmentName
      });
    } catch (error) {
      console.error('[StaffDashboard] Error fetching staff details:', {
        error: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      setError('Failed to fetch staff details: ' + (error.response?.data?.message || error.message));
    }
  };

  const fetchTimetable = async () => {
    if (!staffDetails) return;
    
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      // First fetch courses for the department
      const coursesResponse = await axios.get(
        `${apiPath}/api/schools/${staffDetails.school}/departments/${staffDetails.department}/courses`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const departmentCourses = Array.isArray(coursesResponse.data) ? coursesResponse.data : [];
      setCourses(departmentCourses);

      // Then fetch saved timetable
      const timetableResponse = await axios.get(`${apiPath}/api/timetable/generated`, {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          department_id: staffDetails.department,
          school_id: staffDetails.school,
          semesterType: selectedSemesterType
        }
      });

      if (timetableResponse.data && timetableResponse.data.length > 0) {
        // Group data by course and semester
        const groupedData = timetableResponse.data.reduce((acc, entry) => {
          const key = `${entry.course_id}-${entry.semester}`;
          if (!acc[key]) {
            acc[key] = [];
          }
          acc[key].push(entry);
          return acc;
        }, {});

        setTimetable({ data: groupedData });
        setError(null);
      } else {
        setTimetable(null);
        setError(`No saved timetable found for ${selectedSemesterType} semesters (${selectedSemesterType === 'odd' ? '1,3,5,7' : '2,4,6,8'})`);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
      setError(error.response?.data?.message || error.message || 'Failed to fetch timetable');
      setTimetable(null);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/');
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-[#0077b6] text-white p-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Staff Dashboard</h1>
          {staffDetails && (
            <div className="text-sm opacity-90">
              <p className="font-medium">{staffDetails.name}</p>
              <p>School: {staffDetails.schoolName} | Department: {staffDetails.departmentName} | </p>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="bg-[#c23760] hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        {/* Semester Type Selection */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Department Timetable</h2>
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <select
                  value={selectedSemesterType}
                  onChange={(e) => {
                    setSelectedSemesterType(e.target.value);
                    setTimetable(null);
                  }}
                  className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="even">Even Semester (2,4,6,8)</option>
                  <option value="odd">Odd Semester (1,3,5,7)</option>
                </select>
              </div>
              <button
                onClick={handleGetTimetable}
                className="bg-[#0077b6] text-white px-6 py-2 rounded-md hover:bg-[#005b8e] transition-colors"
                disabled={!staffDetails}
              >
                View Timetable
              </button>
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="bg-white p-6 rounded-lg shadow-md flex justify-center items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="ml-2">Loading timetable...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        )}

        {/* Timetable Display */}
        {!loading && !error && (
          <div className="bg-white p-6 rounded-lg shadow-md">
            {timetable && timetable.data && Object.keys(timetable.data).length > 0 ? (
              <div>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold mb-2">Department Timetables</h3>
                  <p className="text-sm text-gray-600">
                    Showing saved timetables for {selectedSemesterType === 'odd' ? 'Odd' : 'Even'} semesters
                  </p>
                </div>
                <div className="overflow-x-auto">
                  <TimetableTable 
                    timetableData={timetable}
                    timeConfig={timeConfig}
                    courseList={courses}
                    isSavedTimetable={true}
                  />
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600">
                <p className="text-lg font-medium">Click On View Timetable to display the Timetable</p>
                <p className="mt-2">
                  {selectedSemesterType === 'odd' 
                    ? 'Select Odd for odd semesters (1,3,5,7)'
                    : 'Select Even for even semesters (2,4,6,8)'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default StaffDashboard;