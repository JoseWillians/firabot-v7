import { WASocket, proto } from 'baileys'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { Command } from '../interfaces/Command.js'
import { saveLog, setUserState, getUserState } from '../functions/database.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const commands = new Map<string, Command>();

// Carregamento dinâmico de comandos da pasta /commands
const loadCommands = async () => {
  const commandsPath = path.join(__dirname, '../commands')
  if (!fs.existsSync(commandsPath)) return;
  const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'))
  for (const file of files) {
    const { default: cmd } = await import(`../commands/${file}`)
    if (cmd?.name) {
      commands.set(cmd.name, cmd)
      cmd.alias?.forEach((a: string) => commands.set(a, cmd))
    }
  }
}
loadCommands();

export const messageHandler = async (sock: WASocket, m: { messages: proto.IWebMessageInfo[] }) => {
  const msg = m.messages[0]
  if (!msg.message || msg.key!.remoteJid === 'status@broadcast') return

  // 1. FILTRO DE TEMPO (Evita responder mensagens antigas ao ligar o bot)
  const timestamp = (msg.messageTimestamp as number)
  const now = Math.floor(Date.now() / 1000)
  if (now - timestamp > 15) return 

  // Extração de dados
  const userJid = msg.key!.remoteJid!
  const userName = msg.pushName || 'Aluno(a)'
  const body = (msg.message.conversation || 
               msg.message.extendedTextMessage?.text || "").trim()

  const prefix = "!"
  const isCommand = body.startsWith(prefix)
  const isNumber = /^[0-9]+$/.test(body)

  // Só processa se for um comando com "!" ou um número isolado
  if (!isCommand && !isNumber) return

  // 2. COMANDO DE ENCERRAMENTO
  if (body.toLowerCase() === "!encerrar") {
    await sock.sendMessage(userJid, { text: "👋 *Atendimento Encerrado.*\nO Firabot v7 agradece o seu contato! Se precisar de algo novo, basta digitar !oi." })
    await setUserState(userJid, 'main')
    await saveLog(userJid, userName, 'Sessão Encerrada')
    return
  }

  // 3. TRATAMENTO DE COMANDOS TÉCNICOS (Com "!")
  if (isCommand) {
    const commandInput = body.slice(prefix.length).trim().toLowerCase()
    const args = commandInput.split(/ +/)
    const commandName = args.shift()

    // GATILHOS DE INÍCIO: !oi, !menu, !start, !ajuda
    if (['oi', 'menu', 'start', 'ajuda'].includes(commandName!)) {
      await sendWelcome(sock, userJid, userName) 
      
      if (commands.has('help')) {
        await commands.get('help')?.execute(sock, msg, [])
      }

      await new Promise(resolve => setTimeout(resolve, 1000))
      await sendMainMenu(sock, userJid) 
      await setUserState(userJid, 'main')
      await saveLog(userJid, userName, `Início: !${commandName}`)
      return 
    }

    // Execução de outros comandos registrados (!ping, etc)
    if (commandName && commands.has(commandName)) {
      await commands.get(commandName)?.execute(sock, msg, args)
      return 
    }
  }

  // 4. TRATAMENTO DE NAVEGAÇÃO POR NÚMEROS (Baseado em Estado)
  const currentState = await getUserState(userJid)

  // --- ESTADO: MENU PRINCIPAL ---
  if (currentState === 'main') {
    switch (body) {
      case "1":
        await sock.sendMessage(userJid, { text: "📚 *Biblioteca*: https://santaines.ifma.edu.br/biblioteca/" })
        await sendFollowUp(sock, userJid)
        break;

      case "2":
        const menuDocs = `📄 *DOCUMENTOS DISPONÍVEIS*\n\n` +
                         `Escolha uma opção digitando o número:\n\n` +
                         `1 - Requerimento Acadêmico\n` +
                         `2 - Requerimento Diploma Técnico\n` +
                         `3 - Requerimento Superior\n` +
                         `4 - Termo de Desistência\n\n` +
                         `0 - Voltar ao Menu Principal`
        await sock.sendMessage(userJid, { text: menuDocs })
        await setUserState(userJid, 'docs')
        break;

      case "3":
        const menuCurso = `🎓 *Engenharia de Computação - IFMA*\n\n` +
                         `Escolha uma opção sobre o curso:\n\n` +
                         `1 - PPC 2019 (abrange turmas até 2022)\n` +
                         `2 - PPC 2024 (a partir da turma 2023)\n\n` +
                         `0 - Voltar ao Menu Principal`
        await sock.sendMessage(userJid, { text: menuCurso })
        await setUserState(userJid, 'curso')
        break;

      case "4":
        await sock.sendMessage(userJid, { text: "🔗 *Links*: suap.ifma.edu.br | https://santaines.ifma.edu.br/" })
        await sendFollowUp(sock, userJid)
        break;

      case "5":
        await sock.sendMessage(userJid, { text: "🍴 *RU*: Almoço das 11:30 às 13:30." })
        await sendFollowUp(sock, userJid)
        break;

      case "6":
        await sock.sendMessage(userJid, { text: "👨‍💻 *Suporte*: Sua dúvida foi registrada." })
        await sendFollowUp(sock, userJid)
        break;

      default:
        if (isNumber) await sendMainMenu(sock, userJid)
        break;
    }
  } 
  
  // --- ESTADO: MENU DE DOCUMENTOS ---
  else if (currentState === 'docs') {
    switch (body) {
      case "1":
        await sock.sendMessage(userJid, { text: "👨‍💻 Um momento..." })
        await sendFile(sock, userJid, './documentos/drca/Requerimento Acadêmico.pdf', 'Req_Academico.pdf')
        await sendFollowUp(sock, userJid)
        break;
      case "2":
        await sock.sendMessage(userJid, { text: "👨‍💻 Um momento..." })
        await sendFile(sock, userJid, './documentos/drca/Requerimento Diploma Técnico.pdf', 'Req_Tecnico.pdf')
        await sendFollowUp(sock, userJid)
        break;
      case "3":
        await sock.sendMessage(userJid, { text: "👨‍💻 Um momento..." })
        await sendFile(sock, userJid, './documentos/drca/Requerimento Superior.pdf', 'Req_Superior.pdf')
        await sendFollowUp(sock, userJid)
        break;
      case "4":
        await sock.sendMessage(userJid, { text: "👨‍💻 Um momento..." })
        await sendFile(sock, userJid, './documentos/drca/Termo de Desistência.pdf', 'Termo_Desistencia.pdf')
        await sendFollowUp(sock, userJid)
        break;
      case "0":
        await sendMainMenu(sock, userJid)
        await setUserState(userJid, 'main')
        break;
      default:
        await sock.sendMessage(userJid, { text: "⚠️ Opção inválida." })
        break;
    }
  }

  // --- ESTADO: MENU DE CURSO (PPC) ---
  else if (currentState === 'curso') {
    switch (body) {
      case "1":
        await sock.sendMessage(userJid, { text: "👨‍💻 Um momento..." })
        await sendFile(sock, userJid, './documentos/ppc/ppc.eng_.comp_2022_.pdf', 'PPC - Engenharia de Computação 2022.pdf')
        await sendFollowUp(sock, userJid)
        break;
      case "2":
        await sock.sendMessage(userJid, { text: "👨‍💻 Um momento..." })
        await sendFile(sock, userJid, './documentos/ppc/ppc.eng_.comp_2024_.pdf', 'PPC - Engenharia de Computação 2024.pdf')
        await sendFollowUp(sock, userJid)
        break;
      case "0":
        await sendMainMenu(sock, userJid)
        await setUserState(userJid, 'main')
        break;
      default:
        await sock.sendMessage(userJid, { text: "⚠️ Opção inválida no menu de curso." })
        break;
    }
  }
}

