export interface ApiResourceResponse<T> {
  data: T
}

export interface PaginationLinks {
  first: string
  last: string
  prev: string | null
  next: string | null
}

export interface PaginationMeta {
  current_page: number
  from: number | null
  last_page: number
  per_page: number
  to: number | null
  total: number
}

export interface PaginatedResponse<T, TMeta extends PaginationMeta = PaginationMeta> {
  data: T[]
  links: PaginationLinks
  meta: TMeta
}
