import { useEffect, useState } from 'react';

const DarkModeToggle = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const storedMode = localStorage.getItem('theme');
    if (storedMode === 'dark') {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else if (storedMode === 'light') {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleDarkMode = () => {
    if (isDarkMode) {
      document.body.classList.remove('dark-mode');
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.body.classList.add('dark-mode');
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setIsDarkMode(!isDarkMode);
  };

  return (
    <button
      onClick={toggleDarkMode}
      className="
        fixed 
        bottom-5 
        right-5 
        dark:bg-gray-200 
        bg-gray-800 
        dark:text-gray-800 
        text-gray-200 
        rounded-full 
        w-14 
        h-14 
        flex 
        items-center 
        justify-center 
        shadow-lg 
        hover:scale-110 
        transition 
        duration-300 
        focus:outline-none
      "
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="yellow"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364-6.364l-1.414 1.414M7.05 16.95l-1.414 1.414M16.95 16.95l-1.414-1.414M7.05 7.05L5.636 8.464M12 8a4 4 0 100 8 4 4 0 000-8z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          fill="currentColor"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            d="M21 12.79A9 9 0 1111.21 3a7 7 0 009.79 9.79z"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
          />
        </svg>
      )}
    </button>
  );
};

export default DarkModeToggle;