import router from '/static/js/router.js';
import { update_navbar } from '/static/js/navbar.js';

/**
 * Main entry point for OAuth flow and callback handling
 */
export function initOAuth() {
    const userAppContent = document.getElementById('user-app-content');
    if (!userAppContent) return;

    // Create the necessary DOM structure
    userAppContent.innerHTML = `
        <div class="oauth-container">
            <div id="loading-overlay" class="loading-overlay">
                <div class="loading-spinner"></div>
            </div>
            <div id="oauth-content">
                <h3>${gettext("42 OAuth Authentication")}</h3>
                <p id="oauth-status-message">${gettext("Preparing authentication...")}</p>
            </div>
            <!-- 2FA Verification Section -->
            <div id="2fa-verification" style="display: none;">
                <h3>${gettext("Two-Factor Authentication")}</h3>
                <p>${gettext("Please enter your 2FA code:")}</p>
                <input type="text" id="2fa-code" class="form-control" 
                       placeholder="${gettext("6-digit code")}"
                       maxlength="6" pattern="[0-9]*" inputmode="numeric">
                <button id="submit-2fa" class="btn btn-primary mt-3">${gettext("Verify")}</button>
                <button id="cancel-2fa" class="btn btn-secondary mt-3">${gettext("Cancel")}</button>
            </div>
            <div id="message-container"></div>
        </div>
    `;

    // Check if this is a callback or initial flow
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.has('code') || urlParams.has('error')) {
        handleOAuthCallback(urlParams);
    } else {
        startOAuthFlow();
    }
}

/**
 * Handles the initial OAuth authorization redirect
 */
async function startOAuthFlow() {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';
    
    document.getElementById('oauth-status-message').textContent = gettext("Redirecting to 42's authentication service...");
    
    try {
        const response = await fetch('/users/api/oauth/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.content || '',
                'X-Requested-With': 'XMLHttpRequest'
            },
        });

        const data = await response.json();
        if (response.ok && data.location) {
            window.location.href = data.location;
        } else {
            throw new Error(data.error || gettext('OAuth initialization failed'));
        }
    } catch (error) {
        loadingOverlay.style.display = 'none';
        document.getElementById('message-container').innerHTML = `
            <div class="alert alert-danger">
                ${gettext("Failed to initialize OAuth:")} ${error.message}
                <br>
                <a href="/login/" class="alert-link">${gettext("Back to Login")}</a>
            </div>
        `;
    }
}

/**
 * Handles the OAuth callback with the authorization code
 */
