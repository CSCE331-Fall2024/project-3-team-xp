import { useState, useEffect } from 'react';

const TextMagnifier = ({ magnifierSize = 200, zoomLevel = 2 }) => {
  const [isMagnifying, setIsMagnifying] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const [hoveredElement, setHoveredElement] = useState(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isMagnifying) return;

      const x = e.clientX;
      const y = e.clientY;
      setCursorPos({ x, y });

      const element = document.elementFromPoint(x, y);

      if (
        element &&
        isVisible(element) && 
        element.textContent.trim() !== '' &&
        !isDebugElement(element)
      ) {
        setHoveredElement(element);
      } else {
        setHoveredElement(null);
      }
    };

    if (isMagnifying) {
      document.addEventListener('mousemove', handleMouseMove);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, [isMagnifying]);

  const isVisible = (element) => {
    const style = window.getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return (
      style.display !== 'none' &&
      style.visibility !== 'hidden' &&
      style.opacity !== '0' &&
      rect.width > 0 &&
      rect.height > 0 &&
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  };

  const isDebugElement = (element) => {
    const reactDebugKeys = ['__react', 'data-reactroot'];
    return reactDebugKeys.some((key) => key in element || element.hasAttribute(key));
  };

  const toggleMagnifier = () => {
    setIsMagnifying(!isMagnifying);
  };

  const maxLength = 100;
  const textContent =
    hoveredElement?.textContent.slice(0, maxLength) || '';

  return (
    <div className="relative">
      {/* Toggle Button */}
      <button
        onClick={toggleMagnifier}
        className={`px-4 py-2 fixed bottom-5 left-5 rounded-full text-white shadow-lg transition-transform transform focus:outline-none ${isMagnifying
          ? 'bg-red-500 hover:scale-105'
          : 'bg-blue-500 hover:scale-105'
          }`}
      >
        {isMagnifying ? 'Disable Magnifier' : 'Enable Magnifier'}
      </button>

      {/* Magnifier Glass */}
      {isMagnifying && (
        <div
          className="fixed pointer-events-none rounded-full shadow-lg flex items-center justify-center"
          style={{
            width: `${magnifierSize}px`,
            height: `${magnifierSize}px`,
            top: `${cursorPos.y - magnifierSize / 2}px`,
            left: `${cursorPos.x - magnifierSize / 2}px`,
            zIndex: 1000,
            border: '4px solid rgba(0, 0, 0, 0.6)',
            background: 'rgba(255, 255, 255, 0.3)',
            backdropFilter: 'blur(10px) brightness(1.1)',
            boxShadow: '0 8px 20px rgba(0, 0, 0, 0.2)',
          }}
        >
          {/* Magnified Text */}
          {hoveredElement && textContent && (
            <div
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center',
                whiteSpace: 'normal',
                wordWrap: 'break-word',
                overflow: 'hidden',
                textAlign: 'center',
                maxWidth: `${magnifierSize / zoomLevel}px`,
                fontSize: '16px',
              }}
              className="text-black"
            >
              {textContent}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TextMagnifier;
