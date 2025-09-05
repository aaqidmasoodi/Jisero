const { useState, useEffect } = React;

function App() {
  const [activeTab, setActiveTab] = useState('chats');
  const [currentPage, setCurrentPage] = useState('chats');
  const [currentChat, setCurrentChat] = useState(null);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [chats, setChats] = useState([]);

  // Initialize user and load chats
  useEffect(() => {
    initializeUser();
    
    // Listen for custom chat list update events
    const handleChatListUpdate = () => {
      const updatedChats = window.chatStorage.getChats();
      setChats([...updatedChats]);
    };
    
    window.addEventListener('chatListUpdate', handleChatListUpdate);
    
    return () => {
      window.removeEventListener('chatListUpdate', handleChatListUpdate);
    };
  }, []);

  const initializeUser = async () => {
    console.log('Initializing user...');
    
    if (window.chatStorage) {
      // Clean up any duplicate chats first
      const cleanedChats = window.chatStorage.removeDuplicateChats();
      
      // Get existing user from localStorage
      let user = window.chatStorage.getCurrentUser();
      console.log('Existing user from localStorage:', user);
      
      if (!user) {
        console.log('No existing user, registering new user...');
        // Register new user with server
        try {
          const response = await fetch('http://localhost:3000/api/register', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              username: `User${Math.random().toString(36).substring(2, 6)}`,
              preferredLanguage: 'en'
            })
          });
          
          console.log('Registration response status:', response.status);
          
          if (response.ok) {
            user = await response.json();
            console.log('New user registered:', user);
            window.chatStorage.setCurrentUser(user);
          } else {
            const errorText = await response.text();
            console.error('Registration failed:', response.status, errorText);
            
            // Fallback: create user locally if server fails
            user = {
              userId: `USER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
              username: `User${Math.random().toString(36).substring(2, 6)}`,
              avatar: 'U',
              preferredLanguage: 'en'
            };
            console.log('Created fallback user:', user);
            window.chatStorage.setCurrentUser(user);
          }
        } catch (error) {
          console.error('Registration error:', error);
          
          // Fallback: create user locally if network fails
          user = {
            userId: `USER-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
            username: `User${Math.random().toString(36).substring(2, 6)}`,
            avatar: 'U',
            preferredLanguage: 'en'
          };
          console.log('Created fallback user after error:', user);
          window.chatStorage.setCurrentUser(user);
        }
      }
      
      console.log('Final user:', user);
      setCurrentUser(user);
      
      // Load existing chats (already cleaned)
      setChats(cleanedChats);
    }
  };

  // Initialize socket connection when user is ready
  useEffect(() => {
    if (currentUser && window.socketService) {
      console.log('Connecting to socket with user:', currentUser);
      
      // Connect to socket server
      window.socketService.connect({
        userId: currentUser.userId,
        username: currentUser.username,
        avatar: currentUser.avatar
      });

      // Set up connection status listeners
      window.socketService.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      window.socketService.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      // Handle online/offline status updates
      window.socketService.on('user-online', (userData) => {
        console.log('User came online:', userData.userId);
        if (window.chatStorage) {
          window.chatStorage.updateChatOnlineStatus(userData.userId, true);
          // Refresh chats with real-time online status check
          const updatedChats = window.chatStorage.getChats().map(chat => ({
            ...chat,
            isOnline: window.socketService.isUserOnline(chat.userId)
          }));
          setChats([...updatedChats]);
        }
      });

      window.socketService.on('user-offline', (userData) => {
        console.log('User went offline:', userData.userId);
        if (window.chatStorage) {
          window.chatStorage.updateChatOnlineStatus(userData.userId, false);
          // Refresh chats with real-time online status check
          const updatedChats = window.chatStorage.getChats().map(chat => ({
            ...chat,
            isOnline: window.socketService.isUserOnline(chat.userId)
          }));
          setChats([...updatedChats]);
        }
      });

      // Handle initial online users list
      window.socketService.on('online-users', (users) => {
        console.log('Received online users list:', users);
        if (window.chatStorage) {
          // First mark all users as offline
          const allChats = window.chatStorage.getChats();
          allChats.forEach(chat => {
            window.chatStorage.updateChatOnlineStatus(chat.userId, false);
          });
          
          // Then mark online users as online
          users.forEach(user => {
            const userId = user.userId || user.user_id;
            if (userId) {
              window.chatStorage.updateChatOnlineStatus(userId, true);
            }
          });
          
          // Refresh chats to show updated statuses
          const updatedChats = window.chatStorage.getChats();
          setChats([...updatedChats]);
        }
      });

      // Set up message listeners
      window.socketService.on('new-message', (data) => {
        console.log('New message received:', data);
        
        // Update chats list with fresh data and online status
        const updatedChats = window.chatStorage.getChats().map(chat => ({
          ...chat,
          isOnline: window.socketService.isUserOnline(chat.userId)
        }));
        setChats([...updatedChats]);
        
        // If we're in the chat, we might want to refresh messages
        if (currentChat && data.chat && data.chat.id === currentChat.id) {
          // Trigger a re-render of chat messages
          setCurrentChat({...data.chat});
        }
      });

      // Set up user discovery listeners
      window.socketService.on('user-found', (userData) => {
        console.log('User found:', userData);
        // This will be handled by NewChatModal
      });

      window.socketService.on('user-not-found', (userId) => {
        console.log('User not found:', userId);
        // This will be handled by NewChatModal
      });
    }

    // Cleanup on unmount
    return () => {
      if (window.socketService) {
        window.socketService.disconnect();
      }
    };
  }, [currentUser]);

  const navigateToChat = (chat) => {
    setCurrentChat(chat);
    setCurrentPage('chat');
  };

  const goBack = () => {
    if (currentPage === 'chat') {
      setCurrentPage(activeTab);
      setCurrentChat(null);
    } else if (currentPage === 'chatSettings') {
      setCurrentPage('chat');
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setCurrentPage(tab);
    setCurrentChat(null);
  };

  const handleNewChat = () => {
    setShowNewChatModal(true);
  };

  const handleDeleteChat = (chat) => {
    // Delete locally
    if (window.chatStorage) {
      window.chatStorage.deleteChat(chat.id);
      const updatedChats = window.chatStorage.getChats();
      setChats([...updatedChats]);
    }

    // Notify server and other user
    if (window.socketService) {
      window.socketService.deleteChat(chat.id, chat.userId);
    }

    // Navigate away if currently viewing this chat
    if (currentChat && currentChat.id === chat.id) {
      setCurrentPage('chats');
      setCurrentChat(null);
    }
  };

  const handleCreateChat = (newChat) => {
    // Refresh chats from storage to avoid duplicates
    const updatedChats = window.chatStorage.getChats();
    setChats([...updatedChats]);
    
    // Navigate to the new chat immediately
    if (newChat) {
      navigateToChat(newChat);
    }
  };

  const handleChatSettings = () => {
    setCurrentPage('chatSettings');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'chats':
        return (
          <Chats 
            chats={chats} 
            onChatSelect={navigateToChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            currentUser={currentUser}
          />
        );
      case 'chat':
        return (
          <ChatDetail 
            chat={currentChat} 
            onBack={goBack}
            onChatSettings={handleChatSettings}
            isConnected={isConnected}
            currentUser={currentUser}
          />
        );
      case 'chatSettings':
        return (
          <ChatSettings 
            onBack={goBack}
          />
        );
      case 'settings':
        return (
          <MainSettings 
            isConnected={isConnected} 
            currentUser={currentUser}
            onUserUpdate={(updatedUser) => {
              setCurrentUser(updatedUser);
              window.chatStorage.setCurrentUser(updatedUser);
            }}
          />
        );
      default:
        return (
          <Chats 
            chats={chats} 
            onChatSelect={navigateToChat}
            onNewChat={handleNewChat}
            onDeleteChat={handleDeleteChat}
            currentUser={currentUser}
          />
        );
    }
  };

  const showBottomNav = currentPage === 'chats' || currentPage === 'settings';

  return (
    <div className="h-screen flex flex-col bg-white">
      {/* Main content area */}
      <div className={`flex-1 overflow-hidden ${showBottomNav ? 'pb-16' : ''}`}>
        {renderPage()}
      </div>
      
      {/* Fixed bottom navigation */}
      {showBottomNav && (
        <div className="fixed bottom-0 left-0 right-0 z-50">
          <TabBar 
            activeTab={activeTab}
            onTabChange={handleTabChange}
          />
        </div>
      )}
      
      <NewChatModal
        isOpen={showNewChatModal}
        onClose={() => setShowNewChatModal(false)}
        onCreateChat={handleCreateChat}
        currentUser={currentUser}
        isConnected={isConnected}
      />
      
      {/* Connection status indicator */}
      {!isConnected && currentUser && (
        <div className="fixed top-0 left-0 right-0 bg-red-500 text-white text-center py-1 text-sm z-50">
          Connecting to server...
        </div>
      )}
    </div>
  );
}
