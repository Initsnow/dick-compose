import type React from 'react'; // 确保引入了 useLayoutEffect
import { useLayoutEffect, useRef } from 'react';
import { Box, Paper, useTheme } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import type { Message } from '../../../types';
import PlanCard from './PlanCard';

interface ChatMessagesProps {
  messages: Message[];
}

const ChatMessages: React.FC<ChatMessagesProps> = ({ messages }) => {
  // 1. 创建一个新的 ref 用于引用滚动容器本身
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useLayoutEffect(() => {
    // 3. 直接操作滚动容器
    if (scrollContainerRef.current) {
      const scrollContainer = scrollContainerRef.current;
      // 将容器的 scrollTop 设置为其内容的总高度，即可立即滚动到底部
      scrollContainer.scrollTop = scrollContainer.scrollHeight;
    }
  }, [messages.length]); // 依赖项仍然是 messages，确保每次消息更新都执行

  return (
    // 2. 将新的 ref 附加到这个 Box 上
    <Box
      ref={scrollContainerRef}
      sx={{
        flexGrow: 1,
        overflowY: 'auto',
        p: 2,
      }}
    >
      {messages.map((message) => (
        <Box
          key={message.id}
          sx={{
            display: 'flex',
            justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start',
            mb: 2,
          }}
        >
          <Paper
            elevation={3}
            sx={{
              p: 1.5,
              maxWidth: '80%',
              backgroundColor:
                message.role === 'user'
                  ? theme.palette.primary.main
                  : theme.palette.background.paper,
              color:
                message.role === 'user'
                  ? theme.palette.primary.contrastText
                  : theme.palette.text.primary,
            }}
          >
            <ReactMarkdown>
              {message.content}
            </ReactMarkdown>
            {message.plan && <PlanCard plan={message.plan} />}
          </Paper>
        </Box>
      ))}
    </Box>
  );
};

export default ChatMessages;