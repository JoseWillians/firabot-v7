export type UserState =
  | 'main'
  | 'biblioteca'
  | 'docs'
  | 'docs_drca'
  | 'docs_cae'
  | 'curso'
  | 'curso_eng_comp'
  | 'links'
  | 'editais'
  | 'ru'
  | 'suporte'
  | 'encerrado'

export interface MenuOption {
  key: string
  label: string
}

export interface MenuDefinition {
  title: string
  prompt: string
  options: MenuOption[]
  footer?: string
}
