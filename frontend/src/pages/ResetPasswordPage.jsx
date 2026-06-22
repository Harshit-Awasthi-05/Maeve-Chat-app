import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import assets from '../assets/assets';

const ResetPasswordPage = () => {
    const [password, setPassword] = useState("");
    const [status, setStatus] = useState({ type: "", message: "" });
    const { token } = useParams(); 
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({ type: "loading", message: "Updating password..." });

        try {
            await axiosInstance.post(`/auth/reset-password/${token}`, { password });
            setStatus({ type: "success", message: "Password updated successfully!" });
            
            setTimeout(() => navigate('/login'), 2000);
        } catch (error) {
            setStatus({ type: "error", message: error.response?.data?.message || "Link expired or invalid." });
        }
    };

    return (
        <div className='w-full h-full flex flex-col items-center justify-center gap-10 px-4 text-white bg-transparent'>
            <img src={assets.logo_big} alt="Maeve Logo" className='w-[200px] drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]' />
            
            <div className='bg-[#181824]/60 backdrop-blur-2xl border border-gray-500/30 rounded-2xl p-8 sm:p-10 w-full max-w-sm relative shadow-[0_8px_40px_rgba(139,92,246,0.15)]'>
                <h2 className='text-3xl font-semibold tracking-tight text-white mb-2'>New Password</h2>
                <p className='text-sm text-gray-400 mb-6'>Enter your new secure password below.</p>

                {status.message && (
                    <p className={`text-sm p-3 rounded-lg mb-4 border ${status.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-green-500/10 border-green-500/20 text-green-400'}`}>
                        {status.message}
                    </p>
                )}

                <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="New Password"
                        className='w-full px-4 py-3 bg-black/20 border border-gray-600/50 rounded-xl outline-none focus:bg-black/40 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder-gray-500 text-sm transition-all duration-300'
                        required
                        minLength={6}
                    />
                    <button 
                        type="submit" 
                        disabled={status.type === 'loading' || status.type === 'success'}
                        className='w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-medium py-3 rounded-xl mt-1 shadow-[0_4px_14px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none'
                    >
                        {status.type === 'loading' ? "Updating..." : "Reset Password"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage;