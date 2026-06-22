import React from 'react'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import { useSocketContext } from '../context/SocketContext'
import assets from '../assets/assets'

const RightSidebar = ({ selectedUser, messages = [] }) => {
  const navigate = useNavigate()
  const { onlineUsers } = useSocketContext()

  const isOnline = selectedUser ? onlineUsers.includes(selectedUser._id) : false

  const mediaFiles = messages
    .filter(msg => msg.image)
    .map(msg => msg.image)

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout')
    } catch (error) {
      console.error(error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      navigate('/login')
    }
  }

  if (!selectedUser) return null

  return (
    <div className="w-[300px] h-full flex flex-col bg-[#181824]/40 border-l border-gray-600/50 p-6 backdrop-blur-lg shrink-0 max-lg:hidden">
      
      <div className="flex flex-col items-center mt-6">
        <div className="flex flex-col items-center gap-4">
          <img 
            src={selectedUser.profilePic || assets.avatar_icon} 
            alt="profile" 
            className="w-[90px] h-[90px] rounded-full object-cover border border-gray-600/50 shadow-lg" 
          />
          {isOnline && (
            <span className="w-3 h-3 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)]"></span>
          )}
        </div>
      </div>

      <hr className="my-8 border-t border-gray-600/30" />

      <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col min-h-0">
        <h3 className="text-white text-base font-semibold mb-4 tracking-wide">Media</h3>
        
        {mediaFiles.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {mediaFiles.map((imgSrc, index) => (
              <div key={index} className="aspect-[4/3] rounded-xl overflow-hidden cursor-pointer border border-gray-600/30 hover:border-gray-400 transition-colors">
                <img 
                  src={imgSrc} 
                  alt={`media-${index}`} 
                  className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <p className="text-sm text-gray-500">No media shared yet</p>
          </div>
        )}
      </div>

      <div className="shrink-0 mt-6 pt-4">
        <button 
          onClick={handleLogout}
          className="w-full bg-[#bf36ff] hover:bg-[#a92ce3] text-white font-semibold py-3.5 rounded-full transition-all duration-300 shadow-[0_0_15px_rgba(191,54,255,0.3)] hover:shadow-[0_0_20px_rgba(191,54,255,0.5)] active:scale-[0.98]"
        >
          Logout
        </button>
      </div>

    </div>
  )
}

export default RightSidebar