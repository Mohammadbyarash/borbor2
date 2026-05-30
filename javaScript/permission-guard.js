/**
 * permission-guard.js
 * این فایل را بعد از auth.js در هر صفحه داشبورد اضافه کنید
 */
(function () {
    var API = '/borbor/api/check-page-permission.php';

    var pageName = window.location.pathname
        .split('/').pop()
        .replace('.html', '');

    var publicPages = ['landing', 'login', 'mobile-login', 'sign-up', 'Signup',
                       'otp', 'forgot_password', 'Reset_password', 'welcome',
                       'pending', 'delete_account', ''];
    if (publicPages.indexOf(pageName) !== -1) return;

    document.documentElement.style.visibility = 'hidden';

    // اگه سرور در ۵ ثانیه جواب نداد، صفحه رو نشون بده
    var timeoutId = setTimeout(function () {
        document.documentElement.style.visibility = '';
    }, 5000);

    var controller = window.AbortController ? new AbortController() : null;
    var signal = controller ? controller.signal : undefined;

    // بعد از ۴ ثانیه request رو cancel کن
    var abortId = controller ? setTimeout(function () {
        controller.abort();
    }, 4000) : null;

    fetch(API + '?page=' + encodeURIComponent(pageName), {
        method: 'GET',
        credentials: 'include',
        signal: signal
    })
    .then(function (r) { return r.json(); })
    .then(function (data) {
        clearTimeout(timeoutId);
        if (abortId) clearTimeout(abortId);
        if (data.allowed) {
            document.documentElement.style.visibility = '';
        } else {
            window.location.replace('../html/no-access.html');
        }
    })
    .catch(function () {
        clearTimeout(timeoutId);
        if (abortId) clearTimeout(abortId);
        // اگه خطا یا timeout بود، صفحه رو نشون بده
        document.documentElement.style.visibility = '';
    });
})();