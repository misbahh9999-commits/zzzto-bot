const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason 
} = require("@whiskeysockets/baileys");

const fs = require("fs");

// ===== CONFIG =====
const BOT_NAME = "ZZZTO BOT";
const owner = "6285779697469"; // GANTI NOMOR KAMU

let vipUsers = [owner];
let userLimit = {};

// reset limit tiap 24 jam
setInterval(() => {
    userLimit = {};
}, 24 * 60 * 60 * 1000);

// ===== START BOT =====
async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState("./session");

    const sock = makeWASocket({
        auth: state,
        printQRInTerminal: true
    });

    sock.ev.on("creds.update", saveCreds);

    sock.ev.on("connection.update", (update) => {
        const { connection, lastDisconnect } = update;

        if (connection === "open") {
            console.log(`✅ ${BOT_NAME} CONNECTED`);
        }

        if (connection === "close") {
            const shouldReconnect =
                lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;

            if (shouldReconnect) {
                console.log("🔄 Reconnecting...");
                startBot();
            }
        }
    });

    // ===== MESSAGE =====
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const sender = from.replace("@s.whatsapp.net", "");

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        if (!text) return;

        const isVIP = vipUsers.includes(sender);

        // ===== LIMIT =====
        if (!isVIP) {
            if (!userLimit[sender]) userLimit[sender] = 0;

            if (userLimit[sender] >= 20) {
                return sock.sendMessage(from, {
                    text: "❌ Limit habis (20/24 jam). Upgrade VIP 💎"
                });
            }

            userLimit[sender]++;
        }

        // ===== MENU =====
        if (text === "!menu") {
            return sock.sendMessage(from, {
                text:
`🤖 ${BOT_NAME}

👤 Owner: ${owner}

📌 MENU:
!menu
!ping
!limit

💎 VIP: ${isVIP ? "AKTIF" : "TIDAK"}
📊 Limit: ${isVIP ? "UNLIMITED" : userLimit[sender] + "/20"}`
            });
        }

        // ===== PING =====
        if (text === "!ping") {
            return sock.sendMessage(from, { text: "PONG ⚡" });
        }

        // ===== CEK LIMIT =====
        if (text === "!limit") {
            return sock.sendMessage(from, {
                text: isVIP ? "VIP UNLIMITED 💎" : `Limit: ${userLimit[sender]}/20`
            });
        }

        // ===== ADD VIP =====
        if (sender === owner && text.startsWith("!addvip ")) {
            const num = text.split(" ")[1];
            vipUsers.push(num);

            return sock.sendMessage(from, {
                text: `✔ ${num} sekarang VIP 💎`
            });
        }

        // ===== DEL VIP =====
        if (sender === owner && text.startsWith("!delvip ")) {
            const num = text.split(" ")[1];
            vipUsers = vipUsers.filter(v => v !== num);

            return sock.sendMessage(from, {
                text: `❌ ${num} dihapus dari VIP`
            });
        }
    });
}

startBot();
