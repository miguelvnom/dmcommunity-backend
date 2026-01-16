const { Client, GatewayIntentBits, Events } = require("discord.js");
const express = require("express");

// ============================================
// CONFIG
// ============================================
const CONFIG = {
  BOT_TOKEN: process.env.BOT_TOKEN, // VEM DO RENDER
  GUILD_ID: "1454509523753636025",
  ALLOWED_ROLES: [
    "1454516302898135284",
    "1454516493982371882",
    "1454515294910283969",
    "145451696587486424",
    "1454509574907367486"
  ],
  PREFIX: "!",
  CODE_EXPIRE_MS: 5 * 60 * 1000 // 5 minutos
};

// ============================================
// BOT
// ============================================
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

// Guarda códigos em memória (funciona no Render)
const codes = {};

// Gera código aleatório
function generateCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

// Checa cargos
function hasAllowedRole(member) {
  return member.roles.cache.some(role =>
    CONFIG.ALLOWED_ROLES.includes(role.id)
  );
}

client.once(Events.ClientReady, () => {
  console.log(`Bot conectado como ${client.user.tag}`);
  console.log("Comando disponível: !verificar");
});

// Comando !verificar
client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(CONFIG.PREFIX)) return;

  const command = message.content
    .slice(CONFIG.PREFIX.length)
    .trim()
    .toLowerCase();

  if (command !== "verificar") return;

  try {
    const guild = await client.guilds.fetch(CONFIG.GUILD_ID);
    const member = await guild.members.fetch(message.author.id);

    if (!hasAllowedRole(member)) {
      return message.reply("❌ Você não tem permissão para acessar o site.");
    }

    // Remove códigos antigos do usuário
    for (const c in codes) {
      if (codes[c].userId === message.author.id) {
        delete codes[c];
      }
    }

    const code = generateCode();

    codes[code] = {
      userId: message.author.id,
      expires: Date.now() + CONFIG.CODE_EXPIRE_MS,
      used: false
    };

    await message.author.send(
      `✅ **Acesso liberado ao DMCommunity!**\n\n` +
      `Seu código de acesso:\n\n` +
      `🔑 **${code}**\n\n` +
      `Cole esse código no site para entrar.\n` +
      `⏳ Válido por 5 minutos.`
    );

    if (message.guild) {
      message.reply("✅ Código enviado no seu privado!");
    }
  } catch (err) {
    console.error(err);
    message.reply("❌ Erro ao verificar. Tente novamente.");
  }
});

// ============================================
// API PARA O SITE
// ============================================
const app = express();
app.use(express.json());

app.post("/check", (req, res) => {
  const { code } = req.body;

  if (!code || !codes[code]) {
    return res.json({ ok: false });
  }

  const data = codes[code];

  if (data.used || Date.now() > data.expires) {
    delete codes[code];
    return res.json({ ok: false });
  }

  data.used = true;
  res.json({ ok: true });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Servidor rodando");
});

// ============================================
client.login(CONFIG.BOT_TOKEN);
