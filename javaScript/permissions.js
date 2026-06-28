// ==================== HAMBURGER MENU ====================
const menuToggle = document.getElementById("menuToggle");
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");
if (menuToggle) menuToggle.addEventListener("click", function () { sidebar.classList.toggle("active"); sidebarOverlay.classList.toggle("active"); });
if (sidebarOverlay) sidebarOverlay.addEventListener("click", function () { sidebar.classList.remove("active"); sidebarOverlay.classList.remove("active"); });

// ==================== LOADER ====================
function showLoader() {
    var existing = document.getElementById('pageLoader'); if (existing) return;
    var loader = document.createElement('div'); loader.id = 'pageLoader';
    loader.innerHTML = '<div class="loader-spinner"></div><div class="loader-text">در حال بارگذاری...</div>';
    loader.style.cssText = 'position:fixed;inset:0;background:#0f1b3d;display:flex;flex-direction:column;align-items:center;justify-content:center;z-index:9999;gap:18px;transition:opacity 0.5s ease;';
    var style = document.createElement('style');
    style.textContent = '.loader-spinner{width:58px;height:58px;border:5px solid rgba(255,255,255,0.12);border-top-color:#4da3ff;border-radius:50%;animation:lspin 0.85s linear infinite}@keyframes lspin{to{transform:rotate(360deg)}}.loader-text{color:#c8d8f0;font-family:Vazirmatn,sans-serif;font-size:15px}#pageLoader.hide{opacity:0;pointer-events:none}';
    document.head.appendChild(style); document.body.appendChild(loader);
}
function hideLoader() {
    var loader = document.getElementById('pageLoader'); if (!loader) return;
    loader.classList.add('hide');
    setTimeout(function () { if (loader.parentNode) loader.parentNode.removeChild(loader); }, 550);
}

// ==================== STATE ====================
var API         = '/borbor/api/perms.php';
var permissions = [];
var isOwner     = false;
// userLevel: سطح دسترسی کاربر جاری به صفحه permissions
// none  → فقط مشاهده (اگه اصلاً دسترسی دارن)
// read  → فقط مشاهده، نمی‌تونن هیچ دکمه‌ای بزنن
// write → می‌تونن access level ها رو تغییر بدن
// both  → هم می‌تونن ببینن هم تغییر بدن
var userLevel   = 'none';

function canWrite() { return isOwner || userLevel === 'write' || userLevel === 'both'; }
function canRead()  { return isOwner || userLevel === 'read'  || userLevel === 'write' || userLevel === 'both'; }
// وقتی read داره ولی write نداره: فقط مشاهده، بدون تغییر
function readOnly() { return !isOwner && (userLevel === 'read'); }

// ==================== API HELPERS ====================
function apiGet() {
    return fetch(API, { method: 'GET', credentials: 'include' }).then(function(r) {
        if (!r.ok) throw new Error('خطای سرور: ' + r.status);
        return r.json();
    });
}
function apiPost(payload) {
    return fetch(API, { method: 'POST', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) }).then(function(r) {
        if (!r.ok) return r.json().then(function(d){ throw new Error(d.message || 'خطای سرور'); });
        return r.json();
    });
}
function apiPut(payload) {
    return fetch(API, { method: 'PUT', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) }).then(function(r) {
        if (!r.ok) return r.json().then(function(d){ throw new Error(d.message || 'خطای سرور'); });
        return r.json();
    });
}
function apiDelete(id) {
    return fetch(API, { method: 'DELETE', credentials: 'include', headers: {'Content-Type':'application/json'}, body: JSON.stringify({id:id}) }).then(function(r) {
        if (!r.ok) return r.json().then(function(d){ throw new Error(d.message || 'خطای سرور'); });
        return r.json();
    });
}

