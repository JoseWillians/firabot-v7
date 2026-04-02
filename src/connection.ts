import makeWASocket, { DisconnectReason, useMultiFileAuthState, fetchLatestWaWebVersion } from 'baileys'
import qrcode from 'qrcode-terminal'
import { messageHandler } from './middlewares/messageHandler.js'

export const startBot = async () => {
  const { state, saveCreds } = await useMultiFileAuthState("auth")
  const { version } = await fetchLatestWaWebVersion()

  const sock = makeWASocket({
    auth: state,
    version,
    printQRInTerminal: false,
    syncFullHistory: false, // 🛡️ Evita carregar 500 mensagens antigas
    browser: ["Firabot", "Chrome", "1.0.0"]
  })

  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update
  
    if (qr) {
      console.log('✨ [SISTEMA] Novo QR Code gerado. Aguardando leitura...');
      qrcode.generate(qr, { small: true })
    }

    if (connection === 'connecting') {
      console.log('⏳ [CONEXÃO] Estabelecendo ponte com o WhatsApp...');
    }

    if (connection === 'open') {
      console.log('✅ [SUCESSO] Firabot v7 está online e pronto!');
    }

    if (connection === 'close') {
      const reason = (lastDisconnect?.error as any)?.output?.statusCode
      console.log(`❌ [DESCONECTADO] Motivo: ${reason}. Tentando reconectar...`);
      startBot(); // Reconexão automática
    }
  })

  sock.ev.on('creds.update', saveCreds)
  sock.ev.on('messages.upsert', async (m) => {
    await messageHandler(sock, m)
  })
}