const { memo, useState, useRef, useCallback } = React;

const MessageInput = memo(({ onSendMessage, inputValue, setInputValue, theme, onAttachment, onVoiceRecord }) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordTime, setRecordTime] = useState(0);
  const [showToast, setShowToast] = useState({ message: '', isVisible: false });
  const emojiPickerRef = useRef(null);
  const attachmentsRef = useRef(null);
  const recordInterval = useRef(null);
  const textareaRef = useRef(null);
  const { keyboardHeight, isKeyboardVisible } = useKeyboardHeight();

  const showToastMessage = useCallback((msg) => {
    setShowToast({ message: msg, isVisible: true });
    setTimeout(() => {
      setShowToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const sanitizedInput = ValidationUtils.sanitizeMessage(inputValue);
      if (ValidationUtils.isValidMessage(sanitizedInput)) {
        onSendMessage(sanitizedInput);
        setInputValue('');
      } else {
        showToastMessage("Please enter a valid message (1-1000 characters)");
      }
    }
  };

  const addEmoji = (emoji) => {
    setInputValue(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const startRecording = () => {
    setIsRecording(true);
    setRecordTime(0);
    // Simulate recording
    recordInterval.current = setInterval(() => {
      setRecordTime(prev => {
        if (prev >= 60) {
          stopRecording();
          return 60;
        }
        return prev + 1;
      });
    }, 1000);
    showToastMessage("Recording voice message...");
  };

  const stopRecording = () => {
    if (recordInterval.current) {
      clearInterval(recordInterval.current);
      recordInterval.current = null;
    }
    if (recordTime > 0) {
      // Add voice message to chat
      onSendMessage(`[Voice Message: ${recordTime}s]`);
      showToastMessage("Voice message sent!");
    }
    setIsRecording(false);
    setRecordTime(0);
  };

  // Close emoji picker and attachments when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
      if (attachmentsRef.current && !attachmentsRef.current.contains(event.target)) {
        setShowAttachments(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      if (recordInterval.current) {
        clearInterval(recordInterval.current);
      }
    };
  }, []);

  return (
    <div 
      className="bg-white dark:bg-dark-secondary border-t border-gray-200 dark:border-gray-700 p-3 transition-colors duration-300"
      style={{
        // Only add slight adjustment to prevent overlap, let browser handle positioning
        marginBottom: isKeyboardVisible ? '8px' : '0px',
        transition: 'margin-bottom 0.3s ease-out'
      }}
    >
      <div className="flex items-center">
        <button 
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
          onClick={() => setShowAttachments(!showAttachments)}
          aria-label="Attachments"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
          </svg>
        </button>
        {showAttachments && (
          <div 
            ref={attachmentsRef}
            className="attachments-menu absolute bottom-16 left-14 z-10"
          >
            <button
              className="attachment-btn"
              onClick={() => {
                setShowAttachments(false);
                onAttachment('camera');
                showToastMessage("Camera opened");
              }}
              aria-label="Camera"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="attachment-label">Camera</span>
            </button>
            <button
              className="attachment-btn"
              onClick={() => {
                setShowAttachments(false);
                onAttachment('gallery');
                showToastMessage("Gallery opened");
              }}
              aria-label="Gallery"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="attachment-label">Gallery</span>
            </button>
            <button
              className="attachment-btn"
              onClick={() => {
                setShowAttachments(false);
                onAttachment('document');
                showToastMessage("File picker opened");
              }}
              aria-label="Document"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span className="attachment-label">Document</span>
            </button>
            <button
              className="attachment-btn"
              onClick={() => {
                setShowAttachments(false);
                onAttachment('location');
                showToastMessage("Location sharing enabled");
              }}
              aria-label="Location"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="attachment-label">Location</span>
            </button>
            <button
              className="attachment-btn"
              onClick={() => {
                setShowAttachments(false);
                onAttachment('contact');
                showToastMessage("Contact sharing enabled");
              }}
              aria-label="Contact"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-700 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
              <span className="attachment-label">Contact</span>
            </button>
          </div>
        )}
        <button 
          className="p-2 text-gray-500 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors mx-1"
          onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          aria-label="Emoji picker"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M12 12h.01M15 10h.01M12 7v5" />
          </svg>
        </button>
        {showEmojiPicker && (
          <div 
            ref={emojiPickerRef}
            className="emoji-picker absolute bottom-16 right-14 z-10"
          >
            {commonEmojis.map((emoji, index) => (
              <button
                key={index}
                className="emoji-btn"
                onClick={() => addEmoji(emoji)}
                aria-label={`Add ${emoji} emoji`}
              >
                {emoji}
              </button>
            ))}
          </div>
        )}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type a message"
          className="flex-1 mx-2 p-3 border border-gray-300 dark:border-gray-600 rounded-full resize-none focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-dark-secondary dark:text-dark-text max-h-32"
          rows="1"
          aria-label="Message input"
        />
        <button 
          className="p-2 mr-2 text-gray-500 dark:text-gray-400 hover:text-jisero-red dark:hover:text-jisero-red transition-colors"
          onClick={isRecording ? stopRecording : startRecording}
          aria-label={isRecording ? "Stop recording" : "Start recording"}
        >
          {isRecording ? (
            <div className="w-6 h-6 bg-jisero-red rounded-full flex items-center justify-center">
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 016 0v6a3 3 0 01-3 3z" />
            </svg>
          )}
        </button>
        <button 
          className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-full hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            
            const sanitizedInput = ValidationUtils.sanitizeMessage(inputValue);
            if (ValidationUtils.isValidMessage(sanitizedInput)) {
              onSendMessage(sanitizedInput);
              setInputValue('');
              
              // Keep focus on textarea to prevent keyboard from closing
              if (textareaRef.current) {
                setTimeout(() => {
                  textareaRef.current.focus();
                }, 0);
              }
            } else {
              showToastMessage("Please enter a valid message (1-1000 characters)");
            }
          }}
          aria-label="Send message"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </div>
      {isRecording && (
        <div className="flex items-center justify-center mt-2 p-2 bg-jisero-red bg-opacity-10 rounded-lg">
          <div className="w-3 h-3 bg-jisero-red rounded-full mr-2 animate-pulse"></div>
          <span className="text-jisero-red text-sm font-medium">Recording: {recordTime}s</span>
          <button 
            onClick={stopRecording}
            className="ml-3 text-jisero-red hover:text-opacity-80"
            aria-label="Cancel recording"
          >
            Cancel
          </button>
        </div>
      )}
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

window.MessageInput = MessageInput;
