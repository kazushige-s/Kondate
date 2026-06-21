import type { Meal } from '@/types';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(path, init);
  if (!res.ok) {
    const body = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(body.error ?? 'リクエストに失敗しました');
  }
  return res.json() as Promise<T>;
}

export function getMeals(): Promise<Meal[]> {
  return request<Meal[]>('/api/meals');
}

export function addMeal(name: string, date: string, season?: string): Promise<Meal> {
  return request<Meal>('/api/meals', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, date, season: season || undefined }),
  });
}

function patch(id: string, body: Record<string, unknown>): Promise<Meal> {
  return request<Meal>(`/api/meals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export const updateMealDate   = (id: string, date: string)          => patch(id, { date });
export const updateMealName   = (id: string, name: string)          => patch(id, { name });
export const updateMealSeason = (id: string, season: string | null) => patch(id, { season });
export const setMealReady     = (id: string, isReady: boolean)      => patch(id, { isReady });
export const revertMealDate   = (id: string)                        => patch(id, { date: '' });

export async function deleteMeal(id: string): Promise<void> {
  await request<unknown>(`/api/meals/${id}`, { method: 'DELETE' });
}
