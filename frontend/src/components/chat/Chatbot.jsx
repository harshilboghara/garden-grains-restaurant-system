import { useState, useRef, useEffect } from 'react'
import logoImg from "../../assets/logo.png";
import { useQuery, useMutation } from 'react-query'
import { chatbotAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { 
  ChatBubbleBottomCenterTextIcon, 
  XMarkIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline'

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const { isAuthenticated, user } = useAuth()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setTimeout(() => {
        setIsTyping(true);
        setTimeout(() => {
          setMessages([
            {
              id: 1,
              type: 'bot',
              content: `Hi ${user?.name || 'there'}! 👋 I'm your Garden Grains assistant. How can I make your experience better today?`,
              timestamp: new Date()
            }
          ]);
          setIsTyping(false);
        }, 1000);
      }, 500);
    }
  }, [isOpen, messages.length, user?.name])

  const sendMessageMutation = useMutation(
    (message) => chatbotAPI.sendMessage(message, null),
    {
      onSuccess: (response) => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'bot',
            content: response.data.message,
            timestamp: new Date()
          }
        ])
        setIsTyping(false)
      },
      onError: (error) => {
        setMessages(prev => [
          ...prev,
          {
            id: Date.now() + 1,
            type: 'bot',
            content: "I'm having a bit of a moment. Could you try asking that again in a few seconds?",
            timestamp: new Date()
          }
        ])
        setIsTyping(false)
      }
    }
  )

  const handleSendMessage = (e) => {
    e?.preventDefault()
    const messageToSend = inputMessage.trim()
    if (!messageToSend) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageToSend,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    sendMessageMutation.mutate(messageToSend)
  }

  const quickActions = [
    { label: '🌱 Vegan Specials', action: 'Show me vegan dishes' },
    { label: '📦 Order Status', action: 'Track my order' },
    { label: '🍽 Our Menu', action: 'Show me the menu' },
    { label: '🕐 Opening Hours', action: 'What are your operating hours?' },
    { label: '📞 Book a Table', action: 'I want to make a reservation' }
  ]

  const handleQuickAction = (action) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: action,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, userMessage])
    setIsTyping(true)
    sendMessageMutation.mutate(action)
  }

  if (!isAuthenticated) return null

  return (
    <>
      {/* Premium Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[100] group flex items-center justify-center p-0.5 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 ${
          isOpen ? 'rotate-90' : 'rotate-0'
        }`}
      >
        <div className="absolute inset-0 bg-gradient-to-tr from-warm-gold via-yellow-500 to-amber-600 rounded-full blur-sm opacity-50 group-hover:opacity-100 transition-opacity animate-pulse"></div>
        <div className="relative bg-pearl text-dark-slate p-4 rounded-full border border-dark-slate/10 shadow-2xl flex items-center justify-center">
          {isOpen ? (
            <XMarkIcon className="h-6 w-6 text-warm-gold" />
          ) : (
            <div className="flex items-center space-x-2">
              <ChatBubbleBottomCenterTextIcon className="h-6 w-6 text-warm-gold" />
              <span className="max-w-0 overflow-hidden group-hover:max-w-xs transition-all duration-500 ease-in-out font-bold text-sm whitespace-nowrap tracking-wide">
                CHAT WITH US
              </span>
            </div>
          )}
        </div>
      </button>

      {/* Professional Compact Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-[100] w-[340px] h-[520px] bg-[#0B1218]/95 backdrop-blur-2xl rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] border border-dark-slate/10 flex flex-col overflow-hidden animate-slide-up">
          
          {/* Header Area */}
          <div className="relative p-6 bg-gradient-to-b from-white/5 to-transparent border-b border-dark-slate/5">
             <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                   <div className="relative">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-warm-gold to-amber-600 p-[1.5px] rotate-3 group-hover:rotate-0 transition-transform">
                         <div className="w-full h-full rounded-2xl bg-pearl flex items-center justify-center overflow-hidden">
                            <img src={logoImg} alt="Assistant" className="w-9 h-9 object-contain" />
                         </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-pearl rounded-full flex items-center justify-center">
                         <div className="w-2.5 h-2.5 bg-organic-green rounded-full shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-pulse"></div>
                      </div>
                   </div>
                   <div>
                      <h3 className="font-bold text-dark-slate text-base tracking-tight leading-none mb-1">Garden Assistant</h3>
                      <p className="text-[10px] text-gray-400 uppercase font-bold tracking-[0.1em]">Always Online</p>
                   </div>
                </div>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-gray-400 hover:text-dark-slate transition-colors"
                >
                   <ChevronDownIcon className="w-5 h-5" />
                </button>
             </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-5 custom-scrollbar bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.03),transparent_40%)]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${message.type === 'user' ? 'items-end' : 'items-start'} animate-fade-in`}
              >
                <div
                  className={`relative max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    message.type === 'user'
                      ? 'bg-gradient-to-tr from-warm-gold to-amber-600 text-black font-semibold rounded-tr-none'
                      : 'bg-dark-slate/5 text-gray-200 border border-dark-slate/10 rounded-tl-none font-medium'
                  }`}
                >
                  {message.content}
                </div>
                <span className="text-[9px] mt-1.5 text-gray-600 font-bold uppercase tracking-widest">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start animate-fade-in">
                <div className="px-5 py-3 rounded-2xl bg-dark-slate/5 border border-dark-slate/10 rounded-tl-none">
                  <div className="flex space-x-1.5">
                    <div className="w-1.5 h-1.5 bg-warm-gold rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-1.5 h-1.5 bg-warm-gold rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-1.5 h-1.5 bg-warm-gold rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Footer Area */}
          <div className="shrink-0">
             {/* Quick Actions - Only shown when keyboard is not up or message list is empty/initial */}
             {messages.length < 3 && !isTyping && (
                <div className="px-5 pb-3">
                   <div className="flex flex-wrap gap-2">
                     {quickActions.map((action, index) => (
                       <button
                         key={index}
                         onClick={() => handleQuickAction(action.action)}
                         className="text-[10px] bg-dark-slate/5 hover:bg-warm-gold hover:text-black border border-dark-slate/10 text-gray-400 px-3 py-1.5 rounded-full transition-all duration-300 font-bold uppercase tracking-wider"
                       >
                         {action.label}
                       </button>
                     ))}
                   </div>
                </div>
             )}

             {/* Input Bar */}
             <div className="p-5 pt-2 bg-gradient-to-t from-[#0B0F14] to-transparent">
                <form 
                  onSubmit={handleSendMessage} 
                  className="relative group bg-dark-slate/5 border border-dark-slate/10 focus-within:border-warm-gold/50 rounded-2xl transition-all duration-300"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask anything..."
                    className="w-full bg-transparent px-5 py-4 pr-14 text-sm text-dark-slate placeholder-gray-600 outline-none transition-all"
                    disabled={isTyping}
                  />
                  <button
                    type="submit"
                    disabled={!inputMessage.trim() || isTyping}
                    className="absolute right-2 top-2 bottom-2 aspect-square bg-warm-gold hover:bg-yellow-500 disabled:opacity-20 disabled:grayscale text-black rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg active:scale-90"
                  >
                    <PaperAirplaneIcon className="h-5 w-5 -rotate-45" />
                  </button>
                </form>
                <div className="flex items-center justify-center mt-4 space-x-1.5 opacity-20">
                   <SparklesIcon className="w-3 h-3 text-warm-gold" />
                   <p className="text-[8px] text-gray-400 font-bold tracking-[0.2em] uppercase">Powered by Garden AI</p>
                </div>
             </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Chatbot
