<?php
// ============================================================
//  permission_guard.php
//
//  توی هر API جدید فقط:
//    require_once __DIR__ . '/permission_guard.php';
//    $guard = new PermissionGuard('مدیریت معلمان');
//    $guard->autoCheck();
//    $school_id = $guard->schoolId();
// ============================================================
if (session_status() === PHP_SESSION_NONE) session_start();
require_once __DIR__ . '/config.php';
require_once __DIR__ . '/auth_helper.php';
class PermissionGuard
{
    private array  $user;
    private string $perm;
    public function __construct(string $perm)
    {
        $this->perm = $perm;
        $this->user = requireAuth();
    }
    public function user(): array    { return $this->user; }
    public function schoolId(): int  { return (int)$this->user['school_id']; }
    public function userId(): int    { return (int)($this->user['id'] ?? $this->user['user_id'] ?? 0); }
    public function getUserId(): int { return $this->userId(); }
    /** read یا both */
    public function requireRead(): void  { requirePermission($this->user, $this->perm, 'read'); }
    /** write یا both */
    public function requireWrite(): void { requirePermission($this->user, $this->perm, 'write'); }
    /** GET → read  |  POST/PUT/DELETE → write */
    public function autoCheck(): void {
        strtoupper($_SERVER['REQUEST_METHOD']) === 'GET'
            ? $this->requireRead()
            : $this->requireWrite();
    }
    public function canRead(): bool  { return userHasPermission($this->user, $this->perm, 'read'); }
    public function canWrite(): bool { return userHasPermission($this->user, $this->perm, 'write'); }
}