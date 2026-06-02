import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const ResetPassword = () => {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Login window se dynamic auto-pass email cache karna
    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        otp: '',
        newPassword: ''
    });

    const handleResetSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/reset-password', formData);
            alert(res.data.message);
            navigate('/login'); // Success par direct login route redirect
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to reset password. Please check your credentials.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Create New Password</h2>
                <p className="text-xs text-gray-400 text-center mb-6">Enter the validation code sent to your console screen to recovery security login credentials.</p>
                
                <form onSubmit={handleResetSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Account Email</label>
                        <input type="email" required value={formData.email} className="mt-1 w-full p-2 border border-gray-300 rounded bg-gray-50 outline-none"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 text-center">Reset Code (Demo: 1234)</label>
                        <input type="text" maxLength="4" required className="mt-1 w-full p-2 border border-gray-300 rounded text-center text-xl font-bold outline-none focus:ring-2 focus:ring-blue-500" placeholder="0000"
                            onChange={(e) => setFormData({ ...formData, otp: e.target.value })} />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Enter New Password</label>
                        <input type="password" required className="mt-1 w-full p-2 border border-gray-300 rounded outline-none focus:ring-2 focus:ring-blue-500"
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })} />
                    </div>
                    <button type="submit" className="w-full bg-green-600 text-white p-2 rounded font-semibold hover:bg-green-700 transition shadow-sm">
                        Update Password Security
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPassword;
