import { Meal } from '../types';

const API_BASE = '/api';

export async function getMeals(): Promise<Meal[]> {
  const res = await fetch(`${API_BASE}/meals`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? 'データの取得に失敗しました');
  }
  return res.json();
}

export async function updateMealDate(id: string, date: string): Promise<Meal> {
  const res = await fetch(`${API_BASE}/meals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? '更新に失敗しました');
  }
  return res.json();
}

export async function updateMealName(id: string, name: string): Promise<Meal> {
  const res = await fetch(`${API_BASE}/meals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? '更新に失敗しました');
  }
  return res.json();
}

export async function setMealReady(id: string, isReady: boolean): Promise<Meal> {
  const res = await fetch(`/api/meals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isReady }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? '更新に失敗しました');
  }
  return res.json();
}

export async function updateMealSeason(id: string, season: string | null): Promise<Meal> {
  const res = await fetch(`${API_BASE}/meals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ season }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? '更新に失敗しました');
  }
  return res.json();
}

export async function revertMealDate(id: string): Promise<Meal> {
  const res = await fetch(`${API_BASE}/meals/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ date: '' }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? '更新に失敗しました');
  }
  return res.json();
}

export async function deleteMeal(id: string): Promise<void> {
  const res = await fetch(`${API_BASE}/meals/${id}`, { method: 'DELETE' });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? '削除に失敗しました');
  }
}

export async function addMeal(
  name: string,
  date: string,
  season?: string,
): Promise<Meal> {
  const res = await fetch(`${API_BASE}/meals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, date, season: season || undefined }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? '登録に失敗しました');
  }
  return res.json();
}
