const { memo, useState, useRef, useCallback } = React;

const Message = memo(({ message, isSelected, onSelect, onLongPress, onReact, theme }) => {
  const [isPressed, setIsPressed] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const pressTimer = useRef(null);

  const getStatusIcon = (status) => {
    switch(status) {
      case 'read':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-jisero-blue ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M16.707 8.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 15.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'delivered':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            <path fillRule="evenodd" d="M16.707 8.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 15.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      case 'sent':
        return (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 ml-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const handleTouchStart = () => {
    pressTimer.current = setTimeout(() => {
      setIsPressed(true);
      setShowReactions(true);
      if (onLongPress) onLongPress();
    }, 500);
  };

  const handleTouchEnd = () => {
    clearTimeout(pressTimer.current);
    if (!isPressed && !showReactions) {
      if (onSelect) onSelect();
    }
    setIsPressed(false);
    setTimeout(() => setShowReactions(false), 2000);
  };

  const handleReaction = (emoji) => {
    setShowReactions(false);
    if (onReact) onReact(emoji);
  };

  const handleClick = () => {
    if (!isPressed && !showReactions && onSelect) onSelect();
  };

  return (
    <div 
      className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} mb-2 transition-all duration-200 ${isSelected ? 'message-selected' : ''} animate-fade-in`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseUp={handleTouchEnd}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Message: ${message.text} ${message.status === 'read' ? 'read' : message.status === 'delivered' ? 'delivered' : 'sent'}`}
    >
      <div className={`message-bubble ${message.sender === 'me' ? 'sent' : 'received'} ${isSelected ? 'ring-2 ring-jisero-blue' : ''} relative`}>
        <div className="flex items-end">
          <span>{message.text}</span>
          {message.sender === 'me' && getStatusIcon(message.status)}
        </div>
        <div className={`text-xs mt-1 ${message.sender === 'me' ? 'text-gray-300 text-right' : 'text-gray-500 dark:text-gray-400'}`}>
          {message.timestamp}
        </div>
        {message.reactions && message.reactions.length > 0 && (
          <div className={`flex ${message.sender === 'me' ? 'justify-end' : 'justify-start'} mt-1`}>
            {message.reactions.map((reaction, index) => (
              <div key={index} className="flex items-center bg-black bg-opacity-10 dark:bg-white dark:bg-opacity-20 rounded-full px-2 py-1 mr-1">
                <span className="text-xs">{reaction.emoji}</span>
                {reaction.count > 1 && <span className="text-xs ml-1">{reaction.count}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      {showReactions && (
        <div className="reaction-container animate-scale-in">
          {reactionEmojis.map((emoji, index) => (
            <button
              key={index}
              className="reaction-btn"
              onClick={() => handleReaction(emoji)}
              aria-label={`React with ${emoji}`}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
});

window.Message = Message;
