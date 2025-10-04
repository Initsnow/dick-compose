import type React from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiKey } from '../contexts/ApiKeyContext';
import Main from '../components/Main/Main';
import { Container, Typography } from '@mui/material';

const HomePage: React.FC = () => {
  const { apiKey } = useApiKey();
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, you'd check for a saved key here
    if (!apiKey) {
      navigate('/setup');
    }
  }, [apiKey, navigate]);

  if (!apiKey) {
    // Render a loading state or redirect immediately
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return <Main />;
};

export default HomePage;