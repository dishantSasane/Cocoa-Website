// Gmail MCP Agent - Frontend JavaScript

let conversationHistory = [];

// DOM Elements
const loginScreen = document.getElementById('login-screen');
const chatScreen = document.getElementById('chat-screen');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const logoutBtn = document.getElementById('logout-btn');
const chatForm = document.getElementById('chat-form');
const userInput = document.getElementById('user-input');
const messagesContainer = document.getElementById('messages');

// Check if already logged in on page load
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const response = await fetch('/api/me');
        if (response.ok) {
            showChatScreen();
        }
    } catch (error) {
        console.log('Not logged in');
    }
});

// Login form handler
loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    
    submitBtn.disabled = true;
    submitBtn.classList.add('loading');
    loginError.textContent = '';
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ password }),
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            showChatScreen();
        } else {
            loginError.textContent = data.detail || 'Login failed. Please try again.';
        }
    } catch (error) {
        loginError.textContent = 'Network error. Please try again.';
        console.error('Login error:', error);
    } finally {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
    }
});

// Logout handler
logoutBtn.addEventListener('click', async () => {
    try {
        await fetch('/api/logout', { method: 'POST' });
    } catch (error) {
        console.error('Logout error:', error);
    }
    
    showLoginScreen();
    conversationHistory = [];
});

// Chat form handler
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const message = userInput.value.trim();
    if (!message) return;
    
    // Add user message to UI
    addMessage(message, 'user');
    userInput.value = '';
    
    // Disable input while processing
    setChatLoading(true);
    
    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message,
                conversation_history: conversationHistory,
            }),
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Add AI response to UI
            addMessage(data.response, 'ai');
            
            // Update conversation history
            conversationHistory.push(...data.conversation_history);
        } else {
            addMessage(`Error: ${data.detail || 'Failed to get response'}`, 'ai');
        }
    } catch (error) {
        addMessage(`Error: Network error - ${error.message}`, 'ai');
        console.error('Chat error:', error);
    } finally {
        setChatLoading(false);
        userInput.focus();
    }
});

// Helper functions
function showLoginScreen() {
    loginScreen.classList.remove('hidden');
    chatScreen.classList.add('hidden');
    document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
}

function showChatScreen() {
    loginScreen.classList.add('hidden');
    chatScreen.classList.remove('hidden');
    document.body.style.background = 'none';
    document.body.style.backgroundColor = '#f0f0f0';
}

function addMessage(content, role) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}`;
    
    const contentDiv = document.createElement('div');
    contentDiv.className = 'message-content';
    contentDiv.innerHTML = formatMessage(content);
    
    messageDiv.appendChild(contentDiv);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatMessage(content) {
    // Convert markdown-like formatting to HTML
    return content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`(.*?)`/g, '<code>$1</code>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^<p>/, '')
        .replace(/<\/p>$/, '');
}

function setChatLoading(loading) {
    const submitBtn = chatForm.querySelector('button[type="submit"]');
    const input = userInput;
    
    if (loading) {
        submitBtn.disabled = true;
        submitBtn.classList.add('loading');
        input.disabled = true;
    } else {
        submitBtn.disabled = false;
        submitBtn.classList.remove('loading');
        input.disabled = false;
    }
}

// Allow Enter key to send messages
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        chatForm.dispatchEvent(new Event('submit'));
    }
});
