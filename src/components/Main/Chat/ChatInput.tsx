import React, { useState } from 'react';
import { Box, TextField, IconButton, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSendMessage, isLoading }) => {
  const [inputText, setInputText] = useState('');

  const handleSend = (event: React.FormEvent) => {
    // 阻止表单提交的默认行为（防止页面刷新）
    event.preventDefault();

    const trimmedText = inputText.trim();
    if (!trimmedText) {
      return;
    }

    if (!isLoading) {
      onSendMessage(trimmedText);
      setInputText('');
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleSend}
      sx={{
        display: 'flex',
        alignItems: 'center',
        padding: '8px',
      }}
    >
      <TextField
        fullWidth // 自动占据所有可用宽度
        variant="outlined"
        placeholder="创作一首关于雨的悲伤歌曲..."
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        disabled={isLoading} // 如果程序正忙，就禁用输入框
        autoComplete="off"
        sx={{ mr: 1 }} // 给右边留一点空隙
      />
      
      <Box sx={{ position: 'relative' }}>
        <IconButton 
          type="submit" // 按钮类型是“提交”，这样按回车键也能触发 onSend
          color="primary" 
          disabled={isLoading || inputText.trim() === ''}
        >
          <SendIcon />
        </IconButton>
        {/* 如果程序正忙，就在按钮上显示一个加载圈 */}
        {isLoading && (
          <CircularProgress
            size={24}
            sx={{
              color: 'primary.main',
              position: 'absolute',
              top: '50%',
              left: '50%',
              marginTop: '-12px',
              marginLeft: '-12px',
            }}
          />
        )}
      </Box>
    </Box>
  );
};

export default ChatInput;