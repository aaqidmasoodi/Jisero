const { memo, useState, useCallback } = React;

const Login = memo(({ onLogin }) => {
  const [email, setEmail] = useState("john@example.com");
  const [password, setPassword] = useState("password123");
  const [isLoading, setIsLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [toast, setToast] = useState({ message: '', isVisible: false });

  const showToast = useCallback((msg) => {
    setToast({ message: msg, isVisible: true });
    setTimeout(() => {
      setToast(prev => ({ ...prev, isVisible: false }));
    }, 3000);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      showToast("Please enter both email and password");
      return;
    }
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      onLogin({
        id: 1,
        username: "john_doe",
        email: "john@example.com",
        name: "John Doe",
        avatar: "https://picsum.photos/200/300?random=1",
        status: "Online",
        theme: "light",
        notifications: true,
        privacy: {
          lastSeen: "everyone",
          profilePhoto: "everyone",
          about: "everyone",
          readReceipts: true
        },
        dataUsage: {
          total: "2.3 GB",
          messages: "1.1 GB",
          media: "1.2 GB",
          lastBackup: "2023-11-15"
        }
      });
    }, 1500);
  };

  const handleSignUp = () => {
    showToast("Sign up flow would start here. In a real app, this would navigate to a sign-up form.");
    console.log("Sign up button clicked");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-dark-bg p-4 transition-colors duration-300">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2 text-black dark:text-dark-text">Jisero</h1>
          <p className="text-gray-600 dark:text-gray-300">Connect with friends and family</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email or Username
            </label>
            <input
              id="email"
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-dark-secondary dark:text-dark-text"
              placeholder="Enter your email or username"
              aria-label="Email or Username"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white dark:bg-dark-secondary dark:text-dark-text"
              placeholder="Enter your password"
              aria-label="Password"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-3 px-4 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-200"
            aria-label="Sign In"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white dark:text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </span>
            ) : (
              "Sign In"
            )}
          </button>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Don't have an account?{" "}
            <button 
              onClick={handleSignUp}
              className="text-black dark:text-white font-medium hover:underline"
              aria-label="Sign up"
            >
              Sign up
            </button>
          </p>
        </div>
      </div>
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

window.Login = Login;
