// Cliente da API real (NestJS em :3200). Token JWT fica no localStorage.
export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3200/api/v1';

const KEY = 'mzc.auth';

export interface StoredAuth {
  token: string;
  user: { id: string; name: string; email: string };
}

export function getAuth(): StoredAuth | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as StoredAuth) : null;
  } catch {
    return null;
  }
}

export function setAuth(auth: StoredAuth | null) {
  try {
    if (auth) localStorage.setItem(KEY, JSON.stringify(auth));
    else localStorage.removeItem(KEY);
  } catch {
    /* storage indisponível: sessão só em memória */
  }
}

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const auth = getAuth();
  const res = await fetch(API_URL + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: `Bearer ${auth.token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, body?.message ?? `Erro ${res.status}`);
  }
  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(Array.isArray(message) ? message.join('; ') : message);
  }
}

export async function login(email: string, password: string) {
  const data = await api<{ token: string; user: StoredAuth['user'] }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  setAuth({ token: data.token, user: data.user });
  return data;
}
