import { MenuDefinition } from './types.js'

export const courseMenu: MenuDefinition = {
  title: '🎓 *PPC DO CURSO*',
  prompt: 'Escolha o curso:',
  options: [
    { key: '1', label: 'Engenharia de Computação' },
    { key: '2', label: 'Administração' },
    { key: '3', label: 'Licenciatura em Física' },
    { key: '4', label: 'Tecnologia em Alimentos' }
  ],
  footer: '0 - Voltar ao Menu Principal'
}

export const engineeringComputerPpcMenu: MenuDefinition = {
  title: '🎓 *Engenharia de Computação - IFMA*',
  prompt: 'Escolha o PPC disponível:',
  options: [
    { key: '1', label: 'PPC 2019 (abrange turmas até 2022)' },
    { key: '2', label: 'PPC 2024 (a partir da turma 2023)' }
  ],
  footer: '0 - Voltar ao Menu Principal'
}
