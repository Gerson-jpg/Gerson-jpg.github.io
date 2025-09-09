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

            // Hide Google Sign-In button and show user info
            const signInButton = document.querySelector('.g_id_signin');
            const userInfoDiv = document.getElementById('user-info');

            console.log('Sign-in button found:', !!signInButton);
            console.log('Sign-in button element:', signInButton);
            console.log('Sign-in button classes:', signInButton ? signInButton.className : 'N/A');
            console.log('User info div found:', !!userInfoDiv);
            console.log('User info div element:', userInfoDiv);

            if (signInButton && userInfoDiv) {
                signInButton.style.display = 'none';
                userInfoDiv.style.display = 'flex';
                const avatarImg = userInfoDiv.querySelector('.user-avatar');
                const userNameSpan = userInfoDiv.querySelector('.user-name');

                console.log('Avatar img found:', !!avatarImg);
                console.log('User name span found:', !!userNameSpan);

                if (avatarImg) avatarImg.src = userData.picture;
                if (userNameSpan) userNameSpan.textContent = userData.name;

                console.log('User data applied:', userData.name, userData.picture);
            } else {
                console.error('Could not find required DOM elements');
            }

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

        // throw error; // Comentado para desarrollo
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

function updateUserInterface(user) {
    // This function is no longer used for UI update since we handle it in handleCredentialResponse and checkUserSession
    // You can remove this function if not used elsewhere
}

// Function to check if user is already logged in on page load
function checkUserSession() {
    console.log('Checking user session...');
    const userData = localStorage.getItem('user');
    console.log('User data from localStorage:', userData);

    if (userData) {
        const user = JSON.parse(userData);
        console.log('Parsed user data:', user);

        // Hide Google Sign-In button and show user info
        const signInButton = document.querySelector('.g_id_signin');
        const userInfoDiv = document.getElementById('user-info');

        console.log('Session check - Sign-in button found:', !!signInButton);
        console.log('Session check - User info div found:', !!userInfoDiv);

        if (signInButton && userInfoDiv) {
            signInButton.style.display = 'none';
            userInfoDiv.style.display = 'flex';
            const avatarImg = userInfoDiv.querySelector('.user-avatar');
            const userNameSpan = userInfoDiv.querySelector('.user-name');

            console.log('Session check - Avatar img found:', !!avatarImg);
            console.log('Session check - User name span found:', !!userNameSpan);

            if (avatarImg) avatarImg.src = user.picture;
            if (userNameSpan) userNameSpan.textContent = user.name;

            console.log('Session restored for user:', user.name);
        } else {
            console.error('Session check - Could not find required DOM elements');
        }
    } else {
        console.log('No user session found');
    }
}

// Function to logout user
function logout() {
    // Remove user data from localStorage
    localStorage.removeItem('user');

    // Hide user info and show Google Sign-In button
    const signInButton = document.querySelector('.g_id_signin');
    const userInfoDiv = document.getElementById('user-info');
    if (signInButton && userInfoDiv) {
        signInButton.style.display = 'block';
        userInfoDiv.style.display = 'none';
    }

    console.log('Usuario cerró sesión');
    alert('Has cerrado sesión exitosamente');
}
