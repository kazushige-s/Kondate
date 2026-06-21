'use client';

import React, { useState } from 'react';
import { Title, Text, Badge, Button, Group, Loader, TextInput } from '@mantine/core';
import { revertMealDate, updateMealName, updateMealSeason } from '@/lib/meals-api';
import type { Meal } from '@/types';

interface Props {
  meals: Meal[];
  loading: boolean;
  error: string;
  onReverted: (updated: Meal) => void;
  onNameUpdated: (updated: Meal) => void;
}

const SEASON_COLOR: Record<string, string> = {
  春: 'pink', 夏: 'yellow', 秋: 'orange', 冬: 'blue',
};
const SEASON_OPTIONS = ['春', '夏', '秋', '冬'];
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m, day: d, weekday: WEEKDAYS[new Date(y, m - 1, d).getDay()] };
}

function formatDate(dateStr: string): string {
  const { year, month, day, weekday } = parseLocalDate(dateStr);
  return `${year}年${month}月${day}日（${weekday}）`;
}

function getMonthKey(dateStr: string): string {
  const { year, month } = parseLocalDate(dateStr);
  return `${year}年${month}月`;
}

function MealRow({ meal, onReverted, onNameUpdated }: {
  meal: Meal;
  onReverted: (m: Meal) => void;
  onNameUpdated: (m: Meal) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(meal.name);
  const [editSeason, setEditSeason] = useState<string | null>(meal.season);
  const [saving, setSaving] = useState(false);
  const [reverting, setReverting] = useState(false);

  async function handleSave() {
    if (!editName.trim()) return;
    const nameChanged = editName.trim() !== meal.name;
    const seasonChanged = editSeason !== meal.season;
    if (!nameChanged && !seasonChanged) { setEditing(false); return; }

    setSaving(true);
    try {
      let updated: Meal = meal;
      if (nameChanged) updated = await updateMealName(meal.id, editName.trim());
      if (seasonChanged) updated = await updateMealSeason(meal.id, editSeason);
      onNameUpdated(updated);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleRevert() {
    if (!window.confirm(`「${meal.name}」を今週に戻しますか？`)) return;
    setReverting(true);
    try {
      const updated = await revertMealDate(meal.id);
      onReverted(updated);
    } finally {
      setReverting(false);
    }
  }

  function handleCancel() {
    setEditing(false);
    setEditName(meal.name);
    setEditSeason(meal.season);
  }

  if (editing) {
    return (
      <li className="px-4 py-2.5 space-y-2">
        <TextInput
          value={editName}
          onChange={e => setEditName(e.currentTarget.value)}
          autoFocus
          size="xs"
          placeholder="料理名"
        />
        <select
          value={editSeason ?? ''}
          onChange={e => setEditSeason(e.target.value || null)}
          className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 text-sm focus:outline-none focus:border-orange-500 bg-white dark:bg-gray-800 dark:text-gray-100"
        >
          <option value="">通年</option>
          {SEASON_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <Group gap="xs">
          <Button size="xs" loading={saving} disabled={!editName.trim()} onClick={handleSave} color="orange">保存</Button>
          <Button size="xs" variant="default" onClick={handleCancel}>✕</Button>
        </Group>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 px-4 py-2.5">
      <Text size="sm" className="flex-1 min-w-0 truncate">{meal.name}</Text>
      {meal.season && (
        <Badge size="xs" color={SEASON_COLOR[meal.season]} variant="light">{meal.season}</Badge>
      )}
      <Button size="xs" variant="subtle" color="gray" onClick={() => setEditing(true)}>編集</Button>
      <Button size="xs" variant="subtle" color="orange" loading={reverting} onClick={handleRevert}>戻す</Button>
    </li>
  );
}

export default function MealList({ meals, loading, error, onReverted, onNameUpdated }: Props) {
  const byDate = meals.reduce<Record<string, Meal[]>>((acc, meal) => {
    if (!acc[meal.date]) acc[meal.date] = [];
    acc[meal.date].push(meal);
    return acc;
  }, {});

  const byMonth: Record<string, string[]> = {};
  Object.keys(byDate)
    .sort((a, b) => (a < b ? 1 : -1))
    .forEach(date => {
      const mk = getMonthKey(date);
      if (!byMonth[mk]) byMonth[mk] = [];
      byMonth[mk].push(date);
    });

  const months = Object.keys(byMonth);
  const [opened, setOpened] = useState<Set<string>>(new Set());

  if (loading) return <div className="flex justify-center py-16"><Loader color="orange" /></div>;
  if (error)   return <Text c="red" ta="center" py="xl">{error}</Text>;
  if (meals.length === 0) return <Text c="dimmed" ta="center" py="xl">まだ登録されていません</Text>;

  function toggle(month: string) {
    setOpened(prev => {
      const next = new Set(prev);
      next.has(month) ? next.delete(month) : next.add(month);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <Title order={5} mb="sm">献立一覧</Title>
      {months.map(month => {
        const isOpen = opened.has(month);
        const dates = byMonth[month];
        const total = dates.reduce((n, d) => n + byDate[d].length, 0);

        return (
          <div key={month} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggle(month)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <span className="font-bold text-gray-700 text-sm">{month}</span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-gray-400">{total}件</span>
                <span className="text-gray-400 text-xs">{isOpen ? '▲' : '▼'}</span>
              </span>
            </button>

            <div
              style={{
                maxHeight: isOpen ? '9999px' : 0,
                overflow: 'hidden',
                transition: 'max-height 0.25s ease',
              }}
            >
              <div className="border-t border-gray-100">
                {dates.map(date => (
                  <div key={date}>
                    <div className="bg-orange-50 text-orange-600 text-xs font-bold px-4 py-1.5">
                      {formatDate(date)}
                    </div>
                    <ul className="divide-y divide-gray-50">
                      {byDate[date].map(meal => (
                        <MealRow key={meal.id} meal={meal} onReverted={onReverted} onNameUpdated={onNameUpdated} />
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