// ==================== FETCH ====================
function fetchPermissions() {
    showLoader();
    apiGet().then(function(data) {
        if (!data.success) throw new Error(data.message || 'خطا');
        permissions = data.data || [];
        isOwner     = data.is_owner || false;
        userLevel   = data.user_level || 'none';

        if (data.admin && data.admin.name) {
            var el = document.getElementById('adminInfoDisplay');
            if (el) el.textContent = (data.admin.role ? data.admin.role + ': ' : '') + data.admin.name;
        }

        // نمایش/مخفی کردن دکمه ایجاد بر اساس دسترسی
        var createBtn = document.getElementById('createPermissionBtn');
        if (createBtn) createBtn.style.display = (isOwner || canWrite()) ? '' : 'none';
        // مخفی کردن action-row (ردیف دکمه ایجاد) وقتی فقط read داره
        var actionRow = document.querySelector('.action-row');
        if (actionRow) actionRow.style.display = (isOwner || canWrite()) ? '' : 'none';

        renderPermissionsTable();
        updateStatistics();
        hideLoader();
    }).catch(function(err) {
        hideLoader();
        showToast(err.message || 'خطا در بارگذاری', 'error');
    });
}

// ==================== RENDER TABLE ====================
function renderPermissionsTable() {
    var tbody = document.getElementById("permissionsTableBody");
    if (!tbody) return;
    tbody.innerHTML = "";

    var search  = (document.getElementById('permissionSearch')  ? document.getElementById('permissionSearch').value  : '').toLowerCase();
    var roleF   = (document.getElementById('roleFilter')         ? document.getElementById('roleFilter').value         : '');
    var accessF = (document.getElementById('accessTypeFilter')   ? document.getElementById('accessTypeFilter').value   : '');

    var filtered = permissions.filter(function(p) {
        var matchSearch = !search || p.name.toLowerCase().includes(search) || (p.category||'').toLowerCase().includes(search);
        var matchRole   = !roleF  || hasRoleAccess(p, roleF);
        var matchAccess = !accessF || hasAccessType(p, accessF);
        return matchSearch && matchRole && matchAccess;
    });

    if (filtered.length === 0) {
        tbody.innerHTML = '<div style="text-align:center;padding:50px;color:rgba(255,255,255,0.5);grid-column:1/-1"><i class="fas fa-shield-alt" style="font-size:40px;display:block;margin-bottom:12px"></i><p>هیچ دسترسی یافت نشد</p></div>';
        updateStatistics(); return;
    }

    filtered.forEach(function(permission) {
        var row = document.createElement("div");
        var rowClass = "permission-row";
        if (permission.is_locked)     rowClass += " locked-row";
        if (permission.is_owner_only) rowClass += " owner-only-row";
        row.className = rowClass;
        row.setAttribute("data-permission-id", permission.id);

        // ── badge های قفل و owner-only ──
        var lockBadge  = permission.is_locked
            ? '<span class="lock-badge"><i class="fas fa-lock"></i> قفل</span>' : '';
        var ownerBadge = permission.is_owner_only
            ? '<span class="owner-only-badge"><i class="fas fa-crown"></i> مدیر ارشد</span>' : '';

        // ── دکمه‌های عملیات (ستون دوم) ──
        var actionBtns = '';
        if (isOwner) {
            // owner: دکمه قفل + دکمه crown + دکمه حذف (اگه owner_only نباشه)
            actionBtns += '<button class="lock-toggle-btn ' + (permission.is_locked ? 'locked' : 'unlocked') + '" onclick="toggleLock(' + permission.id + ')" title="' + (permission.is_locked ? 'برداشتن قفل' : 'قفل کردن') + '"><i class="fas fa-' + (permission.is_locked ? 'lock' : 'lock-open') + '"></i></button>';
            actionBtns += '<button class="owner-only-btn ' + (permission.is_owner_only ? 'active' : '') + '" onclick="toggleOwnerOnly(' + permission.id + ')" title="' + (permission.is_owner_only ? 'برداشتن قفل مدیر ارشد' : 'قفل مدیر ارشد') + '"><i class="fas fa-crown"></i></button>';
            if (!permission.is_owner_only) {
                actionBtns += '<button class="delete-perm-btn" onclick="deletePermission(' + permission.id + ')" title="حذف"><i class="fas fa-trash"></i></button>';
            }
        } else if (canWrite() && !permission.is_locked && !permission.is_owner_only) {
            // کسی که write داره: فقط حذف (نه قفل، نه crown)
            actionBtns += '<button class="delete-perm-btn" onclick="deletePermission(' + permission.id + ')" title="حذف"><i class="fas fa-trash"></i></button>';
        } else if (permission.is_locked) {
            // قفل شده: نمایش آیکون قفل
            actionBtns = '<span class="lock-badge-sm"><i class="fas fa-lock"></i></span>';
        }

        row.innerHTML =
            '<div class="permission-name-cell">' +
                '<div class="perm-name-row">' +
                    '<button class="permission-info-btn" onclick="openExplanationModal(' + permission.id + ')"><i class="fas fa-info"></i></button>' +
                    '<span class="permission-name">' + permission.name + '</span>' +
                    lockBadge + ownerBadge +
                '</div>' +
                '<span class="perm-category-badge">' + (permission.category || '') + '</span>' +
            '</div>' +
            '<div class="explanation-cell">' + actionBtns + '</div>' +
            buildRoleCell(permission, 'teacher') +
            buildRoleCell(permission, 'vice_principal') +
            buildRoleCell(permission, 'student');

        tbody.appendChild(row);
    });

    updateStatistics();
}

