import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TitleUpdater = () => {
  const location = useLocation();

  useEffect(() => {
    const path = location.pathname;
    // console.log('Current path:', path);
    const segments = path.split('/').filter(Boolean);
    const title = segments.length > 0 ? segments[segments.length - 1] : 'Home';
    document.title = `${title.charAt(0).toUpperCase() + title.slice(1)}`;
  }, [location]);

  return null;
};

export default TitleUpdater;