export interface User {
  id: number
  name: string
  email: string
}

export interface LoginRequest {
  email: string
  password: string
  device_name?: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface CurrentUserResponse {
  user: User
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  password_confirmation: string
  device_name?: string
}

export type RegisterResponse = LoginResponse

export interface LogoutAllRequest {
  password: string
}
