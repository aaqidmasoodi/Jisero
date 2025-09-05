function Chats({ chats, onChatSelect, onNewChat, onDeleteChat }) {
  const handleDeleteChat = (e, chat) => {
    e.stopPropagation();
    if (confirm(`Delete chat with ${chat.name}? This cannot be undone.`)) {
      onDeleteChat(chat);
    }
  };

  return (
    <div className="h-full flex flex-col">
      <Header 
        title="Chats" 
        showNewChat={true}
        onNewChat={onNewChat}
      />
      <div className="flex-1 overflow-y-auto">
        {chats.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <p className="text-gray-500 mb-4">No chats yet</p>
              <button
                onClick={onNewChat}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                Start your first chat
              </button>
            </div>
          </div>
        ) : (
          chats.map(chat => (
            <div
              key={chat.id}
              onClick={() => onChatSelect(chat)}
              className="flex items-center p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
            >
              <div className="relative mr-3">
                <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {chat.avatar}
                </div>
                {/* Real-time online status indicator */}
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${
                  chat.isOnline ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-900">{chat.name}</h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-500">{chat.timestamp}</span>
                    <button
                      onClick={(e) => handleDeleteChat(e, chat)}
                      className="text-red-500 hover:text-red-700 p-1"
                      title="Delete chat"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600 truncate flex-1">{chat.lastMessage || 'No messages yet'}</p>
                  {chat.unread > 0 && (
                    <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center ml-2">
                      <span className="text-xs text-white">{chat.unread}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
