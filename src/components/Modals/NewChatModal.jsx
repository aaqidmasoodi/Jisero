const { useState } = React;

function NewChatModal({ isOpen, onClose, onCreateChat, currentUser, isConnected }) {
  const [userId, setUserId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId.trim() || !isConnected) return;

    setIsLoading(true);
    setError('');

    try {
      // Check if chat already exists
      const existingChats = window.chatStorage.getChats();
      const existingChat = existingChats.find(chat => chat.userId === userId.trim());
      
      if (existingChat) {
        onCreateChat(existingChat);
        setUserId('');
        setIsLoading(false);
        onClose();
        return;
      }

      // Find user via socket
      if (window.socketService && window.socketService.connected) {
        // Set up listeners for user discovery
        const handleUserFound = (userData) => {
          console.log('User found:', userData);
          
          // Create new chat
          const newChat = window.chatStorage.createChat(userData.userId, userData.username || `User ${userData.userId.substring(0, 8)}`);
          
          onCreateChat(newChat);
          setUserId('');
          setIsLoading(false);
          onClose();
          
          // Clean up listeners
          window.socketService.off('user-found');
          window.socketService.off('user-not-found');
        };

        const handleUserNotFound = (searchedUserId) => {
          if (searchedUserId === userId.trim()) {
            setError('User not found. Please check the User ID.');
            setIsLoading(false);
          }
          
          // Clean up listeners
          window.socketService.off('user-found');
          window.socketService.off('user-not-found');
        };

        // Set up temporary listeners
        window.socketService.on('user-found', handleUserFound);
        window.socketService.on('user-not-found', handleUserNotFound);

        // Search for user
        window.socketService.findUser(userId.trim());

        // Timeout after 5 seconds
        setTimeout(() => {
          if (isLoading) {
            setError('Search timeout. User may be offline.');
            setIsLoading(false);
            window.socketService.off('user-found');
            window.socketService.off('user-not-found');
          }
        }, 5000);
      } else {
        setError('Not connected to server');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      setError('Failed to create chat');
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setUserId('');
    setError('');
    setIsLoading(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 m-4 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">Start New Chat</h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 rounded-full"
            disabled={isLoading}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              User ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="Enter user ID to start chat"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            {error && (
              <p className="text-red-500 text-xs mt-1">{error}</p>
            )}
            {!isConnected && (
              <p className="text-orange-500 text-xs mt-1">Connecting to server...</p>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!userId.trim() || isLoading || !isConnected}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Searching...' : 'Start Chat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
