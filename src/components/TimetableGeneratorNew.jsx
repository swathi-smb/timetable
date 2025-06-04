import React, { useState } from 'react';
import axios from '../utils/axios';

const TimetableGeneratorNew = ({
  schoolId,
  departmentId,
  timeConfig,
  semesterType,
  onGenerateComplete
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      setValidationErrors([]);

      const response = await axios.post('/api/timetable/generate', {
        school_id: schoolId,
        department_id: departmentId,
        timeConfig,
        semesterType
      });

      console.log('Timetable generation response:', response.data);
      
      // Check if we got valid data
      if (!response.data?.data || (Array.isArray(response.data.data) && response.data.data.length === 0)) {
        setValidationErrors(['No timetable slots were generated. Please check if there are active classes and subjects for the selected criteria.']);
        return;
      }

      onGenerateComplete(response.data);

    } catch (error) {
      console.error('Error generating timetable:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to generate timetable';
      const errorDetails = error.response?.data?.details ? 
        `\nDetails: ${JSON.stringify(error.response.data.details)}` : '';
      setValidationErrors([errorMessage + errorDetails]);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <button
        onClick={handleGenerate}
        disabled={isGenerating}
        className={`px-4 py-2 rounded text-white ${
          isGenerating ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {isGenerating ? 'Generating...' : 'Generate Timetable'}
      </button>

      {validationErrors.length > 0 && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
          {validationErrors.map((err, idx) => (
            <div key={idx} className="mb-1">• {err}</div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TimetableGeneratorNew;
