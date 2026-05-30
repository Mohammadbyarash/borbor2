// ==========================================
//  log-in.js — لاگین با username + password
// ==========================================

const usernameInput  = document.getElementById('username');
const passwordInput  = document.getElementById('password');
const togglePassword = document.getElementById('togglePassword');
const loginForm      = document.getElementById('loginForm');
const submitBtn      = document.getElementById('submitBtn');
const alertError     = document.getElementById('alertError');
const alertSuccess   = document.getElementById('alertSuccess');

// نمایش / مخفی کردن رمز
if (togglePassword) {
    togglePassword.addEventListener('click', () => {
        const isPass = passwordInput.type === 'password';
        passwordInput.type = isPass ? 'text' : 'password';
        togglePassword.classList.toggle('fa-eye',      !isPass);
        togglePassword.classList.toggle('fa-eye-slash', isPass);
    });
}

// ─── اعتبارسنجی‌ها ───────────────────────────────────────
function validateUsername() {
    const val        = (usernameInput?.value || '').trim();
    const errorDiv   = document.getElementById('usernameError');
    const successDiv = document.getElementById('usernameSuccess');

    if (!val) {
        setFieldState(usernameInput, errorDiv, successDiv, 'error', 'لطفاً نام کاربری را وارد کنید');
        return false;
    }
    if (val.length < 3) {
        setFieldState(usernameInput, errorDiv, successDiv, 'error', 'نام کاربری باید حداقل ۳ کاراکتر باشد');
        return false;
    }
    setFieldState(usernameInput, errorDiv, successDiv, 'success');
    return true;
}

function validatePassword() {
    const val        = passwordInput?.value || '';
    const errorDiv   = document.getElementById('passwordError');
    const successDiv = document.getElementById('passwordSuccess');

    if (!val) {
        setFieldState(passwordInput, errorDiv, successDiv, 'error', 'لطفاً رمز عبور را وارد کنید');
        return false;
    }
    if (val.length < 4) {
        setFieldState(passwordInput, errorDiv, successDiv, 'error', 'رمز عبور باید حداقل ۴ کاراکتر باشد');
        return false;
    }
    setFieldState(passwordInput, errorDiv, successDiv, 'success');
    return true;
}

function setFieldState(input, errorDiv, successDiv, state, message = '') {
    if (!input) return;
    input.classList.toggle('error',   state === 'error');
    input.classList.toggle('success', state === 'success');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.classList.toggle('show', state === 'error');
    }
    if (successDiv) successDiv.classList.toggle('show', state === 'success');
}

function showAlert(type, message) {
    const isSuccess = type === 'success';
    alertSuccess?.classList.remove('show');
    alertError?.classList.remove('show');

    const alert  = isSuccess ? alertSuccess : alertError;
    const textEl = document.getElementById(isSuccess ? 'alertSuccessText' : 'alertErrorText');
    if (textEl) textEl.textContent = message;
    alert?.classList.add('show');

    setTimeout(() => alert?.classList.remove('show'), 5000);
}

// ─── ارسال فرم ───────────────────────────────────────────
if (loginForm) {
    usernameInput?.addEventListener('blur', validateUsername);
    passwordInput?.addEventListener('blur', validatePassword);

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (!validateUsername() | !validatePassword()) {
            showAlert('error', 'لطفاً فیلدها را به درستی پر کنید');
            return;
        }

        const username   = usernameInput.value.trim();
        const password   = passwordInput.value;
        const rememberMe = document.getElementById('rememberMe')?.checked ?? false;

        // حالت loading
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            const response = await fetch('../api/login.php', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ username, password, rememberMe })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // کوکی JS-readable برای auth.js
                const maxAge = rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 8;
                document.cookie = `borbor_auth=${encodeURIComponent(data.token)}; max-age=${maxAge}; path=/; SameSite=Strict`;

                const name = [data.user?.first_name, data.user?.last_name].filter(Boolean).join(' ');
                showAlert('success', `خوش آمدید${name ? ' ' + name : ''}! در حال انتقال...`);

                setTimeout(() => { window.location.href = 'dashbord.html'; }, 1500);

            } else {
                submitBtn.classList.remove('loading');
                submitBtn.disabled = false;
                showAlert('error', data.message || 'نام کاربری یا رمز عبور اشتباه است');
            }

        } catch (err) {
            console.error('خطا در ارتباط با سرور:', err);
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            showAlert('error', 'خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.');
        }
    });
}
