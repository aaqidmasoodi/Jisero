const { createContext, useContext, useReducer, useCallback } = React;

// Action types
const ActionTypes = {
  SET_USER: 'SET_USER',
  SET_THEME: 'SET_THEME',
  SET_CHATS: 'SET_CHATS',
  UPDATE_CHAT: 'UPDATE_CHAT',
  ADD_MESSAGE: 'ADD_MESSAGE',
  SET_CURRENT_CHAT: 'SET_CURRENT_CHAT',
  SHOW_TOAST: 'SHOW_TOAST',
  HIDE_TOAST: 'HIDE_TOAST'
};

// Initial state
const initialState = {
  user: fakeUser,
  theme: 'light',
  chats: fakeChats,
  currentChatId: null,
  toast: { message: '', isVisible: false }
};

// Reducer
const appReducer = (state, action) => {
  switch (action.type) {
    case ActionTypes.SET_USER:
      return { ...state, user: action.payload };
    case ActionTypes.SET_THEME:
      return { ...state, theme: action.payload };
    case ActionTypes.SET_CHATS:
      return { ...state, chats: action.payload };
    case ActionTypes.UPDATE_CHAT:
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.id ? { ...chat, ...action.payload.updates } : chat
        )
      };
    case ActionTypes.ADD_MESSAGE:
      return {
        ...state,
        chats: state.chats.map(chat =>
          chat.id === action.payload.chatId
            ? {
                ...chat,
                messages: [...chat.messages, action.payload.message],
                lastMessage: action.payload.message.text,
                timestamp: action.payload.message.timestamp
              }
            : chat
        )
      };
    case ActionTypes.SET_CURRENT_CHAT:
      return { ...state, currentChatId: action.payload };
    case ActionTypes.SHOW_TOAST:
      return { ...state, toast: { message: action.payload, isVisible: true } };
    case ActionTypes.HIDE_TOAST:
      return { ...state, toast: { ...state.toast, isVisible: false } };
    default:
      return state;
  }
};

// Context
const AppContext = createContext();

// Provider component
const AppProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const actions = {
    setUser: useCallback((user) => dispatch({ type: ActionTypes.SET_USER, payload: user }), []),
    setTheme: useCallback((theme) => dispatch({ type: ActionTypes.SET_THEME, payload: theme }), []),
    setChats: useCallback((chats) => dispatch({ type: ActionTypes.SET_CHATS, payload: chats }), []),
    updateChat: useCallback((id, updates) => dispatch({ type: ActionTypes.UPDATE_CHAT, payload: { id, updates } }), []),
    addMessage: useCallback((chatId, message) => dispatch({ type: ActionTypes.ADD_MESSAGE, payload: { chatId, message } }), []),
    setCurrentChat: useCallback((chatId) => dispatch({ type: ActionTypes.SET_CURRENT_CHAT, payload: chatId }), []),
    showToast: useCallback((message) => {
      dispatch({ type: ActionTypes.SHOW_TOAST, payload: message });
      setTimeout(() => dispatch({ type: ActionTypes.HIDE_TOAST }), 3000);
    }, [])
  };

  return (
    <AppContext.Provider value={{ state, actions }}>
      {children}
    </AppContext.Provider>
  );
};

// Custom hook
const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within AppProvider');
  }
  return context;
};

window.AppContext = AppContext;
window.AppProvider = AppProvider;
window.useAppContext = useAppContext;
