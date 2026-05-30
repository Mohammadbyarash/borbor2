// ==================== SIDEBAR MENU ====================
document.addEventListener('DOMContentLoaded', function () {

    const menuItems = document.querySelectorAll('.menu-item.has-submenu');

    menuItems.forEach(function (item) {
        const menuLink = item.querySelector('.menu-link');

        if (menuLink) {
            menuLink.addEventListener('click', function (e) {
                e.preventDefault();

                // بقیه منوها رو ببند - فقط open رو بردار
                menuItems.forEach(function (otherItem) {
                    if (otherItem !== item) {
                        otherItem.classList.remove('open');
                    }
                });

                // فقط open رو toggle کن - به active کاری نداشته باش
                item.classList.toggle('open');
            });
        }
    });

    // زیرمنوها
    document.querySelectorAll('.submenu-item').forEach(function (subItem) {
        subItem.addEventListener('click', function () {
            document.querySelectorAll('.submenu-item').forEach(function (si) {
                si.classList.remove('active');
            });
            this.classList.add('active');
        });
    });

    // همبرگر منو
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (menuToggle && sidebar && overlay) {
        menuToggle.addEventListener('click', function () {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
        });

        overlay.addEventListener('click', function () {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
        });
    }
});