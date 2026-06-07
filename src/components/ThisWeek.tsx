import React, { useState } from 'react';
import { Title, Text, Button, Loader } from '@mantine/core';
import { updateMealDate, updateMealName, deleteMeal, setMealReady } from '../api/meals';
import { Meal } from '../types';

interface Props {
  meals: Meal[];
  loading: boolean;
  error: string;
  onDateSet: (updated: Meal) => void;
  onNameUpdated: (updated: Meal) => void;
  onDeleted: (id: string) => void;
}

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

interface MealRowProps {
  meal: Meal;
  onComplete: (updated: Meal) => void;
  onDateSet: (updated: Meal) => void;
  onNameUpdated: (updated: Meal) => void;
  onDeleted: (id: string) => void;
}

function MealRow({ meal, onComplete, onDateSet, onNameUpdated, onDeleted }: MealRowProps) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(meal.name);
  const [date, setDate] = useState(todayString());
  const [savingName, setSavingName] = useState(false);
  const [savingDate, setSavingDate] = useState(false);
  const [savingReady, setSavingReady] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [nameError, setNameError] = useState('');
  const [dateError, setDateError] = useState('');

  async function handleSaveName() {
    if (!editName.trim()) return;
    setSavingName(true);
    setNameError('');
    try {
      const updated = await updateMealName(meal.id, editName.trim());
      onNameUpdated(updated);
      setEditing(false);
    } catch (err: any) {
      setNameError(err.message);
    } finally {
      setSavingName(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm(`「${meal.name}」を削除しますか？`)) return;
    setDeleting(true);
    try {
      await deleteMeal(meal.id);
      onDeleted(meal.id);
    } catch {
      setDeleting(false);
    }
  }

  async function handleComplete() {
    setSavingReady(true);
    try {
      const updated = await setMealReady(meal.id, true);
      onComplete(updated);
    } finally {
      setSavingReady(false);
    }
  }

  async function handleConfirmDate() {
    setSavingDate(true);
    setDateError('');
    try {
      const updated = await updateMealDate(meal.id, date);
      onDateSet(updated);
    } catch (err: any) {
      setDateError(err.message);
      setSavingDate(false);
    }
  }

  if (editing) {
    return (
      <li className="bg-white rounded-xl shadow-sm px-4 py-3 space-y-2">
        <input
          type="text"
          value={editName}
          onChange={e => setEditName(e.target.value)}
          autoFocus
          className="w-full border border-teal-500 rounded-lg px-3 py-2 text-sm focus:outline-none"
        />
        {nameError && <Text size="xs" c="red">{nameError}</Text>}
        <div className="flex gap-2">
          <Button size="xs" loading={savingName} disabled={!editName.trim()} onClick={handleSaveName} style={{ background: '#2d7a5a' }}>
            保存
          </Button>
          <Button size="xs" variant="default" onClick={() => { setEditing(false); setEditName(meal.name); }}>
            キャンセル
          </Button>
        </div>
      </li>
    );
  }

  return (
    <li className="bg-white rounded-xl shadow-sm px-4 py-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <Text size="sm" fw={500} className="flex-1 min-w-0 truncate">{meal.name}</Text>
        <div className="flex items-center gap-1 shrink-0">
          <button onClick={() => setEditing(true)} className="text-xs text-gray-400 hover:text-gray-600 px-1.5 py-1 rounded">
            編集
          </button>
          <button onClick={handleDelete} disabled={deleting} className="text-xs text-red-400 hover:text-red-600 px-1.5 py-1 rounded">
            削除
          </button>
        </div>
      </div>

      {!meal.isReady ? (
        <Button size="xs" variant="light" color="teal" loading={savingReady} onClick={handleComplete} fullWidth>
          注文完了 →
        </Button>
      ) : (
        <div className="space-y-1">
          <div className="flex gap-2 items-center">
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-teal-600"
            />
            <Button size="xs" loading={savingDate} onClick={handleConfirmDate} style={{ background: '#2d7a5a' }}>
              確定
            </Button>
          </div>
          {dateError && <Text size="xs" c="red">{dateError}</Text>}
        </div>
      )}
    </li>
  );
}

export default function ThisWeek({ meals, loading, error, onDateSet, onNameUpdated, onDeleted }: Props) {
  if (loading) return <div className="flex justify-center py-16"><Loader color="teal" /></div>;
  if (error) return <Text c="red" ta="center" py="xl">{error}</Text>;

  const ordering = meals.filter(m => !m.isReady);
  const ready = meals.filter(m => m.isReady);

  function handleComplete(updated: Meal) {
    onNameUpdated(updated); // isReady が変わったmealをリストに反映
  }

  const rowProps = { onDateSet, onNameUpdated, onDeleted, onComplete: handleComplete };

  return (
    <div className="space-y-5">
      <div>
        <Title order={5} mb="xs">注文中</Title>
        {ordering.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">なし</Text>
        ) : (
          <ul className="space-y-2">
            {ordering.map(meal => <MealRow key={meal.id} meal={meal} {...rowProps} />)}
          </ul>
        )}
      </div>

      <div>
        <Title order={5} mb="xs">食材あり</Title>
        <Text size="xs" c="dimmed" mb="sm">日付を入力して「確定」すると一覧に移動します</Text>
        {ready.length === 0 ? (
          <Text size="sm" c="dimmed" ta="center" py="md">なし</Text>
        ) : (
          <ul className="space-y-2">
            {ready.map(meal => <MealRow key={meal.id} meal={meal} {...rowProps} />)}
          </ul>
        )}
      </div>
    </div>
  );
}
