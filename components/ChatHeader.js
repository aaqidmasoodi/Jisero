const { memo, useState, useCallback } = React;

const ChatHeader = memo(({ chat, onBack, onMoreOptions, theme, onContactPress }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  return (
    <div className="app-header chat-header bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center transition-colors duration-300">
      <button 
        onClick={onBack}
        className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Back to chats"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      {showSearch ? (
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Search messages..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-jisero-blue dark:bg-dark-secondary dark:text-dark-text"
            autoFocus
            aria-label="Search messages"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      ) : (
        <div 
          onClick={onContactPress}
          className="flex items-center cursor-pointer flex-1"
          aria-label="View contact info"
        >
          <div className="relative">
            <img 
              src={chat.avatar} 
              alt={chat.name} 
              className="w-10 h-10 rounded-full object-cover mr-3"
            />
            <div className="online-indicator"></div>
          </div>
          <div className="flex-1">
            <h2 className="font-medium text-black dark:text-white">{chat.name}</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Online</p>
          </div>
        </div>
      )}
      <div className="flex items-center ml-auto">
        {!showSearch && (
          <button 
            onClick={() => setShowSearch(true)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-2"
            aria-label="Search messages"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        )}
        {showSearch && (
          <button 
            onClick={() => {
              setShowSearch(false);
              setSearchTerm('');
            }}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mr-2"
            aria-label="Close search"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <button 
          onClick={onMoreOptions}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="More options"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
          </svg>
        </button>
      </div>
    </div>
  );
});

window.ChatHeader = ChatHeader;
