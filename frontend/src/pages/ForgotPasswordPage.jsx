import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import assets from '../assets/assets';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState("");
    const [status, setStatus] = useState({ type: "", message: "" });
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: "loading", message: "Sending reset link..." });

        try {
            await axiosInstance.post('/auth/forgot-password', { email });
            setStatus({ type: "success", message: "If that email exists, a reset link has been sent. Check your terminal for the link!" });
        } catch (error) {
            setStatus({ type: "error", message: "Something went wrong. Please try again." });
        }
    };

    return (
        <div className='w-full h-full flex flex-col items-center justify-center gap-10 px-4 text-white bg-transparent'>
            <img src={assets.logo_big} alt="Maeve Logo" className='w-[200px] drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]' />
            
            <div className='bg-[#181824]/60 backdrop-blur-2xl border border-gray-500/30 rounded-2xl p-8 sm:p-10 w-full max-w-sm relative shadow-[0_8px_40px_rgba(139,92,246,0.15)]'>
                <h2 className='text-3xl font-semibold tracking-tight text-white mb-2'>Reset Password</h2>
                <p className='text-sm text-gray-400 mb-6'>Enter your email and we'll send you a link to reset your password.</p>

                {status.message && (
                    <p className={`text-sm p-3 rounded-lg mb-4 border ${status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                        {status.message}
                    </p>
                )}

                <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email Address"
                        className='w-full px-4 py-3 bg-black/20 border border-gray-600/50 rounded-xl outline-none focus:bg-black/40 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder-gray-500 text-sm transition-all duration-300'
                        required
                    />
                    <button 
                        type="submit" 
                        disabled={status.type === 'loading'}
                        className='w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-medium py-3 rounded-xl mt-1 shadow-[0_4px_14px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none'
                    >
                        {status.type === 'loading' ? "Sending..." : "Send Reset Link"}
                    </button>
                    
                    <p onClick={() => navigate('/login')} className='text-sm text-center text-gray-400 mt-4 cursor-pointer hover:text-white transition-colors'>
                        &larr; Back to Login
                    </p>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;