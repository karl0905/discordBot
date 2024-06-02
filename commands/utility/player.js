const { SlashCommandBuilder, inlineCode, EmbedBuilder } = require('discord.js');
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
        const assists = matchingParticipant.assists;
        const champion = matchingParticipant.championName;
        const lane = matchingParticipant.lane.charAt(0).toUpperCase() + matchingParticipant.lane.slice(1).toLowerCase();
        const role = matchingParticipant.role
        const totalMinionsKilled = matchingParticipant.totalMinionsKilled
        const totalDamageDealtToChampions = matchingParticipant.totalDamageDealtToChampions
        const pentaKills = matchingParticipant.pentaKills
        const win = matchingParticipant.win
        const tripleKills = matchingParticipant.tripleKills
        const totalDamageTaken = matchingParticipant.totalDamageTaken
        const spell1Casts = matchingParticipant.spess1Casts

        const gameDuration = matchData.info.gameDuration
        const gameMode = matchData.info.gameMode

        let regularFieldDescription

        if (kills > deaths) {
          regularFieldDescription = "Jacob spillede godt 8)"
        } else {
          regularFieldDescription = "Jacob spillede ik så godt :("
        }
        const message = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle('Review af Jacobs nyeste game!!')
          // lav evt. link til u.gg med summoner_name og summoner_tagline
          // .setURL('https://discord.js.org/')
          .setAuthor({ name: 'League Alert', iconURL: 'https://cdn.discordapp.com/app-icons/1222181268951662715/2c950cf3bd405b63cefaa70cbacdbe77.png?size=512&quot' })
          .setDescription('Besked der skriver at Jacob inter')
          .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/14.11.1/img/champion/${champion}.png`)
          .addFields(
            { name: 'Hvordan klarede Jacob det?', value: `${regularFieldDescription}` },
            { name: '\u200A', value: '\u200A' },
            { name: 'Champion', value: `${champion}`, inline: true },
            { name: 'Lane', value: `${lane}`, inline: true },
            { name: 'Role', value: `${role}`, inline: true },
          )
          .addFields(
            { name: '\u200A', value: '\u200A' },
            { name: 'Kills', value: `${kills}`, inline: true },
            { name: 'Deaths', value: `${deaths}`, inline: true },
            { name: 'Assists', value: `${assists}`, inline: true },
            { name: '\u200A', value: '\u200A' },
            { name: 'Creep Score', value: `${totalMinionsKilled}`, inline: true },
          )
          .setTimestamp()
          .setFooter({ text: 'Bot developed by Jacobs number one hater', iconURL: 'https://cdn.discordapp.com/app-icons/1222181268951662715/2c950cf3bd405b63cefaa70cbacdbe77.png?size=512&quot' });

        await interaction.reply({ embeds: [message] })

        // const message = `
        // Champion: ${champion} 
        // Kills: ${kills} 
        // Deaths: ${deaths} 
        // Lane: ${lane}
        // `;
        //
        // await interaction.reply(message);

      } else {
        console.log('No participants found with the specified puuid');
      }

    } catch (error) {
      console.error(error);
      await interaction.reply('There was an error processing your request.')
    }
  },
};

