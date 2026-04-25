const express = require("express");
const app = express();

app.use(express.json());

// ======================
// DATA SYSTEM
// ======================
let vipUsers = [];
let limits = {};
let stickerLimit = {};

const LIMIT_USER = 20;

// ======================
// ROLE
// ======================
function getRole(user) {
  if (user === "OWNER_NUMBER") return "owner";
  if (vipUsers.includes(user)) return "vip";
  return "user";
}

// ======================
// LIMIT SYSTEM
// ======================
function useLimit(user, role) {
  if (role !== "user") return true;

  if (!limits[user]) limits[user] = LIMIT_USER;

  if (limits[user] <= 0) return false;

  limits[user]--;
  return true;
}

// ======================
// STICKER LIMIT
// ======================
function useStickerLimit(user, role) {
  if (role !== "user") return true;

  if (!stickerLimit[user]) stickerLimit[user] = 2;

  if (stickerLimit[user] <= 0) return false;

  stickerLimit[user]--;
  return true;
}

// ======================
// LOCK SYSTEM
// ======================
const vipOnly = [
  "!ai","!chat","!ask",
  "!ytmp3","!ytmp4","!tiktok",
  "!slot","!casino",
  "!tagall","!hidetag","!kick",
  "!promote","!demote",
  "!attp","!ttp","!stickerwm","!stickergif",
  "!resize","!crop","!rotate","!removebg","!aiimage"
];

const ownerOnly = [
  "!addvip","!delvip","!restart",
  "!broadcast","!ban","!unban","!access"
];

// ======================
// MENU
// ======================
function getMenu(role) {

const header = `
╭━━━〔 🤖 ZZZTO BOT 〕━━━⬣
┃ 👤 Role: ${role.toUpperCase()}
┃ ⚡ Status: Online
╰━━━━━━━━━━━━━━━━━━⬣
`;

const userMenu = `
📋 UMUM
• !menu
• !ping
• !info
• !owner
• !limit
• !waktu
• !quote
• !buyvip
`;

const toolsMenu = `
🛠 TOOLS
• !calc
• !reverse
• !upper
• !lower
`;

const groupMenu = `
👥 GROUP
• !group open/close
• !linkgroup
`;

const stickerUser = `
🎭 STICKER (LIMIT 2)
• !sticker
• !toimg
`;

const locked = `
🔒 VIP ONLY
• !ai
• !ytmp3
• !tiktok
• !kick
• !tagall
`;

const vipMenu = `
👑 VIP

🤖 AI
• !ai
• !chat
• !ask

📥 DOWNLOADER
• !ytmp3
• !ytmp4
• !tiktok

🎮 GAME
• !slot
• !casino

🎨 IMAGE
• !aiimage
• !resize
• !crop
• !rotate
• !removebg

🎭 STICKER PRO
• !attp
• !ttp
• !stickerwm
• !stickergif

👥 GROUP PRO
• !tagall
• !hidetag
• !kick
• !promote
• !demote
`;

const ownerMenu = `
🔥 OWNER
• !addvip
• !delvip
• !restart
• !broadcast
• !ban
• !unban
• !access
`;

const footer = `
╭━━━━━━━━━━━━━━━━━━⬣
┃ 🔥 By Misbah Project
╰━━━━━━━━━━━━━━━━━━⬣
`;

let menu = header + userMenu + toolsMenu + groupMenu;

if (role === "user") {
  menu += stickerUser + locked;
}

if (role === "vip") {
  menu += vipMenu;
}

if (role === "owner") {
  menu += vipMenu + ownerMenu;
}

return menu + footer;
}

// ======================
// BOT LOGIC
// ======================
function onMessage(user, text) {

let role = getRole(user);

// LOCK OWNER
if (ownerOnly.some(cmd => text.startsWith(cmd)) && role !== "owner") {
  return "🚫 Fitur khusus OWNER!";
}

// LOCK VIP
if (vipOnly.some(cmd => text.startsWith(cmd)) && role === "user") {
  return "🔒 Fitur khusus VIP!";
}

// LIMIT
if (!useLimit(user, role)) {
  return "⚠️ Limit harian habis (20)";
}

// MENU
if (text === "!menu") return getMenu(role);

// STICKER
if (text.startsWith("!sticker")) {
  if (!useStickerLimit(user, role)) {
    return "⚠️ Limit sticker habis (2)";
  }
  return "🎭 Sticker dibuat";
}

// IMAGE
if (text.startsWith("!aiimage")) return "🎨 AI membuat gambar...";
if (text.startsWith("!resize")) return "📏 Resize gambar";
if (text.startsWith("!crop")) return "✂️ Crop gambar";
if (text.startsWith("!rotate")) return "🔄 Rotate gambar";
if (text.startsWith("!removebg")) return "🧼 Remove background";

// AI
if (text.startsWith("!ai")) return "🤖 AI menjawab...";

// VIP ADD
if (text.startsWith("!addvip") && role === "owner") {
  let target = text.split(" ")[1];
  vipUsers.push(target);
  return "✅ VIP ditambahkan";
}

// DEFAULT
return "OK";
}

// ======================
// API
// ======================
app.post("/send", (req, res) => {
  const { user, text } = req.body;

  const reply = onMessage(user, text);

  res.json({ reply });
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("ZZZTO BOT RUNNING");
});
