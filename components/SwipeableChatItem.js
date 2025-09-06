const { memo, useState, useRef, useCallback } = React;

const SwipeableChatItem = memo(({ chat, onClick, currentChatId, onSelectChat, onArchive, onDelete, onPin, theme }) => {
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [showToast, setShowToast] = useState({ message: '', isVisible: false });
  const startX = useRef(0);
  const containerRef = useRef(null);

  const showToastMessage = useCallback((msg) => {
    setShowToast({ message: msg, isVisible: true });
    setTimeout(() => {
      setShowToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  const triggerHapticFeedback = useCallback(() => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(15);
    }
  }, []);

  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
    setIsSwiping(true);
  };

  const handleTouchMove = (e) => {
    if (!isSwiping) return;
    const currentX = e.touches[0].clientX;
    const diff = startX.current - currentX;
    // Only allow swiping left
    if (diff > 0) {
      setSwipeOffset(diff);
    }
  };

  const handleTouchEnd = () => {
    if (!isSwiping) return;
    if (swipeOffset > 100) {
      // Show actions
      setSwipeOffset(210);
      triggerHapticFeedback();
    } else if (swipeOffset > 50) {
      // Threshold to show actions
      setSwipeOffset(210);
      triggerHapticFeedback();
    } else {
      // Reset
      setSwipeOffset(0);
    }
    setIsSwiping(false);
  };

  const handleAction = (action) => {
    setSwipeOffset(0);
    triggerHapticFeedback();
    switch(action) {
      case 'pin':
        onPin(chat.id);
        showToastMessage(`${chat.isPinned ? 'Unpinned' : 'Pinned'} ${chat.name}`);
        break;
      case 'archive':
        onArchive(chat.id);
        showToastMessage(`Archived ${chat.name}`);
        break;
      case 'delete':
        if (window.confirm(`Are you sure you want to delete the chat with ${chat.name}?`)) {
          onDelete(chat.id);
          showToastMessage(`Deleted chat with ${chat.name}`);
        }
        break;
      default:
        break;
    }
  };

  return (
    <div 
      ref={containerRef}
      className={`swipe-container ${isSwiping ? 'swiping' : ''}`}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{ position: 'relative' }}
      role="button"
      tabIndex={0}
      aria-label={`Chat with ${chat.name}`}
    >
      <div className="swipe-indicator"></div>
      <div 
        className="absolute top-0 right-0 h-full flex transition-transform duration-300 ease-out"
        style={{ transform: `translateX(${swipeOffset > 0 ? 100 - (swipeOffset / 210 * 100) : 100}%)` }}
      >
        <button 
          onClick={() => handleAction('pin')}
          className="swipe-action pin-action w-20 flex flex-col items-center justify-center"
          aria-label={chat.isPinned ? "Unpin chat" : "Pin chat"}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h1.586l-.293.293a1 1 0 001.414 1.414l.586-.586.586.586a1 1 0 001.414-1.414L10 16.414l.293.293a1 1 0 001.414-1.414l-.586-.586.586-.586a1 1 0 00-1.414-1.414L10 13.586l-.293-.293a1 1 0 00-1.414 1.414l.586.586-.586.586a1 1 0 00-1.414 0L7 15.414V5H5zm4 2a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H13a1 1 0 01-1-1z" clipRule="evenodd" />
          </svg>
          <span>{chat.isPinned ? "Unpin" : "Pin"}</span>
        </button>
        <button 
          onClick={() => handleAction('archive')}
          className="swipe-action archive-action w-20 flex flex-col items-center justify-center"
          aria-label="Archive chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
          </svg>
          <span>Archive</span>
        </button>
        <button 
          onClick={() => handleAction('delete')}
          className="swipe-action delete-action w-20 flex flex-col items-center justify-center"
          aria-label="Delete chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mb-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <span>Delete</span>
        </button>
      </div>
      <div 
        className={`flex items-center p-4 border-b border-gray-100 dark:border-gray-700 cursor-pointer transition-colors duration-200 ${
          currentChatId === chat.id ? 'bg-gray-50 dark:bg-gray-800' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
        }`}
        onClick={() => onSelectChat(chat.id)}
        style={{ 
          transform: `translateX(${-swipeOffset}px)`,
          transition: isSwiping ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          height: '72px'
        }}
      >
        <div className="relative">
          <img 
            src={chat.avatar} 
            alt={chat.name} 
            className="w-12 h-12 rounded-full object-cover"
            aria-label={`${chat.name}'s avatar`}
          />
          {chat.isPinned && (
            <div className="absolute -top-1 -right-1 bg-jisero-blue text-white rounded-full w-5 h-5 flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M5 3a2 2 0 00-2 2v10a2 2 0 002 2h1.586l-.293.293a1 1 0 001.414 1.414l.586-.586.586.586a1 1 0 001.414-1.414L10 16.414l.293.293a1 1 0 001.414-1.414l-.586-.586.586-.586a1 1 0 00-1.414-1.414L10 13.586l-.293-.293a1 1 0 00-1.414 1.414l.586.586-.586.586a1 1 0 00-1.414 0L7 15.414V5H5zm4 2a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1zm3 0a1 1 0 011-1h.01a1 1 0 110 2H13a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>
        <div className="ml-3 flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">{chat.name}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{chat.timestamp}</span>
          </div>
          <div className="flex items-center mt-1">
            <p className="text-sm text-gray-600 dark:text-gray-300 truncate flex-1">{chat.lastMessage}</p>
            {chat.unreadCount > 0 && (
              <div className="unread-badge ml-2">
                {chat.unreadCount > 99 ? '99+' : chat.unreadCount}
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="toast-container">
        <Toast 
          message={showToast.message} 
          isVisible={showToast.isVisible} 
          onClose={() => setShowToast(prev => ({ ...prev, isVisible: false }))}
        />
      </div>
    </div>
  );
});

window.SwipeableChatItem = SwipeableChatItem;
