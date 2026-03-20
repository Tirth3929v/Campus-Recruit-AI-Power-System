import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevents the page from reloading
    setStatusMessage('Saving to database...');

    try {
      const response = await fetch('http://localhost:5000/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        setStatusMessage('✅ Success! Check your MongoDB Compass.');
      } else {
        setStatusMessage(`❌ Error: ${data.message}`);
      }
    } catch (error) {
      setStatusMessage('❌ Network error. Is your backend running?');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" name="username" placeholder="Username (e.g. Tirth)"
            onChange={handleChange} required
            className="w-full p-2 border rounded text-gray-900 bg-white"
          />
          <input 
            type="email" name="email" placeholder="Email"
            onChange={handleChange} required
            className="w-full p-2 border rounded text-gray-900 bg-white"
          />
          <input 
            type="password" name="password" placeholder="Password"
            onChange={handleChange} required
            className="w-full p-2 border rounded text-gray-900 bg-white"
          />
          <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-bold">
            Sign Up
          </button>
        </form>

        {statusMessage && (
          <p className="mt-4 text-center font-medium text-gray-700">{statusMessage}</p>
        )}

        <div className="mt-4 text-center">
          <p className="text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-blue-600 hover:underline">Go to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;