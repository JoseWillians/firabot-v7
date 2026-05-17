import { getUserState, setUserState } from '../functions/database.js'
import { UserState } from '../menus/types.js'
import { errorLog } from './logService.js'

const allowedStates = new Set<UserState>([
  'main',
  'biblioteca',
  'docs',
  'docs_drca',
  'docs_cae',
  'curso',
  'curso_eng_comp',
  'curso_bach_adm',
  'curso_lic_fis',
  'curso_grad_tce',
  'curso_eng_civil',
  'links',
  'editais',
  'ru',
  'suporte',
  'suporte_confirmacao',
  'encerrado'
])
const memoryStates = new Map<string, UserState>()

/**
 * Restringe estados aceitos pelo roteador de menus.
 * Se o banco tiver um valor inesperado, o bot volta para main em vez de
 * interpretar números em um fluxo desconhecido.
 */
export function normalizeUserState(state: string | null | undefined): UserState {
  return allowedStates.has(state as UserState) ? state as UserState : 'main'
}

/**
 * Busca o estado no banco e mantém um cache em memória como fallback explícito.
 * O fallback não é silencioso: o erro é logado, porque perder estado no banco
 * pode fazer uma opção de submenu ser interpretada como menu principal.
 */
export async function getCurrentUserState(phoneNumber: string): Promise<UserState> {
  try {
    const state = normalizeUserState(await getUserState(phoneNumber))
    memoryStates.set(phoneNumber, state)
    return state
  } catch (error) {
    const fallback = memoryStates.get(phoneNumber)
    errorLog('DATABASE_ERROR', 'Erro ao buscar estado do usuário no banco', error, {
      user: phoneNumber,
      fallback: fallback || 'main'
    })
    return fallback || 'main'
  }
}

export async function updateUserState(phoneNumber: string, state: UserState): Promise<UserState> {
  memoryStates.set(phoneNumber, state)

  try {
    await setUserState(phoneNumber, state)
  } catch (error) {
    errorLog('DATABASE_ERROR', 'Erro ao salvar estado do usuário no banco', error, { user: phoneNumber, state })
  }

  return state
}
