// Main App component will be loaded from components/App.js
// Render the App to the DOM with ErrorBoundary and AppProvider
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <AppProvider>
      <App />
    </AppProvider>
  </ErrorBoundary>
);
