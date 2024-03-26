const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });
const prefix = '!'; // Command prefix
const token = process.env.TOKEN; // Discord bot token
const API = 'https://euw.api.riotgames.com';
const PERSONAL_API = process.env.PERSONAL_API; // Personal Riot API key

client.on('message', async message => {
  try {
    if (!message.content.startsWith(prefix) || message.author.bot) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    if (command === 'ping') {
      message.channel.send('Pong!');
    } else if (command === 'matches') {
      try {
        const response = await axios.get(`${API}/endpoint`, {
          headers: {
            'X-Riot-Token': PERSONAL_API
          }
        });

        // Process the response and send it to the Discord channel
        message.channel.send('Match data: ' + JSON.stringify(response.data));
      } catch (error) {
        console.error('Error fetching match data:', error);
        message.channel.send('An error occurred while fetching match data.');
      }
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
});

client.once('ready', () => {
  console.log('Bot is ready!');
});

client.login(token);
