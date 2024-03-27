const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');
require('dotenv').config();
const prefix = "!";

// Create a new client instance
const token = process.env.TOKEN;
const client = new Client({ intents: [
  GatewayIntentBits.Guilds,
  GatewayIntentBits.GuildMessages,
  GatewayIntentBits.MessageContent, 
] });

client.on('messageCreate', message => {
  console.log(message.content);
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'ping') {
    message.channel.send('Pong.');
  } else if (command === 'hello') {
    message.channel.send(`Hello!, ${message.author}`);
  }
});

// When the client is ready, run this code (only once)
client.once(Events.ClientReady, readyClient => {
  console.log(`Ready! Logged in as ${readyClient.user.tag}`);
});

// Log in to Discord with your client's token
client.login(token);
