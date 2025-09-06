const { memo } = React;

const TypingIndicator = memo(({ theme }) => {
  return (
    <div className="flex justify-start mb-4 animate-fade-in">
      <div className="bg-gray-200 dark:bg-gray-700 rounded-2xl px-4 py-2">
        <div className="typing-indicator">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
});

window.TypingIndicator = TypingIndicator;
