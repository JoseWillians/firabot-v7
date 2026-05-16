import { WASocket, proto } from 'baileys'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'
import { Command } from '../interfaces/Command.js'
import { config } from '../config.js'
import { UserState } from '../menus/types.js'
import { docsCategoryMenu, emptyCaeDocsMenu } from '../menus/docsMenu.js'
import { formatCourseMenu, formatEngineeringComputerPpcMenu, formatMainMenu, formatMenu, getMenuNameByState, isNumericOption } from '../services/menuService.js'
import { formatDocumentsMenu, findDocumentByOption, sendDocument } from '../services/documentService.js'
import { getCurrentUserState, updateUserState } from '../services/userStateService.js'
import { botLog, debugLog, registerUserLog } from '../services/logService.js'
import { canRespondToUser } from '../services/spamGuardService.js'
import { getMenuRouteForOption } from '../services/menuRoutingService.js'
import { extractMessageText } from '../services/messageTextService.js'
import {
  getMessageTimestamp,
  isGreetingOrStartMessage,
  isMessageFromBeforeStart,
  isPrefixedCommand
} from '../services/messageGuardService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const commands = new Map<string, Command>()

interface MessageHandlerOptions {
  startedAt: number
}

const loadCommands = async () => {
  const commandsPath = path.join(__dirname, '../commands')
  if (!fs.existsSync(commandsPath)) return

  commands.clear()
  const files = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts') || file.endsWith('.js'))
  for (const file of files) {
    const { default: cmd } = await import(`../commands/${file}`)
    if (cmd?.name) {
      commands.set(cmd.name, cmd)
      cmd.alias?.forEach((alias: string) => commands.set(alias, cmd))
    }
  }
}

const commandsReady = loadCommands().catch(error => {
  console.error('Erro ao carregar comandos:', error)
})

export const messageHandler = async (sock: WASocket, m: { messages: proto.IWebMessageInfo[] }, options: MessageHandlerOptions) => {
  const msg = m.messages[0]
  const remoteJid = msg.key?.remoteJid
  if (!remoteJid) return

  /**
   * Primeira barreira contra spam involuntário.
   * Ignora mensagens sem conteúdo, status/broadcasts, mensagens enviadas pelo
   * próprio bot e, por padrão, grupos. O atendimento acadêmico atual é 1:1.
   */
  if (!msg.message || remoteJid === 'status@broadcast') return

  if (msg.key?.fromMe) {
    debugLog('Mensagem ignorada por ter sido enviada pelo próprio bot', { eventType: 'MESSAGE_IGNORED_SELF' })
    return
  }

  if (config.ignoreGroups && remoteJid?.endsWith('@g.us')) {
    debugLog('Mensagem de grupo ignorada pela configuração atual', { eventType: 'MESSAGE_IGNORED_GROUP', user: remoteJid })
    return
  }

  /**
   * Ignora mensagens enviadas antes da inicialização do bot.
   * Isso evita que o Baileys reprocesse backlog de conversas antigas e cause
   * respostas em massa quando o serviço reinicia.
   */
  const timestamp = getMessageTimestamp(msg)
  if (isMessageFromBeforeStart(timestamp, options.startedAt)) {
    debugLog('Mensagem antiga ignorada', { eventType: 'MESSAGE_IGNORED_OLD', user: remoteJid, timestamp, startedAt: options.startedAt })
    return
  }

  const userJid = remoteJid
  const userName = msg.pushName || 'Aluno(a)'
  const body = extractMessageText(msg.message)

  if (!body) return

  const currentState = await getCurrentUserState(userJid)
  botLog('MESSAGE_RECEIVED', 'Mensagem recebida', {
    user: userJid,
    text: body,
    stateBefore: currentState
  })

  /**
   * Comandos com "!" são reservados para funções técnicas/administrativas.
   * Mensagens normais seguem o fluxo conversacional e dependem do estado atual.
   */
  if (isPrefixedCommand(body)) {
    await processCommand(sock, msg, body, userJid, userName, currentState)
    return
  }

  /**
   * Encerramento sem prefixo é parte do fluxo conversacional comum.
   * Mantemos !encerrar como comando técnico, mas usuários em submenus podem
   * finalizar digitando apenas "encerrar", como previsto no fluxograma.
   */
  if (body.trim().toLowerCase() === 'encerrar') {
    await sendEndFlow(sock, userJid, userName, currentState)
    return
  }

  /**
   * Anti-spam leve por usuário + texto.
   * Ele bloqueia repetições imediatas da mesma mensagem, mas permite navegação
   * normal por opções diferentes, como "2" seguido de "3".
   */
  if (!canRespondToUser(`${userJid}:${body.toLowerCase()}`)) {
    debugLog('Resposta ignorada por proteção anti-spam', { eventType: 'RATE_LIMITED', user: userJid, body })
    return
  }

  /**
   * Números são roteados antes de saudações para preservar o estado.
   * Se o usuário está em docs/curso, uma opção numérica nunca deve ser tratada
   * como opção do menu principal.
   */
  if (isNumericOption(body)) {
    await processMenuOption(sock, userJid, userName, body, currentState)
    return
  }

  /**
   * Saudações e intenções de início sem prefixo reiniciam o atendimento no menu
   * principal. Isso deixa o fluxo natural para usuários comuns.
   */
  if (isGreetingOrStartMessage(body)) {
    await sendStartFlow(sock, userJid, userName, `Início: ${body}`)
    return
  }

  await sendUnknownMessage(sock, userJid, currentState)
  await registerUserLog(userJid, userName, `Mensagem não compreendida: ${body}`, currentState, 'INVALID_OPTION', { stateBefore: currentState, success: false })
}

