import { UserState } from '../menus/types.js'

export type MenuRoute = 'main' | 'docs' | 'docs_drca' | 'docs_cae' | 'curso' | 'curso_eng_comp'

/**
 * Garante que uma opção numérica seja interpretada pelo menu correto.
 * Essa regra protege o caso crítico: após abrir "Documentos", a opção "3"
 * deve continuar no submenu docs, e não cair no "PPC do Curso" do menu main.
 */
export function getMenuRouteForOption(currentState: UserState, option: string): MenuRoute {
  if (option === '0') return 'main'
  if (currentState === 'docs') return 'docs'
  if (currentState === 'docs_drca') return 'docs_drca'
  if (currentState === 'docs_cae') return 'docs_cae'
  if (currentState === 'curso') return 'curso'
  if (currentState === 'curso_eng_comp') return 'curso_eng_comp'
  return 'main'
}
