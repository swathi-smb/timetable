import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { apiPath } from '../path/apiPath';


const PendingUsersSection = () => {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchPendingUsers = async () => {
    try {
      const response = await axios.get(`${apiPath}/api/users/pending`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Pending users:', response.data);
      setPendingUsers(response.data);
    } catch (error) {
      console.error('Error fetching pending users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const handleAction = async (userId, action) => {
    try {
      await axios.post(
        `${apiPath}/api/users/handle-approval`,
        { userId, action },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh the list after action
      await fetchPendingUsers();
      
      // Show success message
      alert(`User ${action === 'approve' ? 'approved' : 'rejected'} successfully`);
    } catch (error) {
      console.error('Error handling user action:', error);
      alert('Error processing request');
    }
  };

  const getRoleName = (role) => {
    switch(role) {
      case '2': return 'Staff';
      case '3': return 'Student';
      default: return role;
    }
  };

  if (loading) {
    return <div>Loading pending users...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Pending User Approvals</h2>
      
      {pendingUsers.length === 0 ? (
        <p>No pending approvals</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white rounded-lg overflow-hidden shadow-lg">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-4 py-2">Name</th>
                <th className="px-4 py-2">Email/Roll Number</th>
                <th className="px-4 py-2">Role</th>
                <th className="px-4 py-2">Department</th>
                <th className="px-4 py-2">Requested On</th>
                <th className="px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingUsers.map(user => (
                <tr key={user.id} className="border-t">
                  <td className="px-4 py-2">{user.name}</td>
                  <td className="px-4 py-2">
                    {user.role === '2' ? user.email : user.role_number}
                  </td>
                  <td className="px-4 py-2">{getRoleName(user.role)}</td>
                  <td className="px-4 py-2">{user.department_id}</td>
                  <td className="px-4 py-2">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleAction(user.id, 'approve')}
                        className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(user.id, 'reject')}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default PendingUsersSection;