async function processCommand(
  sock: WASocket,
  msg: proto.IWebMessageInfo,
  body: string,
  userJid: string,
  userName: string,
  currentState: UserState
) {
  /**
   * !encerrar é tratado antes do carregamento dinâmico para funcionar mesmo que
   * algum comando plugável esteja com erro de importação.
   */
  if (body.toLowerCase() === '!encerrar') {
    await sendEndFlow(sock, userJid, userName, currentState)
    return
  }

  await commandsReady

  /**
   * Os demais comandos continuam plugáveis na pasta commands.
   * !oi/!menu são mantidos por compatibilidade com usuários antigos.
   */
  const commandInput = body.slice(1).trim().toLowerCase()
  const args = commandInput.split(/ +/)
  const commandName = args.shift()

  if (commandName && ['oi', 'menu', 'start', 'ajuda'].includes(commandName)) {
    await sendStartFlow(sock, userJid, userName, `Início: !${commandName}`)
    return
  }

  if (commandName && commands.has(commandName)) {
    await commands.get(commandName)?.execute(sock, msg, args)
    await registerUserLog(userJid, userName, `Comando: !${commandName}`, currentState, 'COMMAND_EXECUTED', { command: commandName, success: true })
    return
  }

  await sock.sendMessage(userJid, { text: '⚠️ Comando não reconhecido. Use !help para ver os comandos disponíveis.' })
  await registerUserLog(userJid, userName, `Comando desconhecido: ${body}`, currentState, 'COMMAND_UNKNOWN', { command: body, success: false })
}

