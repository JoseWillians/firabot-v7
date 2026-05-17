import * as fs from 'fs'
import * as path from 'path'
import { WASocket } from 'baileys'
import { getActiveDocs } from '../functions/database.js'
import { config } from '../config.js'
import { createDocsMenu, fallbackDocuments } from '../menus/docsMenu.js'
import { formatMenu } from './menuService.js'
import { debugLog, errorLog } from './logService.js'

export interface ActiveDocument {
  key: string
  label: string
  path: string
  summary?: string
}

export interface DocumentSendResult {
  success: boolean
  absolutePath: string
  errorMessage?: string
}

export interface DocumentsHealth {
  totalActive: number
  found: number
  missing: number
  missingDocuments: ActiveDocument[]
}

function resolveDocumentPath(documentPath: string) {
  if (path.isAbsolute(documentPath)) return path.resolve(documentPath)
  if (documentPath.startsWith('./documentos') || documentPath.startsWith('documentos')) {
    return path.resolve(documentPath)
  }

  return path.resolve(config.documentsBasePath, documentPath)
}

function mapFallbackDocuments(): ActiveDocument[] {
  return fallbackDocuments.map(doc => ({
    key: doc.key,
    label: doc.label,
    path: doc.path,
    summary: doc.summary
  }))
}

function getDocumentSummary(label: string, documentPath: string) {
  const normalized = `${label} ${documentPath}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()

  if (normalized.includes('diploma') && normalized.includes('tecnico')) {
    return 'Use este formulário para solicitar emissão ou encaminhamento relacionado ao diploma de curso técnico.'
  }

  if (normalized.includes('requerimento superior')) {
    return 'Use este requerimento para solicitações acadêmicas de cursos superiores, como aproveitamento, declarações ou demandas de registro acadêmico.'
  }

  if (normalized.includes('termo de desistencia')) {
    return 'Use este termo quando o estudante desejar formalizar a desistência do curso ou de vínculo acadêmico, conforme orientação institucional.'
  }

  if (normalized.includes('requerimento academico')) {
    return 'Use este requerimento para solicitar serviços acadêmicos gerais junto à DRCA, como ajustes, declarações ou outros procedimentos administrativos.'
  }

  if (normalized.includes('ppc')) {
    return 'Este PPC apresenta a estrutura oficial do curso, incluindo matriz curricular, carga horária, perfil do egresso e regras acadêmicas da formação.'
  }

  return 'Este documento ajuda no atendimento acadêmico e deve ser utilizado conforme a orientação do setor responsável.'
}

/**
 * Carrega documentos ativos do banco para montar o menu dinamicamente.
 * Se o banco estiver indisponível ou vazio, usa uma lista local de fallback
 * para manter o atendimento básico funcionando.
 */
export async function getAvailableDocuments(categoryCode = 'drca'): Promise<ActiveDocument[]> {
  try {
    const docs = await getActiveDocs(categoryCode)
    if (!docs.length) return categoryCode === 'drca' ? mapFallbackDocuments() : []

    return docs.map((doc: { name: string; path: string; summary?: string }, index: number) => ({
      key: String(index + 1),
      label: doc.name,
      path: doc.path,
      summary: doc.summary || getDocumentSummary(doc.name, doc.path)
    }))
  } catch (error) {
    errorLog('DATABASE_ERROR', 'Erro ao carregar documentos ativos. Usando lista local de fallback', error)
    return mapFallbackDocuments()
  }
}

export async function formatDocumentsMenu() {
  const documents = await getAvailableDocuments('drca')
  return formatMenu(createDocsMenu(documents))
}

export async function findDocumentByOption(option: string): Promise<ActiveDocument | undefined> {
  const documents = await getAvailableDocuments('drca')
  return documents.find(doc => doc.key === option)
}

export function formatDocumentSuccessMessage(document: ActiveDocument) {
  return document.summary
    ? `Documento enviado com sucesso.\n\nResumo: ${document.summary}`
    : 'Documento enviado com sucesso.'
}

export async function checkDocumentsHealth(): Promise<DocumentsHealth> {
  const documents = await getAvailableDocuments()
  const missingDocuments = documents.filter(document => !fs.existsSync(resolveDocumentPath(document.path)))

  debugLog('Healthcheck de documentos concluído', {
    eventType: missingDocuments.length ? 'DOCUMENT_ERROR' : 'DOCUMENT_HEALTH',
    totalActive: documents.length,
    found: documents.length - missingDocuments.length,
    missing: missingDocuments.length,
    missingDocuments
  })

  return {
    totalActive: documents.length,
    found: documents.length - missingDocuments.length,
    missing: missingDocuments.length,
    missingDocuments
  }
}

export async function sendDocument(sock: WASocket, jid: string, document: ActiveDocument): Promise<DocumentSendResult> {
  const filePath = resolveDocumentPath(document.path)

  try {
    if (!fs.existsSync(filePath)) {
      await sock.sendMessage(jid, { text: 'Encontrei essa opção, mas o arquivo não está disponível no servidor agora. Tente novamente mais tarde ou entre em contato com o suporte.' })
      errorLog('DOCUMENT_ERROR', 'Documento não encontrado no servidor', new Error(filePath), { user: jid, documentId: document.key, document })
      debugLog('Caminho absoluto de documento ausente', { eventType: 'DOCUMENT_ERROR', user: jid, documentId: document.key, absolutePath: filePath })
      return { success: false, absolutePath: filePath, errorMessage: 'Arquivo não encontrado no servidor' }
    }

    await sock.sendMessage(jid, {
      document: fs.readFileSync(filePath),
      mimetype: 'application/pdf',
      fileName: `${document.label}.pdf`
    })
    return { success: true, absolutePath: filePath }
  } catch (error) {
    errorLog('DOCUMENT_ERROR', 'Erro ao enviar documento', error, { user: jid, documentId: document.key, document })
    debugLog('Caminho absoluto de documento com erro de envio', { eventType: 'DOCUMENT_ERROR', user: jid, documentId: document.key, absolutePath: filePath })
    await sock.sendMessage(jid, { text: 'Encontrei a opção, mas não consegui enviar o documento agora. Tente novamente em alguns instantes ou entre em contato com o suporte.' })
    return { success: false, absolutePath: filePath, errorMessage: error instanceof Error ? error.message : 'Erro ao enviar documento' }
  }
}
