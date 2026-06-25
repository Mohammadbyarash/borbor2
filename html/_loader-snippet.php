<?php
/**
 * html/_loader-snippet.php
 * ─────────────────────────
 * این فایل رو توی همه صفحات HTML-ات include کن.
 * 
 * نحوه استفاده:
 *   <?php $bb_tagline='پنل دانش‌آموزان'; include '_loader-snippet.php'; ?>
 *
 * اگه $bb_tagline تعریف نشه مقدار پیشفرض استفاده میشه.
 */
$bb_tagline = isset($bb_tagline) ? htmlspecialchars($bb_tagline) : 'School Management System';
?>
<div id="bb-loader">
  <canvas id="bb-bg"></canvas>
  <div class="bb-center">
    <div class="bb-word" id="bb-word"></div>
    <div class="bb-tagline" id="bb-tag"><?= $bb_tagline ?></div>
    <div class="bb-strip" id="bb-strip">
      <div class="bb-track"></div>
      <div class="bb-dots">
        <div class="bb-dot"></div>
        <div class="bb-dot"></div>
        <div class="bb-dot"></div>
      </div>
    </div>
  </div>
</div>