async function processMenuOption(
  sock: WASocket,
  userJid: string,
  userName: string,
  option: string,
  currentState: UserState
) {
  /**
   * A opção 0 volta ao menu principal apenas a partir de submenus.
   * No menu principal ela deve ser tratada como inválida, pois o menu inicial
   * não exibe "0 - Voltar".
   */
  if (option === '0' && currentState !== 'main') {
    await sendMainMenu(sock, userJid)
    const stateAfter = await updateUserState(userJid, 'main')
    botLog('MENU_OPTION_SELECTED', 'Opção processada', { user: userJid, option, menu: getMenuNameByState(currentState), stateBefore: currentState, stateAfter })
    await registerUserLog(userJid, userName, 'Voltou ao menu principal', currentState, 'USER_STATE_CHANGED', { stateBefore: currentState, stateAfter, menu: 'menu principal', success: true })
    return
  }

  if (isInformationalSubmenuState(currentState)) {
    await sendUnknownMessage(sock, userJid, currentState)
    await registerUserLog(userJid, userName, `Opção inválida em ${getMenuNameByState(currentState)}: ${option}`, currentState, 'INVALID_OPTION', { menu: getMenuNameByState(currentState), success: false })
    return
  }

  const route = getMenuRouteForOption(currentState, option)

  if (route === 'docs') {
    await processDocsCategoryOption(sock, userJid, userName, option, currentState)
    return
  }

  if (route === 'docs_drca') {
    await processDrcaDocsOption(sock, userJid, userName, option, currentState)
    return
  }

  if (route === 'docs_cae') {
    await processCaeDocsOption(sock, userJid, userName, option, currentState)
    return
  }

  if (route === 'curso') {
    await processCourseSelectionOption(sock, userJid, userName, option, currentState)
    return
  }

  if (route === 'curso_eng_comp') {
    await processEngineeringComputerPpcOption(sock, userJid, userName, option, currentState)
    return
  }

  await processMainOption(sock, userJid, userName, option, currentState)
}

async function processMainOption(sock: WASocket, userJid: string, userName: string, option: string, currentState: UserState) {
  /**
   * O menu principal decide apenas destinos de alto nível.
   * Submenus persistem estado antes de aguardar a próxima opção do usuário.
   */
  switch (option) {
    case '1':
      await sock.sendMessage(userJid, { text: '📚 *Biblioteca*: https://santaines.ifma.edu.br/biblioteca/' })
      await sendFollowUp(sock, userJid)
      await updateUserState(userJid, 'biblioteca')
      await registerUserLog(userJid, userName, 'Menu principal: Biblioteca', currentState, 'MENU_OPTION_SELECTED', { menu: 'menu principal', stateAfter: 'biblioteca', success: true })
      break

    case '2': {
      await sock.sendMessage(userJid, { text: formatMenu(docsCategoryMenu) })
      const stateAfter = await updateUserState(userJid, 'docs')
      botLog('MENU_OPENED', 'Opção processada', { user: userJid, option, menu: 'menu principal', stateBefore: currentState, stateAfter })
      await registerUserLog(userJid, userName, 'Menu principal: Documentos', currentState, 'MENU_OPENED', { stateBefore: currentState, stateAfter, menu: 'documentos', success: true })
      break
    }

    case '3': {
      await sock.sendMessage(userJid, { text: formatCourseMenu() })
      const stateAfter = await updateUserState(userJid, 'curso')
      botLog('MENU_OPENED', 'Opção processada', { user: userJid, option, menu: 'menu principal', stateBefore: currentState, stateAfter })
      await registerUserLog(userJid, userName, 'Menu principal: PPC do Curso', currentState, 'MENU_OPENED', { stateBefore: currentState, stateAfter, menu: 'curso', success: true })
      break
    }

    case '4':
      await sock.sendMessage(userJid, { text: '🔗 *Links Importantes*\n\nSUAP: https://suap.ifma.edu.br\nCampus Santa Inês: https://santaines.ifma.edu.br/' })
      await sendFollowUp(sock, userJid)
      await updateUserState(userJid, 'links')
      await registerUserLog(userJid, userName, 'Menu principal: Links Importantes', currentState, 'MENU_OPTION_SELECTED', { menu: 'menu principal', stateAfter: 'links', success: true })
      break

    case '5':
      await sock.sendMessage(userJid, { text: '📢 *Editais Abertos*\n\nNo momento, consulte os editais disponíveis no site do campus:\nhttps://santaines.ifma.edu.br/' })
      await sendFollowUp(sock, userJid)
      await updateUserState(userJid, 'editais')
      await registerUserLog(userJid, userName, 'Menu principal: Editais Abertos', currentState, 'MENU_OPTION_SELECTED', { menu: 'menu principal', stateAfter: 'editais', success: true })
      break

    case '6':
      await sock.sendMessage(userJid, { text: '🍴 *RU*: Almoço das 11:30 às 13:30.' })
      await sendFollowUp(sock, userJid)
      await updateUserState(userJid, 'ru')
      await registerUserLog(userJid, userName, 'Menu principal: RU', currentState, 'MENU_OPTION_SELECTED', { menu: 'menu principal', stateAfter: 'ru', success: true })
      break

    case '7':
      await sock.sendMessage(userJid, { text: '👨‍💻 *Suporte*: Sua dúvida foi registrada.' })
      await sendFollowUp(sock, userJid)
      await updateUserState(userJid, 'suporte')
      await registerUserLog(userJid, userName, 'Menu principal: Suporte', currentState, 'MENU_OPTION_SELECTED', { menu: 'menu principal', stateAfter: 'suporte', success: true })
      break

    default:
      await sock.sendMessage(userJid, {
        text: `Não consegui entender essa opção. Digite um dos números do menu:\n\n${formatMainMenu()}`
      })
      await registerUserLog(userJid, userName, `Opção inválida no menu principal: ${option}`, currentState, 'INVALID_OPTION', { menu: 'menu principal', success: false })
      break
  }
}