// ==================== BUILD ROLE CELL ====================
function buildRoleCell(permission, role) {
    var access   = permission.roles[role] || 'none';
    var hasRead  = (access === 'read'  || access === 'both');
    var hasWrite = (access === 'write' || access === 'both');

    // آیا این سلول قابل تغییر است؟
    // شرط: کاربر جاری write داره AND پرمیشن قفل نشده
    var editable = canWrite() && !permission.is_locked && !(permission.is_owner_only && !isOwner);
    var dis      = editable ? '' : ' disabled';
    var tooltip  = '';
    if (!editable) {
        if (permission.is_owner_only && !isOwner) tooltip = ' title="قفل مدیر ارشد"';
        else if (permission.is_locked)             tooltip = ' title="این دسترسی قفل شده است"';
        else                                       tooltip = ' title="دسترسی ویرایش ندارید"';
    }

    var clickRead  = editable ? ' onclick="toggleBit(' + permission.id + ',\'' + role + '\',\'read\')"'  : '';
    var clickWrite = editable ? ' onclick="toggleBit(' + permission.id + ',\'' + role + '\',\'write\')"' : '';
    var clickBoth  = editable ? ' onclick="toggleBoth(' + permission.id + ',\'' + role + '\')"'          : '';

    // برچسب وضعیت فعلی
    var stateLabel = '';
    if (access === 'none')  stateLabel = '<span class="access-state-none">بدون دسترسی</span>';
    if (access === 'read')  stateLabel = '<span class="access-state-read"><i class="fas fa-eye"></i> فقط خواندن</span>';
    if (access === 'write') stateLabel = '<span class="access-state-write"><i class="fas fa-pen"></i> فقط نوشتن</span>';
    if (access === 'both')  stateLabel = '<span class="access-state-both"><i class="fas fa-check-double"></i> خواندن و نوشتن</span>';

    var roleLabels = { 'teacher':'معلمین', 'vice_principal':'معاونین', 'student':'دانش‌آموزان' };
    return '<div class="role-cell" data-role="' + (roleLabels[role] || role) + '">' +
        '<div class="access-control">' +
            '<div class="access-btn-group">' +
                '<button class="access-btn read '  + (hasRead  ? 'active' : '') + '"' + dis + tooltip + clickRead  + '><i class="fas fa-eye"></i> خواندن</button>' +
                '<button class="access-btn write ' + (hasWrite ? 'active' : '') + '"' + dis + tooltip + clickWrite + '><i class="fas fa-pen"></i> نوشتن</button>' +
            '</div>' +
            '<button class="access-btn both ' + (access === 'both' ? 'active' : '') + '"' + dis + tooltip + clickBoth + '><i class="fas fa-check-double"></i> هر دو</button>' +
        '</div>' +
    '</div>';
}

