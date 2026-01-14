import TelegramBot from "node-telegram-bot-api";
import express from "express";

/* ---------- Init ---------- */
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const app = express();
const PORT = process.env.PORT || 3000;

/* ---------- Helpers ---------- */
function getChatLabel(chat) {
  switch (chat.type) {
    case "private":
      return "Private Chat";
    case "group":
      return "Group";
    case "supergroup":
      return "Supergroup";
    case "channel":
      return "Channel";
    default:
      return "Unknown";
  }
}

/* ---------- Commands ---------- */
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "👋 RepoReply Telegram Bot\n\n" +
    "Use /id to get the Chat or Channel ID.\n" +
    "Add me as admin to channels to enable notifications."
  );
});

bot.onText(/\/help/, (msg) => {
  bot.sendMessage(
    msg.chat.id,
    "/id – Get chat or channel ID\n" +
    "/register – Register this chat for RepoReply notifications"
  );
});

bot.onText(/\/id/, (msg) => {
  const chat = msg.chat;

  bot.sendMessage(
    chat.id,
    `Type: ${getChatLabel(chat)}\nID: ${chat.id}`
  );
});

bot.onText(/\/register/, async (msg) => {
  const chat = msg.chat;

  /* 🔒 Future RepoReply integration */
  // await saveToDatabase({
  //   chatId: chat.id,
  //   type: chat.type,
  //   title: chat.title || null
  // });

  bot.sendMessage(
    chat.id,
    "✅ This chat has been registered for RepoReply notifications."
  );
});

/* ---------- Channel Posts (Admin Only) ---------- */
bot.on("channel_post", (msg) => {
  const chat = msg.chat;

  // Silent capture for notifications
  console.log("Channel registered:", chat.id);

  // Optional one-time confirmation
  bot.sendMessage(
    chat.id,
    "✅ RepoReply connected to this channel."
  );
});

/* ---------- Health Endpoint ---------- */
app.get("/", (_, res) => {
  res.status(200).send("RepoReply Telegram Bot OK");
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
