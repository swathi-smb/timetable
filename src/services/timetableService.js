export const saveTimetable = async (timetableData) => {
  try {
    const response = await axios.post(`${apiPath}/api/saved-timetables/save`, timetableData, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error saving timetable:', error);
    throw error;
  }
}; 