const { memo, useState, useMemo } = React;

const ContactProfile = memo(({ contact, onBack, theme }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredMedia = useMemo(() => {
    if (!contact.media) return [];
    return contact.media.filter(item => 
      item.type.includes(searchTerm.toLowerCase()) || 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [contact.media, searchTerm]);

  const filteredLinks = useMemo(() => {
    if (!contact.links) return [];
    return contact.links.filter(link => 
      link.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      link.url.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [contact.links, searchTerm]);

  return (
    <div className="h-full flex flex-col bg-white dark:bg-dark-bg transition-colors duration-300">
      <div className="bg-white dark:bg-dark-secondary border-b border-gray-200 dark:border-gray-700 px-4 py-4 flex items-center transition-colors duration-300">
        <button 
          onClick={onBack}
          className="p-2 mr-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Back to chat"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-black dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-black dark:text-white">Contact Info</h1>
      </div>
      <div className="p-6 pb-4">
        <div className="flex flex-col items-center">
          <div className="relative">
            <img 
              src={contact.avatar} 
              alt={contact.name} 
              className="w-32 h-32 rounded-full object-cover mb-4"
              aria-label={`${contact.name}'s profile picture`}
            />
            <div className="online-indicator"></div>
          </div>
          <h2 className="text-2xl font-bold text-black dark:text-white mb-1">{contact.name}</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{contact.status || "Online"}</p>
        </div>
      </div>
      <div className="tabs px-4">
        <div 
          className={`tab ${activeTab === 'info' ? 'active' : ''}`}
          onClick={() => setActiveTab('info')}
          role="tab"
          aria-selected={activeTab === 'info'}
        >
          Info
        </div>
        <div 
          className={`tab ${activeTab === 'media' ? 'active' : ''}`}
          onClick={() => setActiveTab('media')}
          role="tab"
          aria-selected={activeTab === 'media'}
        >
          Media
        </div>
        <div 
          className={`tab ${activeTab === 'links' ? 'active' : ''}`}
          onClick={() => setActiveTab('links')}
          role="tab"
          aria-selected={activeTab === 'links'}
        >
          Links
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'info' && (
          <div className="space-y-4">
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">+1 (555) 123-4567</span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">Last seen today at {contact.timestamp}</span>
            </div>
            <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500 dark:text-gray-400 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">San Francisco, CA</span>
            </div>
          </div>
        )}
        {activeTab === 'media' && (
          <div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search media..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-jisero-blue dark:bg-dark-secondary dark:text-dark-text"
                aria-label="Search media"
              />
            </div>
            {filteredMedia.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No media found
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-3">
                {filteredMedia.map(item => (
                  <div key={item.id} className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700">
                    {item.type === 'image' ? (
                      <img src={item.url} alt="Shared media" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-500 dark:text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-xs text-center text-gray-600 dark:text-gray-300 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{item.size}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {activeTab === 'links' && (
          <div>
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search links..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-jisero-blue dark:bg-dark-secondary dark:text-dark-text"
                aria-label="Search links"
              />
            </div>
            {filteredLinks.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No links found
              </div>
            ) : (
              <div className="space-y-3">
                {filteredLinks.map(link => (
                  <a 
                    key={link.id} 
                    href={link.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="block p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 dark:text-white">{link.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{link.url}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{link.timestamp}</p>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          <button className="w-full p-3 bg-jisero-blue text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            Message
          </button>
          <button className="w-full p-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Voice Call
          </button>
          <button className="w-full p-3 bg-jisero-green text-white rounded-lg font-medium hover:bg-opacity-90 transition-colors flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Video Call
          </button>
        </div>
      </div>
    </div>
  );
});

window.ContactProfile = ContactProfile;
