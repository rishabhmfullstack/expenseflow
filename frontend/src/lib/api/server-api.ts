import { API_BASE_URL } from '@/lib/api/constants';
import { getServerAccessToken } from '@/lib/auth/server-session';

interface ApiEnvelope<TData, TMeta = unknown> {
  success: boolean;
  data: TData;
  meta?: TMeta;
}

export async function serverApiGet<TData, TMeta = unknown>(
  path: string,
): Promise<{ data: TData; meta?: TMeta } | null> {
  const token = await getServerAccessToken();
  if (!token) {
    return null;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    });

    if (!response.ok) {
      return null;
    }

    const body = (await response.json()) as ApiEnvelope<TData, TMeta>;
    return { data: body.data, meta: body.meta };
  } catch {
    return null;
  }
}

export function buildQueryString(params: Record<string, string | number | boolean | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : '';
}
