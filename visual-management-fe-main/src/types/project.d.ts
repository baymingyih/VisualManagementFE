export interface IGeneralProject {
  id: number
  title: string
  status: number
  dueDateTime: string
  starred: number
  owner_firstName: string
  owner_lastName: string
  avatar_color: string
  key: number
}

export interface IFullProject {
  id: number
  title: string
  problem: string
  goal: string
  analysis: string
  results: string
  status: number
  startDateTime: string
  dueDateTime: string
  starred: number
  ownerId: number
  owner_firstName: string
  owner_lastName: string
  avatar_color: string
  key: number
}

export interface ICreateProject {
  title: string
  problem: string
  goal: string
  teamId: number
  startDate: string
  dueDate: string
  ownerId: number
}
