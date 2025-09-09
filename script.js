// Mobile menu toggle functionality
document.addEventListener('DOMContentLoaded', function() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
        if (navMenu && hamburger && 
            !navMenu.contains(event.target) && 
            !hamburger.contains(event.target) && 
            navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        }
    });
    
    // Close menu when clicking on links (for single page navigation)
    const navLinks = document.querySelectorAll('.nav-menu a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            if (navMenu.classList.contains('active')) {
                navMenu.classList.remove('active');
                hamburger.classList.remove('active');
            }
        });
    });

    // Check for existing user session
    checkUserSession();
});

// Google Sign-In callback function
async function handleCredentialResponse(response) {
    try {
        // IMPORTANTE: El ID Token debe ser verificado en el servidor
        // Nunca confíes en los datos del cliente sin validación del servidor

        // Enviar el ID Token al servidor para verificación
        const verificationResponse = await verifyTokenWithServer(response.credential);

        if (verificationResponse.success) {
            // Solo usar los datos después de la verificación del servidor
            const userData = verificationResponse.user;

            // Store user information in localStorage for session management
            localStorage.setItem('user', JSON.stringify({
                name: userData.name,
                email: userData.email,
                picture: userData.picture,
                sub: userData.sub, // Google user ID
                loginTime: new Date().toISOString()
            }));

            // Update UI to show user is logged in
            updateUserInterface(userData);

            // Optional: Redirect to a protected page or show success message
            console.log('Usuario autenticado exitosamente:', userData.name);
            alert(`¡Bienvenido, ${userData.name}!`);
        } else {
            throw new Error('Verificación del token fallida');
        }

    } catch (error) {
        console.error('Error al procesar la autenticación:', error);
        alert('Error en la autenticación. Por favor, verifica tu conexión e intenta de nuevo.');
    }
}

// Función para verificar el token con el servidor
async function verifyTokenWithServer(idToken) {
    try {
        // IMPORTANTE: Implementa este endpoint en tu servidor
        // El servidor debe usar la biblioteca oficial de Google para verificar el token
        // Ejemplo de endpoint: POST /api/auth/verify-google-token

        const response = await fetch('/api/auth/verify-google-token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                token: idToken
            })
        });

        if (!response.ok) {
            throw new Error('Error en la verificación del servidor');
        }

        return await response.json();

    } catch (error) {
        console.error('Error al verificar token con servidor:', error);
        // Fallback: Para desarrollo/testing, puedes descomentar las líneas abajo
        // pero NUNCA uses esto en producción

        /*
        // ⚠️ SOLO PARA DESARROLLO - NO USAR EN PRODUCCIÓN ⚠️
        console.warn('Usando verificación del cliente - SOLO PARA DESARROLLO');
        const responsePayload = decodeJwtResponse(idToken);
        return {
            success: true,
            user: {
                name: responsePayload.name,
                email: responsePayload.email,
                picture: responsePayload.picture,
                sub: responsePayload.sub
            }
        };
        */

        throw error;
    }
}

// Helper function to decode JWT token
function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

// Function to update UI after successful login
function updateUserInterface(user) {
    // You can customize this function to update your UI
    // For example, hide the sign-in button and show user info
    const signInButton = document.querySelector('.g_id_signin');
    if (signInButton) {
        signInButton.style.display = 'none';
    }

    // Optionally add user info display
    const navContainer = document.querySelector('.nav-container');
    if (navContainer && user) {
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <img src="${user.picture}" alt="${user.name}" class="user-avatar">
            <span class="user-name">${user.name}</span>
        `;
        navContainer.appendChild(userInfo);
    }
}

// Function to check if user is already logged in on page load
function checkUserSession() {
    const userData = localStorage.getItem('user');
    if (userData) {
        const user = JSON.parse(userData);
        updateUserInterface(user);
        console.log('Sesión activa para:', user.name);
    }
}
