/**
 * Login & Auth Handler
 */

function initAuth() {
    google.accounts.id.initialize({
        client_id: CONFIG.GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse
    });
    
    google.accounts.id.renderButton(
        document.getElementById("google-login-btn"),
        { theme: "outline", size: "large", width: 280 }
    );
}

async function handleCredentialResponse(response) {
    const responsePayload = decodeJwtResponse(response.credential);
    const email = responsePayload.email;

    showLoading(true);
    try {
        const result = await callAPI("auth", { email: email });
        
        if (result.status === "success") {
            sessionStorage.setItem("ufix_user", JSON.stringify(result.user));
            showMainApp();
        } else {
            document.getElementById("login-error").innerText = result.message || "Access Denied";
        }
    } catch (err) {
        document.getElementById("login-error").innerText = "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์";
    } finally {
        showLoading(false);
    }
}

function decodeJwtResponse(token) {
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    let jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

function checkSession() {
    const user = sessionStorage.getItem("ufix_user");
    if (user) {
        showMainApp();
    } else {
        document.getElementById("login-screen").classList.add("active");
        initAuth();
    }
}

function logout() {
    sessionStorage.removeItem("ufix_user");
    location.reload();
}

function showMainApp() {
    const user = JSON.parse(sessionStorage.getItem("ufix_user"));
    document.getElementById("user-email").innerText = user.email;
    document.getElementById("login-screen").classList.remove("active");
    document.getElementById("main-layout").classList.add("active");
    loadDashboard();
}