// ==================== TOGGLE LOCK ====================
function toggleLock(permId) {
    if (!isOwner) { showToast('فقط مدیر ارشد می‌تواند قفل را تغییر دهد', 'error'); return; }
    apiPost({ action: 'toggle_lock', id: permId })
        .then(function(data) {
            if (!data.success) throw new Error(data.message);
            var p = getById(permId);
            if (p) p.is_locked = data.is_locked;
            renderPermissionsTable();
            showToast(data.message, 'success');
        }).catch(function(err) { showToast(err.message || 'خطا', 'error'); });
}

// ==================== TOGGLE OWNER ONLY ====================
function toggleOwnerOnly(permId) {
    if (!isOwner) { showToast('فقط مدیر ارشد می‌تواند این تنظیم را تغییر دهد', 'error'); return; }
    apiPost({ action: 'toggle_owner_only', id: permId })
        .then(function(data) {
            if (!data.success) throw new Error(data.message);
            var p = getById(permId);
            if (p) p.is_owner_only = data.is_owner_only;
            renderPermissionsTable();
            showToast(data.message, 'success');
        }).catch(function(err) { showToast(err.message || 'خطا', 'error'); });
}

// ==================== TOGGLE ACCESS BITS ====================
function toggleBit(permId, role, bit) {
    if (!canWrite()) { showToast('دسترسی ویرایش ندارید', 'error'); return; }
    var permission = getById(permId);
    if (!permission) return;
    if (!isOwner && (permission.is_owner_only || permission.is_locked)) {
        showToast(permission.is_owner_only ? 'قفل مدیر ارشد فعال است' : 'این دسترسی قفل شده است', 'error');
        return;
    }
    var cur = permission.roles[role] || 'none';
    var hasRead  = (cur === 'read'  || cur === 'both');
    var hasWrite = (cur === 'write' || cur === 'both');
    if (bit === 'read')  hasRead  = !hasRead;
    if (bit === 'write') hasWrite = !hasWrite;
    if       (hasRead &&  hasWrite) permission.roles[role] = 'both';
    else if  (hasRead && !hasWrite) permission.roles[role] = 'read';
    else if (!hasRead &&  hasWrite) permission.roles[role] = 'write';
    else                            permission.roles[role] = 'none';
    saveAccessChange(permission);
}

function toggleBoth(permId, role) {
    if (!canWrite()) { showToast('دسترسی ویرایش ندارید', 'error'); return; }
    var permission = getById(permId);
    if (!permission) return;
    if (!isOwner && (permission.is_owner_only || permission.is_locked)) {
        showToast(permission.is_owner_only ? 'قفل مدیر ارشد فعال است' : 'این دسترسی قفل شده است', 'error');
        return;
    }
    permission.roles[role] = (permission.roles[role] === 'both') ? 'none' : 'both';
    saveAccessChange(permission);
}

function saveAccessChange(permission) {
    renderPermissionsTable();
    apiPut({
        id:                    permission.id,
        teacher_access:        permission.roles.teacher,
        vice_principal_access: permission.roles.vice_principal,
        student_access:        permission.roles.student
    }).then(function(data) {
        if (!data.success) throw new Error(data.message);
    }).catch(function(err) { showToast(err.message || 'خطا در ذخیره', 'error'); fetchPermissions(); });
}

// ==================== DELETE ====================
function deletePermission(permId) {
    if (!canWrite() && !isOwner) { showToast('دسترسی ویرایش ندارید', 'error'); return; }
    var p = getById(permId);
    if (!p) return;
    if (!isOwner && p.is_owner_only) { showToast('این دسترسی فقط توسط مدیر ارشد قابل حذف است', 'error'); return; }
    if (!isOwner && p.is_locked)     { showToast('دسترسی قفل شده و قابل حذف نیست', 'error'); return; }
    var nameEl = document.getElementById('deletePermissionName');
    if (nameEl) nameEl.textContent = p.name;
    var confirmBtn = document.getElementById('deleteConfirmBtn');
    if (confirmBtn) {
        confirmBtn.onclick = function () {
            closeDeleteModal();
            apiDelete(permId).then(function(data) {
                if (!data.success) throw new Error(data.message);
                permissions = permissions.filter(function(x){ return x.id !== permId; });
                renderPermissionsTable();
                showToast('دسترسی حذف شد', 'success');
            }).catch(function(err){ showToast(err.message || 'خطا در حذف', 'error'); });
        };
    }
    document.getElementById('deleteConfirmModal').classList.add('active');
}
function closeDeleteModal() { var dm = document.getElementById('deleteConfirmModal'); if (dm) dm.classList.remove('active'); }

