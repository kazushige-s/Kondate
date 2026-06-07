import React, { useState } from 'react';
import { Paper, TextInput, Select, Button, Stack, Group, Title, Text } from '@mantine/core';
import { addMeal, updateMealName, deleteMeal, setMealReady } from '../api/meals';
import { Meal, Season } from '../types';

interface Props {
  onAdded: (meal: Meal) => void;
  orderingMeals: Meal[];
  onComplete: (updated: Meal) => void;
  onNameUpdated: (updated: Meal) => void;
  onDeleted: (id: string) => void;
}

const SEASON_OPTIONS = [
  { value: '', label: '通年' },
  { value: '春', label: '春' },
  { value: '夏', label: '夏' },
  { value: '秋', label: '秋' },
  { value: '冬', label: '冬' },
];

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
          <Button size="xs" loading={savingName} disabled={!editName.trim()} onClick={handleSaveName} color="teal">
            保存
          </Button>
          <Button size="xs" variant="default" onClick={() => { setEditing(false); setEditName(meal.name); }}>
            ✕
          </Button>
        </Group>
      </li>
    );
  }

  return (
    <li className="flex items-center gap-1 py-2 border-b border-gray-100 last:border-0">
      <Text size="sm" className="flex-1 min-w-0 truncate">{meal.name}</Text>
      <Button size="xs" variant="subtle" color="gray" onClick={() => setEditing(true)}>編集</Button>
      <Button size="xs" variant="subtle" color="red" loading={deleting} onClick={handleDelete}>削除</Button>
      <Button size="xs" variant="light" color="teal" loading={savingComplete} onClick={handleComplete}>
        配達完了
      </Button>
    </li>
  );
}

export default function AddMeal({ onAdded, orderingMeals, onComplete, onNameUpdated, onDeleted }: Props) {
  const [name, setName] = useState('');
  const [season, setSeason] = useState<string>('');
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
      const meal = await addMeal(name.trim(), '', season as Season || undefined);
      onAdded(meal);
      setName('');
      setSeason('');
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
            <TextInput
              label="料理名"
              placeholder="例：カレーライス"
              value={name}
              onChange={e => setName(e.currentTarget.value)}
              required
              autoComplete="off"
            />
            <Select
              label="季節限定（任意）"
              data={SEASON_OPTIONS}
              value={season}
              onChange={v => setSeason(v ?? '')}
              allowDeselect={false}
            />
            {error && <Text size="sm" c="red">{error}</Text>}
            {success && <Text size="sm" c="teal" fw={600}>追加しました！</Text>}
            <Button type="submit" loading={loading} disabled={!name.trim()} fullWidth color="teal">
              追加する
            </Button>
          </Stack>
        </form>
      </Paper>

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
