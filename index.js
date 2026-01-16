/**
 * Telegram Find ID Bot for Render
 * Commands:
 * - /start - Welcome message with instructions
 * - /getid - Get your user ID and current chat ID
 * - /channel - Instructions for getting channel ID
 * - /group - Instructions for getting group ID
 *
 * File: index.js
 */

import TelegramBot from "node-telegram-bot-api";
import express from "express";

// ============================
// Config
// ============================
const BOT_TOKEN = process.env.TELEGRAM_FINDID_BOT_TOKEN;
const PORT = process.env.PORT || 3000;
const RENDER_URL =
  process.env.RENDER_EXTERNAL_URL ||
  "https://telegram-id-finder-bot.onrender.com";

if (!BOT_TOKEN) {
  console.error(
    "❌ TELEGRAM_FINDID_BOT_TOKEN missing in environment variables",
  );
  process.exit(1);
}

// ============================
// Express Server for Render
// ============================
const app = express();

app.get("/", (req, res) => {
  res.json({
    status: "Bot is running",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.get("/health", (req, res) => {
  res.json({ status: "healthy", uptime: process.uptime() });
});

const server = app.listen(PORT, () => {
  console.log(`🌐 Express server running on port ${PORT}`);
});

// ============================
// Bot Init
// ============================
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

console.log("🤖 Telegram FindID Bot started successfully");

// ============================
// Keep-Alive Logic for Render
// ============================
async function keepAlive() {
  try {
    const response = await fetch(RENDER_URL);
    console.log(`✅ Keep-alive ping: ${response.status}`);
  } catch (err) {
    console.error("❌ Keep-alive failed:", err.message);
  }
}

// Ping every 10 seconds for 10 pings (100 seconds total)
function activateService() {
  console.log("🔄 Activating service with keep-alive pings...");
  let count = 0;
  const interval = setInterval(() => {
    keepAlive();
    count++;
    if (count >= 10) {
      clearInterval(interval);
      console.log("✅ Service activation complete");
    }
  }, 10000); // 10 seconds
}

// ============================
// /start - Welcome & Instructions
// ============================
bot.onText(/^\/start$/, async (msg) => {
  // Activate service when /start is received
  activateService();

  const text = `
👋 *Welcome to Find ID Bot*

This bot helps you retrieve Telegram IDs for users, groups, and channels.

📋 *Available Commands:*
• \`/getid\` - Get your User ID and current Chat ID
• \`/channel\` - How to get a Channel ID
• \`/group\` - How to get a Group ID

💡 *Quick Tips:*
• Works in private chats, groups, and channels
• No admin rights needed
• Forward messages to get IDs easily
  `.trim();

  await bot.sendMessage(msg.chat.id, text, {
    parse_mode: "Markdown",
    reply_markup: {
      inline_keyboard: [
        [{ text: "🆔 Get My ID", callback_data: "cmd_getid" }],
        [
          { text: "📢 Channel ID Guide", callback_data: "cmd_channel" },
          { text: "👥 Group ID Guide", callback_data: "cmd_group" },
        ],
      ],
    },
  });
});

// ============================
// /getid - Get User & Chat ID
// ============================
bot.onText(/^\/getid$/, async (msg) => {
  const chat = msg.chat;
  const user = msg.from;

  // Case 1: Forwarded message from channel or group
  if (msg.forward_from_chat) {
    const fwd = msg.forward_from_chat;
    const response = `
🆔 *Forwarded Chat Information*

💬 Chat ID: \`${fwd.id}\`
🏷️ Type: ${fwd.type}
📛 Title: ${fwd.title || "N/A"}
${fwd.username ? `🔗 Username: @${fwd.username}` : ""}
    `.trim();

    return bot.sendMessage(chat.id, response, { parse_mode: "Markdown" });
  }

  // Case 2: Regular message - show user and chat info
  const response = `
🆔 *Your Telegram Information*

👤 *User Details:*
• User ID: \`${user.id}\`
• First Name: ${user.first_name}
${user.last_name ? `• Last Name: ${user.last_name}` : ""}
${user.username ? `• Username: @${user.username}` : "• Username: not set"}

💬 *Chat Details:*
• Chat ID: \`${chat.id}\`
• Chat Type: ${chat.type}
${chat.title ? `• Chat Title: ${chat.title}` : ""}

💡 *Tip:* Forward a message from any group or channel, then use /getid to see its ID!
  `.trim();

  await bot.sendMessage(chat.id, response, { parse_mode: "Markdown" });
});

// ============================
// Handle ALL forwarded messages
// ============================
bot.on("message", async (msg) => {
  // Skip if it's a command
  if (msg.text && msg.text.startsWith("/")) return;

  // Auto-detect forwarded messages and show ID
  if (msg.forward_from_chat) {
    const fwd = msg.forward_from_chat;
    const response = `
🆔 *Forwarded Chat Detected!*

💬 Chat ID: \`${fwd.id}\`
🏷️ Type: ${fwd.type}
📛 Title: ${fwd.title || "N/A"}
${fwd.username ? `🔗 Username: @${fwd.username}` : ""}

💡 You can also use \`/getid\` after forwarding
    `.trim();

    await bot.sendMessage(msg.chat.id, response, { parse_mode: "Markdown" });
  }
});

// ============================
// /channel - Channel ID Guide
// ============================
bot.onText(/^\/channel$/, async (msg) => {
  const text = `
📢 *How to Get a Channel ID*

*For Public Channels:*
1️⃣ Open the channel you want
2️⃣ Forward ANY post from that channel to this bot
3️⃣ The ID will appear automatically!

*For Private Channels:*
1️⃣ You must be a member or admin
2️⃣ Forward ANY post from the channel to this bot
3️⃣ The ID will appear automatically!

⚠️ *Important Notes:*
• Channel links or usernames alone will NOT work
• You must forward an actual message/post
• No admin rights required
• Forwarding must be enabled in the channel

✅ *Try it now:* Forward a channel post to me
  `.trim();

  await bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
});

// ============================
// /group - Group ID Guide
// ============================
bot.onText(/^\/group$/, async (msg) => {
  const text = `
👥 *How to Get a Group ID*

*Method 1: Using /getid in the Group*
1️⃣ Add this bot to the group
2️⃣ Send \`/getid\` command in the group
3️⃣ Bot will reply with the Group ID

*Method 2: Forwarding a Message*
1️⃣ Forward ANY message from the group to this bot (in private chat)
2️⃣ The ID will appear automatically!

⚠️ *Important Notes:*
• Group invite links alone will NOT work
• You must be a member of the group
• No admin rights required
• Forwarding must be enabled in the group

✅ *Try it now:* Forward a group message to me
  `.trim();

  await bot.sendMessage(msg.chat.id, text, { parse_mode: "Markdown" });
});

// ============================
// Inline Button Handlers
// ============================
bot.on("callback_query", async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;

  if (query.data === "cmd_getid") {
    const response = `
🆔 *Your Telegram Information*

👤 User ID: \`${userId}\`
💬 Chat ID: \`${chatId}\`
📛 Username: ${query.from.username ? `@${query.from.username}` : "not set"}

💡 Send /getid in any chat to get its ID!
    `.trim();

    await bot.sendMessage(chatId, response, { parse_mode: "Markdown" });
  }

  if (query.data === "cmd_channel") {
    const text = `
📢 *How to Get a Channel ID*

Simply forward ANY post from the channel to this bot and the ID will appear automatically!

⚠️ Channel links won't work - you must forward an actual message.
    `.trim();
    await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  }

  if (query.data === "cmd_group") {
    const text = `
👥 *How to Get a Group ID*

*Option 1:* Add bot to group and use /getid there
*Option 2:* Forward any message from the group to this bot

The ID will appear automatically!
    `.trim();
    await bot.sendMessage(chatId, text, { parse_mode: "Markdown" });
  }

  await bot.answerCallbackQuery(query.id);
});

// ============================
// Error Handling
// ============================
bot.on("polling_error", (err) => {
  console.error("❌ [Polling Error]:", err.message);
});

bot.on("error", (err) => {
  console.error("❌ [Bot Error]:", err.message);
});

// ============================
// Graceful Shutdown
// ============================
process.on("SIGTERM", () => {
  console.log("🛑 Received SIGTERM, shutting down gracefully...");
  bot.stopPolling();
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("🛑 Received SIGINT, shutting down gracefully...");
  bot.stopPolling();
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});
