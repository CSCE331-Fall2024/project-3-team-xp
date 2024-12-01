import React, { useState, useEffect } from 'react';

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
        element.tagName !== 'BODY' &&
        element !== document.body &&
        element.textContent.trim() !== ''
      ) {
        setHoveredElement(element);
      } else {
        setHoveredElement(null);
      }
    };

    if (isMagnifying) {
      document.addEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'none'; // Hide default cursor
    } else {
      document.body.style.cursor = 'default'; // Show default cursor
      setHoveredElement(null);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.body.style.cursor = 'default';
    };
  }, [isMagnifying]);

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
        className={`px-4 py-2 rounded text-white shadow-lg transition-transform transform focus:outline-none ${
          isMagnifying
            ? 'bg-red-500 hover:scale-105'
            : 'bg-blue-500 hover:scale-105'
        }`}
      >
        {isMagnifying ? 'Disable Magnifier' : 'Enable Magnifier'}
      </button>

      {/* Magnifier Glass */}
      {isMagnifying && hoveredElement && textContent && (
        <div
          className="fixed pointer-events-none rounded-full overflow-hidden border-2 border-gray-600 bg-white shadow-lg flex items-center justify-center"
          style={{
            width: `${magnifierSize}px`,
            height: `${magnifierSize}px`,
            top: `${cursorPos.y - magnifierSize / 2}px`,
            left: `${cursorPos.x - magnifierSize / 2}px`,
            zIndex: 1000,
          }}
        >
          {/* Magnified Text */}
          <div
            style={{
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'center',
              whiteSpace: 'normal',
              wordWrap: 'break-word',
              overflow: 'hidden',
              textAlign: 'center',
              maxWidth: `${magnifierSize / zoomLevel}px`,
            }}
            className="text-black"
          >
            {textContent}
          </div>
        </div>
      )}
    </div>
  );
};

export default TextMagnifier;
