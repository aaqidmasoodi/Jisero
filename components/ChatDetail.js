const { memo, useState, useRef, useCallback, useMemo } = React;

const ChatDetail = memo(({ chat, onBack, onSendMessage, chats, setChats, currentChatId, theme }) => {
  const [message, setMessage] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const [selectedMessages, setSelectedMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showToast, setShowToast] = useState({ message: '', isVisible: false });
  const messagesEndRef = useRef(null);
  const searchInputRef = useRef(null);
  const { keyboardHeight, isKeyboardVisible } = useKeyboardHeight();

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

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  React.useEffect(() => {
    scrollToBottom();
  }, [chat.messages, scrollToBottom]);

  const handleSendMessageLocal = useCallback((text) => {
    if (!text.trim()) return;
    // Show typing indicator for 2 seconds
    setShowTyping(true);
    setTimeout(() => {
      setShowTyping(false);
    }, 2000);
    // Call the parent's send message handler
    onSendMessage(text);
  }, [onSendMessage]);

  const toggleMessageSelection = useCallback((messageId) => {
    setSelectedMessages(prev => 
      prev.includes(messageId) 
        ? prev.filter(id => id !== messageId)
        : [...prev, messageId]
    );
  }, []);

  const deleteSelectedMessages = useCallback(() => {
    if (selectedMessages.length === 0) return;
    if (window.confirm(`Are you sure you want to delete ${selectedMessages.length} message(s)?`)) {
      setChats(prevChats => 
        prevChats.map(c => {
          if (c.id === currentChatId) {
            return {
              ...c,
              messages: c.messages.filter(msg => !selectedMessages.includes(msg.id))
            };
          }
          return c;
        })
      );
      setSelectedMessages([]);
      showToastMessage(`${selectedMessages.length} message(s) deleted`);
      triggerHapticFeedback();
    }
  }, [selectedMessages, currentChatId, setChats, showToastMessage, triggerHapticFeedback]);

  const handleContactPress = useCallback(() => {
    showToastMessage(`Viewing profile for ${chat.name}`);
    triggerHapticFeedback();
    // In a real app, this would navigate to contact profile
  }, [chat.name, showToastMessage, triggerHapticFeedback]);

  const handleReact = useCallback((messageId, emoji) => {
    setChats(prevChats => 
      prevChats.map(c => {
        if (c.id === currentChatId) {
          return {
            ...c,
            messages: c.messages.map(msg => {
              if (msg.id === messageId) {
                const existingReaction = msg.reactions.find(r => r.emoji === emoji);
                if (existingReaction) {
                  return {
                    ...msg,
                    reactions: msg.reactions.map(r => 
                      r.emoji === emoji ? { ...r, count: r.count + 1 } : r
                    )
                  };
                } else {
                  return {
                    ...msg,
                    reactions: [...msg.reactions, { emoji, count: 1 }]
                  };
                }
              }
              return msg;
            })
          };
        }
        return c;
      })
    );
    showToastMessage(`Reacted with ${emoji}`);
    triggerHapticFeedback();
  }, [currentChatId, setChats, showToastMessage, triggerHapticFeedback]);

  const handleAttachment = useCallback((type) => {
    showToastMessage(`${type.charAt(0).toUpperCase() + type.slice(1)} attachment added`);
    triggerHapticFeedback();
    // In a real app, this would open the appropriate picker
  }, [showToastMessage, triggerHapticFeedback]);

  const handleVoiceRecord = useCallback(() => {
    // Voice recording is handled in MessageInput
  }, []);

  const filteredMessages = useMemo(() => {
    if (!showSearch || !searchTerm.trim()) return chat.messages;
    return chat.messages.filter(msg => 
      msg.text.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [chat.messages, showSearch, searchTerm]);

  const displayedMessages = showSearch ? filteredMessages : chat.messages;

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <ChatHeader 
        chat={chat} 
        onBack={onBack}
        onMoreOptions={selectedMessages.length > 0 ? deleteSelectedMessages : () => showToastMessage('More options')}
        theme={theme}
        onContactPress={handleContactPress}
      />
      <div className="app-content">
        <div className="chat-messages-container bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          {displayedMessages.map((message) => (
            <Message 
              key={message.id} 
              message={message} 
              isSelected={selectedMessages.includes(message.id)}
              onSelect={() => toggleMessageSelection(message.id)}
              onLongPress={() => toggleMessageSelection(message.id)}
              onReact={(emoji) => handleReact(message.id, emoji)}
              theme={theme}
            />
          ))}
          {showTyping && <TypingIndicator theme={theme} />}
          <div ref={messagesEndRef} />
        </div>
      </div>
      {selectedMessages.length > 0 && (
        <div className="bg-black dark:bg-white text-white dark:text-black p-2 text-center text-sm font-medium">
          {selectedMessages.length} selected • 
          <button 
            onClick={deleteSelectedMessages}
            className="ml-2 underline"
            aria-label="Delete selected messages"
          >
            Delete
          </button>
        </div>
      )}
      <div className="chat-input-container">
        <MessageInput 
          onSendMessage={handleSendMessageLocal}
          inputValue={message}
          setInputValue={setMessage}
          theme={theme}
          onAttachment={handleAttachment}
          onVoiceRecord={handleVoiceRecord}
        />
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

window.ChatDetail = ChatDetail;
