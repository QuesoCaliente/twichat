import { client } from './mtmi.js';

const getParams = (param) => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(param);
};

const init = () => {
    const channel = getParams('channel');
    const invertir = getParams('invertir') === 'true'; // Obtener el parámetro 'invertir'
    const maxComentarios = parseInt(getParams('comentarios'), 10) || 10; // Obtener el límite de comentarios, por defecto 10
    const messageMaxWidth = getParams('maxWidth') || '900px'; // Obtener el ancho máximo desde los parámetros, por defecto 900px

    if (!channel) return;

    // Establecer el ancho máximo como una variable CSS
    document.documentElement.style.setProperty('--message-max-width', messageMaxWidth);

    client.connect({ channels: [channel] });

    const twitchContainer = document.getElementById('twitch-container');

    client.on('message', ({ message, badges, userInfo }) => {
        const messageContainer = document.createElement('div');
        console.log('message', message);
        messageContainer.classList.add('message', 'appear'); // Agregar clase para animación de aparición

        const badgeContainer = document.createElement('div');
        badgeContainer.classList.add('badges');

        // Mostrar las insignias (badges)
        badges.forEach((badge) => {
            const badgeElement = document.createElement('img');
            badgeElement.src = badge.image;
            badgeElement.alt = badge.name;
            badgeElement.title = badge.description;
            badgeElement.style.display = 'block'; // Tamaño de las insignias
            badgeContainer.appendChild(badgeElement);
        });

        messageContainer.appendChild(badgeContainer);
        messageContainer.innerHTML += `<span class="username" style="color: ${userInfo.color}">${userInfo.displayName}:</span> <p class="message-text">${message}</p>`;

        // Limitar la cantidad de comentarios en pantalla
        if (twitchContainer.childElementCount >= maxComentarios) {
            if (invertir) {
                // Si los comentarios están invertidos, eliminar el último comentario (el más reciente)
                const lastMessage = twitchContainer.lastChild;
                lastMessage.classList.add('disappear'); // Agregar clase para animación de desaparición
                setTimeout(() => {
                    twitchContainer.removeChild(lastMessage);
                }, 500); // Tiempo de la animación antes de eliminar
            } else {
                // Si no están invertidos, eliminar el primer comentario (el más antiguo)
                const firstMessage = twitchContainer.firstChild;
                firstMessage.classList.add('disappear'); // Agregar clase para animación de desaparición
                setTimeout(() => {
                    twitchContainer.removeChild(firstMessage);
                }, 500); // Tiempo de la animación antes de eliminar
            }
        }

        // Agregar el mensaje al contenedor
        if (invertir) {
            twitchContainer.insertBefore(messageContainer, twitchContainer.firstChild);
        } else {
            twitchContainer.appendChild(messageContainer);
        }

        // Desplazamiento automático
        if (userInfo.username === 'mtmi') {
            twitchContainer.scrollTop = twitchContainer.scrollHeight;
        }

        // Eliminar el mensaje después de 10 segundos con animación de desaparición
        setTimeout(() => {
            messageContainer.classList.add('disappear'); // Iniciar animación de desaparición
            setTimeout(() => {
                messageContainer.remove();
            }, 500); // Eliminar el elemento después de la animación (0.5s)
        }, 10000);
    });
};

init();
