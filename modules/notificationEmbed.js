const { EmbedBuilder } = require('discord.js');

async function buildNotificationEmbed(playerPuuid, matchData, client, descriptions) {
  try {
    const matchingParticipant = matchData.info.participants.find(obj => obj.puuid === playerPuuid);
    const {
      kills,
      deaths,
      assists,
      championName: champion,
      lane: rawLane,
      totalMinionsKilled,
      neutralMinionsKilled,
      totalDamageDealtToChampions,
      win,
      doubleKills,
      tripleKills,
      quadraKills,
      pentaKills,
      totalDamageTaken,
      spell1Casts,
    } = matchingParticipant;

    const lane = rawLane.charAt(0).toUpperCase() + matchingParticipant.lane.slice(1).toLowerCase();
    const cs = totalMinionsKilled + neutralMinionsKilled;
    const gameDuration = matchData.info.gameDuration;
    const csPerMinute = cs / (gameDuration / 60);

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
    const notificationEmbed = new EmbedBuilder()
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
        { name: 'Champion', value: `${champion}`, inline: true },
        { name: 'Lane', value: `${lane}`, inline: true },
        { name: '\u200A', value: '\u200A' },
        { name: 'KDA', value: `${kills} / ${deaths} / ${assists}`, inline: true },
        { name: 'Damage Dealt to Champions', value: `${totalDamageDealtToChampions.toLocaleString().replace(/,/g, ".")}`, inline: true },
        { name: '\u200A', value: '\u200A' },
        { name: 'Creep Score', value: `${cs}`, inline: true },
        { name: 'CS per minute', value: `${csPerMinute.toFixed(1)}`, inline: true },
        { name: '\u200A', value: '\u200A' },
        ...(tank) ? [{ name: 'ABSOLUTE TANK', value: `${totalDamageTaken.toLocaleString().replace(/,/g, '.')} damage tanked`, inline: true }] : [],
        ...(spell1Casts > 60) ? [{ name: 'Bror spammede Q', value: `${spell1Casts} gange`, inline: true }] : [],
        { name: '\u200A', value: '\u200A' },
        { name: 'Overall performance', value: `${overallPerformance}` },
      )
      .setTimestamp()
      .setFooter({ text: 'Bot developed by Jacobs number one hater', iconURL: 'https://cdn.discordapp.com/app-icons/1222181268951662715/2c950cf3bd405b63cefaa70cbacdbe77.png?size=512&quot' });

    const targetChannel = client.channels.cache.get('799741154635546628');
    if (targetChannel) {
      targetChannel.send({ embeds: [notificationEmbed] })
    } else {
      console.log('Channel not found :(')
    }
  } catch (error) {
    console.error(error);
  }
}

module.exports = buildNotificationEmbed;
