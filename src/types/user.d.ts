export interface IUser {
  key: number,
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  active: number,
  updated_at: string,
  lastActive: string,
  orgAdmin: number,
  avatar_color: string,
  external: number
}

export interface IUserRole {
  key: number,
  id: number,
  firstName: string,
  lastName: string,
  email: string,
  active: number,
  avatar_color: string
  role: number
}