// ==================== EXPLANATION MODAL ====================
function openExplanationModal(permId) {
    var p = getById(permId);
    if (!p) return;
    document.getElementById("explanationName").textContent        = p.name;
    document.getElementById("explanationCategory").textContent    = p.category || '-';
    document.getElementById("explanationDescription").textContent = p.description || '-';

    var el;
    el = document.getElementById("explanationFunction"); if (el) el.textContent = p.func || p.description || '-';
    el = document.getElementById("explanationWarning");  if (el) el.textContent = p.warning || '-';
    el = document.getElementById("explanationExample");  if (el) el.textContent = p.example || '-';

    var createdByEl = document.getElementById('explanationCreatedBy');
    var createdWrap = document.getElementById('explanationCreatedByWrap');
    if (createdByEl) createdByEl.textContent = p.created_by_name || '-';
    if (createdWrap) createdWrap.style.display = p.created_by_name ? '' : 'none';

    var lockedByEl = document.getElementById('explanationLockedBy');
    var lockedWrap = document.getElementById('explanationLockedByWrap');
    if (lockedByEl) lockedByEl.textContent = p.locked_by_name || '-';
    if (lockedWrap) lockedWrap.style.display = (p.is_locked && p.locked_by_name) ? '' : 'none';

    var ownerWrap = document.getElementById('explanationOwnerOnlyWrap');
    if (ownerWrap) ownerWrap.style.display = p.is_owner_only ? '' : 'none';

    document.getElementById("explanationModal").classList.add("active");
}
function closeExplanationModal() { document.getElementById("explanationModal").classList.remove("active"); }

// ==================== CREATE PERMISSION MODAL ====================
function openCreatePermissionModal() {
    if (!canWrite() && !isOwner) { showToast('دسترسی ایجاد پرمیشن ندارید', 'error'); return; }
    ['newPermissionName','newPermissionCategory','newPermissionDescription',
     'newPermissionFunction','newPermissionWarning','newPermissionExample'].forEach(function(id) {
        var el = document.getElementById(id); if (el) el.value = '';
    });
    var vp = document.getElementById('defaultAccessVicePrincipal'); if (vp) vp.value = 'both';
    ['defaultAccessTeacher','defaultAccessStudent'].forEach(function(id){
        var el = document.getElementById(id); if (el) el.value = 'none';
    });
    var ownerWrap = document.getElementById('ownerOnlyFieldWrap');
    if (ownerWrap) ownerWrap.style.display = isOwner ? '' : 'none';
    var cb = document.getElementById('newPermissionOwnerOnly');
    if (cb) cb.checked = false;
    document.getElementById("createPermissionModal").classList.add("active");
}
function closeCreatePermissionModal() { document.getElementById("createPermissionModal").classList.remove("active"); }

