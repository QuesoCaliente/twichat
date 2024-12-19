import { client } from './mtmi.js';

const getParams = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
};

const createChatLine = (message, badges, userInfo, messageInfo) => {
    const fontSize = getParams('fontSize') || '24px';

    const chatLine = document.createElement('div');
    chatLine.className = 'chat_line';
    chatLine.dataset.nick = userInfo.username;
    chatLine.dataset.time = Date.now().toString();
    chatLine.dataset.id = crypto.randomUUID();
    chatLine.style.fontSize = fontSize;

    const userInfoContainer = document.createElement('span');
    userInfoContainer.className = 'user_info';


    // Add badges
    badges.forEach((badge) => {
        const badgeElement = document.createElement('img');
        badgeElement.className = 'badge';
        badgeElement.style.height = fontSize;
        badgeElement.style.width = fontSize;
        badgeElement.src = badge.image;
        badgeElement.alt = badge.name;
        badgeElement.title = badge.description;
        userInfoContainer.appendChild(badgeElement);
    });

    // Add username and colon
    const usernameSpan = document.createElement('span');
    usernameSpan.className = 'nick';
    usernameSpan.style.color = userInfo.color;
    usernameSpan.textContent = userInfo.displayName;

    const colonSpan = document.createElement('span');
    colonSpan.className = 'colon';
    colonSpan.textContent = ':';

    userInfoContainer.appendChild(usernameSpan);
    userInfoContainer.appendChild(colonSpan);

    // Add message text
    const messageDiv = document.createElement('div');
    messageDiv.className = 'message';
    const messageSpan = document.createElement('span');

    messageSpan.textContent = messageInfo.message;

    chatLine.appendChild(userInfoContainer);
    chatLine.appendChild(messageInfo.message);
    

    return chatLine;
};

const init = async () => {
    const channel = getParams('channel');
    const invertir = getParams('invertir') === 'true';
    const maxComentarios = parseInt(getParams('comentarios'), 10) || 10;
    const messageMaxWidth = getParams('maxWidth') || '900px';

    if (!channel) return;

    document.documentElement.style.setProperty('--message-max-width', messageMaxWidth);

    client.connect({ channels: [channel] });

    const twitchContainer = document.getElementById('chat_container');

    client.on('message', ({ message, badges, userInfo, messageInfo }) => {
        const chatLine = createChatLine(message, badges, userInfo, messageInfo);

        // Manage message limit
        while (twitchContainer.childElementCount >= maxComentarios) {
            if (invertir) {
                twitchContainer.removeChild(twitchContainer.lastChild);
            } else {
                twitchContainer.removeChild(twitchContainer.firstChild);
            }
        }

        // Add new message
        if (invertir) {
            twitchContainer.insertBefore(chatLine, twitchContainer.firstChild);
        } else {
            twitchContainer.appendChild(chatLine);
        }

        // Auto-scroll for specific user
        if (userInfo.username === 'mtmi') {
            twitchContainer.scrollTop = twitchContainer.scrollHeight;
        }
    });
};

init();
