<?php
// بذار توی api/ و برو بهش — بعد از دیدن ساختار حذف کن
require_once __DIR__ . '/config.php';
$pdo = getDB();
header('Content-Type: text/html; charset=utf-8');

// گرفتن همه Foreign Key های دیتابیس
$fkQuery = $pdo->query("
    SELECT 
        kcu.TABLE_NAME,
        kcu.COLUMN_NAME,
        kcu.REFERENCED_TABLE_NAME,
        kcu.REFERENCED_COLUMN_NAME,
        kcu.CONSTRAINT_NAME,
        rc.UPDATE_RULE,
        rc.DELETE_RULE
    FROM information_schema.KEY_COLUMN_USAGE kcu
    JOIN information_schema.REFERENTIAL_CONSTRAINTS rc 
        ON rc.CONSTRAINT_NAME = kcu.CONSTRAINT_NAME
        AND rc.CONSTRAINT_SCHEMA = kcu.TABLE_SCHEMA
    WHERE kcu.TABLE_SCHEMA = DATABASE()
      AND kcu.REFERENCED_TABLE_NAME IS NOT NULL
    ORDER BY kcu.TABLE_NAME, kcu.COLUMN_NAME
");
$allFKs = $fkQuery->fetchAll(PDO::FETCH_ASSOC);

// ایندکس کردن FK ها بر اساس جدول
$fkByTable = [];
$referencedBy = [];
foreach ($allFKs as $fk) {
    $fkByTable[$fk['TABLE_NAME']][] = $fk;
    $referencedBy[$fk['REFERENCED_TABLE_NAME']][] = $fk;
}

$tables = $pdo->query("SHOW TABLES")->fetchAll(PDO::FETCH_COLUMN);
?>
<!DOCTYPE html>
<html dir="rtl">
<head>
<meta charset="utf-8">
<title>ساختار دیتابیس</title>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Tahoma', monospace; background: #0f172a; color: #e2e8f0; padding: 24px; }
  
  h2 { color: #38bdf8; font-size: 22px; margin-bottom: 20px; padding-bottom: 10px; border-bottom: 2px solid #1e40af; }
  
  .summary { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 28px; }
  .stat { background: #1e293b; border: 1px solid #334155; border-radius: 10px; padding: 14px 22px; text-align: center; }
  .stat .num { font-size: 28px; font-weight: bold; color: #38bdf8; }
  .stat .lbl { font-size: 12px; color: #94a3b8; margin-top: 4px; }

  .table-block { background: #1e293b; border: 1px solid #334155; border-radius: 12px; margin-bottom: 24px; overflow: hidden; }
  
  .table-header { 
    background: #1d4ed8; padding: 12px 18px; 
    display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: 8px;
  }
  .table-header h3 { color: #fff; font-size: 15px; font-family: monospace; }
  .table-header .count { color: #bfdbfe; font-size: 12px; }
  .fk-badge { background: #065f46; color: #34d399; font-size: 11px; padding: 2px 8px; border-radius: 20px; border: 1px solid #34d399; }
  .ref-badge { background: #7c2d12; color: #fb923c; font-size: 11px; padding: 2px 8px; border-radius: 20px; border: 1px solid #fb923c; }

  table.cols { width: 100%; border-collapse: collapse; font-size: 13px; }
  table.cols th { background: #0f172a; padding: 8px 14px; color: #94a3b8; text-align: right; font-weight: normal; font-size: 12px; }
  table.cols td { padding: 7px 14px; border-bottom: 1px solid #0f172a; }
  table.cols tr:last-child td { border-bottom: none; }
  table.cols tr:hover td { background: #263047; }

  .col-name { color: #7dd3fc; font-family: monospace; }
  .col-name.pk { color: #fbbf24; }
  .col-name.fk-col { color: #34d399; }
  .col-type { color: #c084fc; font-size: 12px; }
  .col-null { color: #6b7280; font-size: 12px; }
  .badge { display: inline-block; padding: 1px 6px; border-radius: 4px; font-size: 10px; font-weight: bold; }
  .badge-PRI { background: #78350f; color: #fbbf24; }
  .badge-MUL { background: #064e3b; color: #34d399; }
  .badge-UNI { background: #1e3a5f; color: #60a5fa; }
  .col-default { color: #64748b; font-size: 12px; font-family: monospace; }
  .fk-hint { color: #4b5563; font-size: 11px; margin-right: 6px; }

  .fk-section { padding: 12px 18px; border-top: 1px solid #1e3a5f; background: #0d1f3c; }
  .fk-section h4 { color: #60a5fa; font-size: 12px; margin-bottom: 10px; }
  .fk-list { display: flex; flex-direction: column; gap: 6px; }
  .fk-item { 
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    background: #0f172a; border-radius: 6px; padding: 7px 12px; 
    border-right: 3px solid #34d399; font-size: 12px;
  }
  .fk-item .col { color: #34d399; font-family: monospace; }
  .fk-item .arrow { color: #38bdf8; font-size: 14px; }
  .fk-item .ref { color: #fbbf24; font-family: monospace; }
  .fk-item .rules { color: #6b7280; font-size: 11px; margin-right: auto; }

  .ref-section { padding: 12px 18px; border-top: 1px solid #2d1a00; background: #1a0f00; }
  .ref-section h4 { color: #fb923c; font-size: 12px; margin-bottom: 10px; }
  .ref-item { 
    display: flex; align-items: center; gap: 8px; flex-wrap: wrap;
    background: #0f172a; border-radius: 6px; padding: 7px 12px; 
    border-right: 3px solid #fb923c; font-size: 12px; margin-bottom: 6px;
  }
  .ref-item .ref-table { color: #fb923c; font-family: monospace; }
  .ref-item .ref-col { color: #fde68a; font-family: monospace; }

  .relation-map { background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 20px; margin-bottom: 28px; }
  .relation-map h3 { color: #38bdf8; margin-bottom: 16px; font-size: 16px; }
  .rel-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 10px; }
  .rel-card { 
    background: #0f172a; border-radius: 8px; padding: 10px 14px; 
    border-right: 3px solid #38bdf8; font-size: 12px;
  }
  .rel-card .rule { color: #6b7280; font-size: 11px; margin-top: 4px; }
</style>
</head>
<body>

<h2>🗄️ ساختار دیتابیس</h2>

<div class="summary">
  <div class="stat">
    <div class="num"><?= count($tables) ?></div>
    <div class="lbl">جدول</div>
  </div>
  <div class="stat">
    <div class="num"><?= count($allFKs) ?></div>
    <div class="lbl">رابطه (FK)</div>
  </div>
  <div class="stat">
    <div class="num"><?= array_sum(array_map(fn($t) => (int)($pdo->query("SELECT COUNT(*) FROM `$t`")->fetchColumn() > 0), $tables)) ?></div>
    <div class="lbl">جدول با داده</div>
  </div>
</div>

<!-- نقشه کامل روابط -->
<div class="relation-map">
  <h3>🔗 نقشه کامل روابط (Foreign Keys)</h3>
  <?php if (empty($allFKs)): ?>
    <p style="color:#ef4444;">هیچ Foreign Key ای در دیتابیس پیدا نشد!</p>
  <?php else: ?>
  <div class="rel-grid">
    <?php foreach ($allFKs as $fk): ?>
    <div class="rel-card">
      <span style="color:#7dd3fc;font-family:monospace;"><?= htmlspecialchars($fk['TABLE_NAME']) ?></span>
      <span style="color:#94a3b8">.</span>
      <span style="color:#34d399;font-family:monospace;"><?= htmlspecialchars($fk['COLUMN_NAME']) ?></span>
      <span style="color:#38bdf8; margin: 0 6px;">→</span>
      <span style="color:#fbbf24;font-family:monospace;"><?= htmlspecialchars($fk['REFERENCED_TABLE_NAME']) ?></span>
      <span style="color:#94a3b8">.</span>
      <span style="color:#fde68a;font-family:monospace;"><?= htmlspecialchars($fk['REFERENCED_COLUMN_NAME']) ?></span>
      <div class="rule">ON DELETE: <?= $fk['DELETE_RULE'] ?> &nbsp;|&nbsp; ON UPDATE: <?= $fk['UPDATE_RULE'] ?></div>
    </div>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>
</div>

<!-- جداول -->
<?php foreach ($tables as $table):
    $cols    = $pdo->query("SHOW COLUMNS FROM `$table`")->fetchAll(PDO::FETCH_ASSOC);
    $count   = $pdo->query("SELECT COUNT(*) FROM `$table`")->fetchColumn();
    $myFKs   = $fkByTable[$table] ?? [];
    $myRefs  = $referencedBy[$table] ?? [];
    $fkCols  = array_column($myFKs, 'COLUMN_NAME');
    // ایندکس FK ها بر اساس نام ستون
    $fkIndex = [];
    foreach ($myFKs as $fk) $fkIndex[$fk['COLUMN_NAME']] = $fk;
?>
<div class="table-block">
  <div class="table-header">
    <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
      <h3>📋 <?= htmlspecialchars($table) ?></h3>
      <span class="count">(<?= $count ?> ردیف)</span>
      <?php if ($myFKs): ?>
        <span class="fk-badge">↗ <?= count($myFKs) ?> FK خروجی</span>
      <?php endif; ?>
      <?php if ($myRefs): ?>
        <span class="ref-badge">↙ <?= count($myRefs) ?> جدول وابسته</span>
      <?php endif; ?>
    </div>
  </div>

  <table class="cols">
    <tr>
      <th>Field</th><th>Type</th><th>Null</th><th>Key</th><th>Default</th>
    </tr>
    <?php foreach ($cols as $c):
      $isPK = $c['Key'] === 'PRI';
      $isFK = isset($fkIndex[$c['Field']]);
      $cls  = 'col-name' . ($isPK ? ' pk' : '') . ($isFK ? ' fk-col' : '');
    ?>
    <tr>
      <td>
        <span class="<?= $cls ?>">
          <?php if ($isPK) echo '🔑 '; elseif ($isFK) echo '🔗 '; ?>
          <?= htmlspecialchars($c['Field']) ?>
        </span>
        <?php if ($isFK): $fk = $fkIndex[$c['Field']]; ?>
          <span class="fk-hint">→ <?= $fk['REFERENCED_TABLE_NAME'] ?>.<?= $fk['REFERENCED_COLUMN_NAME'] ?></span>
        <?php endif; ?>
      </td>
      <td class="col-type"><?= htmlspecialchars($c['Type']) ?></td>
      <td class="col-null"><?= $c['Null'] ?></td>
      <td>
        <?php if ($c['Key']): ?>
          <span class="badge badge-<?= htmlspecialchars($c['Key']) ?>"><?= htmlspecialchars($c['Key']) ?></span>
        <?php endif; ?>
      </td>
      <td class="col-default"><?= htmlspecialchars($c['Default'] ?? 'NULL') ?></td>
    </tr>
    <?php endforeach; ?>
  </table>

  <?php if ($myFKs): ?>
  <div class="fk-section">
    <h4>🔗 این جدول به کجا وصل است؟</h4>
    <div class="fk-list">
      <?php foreach ($myFKs as $fk): ?>
      <div class="fk-item">
        <span class="col"><?= htmlspecialchars($fk['COLUMN_NAME']) ?></span>
        <span class="arrow">→</span>
        <span class="ref"><?= htmlspecialchars($fk['REFERENCED_TABLE_NAME']) ?>.<?= htmlspecialchars($fk['REFERENCED_COLUMN_NAME']) ?></span>
        <span class="rules">DEL: <?= $fk['DELETE_RULE'] ?> | UPD: <?= $fk['UPDATE_RULE'] ?></span>
      </div>
      <?php endforeach; ?>
    </div>
  </div>
  <?php endif; ?>

  <?php if ($myRefs): ?>
  <div class="ref-section">
    <h4>📌 چه جداولی به این جدول وابسته‌اند؟</h4>
    <?php foreach ($myRefs as $ref): ?>
    <div class="ref-item">
      <span class="ref-table"><?= htmlspecialchars($ref['TABLE_NAME']) ?></span>
      <span style="color:#6b7280">.</span>
      <span class="ref-col"><?= htmlspecialchars($ref['COLUMN_NAME']) ?></span>
      <span style="color:#94a3b8; font-size:11px; margin-right:auto;">DEL: <?= $ref['DELETE_RULE'] ?></span>
    </div>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>

</div>
<?php endforeach; ?>

</body>
</html>