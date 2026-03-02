'use client';

import '@crayonai/react-ui/styles/index.css';
import { C1Chat } from '@thesysai/genui-sdk';

const CHAT_CONFIG = {
  apiUrl: '/api/chat',
  theme: {
    mode: 'dark' as const,
    primaryColor: '#00C2FF',
    backgroundColor: '#0A0E1A',
  },
  placeholder: 'Ask about alerts, cameras, or incidents...',
};

export interface AegisChatProps {
  className?: string;
}

export function AegisChat({ className }: AegisChatProps) {
  return (
    <div className={['aegis-chat-container', className].filter(Boolean).join(' ')}>
      <C1Chat
        apiUrl={CHAT_CONFIG.apiUrl}
        theme={CHAT_CONFIG.theme}
        placeholder={CHAT_CONFIG.placeholder}
      />
    </div>
  );
}
