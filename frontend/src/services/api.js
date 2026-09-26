const API = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'
export const token = () => localStorage.getItem('stocksense_token')
export async function api(path, options = {}) {
  const response = await fetch(`${API}${path}`, { ...options, headers: { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token() ? { Authorization: `Bearer ${token()}` } : {}), ...options.headers } })
  const result = await response.json()
  if (!response.ok || !result.success) throw new Error(result.error?.message || 'Request failed')
  return result.data
}
export const send = (path, body, method = 'POST') => api(path, { method, body: JSON.stringify(body) })
