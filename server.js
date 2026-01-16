const { Client, GatewayIntentBits, Events } = require('discord.js');
const fs = require('fs');
const path = require('path');

/* ===============================
   CONFIGURAÇÕES
================================ */

// ❌ NÃO coloque token aqui
// ✅ o token vem do Render (Environment Variable)
const BOT_TOKEN = process.env.BOT_TOKEN;

// ID do servidor Discord
const GUILD_ID = '1454509523753636025';

// Cargos que podem usar o site
const ALLOWED_ROLES = [
    '1454516302898135284',
    '1454516493982371882',
    '1454515294910283969',
    '145451696587486424',
    '1454509574907367486'
];

// Arquivo que o site vai ler
const OUTPUT_FILE = path.join(__dirname, 'site', 'authorized.json');

// Prefixo do comando
const PREFIX = '!';

/* ===============================
   CLIENTE DISCORD
================================ */

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ]
});

/* ===============================
   CÓDIGOS EM MEMÓRIA
================================ */

let authorizedCodes = {};

/* ==========*
