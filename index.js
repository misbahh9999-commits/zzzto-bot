const { 
    default: makeWASocket, 
    useMultiFileAuthState, 
    DisconnectReason 
} = require("@whiskeysockets/baileys");

const express = require("express");

const app = express();
app.use(express.json());

// ================= CONFIG BOT =================
const BOT_NAME = "ZZZTO BOT";
const owner = "6285779697469"; // 🔥 GANTI NOMOR KAMU

// VIP list (manual dulu, nanti bisa auto upgrade)
let vipUsers = ["628xxxxxxxxxx"];

// limit user
let limitUser = {};

// reset limit tiap 24 jam
setInterval(() => {
    limitUser = {};
}, 24 * 60 * 60 * 1000);

// ================= BOT WA =================
let sock;

async function startBot() {

    const { state, saveCreds } = await useMultiFileAuthState("./auth_info");

    sock = makeWASocket({
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

            if (shouldReconnect) startBot();
        }
    });

    // ================= MESSAGE HANDLER =================
    sock.ev.on("messages.upsert", async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        const from = msg.key.remoteJid;
        const sender = from.replace("@s.whatsapp.net", "");

        const text =
            msg.message.conversation ||
            msg.message.extendedTextMessage?.text;

        const isVIP = vipUsers.includes(sender) || sender === owner;

        // ================= LIMIT SYSTEM =================
        if (!isVIP) {
            if (!limitUser[sender]) limitUser[sender] = 0;

            if (limitUser[sender] >= 20) {
                return sock.sendMessage(from, {
                    text: "❌ Limit kamu habis (20/24 jam). Upgrade VIP untuk unlimited 💎"
                });
            }

            limitUser[sender]++;
        }

        // ================= MENU =================
        if (text === "!menu") {
            return sock.sendMessage(from, {
                text:
`🤖 ${BOT_NAME}

👤 Owner: ${owner}

Menu:
- !menu
- !ping
- !limit

Status:
VIP: ${isVIP ? "ACTIVE 💎" : "FREE ❌"}
Limit: ${isVIP ? "UNLIMITED" : limitUser[sender] + "/20"}`
            });
        }

        // ================= PING =================
        if (text === "!ping") {
            return sock.sendMessage(from, { text: "PONG ⚡" });
        }

        // ================= CEK LIMIT =================
        if (text === "!limit") {
            return sock.sendMessage(from, {
                text: `Limit kamu: ${isVIP ? "UNLIMITED 💎" : limitUser[sender] + "/20"}`
            });
        }

        // ================= OWNER ADD VIP =================
        if (sender === owner && text?.startsWith("!addvip ")) {
            const num = text.split(" ")[1];
            vipUsers.push(num);

            return sock.sendMessage(from, {
                text: `✔ ${num} sekarang VIP 💎`
            });
        }
    });
}

startBot();

// ================= API UNTUK APK =================
app.get("/api/wa/status", (req, res) => {
    res.send(sock?.user ? "connected" : "not_connected");
});

app.post("/api/wa/send", async (req, res) => {
    try {
        const { number, message } = req.body;

        await sock.sendMessage(number + "@s.whatsapp.net", {
            text: message
        });

        res.send({ status: "success" });

    } catch (e) {
        res.send({ status: "error", msg: e.message });
    }
});

// ================= SERVER =================
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log("🚀 ZZZTO BOT SERVER RUNNING");
});
