import React, { useState } from 'react';
import { Title, Text, Button, Loader } from '@mantine/core';
import { updateMealDate } from '../api/meals';
import { Meal } from '../types';

interface Props {
  meals: Meal[];
  loading: boolean;
  error: string;
  onDateSet: (updatedMeal: Meal) => void;
}

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function MealRow({ meal, onDateSet }: { meal: Meal; onDateSet: (m: Meal) => void }) {
  const [date, setDate] = useState(todayString());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleConfirm() {
    setLoading(true);
    setError('');
    try {
      const updated = await updateMealDate(meal.id, date);
      onDateSet(updated);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <li className="bg-white rounded-xl shadow-sm px-4 py-3 space-y-2">
      <Text size="sm" fw={500}>{meal.name}</Text>
      <div className="flex gap-2 items-center">
        <input
          type="date"
          value={date}
          onChange={e => setDate(e.target.value)}
          className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-teal-600"
        />
        <Button
          size="xs"
          loading={loading}
          onClick={handleConfirm}
          style={{ background: '#2d7a5a' }}
        >
          確定
        </Button>
      </div>
      {error && <Text size="xs" c="red">{error}</Text>}
    </li>
  );
}

export default function ThisWeek({ meals, loading, error, onDateSet }: Props) {
  if (loading) return <div className="flex justify-center py-16"><Loader color="teal" /></div>;
  if (error) return <Text c="red" ta="center" py="xl">{error}</Text>;

  return (
    <div>
      <Title order={5} mb="xs">今週の献立</Title>
      <Text size="xs" c="dimmed" mb="md">日付を入力して「確定」すると一覧に移動します</Text>
      {meals.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">予定はありません</Text>
      ) : (
        <ul className="space-y-2">
          {meals.map(meal => (
            <MealRow key={meal.id} meal={meal} onDateSet={onDateSet} />
          ))}
        </ul>
      )}
    </div>
  );
}
