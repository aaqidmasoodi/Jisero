const { memo, useState, useEffect, useCallback } = React;

const SettingsSection = memo(({ section, onBack, user, onUpdateUser, theme, setTheme }) => {
  const [formData, setFormData] = useState({ ...user });
  const [isEditing, setIsEditing] = useState(false);
  const [toast, setToast] = useState({ message: '', isVisible: false });

  const showToast = useCallback((msg) => {
    setToast({ message: msg, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  useEffect(() => {
    setFormData({ ...user });
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handlePrivacyChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    onUpdateUser(formData);
    setIsEditing(false);
    showToast('Settings updated successfully!');
    // Apply theme changes
    if (formData.theme !== theme) {
      setTheme(formData.theme);
      document.body.className = formData.theme === 'dark' 
        ? 'bg-dark-bg text-dark-text transition-colors duration-300 dark' 
        : 'bg-white text-black transition-colors duration-300';
    }
  };

  const handleThemeChange = (newTheme) => {
    setFormData(prev => ({ ...prev, theme: newTheme }));
    // Apply immediately for preview
    if (newTheme !== theme) {
      setTheme(newTheme);
      document.body.className = newTheme === 'dark' 
        ? 'bg-dark-bg text-dark-text transition-colors duration-300 dark' 
        : 'bg-white text-black transition-colors duration-300';
    }
  };

  const triggerHapticFeedback = () => {
    if (window.navigator.vibrate) {
      window.navigator.vibrate(15);
    }
  };

  const renderSectionContent = () => {
    switch(section.id) {
      case 'profile':
        return (
          <div className="space-y-6 p-4">
            <div className="flex items-center">
              <img 
                src={formData.avatar} 
                alt={formData.name} 
                className="w-20 h-20 rounded-full object-cover"
                aria-label="Profile picture"
              />
              <div className="ml-4">
                <button 
                  onClick={() => {
                    triggerHapticFeedback();
                    setIsEditing(true);
                  }}
                  className="text-sm text-black dark:text-white hover:underline"
                  aria-label="Change photo"
                >
                  Change photo
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-dark-secondary dark:text-dark-text disabled:bg-gray-50 dark:disabled:bg-gray-800"
                aria-label="Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-dark-secondary dark:text-dark-text disabled:bg-gray-50 dark:disabled:bg-gray-800"
                aria-label="Username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-dark-secondary dark:text-dark-text disabled:bg-gray-50 dark:disabled:bg-gray-800"
                aria-label="Email"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Status
              </label>
              <input
                type="text"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-dark-secondary dark:text-dark-text disabled:bg-gray-50 dark:disabled:bg-gray-800"
                aria-label="Status"
              />
            </div>
            {isEditing && (
              <div className="flex space-x-3">
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-black dark:bg-white text-white dark:text-black rounded-md hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
                  aria-label="Save changes"
                >
                  Save Changes
                </button>
                <button
                  onClick={() => {
                    setFormData({ ...user });
                    setIsEditing(false);
                  }}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  aria-label="Cancel"
                >
                  Cancel
                </button>
              </div>
            )}
            {!isEditing && (
              <button
                onClick={() => {
                  triggerHapticFeedback();
                  setIsEditing(true);
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                aria-label="Edit profile"
              >
                Edit Profile
              </button>
            )}
          </div>
        );
      case 'notifications':
        return (
          <div className="space-y-6 p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-black dark:text-white">Message Notifications</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Get notified when you receive new messages</p>
              </div>
              <input
                type="checkbox"
                name="notifications"
                checked={formData.notifications}
                onChange={handleInputChange}
                className="h-6 w-6 text-black dark:text-white focus:ring-black dark:focus:ring-white border-gray-300 dark:border-gray-600 rounded"
                aria-label="Toggle message notifications"
              />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-medium text-black dark:text-white mb-3">Notification Sound</h3>
              <select 
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-dark-secondary dark:text-dark-text"
                aria-label="Notification sound"
              >
                <option>Default</option>
                <option>Classic</option>
                <option>Silent</option>
                <option>Custom</option>
              </select>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-medium text-black dark:text-white mb-3">Vibrate</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="vibrate" className="h-4 w-4 text-black dark:text-white focus:ring-black dark:focus:ring-white border-gray-300 dark:border-gray-600" defaultChecked />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Default</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="vibrate" className="h-4 w-4 text-black dark:text-white focus:ring-black dark:focus:ring-white border-gray-300 dark:border-gray-600" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">None</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="vibrate" className="h-4 w-4 text-black dark:text-white focus:ring-black dark:focus:ring-white border-gray-300 dark:border-gray-600" />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Custom</span>
                </label>
              </div>
            </div>
          </div>
        );
      case 'privacy':
        return (
          <div className="space-y-6 p-4">
            <div>
              <h3 className="font-medium text-black dark:text-white mb-3">Who can see my last seen</h3>
              <select 
                value={formData.privacy.lastSeen}
                onChange={(e) => handlePrivacyChange('lastSeen', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-dark-secondary dark:text-dark-text"
                aria-label="Last seen visibility"
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">My Contacts</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>
            <div>
              <h3 className="font-medium text-black dark:text-white mb-3">Who can see my profile photo</h3>
              <select 
                value={formData.privacy.profilePhoto}
                onChange={(e) => handlePrivacyChange('profilePhoto', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-dark-secondary dark:text-dark-text"
                aria-label="Profile photo visibility"
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">My Contacts</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>
            <div>
              <h3 className="font-medium text-black dark:text-white mb-3">Who can see my about info</h3>
              <select 
                value={formData.privacy.about}
                onChange={(e) => handlePrivacyChange('about', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-dark-secondary dark:text-dark-text"
                aria-label="About info visibility"
              >
                <option value="everyone">Everyone</option>
                <option value="contacts">My Contacts</option>
                <option value="nobody">Nobody</option>
              </select>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-black dark:text-white">Read receipts</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Send read receipts when you read messages</p>
              </div>
              <input
                type="checkbox"
                checked={formData.privacy.readReceipts}
                onChange={(e) => handlePrivacyChange('readReceipts', e.target.checked)}
                className="h-6 w-6 text-black dark:text-white focus:ring-black dark:focus:ring-white border-gray-300 dark:border-gray-600 rounded"
                aria-label="Toggle read receipts"
              />
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-medium text-black dark:text-white mb-2">Blocked contacts</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">You have no blocked contacts</p>
              <button 
                className="text-sm text-black dark:text-white hover:underline"
                aria-label="Block new contact"
              >
                Block new contact
              </button>
            </div>
          </div>
        );
      case 'appearance':
        return (
          <div className="space-y-6 p-4">
            <div>
              <h3 className="font-medium text-black dark:text-white mb-3">Theme</h3>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="light"
                    checked={formData.theme === 'light'}
                    onChange={() => handleThemeChange('light')}
                    className="h-4 w-4 text-black dark:text-white focus:ring-black dark:focus:ring-white border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Light</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="dark"
                    checked={formData.theme === 'dark'}
                    onChange={() => handleThemeChange('dark')}
                    className="h-4 w-4 text-black dark:text-white focus:ring-black dark:focus:ring-white border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">Dark</span>
                </label>
                <label className="flex items-center">
                  <input 
                    type="radio" 
                    name="theme" 
                    value="system"
                    checked={formData.theme === 'system'}
                    onChange={() => handleThemeChange('system')}
                    className="h-4 w-4 text-black dark:text-white focus:ring-black dark:focus:ring-white border-gray-300 dark:border-gray-600"
                  />
                  <span className="ml-2 text-gray-700 dark:text-gray-300">System default</span>
                </label>
              </div>
            </div>
            <div>
              <h3 className="font-medium text-black dark:text-white mb-3">Chat wallpaper</h3>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div 
                    key={i} 
                    className="aspect-square bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-black dark:hover:ring-white transition-colors"
                    onClick={() => showToast(`Wallpaper ${i} selected`)}
                    aria-label={`Select wallpaper ${i}`}
                  >
                    <span className="text-xs text-gray-500 dark:text-gray-400">Wallpaper {i}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="font-medium text-black dark:text-white mb-3">Font size</h3>
              <input 
                type="range" 
                min="1" 
                max="5" 
                defaultValue="3"
                className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                aria-label="Font size"
              />
              <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                <span>Small</span>
                <span>Medium</span>
                <span>Large</span>
              </div>
            </div>
          </div>
        );
      case 'account':
        return (
          <div className="space-y-6 p-4">
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-medium text-black dark:text-white mb-3">Account Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Phone number</span>
                  <span className="text-black dark:text-white">+1 (555) 123-4567</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Account created</span>
                  <span className="text-black dark:text-white">January 15, 2023</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Storage used</span>
                  <span className="text-black dark:text-white">2.3 GB of 15 GB</span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-medium text-black dark:text-white mb-3">Data Usage</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total</span>
                  <span className="text-black dark:text-white">{user.dataUsage.total}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Messages</span>
                  <span className="text-black dark:text-white">{user.dataUsage.messages}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Media</span>
                  <span className="text-black dark:text-white">{user.dataUsage.media}</span>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-medium text-black dark:text-white mb-3">Backup & Restore</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">Last backup</span>
                  <span className="text-black dark:text-white text-sm">{user.dataUsage.lastBackup}</span>
                </div>
                <button 
                  onClick={() => showToast("Backup started...")}
                  className="w-full p-2 bg-jisero-blue text-white rounded-md hover:bg-opacity-90 transition-colors text-sm"
                  aria-label="Backup chats"
                >
                  Backup Chats
                </button>
                <button 
                  onClick={() => showToast("Restore in progress...")}
                  className="w-full p-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors text-sm"
                  aria-label="Restore chats"
                >
                  Restore Chats
                </button>
              </div>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-medium text-black dark:text-white mb-3">Security</h3>
              <button className="w-full text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-black dark:text-white">
                Change password
              </button>
              <button className="w-full text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mt-2 text-black dark:text-white">
                Two-factor authentication
              </button>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <h3 className="font-medium text-black dark:text-white mb-3">Help & Support</h3>
              <button className="w-full text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-black dark:text-white">
                Help center
              </button>
              <button className="w-full text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mt-2 text-black dark:text-white">
                Contact us
              </button>
              <button className="w-full text-left px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors mt-2 text-black dark:text-white">
                Report a problem
              </button>
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <button
                onClick={onBack}
                className="w-full px-4 py-3 bg-jisero-red text-white rounded-md hover:bg-opacity-90 transition-colors font-medium"
                aria-label="Log out"
              >
                Log Out
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-dark-bg transition-colors duration-300 ${section.className || ''}`}>
      <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center transition-colors duration-300">
        <button 
          onClick={onBack}
          className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Back to settings"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-black dark:text-white">{section.label}</h1>
      </div>
      {renderSectionContent()}
      <div className="toast-container">
        <Toast 
          message={toast.message} 
          isVisible={toast.isVisible} 
          onClose={() => setToast(prev => ({ ...prev, isVisible: false }))}
        />
      </div>
    </div>
  );
});

window.SettingsSection = SettingsSection;
