<?php
/**
 * Contact form endpoint (Aviv, 2026-11-22): every enquiry goes by e-mail to Sivan.
 *
 *   To:       sivan@physiotherapy.co.il
 *   Subject:  פנייה מהאתר | <sender's name>
 *   Reply-To: the sender's e-mail, so "Reply" in the mailbox answers them directly
 *
 * Used by assets/js/form.js (fetch, JSON answer) on every page, Hebrew and English.
 * Works on any PHP host that can send mail (the current physiotherapy.co.il hosting can).
 * In WordPress the same result comes from Gravity Forms #2 → Notifications:
 *   Send To: sivan@physiotherapy.co.il · Subject: פנייה מהאתר | {Name:1} · Reply To: {Email:3}
 * and this file can be deleted. See docs/wordpress-handoff.md.
 */

const TO        = 'sivan@physiotherapy.co.il';
const FROM      = 'website@physiotherapy.co.il';   // a sender on the site's own domain, so the mail is not marked as spam
const SUBJECT   = 'פנייה מהאתר | ';

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

function answer(int $code, array $body): void {
    http_response_code($code);
    echo json_encode($body, JSON_UNESCAPED_UNICODE);
    exit;
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    answer(405, ['ok' => false, 'error' => 'method']);
}

// honeypot: a field people never see; bots fill it in. Pretend it worked.
if (!empty($_POST['website'])) {
    answer(200, ['ok' => true]);
}

// one line, no control characters (stops header injection through the name)
function clean_line(string $v, int $max): string {
    $v = preg_replace('/[\r\n\t\x00-\x1F\x7F]+/u', ' ', $v);
    return mb_substr(trim($v), 0, $max);
}

$name    = clean_line((string)($_POST['input_1'] ?? ''), 120);
$phone   = clean_line((string)($_POST['input_2'] ?? ''), 40);
$email   = clean_line((string)($_POST['input_3'] ?? ''), 160);
$message = mb_substr(trim(str_replace("\r\n", "\n", (string)($_POST['input_4'] ?? ''))), 0, 5000);
$consent = !empty($_POST['input_5_1']) || !empty($_POST['input_5.1']);
$page    = clean_line((string)($_POST['page'] ?? ''), 300);
$lang    = (($_POST['lang'] ?? 'he') === 'en') ? 'en' : 'he';

$errors = [];
if ($name === '')                                   $errors[] = 'input_1';
if (strlen(preg_replace('/\D/', '', $phone)) < 9)   $errors[] = 'input_2';
if (!filter_var($email, FILTER_VALIDATE_EMAIL))     $errors[] = 'input_3';
if (!$consent)                                      $errors[] = 'input_5.1';
if ($errors) {
    answer(422, ['ok' => false, 'error' => 'invalid', 'fields' => $errors]);
}

$body = implode("\n", [
    'פנייה חדשה מטופס יצירת הקשר באתר' . ($lang === 'en' ? ' (הגרסה האנגלית)' : ''),
    '',
    'שם: '     . $name,
    'טלפון: '  . $phone,
    'דוא"ל: '  . $email,
    '',
    'הודעה:',
    $message !== '' ? $message : '(ללא הודעה)',
    '',
    '—',
    'נשלח מהעמוד: ' . ($page !== '' ? $page : 'לא ידוע'),
    'הסכמה למדיניות הפרטיות: כן',
    'תאריך: ' . date('d.m.Y H:i'),
]);

$subject = '=?UTF-8?B?' . base64_encode(SUBJECT . $name) . '?=';
$fromName = '=?UTF-8?B?' . base64_encode('אתר סיון נבות') . '?=';
$headers = implode("\r\n", [
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'From: ' . $fromName . ' <' . FROM . '>',
    'Reply-To: ' . $email,
]);

$sent = @mail(TO, $subject, $body, $headers, '-f' . FROM);
answer($sent ? 200 : 500, $sent ? ['ok' => true] : ['ok' => false, 'error' => 'mail']);
