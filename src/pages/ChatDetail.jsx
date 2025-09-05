const { useState, useEffect, useRef } = React;

function ChatDetail({ chat, onBack, onChatSettings, isConnected, currentUser }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const [userPreferredLang, setUserPreferredLang] = useState('en');
  const [chatOnlineStatus, setChatOnlineStatus] = useState(chat?.isOnline || false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load messages and user preferences
  useEffect(() => {
    if (chat && window.chatStorage) {
      const chatMessages = window.chatStorage.getMessages(chat.id);
      setMessages(chatMessages);
      
      // Get fresh chat data to ensure we have current online status
      const chats = window.chatStorage.getChats();
      const currentChat = chats.find(c => c.id === chat.id);
      setChatOnlineStatus(currentChat?.isOnline || false);
      
      // Scroll to bottom immediately when entering chat
      setTimeout(() => scrollToBottom(), 100);
    }

    // Get user's preferred language
    if (currentUser) {
      const savedLang = localStorage.getItem('user_preferred_language') || 'en';
      setUserPreferredLang(savedLang);
    }
  }, [chat, currentUser]);

  // Set up message listeners and real-time status updates
  useEffect(() => {
    if (window.socketService && chat) {
      const handleNewMessage = (data) => {
        if (data.chat && data.chat.id === chat.id) {
          // Reload messages from storage
          const updatedMessages = window.chatStorage.getMessages(chat.id);
          setMessages([...updatedMessages]);
        }
      };

      // Real-time online status updates
      const handleUserOnline = (userData) => {
        if (userData.userId === chat.userId) {
          console.log(`Chat user ${chat.userId} came online`);
          setChatOnlineStatus(true);
        }
      };

      const handleUserOffline = (userData) => {
        if (userData.userId === chat.userId) {
          console.log(`Chat user ${chat.userId} went offline`);
          setChatOnlineStatus(false);
        }
      };

      window.socketService.on('new-message', handleNewMessage);
      window.socketService.on('user-online', handleUserOnline);
      window.socketService.on('user-offline', handleUserOffline);

      // Check initial online status
      const isCurrentlyOnline = window.socketService.isUserOnline(chat.userId);
      setChatOnlineStatus(isCurrentlyOnline);

      return () => {
        window.socketService.off('new-message');
        window.socketService.off('user-online');  
        window.socketService.off('user-offline');
      };
    }
  }, [chat]);

  const handleSendMessage = async (text) => {
    if (!text.trim() || !chat || !currentUser) return;

    // Create message object with proper structure
    const newMessage = {
      text: text.trim(),
      isOwn: true,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    // Save message locally
    const savedMessage = window.chatStorage.saveMessage(chat.id, newMessage);
    
    // Update UI immediately
    const updatedMessages = window.chatStorage.getMessages(chat.id);
    setMessages([...updatedMessages]);

    // Send via socket with the saved message structure (includes text and id)
    if (window.socketService && window.socketService.connected) {
      const success = window.socketService.sendMessage(
        chat.id,
        savedMessage, // Send the full saved message object
        chat.userId
      );

      // Update message status
      const status = success ? 'sent' : 'queued';
      window.chatStorage.updateMessageStatus(chat.id, savedMessage.id, status);
      
      // Refresh messages to show updated status
      const finalMessages = window.chatStorage.getMessages(chat.id);
      setMessages([...finalMessages]);
      
      // Trigger chat list update in parent component by emitting custom event
      window.dispatchEvent(new CustomEvent('chatListUpdate'));
    } else {
      // Mark as failed if not connected
      window.chatStorage.updateMessageStatus(chat.id, savedMessage.id, 'failed');
      const finalMessages = window.chatStorage.getMessages(chat.id);
      setMessages([...finalMessages]);
    }
  };

  const handleTranslate = async (message) => {
    if (!message.text || message.isOwn) return;

    try {
      // Translate to user's preferred language
      const result = await window.translationManager.translate(
        message.text, 
        userPreferredLang
      );
      
      // Update message with translation
      const updatedMessages = messages.map(msg => 
        msg.id === message.id 
          ? { ...msg, translation: result.translatedText }
          : msg
      );
      
      setMessages(updatedMessages);
      
      // Save translation to storage
      const allMessages = window.chatStorage.getMessages(chat.id);
      const updatedAllMessages = allMessages.map(msg =>
        msg.id === message.id
          ? { ...msg, translation: result.translatedText }
          : msg
      );
      
      // Save back to storage
      const allStoredMessages = localStorage.getItem('jisero_messages');
      const messagesObj = allStoredMessages ? JSON.parse(allStoredMessages) : {};
      messagesObj[chat.id] = updatedAllMessages;
      localStorage.setItem('jisero_messages', JSON.stringify(messagesObj));
      
    } catch (error) {
      console.error('Translation failed:', error);
    }
  };

  const getMessageStatus = (message) => {
    if (!message.isOwn) return null;
    
    switch (message.status) {
      case 'sending': return '⏳';
      case 'sent': return '✓';
      case 'delivered': return '✓✓';
      case 'queued': return '⏰';
      case 'failed': return '❌';
      default: return null;
    }
  };

  if (!chat) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-500">Select a chat to start messaging</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <Header 
        title={chat.name} 
        onBack={onBack}
        onSettings={onChatSettings}
      />
      
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500 text-center">
              No messages yet.<br />
              Start the conversation!
            </p>
          </div>
        ) : (
          messages.map(message => (
            <MessageBubble
              key={message.id}
              message={message}
              isOwn={message.isOwn}
              showTranslation={false}
              onTranslate={handleTranslate}
              status={getMessageStatus(message)}
            />
          ))
        )}
        {isTyping && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="p-2 bg-white border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {chatOnlineStatus ? '🟢 Online' : '🔴 Offline'}
          </span>
          <span>
            Messages in {userPreferredLang.toUpperCase()}
          </span>
        </div>
      </div>
      
      <InputArea 
        onSendMessage={handleSendMessage} 
        disabled={!isConnected || !currentUser}
        placeholder={isConnected ? "Type a message..." : "Connecting..."}
      />
    </div>
  );
}
