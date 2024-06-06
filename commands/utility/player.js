const { SlashCommandBuilder, inlineCode, EmbedBuilder } = require('discord.js');
require('dotenv').config();
const axios = require('axios')
const riotapi = process.env.RIOTAPI
const descriptions = require('../../modules/getDescriptions.js')
const cron = require('node-cron');

console.log("descriptions", descriptions)
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
        const cs = matchingParticipant.totalMinionsKilled + matchingParticipant.neutralMinionsKilled
        const totalDamageDealtToChampions = matchingParticipant.totalDamageDealtToChampions
        const win = matchingParticipant.win
        const doubleKills = matchingParticipant.doubleKills
        const tripleKills = matchingParticipant.tripleKills
        const quadraKills = matchingParticipant.quadraKills
        const pentaKills = matchingParticipant.pentaKills
        const totalDamageTaken = matchingParticipant.totalDamageTaken
        const spell1Casts = matchingParticipant.spell1Casts

        const gameDuration = matchData.info.gameDuration
        const csPerMinute = cs / (gameDuration / 60)

        let descriptionType
        if (win === true) {
          descriptionType = "win";
        } else {
          descriptionType = "lose";
        }

        const randomDescritionIndex = Math.floor(Math.random() * descriptions[descriptionType].descriptions.length);
        const randomDescription = descriptions[descriptionType].descriptions[randomDescritionIndex];

        const overallPerformance = (() => {
          switch (true) {
            case pentaKills > 0:
              return "PEEENTAAA RAAAAAHH 🗣️🔥🔥"
            case kills > 20:
              return "En absolut gud RAAAH 🗣️🔥🔥"
            case kills + assists > deaths:
              return "Positiv KDA, godt min dreng"
            case kills + assists < deaths:
              return "Måske du skal uninstall, baus wannabe?"
          }
        })();

        // If big damage taken, display
        let tank;
        if (totalDamageTaken > 50000) {
          tank = true
        }

        // Switch to determine kill message 
        const killMessage = (() => {
          switch (true) {
            case pentaKills > 0:
              return `Penta Kills: ${pentaKills}`;
            case quadraKills > 0:
              return `Quadra Kills: ${quadraKills}`;
            case tripleKills > 0:
              return `Triple Kills: ${tripleKills}`;
            case doubleKills > 0:
              return `Double Kills: ${doubleKills}`;
            default:
              return 'No Multi-Kills';
          }
        })();

        // Embedded message defined here
        const message = new EmbedBuilder()
          .setColor(0x0099FF)
          .setTitle('Nyt game ALERT')
          // lav evt. link til u.gg med summoner_name og summoner_tagline
          // .setURL('https://discord.js.org/')
          .setAuthor({ name: 'League Alert', iconURL: 'https://cdn.discordapp.com/app-icons/1222181268951662715/2c950cf3bd405b63cefaa70cbacdbe77.png?size=512&quot' })
          .setDescription(`${randomDescription}`)
          .setThumbnail(`https://ddragon.leagueoflegends.com/cdn/14.11.1/img/champion/${champion}.png`)
          .addFields(
            ...(killMessage !== 'No Multi-Kills') ? [{ name: 'Multi kills', value: `${killMessage}` }] : [],
          )
          .addFields(
            { name: '\u200A', value: '\u200A' },
            { name: 'Game duration', value: `${(gameDuration / 60).toFixed(2)} min.`, inline: true },
            { name: 'Result', value: (win) ? 'Win' : 'Loss', inline: true },
            { name: '\u200A', value: '\u200A' },
          )
          .addFields(
            { name: 'Champion', value: `${champion}`, inline: true },
            { name: 'Lane', value: `${lane}`, inline: true },
          )
          .addFields(
            { name: '\u200A', value: '\u200A' },
            { name: 'KDA', value: `${kills} / ${deaths} / ${assists}`, inline: true },
            { name: 'Damage Dealt to Champions', value: `${totalDamageDealtToChampions.toLocaleString().replace(/,/g, ".")}`, inline: true },
            { name: '\u200A', value: '\u200A' },
            { name: 'Creep Score', value: `${cs}`, inline: true },
            { name: 'CS per minute', value: `${csPerMinute.toFixed(1)}`, inline: true },
            { name: '\u200A', value: '\u200A' },
            ...(tank) ? [{ name: 'ABSOLUTE TANK', value: `${totalDamageTaken.toLocaleString().replace(/,/g, '.')} damage tanked`, inline: true }] : [],
            ...(spell1Casts > 60) ? [{ name: 'Bror spammede Q', value: `${spell1Casts} gange`, inline: true }] : [],
          )
          .addFields(
            { name: '\u200A', value: '\u200A' },
            { name: 'Overall performance', value: `${overallPerformance}` },
          )
          .setTimestamp()
          .setFooter({ text: 'Bot developed by Jacobs number one hater', iconURL: 'https://cdn.discordapp.com/app-icons/1222181268951662715/2c950cf3bd405b63cefaa70cbacdbe77.png?size=512&quot' });

        await interaction.reply({ embeds: [message] })

      } else {
        console.log('No participants found with the specified puuid');
      }

    } catch (error) {
      console.error(error);
      await interaction.reply('There was an error processing your request.')
    }
  },
};

