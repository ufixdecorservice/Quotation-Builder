/**
 * UFIX Quotation Builder - Authentication System (Frontend)
 */

const AuthSystem = {
    // Session Keys
    KEY_USER: 'ufix_username',
    KEY_TOKEN: 'ufix_token',
    KEY_ROLE: 'ufix_role',

    init() {
        // If not logged in and not on login page, redirect to login (or show modal)
        if (!this.isLoggedIn() && !window.location.pathname.includes('login.html')) {
            // In this specific app, we use a simple modal overlay if not logged in
            this.showLoginOverlay();
        }
    },

    isLoggedIn() {
        return !!localStorage.getItem(this.KEY_TOKEN);
    },

    getUser() {
        return localStorage.getItem(this.KEY_USER);
    },

    getToken() {
        return localStorage.getItem(this.KEY_TOKEN);
    },

    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    },

    async login(username, password) {
        const passwordHash = await this.hashPassword(password);
        
        try {
            const result = await GSheetAPI.call('login', { username, password: passwordHash });
            if (result.success) {
                localStorage.setItem(this.KEY_USER, username);
                localStorage.setItem(this.KEY_TOKEN, result.token);
                localStorage.setItem(this.KEY_ROLE, result.role);
                return { success: true };
            } else {
                return { success: false, message: result.message };
            }
        } catch (err) {
            return { success: false, message: 'Connection error' };
        }
    },

    logout() {
        localStorage.clear();
        window.location.reload();
    },

    showLoginOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'auth-overlay';
        overlay.style = 'position:fixed; z-index:10000; left:0; top:0; width:100%; height:100%; background:rgba(0,0,0,0.8); display:flex; align-items:center; justify-content:center; backdrop-filter:blur(5px);';
        
        overlay.innerHTML = `
            <div style="background:white; padding:40px; border-radius:15px; width:100%; max-width:400px; box-shadow:0 20px 25px -5px rgba(0,0,0,0.2);">
                <div style="text-align:center; margin-bottom:30px;">
                    <h2 style="margin:0; color:var(--primary-color);"><i class="fas fa-lock"></i> UFIX Access Control</h2>
                    <p style="color:#718096; font-size:0.9rem;">กรุณาเข้าสู่ระบบเพื่อใช้งาน</p>
                </div>
                <div style="margin-bottom:15px;">
                    <label style="display:block; margin-bottom:5px; font-size:0.85rem; font-weight:600;">ชื่อผู้ใช้งาน</label>
                    <input type="text" id="auth-user" style="width:100%; padding:10px; border:1.5px solid #e2e8f0; border-radius:8px;">
                </div>
                <div style="margin-bottom:25px;">
                    <label style="display:block; margin-bottom:5px; font-size:0.85rem; font-weight:600;">รหัสผ่าน</label>
                    <input type="password" id="auth-pass" style="width:100%; padding:10px; border:1.5px solid #e2e8f0; border-radius:8px;">
                </div>
                <button id="btn-auth-login" class="btn btn-primary" style="width:100%; padding:12px;">เข้าสู่ระบบ</button>
                <div id="auth-error" style="color:red; font-size:0.8rem; margin-top:15px; text-align:center; display:none;"></div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('btn-auth-login').onclick = async () => {
            const u = document.getElementById('auth-user').value;
            const p = document.getElementById('auth-pass').value;
            const err = document.getElementById('auth-error');
            
            const btn = document.getElementById('btn-auth-login');
            btn.disabled = true;
            btn.innerText = 'กำลังตรวจสอบ...';

            const res = await this.login(u, p);
            if (res.success) {
                window.location.reload();
            } else {
                err.innerText = res.message;
                err.style.display = 'block';
                btn.disabled = false;
                btn.innerText = 'เข้าสู่ระบบ';
            }
        };
    }
};

// Auto init
document.addEventListener('DOMContentLoaded', () => AuthSystem.init());
