export interface ProjectNoteSummary {
  id: number
  project_id: number
  title: string
  created_at?: string
  updated_at?: string
}

export interface ProjectNote extends ProjectNoteSummary {
  content: string
}

export interface CreateNotePayload {
  title: string
  content: string
}

export type UpdateNotePayload = Partial<CreateNotePayload>
