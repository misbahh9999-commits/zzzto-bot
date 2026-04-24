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
  let diff = Date.now() - lastPing;

  res.json({
    status: "online",
    idleMinutes: Math.floor(diff / 60000),
    warning: diff > 5 * 60000
  });
});

// ======================
// VIP DATABASE (SIMPLE)
// ======================
let vipUsers = [];

function isVip(user) {
  return vipUsers.includes(user);
}

// ======================
// VIP API (FOR APK)
// ======================
app.get("/vip/list", (req, res) => {
  res.json(vipUsers);
});

app.post("/vip/add", (req, res) => {
  vipUsers.push(req.body.number);
  res.json({ success: true });
});

app.post("/vip/remove", (req, res) => {
  vipUsers = vipUsers.filter(v => v !== req.body.number);
  res.json({ success: true });
});

// ======================
// MENU SYSTEM FULL
// ======================
function getMenu(role) {

const userMenu = `
📋 UMUM
• !menu
• !ping
• !info
• !owner
• !limit
• !hi
• !waktu
• !afk
• !quote
• !buyvip
• !sticker
• !toimg
`;

const toolsMenu = `
🛠 TOOLS
• !calc
• !base64
• !hash
• !reverse
• !upper
• !lower
• !length
`;

const waMenu = `
💬 WHATSAPP
• !tagall
• !hidetag
• !groupinfo
• !welcome
• !cek
• !getpp
• !qrgen
• !stikertext
`;

const gameMenu = `
🎮 GAME
• !dadu
• !coinflip
• !suit
• !pilih
• !tebak
`;

const funMenu = `
🎉 FUN
• !joke
• !quote
• !fakta
• !gombal
• !bijak
• !emoji
• !pantun
`;

const stickerMenu = `
🎭 STICKER
• !sticker
• !toimg
• !stikertext
• !attp
• !ttp
• !emojimix
• !stickermeme
`;

const vipMenu = `
👑 VIP
• !tagall
• !hidetag
• !groupinfo
• !antilink
• !shop
• !leaderboard
• !toplimit
• !vipstatus
`;

const aiMenu = `
🧠 AI
• !ai
• !chat
• !ask
• @bot
`;

const ownerMenu = `
🔥 OWNER
• !addvip
• !delvip
• !restart
• !broadcast
• !eval
• !setname
• !setbio
• !ban
• !unban
• !mute
• !unmute
`;

const orderMenu = `
💰 ORDER VIP
• !buyvip
• hubungi owner WhatsApp
`;

let menu = userMenu + toolsMenu + waMenu + gameMenu + funMenu + stickerMenu;

if (role === "vip") menu += vipMenu + aiMenu + orderMenu;
if (role === "owner") menu += vipMenu + aiMenu + ownerMenu + orderMenu;

return menu;
}

// ======================
// MESSAGE HANDLER (BOT LOGIC SIMULASI)
// ======================
function onMessage(user, text) {

let role = "user";

if (user === "OWNER_NUMBER") role = "owner";
else if (isVip(user)) role = "vip";

// AUTO AI TAG
if (text.includes("@bot")) {
  return "🤖 ZZZTO BOT siap membantu";
}

// MENU
if (text === "!menu") {
  return getMenu(role);
}

// BUY VIP
if (text === "!buyvip") {
  return "💰 Hubungi owner: wa.me/628xxxxxxxx";
}

// ADD VIP (OWNER)
if (text.startsWith("!addvip") && role === "owner") {
  vipUsers.push(text.split(" ")[1]);
  return "✅ VIP ditambahkan";
}

// DEFAULT
return null;
}

// ======================
// API SEND FROM APK
// ======================
app.post("/send", (req, res) => {
  const { user, text } = req.body;

  const reply = onMessage(user, text);

  res.json({
    reply: reply || "OK"
  });
});

// ======================
// START SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("ZZZTO BOT RUNNING");
});
