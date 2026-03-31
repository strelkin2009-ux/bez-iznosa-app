const BASE = '';

async function request(url, opts = {}) {
  const res = await fetch(BASE + url, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...opts.headers },
    credentials: 'include',
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  // Auth
  login: (name, code) => request('/api/auth', { method: 'POST', body: JSON.stringify({ name, code }) }),
  me: () => request('/api/auth'),
  logout: () => request('/api/auth', { method: 'DELETE' }),

  // Progress
  getProgress: () => request('/api/progress'),
  markDay: (day_number, status, checkin_answer) =>
    request('/api/progress', { method: 'POST', body: JSON.stringify({ day_number, status, checkin_answer }) }),

  // Profile
  updateProfile: (data) => request('/api/profile', { method: 'PATCH', body: JSON.stringify(data) }),

  // Pulse
  getPulse: () => request('/api/pulse'),
};
