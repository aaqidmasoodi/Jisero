function MessageBubble({ message, isOwn, showTranslation, onTranslate, status }) {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      <div className={`message-bubble px-4 py-2 rounded-2xl max-w-xs ${
        isOwn 
          ? 'bg-blue-500 text-white rounded-br-md' 
          : 'bg-gray-200 text-gray-800 rounded-bl-md'
      }`}>
        <div className="text-sm">{message.text}</div>
        
        {showTranslation && message.translation && (
          <div className="text-xs mt-1 opacity-75 italic border-t border-gray-300 pt-1">
            {message.translation}
          </div>
        )}
        
        <div className="flex items-center justify-between mt-1">
          <span className="text-xs opacity-60">
            {formatTime(message.timestamp)}
          </span>
          
          {status && (
            <span className="text-xs ml-2">
              {status}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
