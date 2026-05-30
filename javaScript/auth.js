/**
 * auth.js - محافظ احراز هویت
 * این فایل را در تمام صفحات داشبورد اضافه کنید
 */
(function () {
    function getCookie(name) {
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [key, val] = cookie.trim().split('=');
            if (key === name) return decodeURIComponent(val || '');
        }
        return null;
    }

    const authToken = getCookie('borbor_auth');
    if (!authToken) {
        window.location.replace('../html/landing.html');
    }
})();