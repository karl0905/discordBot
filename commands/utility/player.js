const { SlashCommandBuilder } = require('discord.js');
require('dotenv').config();
const axios = require('axios')

const riotapi = process.env.RIOTAPI

module.exports = {
  data: new SlashCommandBuilder()
    .setName('player')
    .setDescription('Responds with player')
  // Kig på Modals 
  // discord.js
    .addStringOption(option =>
      option.setName('summoner_name')
        .setDescription('The name of the summoner'))
    .addStringOption(option =>
      option.setName('summoner_tagline')
        .setDescription('The hashtag of the summoner without hashtag')),
  async execute(interaction) {
    try {
      let gameName = interaction.options.get('summoner_name');
      const tagLine = interaction.options.getString('summoner_tagline')

      gameName = gameName.value.replace(/ /g, '%20');

      const response = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${riotapi}`);
      const playerPuuid = response.data.puuid
      const newResponse = await axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${playerPuuid}/ids?start=0&count=20&api_key=${riotapi}`);
      console.log(newResponse);
      const matches = newResponse.data;
      const matchId = matches[0];
      const matchResponse = await axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${riotapi}`)
      const matchData = matchResponse.data;
      const matchingParticipant = matchData.info.participants.find(obj => obj.puuid === playerPuuid);

      if (matchingParticipant) {
        const kills = matchingParticipant.kills;
        const deaths = matchingParticipant.deaths;
        const champion = matchingParticipant.championName;
        const lane = matchingParticipant.lane.charAt(0).toUpperCase() + matchingParticipant.lane.slice(1).toLowerCase();
        await interaction.reply(`Champion: ${champion} Kills: ${kills} Deaths: ${deaths} Lane: ${lane}`);
      } else {
        console.log('No participants found with the specified puuid');
      }
    } catch (error) {
      console.error(error);
      await interaction.reply('There was an error processing your request.')
    }
  },
};

