import { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 사용자 메시지 추가
    const userMessage: Message = {
      id: Date.now(),
      text: input,
      isUser: true,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('http://praven.kro.kr:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: input }),
      });

      const data = await response.json();
      
      // LLM 응답 추가
      const llmMessage: Message = {
        id: Date.now(),
        text: data.response,
        isUser: false,
      };
      setMessages(prev => [...prev, llmMessage]);
    } catch (error) {
      console.error('Error:', error);
      // 에러 메시지 추가
      const errorMessage: Message = {
        id: Date.now(),
        text: '죄송합니다. 오류가 발생했습니다.',
        isUser: false,
      };
      setMessages(prev => [...prev, errorMessage]);
    }

    setIsLoading(false);
  };

  return (
    <Container>
      <ChatContainer>
        {messages.map(message => (
          <MessageBubble key={message.id} isUser={message.isUser}>
            {message.text}
          </MessageBubble>
        ))}
        {isLoading && (
          <MessageBubble isUser={false}>
            <TypingIndicator>
              <Dot />
              <Dot />
              <Dot />
            </TypingIndicator>
          </MessageBubble>
        )}
        <div ref={messagesEndRef} />
      </ChatContainer>
      
      <InputForm onSubmit={handleSubmit}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="메시지를 입력하세요..."
          disabled={isLoading}
        />
        <SendButton type="submit" disabled={isLoading}>
          전송
        </SendButton>
      </InputForm>
    </Container>
  );
};

const Container = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 0px;
`;

const ChatContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const MessageBubble = styled.div<{ isUser: boolean }>`
  max-width: 60%;
  padding: 10px 15px;
  border-radius: 15px;
  background-color: ${props => props.isUser ? '#007AFF' : '#E9ECEF'};
  color: ${props => props.isUser ? 'white' : 'black'};
  align-self: ${props => props.isUser ? 'flex-end' : 'flex-start'};
  word-wrap: break-word;
`;

const bounce = keyframes`
  0%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-3px); }
`;

const Dot = styled.div`
  width: 6px;
  height: 6px;
  background: #666;
  border-radius: 50%;
  display: inline-block;
  margin: 0 2px;
  animation: ${bounce} 1.4s infinite ease-in-out;

  &:nth-child(1) { animation-delay: -0.32s; }
  &:nth-child(2) { animation-delay: -0.16s; }
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 5px;
`;

const InputForm = styled.form`
  display: flex;
  gap: 10px;
  padding: 20px 10px;
`;

const Input = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #DDD;
  border-radius: 10px;
  font-size: 16px;

  &:disabled {
    background-color: #F5F5F5;
  }
`;

const SendButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 15px;
  background-color: #007AFF;
  color: white;
  cursor: pointer;

  &:disabled {
    background-color: #CCC;
    cursor: not-allowed;
  }
`;

export default Chat;
