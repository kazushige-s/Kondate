import React, { useState } from 'react';
import { Paper, TextInput, Select, Button, Group, Stack, Title, Text, SegmentedControl } from '@mantine/core';
import { addMeal, updateMealName, updateMealDate, deleteMeal, setMealReady } from '../api/meals';
import { Meal, Season } from '../types';

interface Props {
  onAdded: (meal: Meal) => void;
  orderingMeals: Meal[];
  readyMeals: Meal[];
  onComplete: (updated: Meal) => void;
  onDateSet: (updated: Meal) => void;
  onNameUpdated: (updated: Meal) => void;
  onDeleted: (id: string) => void;
}

const SEASON_OPTIONS = [
  { value: '春', label: '春' },
  { value: '夏', label: '夏' },
  { value: '秋', label: '秋' },
  { value: '冬', label: '冬' },
];

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// 今週の献立エリア用（食材あり → 日付確定で一覧へ）
function ReadyMealRow({ meal, onDateSet, onNameUpdated, onDeleted }: {
  meal: Meal;
  onDateSet: (updated: Meal) => void;
  onNameUpdated: (updated: Meal) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(meal.name);
  const [date, setDate] = useState(todayString());
  const [savingName, setSavingName] = useState(false);
  const [savingDate, setSavingDate] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [dateError, setDateError] = useState('');

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

  async function handleEaten() {
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
        <TextInput
          value={editName}
          onChange={e => setEditName(e.currentTarget.value)}
          autoFocus
          size="xs"
        />
        <Group gap="xs">
          <Button size="xs" loading={savingName} disabled={!editName.trim()} onClick={handleSaveName} color="teal">保存</Button>
          <Button size="xs" variant="default" onClick={() => { setEditing(false); setEditName(meal.name); }}>✕</Button>
        </Group>
      </li>
    );
  }

  return (
    <li className="bg-white rounded-xl shadow-sm px-4 py-3 space-y-2">
      <Group justify="space-between" gap="xs">
        <Text size="sm" fw={500} className="flex-1 min-w-0 truncate">{meal.name}</Text>
        <Group gap={4}>
          <Button size="xs" variant="subtle" color="gray" onClick={() => setEditing(true)}>編集</Button>
          <Button size="xs" variant="subtle" color="red" loading={deleting} onClick={handleDelete}>削除</Button>
        </Group>
      </Group>
      <Group gap="xs">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:border-teal-600"
        />
        <Button size="xs" loading={savingDate} onClick={handleEaten} color="teal">食べた</Button>
      </Group>
      {dateError && <Text size="xs" c="red">{dateError}</Text>}
    </li>
  );
}

// 注文中エリア用（配達完了で今週の献立へ）
function OrderingRow({ meal, onComplete, onNameUpdated, onDeleted }: {
  meal: Meal;
  onComplete: (updated: Meal) => void;
  onNameUpdated: (updated: Meal) => void;
  onDeleted: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(meal.name);
  const [savingName, setSavingName] = useState(false);
  const [savingComplete, setSavingComplete] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    setSavingComplete(true);
    try {
      const updated = await setMealReady(meal.id, true);
      onComplete(updated);
    } finally {
      setSavingComplete(false);
    }
  }

  if (editing) {
    return (
      <li className="py-2 border-b border-gray-100 last:border-0 space-y-2">
        <TextInput
          value={editName}
          onChange={e => setEditName(e.currentTarget.value)}
          autoFocus
          size="xs"
        />
        <Group gap="xs">
          <Button size="xs" loading={savingName} disabled={!editName.trim()} onClick={handleSaveName} color="teal">保存</Button>
          <Button size="xs" variant="default" onClick={() => { setEditing(false); setEditName(meal.name); }}>✕</Button>
        </Group>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-1 py-2 border-b border-gray-100 last:border-0">
      <Text size="sm" className="flex-1 min-w-0 truncate">{meal.name}</Text>
      <Button size="xs" variant="subtle" color="gray" onClick={() => setEditing(true)}>編集</Button>
      <Button size="xs" variant="subtle" color="red" loading={deleting} onClick={handleDelete}>削除</Button>
      <Button size="xs" variant="light" color="teal" loading={savingComplete} onClick={handleComplete}>配達完了</Button>
    </li>
  );
}

export default function AddMeal({ onAdded, orderingMeals, readyMeals, onComplete, onDateSet, onNameUpdated, onDeleted }: Props) {
  const [mode, setMode] = useState<'order' | 'ate'>('order');
  const [name, setName] = useState('');
  const [season, setSeason] = useState<string | null>(null);
  const [date, setDate] = useState(todayString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const mealDate = mode === 'ate' ? date : '';
      const meal = await addMeal(name.trim(), mealDate, season as Season || undefined);
      onAdded(meal);
      setName('');
      setSeason(null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <Paper shadow="xs" p="lg" radius="md">
        <Title order={5} mb="md">献立に追加</Title>
        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <SegmentedControl
              value={mode}
              onChange={v => setMode(v as 'order' | 'ate')}
              data={[
                { value: 'order', label: '注文' },
                { value: 'ate', label: '食べた' },
              ]}
              fullWidth
              color="teal"
            />
            <TextInput
              label="料理名"
              placeholder="例：カレーライス"
              value={name}
              onChange={e => setName(e.currentTarget.value)}
              required
              autoComplete="off"
            />
            {mode === 'ate' && (
              <div>
                <Text size="sm" fw={500} mb={4}>食べた日</Text>
                <input
                  type="date"
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-600"
                />
              </div>
            )}
            <Select
              label="季節限定（任意）"
              placeholder="通年"
              data={SEASON_OPTIONS}
              value={season}
              onChange={setSeason}
              clearable
            />
            {error && <Text size="sm" c="red">{error}</Text>}
            {success && <Text size="sm" c="teal" fw={600}>追加しました！</Text>}
            <Button type="submit" loading={loading} disabled={!name.trim()} fullWidth color="teal">
              追加する
            </Button>
          </Stack>
        </form>
      </Paper>

      {readyMeals.length > 0 && (
        <Paper shadow="xs" p="lg" radius="md">
          <Title order={5} mb="xs">今週の献立</Title>
          <Text size="xs" c="dimmed" mb="md">日付を入力して「食べた」を押すと一覧に移動します</Text>
          <ul className="space-y-2">
            {readyMeals.map(meal => (
              <ReadyMealRow
                key={meal.id}
                meal={meal}
                onDateSet={onDateSet}
                onNameUpdated={onNameUpdated}
                onDeleted={onDeleted}
              />
            ))}
          </ul>
        </Paper>
      )}

      {orderingMeals.length > 0 && (
        <Paper shadow="xs" p="lg" radius="md">
          <Title order={5} mb="sm">注文中</Title>
          <ul>
            {orderingMeals.map(meal => (
              <OrderingRow
                key={meal.id}
                meal={meal}
                onComplete={onComplete}
                onNameUpdated={onNameUpdated}
                onDeleted={onDeleted}
              />
            ))}
          </ul>
        </Paper>
      )}
    </div>
  );
}
