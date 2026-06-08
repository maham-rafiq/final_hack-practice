import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

// 🌍 Dynamic Base URL fallback setup for production servers
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vercel.app';

const ForgotPassword = () => {
    const [step, setStep] = useState(1); // Step 1: Email Request, Step 2: Code Reset Verification
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    // HANDLER 1: Request Password Recovery Code
    const handleRequestOTP = async (e) => {
        e.preventDefault();
        try {
             const res = await axios.post(`${API_BASE_URL}/api/auth/forgot-password`, { email });
            alert(res.data.message);
            setStep(2); // Advance user validation layout to password update state
        } catch (err) {
            alert(err.response?.data?.message || 'Failed to send recovery code!');
        }
    };

    // HANDLER 2: Save New Password 
    const handleResetPassword = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_BASE_URL}/api/auth/reset-password`, { email, otp, newPassword });
            alert(res.data.message || 'Password Changed Successfully!');
            navigate('/login');
        } catch (err) {
            alert(err.response?.data?.message || 'Invalid or expired OTP token!');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Password Recovery</h2>
                
                {step === 1 ? (
                    <form onSubmit={handleRequestOTP} className="space-y-4">
                        <p className="text-sm text-gray-500 mb-2">Enter your verified account email to request a 6-digit dynamic backup recovery token.</p>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email Address</label>
                            <input type="email" required value={email} className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 transition">
                            Send Code
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleResetPassword} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Verification Code (OTP)</label>
                            <input type="text" required value={otp} className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={(e) => setOtp(e.target.value)} />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">New Secure Password</label>
                            <input type="password" required value={newPassword} className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={(e) => setNewPassword(e.target.value)} />
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded font-semibold hover:bg-green-700 transition">
                            Update Password
                        </button>
                    </form>
                )}

                <p className="mt-6 text-sm text-center text-gray-600">
                    Remember password? <Link to="/login" className="text-blue-600 hover:underline">Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
