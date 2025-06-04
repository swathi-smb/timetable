import React, { useState, useEffect } from "react";
import axios from "axios";

function ManageClasses() {
  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [classes, setClasses] = useState([]);
  const [sections, setSections] = useState([]);
  const [isSectionsEnabled, setIsSectionsEnabled] = useState(false);
  const [error, setError] = useState("");

  const [schoolName, setSchoolName] = useState("");
  const [departmentName, setDepartmentName] = useState("");
  const [courseName, setCourseName] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");
  const [sectionName, setSectionName] = useState("");

  const [selectedSchool, setSelectedSchool] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");

  // Fetch all schools
  useEffect(() => {
    axios.get("http://localhost:5000/api/schools")
      .then(response => setSchools(response.data))
      .catch(error => {
        console.error("Error fetching schools:", error);
        alert("Failed to fetch schools. Please try again."); // Provide user feedback
      });
  }, []);

  // Fetch departments when a school is selected
  useEffect(() => {
    if (selectedSchool) {
      axios.get(`http://localhost:5000/api/schools/${selectedSchool}/departments`)
        .then(response => setDepartments(response.data))
        .catch(error => {
          console.error("Error fetching departments:", error);
          alert("Failed to fetch departments. Please try again."); // Provide user feedback
        });
    }
  }, [selectedSchool]);

  // Fetch courses when a department is selected
  useEffect(() => {
    if (selectedDepartment) {
      axios.get(`http://localhost:5000/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses`)
        .then(response => setCourses(response.data))
        .catch(error => {
          console.error("Error fetching courses:", error);
          alert("Failed to fetch courses. Please try again.");
        });
    }
  }, [selectedDepartment]);
  //Fetch classes when course is selected
  useEffect(() => {
    if (selectedCourse) {
      axios.get(`http://localhost:5000/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses/${selectedCourse}/classes`)
        .then(response => {
          // Sort classes by semester number
          const sortedClasses = Array.isArray(response.data.classes) 
            ? response.data.classes.sort((a, b) => a.semester - b.semester)
            : [];
          setClasses(sortedClasses);
        })
        .catch(error => {
          console.error("Error fetching classes:", error);
          alert("Failed to fetch classes. Please try again.");
          setClasses([]);
        });
    } else {
      setClasses([]);
    }
  }, [selectedCourse, selectedSchool, selectedDepartment]);

  //fetch section when class is selected
  useEffect(() => {
    if (selectedSchool && selectedDepartment && selectedCourse && selectedClass) {
      axios.get(
        `http://localhost:5000/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses/${selectedCourse}/classes/${selectedClass}/sections`
      )
        .then(response => {
          setSections(Array.isArray(response.data.sections) ? response.data.sections : []);
        })
        .catch(error => {
          console.error("Error fetching sections:", error);
          alert("Failed to fetch sections. Please try again.");
        });
    } else {
      setSections([]); // Reset sections when class is unselected
    }
  }, [selectedSchool, selectedDepartment, selectedCourse, selectedClass]);


  // Add new school
  const handleAddSchool = async () => {
    if (!schoolName.trim()) {
      alert("Please enter a school name");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/schools", {
        schoolName: schoolName.trim(),
      });
      console.log(response.data); // debugging
      setSchools([...schools, {
        school_id: response.data.school.school_id,
        school_name: response.data.school.school_name
      }]);
      setSchoolName("");
    } catch (error) {
      console.error("Error adding school:", error.response?.data?.error || error.message);
      alert("Failed to add school: " + (error.response?.data?.error || error.message));
    }
  };

  // Add new department under a school
  const handleAddDepartment = async () => {
    if (!selectedSchool || !departmentName.trim()) {
      alert("Please select a school and enter a department name!");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/schools/${selectedSchool}/departments`,
        { departmentName: departmentName.trim(), addedBy: 1 }
      );

      setDepartments([...departments, {
        department_id: response.data.department.department_id,
        department_name: departmentName.trim(),
      }]);
      setDepartmentName(""); // Clear input after success
    } catch (error) {
      console.error("Error adding department:", error);
      alert("Failed to add department. Please try again.");
    }
  };

  // Delete school
  const handleDeleteSchool = async (schoolId) => {
    if (!window.confirm("Are you sure you want to delete this school?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/schools/${selectedSchool}`);
      // Refresh the school list
      const updatedSchools = await axios.get("http://localhost:5000/api/schools");
      setSchools(updatedSchools.data);
    } catch (error) {
      console.error("Error deleting school:", error);
      alert(error.response?.data?.error || "Failed to delete school.");
    }
  };

  // Delete department
  const handleDeleteDepartment = async (departmentId) => {
    if (!window.confirm("Are you sure you want to delete this department?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/schools/${selectedSchool}/departments/${selectedDepartment}`);
      // Refresh the department list
      const updatedDepartments = await axios.get(`http://localhost:5000/api/schools/${selectedSchool}/departments`);
      setDepartments(updatedDepartments.data);
    } catch (error) {
      console.error("Error deleting department:", error);
      alert(error.response?.data?.error || "Failed to delete department.");
    }
  };

  // Delete course
  const handleDeleteCourse = async (courseId) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return;

    try {
      await axios.delete(`http://localhost:5000/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses/${selectedCourse}`);
      // Refresh the course list
      const updatedCourses = await axios.get(`http://localhost:5000/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses`);
      setCourses(updatedCourses.data);
    } catch (error) {
      console.error("Error deleting course:", error);
      alert(error.response?.data?.error || "Failed to delete course.");
    }
  };

  // Delete class
  const handleDeleteClass = async (classId) => {
    if (!window.confirm("Are you sure you want to delete this class?")) return;
    try {
      await axios.delete(
        `http://localhost:5000/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses/${selectedCourse}/classes/${selectedClass}`
      );
      // Refresh class list after deletion
      const response = await axios.get(
        `http://localhost:5000/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses/${selectedCourse}/classes`
      );

      // Ensure response data is an array before setting state
      setClasses(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Error deleting class:", error);
      alert(error.response?.data?.error || "Failed to delete class.");

      // Fallback to empty array to prevent map() error
      setClasses((prevClasses) => Array.isArray(prevClasses) ? prevClasses : []);
    }
  };

  //delete section
  const handleDeleteSection = async (sectionId) => {
    if (!window.confirm("Are you sure you want to delete this section?")) return;

    try {
      await axios.delete(
        `http://localhost:5000/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses/${selectedCourse}/classes/${selectedClass}/sections/${selectedSection}`
      );

      // Refresh section list after deletion
      const response = await axios.get(
        `http://localhost:5000/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses/${selectedCourse}/classes/${selectedClass}/sections`
      );

      setSections(Array.isArray(response.data.sections) ? response.data.sections : []);
    } catch (error) {
      console.error("Error deleting section:", error);
      alert(error.response?.data?.error || "Failed to delete section.");

      // Fallback to empty array to prevent map() error
      setSections((prevSections) => Array.isArray(prevSections) ? prevSections : []);
    }
  };
  // Add new course under a department
  const handleAddCourse = async () => {
    if (!selectedSchool || !selectedDepartment || !courseName.trim()) {
      alert("Select a school, department, and enter a course name!");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses`,
        { course_name: courseName.trim(), addedBy: 1 }
      );

      setCourses([...courses, {
        course_id: response.data.course.course_id,
        course_name: courseName.trim(),
      }]);
      setCourseName(""); // Clear input field after success
    } catch (error) {
      console.error("Error adding course:", error);
      alert("Failed to add course. Please try again.");
    }
  };
  // Add new class under a course
  const handleAddClass = async () => {
    if (!selectedSchool || !selectedDepartment || !selectedCourse || !selectedSemester) {
      alert("Please select a school, department, course, and semester number!");
      return;
    }

    const semester = parseInt(selectedSemester, 10);
    if (isNaN(semester) || semester < 1 || semester > 8) {
      alert("Please select a valid semester number (1-8)!");
      return;
    }

    try {
      const response = await axios.post(
        `http://localhost:5000/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses/${selectedCourse}/classes`,
        {
          semester: semester,
          addedBy: 1, // Assuming this is a valid user ID
        }
      );

      setClasses([
        ...classes,
        {
          class_id: response.data.classEntry.class_id,
          class_name: response.data.classEntry.class_name,
          semester: response.data.classEntry.semester,
        },
      ]);      setSelectedSemester(""); // Clear input after success
    } catch (error) {
      console.error("Error adding class:", error);
      const errorMessage = error.response?.data?.error || "Failed to add class";
      setError(errorMessage);
      alert(errorMessage);
    }
  };

  //add new section under class
  const handleAddSection = async () => {
    if (!selectedSchool || !selectedDepartment || !selectedCourse || !selectedClass || !sectionName.trim()) {
      alert("Please select a school, department, course, class, and enter a section name!");
      return;
    }

    try {
      await axios.post(
        `http://localhost:5000/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses/${selectedCourse}/classes/${selectedClass}/sections`,
        {
          sectionName: sectionName.trim(),
          addedBy: 1, // Assuming this is a valid user ID
        }
      );

      // Refresh section list after adding
      const response = await axios.get(
        `http://localhost:5000/api/schools/${selectedSchool}/departments/${selectedDepartment}/courses/${selectedCourse}/classes/${selectedClass}/sections`
      );

      setSections(Array.isArray(response.data.sections) ? response.data.sections : []);
      setSectionName(""); // Reset input field after successful addition
    } catch (error) {
      console.error("Error adding section:", error);
      alert("Failed to add section. Please try again.");
    }
  };

  return (
  <div className="min-h-screen p-4 md:p-6 bg-gray-100">
    <h3 className="text-2xl font-bold mb-4">Manage Classes</h3>

    {/* Add School */}
    <div className="mb-4 flex flex-col md:flex-row gap-2">
      <input
        type="text"
        placeholder="Enter school name"
        value={schoolName}
        onChange={(e) => setSchoolName(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button
        onClick={handleAddSchool}
        className="bg-[#0096c7] hover:bg-[#023e8a] text-white px-4 py-2 rounded w-full md:w-auto"
      >
        Add School
      </button>
    </div>

    {/* Select School */}
    <div className="mb-4">
      <select
        onChange={(e) => setSelectedSchool(e.target.value)}
        className="border p-2 w-full rounded"
      >
        <option value="">Select School</option>
        {schools.map((school) => (
          <option key={school.school_id} value={school.school_id}>
            {school.school_name}
          </option>
        ))}
      </select>
      {selectedSchool && (
        <button
          onClick={handleDeleteSchool}
          className="mt-2 bg-red-500 hover:bg-[#ad2831] text-white px-4 py-2 rounded w-full md:w-auto"
        >
          Delete School
        </button>
      )}
    </div>

    {/* Add Department */}
    <div className="mb-4 flex flex-col md:flex-row gap-2">
      <input
        type="text"
        placeholder="Enter department name"
        value={departmentName}
        onChange={(e) => setDepartmentName(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button
        onClick={handleAddDepartment}
        className="bg-[#0096c7] hover:bg-[#023e8a] text-white px-4 py-2 rounded w-full md:w-auto"
      >
        Add Department
      </button>
    </div>

    {/* Select Department */}
    <div className="mb-4">
      <select
        onChange={(e) => setSelectedDepartment(e.target.value)}
        className="border p-2 w-full rounded"
      >
        <option value="">Select Department</option>
        {departments.map((dept) => (
          <option key={dept.department_id} value={dept.department_id}>
            {dept.department_name}
          </option>
        ))}
      </select>
      {selectedDepartment && (
        <button
          onClick={handleDeleteDepartment}
          className="mt-2 bg-red-500 hover:bg-[#ad2831] text-white px-4 py-2 rounded w-full md:w-auto"
        >
          Delete Department
        </button>
      )}
    </div>

    {/* Add Course */}
    <div className="mb-4 flex flex-col md:flex-row gap-2">
      <input
        type="text"
        placeholder="Enter course name"
        value={courseName}
        onChange={(e) => setCourseName(e.target.value)}
        className="border p-2 rounded w-full"
      />
      <button
        onClick={handleAddCourse}
        className="bg-[#0096c7] hover:bg-[#023e8a] text-white px-4 py-2 rounded w-full md:w-auto"
      >
        Add Course
      </button>
    </div>

    {/* Select Course */}
    <div className="mb-4">
      <select
        onChange={(e) => setSelectedCourse(e.target.value)}
        className="border p-2 w-full rounded"
      >
        <option value="">Select Course</option>
        {courses.map((course) => (
          <option key={course.course_id} value={course.course_id}>
            {course.course_name}
          </option>
        ))}
      </select>
      {selectedCourse && (
        <button
          onClick={handleDeleteCourse}
          className="mt-2 bg-red-500 hover:bg-[#ad2831] text-white px-4 py-2 rounded w-full md:w-auto"
        >
          Delete Course
        </button>
      )}
    </div>

    {/* Add Class */}
    <div className="mb-4">
      <div className="flex flex-col md:flex-row gap-2">
        <select
          value={selectedSemester}
          onChange={(e) => {
            setSelectedSemester(e.target.value);
            setError("");
          }}
          className="border p-2 rounded w-full"
        >
          <option value="">Select Semester</option>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <option key={num} value={num}>
              Semester {num}
            </option>
          ))}
        </select>
        <button
          onClick={handleAddClass}
          className="bg-[#0096c7] hover:bg-[#023e8a] text-white px-4 py-2 rounded w-full md:w-auto"
        >
          Add Class
        </button>
      </div>
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>

    {/* Section Prompt
    <div className="mb-4 flex flex-col md:flex-row gap-2 items-start md:items-center">
      <p>Is there any sections to add? If so, click Yes.</p>
      <div className="flex gap-2">
        <button
          onClick={() => setIsSectionsEnabled(true)}
          className="bg-[#0096c7] hover:bg-[#023e8a] text-white px-4 py-2 rounded"
        >
          Yes
        </button>
        <button
          onClick={() => setIsSectionsEnabled(false)}
          className="bg-red-500 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          No
        </button>
      </div>
    </div> */}

    {/* Manage Sections */}
    {isSectionsEnabled && (
      <>
        {/* Add Section */}
        <div className="mb-4 flex flex-col md:flex-row gap-2">
          <input
            type="text"
            placeholder="Enter Section name"
            value={sectionName}
            onChange={(e) => setSectionName(e.target.value)}
            className="border p-2 rounded w-full"
          />
          <button
            onClick={handleAddSection}
            className="bg-[#0096c7] hover:bg-[#023e8a] text-white px-4 py-2 rounded w-full md:w-auto"
          >
            Add Section
          </button>
        </div>

        {/* Select Section */}
        <div className="mb-4">
          <select
            onChange={(e) => setSelectedSection(e.target.value)}
            className="border p-2 w-full rounded"
          >
            <option value="">Select Section</option>
            {sections.map((sec) => (
              <option key={sec.section_id} value={sec.section_id}>
                {sec.section_name}
              </option>
            ))}
          </select>
          {selectedSection && (
            <button
              onClick={handleDeleteSection}
              className="mt-2 bg-red-500 hover:bg-[#ad2831] text-white px-4 py-2 rounded w-full md:w-auto"
            >
              Delete Section
            </button>
          )}
        </div>
      </>
    )}
  </div>
);

}

export default ManageClasses;
