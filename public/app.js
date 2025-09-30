const socket = io();

const usernameModal = document.getElementById('usernameModal');
const usernameInput = document.getElementById('usernameInput');
const joinBtn = document.getElementById('joinBtn');
const chatContainer = document.getElementById('chatContainer');
const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const userCountElement = document.getElementById('userCount');
const anonymousToggle = document.getElementById('anonymousToggle');
const anonymousStatus = document.getElementById('anonymousStatus');
const anonymousNotice = document.getElementById('anonymousNotice');

let currentSocketId = null;
let username = '';
let isAnonymous = true;

joinBtn.addEventListener('click', joinChat);
usernameInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        joinChat();
    }
});

function joinChat() {
    const inputValue = usernameInput.value.trim();
    
    if (inputValue) {
        username = inputValue;
        usernameModal.classList.add('hidden');
        chatContainer.classList.add('active');
        messageInput.focus();
        
        socket.emit('user_joined', { username: username });
    }
}

socket.on('connect', () => {
    currentSocketId = socket.id;
});

socket.on('user_count', (count) => {
    userCountElement.textContent = `${count} member${count !== 1 ? 's' : ''} online`;
});

socket.on('message_history', (messages) => {
    chatMessages.innerHTML = '';
    
    chatMessages.appendChild(anonymousNotice);
    
    messages.forEach((msg) => {
        addHistoryMessage({
            message: msg.message,
            username: msg.username,
            timestamp: new Date(msg.timestamp).toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit' 
            }),
            isAnonymous: msg.is_anonymous,
            socketId: null
        });
    });
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
});

socket.on('chat_message', (data) => {
    addMessage(data);
});

socket.on('user_joined', (data) => {
    if (data.socketId !== currentSocketId) {
        addSystemMessage(`${data.username} joined the chat`);
    }
});

anonymousToggle.addEventListener('click', () => {
    isAnonymous = !isAnonymous;
    
    if (isAnonymous) {
        anonymousToggle.classList.add('active');
        anonymousStatus.textContent = 'Anonymous';
        anonymousNotice.style.display = 'flex';
    } else {
        anonymousToggle.classList.remove('active');
        anonymousStatus.textContent = username;
        anonymousNotice.style.display = 'none';
    }
});

anonymousToggle.classList.add('active');

function addMessage(data) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${data.socketId === currentSocketId ? 'own' : 'other'}`;
    
    const isOwn = data.socketId === currentSocketId;
    
    if (!isOwn) {
        const headerDiv = document.createElement('div');
        headerDiv.className = 'message-header';
        
        const avatarDiv = document.createElement('div');
        avatarDiv.className = 'user-avatar';
        avatarDiv.textContent = data.username.charAt(0).toUpperCase();
        
        const usernameSpan = document.createElement('span');
        usernameSpan.className = 'username';
        usernameSpan.textContent = data.username;
        
        headerDiv.appendChild(avatarDiv);
        headerDiv.appendChild(usernameSpan);
        messageDiv.appendChild(headerDiv);
    }
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    
    const textP = document.createElement('p');
    textP.className = 'message-text';
    textP.textContent = data.message;
    
    bubbleDiv.appendChild(textP);
    messageDiv.appendChild(bubbleDiv);
    
    const footerDiv = document.createElement('div');
    footerDiv.className = 'message-footer';
    
    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    timestampSpan.textContent = data.timestamp;
    
    footerDiv.appendChild(timestampSpan);
    
    if (isOwn) {
        const checkmark = document.createElement('span');
        checkmark.className = 'checkmark';
        checkmark.innerHTML = '✓✓';
        footerDiv.appendChild(checkmark);
    }
    
    messageDiv.appendChild(footerDiv);
    chatMessages.appendChild(messageDiv);
    
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function addHistoryMessage(data) {
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message other';
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'message-header';
    
    const avatarDiv = document.createElement('div');
    avatarDiv.className = 'user-avatar';
    avatarDiv.textContent = data.username.charAt(0).toUpperCase();
    
    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'username';
    usernameSpan.textContent = data.username;
    
    headerDiv.appendChild(avatarDiv);
    headerDiv.appendChild(usernameSpan);
    messageDiv.appendChild(headerDiv);
    
    const bubbleDiv = document.createElement('div');
    bubbleDiv.className = 'message-bubble';
    
    const textP = document.createElement('p');
    textP.className = 'message-text';
    textP.textContent = data.message;
    
    bubbleDiv.appendChild(textP);
    messageDiv.appendChild(bubbleDiv);
    
    const footerDiv = document.createElement('div');
    footerDiv.className = 'message-footer';
    
    const timestampSpan = document.createElement('span');
    timestampSpan.className = 'timestamp';
    timestampSpan.textContent = data.timestamp;
    
    footerDiv.appendChild(timestampSpan);
    messageDiv.appendChild(footerDiv);
    
    chatMessages.appendChild(messageDiv);
}

function addSystemMessage(text) {
    const systemDiv = document.createElement('div');
    systemDiv.className = 'anonymous-notice';
    systemDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(systemDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const message = messageInput.value.trim();
    
    if (message && username) {
        socket.emit('chat_message', {
            message: message,
            isAnonymous: isAnonymous,
            username: username
        });
        
        messageInput.value = '';
        messageInput.focus();
    }
}

sendBtn.addEventListener('click', sendMessage);

messageInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

usernameInput.focus();
