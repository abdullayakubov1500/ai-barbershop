# Остриё

Барбершоп в Казани: лендинг, запись через календарь, админка, Telegram-бот и Mini App. Данные живут в Neon Postgres. На Vercel бот принимает апдейты через webhook.

## Запуск локально

```bash
npm install
copy .env.example .env.local
```

В `.env.local` укажите `DATABASE_URL` из Neon. Затем:

```bash
npm run dev
```

Сайт: http://localhost:3000  
Админка: http://localhost:3000/admin  
Mini App в браузере: http://localhost:3000/mini

Пароль админки по умолчанию: `ostrio-admin`

## Telegram

1. Создайте бота у [@BotFather](https://t.me/BotFather) и вставьте токен в `TELEGRAM_BOT_TOKEN`.
2. Добавьте бота в рабочую группу и дайте право писать сообщения.
3. Укажите `TELEGRAM_GROUP_CHAT_ID`.
4. Имя бота без `@` положите в `NEXT_PUBLIC_BOT_USERNAME`.

Локально `npm run dev` поднимает сайт и long polling бота. На Vercel бот работает только через webhook.

## Mini App

Календарь записи — `/mini`. Telegram принимает HTTPS.

Локально в браузере: http://localhost:3000/mini  
Локально в боте: `npm run dev:mini` (HTTPS-туннель).

После публикации на Vercel:

```
TELEGRAM_WEBAPP_URL=https://ваш-домен.vercel.app/mini
```

Откройте один раз `/api/telegram/setup?secret=CRON_SECRET`, чтобы повесить webhook и кнопку «Календарь».

## Neon и Vercel

1. Создайте проект в [Neon](https://console.neon.tech) и скопируйте connection string в `DATABASE_URL`.
2. В Vercel задайте те же переменные, что в `.env.example`.
3. `TELEGRAM_WEBAPP_URL` должен указывать на `https://<vercel-домен>/mini`.
4. Cron `/api/cron/reminders` шлёт напоминания за час и за 5 минут. На Hobby Vercel он запускается раз в сутки (06:00 UTC); между запусками напоминания ещё обрабатываются при апдейтах бота.

При первом запросе схема и демо-данные создаются сами.