// --- FUNÇÕES AUXILIARES ---

async function sendWelcome(sock: any, jid: string, name: string) {
  const welcomeText = `👋 Olá, *${name}*!\n\n` +
                      `Eu sou o *Firabot v7*, o assistente virtual dos estudantes do IFMA Santa Inês. 🤖💻\n\n` +
                      `Estou aqui para facilitar seu acesso a documentos e informações importantes. (Fase de testes)`
  await sock.sendMessage(jid, { text: welcomeText })
  await new Promise(resolve => setTimeout(resolve, 800))
}

async function sendFollowUp(sock: any, jid: string) {
  const followUpText = `🤖 *ASSISTENTE IFMA*\n\n` +
                       `Você deseja mais alguma coisa?\n\n` +
                       `0 - Voltar ao Menu Principal\n` +
                       `!encerrar - Terminar conversa\n\n` +
                       `_(Digite "!encerrar" para terminar a conversa)_`
  
  setTimeout(async () => {
    await sock.sendMessage(jid, { text: followUpText })
  }, 1500)
}

async function sendFile(sock: any, jid: string, filePath: string, fileName: string) {
  try {
    if (fs.existsSync(filePath)) {
      await sock.sendMessage(jid, { 
        document: fs.readFileSync(filePath), 
        mimetype: 'application/pdf', 
        fileName 
      })
    } else {
      await sock.sendMessage(jid, { text: "❌ Erro: Arquivo não encontrado no servidor." })
    }
  } catch (e) { console.error(e) }
}

export async function sendMainMenu(sock: any, jid: string) {
  const menuText = `🤖 *ASSISTENTE IFMA*\n\nEscolha uma opção digitando o número:\n\n1 - Biblioteca\n2 - Documentos\n3 - PPC do Curso\n4 - Links\n5 - RU\n6 - Suporte\n\n_Comandos: !ping, !help_`
  await sock.sendMessage(jid, { text: menuText })
}