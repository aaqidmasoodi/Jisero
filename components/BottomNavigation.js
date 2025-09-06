const { memo } = React;

const BottomNavigation = memo(({ activeTab, onTabChange, theme }) => {
  const tabs = [
    { id: 'chats', label: 'Chats', icon: 'Chat' },
    { id: 'settings', label: 'Settings', icon: 'Settings' }
  ];

  const IconComponent = ({ name, className, filled }) => {
    const icons = {
      Chat: filled ? (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h3l3 4 3-4h5c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H9.1l-2.3 2.3L9.1 16H4V4h16v12z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      Settings: filled ? (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41H9.68c-0.24,0-0.43,0.17-0.47,0.41L9,5.25C8.4,5.49,7.87,5.82,7.38,6.19L5,5.23c-0.22-0.08-0.47,0-0.59,0.22L2.49,8.77C2.37,8.99,2.42,9.26,2.6,9.4l2.03,1.58C4.57,11.3,4.55,11.63,4.55,11.96c0,0.32,0.02,0.64,0.07,0.94l-2.03,1.58c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.16,2.44c0.04,0.24,0.24,0.41,0.48,0.41h4.24c0.24,0,0.43-0.17,0.47-0.41l0.16-2.44c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      )
    };
    return icons[name] || null;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-dark-secondary border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <div className="flex">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 py-3 px-2 flex flex-col items-center justify-center ${
              activeTab === tab.id ? 'text-black dark:text-white' : 'text-gray-500 dark:text-gray-400'
            }`}
            aria-label={tab.label}
            role="tab"
            aria-selected={activeTab === tab.id}
          >
            <IconComponent 
              name={tab.icon} 
              className="h-6 w-6 mb-1" 
              filled={activeTab === tab.id}
            />
            <span className="text-xs">{tab.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
});

window.BottomNavigation = BottomNavigation;