import React, { useState } from 'react';
import axios from 'axios';
// import backgroundImage from "bg.jpg";

function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    try {
      const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setMessage(response.data.message || 'Reset link sent! Check your email.');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send reset link. Try again.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cover bg-center p-4"
      style={{ backgroundImage: 'bg.jpg' }}>
      <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-md rounded-lg shadow-lg p-6 md:p-8 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Forgot Password</h1>
        <p className="text-center text-sm text-gray-600 mb-4">Enter your email to receive a reset link.</p>
        
        <div className="mb-4">
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-200"
            required
          />
        </div>

        {message && <p className="text-green-500 text-sm text-center mb-4">{message}</p>}
        {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}

        <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-700 transition">
          Send Reset Link
        </button>
      </form>
    </div>
  );
}

export default ForgotPassword; // Correctly placed at the end of the file
