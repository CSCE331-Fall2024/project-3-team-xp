function App() {
  const handleLogin = () => {
    window.location.href = 'http://127.0.0.1:5000/login';
  };

  return (
    <div>
      <h1>Welcome to My App</h1>
      <button onClick={handleLogin}>Login with Google</button>
    </div>
  );
}

export default App;
