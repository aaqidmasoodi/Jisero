const { memo, useState, useMemo, useCallback } = React;

const SettingsPage = memo(({ user, onLogout, onUpdateUser, theme, setTheme, onNavigateToSection }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [showToast, setShowToast] = useState({ message: '', isVisible: false });

  const showToastMessage = useCallback((msg) => {
    setShowToast({ message: msg, isVisible: true });
    setTimeout(() => {
      setShowToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  const sections = [
    { id: 'profile', label: 'Profile', icon: 'User', description: 'Manage your profile information' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell', description: 'Customize notification settings' },
    { id: 'privacy', label: 'Privacy', icon: 'Shield', description: 'Control your privacy settings' },
    { id: 'appearance', label: 'Appearance', icon: 'Sun', description: 'Customize app appearance' },
    { id: 'account', label: 'Account', icon: 'Settings', description: 'Account settings and preferences' }
  ];

  const filteredSections = useMemo(() => {
    return sections.filter(section => 
      section.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      section.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [sections, searchTerm]);

  const IconComponent = ({ name, className }) => {
    const icons = {
      User: (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      Bell: (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5m-9-9h.01M12 12h.01M19 12h.01M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      Shield: (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
      Sun: (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      Settings: (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    };
    return icons[name] || null;
  };

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-bg transition-colors duration-300">
      {/* Header */}
      <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center transition-colors duration-300">
        <h1 className="text-lg font-bold text-black dark:text-white">Settings</h1>
      </div>
      {/* Search Bar */}
      <div className="px-4 py-3 bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="relative">
          <input
            type="text"
            placeholder="Search settings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-dark-secondary dark:text-dark-text"
            aria-label="Search settings"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500 absolute left-3 top-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>
      {/* Settings List */}
      <div className="flex-1 overflow-y-auto">
        {filteredSections.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-gray-500 dark:text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M12 12h.01M15 10h.01M12 7v5" />
            </svg>
            <p>No settings found</p>
          </div>
        ) : (
          filteredSections.map(section => (
            <div 
              key={section.id}
              onClick={() => onNavigateToSection(section)}
              className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
              role="button"
              tabIndex={0}
              aria-label={`Navigate to ${section.label} settings`}
            >
              <div className="flex items-center">
                <div className="p-2 rounded-full bg-gray-100 dark:bg-gray-800 mr-3">
                  <IconComponent name={section.icon} className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{section.label}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{section.description}</p>
                </div>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          ))
        )}
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

window.SettingsPage = SettingsPage;
