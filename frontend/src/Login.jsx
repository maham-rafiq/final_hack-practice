import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from './supabaseClient'; 

// 🌍 Dynamic Base URL configuration connection parameters fallback setup
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://vercel.app';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false); // 🔑 Password Visibility State Toggle
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // 🚀 Localhost routing endpoint fixed to live cloud architecture
            const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
            
            // Local storage authorization setup
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('user', JSON.stringify(res.data.user));
            
            alert('Login Successful!');
            navigate('/dashboard');
        } catch (err) {
            alert(err.response?.data?.message || 'Invalid Credentials! Please try again.');
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: { redirectTo: 'http://localhost:5173/dashboard' }
            });
            if (error) throw error;
        } catch (error) {
            alert("Google Auth Failed: " + error.message);
        }
    };

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center py-10 px-4">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Account Login</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email Address</label>
                        <input type="email" required className="mt-1 w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    
                    {/* 🔑 DYNAMIC PASSWORD WITH TOGGLE INPUT CONTAINER */}
                    <div>
                        <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <Link to="/forgot-password" className="text-xs text-blue-600 hover:underline">Forgot Password?</Link>
                        </div>
                        <div className="relative flex items-center">
                            <input 
                                type={showPassword ? "text" : "password"} 
                                required 
                                className="mt-1 w-full p-2 pr-10 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 outline-none"
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })} 
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3.5 text-gray-500 hover:text-gray-700 focus:outline-none text-sm"
                            >
                                {showPassword ? "Hide ^_^" : "Show 👁️"}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-semibold hover:bg-blue-700 transition">
                        Sign In
                    </button>
                </form>

                <div className="relative flex py-4 items-center">
                    <div className="flex-grow border-t border-gray-300"></div>
                    <span className="flex-shrink mx-4 text-gray-400 text-sm">or</span>
                    <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <button 
                    onClick={handleGoogleLogin}
                    type="button" 
                    className="w-full flex items-center justify-center gap-2 border border-gray-300 bg-white text-gray-700 p-2 rounded font-medium hover:bg-gray-50 transition shadow-sm mb-4"
                >
                    <img src="https://idfy.com" alt="Google logo" className="w-5 h-5 object-contain" />
                    Continue with Google
                </button>

                <p className="mt-4 text-sm text-center text-gray-600">
                    Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline">Register here</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
