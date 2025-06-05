import { useState, useEffect } from "react";
import axios from "axios";
import TimetableGeneratorNew from "./TimetableGeneratorNew";
import TimetableTable from "./TimetableTable";
import { apiPath } from '../path/apiPath';

function ManageTimetable() {
  const [showGenerator, setShowGenerator] = useState(false);
  const [generatedTimetables, setGeneratedTimetables] = useState([]);

  const [showSchools, setShowSchools] = useState(false);
  const [openSchoolId, setOpenSchoolId] = useState(null);
  const [openDepartmentId, setOpenDepartmentId] = useState(null);
  const [openCourseId, setOpenCourseId] = useState(null);
  const [openClassId, setOpenClassId] = useState(null);
  const [validationErrors, setValidationErrors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState({});
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState({});
  const [sections, setSections] = useState({});
  const [subjects, setSubjects] = useState([]);

  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState('');

  // New state for staff-subject allocations
  const [subjectAllocations, setSubjectAllocations] = useState([]);
  const [isAllocationSaved, setIsAllocationSaved] = useState(false);
  const [staffList, setStaffList] = useState([]); // Store complete staff objects
  const [timeConfig, setTimeConfig] = useState({
    workingDays: 5,
    dayStart: '10:00',
    dayEnd: '18:30', // Changed to include the last slot time
    lunchStart: '13:00',
    lunchEnd: '14:00',
    theoryDuration: 60,
    labDuration: 120,
    geStart: '17:30',  // Add GE start time
    geEnd: '18:30'     // Add GE end time
  });
  const [semesterType, setSemesterType] = useState('odd'); // or 'even'  
  
  const handleGenerateComplete = (timetableData) => {
    console.log('Generated timetable data:', timetableData);

    // If timetableData.data is an array (flat array of slots), group by course-semester key
    let groupedData = {};
    if (Array.isArray(timetableData.data)) {
      groupedData = timetableData.data.reduce((acc, slot) => {
        const courseId = slot.course_id || 'unknownCourse';
        const semester = slot.semester || slot.class_semester || 'unknownSemester';
        const key = `${courseId}-${semester}`;
        if (!acc[key]) acc[key] = [];
        acc[key].push(slot);
        return acc;
      }, {});
    } else {
      groupedData = timetableData.data;
    }

    // Process the timetable data to ensure semester information is included
    const processedData = {
      ...timetableData,
      data: Object.entries(groupedData).reduce((acc, [key, slots]) => {
        // Get all semester information from slots
        const semesters = slots.map(slot => slot.semester || slot.class_semester)
          .filter(Boolean); // Filter out undefined/null values

        // Use the most common semester value or fall back to the first available
        const semester = semesters.length > 0
          ? semesters.reduce((a, b, i, arr) =>
              (arr.filter(v => v === a).length >= arr.filter(v => v === b).length ? a : b))
          : undefined;

        const [courseId] = key.split('-');
        const newKey = `${courseId}-${semester}`;

        // Ensure each slot has semester information
        acc[newKey] = slots.map(slot => ({
          ...slot,
          semester: slot.semester || slot.class_semester || semester
        }));
        return acc;
      }, {})
    };

    console.log('Processed timetable data:', processedData);
    setGeneratedTimetables([processedData]);
    setShowGenerator(false);
  };

  // Fetch Schools
  useEffect(() => {
    axios.get(`${apiPath}/api/schools`)
      .then((res) => setSchools(res.data))
      .catch(error => console.error("Error fetching schools:", error));
  }, []);

  // Fetch courses when selectedDepartment or selectedSchool changes, then fetch staff and subjects
  useEffect(() => {
    if (selectedSchool && selectedDepartment) {
      setIsLoading(true);
      axios.get(`${apiPath}/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } })
        .then(res => {
          console.log("Raw courses response:", JSON.stringify(res.data, null, 2));
          const coursesData = Array.isArray(res.data) ? res.data : [res.data];
          // Ensure all course_ids are strings for consistent comparison
          const normalizedCourses = coursesData.map(course => ({
            ...course,
            course_id: String(course.course_id)
          }));
          
          // First set the courses
          setCourses(normalizedCourses);
          console.log("Normalized courses:", normalizedCourses);
          
          // Then fetch staff and subjects sequentially using the normalized courses
          return fetchStaff().then(() => fetchSubjects(normalizedCourses));
        })
        .catch(error => {
          console.error("Error fetching courses:", error);
          setCourses([]);
        })
        .finally(() => setIsLoading(false));
    } else {
      setCourses([]);
    }
  }, [selectedSchool, selectedDepartment]);

  // Fetch Departments when school is selected
  const fetchDepartments = async (schoolId) => {
    try {
      const url = `${apiPath}/api/schools/${schoolId}/departments`;
      console.log("Fetching departments for school:", schoolId);

      if (!departments[schoolId]) {
        const res = await axios.get(url);
        const fetchedDepartments = Array.isArray(res.data) ? res.data : [res.data];
        console.log("Fetched departments:", fetchedDepartments);

        setDepartments((prev) => ({ ...prev, [schoolId]: fetchedDepartments }));
        setSelectedSchool(schoolId);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      if (error.response?.status === 404) {
        alert("No departments found for this school.");
      } else {
        alert("Error fetching departments. Please try again.");
      }
      // Initialize with empty array to prevent mapping errors
      setDepartments((prev) => ({ ...prev, [schoolId]: [] }));
    }
  };

  // Fetch Staff for selected department
  const fetchStaff = async () => {
    try {
      if (!selectedSchool || !selectedDepartment) {
        alert("Please select both school and department to fetch staff.");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authorization token missing");
      }

      const response = await axios.get(
        `${apiPath}/api/staff`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.length > 0) {
        setStaffList(response.data);
        console.log("Fetched staff:", response.data);
        // Fetch subjects after getting staff
        fetchSubjects();
      } else {
        console.warn("No staff found.");
        alert("No staff found for the selected department.");
      }
    } catch (error) {
      console.error("Error fetching staff:", error);
      alert(error.response?.data?.message || "There was an issue fetching the staff.");
    }
  };

  // Fetch all subjects for the department
  const fetchSubjects = async (coursesData = null) => {
    try {
      if (!selectedSchool || !selectedDepartment) {
        console.warn("School and department must be selected to fetch subjects.");
        return;
      }

      const currentCourses = coursesData || courses;
      console.log("Using courses for subject mapping:", currentCourses);

      const response = await axios.get(
        `${apiPath}/api/timetable/subjects`,
        {
          params: {
            school_id: selectedSchool,
            department_id: selectedDepartment
          },
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      if (response.data && response.data.length > 0) {
        setSubjects(response.data);
        console.log("Fetched subjects:", response.data);
        
        // Initialize allocations with normalized course ID matching
        const initialAllocations = response.data.map(subject => {
          const subjectCourseId = String(subject.course_id);
          console.log(`Looking for course with ID ${subjectCourseId} for subject ${subject.subject_name}`);
          console.log("Available courses:", currentCourses.map(c => ({id: c.course_id, name: c.course_name})));
          
          const course = currentCourses.find(course => String(course.course_id) === subjectCourseId);
          
          if (!course) {
            console.warn(`No course found for subject ${subject.subject_name} (${subject.subject_id}) with course_id ${subjectCourseId}`);
          } else {
            console.log(`Found matching course for ${subject.subject_name}:`, course);
          }
          
          return {
            subject_id: subject.subject_id,
            subject_name: subject.subject_name,
            theory_credits: subject.theory_credits,
            lab_credits: subject.lab_credits,
            staff_id: subject.staff_id || null,
            staff_name: subject.Staff ? subject.staff_name : null,
            course_id: subjectCourseId,
            course_name: course?.course_name || `Course ${subjectCourseId}`
          };
        });
        
        console.log("Setting subject allocations:", initialAllocations);
        setSubjectAllocations(initialAllocations);
      } else {
        console.warn("No subjects found.");
        setSubjects([]);
        setSubjectAllocations([]);
      }
    } catch (error) {
      console.error("Error fetching subjects:", error);
      console.error("Error details:", error.response?.data);
      alert("Error fetching subjects. Please try again.");
    }
  };

  // Handle staff selection for a subject
  const handleStaffSelection = (subjectId, staffId) => {
    const selectedStaff = staffList.find(staff => staff.staff_id === staffId);

    setSubjectAllocations(prev =>
      prev.map(allocation =>
        allocation.subject_id === subjectId
          ? {
            ...allocation,
            staff_id: staffId,
            staff_name: selectedStaff ? selectedStaff.name : null
          }
          : allocation
      )
    );
  };

  // Save allocations to backend
  const saveAllocations = async () => {
    try {
      setValidationErrors([]);

      // Filter out allocations without staff
      const validAllocations = subjectAllocations
        .filter(a => a.staff_id)
        .map(({ subject_id, subject_name, staff_id, staff_name, theory_credits, lab_credits, course_id }) => ({
          school_id: selectedSchool,
          department_id: selectedDepartment,
          course_id,
          subject_id,
          subject_name,
          staff_id,
          staff_name,
          theory_credits,
          lab_credits
        }));

      if (validAllocations.length === 0) {
        setValidationErrors(["Please assign staff to at least one subject"]);
        return;
      }

      const response = await axios.post(
        `${apiPath}/api/timetable/allocate`,
        {
          allocations: validAllocations,
          timeConfig: {
            workingDays: timeConfig.workingDays,
            dayStart: timeConfig.dayStart,
            dayEnd: timeConfig.dayEnd,
            lunchStart: timeConfig.lunchStart,
            lunchEnd: timeConfig.lunchEnd,
            theoryDuration: timeConfig.theoryDuration,
            labDuration: timeConfig.labDuration
          }
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            'Content-Type': 'application/json'
          }
        }
      );

      setIsAllocationSaved(true);
      setTimeout(() => setIsAllocationSaved(false), 3000);
      alert("Allocations saved successfully!");
    } catch (error) {
      console.error("Error saving allocations:", error);

      const errorMessage = error.response?.data?.error ||
        error.response?.data?.message ||
        "Failed to save allocations";

      if (error.response?.data?.errors) {
        setValidationErrors(error.response.data.errors);
      } else {
        setValidationErrors([errorMessage]);
      }
    }
  };

  // Handle time configuration changes
  const handleTimeConfigChange = (field, value) => {
    setTimeConfig(prev => {
      // Validate number inputs
      if (field === "workingDays") {
        const numValue = parseInt(value);
        if (isNaN(numValue) || numValue < 1 || numValue > 7) return prev;
        value = numValue;
      }
      
      // Validate time inputs
      if (field.includes("time") || field.includes("Start") || field.includes("End")) {
        if (!value.match(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/)) return prev;
      }

      return {
        ...prev,
        [field]: value
      };
    });
  };

  return (
    <div className="p-4 max-w-7xl mx-auto">
      {/* School & Department Selection */}
      <div className="mb-6">
        <div className="relative inline-block">
          <button
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:bg-indigo-700 transition"
            onClick={() => setShowSchools(!showSchools)}
          >
            {selectedSchool ? "Change School" : "Select School"}
          </button>

          {showSchools && (
            <div className="absolute z-20 mt-2 bg-white shadow-2xl rounded-lg w-72 border">
                  <div className="bg-indigo-100 text-indigo-800 font-medium px-4 py-2">
                    School
                  </div>
              {schools.map((school) => (
                <div key={school.school_id} className="relative">
                  <button
                    className="w-full text-left px-4 py-2 hover:bg-indigo-50"                    
                    onClick={() => {
                      setOpenSchoolId(school.school_id);
                      fetchDepartments(school.school_id);
                      setSelectedDepartment(''); // Clear previous department selection
                      setSubjects([]); // Clear previous subjects
                      setStaffList([]); // Clear previous staff
                    }}
                  >
                    {school.school_name}
                  </button>

                  {/* Departments */}
                  {openSchoolId === school.school_id &&
                    departments[school.school_id] && (
                      <div className="absolute left-full top-0 bg-white shadow-xl rounded-lg w-64 border">
                        <div className="bg-indigo-100 text-indigo-800 px-4 py-2 font-medium">
                          Departments
                        </div>
                        {departments[school.school_id].map((dept) => (                          <button
                            key={dept.department_id}
                            className="block w-full text-left px-4 py-2 hover:bg-indigo-50"
                            onClick={() => {
                              setSelectedDepartment(dept.department_id);
                              setShowSchools(false);
                            }}
                          >
                            {dept.department_name}
                          </button>
                        ))}
                      </div>
                    )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 🕒 Time Configuration */}
      <div className="p-6 bg-white rounded-lg shadow-lg mb-6 border">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Time Configuration</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">          {[
            { label: "Working Days", key: "workingDays", type: "number", min: 1, max: 7 },
            { label: "Day Start", key: "dayStart", type: "time" },
            { label: "Day End", key: "dayEnd", type: "time" },
            { label: "Lunch Start", key: "lunchStart", type: "time" },
            { label: "Lunch End", key: "lunchEnd", type: "time" },
            { label: "GE Start", key: "geStart", type: "time" },
            { label: "GE End", key: "geEnd", type: "time" }
          ].map(({ label, key, type, ...rest }) => (
            <div key={key}>
              <label className="block text-sm font-medium text-gray-700">{label}</label>
              <input
                type={type}
                value={timeConfig[key]}
                onChange={(e) => handleTimeConfigChange(key, e.target.value)}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                {...rest}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Semester Type Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">Semester Type</label>
        <select
          value={semesterType}
          onChange={e => setSemesterType(e.target.value)}
          className="px-3 py-2 border rounded w-full"
        >
          <option value="odd">Odd Semester (1, 3, 5...)</option>
          <option value="even">Even Semester (2, 4, 6...)</option>
        </select>
      </div>

      {/* 📚 Subject Allocations */}
      <div className="mt-6">
        {staffList.length > 0 && (
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Available Staff</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList.map(staff => (
                <div key={staff.staff_id} className="bg-white p-4 rounded shadow">
                  <p className="font-medium">{staff.name}</p>
                  <p className="text-sm text-gray-600">ID: {staff.staff_id}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <h3 className="text-xl font-semibold mb-4">Subject Allocations</h3>
        {subjects.length > 0 ? (
          <div className="space-y-4">
            {subjectAllocations.map(allocation => (
              <div key={allocation.subject_id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="w-1/3">
                  <span className="font-medium">{allocation.subject_name}</span>
                  <div className="text-sm text-gray-600">
                    Course: {allocation.course_name} <br />
                    Credits: {allocation.theory_credits}+{allocation.lab_credits}
                  </div>
                </div>

                <select
                  className="flex-1 p-2 border rounded"
                  value={allocation.staff_id || ""}
                  onChange={(e) => handleStaffSelection(allocation.subject_id, parseInt(e.target.value))}
                >
                  <option value="">Select Staff</option>
                  {staffList.map((staff) => (
                    <option key={staff.staff_id} value={staff.staff_id}>
                      {staff.name}
                    </option>
                  ))}
                </select>

                {allocation.staff_name && (
                  <span className="text-sm text-gray-600">Selected: {allocation.staff_name}</span>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">Please select a school and department to load subjects.</p>
        )}

        <div className="flex justify-center m-4">
          <button
            className={`px-4 py-2 rounded text-white transition ${isAllocationSaved ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            onClick={saveAllocations}
            disabled={isAllocationSaved}
          >
            {isAllocationSaved ? "Allocations Saved!" : "Save Allocations"}
          </button>
        </div>
      </div>

      {/* 📅 Timetable Generation */}
      <div className="mt-8">
        <button
          onClick={() => setShowGenerator(true)}
          disabled={subjectAllocations.length === 0}
          className={`px-4 py-2 rounded text-white transition ${subjectAllocations.length === 0 ? "bg-gray-400" : "bg-purple-600 hover:bg-purple-700"}`}
        >
          Proceed
        </button>

        {showGenerator && (
          <TimetableGeneratorNew
            schoolId={selectedSchool}
            departmentId={selectedDepartment}
            allocatedSubjects={subjectAllocations}
            staffList={staffList}
            timeConfig={timeConfig}
            semesterType={semesterType}
            onGenerateComplete={handleGenerateComplete}
          />
        )}

        {generatedTimetables.length > 0 && (
          <div className="mt-8">
            <h3 className="text-xl font-semibold mb-4">Generated Timetables</h3>
            {generatedTimetables.map((timetable, index) => (
              <div key={index} className="mb-8">
                <div className="bg-white p-4 rounded shadow">
                  <TimetableTable
                    timetableData={timetable}
                    allocatedSubjects={subjectAllocations}
                    staffList={staffList}
                    timeConfig={timeConfig} // Added missing prop
                    courseList={courses}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageTimetable;
