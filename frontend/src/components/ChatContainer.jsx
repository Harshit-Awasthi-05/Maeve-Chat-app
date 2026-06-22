import React, { useState, useEffect, useRef } from 'react'
import assets from '../assets/assets'
import { useSocketContext } from '../context/SocketContext'
import axiosInstance from '../utils/axiosInstance'

const ChatContainer = ({ selectedUser, setSelectedUser }) => {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [typingTimeout, setTypingTimeout] = useState(null)
  const messagesEndRef = useRef(null)
  
  const { socket, onlineUsers } = useSocketContext()

  const isOnline = selectedUser ? onlineUsers.includes(selectedUser._id) : false

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, isTyping])

  useEffect(() => {
    if (!selectedUser) return

    const fetchMessages = async () => {
      try {
        const response = await axiosInstance.get(`/messages/${selectedUser._id}`)
        setMessages(response.data)
      } catch (error) {
        console.error(error)
      }
    }

    fetchMessages()
  }, [selectedUser])

  useEffect(() => {
    if (!socket) return

    socket.on("typing", ({ senderId }) => {
      if (selectedUser && selectedUser._id === senderId) {
        setIsTyping(true)
      }
    })

    socket.on("stopTyping", ({ senderId }) => {
      if (selectedUser && selectedUser._id === senderId) {
        setIsTyping(false)
      }
    })

    socket.on("newMessage", (newMessage) => {
      if (selectedUser && newMessage.senderId === selectedUser._id) {
        setMessages((prev) => [...prev, newMessage])
      }
    })

    return () => {
      socket.off("typing")
      socket.off("stopTyping")
      socket.off("newMessage")
    }
  }, [socket, selectedUser])

  const handleInputChange = (e) => {
    setInputText(e.target.value)

    if (!socket || !selectedUser) return

    socket.emit("typing", { receiverId: selectedUser._id })

    if (typingTimeout) clearTimeout(typingTimeout)

    const timeout = setTimeout(() => {
      socket.emit("stopTyping", { receiverId: selectedUser._id })
    }, 2000)

    setTypingTimeout(timeout)
  }

  const handleSendMessage = async () => {
    if (!inputText.trim()) return

    try {
      const response = await axiosInstance.post(`/messages/send/${selectedUser._id}`, {
        message: inputText
      })

      setMessages((prevMessages) => [...prevMessages, response.data.data])
      setInputText('')
      
      if (socket && selectedUser) {
        socket.emit("stopTyping", { receiverId: selectedUser._id })
      }
    } catch (error) {
      console.error(error)
    }
  }

  const formatTime = (isoString) => {
    if (!isoString) return ""
    const date = new Date(isoString)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  }

  return selectedUser ? (
    <div className='h-full flex flex-col bg-transparent relative backdrop-blur-lg overflow-hidden border-r border-gray-600/50'>
      
      <div className='shrink-0 flex items-center justify-between py-3 mx-4 border-b border-gray-600/50'>
        <div className='flex items-center gap-3'>
          <img src={selectedUser.profilePic || assets.profile_martin} alt="" className="w-10 rounded-full" />
          <p className='text-lg text-white flex items-center gap-2'>
            {selectedUser.username}
            {isOnline && <span className="w-2 h-2 rounded-full bg-green-500"></span>}
          </p>
        </div>
        <div className='flex items-center gap-4'>
          <img 
            onClick={() => setSelectedUser(null)} 
            src={assets.arrow_icon} 
            alt="" 
            className='md:hidden max-w-7 cursor-pointer' 
          />
          <img src={assets.help_icon} alt="" className='max-w-5 cursor-pointer opacity-80 hover:opacity-100' />
        </div>
      </div>

      <div className='flex-1 overflow-y-auto p-4 flex flex-col gap-4 hide-scrollbar min-h-0'>
        {messages.map((msg, index) => {
          const isMe = msg.senderId !== selectedUser._id;
          
          return (
            <div key={msg._id || index} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start flex-row-reverse'}`}>
              {msg.image ? (
                <img src={msg.image} alt="" className='max-w-[230px] rounded-lg border border-gray-700/50 mb-4' />
              ) : (
                <p className={`p-3 max-w-[240px] text-sm font-light rounded-2xl mb-4 break-words ${isMe ? 'bg-[#4b3e8a] text-white rounded-br-none' : 'bg-[#282142] text-white rounded-bl-none'}`}>
                  {msg.message}
                </p>
              )}
              <div className="text-center text-[10px] text-gray-400 min-w-[45px]">
                <img src={isMe ? assets.avatar_icon : (selectedUser.profilePic || assets.avatar_icon)} alt="" className='w-7 h-7 rounded-full mx-auto mb-1' />
                <p>{formatTime(msg.createdAt)}</p>
              </div>
            </div>
          )
        })}
        
        {isTyping && (
          <div className="flex items-end gap-2 justify-start flex-row-reverse">
            <div className="bg-[#282142] text-white p-3 max-w-[240px] text-sm font-light rounded-2xl mb-4 rounded-bl-none flex items-center gap-1 h-10">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
            </div>
            <div className="text-center text-[10px] text-gray-400 min-w-[45px]">
              <img src={selectedUser.profilePic || assets.avatar_icon} alt="" className='w-7 h-7 rounded-full mx-auto mb-1' />
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      <div className='shrink-0 flex items-center gap-3 bg-[#282142] px-5 py-3 rounded-full mx-4 mb-4 mt-2 border border-gray-600/30'>
        <input 
          type="text" 
          value={inputText}
          onChange={handleInputChange}
          onKeyDown={(e) => e.key === 'Enter' ? handleSendMessage() : null}
          placeholder="Send a message" 
          className='flex-1 bg-transparent border-none outline-none text-white text-sm placeholder:text-gray-400'
        />
        <label htmlFor="image-input">
          <img src={assets.gallery_icon} alt="gallery" className='w-5 cursor-pointer opacity-70 hover:opacity-100 transition-opacity' />
        </label>
        <div 
          onClick={handleSendMessage}
          className='bg-purple-600 p-2 rounded-full cursor-pointer hover:bg-violet-500 transition-colors flex items-center justify-center'
        >
          <img src={assets.send_button} alt="send" className='w-4 translate-x-[1px]' />
        </div>
      </div>

    </div>
  ) : (
    <div className='h-full flex flex-col items-center justify-center gap-4 text-gray-500 bg-white/5 max-md:hidden border-r border-gray-600/50'>
      <img src={assets.logo_icon} className='max-w-16 opacity-80' alt="" />
      <p className='text-xl font-medium text-white'>Chat anytime, anywhere</p>
    </div>
  )
}

export default ChatContainer