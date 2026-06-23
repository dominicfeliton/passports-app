const API_BASE = import.meta.env.VITE_API_URL ?? '/api'

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = /* we'll inject this later */ null
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`${res.status} ${res.statusText}: ${body}`)
  }
  return res.json()
}

export const api = {
  checkin(data: Record<string, unknown>) {
    return request('/checkin', { method: 'POST', body: JSON.stringify(data) })
  },
  getVisitors(location: string, params?: { date?: string; search?: string }) {
    const q = new URLSearchParams({ location, ...params })
    return request(`/visitors?${q}`)
  },
  updateVisitorStatus(id: string, status: string) {
    return request(`/visitors/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },
  updateVisitorNotes(id: string, notes: string) {
    return request(`/visitors/${id}/notes`, {
      method: 'PATCH',
      body: JSON.stringify({ notes }),
    })
  },
  exportVisitors(location: string) {
    return fetch(`${API_BASE}/visitors/export?location=${location}`).then(r => r.blob())
  },
  getQuestions() {
    return request('/questions')
  },
  updateQuestions(data: Record<string, unknown>) {
    return request('/questions', { method: 'PUT', body: JSON.stringify(data) })
  },
  getStats(location: string) {
    return request(`/stats?location=${location}`)
  },
  login(password: string) {
    return request('/auth/login', { method: 'POST', body: JSON.stringify({ password }) })
  },
}
