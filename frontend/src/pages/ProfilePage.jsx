import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import assets from '../assets/assets'

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null)
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()

    navigate('/')
  }

  return (
    <div className='min-h-screen flex items-center justify-center px-4 sm:px-10 text-white w-full bg-transparent'>

      <div className='bg-[#181824]/40 backdrop-blur-xl border border-gray-600/50 rounded-xl w-full max-w-3xl flex items-center justify-between max-sm:flex-col-reverse shadow-2xl overflow-hidden'>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 p-8 sm:p-10 flex-1 w-full">
          <h3 className="text-2xl font-medium text-white mb-2">Profile Details</h3>
          
          
          <label htmlFor="avatar" className='flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity group'>
            <input 
              onChange={(e) => setSelectedImg(e.target.files[0])} 
              type="file" 
              id="avatar" 
              accept=".png, .jpg, .jpeg" 
              hidden 
            />
            <div className="relative">
              <img 
                src={selectedImg ? URL.createObjectURL(selectedImg) : assets.avatar_icon} 
                alt="Profile Avatar" 
                className={`w-14 h-14 object-cover ${selectedImg ? 'rounded-full border-2 border-violet-500' : ''}`} 
              />
            </div>
            <span className="text-gray-400 text-sm group-hover:text-white transition-colors">
              Upload profile image
            </span>
          </label>

          <input 
            type="text" 
            required 
            placeholder="Your name" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className='w-full px-4 py-2.5 bg-[#282142]/50 border border-gray-600/70 rounded-lg outline-none focus:border-violet-500 placeholder-gray-400 text-sm transition-colors' 
          />
          
          <textarea 
            required 
            placeholder="Profile bio (e.g. Hi Everyone, I am using Maeve)" 
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className='w-full px-4 py-2.5 bg-[#282142]/50 border border-gray-600/70 rounded-lg outline-none focus:border-violet-500 placeholder-gray-400 text-sm transition-colors resize-none h-24' 
          />

          <button 
            type="submit"
            className='w-full bg-gradient-to-r from-violet-600 to-fuchsia-500 text-white font-medium py-2.5 rounded-lg mt-2 hover:opacity-90 transition-opacity'
          >
            Save & Continue
          </button>
        </form>

        
        <div className="flex items-center justify-center p-8 sm:p-10 border-b sm:border-b-0 sm:border-l border-gray-600/30 w-full sm:w-auto bg-black/10">
          <img 
            src={selectedImg ? URL.createObjectURL(selectedImg) : assets.logo_icon} 
            alt="Preview" 
            className={`transition-all duration-300 ${selectedImg ? 'w-40 h-40 rounded-full object-cover shadow-2xl border-4 border-[#282142]' : 'w-32 opacity-40'}`} 
          />
        </div>

      </div>
    </div>
  )
}

export default ProfilePage