async function processDocsCategoryOption(sock: WASocket, userJid: string, userName: string, option: string, currentState: UserState) {
  /**
   * O menu Documentos agora separa setores antes de listar arquivos.
   * Isso prepara DRCA e CAE para crescerem de forma independente sem misturar
   * documentos acadêmicos de áreas diferentes.
   */
  if (option === '1') {
    await sock.sendMessage(userJid, { text: await formatDocumentsMenu() })
    const stateAfter = await updateUserState(userJid, 'docs_drca')
    await registerUserLog(userJid, userName, 'Documentos: DRCA', currentState, 'MENU_OPENED', { stateBefore: currentState, stateAfter, menu: 'documentos drca', success: true })
    return
  }

  if (option === '2') {
    await sock.sendMessage(userJid, { text: formatMenu(emptyCaeDocsMenu) })
    const stateAfter = await updateUserState(userJid, 'docs_cae')
    await registerUserLog(userJid, userName, 'Documentos: CAE', currentState, 'MENU_OPENED', { stateBefore: currentState, stateAfter, menu: 'documentos cae', success: true })
    return
  }

  await sock.sendMessage(userJid, {
    text: `Não consegui entender essa opção no menu de documentos. Escolha uma opção válida:\n\n${formatMenu(docsCategoryMenu)}`
  })
  await registerUserLog(userJid, userName, `Opção inválida em documentos: ${option}`, currentState, 'INVALID_OPTION', { menu: 'documentos', success: false })
}

async function processDrcaDocsOption(sock: WASocket, userJid: string, userName: string, option: string, currentState: UserState) {
  /**
   * Documentos são resolvidos por opção dinâmica; o banco define a lista ativa.
   * Isso permite adicionar/remover PDFs sem alterar o messageHandler.
   */
  const document = await findDocumentByOption(option)

  if (!document) {
    await sock.sendMessage(userJid, {
      text: `Não consegui entender essa opção no menu de documentos. Escolha uma opção válida:\n\n${await formatDocumentsMenu()}`
    })
    await registerUserLog(userJid, userName, `Opção inválida em documentos: ${option}`, currentState, 'INVALID_OPTION', { menu: 'documentos', success: false })
    return
  }

  await sock.sendMessage(userJid, { text: '👨‍💻 Um momento...' })
  await registerUserLog(userJid, userName, `Documento solicitado: ${document.label}`, currentState, 'DOCUMENT_REQUESTED', { menu: 'documentos', documentId: document.key })
  const result = await sendDocument(sock, userJid, document)

  if (!result.success) {
    await registerUserLog(userJid, userName, `Erro ao enviar documento: ${document.label}`, currentState, 'DOCUMENT_ERROR', {
      menu: 'documentos',
      documentId: document.key,
      success: false,
      errorMessage: result.errorMessage
    })
    return
  }

  await sock.sendMessage(userJid, { text: 'Documento enviado com sucesso.' })
  await sendFollowUp(sock, userJid)
  botLog('DOCUMENT_SENT', 'Documento enviado', { user: userJid, option, menu: 'menu de documentos', stateBefore: currentState, stateAfter: currentState, documentId: document.key })
  await registerUserLog(userJid, userName, `Documento enviado: ${document.label}`, currentState, 'DOCUMENT_SENT', { menu: 'documentos', documentId: document.key, success: true })
}

