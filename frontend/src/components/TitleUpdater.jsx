import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    // console.log('Current path:', path);
    const segments = path.split('/').filter(Boolean);
    if (segments.length > 0) {
      const title = segments[segments.length - 1].split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
      document.title = `Panda Express - ${title}`;
    } else {
      document.title = 'Panda Express';
    }
  }, [location]);

  return null;
};

export default TitleUpdater;