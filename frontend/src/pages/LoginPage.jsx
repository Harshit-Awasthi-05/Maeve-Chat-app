import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import maeveLogo from '../assets/maeve-logo.png'

const LoginPage = () => {
  const [currState, setCurrState] = useState("Login")
  const [formData, setFormData] = useState({
    fullName: "",
    username: '',
    email: '',
    password: ''
  })
  const [errorMsg, setErrorMsg] = useState("")
  const navigate = useNavigate()

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    if (name === "username") {
      value = value.toLowerCase().replace(/\s+/g, '');
    }

    setFormData({ ...formData, [name]: value })
    setErrorMsg("") 
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    const endpoint = currState === "Sign up" 
      ? '/auth/register' 
      : '/auth/login';

    const payload = currState === "Sign up" 
      ? { fullName: formData.fullName, username: formData.username, email: formData.email, password: formData.password }
      : { email: formData.email, password: formData.password };

    try {
      const response = await axiosInstance.post(endpoint, payload);

      const { accessToken, user } = response.data;

      localStorage.setItem("accessToken", accessToken);
      localStorage.setItem("user", JSON.stringify(user));
      
      window.location.href = '/';
      
    } catch (error) {
      setErrorMsg(error.response?.data?.message || "An error occurred");
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = 'https://maeve-chat-app.onrender.com/api/auth/google'
  }

  const toggleState = (newState) => {
    setCurrState(newState);
    setErrorMsg("");
    setFormData({ fullName: '', username: '', email: '', password: '' });
  }

  return (
    <div className='w-full h-full flex items-center justify-center lg:justify-evenly gap-10 px-4 sm:px-10 text-white bg-transparent'>
      
      <div className='hidden lg:flex flex-col items-center gap-4'>
        <img
          src={maeveLogo}
          alt="Maeve Logo"
          className='w-[400px] xl:w-[500px] drop-shadow-[0_0_30px_rgba(139,92,246,0.3)]'
        />
        <p className='text-gray-300 text-lg font-light tracking-wide'>Connect with the world through Maeve.</p>
      </div>

      <div className='bg-[#181824]/60 backdrop-blur-2xl border border-gray-500/30 rounded-2xl p-8 sm:p-10 w-full max-w-sm relative shadow-[0_8px_40px_rgba(139,92,246,0.15)]'>
        
        <div className='flex flex-col mb-6'>
          <h2 className='text-3xl font-semibold tracking-tight text-white'>{currState}</h2>
          <p className='text-sm text-gray-400 mt-1'>
            {currState === "Sign up" ? "Create an account to get started" : "Welcome back! Please enter your details."}
          </p>
          {errorMsg && (
            <p className='text-sm text-red-400 mt-2 bg-red-500/10 p-2 rounded border border-red-500/20'>
              {errorMsg}
            </p>
          )}
        </div>

        <form className='flex flex-col gap-4' onSubmit={handleSubmit}>
          
          {currState === "Sign up" && (
            <input
              type="text"
              name="fullName"
              value={formData.fullName}
              onChange={handleInputChange}
              placeholder="Full Name (e.g. Harshit Awasthi)"
              className='w-full px-4 py-3 bg-black/20 border border-gray-600/50 rounded-xl outline-none focus:bg-black/40 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder-gray-500 text-sm transition-all duration-300'
              required
            />
          )}

          {currState === "Sign up" && (
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              placeholder="Username (e.g. harshit_dev)"
              className='w-full px-4 py-3 bg-black/20 border border-gray-600/50 rounded-xl outline-none focus:bg-black/40 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder-gray-500 text-sm transition-all duration-300'
              required
            />
          )}

          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Email Address"
            className='w-full px-4 py-3 bg-black/20 border border-gray-600/50 rounded-xl outline-none focus:bg-black/40 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder-gray-500 text-sm transition-all duration-300'
            required
          />
          
          <div className='flex flex-col gap-1'>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              placeholder="Password"
              className='w-full px-4 py-3 bg-black/20 border border-gray-600/50 rounded-xl outline-none focus:bg-black/40 focus:border-violet-500 focus:ring-1 focus:ring-violet-500 placeholder-gray-500 text-sm transition-all duration-300'
              required
            />
            {currState === "Login" && (
              <p 
                onClick={() => navigate('/forgot-password')}
                className='text-xs text-violet-400 hover:text-violet-300 cursor-pointer hover:underline text-right mt-1 w-max self-end transition-colors'
              >
                Forgot Password?
              </p>
            )}
          </div>

          {currState === "Sign up" && (
            <div className='flex items-start gap-2 text-[11px] text-gray-400 mt-1 mb-1'>
              <input type="checkbox" id="terms" className='mt-0.5 accent-violet-500 cursor-pointer rounded-sm' required />
              <label htmlFor="terms" className='cursor-pointer leading-tight'>
                By creating an account, I agree to Maeve's <span className='text-violet-400 hover:underline'>Terms of Use</span> & <span className='text-violet-400 hover:underline'>Privacy Policy</span>.
              </label>
            </div>
          )}

          <button 
            type="submit" 
            className='w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-medium py-3 rounded-xl mt-1 shadow-[0_4px_14px_rgba(139,92,246,0.4)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.6)] hover:scale-[1.02] transition-all duration-300'
          >
            {currState === "Sign up" ? "Create Account" : "Login"}
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-gray-600/50"></div>
            <span className="flex-shrink-0 mx-4 text-gray-500 text-xs">OR</span>
            <div className="flex-grow border-t border-gray-600/50"></div>
          </div>

          <button 
            type="button"
            onClick={handleGoogleLogin}
            className='w-full flex items-center justify-center gap-3 bg-white/5 border border-gray-500/30 text-white font-medium py-3 rounded-xl hover:bg-white/10 transition-all duration-300 text-sm group'
          >
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/c/c1/Google_%22G%22_logo.svg" 
              alt="Google" 
              className='w-5 group-hover:scale-110 transition-transform duration-300' 
            />
            Continue with Google
          </button>

          <div className='text-sm text-center text-gray-400 mt-4'>
            {currState === "Sign up" ? (
              <p>Already have an account? <span onClick={() => toggleState("Login")} className='text-violet-400 cursor-pointer hover:text-violet-300 font-medium transition-colors'>Login</span></p>
            ) : (
              <p>Don't have an account? <span onClick={() => toggleState("Sign up")} className='text-violet-400 cursor-pointer hover:text-violet-300 font-medium transition-colors'>Sign up</span></p>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}

export default LoginPage