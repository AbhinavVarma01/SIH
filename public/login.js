document.addEventListener('DOMContentLoaded', () => {
    // Google Sign-In callback
    function handleGoogleSignIn(response) {
        console.log('Google Sign-In response:', response);
        if (response.credential) {
            window.location.href = '/auth/google';
        }
    }

    // Toggle between login and register forms
    function toggleForms() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const toggleButton = document.getElementById('toggleForm');

        if (loginForm && registerForm) {
            loginForm.classList.toggle('hidden');
            registerForm.classList.toggle('hidden');

            // Reset forms
            loginForm.reset();
            registerForm.reset();

            // Update toggle button text
            if (toggleButton) {
                toggleButton.textContent = loginForm.classList.contains('hidden')
                    ? 'Switch to Login'
                    : 'Switch to Register';
            }
        }
    }

    // Handle standard login
    async function handleLogin(event) {
        event.preventDefault();
        const loginForm = document.getElementById('loginForm');
        const emailInput = loginForm.querySelector('input[placeholder="Email"]');
        const passwordInput = loginForm.querySelector('input[placeholder="Password"]');
        const button = loginForm.querySelector('button[type="submit"]');

        const email = emailInput.value;
        const password = passwordInput.value;

        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
        button.disabled = true;

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (response.ok && data.redirect) {
                button.innerHTML = '<i class="fas fa-check"></i> Success!';
                window.location.href = data.redirect;
            } else {
                throw new Error(data.error || 'Login failed');
            }
        } catch (error) {
            button.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
            console.error('Login error:', error);
            alert(error.message || 'Login failed. Please try again.');
        } finally {
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
                button.disabled = false;
            }, 2000);
        }
    }

    // Handle user registration
    async function handleRegister(event) {
        event.preventDefault();
        const registerForm = document.getElementById('registerForm');
        const firstNameInput = registerForm.querySelector('input[placeholder="First Name"]');
        const lastNameInput = registerForm.querySelector('input[placeholder="Last Name"]');
        const emailInput = registerForm.querySelector('input[type="email"]');
        const passwordInput = registerForm.querySelector('input[type="password"]');
        const experienceLevelSelect = registerForm.querySelector('#level');
        const button = registerForm.querySelector('button[type="submit"]');

        const firstName = firstNameInput.value;
        const lastName = lastNameInput.value;
        const email = emailInput.value;
        const password = passwordInput.value;
        const experienceLevel = experienceLevelSelect.value;

        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        button.disabled = true;

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    experienceLevel
                })
            });

            const data = await response.json();

            if (response.ok) {
                button.innerHTML = '<i class="fas fa-check"></i> Success!';
                setTimeout(() => {
                    toggleForms();
                    alert('Registration successful! Please log in.');
                }, 1000);
            } else {
                throw new Error(data.error || 'Registration failed');
            }
        } catch (error) {
            button.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
            console.error('Registration error:', error);
            alert(error.message || 'Registration failed. Please try again.');
        } finally {
            setTimeout(() => {
                button.innerHTML = '<i class="fas fa-user-plus"></i> Sign Up';
                button.disabled = false;
            }, 2000);
        }
    }

    // Initialize Google Sign-In
    function initializeGoogleSignIn() {
        if (window.google && window.google.accounts) {
            google.accounts.id.initialize({
                client_id: '162085438786-uof1j1cssennhj0arv05vkcpa8i9t04b.apps.googleusercontent.com',
                callback: handleGoogleSignIn
            });
        }
    }

    // Attach event listeners
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const toggleButton = document.getElementById('toggleForm');
    const googleSignInLogin = document.getElementById('googleSignInLogin');
    const googleSignInRegister = document.getElementById('googleSignInRegister');

    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }

    if (toggleButton) {
        toggleButton.addEventListener('click', toggleForms);
    }

    document.addEventListener('DOMContentLoaded', () => {
        // Extract the email from the URL (provided by the backend during redirect)
        const email = new URLSearchParams(window.location.search).get('email');
        if (!email) {
            alert('Email is missing from the URL. Please try again.');
            return;
        }

        // Add event listeners to buttons
        document.querySelectorAll('.role-button').forEach(button => {
            button.addEventListener('click', () => {
                const experienceLevel = button.dataset.role; // "pro" or "rookie"

                // Send POST request to /api/set-role
                fetch('/api/set-role', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, experienceLevel })
                })
                    .then(response => {
                        if (!response.ok) {
                            return response.json().then(err => {
                                throw new Error(err.error || 'Failed to set role.');
                            });
                        }
                        return response.json();
                    })
                    .then(data => {
                        // Redirect user to the appropriate page
                        window.location.href = data.redirect;
                    })
                    .catch(error => {
                        console.error('Error:', error.message);
                        alert('An error occurred: ' + error.message);
                    });
            });
        });
    });


    // Initialize Google Sign-In
    initializeGoogleSignIn();

    // Render Google Sign-In buttons
    if (googleSignInLogin && window.google && window.google.accounts) {
        google.accounts.id.renderButton(
            googleSignInLogin,
            { theme: 'outline', size: 'large' }
        );
    }

    if (googleSignInRegister && window.google && window.google.accounts) {
        google.accounts.id.renderButton(
            googleSignInRegister,
            { theme: 'outline', size: 'large' }
        );
    }
});