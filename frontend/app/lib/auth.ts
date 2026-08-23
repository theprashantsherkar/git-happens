export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return sessionStorage.getItem('token') || localStorage.getItem('token');
}

export function setStoredToken(token: string) {
  if (typeof window === 'undefined') return;
  sessionStorage.setItem('token', token);
  localStorage.setItem('token', token);
}

export function clearStoredToken() {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem('token');
  localStorage.removeItem('token');
}
