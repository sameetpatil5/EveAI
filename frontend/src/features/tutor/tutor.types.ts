export interface TutorMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface TutorChatResponse {
  session_id: string
  response: string
  references: any[]
}
