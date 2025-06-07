import React, { useState, useEffect } from "react";
import axios from "axios";
import SubmitButton from "../components/uiConponents/SubmitButton";
import { apiPath } from '../path/apiPath';

const ManageSubjects = () => {
  const [showSchools, setShowSchools] = useState(false);

  const [openSchoolId, setOpenSchoolId] = useState(null);
  const [openDepartmentId, setOpenDepartmentId] = useState(null);
  const [openCourseId, setOpenCourseId] = useState(null);
  const [openClassId, setOpenClassId] = useState(null);

  const [schools, setSchools] = useState([]);
  const [departments, setDepartments] = useState({});
  const [courses, setCourses] = useState({});
  const [classes, setClasses] = useState({});
  const [sections, setSections] = useState({});
  const [subjects, setSubjects] = useState([]);

  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedDepartmentName, setSelectedDepartmentName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState('');

  const [subjectName, setSubjectName] = useState("");
  const [subjectType, setSubjectType] = useState("");
  const [subjectCategory, setSubjectCategory] = useState("");
  const [credits, setCredits] = useState("");
  const [editingSubject, setEditingSubject] = useState(null);

  // Fetch Schools
  useEffect(() => {
    axios.get(`${apiPath}/api/schools`).then((res) => setSchools(res.data));
    console.log("Selected school :", selectedSchool);
  }, []);

  // Fetch Departments when hovering on a school
  const fetchDepartments = async (schoolId) => {
    try {
      const url = `${apiPath}/api/subjects/departments/${schoolId}`;
      console.log("Fetching:", url);

      if (!departments[schoolId]) {
        const res = await axios.get(url);
        console.log("Fetched departments:", res.data);

        // Ensure response is stored as an array
        const fetchedDepartments = Array.isArray(res.data) ? res.data : [res.data];
        setDepartments((prev) => ({ ...prev, [schoolId]: fetchedDepartments }));
        setSelectedSchool(schoolId); // Set state AFTER fetching
        // setSelectedDepartmentName(res.data[0].department_name)
        console.log("Selected dept :", selectedDepartment);
      }
    } catch (error) {
      alert("Departments not found in this school.");
      console.error("Departments not found:", error);
    }
  };

  // Fetch Courses when hovering on a department
  const fetchCourses = async (departmentId) => {
    try {
      if (!courses[departmentId]) {
        const res = await axios.get(`${apiPath}/api/subjects/courses/${departmentId}`);

        // Ensure the response is stored as an array
        const fetchedCourses = Array.isArray(res.data) ? res.data : [res.data];
        console.log("Fetched courses:", fetchedCourses);
        setCourses((prev) => ({ ...prev, [departmentId]: fetchedCourses }));
        setSelectedDepartment(departmentId); // Set state AFTER fetching

        console.log("Selected course :", selectedCourse);
      }
    } catch (error) {
      alert("Courses not found in this department.");
      console.error("Courses not found in this department:", error);
    }
  };
  // Fetch Classes when hovering on a course
  const fetchClasses = async (courseId) => {
    try {
      if (!classes[courseId]) {
        const res = await axios.get(`${apiPath}/api/subjects/classes/${courseId}`);
        console.log("Raw response:", res.data);
        
        // Handle different response structures and ensure we have valid data
        let fetchedClasses = [];
        if (res.data) {
          if (res.data.classes) {
            // If classes are nested in a 'classes' property
            fetchedClasses = Array.isArray(res.data.classes) ? res.data.classes : [res.data.classes];
          } else {
            // If classes are directly in the response data
            fetchedClasses = Array.isArray(res.data) ? res.data : [res.data];
          }
        }
        
        // Filter out any undefined or null values
        fetchedClasses = fetchedClasses.filter(cls => cls != null);
        
        console.log("Processed classes:", fetchedClasses);
        if (fetchedClasses.length === 0) {
          throw new Error("No valid classes found");
        }
        
        setClasses((prev) => ({ ...prev, [courseId]: fetchedClasses }));
        setSelectedCourse(courseId);
        console.log("Selected class:", selectedClass);
      }
    } catch (error) {
      console.error("Error fetching classes:", error);
      alert("No classes found for this course or there was an error fetching them.");
      // Initialize with empty array to prevent mapping errors
      setClasses((prev) => ({ ...prev, [courseId]: [] }));
    }
  };

  // Fetch Sections when hovering on a class
  const fetchSections = async (classId) => {
    try {
      if (!sections[classId]) {
        const res = await axios.get(`${apiPath}/api/schools/sections/${classId}`);
        const fetchedSections = Array.isArray(res.data) ? res.data : [res.data];
        console.log("Fetched sections:", fetchedSections);

        setSections((prev) => ({ ...prev, [classId]: fetchedSections }));
        setSelectedClass(classId);
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.warn(`No sections found for class ${classId}. Setting empty sections.`);

        setSections((prev) => ({ ...prev, [classId]: [] })); // 👉 set empty array if 404
        setSelectedClass(classId);
      } else {
        console.error("Error fetching sections:", error);
        // Optional: alert user if needed
      }
    }
  };

  useEffect(() => {
    console.log("Updated Selected School:", selectedSchool);
    console.log("Updated Selected Department:", selectedDepartment);
    console.log("Updated Selected Course:", selectedCourse);
    console.log("Updated Selected Class:", selectedClass);
    console.log("Updated Selected Section:", selectedSection);
  }, [selectedSchool, selectedDepartment, selectedCourse, selectedClass, selectedSection]);

  //fetching subjects
  const fetchSubjects = async () => {
    try {
      if (!selectedSchool || !selectedDepartment || !selectedCourse || !selectedClass) {
        console.warn("All selections must be made to fetch subjects.");
        return;
      }

      const response = await axios.get(
        `${apiPath}/api/subjects/subjects`,
        {
          params: {
            school_id: selectedSchool,
            department_id: selectedDepartment,
            course_id: selectedCourse,
            class_id: selectedClass,
            include_sections: false // Add this parameter to indicate we don't need sections
          },
        }
      );

      setSubjects(response.data || []);
    } catch (error) {
      console.error("Error fetching filtered subjects:", error);
    }
  };

  useEffect(() => {
    if (selectedSchool && selectedDepartment && selectedCourse && selectedClass) {
      fetchSubjects();
    }
  }, [selectedSchool, selectedDepartment, selectedCourse, selectedClass]);

  //Adding  subjects
  const handleAddSubject = async () => {
    if (!selectedSchool || !selectedDepartment || !selectedCourse || !selectedClass) {
      alert("Please select all fields before adding a subject.");
      return;
    }
  
    // Skip subject name validation only for GE category
    if (subjectCategory !== "General Elective(GE)" && !subjectName) {
      alert("Please enter a subject name");
      return;
    }
  
    let theoryCredits = 0;
    let labCredits = 0;
  
    // Handle project credits differently
    if (subjectType.toLowerCase() === 'project') {
      if (!credits || isNaN(Number(credits))) {
        alert("Please enter valid project credits (e.g., '8')");
        return;
      }
      // For projects, store the full credit value in theory_credits
      theoryCredits = Number(credits);
      labCredits = 0;
    } else if (subjectType.toLowerCase() === 'both') {
      if (!credits.includes('+')) {
        alert("For 'Both' type, please use format like '4+1'");
        return;
      }
  
      const [first, second] = credits.split('+').map(Number);
      
      if (isNaN(first) || isNaN(second)) {
        alert("Please enter valid numbers (e.g., '4+1')");
        return;
      }
  
      // Assign larger number to theory, smaller to lab
      if (first > second) {
        theoryCredits = first;
        labCredits = second;
      } else if (second > first) {
        theoryCredits = second;
        labCredits = first;
      } else {
        alert("Lab credits must be less than theory credits");
        return;
      }
  
      if (labCredits >= theoryCredits) {
        alert("Lab credits must be less than theory credits");
        return;
      }
    } else if (subjectType.toLowerCase() === 'theory') {
      theoryCredits = Number(credits) || 0;
    } else if (subjectType.toLowerCase() === 'lab') {
      labCredits = Number(credits) || 0;
    }
    // Get the selected class details to get its semester
    const selectedClassData = classes[selectedCourse]?.find(cls => cls.class_id === Number(selectedClass));
    if (!selectedClassData?.semester) {
      alert("Could not determine semester for the selected class");
      return;
    }

    const subjectData = {
      // Only include subject_name if not GE or if provided
      ...(subjectCategory !== "General Elective(GE)" && { subject_name: subjectName }),
      course_id: Number(selectedCourse),
      sub_type: subjectType,
      subject_category: subjectCategory,
      theory_credits: theoryCredits,
      lab_credits: labCredits,
      added_by: 1,
      semester: selectedClassData.semester // Add semester from selected class
    };
  
    console.log("Final Data:", subjectData);
  
    try {
      const response = await axios.post(
        `${apiPath}/api/subjects/subjects`,
        subjectData,
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`
          }
        }
      );
      alert("Subject added successfully!");
      resetForm();
      fetchSubjects();
    } catch (error) {
      console.error("Error:", error.response?.data || error.message);
      alert(`Failed to add subject: ${error.response?.data?.error || error.message}`);
    }
  };

  /// **Edit Subject - Populate Form**
  const handleEditSubject = (subject) => {
    setSubjectName(subject.subject_name);
    setSubjectType(subject.sub_type);
    setSubjectCategory(subject.subject_category);

    // Convert credits back to a single string
    if (subject.theory_credits && subject.lab_credits) {
      setCredits(`${subject.theory_credits}+${subject.lab_credits}`);
    } else if (subject.theory_credits) {
      setCredits(subject.theory_credits.toString());
    } else if (subject.lab_credits) {
      setCredits(subject.lab_credits.toString());
    } else {
      setCredits("");
    }

    setEditingSubject(subject);
  };

  // **Update Subject**
const handleUpdateSubject = async () => {
  if (!editingSubject) return alert("No subject selected for update!");

  try {
    const updatedSubject = {
      subject_name: subjectName,
      sub_type: subjectType,
      subject_category: subjectCategory,
      theory_credits: credits.includes('+') ? credits.split('+')[0] : credits,
      lab_credits: credits.includes('+') ? credits.split('+')[1] : 0,
      modified_by: 1 // or get from auth
    };

    // Fix the endpoint to match your backend route
    await axios.put(
      `${apiPath}/api/subjects/subjects/${editingSubject.id || editingSubject.subject_id}`,
      updatedSubject,
      {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      }
    );

    alert("Subject updated successfully!");
    resetForm();
    fetchSubjects();
  } catch (error) {
    console.error("Error updating subject:", error);
    alert(`Failed to update subject: ${error.response?.data?.error || error.message}`);
  }
};
  // **Delete Subject**
  const handleDeleteSubject = async (subjectId) => {
    if (!subjectId) {
      alert("Invalid subject ID.");
      return;
    }

    if (!window.confirm("Are you sure you want to delete this subject?")) return;

    try {
      await axios.delete(`${apiPath}/api/subjects/subjects/${subjectId}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      alert("Subject deleted successfully!");
      fetchSubjects(); // Refresh list after deleting
    } catch (error) {
      console.error("Error deleting subject:", error.response?.data || error.message);
      alert("Failed to delete subject.");
    }
  };

  //reset form
  const resetForm = () => {
    setSubjectName("");
    setSubjectType("");
    setSubjectCategory("");
    setCredits("");
    setEditingSubject(null);
  };

  return (
    <div className="p-4 sm:p-4 md:p-6 min-h-screen w-auto">

      {/* School Dropdown */}
      <div className="relative inline-block">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded"
          onClick={() => setShowSchools(!showSchools)}  // toggle visibility
        >
          Select School
        </button>

        {showSchools && (
          <div className="absolute bg-white shadow-lg rounded w-auto overflow-visible mt-2 transition-all duration-300 ease-in-out transform origin-top scale-105 hover:scale-105 border-b border-gray-300 ">
            <div className="bg-blue-400 text-white p-2">school</div>
            {schools.map((school) => (
              <div key={school.school_id} className="relative">
                <button
                  className="block w-full text-left px-4 py-2 hover:bg-blue-200 border-y-[2px] border-gray-300"
                  onClick={() => {
                    if (openSchoolId === school.school_id) {
                      setOpenSchoolId(null); // collapse if clicked again
                    } else {
                      fetchDepartments(school.school_id);
                      setOpenSchoolId(school.school_id);
                      setOpenDepartmentId(null);
                      setOpenCourseId(null);
                      setOpenClassId(null);
                    }
                    setSelectedSchool(school.school_id);
                  }}
                >
                  {school.school_name}
                </button>

                {/* Departments */}
                {openSchoolId === school.school_id && departments[school.school_id] && (
                  <div className="absolute left-full top-0 bg-white shadow-lg rounded w-auto mt-0 transition-all duration-300 ease-in-out transform origin-left scale-105 hover:scale-100 ">
                    <div className="bg-blue-400 text-white p-2">Departments</div>
                    {departments[school.school_id].map((dept) => (
                      <div key={dept.department_id} className="relative">
                        <button
                          className="block w-full text-left px-4 py-2 hover:bg-blue-200 border-y-[2px] border-gray-300"
                          onClick={() => {
                            if (openDepartmentId === dept.department_id) {
                              setOpenDepartmentId(null);
                            } else {
                              fetchCourses(dept.department_id);
                              setOpenDepartmentId(dept.department_id);
                              setOpenCourseId(null);
                              setOpenClassId(null);
                            }
                            setSelectedDepartment(dept.department_id);
                          }}
                        >
                          {dept.department_name}
                        </button>

                        {/* Courses */}
                        {openDepartmentId === dept.department_id && courses[dept.department_id] && (
                          <div className="absolute left-full top-0 bg-white shadow-lg rounded w-auto mt-0 transition-all duration-300 ease-in-out transform origin-left scale-105 hover:scale-100">
                            <div className="bg-blue-400 text-white p-2">Courses</div>
                            {courses[dept.department_id].map((course) => (
                              <div key={course.course_id} className="relative">
                                <button
                                  className="block w-full text-left px-4 py-2 hover:bg-blue-200 border-y-[2px] border-gray-300"
                                  onClick={() => {
                                    if (openCourseId === course.course_id) {
                                      setOpenCourseId(null);
                                    } else {
                                      fetchClasses(course.course_id);
                                      setOpenCourseId(course.course_id);
                                      setOpenClassId(null);
                                    }
                                    setSelectedCourse(course.course_id);
                                  }}
                                >
                                  {course.course_name}
                                </button>

                                {/* Classes */}
                                {openCourseId === course.course_id && classes[course.course_id] && (
                                  <div className="absolute left-full top-0 bg-white shadow-lg rounded w-auto mt-0 transition-all duration-300 ease-in-out transform origin-left scale-100 hover:scale-100">
                                    <div className="bg-blue-400 text-white p-2">Classes</div>
                                    {classes[course.course_id].map((cls) => (
                                      <div key={cls.class_id} className="relative">
                                        <button
                                          className="block w-full text-left px-4 py-2 hover:bg-blue-200 border-y-[2px] border-gray-300"
                                          onClick={() => {
                                            if (openClassId === cls.class_id) {
                                              setOpenClassId(null);
                                            } else {
                                              fetchSections(cls.class_id);
                                              setOpenClassId(cls.class_id);
                                            }
                                            setSelectedClass(cls.class_id);
                                            setShowSchools(false);
                                          }}
                                        >
                                          {cls.class_name}
                                        </button>

                                        {/* Sections */}
                                        {openClassId === cls.class_id && sections[cls.class_id] && (
                                          <div className="absolute left-full top-0 bg-white shadow-lg rounded w-auto mt-0 transition-all duration-300 ease-in-out transform origin-left scale-100 hover:scale-100">
                                            <div className="bg-blue-400 text-white p-2">Sections</div>
                                            {sections[cls.class_id].map((sec) => (
                                              <button
                                                key={sec.section_id}
                                                className="block w-full text-left px-4 py-2 hover:bg-blue-200 border-y-[2px] border-gray-300"
                                                onClick={() => {
                                                  setSelectedSection(sec.section_id);
                                                }}
                                              >
                                                {sec.section_name}
                                              </button>
                                            ))}
                                          </div>
                                        )}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>)}
      </div>


      {/* Subject Form */}
      <div className="flex flex-col mt-4">
        <h3 className="flex justify-center font-serif text-4xl m-2.5">
          {editingSubject ? "Edit Subject Details" : "Enter Subject Details"}
        </h3>

        <input
          type="text"
          placeholder="Subject Name"
          value={subjectName}
          onChange={(e) => setSubjectName(e.target.value)}
          className="border px-2 py-1 rounded w-auto mb-4"
        />



        {/* Subject Category Dropdown */}     
           <select
          value={subjectCategory}
          onChange={(e) => {
            setSubjectCategory(e.target.value);
            // Reset subject type when GE is selected
            if (e.target.value === "General Elective(GE)") {
              setSubjectType("");
            }
          }}
          className="border px-2 py-1 rounded w-auto mb-4"
        >
          <option value="">Select Subject Category</option>
          <option value="Major">Major</option>
          <option value="Major Project">Major Project</option>
          <option value="Minor(Elective)">Minor (Elective)</option>
          <option value="Minor Project">Minor Project</option>
          <option value="General Elective(GE)">General Elective(GE)</option>
        </select>

        {/* Conditionally render Subject Type dropdown based on category */}
        {subjectCategory !== "General Elective(GE)" && (
          <select
            value={subjectType}
            onChange={(e) => setSubjectType(e.target.value)}
            className="border px-2 py-1 rounded w-auto mb-4"
          >
            <option value="">Select Subject Type</option>
            {subjectCategory.includes('Project') ? (
              <option value="Project">Project</option>
            ) : (
              <>
                <option value="Theory">Theory</option>
                <option value="Lab">Lab</option>
                <option value="both">Both</option>
              </>
            )}
          </select>
        )}

        <input
          type="text"
          value={credits}
          onChange={(e) => setCredits(e.target.value)}
          placeholder={
            subjectCategory === "General Elective(GE)"
              ? "Enter Credits (e.g., '3' or '4+1')"
              : "Enter Credits (Theory + Lab)"
          }
          required
          className="border px-2 py-1 rounded w-auto mb-6"
        />

        <div className="flex justify-center space-x-4">
          {editingSubject ? (
            <>
              <button
                onClick={handleUpdateSubject}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Update
              </button>
              <button
                onClick={resetForm}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </>
          ) : (
            <button
              onClick={handleAddSubject}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              Submit
            </button>
          )}
        </div>
        <button
          onClick={fetchSubjects}
          className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Load Subjects
        </button>

      </div>

      {/* Subject List */}
      <div className="mt-6">
        <h3 className="text-2xl font-semibold mb-4">Subject List {selectedDepartmentName}</h3>

        <table className="w-full border-collapse border border-gray-300">
          <thead>
            <tr className="bg-gray-200">
              <th className="border border-gray-300 px-4 py-2">Subject Name</th>
              <th className="border border-gray-300 px-4 py-2">Type</th>
              <th className="border border-gray-300 px-4 py-2">Category</th>
              <th className="border border-gray-300 px-4 py-2">Credits</th>
              <th className="border border-gray-300 px-4 py-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(Array.isArray(subjects) ? subjects : []).map((subject) => (
              <tr key={subject.id || subject.subject_id} className="text-center">
                <td className="border border-gray-300 px-4 py-2">{subject.subject_name}</td>
                <td className="border border-gray-300 px-4 py-2">{subject.sub_type}</td>
                <td className="border border-gray-300 px-4 py-2">{subject.subject_category}</td>
                <td className="border border-gray-300 px-4 py-2">
                  {subject.theory_credits} + {subject.lab_credits}
                </td>
                <td className="border border-gray-300 px-4 py-2">
                  <button
                    onClick={() => handleEditSubject(subject)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded mr-2 hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteSubject(subject.id || subject.subject_id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

    </div>
  );
};

export default ManageSubjects;
