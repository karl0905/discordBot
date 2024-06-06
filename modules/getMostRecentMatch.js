const fs = require('fs')

function getMostRecentMatch() {
  try {
    const mostRecentMatchParsed = JSON.parse(fs.readFileSync('./public/mostRecentMatch.json', 'utf8'));
    const mostRecentMatch = mostRecentMatchParsed.mostRecentMatch
    return mostRecentMatch;
  } catch (error) {
    console.error('Error reading JSON file getMostRecentMatch:', error)
  }
}

module.exports = getMostRecentMatch;
