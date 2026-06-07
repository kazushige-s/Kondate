import React from 'react';
import { Title, Text, Badge, Loader } from '@mantine/core';
import { Meal } from '../types';

interface Props {
  meals: Meal[];
  loading: boolean;
  error: string;
}

const SEASON_COLOR: Record<string, string> = {
  春: 'pink', 夏: 'yellow', 秋: 'orange', 冬: 'blue',
};

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

export default function MealList({ meals, loading, error }: Props) {
  if (loading) return <div className="flex justify-center py-16"><Loader color="teal" /></div>;
  if (error) return <Text c="red" ta="center" py="xl">{error}</Text>;
  if (meals.length === 0) return <Text c="dimmed" ta="center" py="xl">まだ登録されていません</Text>;

  const grouped = meals.reduce<Record<string, Meal[]>>((acc, meal) => {
    if (!acc[meal.date]) acc[meal.date] = [];
    acc[meal.date].push(meal);
    return acc;
  }, {});

  const sortedDates = Object.keys(grouped).sort((a, b) => (a < b ? 1 : -1));

  return (
    <div className="space-y-3">
      <Title order={5} mb="sm">献立一覧</Title>
      {sortedDates.map(date => (
        <div key={date} className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="bg-teal-50 text-teal-700 text-xs font-bold px-4 py-2">
            {formatDate(date)}
          </div>
          <ul className="divide-y divide-gray-50">
            {grouped[date].map(meal => (
              <li key={meal.id} className="flex items-center justify-between px-4 py-3">
                <Text size="sm">{meal.name}</Text>
                {meal.season && (
                  <Badge size="xs" color={SEASON_COLOR[meal.season]} variant="light">
                    {meal.season}
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
