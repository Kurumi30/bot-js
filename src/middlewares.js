const { BOT_EMOJI } = require('./config')
const {
    isCommand,
    extractDataFromMessage
} = require('./utils')
const Action = require('./actions')
const { menuMessage } = require('./utils/messages')

async function middlewares(bot) {
    bot.ev.on('messages.upsert', async ({ messages }) => {
        const baileysMessage = messages[0]

        if (!baileysMessage?.message || !isCommand(baileysMessage)) {
            return
        }

        const action = new Action(bot, baileysMessage)
        const { command, remoteJid } = extractDataFromMessage(baileysMessage)

        switch (command.toLowerCase()) {
            case "cep":
                await action.cep()
                break
            case 'f':
            case 'fig':
                await action.sticker()
                break
            case 'menu':
            case 'help':
                await bot.sendMessage(remoteJid, { text: `${BOT_EMOJI}\n\n${menuMessage()}` })
                break
            case 'ping':
                await bot.sendMessage(remoteJid, { text: `${BOT_EMOJI} Pong!` })
                break
            case 'toimage':
            case 'toimg':
                await action.toImage()
                break
            case 'gpt':
                await action.gpt()
                break
        }
    })
}

module.exports = middlewares