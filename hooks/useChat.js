const { useCallback } = React;

// Custom hook for chat operations
const useChat = () => {
  const { state, actions } = useAppContext();

  const sendMessage = useCallback((text) => {
    if (!ValidationUtils.isValidMessage(text)) {
      actions.showToast('Please enter a valid message');
      return;
    }

    const sanitizedText = ValidationUtils.sanitizeMessage(text);
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    const newMessage = {
      id: Date.now(),
      text: sanitizedText,
      sender: 'me',
      timestamp,
      status: 'sent',
      reactions: []
    };

    actions.addMessage(state.currentChatId, newMessage);

    // Simulate response
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
      actions.addMessage(state.currentChatId, responseMessage);
    }, 2000);
  }, [state.currentChatId, actions]);

  const selectChat = useCallback((chatId) => {
    actions.setCurrentChat(chatId);
    actions.updateChat(chatId, { unreadCount: 0 });
  }, [actions]);

  const togglePin = useCallback((chatId) => {
    const chat = state.chats.find(c => c.id === chatId);
    if (chat) {
      actions.updateChat(chatId, { isPinned: !chat.isPinned });
      actions.showToast(`${chat.isPinned ? 'Unpinned' : 'Pinned'} ${chat.name}`);
    }
  }, [state.chats, actions]);

  const deleteChat = useCallback((chatId) => {
    const updatedChats = state.chats.filter(chat => chat.id !== chatId);
    actions.setChats(updatedChats);
    if (state.currentChatId === chatId) {
      actions.setCurrentChat(null);
    }
    actions.showToast('Chat deleted');
  }, [state.chats, state.currentChatId, actions]);

  return {
    chats: state.chats,
    currentChatId: state.currentChatId,
    sendMessage,
    selectChat,
    togglePin,
    deleteChat
  };
};

window.useChat = useChat;