async function processCaeDocsOption(sock: WASocket, userJid: string, userName: string, option: string, currentState: UserState) {
  await sock.sendMessage(userJid, {
    text: `Ainda não há documentos da CAE cadastrados para envio automático.\n\n${formatMenu(emptyCaeDocsMenu)}`
  })
  await registerUserLog(userJid, userName, `Opção em documentos CAE sem cadastro: ${option}`, currentState, 'INVALID_OPTION', { menu: 'documentos cae', success: false })
}

async function processCourseSelectionOption(sock: WASocket, userJid: string, userName: string, option: string, currentState: UserState) {
  /**
   * PPC agora começa pela escolha do curso. Por enquanto apenas Engenharia de
   * Computação possui PDFs cadastrados; os outros cursos ficam explícitos como
   * opções ainda sem documentos disponíveis.
   */
  if (option === '1') {
    await sock.sendMessage(userJid, { text: formatEngineeringComputerPpcMenu() })
    const stateAfter = await updateUserState(userJid, 'curso_eng_comp')
    await registerUserLog(userJid, userName, 'Curso selecionado: Engenharia de Computação', currentState, 'MENU_OPENED', { stateBefore: currentState, stateAfter, menu: 'curso engenharia de computação', success: true })
    return
  }

  if (['2', '3', '4'].includes(option)) {
    await sock.sendMessage(userJid, {
      text: `Os PPCs deste curso ainda não estão disponíveis para envio automático.\n\n${formatCourseMenu()}`
    })
    await registerUserLog(userJid, userName, `Curso sem PPC disponível: ${option}`, currentState, 'INVALID_OPTION', { menu: 'curso', success: false })
    return
  }

  await sock.sendMessage(userJid, {
    text: `Não consegui entender essa opção no menu de cursos. Escolha uma opção válida:\n\n${formatCourseMenu()}`
  })
  await registerUserLog(userJid, userName, `Opção inválida em curso: ${option}`, currentState, 'INVALID_OPTION', { menu: 'curso', success: false })
}

async function processEngineeringComputerPpcOption(sock: WASocket, userJid: string, userName: string, option: string, currentState: UserState) {
  const courseDocuments: Record<string, { label: string; path: string }> = {
    '1': { label: 'PPC - Engenharia de Computação 2022', path: './documentos/ppc/ppc.eng_.comp_2022_.pdf' },
    '2': { label: 'PPC - Engenharia de Computação 2024', path: './documentos/ppc/ppc.eng_.comp_2024_.pdf' }
  }

  const document = courseDocuments[option]
  if (!document) {
    await sock.sendMessage(userJid, {
      text: `Não consegui entender essa opção no menu de PPC. Escolha uma opção válida:\n\n${formatEngineeringComputerPpcMenu()}`
    })
    await registerUserLog(userJid, userName, `Opção inválida em PPC Engenharia de Computação: ${option}`, currentState, 'INVALID_OPTION', { menu: 'curso engenharia de computação', success: false })
    return
  }

  await sock.sendMessage(userJid, { text: '👨‍💻 Um momento...' })
  await registerUserLog(userJid, userName, `PPC solicitado: ${document.label}`, currentState, 'DOCUMENT_REQUESTED', { menu: 'curso', documentId: option })
  const result = await sendDocument(sock, userJid, { key: option, label: document.label, path: document.path })

  if (!result.success) {
    await registerUserLog(userJid, userName, `Erro ao enviar PPC: ${document.label}`, currentState, 'DOCUMENT_ERROR', {
      menu: 'curso',
      documentId: option,
      success: false,
      errorMessage: result.errorMessage
    })
    return
  }

  await sock.sendMessage(userJid, { text: 'Documento enviado com sucesso.' })
  await sendFollowUp(sock, userJid)
  botLog('DOCUMENT_SENT', 'Documento enviado', { user: userJid, option, menu: getMenuNameByState(currentState), stateBefore: currentState, stateAfter: currentState })
  await registerUserLog(userJid, userName, `PPC enviado: ${document.label}`, currentState, 'DOCUMENT_SENT', { menu: 'curso', documentId: option, success: true })
}

