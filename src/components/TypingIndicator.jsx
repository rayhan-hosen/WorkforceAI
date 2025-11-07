function TypingIndicator() {
  return (
    <div className="flex items-start space-x-2 mb-4">
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold">
        🤖
      </div>
      <div className="bg-white text-gray-700 rounded-tr-xl rounded-bl-xl rounded-tl-md p-3 mr-auto shadow-md">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  )
}

export default TypingIndicator

