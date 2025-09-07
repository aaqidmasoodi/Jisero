const { memo, useState, useMemo, useCallback, useRef } = React;

const ChatsPage = memo(({ chats, onSelectChat, currentChatId, onArchive, onDelete, onPin, onViewContact, theme }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showContactProfile, setShowContactProfile] = useState(false);
  const [selectedContact, setSelectedContact] = useState(null);
  const [showToast, setShowToast] = useState({ message: '', isVisible: false });
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const touchStartY = useRef(0);

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

  const filteredChats = useMemo(() => {
    return chats.filter(chat => 
      chat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chats, searchTerm]);

  const pinnedChats = useMemo(() => {
    return chats.filter(chat => chat.isPinned);
  }, [chats]);

  const handleViewContact = useCallback((chat) => {
    setSelectedContact(chat);
    setShowContactProfile(true);
  }, []);

  const handleCloseContactProfile = useCallback(() => {
    setShowContactProfile(false);
    setSelectedContact(null);
  }, []);

  const handleTouchStart = useCallback((e) => {
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e) => {
    if (touchStartY.current === 0) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;
    
    if (distance > 0 && window.scrollY === 0) {
      setPullDistance(Math.min(distance, 80));
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (pullDistance > 50) {
      setRefreshing(true);
      setTimeout(() => {
        setRefreshing(false);
        showToastMessage('Chats refreshed!');
      }, 1500);
    }
    setPullDistance(0);
    touchStartY.current = 0;
  }, [pullDistance, showToastMessage]);

  const handleKeyDown = useCallback((e, chat) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onSelectChat(chat.id);
      triggerHapticFeedback();
    }
  }, [onSelectChat, triggerHapticFeedback]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="app-header bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center transition-colors duration-300">
        <h1 className="text-lg font-bold text-black dark:text-white">Chats</h1>
        <div className="ml-auto flex space-x-2">
          <button 
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            onClick={() => setShowSearch(!showSearch)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* Header Spacer - accounts for fixed header */}
      <div style={{ height: `calc(64px + ${typeof window !== 'undefined' && window.CSS && window.CSS.env ? 'env(safe-area-inset-top, 0)' : '0px'})` }}></div>
      
      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-3 bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-gray-700 transition-colors duration-300 fixed left-0 right-0 z-50" style={{ top: `calc(64px + ${typeof window !== 'undefined' && window.CSS && window.CSS.env ? 'env(safe-area-inset-top, 0)' : '0px'})` }}>
          <div className="relative">
            <input
              type="text"
              placeholder="Search chats"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-dark-secondary dark:text-dark-text"
              aria-label="Search chats"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      )}
      
      <div className="app-content">
        <div 
          className="scrollable-content"
          style={{ paddingTop: showSearch ? '60px' : '0' }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
        {/* Pull to refresh indicator */}
        <div className={`pull-to-refresh ${pullDistance > 30 ? 'show' : ''}`}>
          {refreshing ? (
            <div className="refresh-indicator"></div>
          ) : (
            <span className="text-gray-500 dark:text-gray-400 text-sm">Pull to refresh</span>
          )}
        </div>
        
        {/* Pinned Chats Carousel */}
        {pinnedChats.length > 0 && (
          <div className="pinned-carousel">
            {pinnedChats.map(chat => (
              <div 
                key={chat.id} 
                className="pinned-chat"
                onClick={() => onSelectChat(chat.id)}
                role="button"
                tabIndex={0}
                aria-label={`Go to chat with ${chat.name}`}
              >
                <img src={chat.avatar} alt={chat.name} />
                {chat.unreadCount > 0 && (
                  <div className="pinned-badge">
                    {chat.unreadCount > 9 ? '9+' : chat.unreadCount}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        
        {/* Chat List */}
        <div className="flex-1 overflow-y-auto bg-white dark:bg-dark-bg transition-colors duration-300">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <p>No chats found</p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <SwipeableChatItem 
                key={chat.id} 
                chat={chat} 
                currentChatId={currentChatId}
                onSelectChat={onSelectChat}
                onArchive={onArchive}
                onDelete={onDelete}
                onPin={onPin}
                onKeyDown={(e) => handleKeyDown(e, chat)}
                theme={theme}
              />
            ))
          )}
        </div>
      </div>
      </div>
      
      {/* Contact Profile Modal */}
      {showContactProfile && selectedContact && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="slide-enter slide-enter-active w-full max-w-md h-full">
            <ContactProfile 
              contact={selectedContact} 
              onBack={handleCloseContactProfile}
              theme={theme}
            />
          </div>
        </div>
      )}
      
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

window.ChatsPage = ChatsPage;
