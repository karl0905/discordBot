const fs = require('fs')

function getDescriptions() {
  try {
    const jsonData = JSON.parse(fs.readFileSync('./public/descriptions.json', 'utf8'));
    return jsonData;
  } catch (error) {
    console.error('Error readin JSON file descriptions:', error)
  }
}

module.exports = getDescriptions;
