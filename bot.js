console.log("Le bot démarre...");
require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const readline = require("readline");
const Bot_Token_Role = process.env.BOT_TOKEN_ROLE;
const Channel_Role_Id = process.env.CHANNEL_ROLE_ID;
const welcomeMessage = `Bienvenue dans le channel des rôles ! 🎭
    Ici, tu peux choisir les rôles qui correspondent à tes intérêts, ton niveau d'expertise et ton engagement au sein de la communauté ARAS. Les rôles permettent non seulement de mieux structurer les discussions, mais aussi d'obtenir un accès exclusif à certains contenus, événements et fonctionnalités du serveur.

    Si tu as des questions sur un rôle ou si tu n’es pas sûr de quel rôle choisir, n’hésite pas à contacter un modérateur ou un membre de l’équipe. Nous sommes là pour t'aider ! 🤗`;

const roles = {
  "📈": { name: "Achat-revente", id: "1339303733321793647" },
  "🎴": { name: "Pokemon", id: "1339303782810648636" },
  "💰": { name: "Crypto", id: "1339303827400036433" },
  "📊": { name: "Bourse", id: "1339303872866553856" },
  "⚽": { name: "Paris-Sportif", id: "1339303970782580766" },
  "💡": { name: "Astuce-Financière", id: "1339304190450733107" },
  "🎁": { name: "CashBack", id: "1339304311896932363" },
  "🤝": { name: "Parrainage", id: "1339304403387023431" },
  "🛍️": { name: "Test de Produit", id: "1339304515756752918" },
  "🏪": { name: "Brocante", id: "1339304554696540221" },
  "🏠": { name: "Location", id: "1339304588699766874" },
};

const MessageContent = `🎭 **Choisissez vos rôles** 🎭
Réagissez avec l'emoji correspondant pour recevoir ou retirer un rôle :

${Object.entries(roles)
  .map(([emoji, role]) => `${emoji} - **${role.name}**`)
  .join("\n")}

Si vous retirez votre réaction, le rôle vous sera enlevé.`;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.MessageContent,
  ],
});

client.on("ready", async () => {
  console.log(`✅ Connecté en tant que ${client.user.tag}`);

  try {
    const channel = await client.channels.fetch(Channel_Role_Id);
    await channel.send(welcomeMessage);
    const sentMessage = await channel.send(MessageContent);

    for (let emoji of Object.keys(roles)) {
      await sentMessage.react(emoji);
    }
  } catch (error) {
    console.error("Erreur lors de l'envoi du message des rôles:", error);
  }
});

client.on("messageReactionAdd", async (reaction, user) => {
  if (user.bot) return;
  if (!roles[reaction.emoji.name]) return;

  const guild = reaction.message.guild;
  const member = await guild.members.fetch(user.id);
  const role = guild.roles.cache.get(roles[reaction.emoji.name].id);

  if (role) {
    await member.roles.add(role);
    console.log(`✅ Ajout du rôle ${role.name} à ${user.username}`);
  }
});

client.on("messageReactionRemove", async (reaction, user) => {
  if (user.bot) return;
  if (!roles[reaction.emoji.name]) return;

  const guild = reaction.message.guild;
  const member = await guild.members.fetch(user.id);
  const role = guild.roles.cache.get(roles[reaction.emoji.name].id);

  if (role) {
    await member.roles.remove(role);
    console.log(`❌ Suppression du rôle ${role.name} à ${user.username}`);
  }
});

client.login(Bot_Token_Role);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function clearChannel(channelId) {
  try {
    const channel = await client.channels.fetch(channelId);
    if (!channel.isTextBased()) {
      console.log("❌ Ce n'est pas un channel textuel.");
      return;
    }

    let messages;
    do {
      messages = await channel.messages.fetch({ limit: 100 });
      await channel.bulkDelete(messages);
    } while (messages.size >= 2);

    console.log("✅ Le channel a été vidé !");
  } catch (error) {
    console.error("❌ Erreur lors du clear du channel:", error);
  }
}

rl.on("line", async (input) => {
  if (input.trim() === "clear") {
    console.log("🧹 Suppression des messages...");
    await clearChannel(Channel_Role_Id);
  }
});
