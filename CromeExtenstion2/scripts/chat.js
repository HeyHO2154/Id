class AIChatWidget {
  constructor() {
    this.initializeWidget();
    this.setupEventListeners();
  }

  initializeWidget() {
    this.messagesContainer = document.getElementById('chat-messages');
    this.inputField = document.getElementById('chat-input');
    this.sendButton = document.getElementById('send-button');
  }

  setupEventListeners() {
    this.sendButton.addEventListener('click', () => this.sendMessage());
    this.inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendMessage();
      }
    });
  }

  async typeMessage(messageDiv, text) {
    let currentText = '';
    for (let char of text) {
      currentText += char;
      messageDiv.textContent = currentText;
      this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
      // 각 글자마다 20~50ms 랜덤 딜레이
      await new Promise(resolve => setTimeout(resolve, Math.random() * 30 + 20));
    }
  }

  async sendMessage() {
    const message = this.inputField.value.trim();
    if (!message) return;

    // 사용자 메시지 표시
    this.addMessage(message, 'user');
    this.inputField.value = '';

    // 로딩 메시지 추가
    const loadingDiv = this.addLoadingMessage();

    try {
      // 서버로 메시지 전송
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message })
      });

      const data = await response.json();
      
      // 로딩 메시지 제거
      loadingDiv.remove();

      if (data.error) {
        throw new Error(data.error);
      }

      // AI 응답 메시지 div 생성
      const messageDiv = document.createElement('div');
      messageDiv.classList.add('message', 'bot-message');
      this.messagesContainer.appendChild(messageDiv);

      // 한 글자씩 타이핑 효과로 표시
      await this.typeMessage(messageDiv, data.response);

    } catch (error) {
      console.error('Error:', error);
      loadingDiv.remove();
      this.addMessage('죄송합니다. 오류가 발생했습니다.', 'bot');
    }
  }

  addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);
    messageDiv.textContent = text;
    this.messagesContainer.appendChild(messageDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    return messageDiv;
  }

  addLoadingMessage() {
    const loadingDiv = document.createElement('div');
    loadingDiv.classList.add('message', 'bot-message', 'loading');
    loadingDiv.innerHTML = '<div class="loading-dots"></div>';
    this.messagesContainer.appendChild(loadingDiv);
    this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    return loadingDiv;
  }
}

// 인스턴스 생성
const chatWidget = new AIChatWidget(); 