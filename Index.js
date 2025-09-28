// index.js
const { Client, GatewayIntentBits, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
require('dotenv').config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions
  ]
});

// Comandos slash
const commands = [
  new SlashCommandBuilder()
    .setName('votacion')
    .setDescription('Crea una votación de apertura')
    .addStringOption(option =>
      option.setName('codigo')
        .setDescription('Código de la apertura')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('minimo')
        .setDescription('Cantidad mínima de votos necesarios')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('rol')
        .setDescription('Rol a mencionar (opcional)')
        .setRequired(false))
];

client.once('ready', async () => {
  console.log(`✅ Bot listo como ${client.user.tag}`);
  
  // Registrar comandos en cada servidor
  client.guilds.cache.forEach(async guild => {
    await guild.commands.set(commands);
  });
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'votacion') {
    const codigo = interaction.options.getString('codigo');
    const minimo = interaction.options.getInteger('minimo');
    const rol = interaction.options.getRole('rol');

    const embed = new EmbedBuilder()
      .setTitle('🔰 Votación de apertura 🔓')
      .setDescription(
        `- ¿Quieres disfrutar una experiencia inolvidable dentro del rol?\n` +
        `Pues vota ya para vivir una experiencia única en __**Españoles RP**__\n\n` +
        `- # Se necesitan mínimo **${minimo} ✅ votos** para poder abrir el servidor.\n\n` +
        `- **Código:** \`${codigo}\``
      )
      .setColor(0x00AE86)
      .setFooter({ text: 'Reacciona con ✅ para votar' });

    const mensaje = await interaction.reply({
      content: rol ? `||Ping ${rol}||` : null,
      embeds: [embed],
      fetchReply: true
    });

    await mensaje.react('✅');

    const collector = mensaje.createReactionCollector({
      filter: (reaction, user) => reaction.emoji.name === '✅' && !user.bot,
      dispose: true
    });

    collector.on('collect', async () => {
      const reaction = mensaje.reactions.cache.get('✅');
      const count = reaction ? reaction.count - 1 : 0;
      if (count >= minimo) {
        await mensaje.channel.send(
          `# 🤹🏻‍♂️ En actividad 🔓\n\n` +
          `- El servidor se encuentra abierto para tod@s, entra ya y no te pierdas de esta gran experiencia.\n` +
          `*Código: ${codigo}*\n\n` +
          `|| Ping: ${rol} ||`
        );
        collector.stop();
      }
    });
  }
});

client.login(process.env.DISCORD_TOKEN); 
