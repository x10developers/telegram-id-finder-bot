import TelegramBot from "node-telegram-bot-api";
import express from "express";

/* ---------- Startup Logs ---------- */
console.log("RepoReply Telegram Bot starting...");

/* ---------- Init ---------- */
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- Helpers ---------- */
function chatTypeLabel(type) {
  if (type === "private") return "Private Chat";
  if (type === "group") return "Group";
  if (type === "supergroup") return "Supergroup";
  if (type === "channel") return "Channel";
  return "Unknown";
}

/* ---------- /start ---------- */
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `👋 Hi ${msg.from.first_name || ""}!\n\n` +
    `🎉 Congratulations!\n` +
    `RepoReply Telegram Bot is now active.\n\n` +
    `Commands:\n` +
    `/id – Get this chat or channel ID\n` +
    `/help – Usage info\n\n` +
    `Add me as admin to channels to enable notifications.`
  );
});

/* ---------- /help ---------- */
bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    `/start – Welcome message\n` +
    `/id – Get Chat / Group / Channel ID\n\n` +
    `For channels, bot must be admin.`
  );
});

/* ---------- /id ---------- */
bot.onText(/\/id/, (msg) => {
  const chat = msg.chat;

  bot.sendMessage(
    chat.id,
    `📌 Chat Type: ${chatTypeLabel(chat.type)}\n` +
    `🆔 ID: ${chat.id}`
  );
});

/* ---------- Channel Post (Admin Required) ---------- */
bot.on("channel_post", (msg) => {
  const chat = msg.chat;

  console.log("Channel detected:", chat.id);

  bot.sendMessage(
    chat.id,
    `✅ RepoReply connected\n🆔 Channel ID: ${chat.id}`
  );
});

/* ---------- Health Check ---------- */
app.get("/", (_, res) => {
  res.status(200).send("RepoReply Telegram Bot OK");
});

/* ---------- Start Server ---------- */
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
