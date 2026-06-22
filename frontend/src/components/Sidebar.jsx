import React, { useState, useEffect } from 'react'
import assets from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import axiosInstance from '../utils/axiosInstance'
import { useSocketContext } from '../context/SocketContext'

const Sidebar = ({ selectedUser, setSelectedUser }) => {
  const [users, setUsers] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const { onlineUsers } = useSocketContext()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        if (!searchTerm.trim()) {
          const response = await axiosInstance.get('/messages/conversations')
          setUsers(response.data.data || response.data)
          return
        }

        const response = await axiosInstance.get(`/users?search=${searchTerm}`)
        setUsers(response.data.data || response.data)
      } catch (error) {
        console.error(error)
      }
    }

    const delaySearch = setTimeout(() => {
      fetchUsers()
    }, 500)

    return () => clearTimeout(delaySearch)
  }, [searchTerm])

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout')
    } catch (error) {
      console.error(error)
    } finally {
      localStorage.removeItem('accessToken')
      localStorage.removeItem('user')
      window.location.href = '/login';
    }
  }

  return (
    <div className={`bg-[#181824]/40 h-full p-5 border-r border-gray-600/50 text-white flex flex-col ${selectedUser ? "max-md:hidden" : ''}`}>
      
      <div className='pb-5'>
        <div className='flex justify-between items-center'>
          <img src={assets.logo} alt="logo" className='max-w-[120px]' />
          <div className="relative py-2 group">
            <img src={assets.menu_icon} alt="Menu" className='max-h-5 cursor-pointer opacity-80 hover:opacity-100 transition-opacity' />
            <div className='absolute top-full right-0 z-20 w-36 p-4 rounded-xl bg-[#282142] border border-gray-600/50 text-gray-100 hidden group-hover:block shadow-2xl'>
              <p onClick={() => navigate('/profile')} className='cursor-pointer text-sm hover:text-white transition-colors'>
                Edit Profile
              </p>
              <hr className="my-3 border-t border-gray-600/50" />
              <p onClick={handleLogout} className='cursor-pointer text-sm hover:text-white transition-colors'>
                Logout
              </p>
            </div>
          </div>
        </div>

        <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
          <img src={assets.search_icon} alt="Search" className='w-4 opacity-70' />
          <input 
            type="text" 
            placeholder="Search User..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='bg-transparent border-none outline-none text-white text-sm w-full placeholder:text-gray-400'
          />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto hide-scrollbar flex flex-col gap-1'>
        {users.length === 0 && searchTerm && (
            <p className="text-gray-400 text-sm text-center mt-5">No users found.</p>
        )}
        
        {users.map((user) => {
          const isOnline = onlineUsers.includes(user._id);

          return (
            <div 
              key={user._id} 
              onClick={() => setSelectedUser(user)} 
              className={`flex items-center gap-3 py-3 px-3 cursor-pointer rounded-xl transition-colors ${selectedUser?._id === user._id ? 'bg-[#282142]' : 'hover:bg-[#282142]/50'}`}
            >
              <div className="relative">
                <img src={user.profilePic || assets.avatar_icon} className='w-10 rounded-full' alt="" />
                {isOnline && (
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#181824] rounded-full"></span>
                )}
              </div>
              <div className='flex-1'>
                <p className='text-white text-sm font-medium'>{user.username}</p>
                <p className={`text-[11px] ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Sidebar