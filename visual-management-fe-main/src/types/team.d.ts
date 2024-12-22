export interface ITeam {
  id: number
  name: string
  tier: number
  key: number
}

export interface ITeamRole {
  id: number
  name: string
  tier: number
  key: number
  role: number
}

export interface ITeamFull {
  key: number
  id: number
  name: string
  tier: number
  reportTo: {
    id: number
    name: string
    tier: number
  } | null
  team_members: Array<
    {
      role: number
      id: number
      firstName: string
      lastName: string
      avatar_color: string
      email: string
      key: number
    }>
  created_at: string
  updated_at: string
}

export interface ITeamMembers {
  userId: number
  users: {
    active: number
    firstName: string
    lastName: string
    external: number
  }
  avatar_color: string
}

export interface ITeamMemberFull {
  key: number
  userId: number
  firstName: string,
  lastName: string,
  email: string,
  role: number,
  lastActive: string,
  avatar_color: string,
  external: number
}

export interface IUserTeam {
  key: number
  teamId: number
  teamName: string
  tier: number
  role: number
}