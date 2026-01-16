require('dotenv').config();

const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');

const config = require('./config.json');
const aniversarios = require('./aniversarios.json');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

const HORA_ENVIO = 10; // 10h da manhã

client.once('ready', () => {
  console.log(`🟢 Bot online como ${client.user.tag}`);
  console.log(`⏰ Horário configurado: ${HORA_ENVIO}:00`);

  checarAniversarios();
  setInterval(checarAniversarios, 1000 * 60);
});

function checarAniversarios() {
  const agora = new Date();
  const hora = agora.getHours();
  const minuto = agora.getMinutes();

  const mesDia = `${String(agora.getMonth() + 1).padStart(2, '0')}-${String(
    agora.getDate()
  ).padStart(2, '0')}`;

  const ano = agora.getFullYear();
  const hojeFormatado = agora.toLocaleDateString('pt-BR');

  // Reset anual
  if (mesDia === '01-01' && hora === 0 && minuto === 0) {
    fs.writeFileSync('./enviados.json', JSON.stringify({}, null, 2));
    console.log(`[${hojeFormatado}] 🔄 enviados.json resetado`);
    return;
  }

  if (hora !== HORA_ENVIO || minuto !== 0) return;

  let enviados = {};
  if (fs.existsSync('./enviados.json')) {
    enviados = JSON.parse(fs.readFileSync('./enviados.json'));
  }

  for (const nome in aniversarios) {
    if (aniversarios[nome] === mesDia) {
      const chave = `${nome}-${ano}`;
      if (enviados[chave]) continue;

      const canal = client.channels.cache.get(config.channelId);
      if (!canal) return;

      canal.send(
        `🎉🎂 **ANIVERSÁRIO DE HOJE!** 🎂🎉\nParabéns **${nome}**! 🥳\n@everyone`
      );

      enviados[chave] = true;
      fs.writeFileSync('./enviados.json', JSON.stringify(enviados, null, 2));

      console.log(`[${hojeFormatado}] 🎉 Aniversário de ${nome} enviado`);
    }
  }
}

client.login(process.env.TOKEN);
