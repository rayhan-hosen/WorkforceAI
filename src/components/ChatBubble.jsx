function ChatBubble({ message, isAI }) {
  if (isAI) {
    return (
      <div className="flex items-start space-x-2 mb-4">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
          🤖
        </div>
        <div className="bg-white text-gray-700 rounded-tr-xl rounded-bl-xl rounded-tl-md p-3 mr-auto max-w-[70%] shadow-md">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-start space-x-2 mb-4 justify-end">
      <div className="bg-indigo-500 text-white rounded-tl-xl rounded-br-xl rounded-tr-md p-3 ml-auto max-w-[70%] shadow-md">
        <p className="text-sm leading-relaxed whitespace-pre-wrap">{message}</p>
      </div>
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center text-white font-bold">
        👤
      </div>
    </div>
  )
}

export default ChatBubble

