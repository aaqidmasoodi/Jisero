const { useState, useEffect } = React;

function MainSettings({ isConnected, currentUser, onUserUpdate }) {
  const [userProfile, setUserProfile] = useState({
    username: 'User',
    userId: 'USER-001',
    avatar: 'U'
  });
  const [preferredLanguage, setPreferredLanguage] = useState('en');
  const [chatTranslationEnabled, setChatTranslationEnabled] = useState(false);

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' },
    { code: 'ar', name: 'Arabic' },
    { code: 'hi', name: 'Hindi' },
    { code: 'ru', name: 'Russian' }
  ];

  useEffect(() => {
    if (currentUser) {
      setUserProfile(currentUser);
    }
    
    // Load preferred language
    const savedLang = localStorage.getItem('user_preferred_language') || 'en';
    setPreferredLanguage(savedLang);
    
    // Load chat translation setting (default: false)
    const savedTranslation = localStorage.getItem('chat_translation_enabled') === 'true';
    setChatTranslationEnabled(savedTranslation);
  }, [currentUser]);

  const updateUsername = (username) => {
    const avatar = username.substring(0, 2).toUpperCase() || 'U';
    const updatedUser = { ...userProfile, username, avatar };
    setUserProfile(updatedUser);
    onUserUpdate(updatedUser);
  };

  const updatePreferredLanguage = (langCode) => {
    setPreferredLanguage(langCode);
    localStorage.setItem('user_preferred_language', langCode);
  };

  const toggleChatTranslation = (enabled) => {
    setChatTranslationEnabled(enabled);
    localStorage.setItem('chat_translation_enabled', enabled.toString());
  };

  const copyUserId = () => {
    navigator.clipboard.writeText(userProfile.userId).then(() => {
      // Could show a toast notification here
      console.log('User ID copied to clipboard');
    });
  };

  return (
    <div className="h-full flex flex-col">
      <Header title="Settings" />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {/* User Profile Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">User Profile</h3>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {userProfile.avatar}
                  </div>
                  {/* Connection status dot */}
                  <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                    isConnected ? 'bg-green-500' : 'bg-red-500'
                  }`}></div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={userProfile.username}
                    onChange={(e) => updateUsername(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Your User ID
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={userProfile.userId}
                    readOnly
                    className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-600 font-mono text-sm cursor-not-allowed"
                  />
                  <button
                    onClick={copyUserId}
                    className="px-3 py-2 text-sm bg-gray-500 text-white rounded-md hover:bg-gray-600"
                  >
                    Copy
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Share this ID with others so they can start a chat with you
                </p>
              </div>
            </div>
          </div>

          {/* Language Preference */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Language Preference</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                All incoming messages will be translated to:
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => updatePreferredLanguage(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-2">
                Messages you receive will automatically appear in {languages.find(l => l.code === preferredLanguage)?.name || 'English'}
              </p>
            </div>
          </div>

          {/* App Settings */}
          <div>
            <h3 className="text-lg font-semibold mb-4">App Settings</h3>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span className="text-sm">Enable chat translation</span>
                <input 
                  type="checkbox" 
                  checked={chatTranslationEnabled}
                  onChange={(e) => toggleChatTranslation(e.target.checked)}
                  className="ml-2" 
                />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Enable notifications</span>
                <input type="checkbox" defaultChecked className="ml-2" />
              </label>
              <label className="flex items-center justify-between">
                <span className="text-sm">Save chat history</span>
                <input type="checkbox" defaultChecked className="ml-2" />
              </label>
              
              <div className="border-t pt-3 mt-4">
                <button
                  onClick={() => {
                    if (confirm('Clear all chats and data? This cannot be undone.')) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 text-sm"
                >
                  Clear All Data
                </button>
                <p className="text-xs text-gray-500 mt-1 text-center">
                  This will delete all chats, messages, and settings
                </p>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div>
            <h3 className="text-lg font-semibold mb-4">About</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p><strong>Jisero</strong> - Real-time translation chat app</p>
              <p>Version 1.0.0</p>
              <p>Powered by DeepL & Groq AI</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