async function sendStartFlow(sock: WASocket, userJid: string, userName: string, logMessage: string) {
  await sendWelcome(sock, userJid, userName)
  await sendMainMenu(sock, userJid)
  const stateAfter = await updateUserState(userJid, 'main')
  botLog('USER_STATE_CHANGED', 'Estado atualizado', { user: userJid, stateAfter, menu: 'início' })
  await registerUserLog(userJid, userName, logMessage, stateAfter, 'USER_STATE_CHANGED', { stateAfter, menu: 'menu principal', success: true })
}

async function sendWelcome(sock: WASocket, jid: string, name: string) {
  const welcomeText = `👋 Olá, *${name}*!\n\n` +
                      `Eu sou o *${config.botName}*, o assistente virtual dos estudantes do ${config.campus}. 🤖💻\n\n` +
                      'Estou aqui para facilitar seu acesso a documentos e informações importantes. (Fase de testes)'
  await sock.sendMessage(jid, { text: welcomeText })
  await new Promise(resolve => setTimeout(resolve, 800))
}

async function sendFollowUp(sock: WASocket, jid: string) {
  const followUpText = `🤖 *ASSISTENTE IFMA*\n\n` +
                       `Você deseja mais alguma coisa?\n\n` +
                       `0 - Voltar ao Menu Principal\n` +
                       `encerrar - Terminar conversa\n\n` +
                       `_(Digite "encerrar" para terminar a conversa)_`

  setTimeout(async () => {
    try {
      await sock.sendMessage(jid, { text: followUpText })
    } catch (error) {
      botLog('WHATSAPP_SEND_ERROR', 'Falha ao enviar mensagem de acompanhamento', { user: jid, error })
    }
  }, 1500)
}

async function sendUnknownMessage(sock: WASocket, jid: string, state: UserState) {
  const menuName = getMenuNameByState(state)
  if (state === 'main') {
    await sock.sendMessage(jid, {
      text: `Não entendi essa mensagem. Digite uma opção do menu principal ou envie "menu" para reiniciar.\n\n${formatMainMenu()}`
    })
    return
  }

  if (state === 'encerrado') {
    await sock.sendMessage(jid, {
      text: 'Este atendimento foi encerrado. Para começar novamente, envie oi ou menu.'
    })
    return
  }

  await sock.sendMessage(jid, {
    text: `Não entendi essa mensagem. Digite uma opção numérica do ${menuName}, "0" para voltar ao menu principal ou "menu" para reiniciar.`
  })
}

function isInformationalSubmenuState(state: UserState) {
  return ['biblioteca', 'links', 'editais', 'ru', 'suporte', 'encerrado'].includes(state)
}

async function sendEndFlow(sock: WASocket, userJid: string, userName: string, currentState: UserState) {
  await sock.sendMessage(userJid, {
    text: `👋 *Atendimento Encerrado.*\nO ${config.botName} agradece o seu contato! Se precisar de algo novo, basta digitar oi ou menu.`
  })
  const stateAfter = await updateUserState(userJid, 'encerrado')
  botLog('USER_STATE_CHANGED', 'Atendimento encerrado', { user: userJid, stateBefore: currentState, stateAfter, menu: 'encerramento' })
  await registerUserLog(userJid, userName, 'Sessão Encerrada', currentState, 'USER_STATE_CHANGED', { stateBefore: currentState, stateAfter, success: true })
}

export async function sendMainMenu(sock: WASocket, jid: string) {
  await sock.sendMessage(jid, { text: formatMainMenu() })
}
