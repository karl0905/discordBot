const fs = require('fs')

function writeMostRecentMatch(content) {
  try {
    fs.writeFileSync('./public/mostRecentMatch.json', JSON.stringify(content, null, 2), 'utf8');
    console.log('file written succesfully')
  } catch (error) {
    console.error('Error writing to JSON file mostRecentMatch:', error)
  }
}

module.exports = writeMostRecentMatch;
