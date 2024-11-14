function App() {
  const handleLogin = () => {
    const SERVER_URL = import.meta.env.VITE_BACKEND_URL; 
    window.location.href = `${SERVER_URL}/login`;
  };

  return (
    <div>
      <h1>Welcome to My App</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
}

export default App;
