document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const messageInput = document.getElementById('messageInput');
    const sendButton = document.getElementById('sendButton');
    const messagesDiv = document.getElementById('messages');
    const usersDiv = document.getElementById('users');
    const chatsDiv = document.getElementById('chats');
    const authDiv = document.getElementById('auth');
    const chatAppDiv = document.getElementById('chatApp');
    const createChatForm = document.getElementById('createChatForm');
    const chatNameInput = document.getElementById('chatName');
    const chatTitle = document.getElementById('chatTitle');
    const profileForm = document.getElementById('profileForm');
    const profileDiv = document.getElementById('profile');

    let token = '';
    let currentChatId = null;
    let socket = null;
    let currentUser = { username: 'Unknown', avatar: '/media/avatars/default-avatar.jpeg' };

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        fetch('/api/login/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ username, password })
        })
        .then(response => response.json())
        .then(data => {
            if (data.access) {
                token = data.access;
                console.log('Token received:', token);
                authDiv.style.display = 'none';
                chatAppDiv.style.display = 'flex';
                profileDiv.style.display = 'block'; // Показываем вкладку профиля
                fetchCurrentUser(); // Получаем данные о текущем пользователе
                loadUsers();
                loadChats(); // Загрузка чатов при входе
            } else {
                alert('Login failed: ' + (data.detail || 'Unknown error'));
            }
        })
        .catch(error => console.error('Error:', error));
    });

    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const formData = new FormData();
        formData.append('username', document.getElementById('regUsername').value);
        formData.append('password', document.getElementById('regPassword').value);
        formData.append('first_name', document.getElementById('regFirstName').value);
        formData.append('last_name', document.getElementById('regLastName').value);
        formData.append('avatar', document.getElementById('regAvatar').files[0]);

        fetch('/api/users/register/', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            alert('User registered successfully');
        })
        .catch(error => console.error('Error:', error));
    });

    createChatForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const chatName = chatNameInput.value.trim();

        if (chatName) {
            fetch('/api/chats/', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: chatName })
            })
            .then(response => response.json())
            .then(chat => {
                if (chat.id) {
                    console.log('Chat created successfully:', chat);
                    loadChats(); // Обновление списка чатов после создания нового
                } else {
                    console.error('Failed to create chat:', chat);
                }
            })
            .catch(error => console.error('Error:', error));
        } else {
            console.error('Chat name is required.');
        }
    });

    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const profileData = {
            first_name: document.getElementById('profileFirstName').value,
            last_name: document.getElementById('profileLastName').value
        };
        if (document.getElementById('profileAvatar').files.length > 0) {
            profileData.avatar = document.getElementById('profileAvatar').files[0];
        }

        fetch('/api/users/me/', {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(profileData)
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => { throw new Error(err.detail || 'Unknown error'); });
            }
            return response.json();
        })
        .then(data => {
            console.log('Profile updated:', data);
            alert('Profile updated successfully');
            fetchCurrentUser(); // Обновляем текущего пользователя после изменения профиля
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error updating profile: ' + error.message);
        });
    });

    function fetchCurrentUser() {
        if (!token) {
            console.warn('No token found. Skipping fetchCurrentUser.');
            return;
        }

        console.log('Fetching current user...');
        fetch('/api/users/me/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            console.log('Response status:', response.status);
            if (!response.ok) {
                throw new Error('Failed to fetch user');
            }
            return response.json();
        })
        .then(data => {
            console.log('Current user data:', data);
            currentUser = {
                username: data.username || 'Unknown',
                avatar: data.avatar || '/media/avatars/default-avatar.jpeg'
            };

            // Заполняем поля формы профиля
            document.getElementById('profileUsername').value = data.username || '';
            document.getElementById('profileFirstName').value = data.first_name || '';
            document.getElementById('profileLastName').value = data.last_name || '';

        })
        .catch(error => {
            console.error('Error fetching current user:', error);
            currentUser = { username: 'Unknown', avatar: '/media/avatars/default-avatar.jpeg' };
        });
    }

    function loadUsers() {
        if (!token) {
            console.warn('No token found. Skipping loadUsers.');
            return;
        }

        fetch('/api/users/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                usersDiv.innerHTML = '';
                data.forEach(user => {
                    const userDiv = document.createElement('div');
                    userDiv.textContent = user.username;
                    userDiv.onclick = () => openChat(user.id);
                    usersDiv.appendChild(userDiv);
                });
            } else {
                console.error('Failed to load users:', data);
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function loadChats() {
        if (!token) {
            console.warn('No token found. Skipping loadChats.');
            return;
        }

        fetch('/api/chats/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => response.json())
        .then(data => {
            if (Array.isArray(data)) {
                chatsDiv.innerHTML = '';
                data.forEach(chat => {
                    const chatDiv = document.createElement('div');
                    chatDiv.className = 'chat-item';
                    chatDiv.textContent = chat.name;
                    chatDiv.setAttribute('data-chat-id', chat.id);
                    chatDiv.onclick = () => openChat(chat.id);
                    chatsDiv.appendChild(chatDiv);
                });
            } else {
                console.error('Failed to load chats:', data);
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function openChat(chatId) {
        if (!token) {
            console.warn('No token found. Skipping openChat.');
            return;
        }

        fetch(`/api/chats/${chatId}/messages/`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to fetch messages');
            }
        })
        .then(data => {
            if (Array.isArray(data)) {
                currentChatId = chatId;

                const chat = document.querySelector(`.chat-item[data-chat-id="${chatId}"]`);
                if (chat) {
                    chatTitle.textContent = `Chat: ${chat.textContent}`;
                } else {
                    chatTitle.textContent = 'Chat: Unknown';
                }

                messagesDiv.innerHTML = '';
                data.forEach(message => addMessage(message));
                connectWebSocket(currentChatId);
            } else {
                console.error('Failed to load messages:', data);
            }
        })
        .catch(error => console.error('Error:', error));
    }

    function addMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message';

        const avatarImg = document.createElement('img');
        avatarImg.src = message.user.avatar || '/media/avatars/default-avatar.jpeg';
        avatarImg.alt = `${message.user.username}'s avatar`;
        avatarImg.width = 50;
        avatarImg.height = 50;

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';
        contentDiv.innerHTML = `<div class="message-author">${message.user.username}</div><div>${message.content}</div>`;

        messageDiv.appendChild(avatarImg);
        messageDiv.appendChild(contentDiv);

        messagesDiv.prepend(messageDiv);
    }

    function connectWebSocket(chatId) {
        if (socket) {
            socket.close();
        }

        socket = new WebSocket(`ws://${window.location.hostname}:8001/ws/chat/${chatId}/`);

        socket.onopen = function(event) {
            console.log('WebSocket connection established');
        };

        socket.onmessage = function(event) {
            try {
                const data = JSON.parse(event.data);
                if (data.message) {
                    addMessage({ user: currentUser, content: data.message });
                } else {
                    console.error('Unexpected message format:', data);
                }
            } catch (e) {
                console.error('Error parsing WebSocket message:', e);
            }
        };

        socket.onerror = function(event) {
            console.error('WebSocket error:', event);
        };

        socket.onclose = function(event) {
            console.error('Chat socket closed unexpectedly:', event);
            setTimeout(() => connectWebSocket(chatId), 5000);
        };
    }

    sendButton.addEventListener('click', function() {
        const message = messageInput.value.trim();

        if (currentChatId && socket && message) {
            socket.send(JSON.stringify({ message: message }));
            messageInput.value = '';
        } else {
            console.error('Cannot send message. Ensure you are connected to a chat and the message is not empty.');
        }
    });

    fetchCurrentUser(); // Инициализация профиля
});