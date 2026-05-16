import assert from 'node:assert/strict'
import {
  isGreetingOrStartMessage,
  isMessageFromBeforeStart,
  isPrefixedCommand
} from '../dist/services/messageGuardService.js'
import { getMenuRouteForOption } from '../dist/services/menuRoutingService.js'
import { normalizeUserState } from '../dist/services/userStateService.js'
import { maskPhone } from '../dist/services/logService.js'
import { formatCourseMenu, formatMainMenu, formatMenu } from '../dist/services/menuService.js'
import { extractMessageText } from '../dist/services/messageTextService.js'
import { docsCategoryMenu } from '../dist/menus/docsMenu.js'

function runTest(name, testFn) {
  testFn()
  console.log(`ok - ${name}`)
}

runTest('detecta saudações e mensagens de início sem prefixo', () => {
  assert.equal(isGreetingOrStartMessage('oi'), true)
  assert.equal(isGreetingOrStartMessage('Olá!'), true)
  assert.equal(isGreetingOrStartMessage('bom dia'), true)
  assert.equal(isGreetingOrStartMessage('menu'), true)
  assert.equal(isGreetingOrStartMessage('qual é o horário?'), false)
})

runTest('detecta comandos com prefixo', () => {
  assert.equal(isPrefixedCommand('!ping'), true)
  assert.equal(isPrefixedCommand('!help'), true)
  assert.equal(isPrefixedCommand('ping'), false)
})

runTest('extrai texto de mensagens comuns e captions', () => {
  assert.equal(extractMessageText({ conversation: 'oi' }), 'oi')
  assert.equal(extractMessageText({ extendedTextMessage: { text: 'menu' } }), 'menu')
  assert.equal(extractMessageText({ imageMessage: { caption: 'documento' } }), 'documento')
})

runTest('identifica mensagens anteriores ao início do bot', () => {
  assert.equal(isMessageFromBeforeStart(99, 100), true)
  assert.equal(isMessageFromBeforeStart(100, 100), false)
  assert.equal(isMessageFromBeforeStart(101, 100), false)
})

runTest('mantém docs roteando para seleção de setor', () => {
  assert.equal(getMenuRouteForOption('docs', '1'), 'docs')
  assert.equal(getMenuRouteForOption('docs', '2'), 'docs')
  assert.equal(getMenuRouteForOption('docs', '3'), 'docs')
})

runTest('mantém docs_drca e docs_cae no roteamento certo', () => {
  assert.equal(getMenuRouteForOption('docs_drca', '1'), 'docs_drca')
  assert.equal(getMenuRouteForOption('docs_drca', '3'), 'docs_drca')
  assert.equal(getMenuRouteForOption('docs_cae', '1'), 'docs_cae')
  assert.equal(getMenuRouteForOption('docs_cae', '2'), 'docs_cae')
})

runTest('mantém curso roteando para seleção de curso', () => {
  assert.equal(getMenuRouteForOption('curso', '1'), 'curso')
  assert.equal(getMenuRouteForOption('curso', '2'), 'curso')
  assert.equal(getMenuRouteForOption('curso', '4'), 'curso')
})

runTest('mantém curso_eng_comp no roteamento certo', () => {
  assert.equal(getMenuRouteForOption('curso_eng_comp', '1'), 'curso_eng_comp')
  assert.equal(getMenuRouteForOption('curso_eng_comp', '2'), 'curso_eng_comp')
})

runTest('volta para o menu principal com zero em qualquer submenu', () => {
  assert.equal(getMenuRouteForOption('docs', '0'), 'main')
  assert.equal(getMenuRouteForOption('curso', '0'), 'main')
})

runTest('menu principal segue o novo modelo numerado sem opção zero', () => {
  const menu = formatMainMenu()
  assert.match(menu, /1 - Biblioteca/)
  assert.match(menu, /5 - Editais Abertos/)
  assert.match(menu, /6 - RU/)
  assert.match(menu, /7 - Suporte/)
  assert.doesNotMatch(menu, /0 - Voltar/)
})

runTest('menu de PPC lista Engenharia de Computação e cursos fictícios', () => {
  const menu = formatCourseMenu()
  assert.match(menu, /1 - Engenharia de Computação/)
  assert.match(menu, /2 - Administração/)
  assert.match(menu, /3 - Licenciatura em Física/)
  assert.match(menu, /4 - Tecnologia em Alimentos/)
  assert.match(menu, /0 - Voltar ao Menu Principal/)
})

runTest('menu de documentos por setor lista DRCA e CAE', () => {
  const menu = formatMenu(docsCategoryMenu)
  assert.match(menu, /1 - Documentos DRCA/)
  assert.match(menu, /2 - Documentos CAE/)
  assert.match(menu, /0 - Voltar ao Menu Principal/)
})

runTest('normaliza novos estados informativos', () => {
  assert.equal(normalizeUserState('docs'), 'docs')
  assert.equal(normalizeUserState('biblioteca'), 'biblioteca')
  assert.equal(normalizeUserState('docs_drca'), 'docs_drca')
  assert.equal(normalizeUserState('docs_cae'), 'docs_cae')
  assert.equal(normalizeUserState('curso'), 'curso')
  assert.equal(normalizeUserState('curso_eng_comp'), 'curso_eng_comp')
  assert.equal(normalizeUserState('links'), 'links')
  assert.equal(normalizeUserState('editais'), 'editais')
  assert.equal(normalizeUserState('ru'), 'ru')
  assert.equal(normalizeUserState('suporte'), 'suporte')
  assert.equal(normalizeUserState('encerrado'), 'encerrado')
})

runTest('usa main como fallback para estado inválido', () => {
  assert.equal(normalizeUserState('estado-invalido'), 'main')
})

runTest('mascara telefone em logs técnicos', () => {
  assert.equal(maskPhone('5599999999999'), '5599****99')
})

console.log('Todos os testes passaram.')
