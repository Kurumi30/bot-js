const { BOT_EMOJI, BOT_NAME, PREFIX, BOT_OWNER } = require("../config");

function errorMessage(message) {
    return `${BOT_EMOJI} ❌ Erro! ${message}`
}

function warningMessage(message) {
    return `${BOT_EMOJI} ⚠ Atenção! ${message}`
}

function menuMessage() {
    const date = new Date()

    return `
    ╭━━⪩ BEM VINDO! ⪨━━
    ▢ 
    ▢ • ${BOT_NAME}
    ▢ • Data: ${date.toLocaleDateString("pt-br")}
    ▢ • Hora: ${date.toLocaleTimeString("pt-br")}
    ▢ • Prefixo: ${PREFIX}
    ▢ 
    ╰━━─「🪐」─━━

    ╭━━⪩ MENU ⪨━━
    ▢ 
    ▢ • ${PREFIX}cep
    ▢ • ${PREFIX}ping
    ▢ • ${PREFIX}sticker
    ▢ • ${PREFIX}toimage
    ▢ 
    ╰━━─「🚀」─━━
    Criado por: ${BOT_OWNER}
    `
}

module.exports = {
    errorMessage,
    menuMessage,
    warningMessage
}