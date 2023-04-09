const path = require('path')

const PREFIX = '/'
const BOT_EMOJI = '🤖'
const BOT_NAME = 'Bot Angstrom'
const BOT_OWNER = 'Fernando' //created by me
// const OWNER_NUMBER = ''
const TEMP_FOLDER = path.resolve(__dirname, '..', 'assets', 'temp')

const OPENAI_API_KEY = ""

module.exports = {
    BOT_EMOJI,
    BOT_NAME,
    BOT_OWNER,
    PREFIX,
    TEMP_FOLDER,
    OPENAI_API_KEY
}