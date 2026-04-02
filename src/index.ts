import { startBot } from './connection.js'

console.log("Iniciando o Firabot v7...")
startBot().catch(err => {
  console.error("Erro na inicialização:", err)
})