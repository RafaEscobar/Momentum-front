export interface GeneralNoteSummary {
  id: number
  title: string
  created_at: string | null
  updated_at: string | null
}

export interface GeneralNote extends GeneralNoteSummary {
  content: string
}

export interface GeneralNotePayload {
  title: string
  content: string
}

export type UpdateGeneralNotePayload = Partial<GeneralNotePayload>
