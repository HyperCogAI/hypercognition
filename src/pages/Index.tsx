// Redirect to Home.tsx - consolidating landing pages
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    navigate('/home', { replace: true });
  }, [navigate]);

  return null;
};

export default Index;
