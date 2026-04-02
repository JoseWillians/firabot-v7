import { Command } from '../interfaces/Command.js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const helpCommand: Command = {
  name: 'help',
  description: 'Lista todos os comandos disponíveis e a finalidade do bot',
  alias: ['ajuda', 'menu'],
  execute: async (sock, msg, args) => {
    const commandsPath = path.join(__dirname, '../commands')
    const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'))

    // --- CABEÇALHO: FINALIDADE DO BOT ---
    let menu = "*🤖 FIRABOT v7 - ASSISTENTE ACADÊMICO*\n"
    menu += "_Finalidade: Centralizar e facilitar o acesso a informações, links e documentos do IFMA Santa Inês._\n\n"
    
    menu += "*📋 RESUMO DE COMANDOS TÉCNICOS:*\n"
    
    // Adicionamos o !oi manualmente pois ele é o gatilho principal
    menu += "*!oi*: Começa o menu inicial de navegação\n"

    // --- LOOP AUTOMÁTICO PARA OS OUTROS COMANDOS ---
    for (const file of files) {
      // Importa dinamicamente cada comando para ler o name e description
      const { default: cmd } = await import(`./${file}`)
      if (cmd?.name && cmd.name !== 'oi' && cmd.name !== 'help') { 
        menu += `*!${cmd.name}*: ${cmd.description}\n`
      }
    }

    // --- RODAPÉ: INSTRUÇÕES ---
    menu += "\n*💡 DICA:* Para navegar nos menus de Biblioteca, Documentos ou Curso, basta digitar apenas o número da opção (ex: 1, 2) após iniciar com !oi.\n\n"
    menu += "_Use o prefixo ! para comandos de sistema._"

    await sock.sendMessage(msg.key!.remoteJid!, { text: menu })
  }
}

export default helpCommand