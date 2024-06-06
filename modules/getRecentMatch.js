const riotapi = process.env.RIOTAPI
const axios = require('axios')
let gameName = process.env.STATICGAMENAME
const tagLine = process.env.STATICTAGLINE
gameName = gameName.replace(/ /g, '%20');

async function getRecentMatch() {
  const response = await axios.get(`https://europe.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${gameName}/${tagLine}?api_key=${riotapi}`);
  const playerPuuid = response.data.puuid
  const newResponse = await axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/by-puuid/${playerPuuid}/ids?start=0&count=20&api_key=${riotapi}`);
  // console.log(newResponse);
  const matches = newResponse.data;
  const matchId = matches[0];
  const matchResponse = await axios.get(`https://europe.api.riotgames.com/lol/match/v5/matches/${matchId}?api_key=${riotapi}`)
  const matchData = matchResponse.data;
  const matchingParticipant = matchData.info.participants.find(obj => obj.puuid === playerPuuid);

  return { playerPuuid, matchData, matchId};
}

module.exports = getRecentMatch;
