/**
 * sidebar-permissions.js
 * فقط یه بار به سرور درخواست می‌زنه و آیتم‌های ساید‌بار رو بر اساس دسترسی مخفی می‌کنه
 */
(function () {
    var API = '/borbor/api/get-sidebar-permissions.php';

    var publicPages = ['landing','login','mobile-login','sign-up','Signup',
                       'otp','forgot_password','Reset_password','welcome',
                       'pending','delete_account',''];

    var currentPage = window.location.pathname.split('/').pop().replace('.html','');
    if (publicPages.indexOf(currentPage) !== -1) return;

    function extractPage(href) {
        return href.split('/').pop().replace('.html','');
    }

    function hideEmptyParentMenus() {
        document.querySelectorAll('.menu-item.has-submenu').forEach(function (menuItem) {
            var submenu = menuItem.querySelector('.submenu');
            if (!submenu) return;
            var visible = submenu.querySelectorAll('.submenu-item:not([style*="display: none"])');
            if (visible.length === 0) menuItem.style.display = 'none';
        });
    }

    fetch(API, { method: 'GET', credentials: 'include' })
        .then(function (r) { return r.json(); })
        .then(function (data) {
            if (data.all) return; // owner/manager همه رو می‌بینن

            var allowed = data.allowed || [];

            document.querySelectorAll('.sidebar a[href]').forEach(function (link) {
                var href = link.getAttribute('href');
                if (!href || href === '#' || href === '' || href.indexOf('logout') !== -1) return;

                var page = extractPage(href);
                if (!page || allowed.indexOf(page) !== -1) return;

                // دسترسی نداره → مخفی کن
                var target = link.closest('.submenu-item') || link.closest('.menu-item');
                if (target) target.style.display = 'none';
            });

            hideEmptyParentMenus();
        })
        .catch(function () { /* fail-open */ });
})();