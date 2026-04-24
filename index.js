const express = require("express");
const app = express();

app.use(express.json());

// ======================
// SYSTEM KEEP ALIVE
// ======================
let lastPing = Date.now();

app.get("/", (req, res) => {
  res.send("ZZZTO BOT ACTIVE");
});

app.get("/ping", (req, res) => {
  lastPing = Date.now();
  res.send("pong");
});

app.get("/status", (req, res) => {
  const diff = Date.now() - lastPing;

  res.json({
    online: diff < 10 * 60 * 1000,
    inactiveMinutes: Math.floor(diff / 60000)
  });
});

// ======================
// VIP DATABASE (SIMPLE)
// ======================
let vipUsers = [];

const ownerNumber = "628xxxxxxxxxx";

function isVip(user) {
  return vipUsers.includes(user);
}

// ======================
// MENU SYSTEM
// ======================
function getMenu(role) {

const userMenu = `
📋 UMUM USER
- !menu
- !ping
- !info
- !sticker
- !myinfo
- !afk
- !quote
- !buyvip
`;

const vipMenu = `
👑 VIP MENU
- !tagall
- !hidetag
- !groupinfo
- !leaderboard
- !shop
`;

const ownerMenu = `
🔥 OWNER MENU
- !addvip
- !delvip
- !restart
- !broadcast
- !eval
`;

const aiMenu = `
🧠 AI
- !ai
- !chat
- @bot
`;

const stickerMenu = `
🎭 STICKER
- !sticker
- !toimg
- !stikertext
`;

const gameMenu = `
🎮 GAME
- !dadu
- !coinflip
- !suit
`;

const toolsMenu = `
🛠 TOOLS
- !calc
- !base64
- !hash
`;

const funMenu = `
🎉 FUN
- !joke
- !quote
- !pantun
`;

const qrisMenu = `
💰 VIP ORDER
- !buyvip (order via WhatsApp owner)
`;

let menu = userMenu + stickerMenu + gameMenu + toolsMenu + funMenu;

if (role === "vip") menu += vipMenu + aiMenu + qrisMenu;
if (role === "owner") menu += vipMenu + aiMenu + ownerMenu + qrisMenu;

return menu;
}

// ======================
// VIP SYSTEM
// ======================
function addVip(user) {
  if (!vipUsers.includes(user)) vipUsers.push(user);
}

// ======================
// BUY VIP (MANUAL WHATSAPP)
// ======================
function buyVipMenu() {
  return `
💰 BUY VIP

Hubungi owner:

wa.me/${ownerNumber}

💳 Pembayaran manual
- Transfer ke owner
- Kirim bukti
- VIP diaktifkan manual
`;
}

// ======================
// MESSAGE HANDLER
// ======================
function onMessage(user, text) {

let role = "user";

if (user === ownerNumber) role = "owner";
else if (isVip(user)) role = "vip";

// AUTO AI
if (text.includes("@bot")) {
  return "🤖 Halo! ZZZTO BOT siap membantu";
}

// MENU
if (text === "!menu") {
  return getMenu(role);
}

// BUY VIP
if (text === "!buyvip") {
  return buyVipMenu();
}

// ADD VIP (OWNER)
if (text.startsWith("!addvip") && role === "owner") {
  const target = text.split(" ")[1];
  addVip(target);
  return "✅ VIP ditambahkan";
}

// STICKER
if (text === "!sticker") {
  return "📸 Sticker diproses...";
}

// AI
if (text === "!ai") {
  return "🧠 AI aktif...";
}

// DEFAULT
return null;
}

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("ZZZTO BOT RUNNING");
});
