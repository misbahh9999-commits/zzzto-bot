// ======================
// EXPRESS SERVER
// ======================
const express = require("express");
const app = express();

app.use(express.json());

// ======================
// KEEP ALIVE SYSTEM
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
// VIP SYSTEM (MANUAL WHATSAPP ORDER)
// ======================
let vipUsers = [];

// OWNER NUMBER
const ownerNumber = "6285779697469";

// BUY VIP (MANUAL PAYMENT VIA WHATSAPP)
function buyVipMenu() {
  return `
💰 BUY VIP ZZZTO BOT

📲 Silakan hubungi owner untuk pembelian VIP:

wa.me/${ownerNumber}

💳 Cara pembayaran:
- Transfer manual ke owner
- Kirim bukti pembayaran
- VIP akan diaktifkan manual

⚡ VIP aktif setelah konfirmasi owner
`;
}

// ADD VIP (OWNER ONLY)
function addVip(user) {
  if (!vipUsers.includes(user)) {
    vipUsers.push(user);
  }
}

// CHECK VIP
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

let menu = userMenu;

if (role === "vip") menu += vipMenu + aiMenu;
if (role === "owner") menu += vipMenu + aiMenu + ownerMenu;

return menu;
}

// ======================
// MESSAGE HANDLER (SIMPLIFIED)
// ======================
function onMessage(user, text) {

let role = "user";

if (user === ownerNumber) role = "owner";
else if (isVip(user)) role = "vip";

// ======================
// AUTO AI REPLY
// ======================
if (text.includes("@bot")) {
  return "🤖 Halo! ZZZTO BOT siap membantu 😊";
}

// ======================
// MENU
// ======================
if (text === "!menu") {
  return getMenu(role);
}

// ======================
// BUY VIP (WA ORDER SYSTEM)
// ======================
if (text === "!buyvip") {
  return buyVipMenu();
}

// ======================
// OWNER ADD VIP
// ======================
if (text.startsWith("!addvip") && role === "owner") {
  const userTarget = text.split(" ")[1];
  addVip(userTarget);
  return "✅ VIP berhasil ditambahkan";
}

return null;
}

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("ZZZTO BOT RUNNING");
});
