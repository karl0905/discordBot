// Badge refresh
// File system module - Node's native - used to read commands dir
const fs = require('node:fs');
// Path utility to construct paths to access files and dirs
const path = require('node:path');
require('dotenv').config();
const cron = require('node-cron');
const buildNotificationEmbed = require('./modules/notificationEmbed.js')
const getRecentMatch = require('./modules/getRecentMatch.js')
const getDescriptions = require('./modules/getDescriptions.js')
const getMostRecentMatch = require('./modules/getMostRecentMatch.js')
const writeMostRecentMatch = require('./modules/writeMostRecentMatch.js')

const { Client, Collection, Events, GatewayIntentBits } = require('discord.js');


// Collection class extends JavaScripts native Map class, and has more extensive and useful functionality.
// Used to store and effeciently retrieve commands for execution

// Create a new client instance
const token = process.env.TOKEN;
const channelId = process.env.channelId
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    // GatewayIntentBits.GuildMessages,
    // GatewayIntentBits.MessageContent,
  ]
});
client.commands = new Collection();

// Importing commands from commands folder using fs and path
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ('data' in command && 'execute' in command) {
      client.commands.set(command.data.name, command);
    } else {
      console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
    }
  }
}

const eventsPath = path.join(__dirname, 'events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Log in to Discord with your client's token
client.login(token);

client.once('ready', () => {
  console.log('klar');

  // Schedule a task to run every 2 minutes
  cron.schedule('*/2 * * * *', async () => {
    try {
      const { playerPuuid, matchData, matchId } = await getRecentMatch();
      const descriptions = getDescriptions()
      const mostRecentMatch = getMostRecentMatch();
      if (matchId === mostRecentMatch) {
        console.log('no new game. returning')
        return;
      } else {
        console.log('new game - discord message sent')
        writeMostRecentMatch({ mostRecentMatch: matchId })
        await buildNotificationEmbed(playerPuuid, matchData, client, descriptions, channelId);
      }
    } catch (error) {
      console.error('Error in scheduled task:', error)
    }
  })
})
