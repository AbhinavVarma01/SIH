window.onload = function () {
    google.accounts.id.initialize({
        client_id: '162085438786-uof1j1cssennhj0arv05vkcpa8i9t04b.apps.googleusercontent.com',
        callback: handleGoogleSignIn
    });
};

// Toggle between login and register forms
function toggleForms() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');

    loginForm.classList.toggle('hidden');
    registerForm.classList.toggle('hidden');

    document.querySelectorAll('form').forEach(form => form.reset());
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.querySelector('#loginForm input[type="email"]').value;
    const password = document.querySelector('#loginForm input[type="password"]').value;
    const experienceLevel = document.querySelector('#loginForm select').value;
    const button = event.target.querySelector('button[type="submit"]');
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Signing in...';
    button.disabled = true;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password, experienceLevel })
        });

        if (response.ok) {
            button.innerHTML = '<i class="fas fa-check"></i> Success!';
            setTimeout(() => {
                window.location.href = `/${experienceLevel}/dashboard`;
            }, 1000);
        } else {
            throw new Error('Login failed');
        }
    } catch (error) {
        button.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
        alert('Login failed. Please try again.');
    } finally {
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-sign-in-alt"></i> Sign In';
            button.disabled = false;
        }, 2000);
    }
}


async function handleRegister(event) {
    event.preventDefault();
    const firstName = document.querySelector('#registerForm input[placeholder="First Name"]').value;
    const lastName = document.querySelector('#registerForm input[placeholder="Last Name"]').value;
    const email = document.querySelector('#registerForm input[type="email"]').value;
    const password = document.querySelector('#registerForm input[type="password"]').value;
    const experienceLevel = document.querySelector('#level').value;

    const button = event.target.querySelector('button[type="submit"]');
    button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
    button.disabled = true;

    try {
        const response = await fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ firstName, lastName, email, password, experienceLevel })
        });

        if (response.ok) {
            button.innerHTML = '<i class="fas fa-check"></i> Success!';
            setTimeout(() => {
                toggleForms();
                alert('Registration successful! Please log in.');
            }, 1000);
        } else {
            throw new Error('Registration failed');
        }
    } catch (error) {
        button.innerHTML = '<i class="fas fa-exclamation-circle"></i> Error';
        alert('Registration failed. Please try again.');
    } finally {
        setTimeout(() => {
            button.innerHTML = '<i class="fas fa-user-plus"></i> Sign Up';
            button.disabled = false;
        }, 2000);
    }
}

async function handleLogin(event) {
    event.preventDefault();
    const email = document.querySelector('#loginForm input[placeholder="Email"]').value;
    const password = document.querySelector('#loginForm input[placeholder="Password"]').value;

    const response = await fetch('/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });

    const data = await response.json();
    if (response.ok) {
        alert('Login successful');
        // Redirect or update UI
    } else {
        alert(`Login failed: ${data.error}`);
    }
}


// Google Sign-In callback for login
function handleGoogleLogin(response) {
    console.log('Google login response:', response);
    if (response.credential) {

        const userData = response.credential;

        console.log('User data:', userData);

        console.log('Logging in user with Google account...');

        window.location.href = 'beginner.html';
    }
}

function handleGoogleRegister(response) {
    console.log('Google registration response:', response);
    if (response.credential) {

        const userData = response.credential;

        console.log('User data:', userData);
        console.log('Registering user with Google account...');

        window.location.href = 'login.html';
    }
}


function initializeGoogleSignIn() {
    google.accounts.id.initialize({
        client_id: '162085438786-uof1j1cssennhj0arv05vkcpa8i9t04b.apps.googleusercontent.com',  // Replace with your actual client ID
        callback: handleGoogleLogin
    });

    google.accounts.id.renderButton(
        document.getElementById('googleSignInLogin'),
        { theme: 'outline', size: 'large' }
    );
}

function initializeGoogleRegister() {
    google.accounts.id.initialize({
        client_id: '162085438786-uof1j1cssennhj0arv05vkcpa8i9t04b.apps.googleusercontent.com',  // Replace with your actual client ID
        callback: handleGoogleRegister
    });

    google.accounts.id.renderButton(
        document.getElementById('googleSignInRegister'),
        { theme: 'outline', size: 'large' }
    );
}

document.getElementById('googleSignInLogin').addEventListener('click', initializeGoogleSignIn);
document.getElementById('googleSignInRegister').addEventListener('click', initializeGoogleRegister);
document.getElementById('loginForm').classList.toggle('hidden');
document.getElementById('registerForm').classList.toggle('hidden');
