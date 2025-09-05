const { useState } = React;

function ChatSettings({ onBack }) {
  const [targetLanguage, setTargetLanguage] = useState('en');

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Spanish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'it', name: 'Italian' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ja', name: 'Japanese' },
    { code: 'ko', name: 'Korean' },
    { code: 'zh', name: 'Chinese' }
  ];

  return (
    <div className="h-full flex flex-col">
      <Header title="Chat Settings" onBack={onBack} />
      <div className="flex-1 p-4">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-3">Translation Settings</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Default Translation Language
              </label>
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {languages.map(lang => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-3">Chat Options</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Auto-translate incoming messages</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm">Show original text</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
