const { useState, useEffect, useCallback, memo } = React;

const App = memo(() => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('chats');
  const [currentChatId, setCurrentChatId] = useState(null);
  const [user, setUser] = useState(fakeUser);
  const [chats, setChats] = useState(fakeChats);
  const [theme, setTheme] = useState('light');
  const [activeSettingsSection, setActiveSettingsSection] = useState(null);
  const [showSettingsSection, setShowSettingsSection] = useState(false);
  const [showToast, setShowToast] = useState({ message: '', isVisible: false });

  // Load user data from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('jiseroUser');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setTheme(parsedUser.theme);
        // Apply theme
        if (parsedUser.theme === 'dark') {
          document.body.classList.add('dark');
          document.body.className = 'bg-dark-bg text-dark-text transition-colors duration-300 dark';
        }
      } catch (e) {
        console.error('Error parsing saved user data:', e);
      }
    }
  }, []);

  // Save user data to localStorage when it changes
  useEffect(() => {
    localStorage.setItem('jiseroUser', JSON.stringify(user));
  }, [user]);

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

  const handleLogin = useCallback((userData) => {
    setUser(userData);
    setTheme(userData.theme);
    setIsLoggedIn(true);
    // Apply theme
    if (userData.theme === 'dark') {
      document.body.classList.add('dark');
      document.body.className = 'bg-dark-bg text-dark-text transition-colors duration-300 dark';
    }
    showToastMessage('Welcome to Jisero!');
    triggerHapticFeedback();
  }, [showToastMessage, triggerHapticFeedback]);

  const handleLogout = useCallback(() => {
    setIsLoggedIn(false);
    setActiveTab('chats');
    setCurrentChatId(null);
    setShowSettingsSection(false);
    setActiveSettingsSection(null);
    showToastMessage('Logged out successfully');
    triggerHapticFeedback();
  }, [showToastMessage, triggerHapticFeedback]);

  const handleSelectChat = useCallback((chatId) => {
    setCurrentChatId(chatId);
    // Mark as read when opening chat
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, unreadCount: 0 } : chat
      )
    );
    triggerHapticFeedback();
  }, [triggerHapticFeedback]);

  const handleBackToChats = useCallback(() => {
    setCurrentChatId(null);
    triggerHapticFeedback();
  }, [triggerHapticFeedback]);

  const handleTogglePin = useCallback((chatId) => {
    setChats(prevChats => 
      prevChats.map(chat => 
        chat.id === chatId ? { ...chat, isPinned: !chat.isPinned } : chat
      )
    );
    triggerHapticFeedback();
  }, [triggerHapticFeedback]);

  const handleArchiveChat = useCallback((chatId) => {
    showToastMessage("Chat archived");
    triggerHapticFeedback();
    // In a real app, this would move to archive
  }, [showToastMessage, triggerHapticFeedback]);

  const handleDeleteChat = useCallback((chatId) => {
    setChats(prevChats => 
      prevChats.filter(chat => chat.id !== chatId)
    );
    if (currentChatId === chatId) {
      setCurrentChatId(null);
    }
    showToastMessage("Chat deleted");
    triggerHapticFeedback();
  }, [currentChatId, showToastMessage, triggerHapticFeedback]);

  const handleSendMessage = useCallback((text) => {
    if (!text.trim()) return;
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    // Create new message
    const newMessage = {
      id: Date.now(), // Use timestamp as ID for uniqueness
      text: text,
      sender: 'me',
      timestamp: timestamp,
      status: 'sent',
      reactions: []
    };
    // Update chats state immutably
    setChats(prevChats => 
      prevChats.map(c => {
        if (c.id === currentChatId) {
          // Update the current chat with new message
          return {
            ...c,
            lastMessage: text,
            timestamp: timestamp,
            messages: [...c.messages, newMessage]
          };
        }
        return c;
      })
    );
    // Simulate response after 2 seconds
    setTimeout(() => {
      const responseTime = new Date();
      const responseTimestamp = responseTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const responseMessage = {
        id: Date.now() + 1,
        text: "Thanks for your message!",
        sender: 'other',
        timestamp: responseTimestamp,
        status: 'read',
        reactions: []
      };
      // Update chats with response message
      setChats(prevChats => 
        prevChats.map(c => {
          if (c.id === currentChatId) {
            return {
              ...c,
              lastMessage: responseMessage.text,
              timestamp: responseTimestamp,
              messages: [...c.messages, responseMessage],
              unreadCount: 0 // Reset unread count since we're viewing the chat
            };
          }
          return c;
        })
      );
      triggerHapticFeedback();
    }, 2000);
  }, [currentChatId, triggerHapticFeedback]);

  const handleUpdateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('jiseroUser', JSON.stringify(updatedUser));
    showToastMessage('Settings updated successfully!');
    triggerHapticFeedback();
  }, [showToastMessage, triggerHapticFeedback]);

  const handleNavigateToSettingsSection = useCallback((section) => {
    setActiveSettingsSection(section);
    setShowSettingsSection(true);
    triggerHapticFeedback();
  }, [triggerHapticFeedback]);

  const handleBackFromSettingsSection = useCallback(() => {
    setShowSettingsSection(false);
    setActiveSettingsSection(null);
    triggerHapticFeedback();
  }, [triggerHapticFeedback]);

  if (!isLoggedIn) {
    return <Login onLogin={handleLogin} />;
  }

  const currentChat = chats.find(chat => chat.id === currentChatId);

  return (
    <div className={`h-screen flex flex-col transition-colors duration-300 ${theme === 'dark' ? 'bg-dark-bg text-dark-text' : 'bg-white text-black'}`}>
      {showSettingsSection && activeSettingsSection ? (
        <div className="slide-enter slide-enter-active h-full w-full">
          <SettingsSection 
            section={activeSettingsSection}
            onBack={handleBackFromSettingsSection}
            user={user}
            onUpdateUser={handleUpdateUser}
            theme={theme}
            setTheme={setTheme}
          />
        </div>
      ) : currentChatId ? (
        <ChatDetail 
          chat={currentChat} 
          onBack={handleBackToChats}
          onSendMessage={handleSendMessage}
          chats={chats}
          setChats={setChats}
          currentChatId={currentChatId}
          theme={theme}
        />
      ) : activeTab === 'chats' ? (
        <ChatsPage 
          chats={chats} 
          onSelectChat={handleSelectChat}
          currentChatId={currentChatId}
          onArchive={handleArchiveChat}
          onDelete={handleDeleteChat}
          onPin={handleTogglePin}
          theme={theme}
        />
      ) : (
        <SettingsPage 
          user={user} 
          onLogout={handleLogout}
          onUpdateUser={handleUpdateUser}
          theme={theme}
          setTheme={setTheme}
          onNavigateToSection={handleNavigateToSettingsSection}
        />
      )}
      {!currentChatId && !showSettingsSection && (
        <BottomNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
          theme={theme}
        />
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

// Make App available globally
window.App = App;
