const socket = io();

const messageInput = document.getElementById('messageInput');
const sendBtn = document.getElementById('sendBtn');
const chatMessages = document.getElementById('chatMessages');
const userCountElement = document.getElementById('userCount');

let currentSocketId = null;

socket.on('connect', () => {
    currentSocketId = socket.id;
    socket.emit('user_joined', { username: 'Anonymous' });
});

socket.on('user_count', (count) => {
    userCountElement.textContent = `${count} member${count !== 1 ? 's' : ''} online`;
});

socket.on('chat_message', (data) => {
    addMessage(data);
});

socket.on('user_joined', (data) => {
    if (data.socketId !== currentSocketId) {
        addSystemMessage(`${data.username} joined the chat`);
    }
});

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

function addSystemMessage(text) {
    const systemDiv = document.createElement('div');
    systemDiv.className = 'anonymous-notice';
    systemDiv.innerHTML = `<p>${text}</p>`;
    chatMessages.appendChild(systemDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function sendMessage() {
    const message = messageInput.value.trim();
    
    if (message) {
        socket.emit('chat_message', {
            message: message,
            isAnonymous: true,
            username: 'Anonymous'
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

messageInput.focus();
