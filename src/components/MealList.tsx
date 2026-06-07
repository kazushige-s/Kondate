import React, { useState } from 'react';
import { Title, Text, Badge, Loader } from '@mantine/core';
import { revertMealDate, updateMealName } from '../api/meals';
import { Meal } from '../types';

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
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function parseLocalDate(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return { year: y, month: m, day: d, weekday: WEEKDAYS[dt.getDay()] };
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
  const [savingName, setSavingName] = useState(false);
  const [reverting, setReverting] = useState(false);

  async function handleSaveName() {
    if (!editName.trim()) return;
    setSavingName(true);
    try {
      const updated = await updateMealName(meal.id, editName.trim());
      onNameUpdated(updated);
      setEditing(false);
    } finally {
      setSavingName(false);
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

  if (editing) {
    return (
      <li className="flex items-center gap-2 px-4 py-2.5">
        <input
          type="text"
          value={editName}
          onChange={e => setEditName(e.target.value)}
          autoFocus
          className="flex-1 border border-teal-500 rounded-lg px-2 py-1 text-sm focus:outline-none"
        />
        <button
          onClick={handleSaveName}
          disabled={savingName || !editName.trim()}
          className="text-xs text-teal-600 font-bold px-2 py-1 shrink-0"
        >
          保存
        </button>
        <button
          onClick={() => { setEditing(false); setEditName(meal.name); }}
          className="text-xs text-gray-400 px-2 py-1 shrink-0"
        >
          ✕
        </button>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-2 px-4 py-2.5">
      <Text size="sm" className="flex-1 min-w-0 truncate">{meal.name}</Text>
      {meal.season && (
        <Badge size="xs" color={SEASON_COLOR[meal.season]} variant="light">
          {meal.season}
        </Badge>
      )}
      <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-1 rounded shrink-0">
        編集
      </button>
      <button
        onClick={handleRevert}
        disabled={reverting}
        className="text-xs text-gray-400 hover:text-teal-600 px-1.5 py-1 rounded shrink-0"
      >
        {reverting ? '…' : '戻す'}
      </button>
    </li>
  );
}

export default function MealList({ meals, loading, error, onReverted, onNameUpdated }: Props) {
  // 日付でグループ化
  const byDate = meals.reduce<Record<string, Meal[]>>((acc, meal) => {
    if (!acc[meal.date]) acc[meal.date] = [];
    acc[meal.date].push(meal);
    return acc;
  }, {});

  // 月でグループ化
  const byMonth: Record<string, string[]> = {};
  Object.keys(byDate)
    .sort((a, b) => (a < b ? 1 : -1))
    .forEach(date => {
      const mk = getMonthKey(date);
      if (!byMonth[mk]) byMonth[mk] = [];
      byMonth[mk].push(date);
    });

  const months = Object.keys(byMonth);

  // 最新月だけ最初から開く（Hooksはreturnより前）
  const [collapsed, setCollapsed] = useState<Set<string>>(
    () => new Set(months.slice(1))
  );

  if (loading) return <div className="flex justify-center py-16"><Loader color="teal" /></div>;
  if (error) return <Text c="red" ta="center" py="xl">{error}</Text>;
  if (meals.length === 0) return <Text c="dimmed" ta="center" py="xl">まだ登録されていません</Text>;

  function toggle(month: string) {
    setCollapsed(prev => {
      const next = new Set(Array.from(prev));
      next.has(month) ? next.delete(month) : next.add(month);
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <Title order={5} mb="sm">献立一覧</Title>
      {months.map(month => {
        const isOpen = !collapsed.has(month);
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

            {isOpen && (
              <div className="border-t border-gray-100">
                {dates.map(date => (
                  <div key={date}>
                    <div className="bg-teal-50 text-teal-700 text-xs font-bold px-4 py-1.5">
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
            )}
          </div>
        );
      })}
    </div>
  );
}
