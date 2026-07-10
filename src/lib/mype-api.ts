import { auth } from "@/auth";

const API = process.env.MYPE_API_URL ?? "http://localhost:4001/api";

/**
 * Fetch tipado contra el backend de MyPE usando el JWT del developer
 * almacenado en la sesión de NextAuth.
 *
 * Devuelve el objeto `data` desenvuelto del ResponseInterceptor global
 * del backend (`{ code, message, data }`). Lanza `MypeApiError` si el
 * backend responde `code:0` o HTTP >= 400.
 */
export class MypeApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export async function mypeApi<T = unknown>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const session = await auth();
  const token = session?.accessToken;
  if (!token) {
    throw new MypeApiError("No autenticado", 401);
  }

  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const wrapped = await res.json().catch(() => null);
  const message = wrapped?.message ?? `HTTP ${res.status}`;

  if (!res.ok || wrapped?.code === 0) {
    throw new MypeApiError(message, res.status);
  }

  return (wrapped?.data ?? wrapped) as T;
}