function createNewPermission() {
    var name     = (document.getElementById("newPermissionName").value        || '').trim();
    var category = (document.getElementById("newPermissionCategory").value    || '').trim();
    var desc     = (document.getElementById("newPermissionDescription").value || '').trim();
    if (!name || !category || !desc) { showToast('نام، دسته‌بندی و توضیحات الزامی است!', 'error'); return; }

    var teacherA = document.getElementById("defaultAccessTeacher").value;
    var vpA      = document.getElementById("defaultAccessVicePrincipal").value;
    var studentA = document.getElementById("defaultAccessStudent").value;
    var ownerOnly = (document.getElementById("newPermissionOwnerOnly") && document.getElementById("newPermissionOwnerOnly").checked) ? 1 : 0;

    var btn = document.querySelector('#createPermissionModal .modal-btn-confirm');
    if (btn) { btn.disabled = true; btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> در حال ذخیره...'; }

    apiPost({
        action: 'create', name: name, category: category, description: desc,
        is_owner_only: ownerOnly,
        teacher_access: teacherA, vice_principal_access: vpA,
        student_access: studentA
    }).then(function(data) {
        if (!data.success) throw new Error(data.message);
        closeCreatePermissionModal();
        fetchPermissions();
        showToast('دسترسی "' + name + '" با موفقیت ایجاد شد!', 'success');
    }).catch(function(err) {
        showToast(err.message || 'خطا در ایجاد', 'error');
    }).finally(function() {
        if (btn) { btn.disabled = false; btn.innerHTML = '<i class="fas fa-plus"></i> ایجاد دسترسی'; }
    });
}

// ==================== RESET ====================
function resetPermissions() {
    if (!confirm("آیا مطمئن هستید؟ اطلاعات مجدداً از سرور بارگذاری می‌شود.")) return;
    fetchPermissions();
}

// ==================== STATISTICS ====================
function updateStatistics() {
    var total      = permissions.length;
    var active     = 0;   // دسترسی‌هایی که حداقل یه نقش غیر از none دارن
    var restricted = 0;   // دسترسی‌هایی که همه نقش‌ها none یا تعریف‌نشده هستن

    permissions.forEach(function(p) {
        var roles = p.roles || {};
        var roleValues = ['teacher', 'vice_principal', 'student'];
        var hasAny = roleValues.some(function(role) {
            var val = roles[role];
            return val && val !== 'none';
        });
        if (hasAny) active++;
        else        restricted++;
    });

    var el;
    el = document.getElementById("totalPermissions");      if (el) el.textContent = total;
    el = document.getElementById("activePermissions");     if (el) el.textContent = active;
    el = document.getElementById("restrictedPermissions"); if (el) el.textContent = restricted;
}

// ==================== FILTER HELPERS ====================
function hasRoleAccess(p, role) { return p.roles[role] && p.roles[role] !== 'none'; }
function hasAccessType(p, type) {
    return Object.values(p.roles).some(function(a) {
        if (type === 'read')  return a === 'read';
        if (type === 'write') return a === 'write';
        if (type === 'both')  return a === 'both';
        return false;
    });
}

// ==================== UTIL ====================
function getById(id) {
    for (var i = 0; i < permissions.length; i++) { if (permissions[i].id === id) return permissions[i]; }
    return null;
}

// ==================== TOAST ====================
function showToast(message, type) {
    type = type || "success";
    var toast = document.getElementById("successToast");
    var msgEl = document.getElementById("toastMessage");
    if (!toast || !msgEl) return;
    toast.classList.remove("error", "warning", "info");
    if (type !== "success") toast.classList.add(type);
    msgEl.textContent = message;
    toast.classList.remove("hide"); toast.classList.add("show");
    setTimeout(closeToast, 3000);
}
function closeToast() {
    var toast = document.getElementById("successToast"); if (!toast) return;
    toast.classList.remove("show"); toast.classList.add("hide");
    setTimeout(function(){ toast.classList.remove("hide"); }, 400);
}

// ==================== INIT ====================
window.addEventListener("DOMContentLoaded", function () {
    fetchPermissions();
    var permSearch   = document.getElementById("permissionSearch");
    var roleFilter   = document.getElementById("roleFilter");
    var accessFilter = document.getElementById("accessTypeFilter");
    if (permSearch)   permSearch.addEventListener("input",   renderPermissionsTable);
    if (roleFilter)   roleFilter.addEventListener("change",  renderPermissionsTable);
    if (accessFilter) accessFilter.addEventListener("change", renderPermissionsTable);
    ['explanationModal','createPermissionModal','deleteConfirmModal'].forEach(function(id) {
        var el = document.getElementById(id);
        var closeFns = { explanationModal: closeExplanationModal, createPermissionModal: closeCreatePermissionModal, deleteConfirmModal: closeDeleteModal };
        if (el) el.addEventListener("click", function(e){ if (e.target === this) closeFns[id](); });
    });
});