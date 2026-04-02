import { Command } from '../interfaces/Command.js'

const pingCommand: Command = {
  name: 'ping',
  description: 'Verifica se o bot está online',
  execute: async (sock, msg, args) => {
    await sock.sendMessage(msg.key!.remoteJid!, { text: 'O Firabot está ativo!' })
  }
}

export default pingCommand;