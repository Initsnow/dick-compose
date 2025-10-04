import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApiKey } from '../contexts/ApiKeyContext.tsx';
import { pyInvoke } from "tauri-plugin-pytauri-api";
import { Container, TextField, Button, Typography, Box, CircularProgress } from '@mui/material';

const SetupPage: React.FC = () => {
  const [localApiKey, setLocalApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setApiKey } = useApiKey();
  const navigate = useNavigate();

  const handleValidate = async () => {
    if (!localApiKey) {
      setError('API Key cannot be empty.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const isValid = await pyInvoke('validate_api_key', { key: localApiKey });
      if (isValid) {
        setApiKey(localApiKey);
        navigate('/');
      } else {
        setError('Invalid API Key. Please check and try again.');
      }
    } catch (err) {
      setError('An error occurred while validating the key.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box >
          <img 
            src="../../../src-tauri/icons/icon.png" 
            alt="DeepCompose Logo" 
            style={{ maxHeight: '80px', width: 'auto' }}
          />
        </Box>
        <Typography variant="h4" gutterBottom>
          API Key Setup
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          Please enter your DeepSeek API Key to continue.
        </Typography>
        <TextField
          label="API Key"
          variant="outlined"
          type="password"
          fullWidth
          value={localApiKey}
          onChange={(e) => setLocalApiKey(e.target.value)}
          error={!!error}
          helperText={error}
          sx={{ mb: 2 }}
        />
        <Button
          variant="contained"
          onClick={handleValidate}
          disabled={loading}
          fullWidth
          size="large"
        >
          {loading ? <CircularProgress size={24} /> : 'Validate and Continue'}
        </Button>
      </Box>
    </Container>
  );
};

export default SetupPage;