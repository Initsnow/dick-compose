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
      setError('API Key不能为空。');
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
        setError('API Key无效。请检查后重试。');
      }
    } catch (err) {
      setError('验证密钥时发生错误。');
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
            src="/icon.png" 
            alt="DeepCompose Logo" 
            style={{ maxHeight: '80px', width: 'auto' }}
          />
        </Box>
        <Typography variant="h4" gutterBottom>
          API Key设置
        </Typography>
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
          请输入您的DeepSeek API Key以继续。
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
          {loading ? <CircularProgress size={24} /> : '验证并继续'}
        </Button>
      </Box>
    </Container>
  );
};

export default SetupPage;