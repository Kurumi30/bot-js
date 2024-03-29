const { BOT_EMOJI, TEMP_FOLDER, OPENAI_API_KEY } = require("../config")
const {
    extractDataFromMessage,
    downloadImage,
    downloadVideo,
    downloadSticker,
} = require("../utils")
const path = require("path")
const { exec } = require("child_process")
const fs = require("fs")
const { consultarCep } = require("correios-brasil")
const { errorMessage, warningMessage } = require("../utils/messages")
const axios = require("axios")

class Action {
    constructor(bot, baileysMessage) {
        const { remoteJid, args, isImage, isVideo, isSticker } = extractDataFromMessage(baileysMessage)

        this.bot = bot
        this.remoteJid = remoteJid
        this.args = args
        this.isImage = isImage
        this.isVideo = isVideo
        this.isSticker = isSticker
        this.baileysMessage = baileysMessage
    }

    async cep() {
        if (!this.args || ![8, 9].includes(this.args.length)) {
            await this.bot.sendMessage(this.remoteJid, {
                text: errorMessage('Você precisa enviar um CEP no formato xxxxx-xxx ou xxxxxxxx!'),
            })
            return
        }

        try {
            const { data } = await consultarCep(this.args)

            if (!data.cep) {
                await this.bot.sendMessage(this.remoteJid, {
                    text: warningMessage('CEP não encontrado!'),
                })
                return
            }

            const { cep, logradouro, complemento, bairro, localidade, uf, ibge } = data

            await this.bot.sendMessage(this.remoteJid, {
                text: `${BOT_EMOJI} *Resultado*:
                *CEP*: ${cep}
                *Logradouro*: ${logradouro}
                *Complemento*: ${complemento}
                *Bairro*: ${bairro}
                *Localidade*: ${localidade}
                *UF*: ${uf}
                *IBGE*: ${ibge}`
            })
        } catch (error) {
            console.error(error)

            await this.bot.sendMessage(this.remoteJid, {
                text: errorMessage(`Contate o proprietário do bot para resolver o problema!
                Erro: ${error.message}`),
            })
        }
    }

    async sticker() {
        if (!this.isImage && !this.isVideo) {
            await this.bot.sendMessage(this.remoteJid, {
                text: warningMessage('Você precisa enviar uma imagem ou um vídeo!'),
            })
            return
        }

        const outputPath = path.resolve(TEMP_FOLDER, "output.webp")

        if (this.isImage) {
            const inputPath = await downloadImage(this.baileysMessage, "input")

            exec(
                `ffmpeg -i ${inputPath} -vf scale=512:512 ${outputPath}`,
                async (error) => {
                    if (error) {
                        fs.unlinkSync(inputPath)

                        await this.bot.sendMessage(this.remoteJid, {
                            text: errorMessage('Ao converter a imagem para figurinha!'),
                        })

                        return
                    }

                    await this.bot.sendMessage(this.remoteJid, {
                        sticker: { url: outputPath },
                    })

                    fs.unlinkSync(inputPath)
                    fs.unlinkSync(outputPath)
                }
            )
        } else {
            const inputPath = await downloadVideo(this.baileysMessage, "input")
            const sizeInSeconds = 10
            const haveSecondsRule = seconds <= sizeInSeconds
            const seconds =
                this.baileysMessage.message?.videoMessage?.seconds ||
                this.baileysMessage.message?.extendedTextMessage?.contextInfo
                    ?.quotedMessage?.videoMessage?.seconds

            if (!haveSecondsRule) {
                fs.unlinkSync(inputPath)

                await this.bot.sendMessage(this.remoteJid, {
                    text: warningMessage(`O vídeo que você enviou tem mais de ${sizeInSeconds} segundos! 
                    Envie um vídeo menor!`),
                })

                return
            }

            exec(
                `ffmpeg -i ${inputPath} -y -vcodec libwebp -fs 0.99M -filter_complex "[0:v] scale=512:512,fps=12,pad=512:512:-1:-1:color=white@0.0,split[a][b];[a]palettegen=reserve_transparent=on:transparency_color=ffffff[p];[b][p]paletteuse" -f webp ${outputPath}`,
                async (error) => {
                    if (error) {
                        fs.unlinkSync(inputPath)

                        await this.bot.sendMessage(this.remoteJid, {
                            text: errorMessage('ao converter o vídeo/gif para figurinha!'),
                        })

                        return
                    }

                    await this.bot.sendMessage(this.remoteJid, {
                        sticker: { url: outputPath },
                    })

                    fs.unlinkSync(inputPath)
                    fs.unlinkSync(outputPath)
                }
            )
        }
    }

    async toImage() {
        if (!this.isSticker) {
            await this.bot.sendMessage(this.remoteJid, {
                text: errorMessage('Você precisa enviar um sticker!'),
            })
            return
        }

        const inputPath = await downloadSticker(this.baileysMessage, "input")
        const outputPath = path.resolve(TEMP_FOLDER, "output.png")

        exec(`ffmpeg -i ${inputPath} ${outputPath}`, async (error) => {
            if (error) {
                console.log(error)
                await this.bot.sendMessage(this.remoteJid, {
                    text: errorMessage('ao converter o sticker para figurinha!'),
                })
                return
            }

            await this.bot.sendMessage(this.remoteJid, {
                image: { url: outputPath },
            })

            fs.unlinkSync(inputPath)
            fs.unlinkSync(outputPath)
        })
    }

    async gpt() {
        await this.bot.sendMessage(this.remoteJid, {
            react: {
                text: '⏳',
                key: this.baileysMessage.key
            }
        })

        const { data } = await axios.post(
            `https://api.openai.com/v1/chat/completions`,
            {
                model: "gpt-3.5-turbo",
                messages: [{ role: "user", content: this.args }]
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${OPENAI_API_KEY}`
                }
            }
        )
        
        await this.bot.sendMessage(this.remoteJid, {
            react: {
                text: '✅',
                key: this.baileysMessage.key
            }
        })

        const responseText = data.choices[0].message.content

        await this.bot.sendMessage(this.remoteJid, {
            text: `${BOT_EMOJI} ${responseText}`,
        }, {
            quoted: this.baileysMessage,
        })
    }
}

module.exports = Action