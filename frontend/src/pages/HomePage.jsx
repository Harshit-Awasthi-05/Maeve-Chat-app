import React, { useState } from 'react'
import Sidebar from '../components/Sidebar'
import ChatContainer from '../components/ChatContainer'
import RightSidebar from '../components/RightSidebar'

const HomePage = () => {
  const [selectedUser, setSelectedUser] = useState(() => {
    const savedUser = localStorage.getItem('activeChat')
    return savedUser ? JSON.parse(savedUser) : null
  })

  const handleSelectUser = (user) => {
    setSelectedUser(user)
    if (user) {
      localStorage.setItem('activeChat', JSON.stringify(user))
    } else {
      localStorage.removeItem('activeChat')
    }
  }

  return (
    <div className="w-full h-screen sm:px-[15%] sm:py-[5%] text-white">
      <div className={`backdrop-blur-xl bg-white/5 border border-gray-600/50 rounded-2xl overflow-hidden h-full grid relative transition-all duration-300 ${
        selectedUser 
          ? 'grid-cols-1 md:grid-cols-[1fr_2fr_1fr] lg:grid-cols-[1fr_2.5fr_1fr]' 
          : 'grid-cols-1 md:grid-cols-[1fr_2fr]' 
      }`}>
        <Sidebar selectedUser={selectedUser} setSelectedUser={handleSelectUser} />
        <ChatContainer selectedUser={selectedUser} setSelectedUser={handleSelectUser} />
        {selectedUser && <RightSidebar selectedUser={selectedUser} />}
      </div>
    </div>
  )
}

export default HomePage