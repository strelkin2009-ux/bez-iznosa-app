<?php
/**
 * Telegram-бот для «Без износа»
 * 
 * Установка:
 * 1. Создай бота через @BotFather → получи TOKEN
 * 2. Положи этот файл на хостинг (timeweb/reg.ru)
 * 3. Настрой webhook: https://api.telegram.org/bot{TOKEN}/setWebhook?url=https://your-site.ru/send.php
 * 4. Или запускай по cron каждое утро: 0 7 * * * php /path/to/send.php cron
 * 
 * Как работает:
 * - Участник пишет боту /start код_группы своё_имя
 * - Бот сохраняет chat_id в базу
 * - Каждое утро бот шлёт фразу дня
 */

$TOKEN = getenv('TELEGRAM_TOKEN') ?: 'YOUR_BOT_TOKEN';
$DB_URL = getenv('DATABASE_URL') ?: '';

// Phrases for daily reminders
$phrases = [
    "Когда первый раз сожмёшь челюсть — заметь.",
    "Три длинных выдоха. Прямо сейчас.",
    "Заметил — уже сделал.",
    "Пропуск — не провал. Сегодня начни заново.",
    "Что чувствует тело прямо сейчас?",
    "60 секунд тишины. Без телефона.",
    "Сначала тело, потом голова.",
    "Одно действие, повторённое 7 раз.",
    "Направление важнее скорости.",
    "Скажи кому-то «нет» сегодня.",
    "Вздох перед ответом на сообщение.",
    "Плечи к ушам? Опусти.",
    "Отдых ≠ восстановление. Скроллинг ≠ отдых.",
    "Заметь первую эмоцию при пробуждении.",
];

function sendTelegram($chatId, $text, $token) {
    $url = "https://api.telegram.org/bot{$token}/sendMessage";
    $data = ['chat_id' => $chatId, 'text' => $text, 'parse_mode' => 'HTML'];
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    $result = curl_exec($ch);
    curl_close($ch);
    return $result;
}

function getDb($dbUrl) {
    $parts = parse_url($dbUrl);
    $dsn = "pgsql:host={$parts['host']};port=" . ($parts['port'] ?? 5432) . ";dbname=" . ltrim($parts['path'], '/') . ";sslmode=require";
    return new PDO($dsn, $parts['user'], $parts['pass'] ?? '');
}

// CRON MODE: send daily reminders
if (isset($argv[1]) && $argv[1] === 'cron') {
    if (!$DB_URL) { echo "No DATABASE_URL\n"; exit(1); }
    $db = getDb($DB_URL);
    
    // Get all users with telegram_id
    $stmt = $db->query("SELECT u.telegram_id, g.start_date FROM users u JOIN groups g ON u.group_id = g.id WHERE u.telegram_id IS NOT NULL");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    $today = new DateTime();
    foreach ($users as $user) {
        $start = new DateTime($user['start_date']);
        $diff = $start->diff($today)->days;
        if ($diff < 0 || $diff >= 42) continue;
        
        $phrase = $phrases[$diff % count($phrases)];
        $day = $diff + 1;
        $text = "☀️ <b>День {$day}</b>\n\n{$phrase}\n\n→ bez-iznosa-app.vercel.app";
        sendTelegram($user['telegram_id'], $text, $TOKEN);
        echo "Sent to {$user['telegram_id']}\n";
    }
    exit(0);
}

// WEBHOOK MODE: handle incoming messages
$input = file_get_contents('php://input');
$update = json_decode($input, true);

if (!$update || !isset($update['message'])) exit;

$chatId = $update['message']['chat']['id'];
$text = trim($update['message']['text'] ?? '');

if (strpos($text, '/start') === 0) {
    $parts = explode(' ', $text);
    if (count($parts) < 3) {
        sendTelegram($chatId, "Напиши: /start код_группы твоё_имя\n\nНапример: /start potok1 Сергей", $TOKEN);
        exit;
    }
    
    $code = strtolower($parts[1]);
    $name = implode(' ', array_slice($parts, 2));
    
    if ($DB_URL) {
        try {
            $db = getDb($DB_URL);
            $stmt = $db->prepare("UPDATE users SET telegram_id = ? WHERE name = ? AND group_id = (SELECT id FROM groups WHERE code = ?)");
            $stmt->execute([$chatId, $name, $code]);
            
            if ($stmt->rowCount() > 0) {
                sendTelegram($chatId, "✅ Подключено! Буду присылать фразу дня каждое утро.\n\n→ bez-iznosa-app.vercel.app", $TOKEN);
            } else {
                sendTelegram($chatId, "❌ Не нашёл тебя. Проверь код группы и имя (как при входе в приложение).", $TOKEN);
            }
        } catch (Exception $e) {
            sendTelegram($chatId, "Ошибка подключения к базе.", $TOKEN);
        }
    }
    exit;
}

sendTelegram($chatId, "Привет! Это бот программы «Без износа».\n\nНапиши: /start код_группы твоё_имя", $TOKEN);
