const ACCESS_TOKEN_KEY = 'expenseflow_access_token';
const SESSION_COOKIE = 'expenseflow_session';
const ACCESS_TOKEN_COOKIE = 'expenseflow_access_token';
const ROLE_COOKIE = 'expenseflow_role';

const AUTH_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

function setAuthCookies(token: string, role?: string) {
  document.cookie = `${ACCESS_TOKEN_COOKIE}=${encodeURIComponent(token)}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
  if (role) {
    document.cookie = `${ROLE_COOKIE}=${role}; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
  }
}

function clearAuthCookies() {
  document.cookie = `${ACCESS_TOKEN_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  document.cookie = `${ROLE_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
}

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string, role?: string) {
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
  document.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${AUTH_COOKIE_MAX_AGE}; SameSite=Lax`;
  setAuthCookies(token, role);
}

export function clearAccessToken() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  document.cookie = `${SESSION_COOKIE}=; path=/; max-age=0; SameSite=Lax`;
  clearAuthCookies();
}