async function handleOAuthCallback(urlParams) {
    const loadingOverlay = document.getElementById('loading-overlay');
    loadingOverlay.style.display = 'flex';
    
    const oauthContent = document.getElementById('oauth-content');
    oauthContent.innerHTML = `
        <h3>${gettext("Completing Authentication")}</h3>
        <p>${gettext("Verifying your authentication with 42...")}</p>
    `;

    const code = urlParams.get('code');
    const error = urlParams.get('error');
    const state = urlParams.get('state');
    const errorDescription = urlParams.get('error_description');

    try {
        if (error) {
            throw new Error(error);
        }

        if (!code || !state) {
            throw new Error(gettext('Missing required OAuth parameters'));
        }

        const response = await fetch(`/users/api/oauth-callback/?code=${encodeURIComponent(code)}&state=${encodeURIComponent(state)}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.content || '',
                'X-Requested-With': 'XMLHttpRequest'
            },
        });

        const data = await response.json();
        
        if (response.ok) {
            if (data.requires_2fa) {
                show2FAForm(data.pre_auth_token, data.username);
            } else {
                handleLoginSuccess(data);
            }
        } else {
            throw new Error(data.error || gettext('OAuth authentication failed'));
        }
    } catch (error) {
        handleOAuthError(error, errorDescription);
    } finally {
        loadingOverlay.style.display = 'none';
    }
}

/**
 * Displays and handles the 2FA verification form
 */
function show2FAForm(preAuthToken, username) {
    document.getElementById('oauth-content').style.display = 'none';
    const twoFaSection = document.getElementById('2fa-verification');
    twoFaSection.style.display = 'block';

    // Clear any previous messages
    document.getElementById('message-container').innerHTML = '';
    
    // Reset the input field
    const codeInput = document.getElementById('2fa-code');
    codeInput.value = '';
    codeInput.focus();

    // Handle 2FA verification
    document.getElementById('submit-2fa').onclick = async () => {
        const code = codeInput.value;
        if (!code || code.length !== 6 || !/^\d{6}$/.test(code)) {
            document.getElementById('message-container').innerHTML = `
                <div class="alert alert-danger">
                    ${gettext("Please enter a valid 6-digit code")}
                </div>
            `;
            return;
        }

        document.getElementById('loading-overlay').style.display = 'flex';
        
        try {
            const response = await fetch('/users/api/2fa/verify/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': document.querySelector('meta[name="csrf-token"]')?.content || '',
                    'X-Requested-With': 'XMLHttpRequest'
                },
                body: JSON.stringify({
                    code,
                    pre_auth_token: preAuthToken,
                    username
                }),
            });

            const data = await response.json();
            if (data.success) {
                handleLoginSuccess(data);
            } else {
                document.getElementById('message-container').innerHTML = `
                    <div class="alert alert-danger">
                        ${data.message || gettext("Invalid 2FA code")}
                    </div>
                `;
                // Clear the input for retry
                codeInput.value = '';
                codeInput.focus();
            }
        } catch (error) {
            document.getElementById('message-container').innerHTML = `
                <div class="alert alert-danger">
                    ${gettext("Verification failed:")} ${error.message}
                </div>
            `;
        } finally {
            document.getElementById('loading-overlay').style.display = 'none';
        }
    };

    // Allow pressing Enter to submit
    codeInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            document.getElementById('submit-2fa').click();
        }
    });

    // Cancel button handler
    document.getElementById('cancel-2fa').onclick = () => {
        router.navigateTo('/login/');
    };
}

/**
 * Handles successful login/authentication
 */
function handleLoginSuccess(data) {
    // Set cookies if tokens are present
    if (data.access_token && data.refresh_token) {
        // Note: These will be set by the server with HttpOnly flag
        // This is just for completeness
        document.cookie = `access_token=${data.access_token}; Path=/; Secure; SameSite=Lax`;
        document.cookie = `refresh_token=${data.refresh_token}; Path=/; Secure; SameSite=Lax`;
    }
    
    // Update CSRF token
    if (data.csrf_token) {
        const csrfMeta = document.querySelector('meta[name="csrf-token"]');
        if (csrfMeta) {
            csrfMeta.content = data.csrf_token;
        }
    }
    
    // Update username token if present
    if (data.username) {
        const usernameMeta = document.querySelector('meta[name="username-token"]');
        if (usernameMeta) {
            usernameMeta.content = data.username;
        }
    }

    // Show success message briefly
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `
        <div class="alert alert-success">
            ${gettext("Login successful! Redirecting to dashboard...")}
        </div>
    `;

    // Update UI and navigate
    setTimeout(() => {
        update_navbar();
        router.navigateTo('/dashboard/');
    }, 500);
}

/**
 * Handles OAuth errors
 */
function handleOAuthError(error, errorDescription) {
    // Hide other content
    document.getElementById('oauth-content').style.display = 'none';
    document.getElementById('2fa-verification').style.display = 'none';
    
    // Display error message
    const messageContainer = document.getElementById('message-container');
    messageContainer.innerHTML = `
        <div class="alert alert-danger">
            <h4>${gettext("Authentication Error")}</h4>
            <p>${error.message || error}</p>
            ${errorDescription ? `<p>${errorDescription}</p>` : ''}
            <a href="/login/" class="alert-link">${gettext("Back to Login")}</a>
        </div>
    `;
}

/**
 * Entry point for OAuth flow route
 */
export function oauth_flow() {
    initOAuth();
}

/**
 * Entry point for OAuth callback route
 */
export function oauth_callback() {
    initOAuth();
}