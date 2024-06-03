const fs = require('fs')

try {
  const jsonData = JSON.parse(fs.readFileSync('./public/descriptions.json', 'utf8'));
  module.exports = jsonData
} catch (error) {
  console.error('Error readin JSON file:', error)
}

