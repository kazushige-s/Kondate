import React, { useState } from 'react';
import { Title, Text, Button, Group, Loader, TextInput } from '@mantine/core';
import { updateMealDate, updateMealName, deleteMeal } from '../api/meals';
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

function MealRow({ meal, onDateSet, onNameUpdated, onDeleted }: {
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
        <TextInput
          value={editName}
          onChange={e => setEditName(e.currentTarget.value)}
          autoFocus
          error={nameError}
        />
        <Group gap="xs">
          <Button size="xs" loading={savingName} disabled={!editName.trim()} onClick={handleSaveName} color="teal">
            保存
          </Button>
          <Button size="xs" variant="default" onClick={() => { setEditing(false); setEditName(meal.name); }}>
            キャンセル
          </Button>
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
        <Button size="xs" loading={savingDate} onClick={handleConfirmDate} color="teal">
          食べた
        </Button>
      </Group>
      {dateError && <Text size="xs" c="red">{dateError}</Text>}
    </li>
  );
}

export default function ThisWeek({ meals, loading, error, onDateSet, onNameUpdated, onDeleted }: Props) {
  if (loading) return <div className="flex justify-center py-16"><Loader color="teal" /></div>;
  if (error) return <Text c="red" ta="center" py="xl">{error}</Text>;

  return (
    <div>
      <Title order={5} mb="xs">食材あり</Title>
      <Text size="xs" c="dimmed" mb="md">日付を入力して「食べた」を押すと一覧に移動します</Text>
      {meals.length === 0 ? (
        <Text size="sm" c="dimmed" ta="center" py="xl">食材ありの料理はありません</Text>
      ) : (
        <ul className="space-y-2">
          {meals.map(meal => (
            <MealRow key={meal.id} meal={meal} onDateSet={onDateSet} onNameUpdated={onNameUpdated} onDeleted={onDeleted} />
          ))}
        </ul>
      )}
    </div>
  );
}
