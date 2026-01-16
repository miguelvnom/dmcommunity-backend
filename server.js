const { Client, GatewayIntentBits } = require("discord.js");
const express = require("express");

// ===== CONFIG =====
const BOT_TOKEN = "SEU_TOKEN_AQUI";
const PORT = 3000;

// cargos permitidos
const ALLOWED_ROLES = [
  "1454516302898135284",
  "1454516493982371882",
  "1454515294910283969",
  "145451696587486424",
  "1454509574907367486"
];

// ===== BOT =====
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages
  ]
});

const codes = {}; // guarda os códigos

client.on("ready", () => {
  console.log("Bot online");
});

client.on("messageCreate", async (msg) => {
  if (msg.author.bot) return;
  if (msg.content !== "!verificar") return;

  const member = await msg.guild.members.fetch(msg.author.id);
  const hasRole = member.roles.cache.some(r =>
    ALLOWED_ROLES.includes(r.id)
  );

  if (!hasRole) {
    msg.reply("❌ Você não tem permissão.");
    return;
  }

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  codes[code] = {
    used: false,
    userId: msg.author.id
  };

  msg.author.send(
    `✅ Seu código de acesso é:\n\n${code}\n\nUse no site.`
  );
});

// ===== SITE API =====
const app = express();
app.use(express.json());

app.post("/check", (req, res) => {
  const { code } = req.body;

  if (!codes[code] || codes[code].used) {
    return res.json({ ok: false });
  }

  codes[code].used = true;
  res.json({ ok: true });
});

app.listen(PORT, () => {
  console.log("Servidor rodando");
});

client.login(BOT_TOKEN);
