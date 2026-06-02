import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const VerifyOTP = () => {
    const [otp, setOtp] = useState('');
    const navigate = useNavigate();
    const location = useLocation();
    
    // Signup page se pass hone wali email ko catch karna
    const email = location.state?.email || '';

    const handleVerify = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post('http://localhost:5000/api/auth/verify-otp', { email, otp });
            alert(res.data.message);
            
            // 🎯 AUTO-LOGIN ON FRONTEND: Token aur User data storage mein save karna
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            
            // Verification successful hote hi direct Dashboard par redirect! 🚀
            navigate('/dashboard'); 
        } catch (err) {
            alert(err.response?.data?.message || 'Verification failed. Try again.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-2 text-center text-gray-800">Verify Your Email</h2>
                <p className="text-sm text-gray-500 text-center mb-6">
                    We have dispatched a 4-digit OTP code to <br/>
                    <span className="font-semibold text-gray-700">{email}</span>
                </p>
                
                <form onSubmit={handleVerify} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 text-center">Enter Code</label>
                        <input 
                            type="text" 
                            maxLength="4"
                            required 
                            className="mt-2 w-full p-3 border border-gray-300 rounded text-center text-2xl font-bold tracking-widest focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="0000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value)} 
                        />
                    </div>
                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 transition">
                        Verify & Go to Dashboard 🚀
                    </button>
                </form>
            </div>
        </div>
    );
};

export default VerifyOTP;
