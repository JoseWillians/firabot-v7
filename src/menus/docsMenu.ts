import { MenuDefinition, MenuOption } from './types.js'

export interface DocumentMenuItem extends MenuOption {
  path: string
}

export const fallbackDocuments: DocumentMenuItem[] = [
  { key: '1', label: 'Requerimento Acadêmico', path: './documentos/drca/requerimento-academico.pdf' },
  { key: '2', label: 'Requerimento Diploma Técnico', path: './documentos/drca/requerimento-diploma-tecnico.pdf' },
  { key: '3', label: 'Requerimento Superior', path: './documentos/drca/requerimento-superior.pdf' },
  { key: '4', label: 'Termo de Desistência', path: './documentos/drca/termo-de-desistencia.pdf' }
]

export const createDocsMenu = (documents: MenuOption[]): MenuDefinition => ({
  title: '📄 *DOCUMENTOS DISPONÍVEIS*',
  prompt: 'Escolha uma opção digitando o número:',
  options: documents,
  footer: '0 - Voltar ao Menu Principal'
})

export const docsCategoryMenu: MenuDefinition = {
  title: '📄 *DOCUMENTOS*',
  prompt: 'Escolha o setor dos documentos:',
  options: [
    { key: '1', label: 'Documentos DRCA' },
    { key: '2', label: 'Documentos CAE' }
  ],
  footer: '0 - Voltar ao Menu Principal'
}

export const emptyCaeDocsMenu: MenuDefinition = {
  title: '📄 *DOCUMENTOS CAE*',
  prompt: 'Ainda não há documentos da CAE cadastrados para envio automático.',
  options: [],
  footer: '0 - Voltar ao Menu Principal'
}
