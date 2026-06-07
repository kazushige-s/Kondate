import React from 'react';
import { Title, Text, Loader } from '@mantine/core';
import { Meal, Season } from '../types';

interface Props {
  meals: Meal[];
  loading: boolean;
  error: string;
}

const SEASON_MONTHS: Record<Season, number[]> = {
  春: [3, 4, 5], 夏: [6, 7, 8], 秋: [9, 10, 11], 冬: [12, 1, 2],
};

function currentSeason(): Season | null {
  const month = new Date().getMonth() + 1;
  for (const [season, months] of Object.entries(SEASON_MONTHS)) {
    if (months.includes(month)) return season as Season;
  }
  return null;
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / (1000 * 60 * 60 * 24));
}

function formatDaysAgo(days: number): string {
  if (days < 30) return `${days}日前`;
  return `約${Math.floor(days / 30)}ヶ月前`;
}

export default function ForgottenMeals({ meals, loading, error }: Props) {
  if (loading) return <div className="flex justify-center py-16"><Loader color="teal" /></div>;
  if (error) return <Text c="red" ta="center" py="xl">{error}</Text>;

  const season = currentSeason();
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  const latestByName = new Map<string, Meal>();
  for (const meal of meals) {
    const existing = latestByName.get(meal.name);
    if (!existing || meal.date > existing.date) latestByName.set(meal.name, meal);
  }

  const forgotten = Array.from(latestByName.values())
    .filter(meal => {
      if (meal.season && meal.season !== season) return false;
      return new Date(meal.date) < oneMonthAgo;
    })
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  return (
    <div>
      <Title order={5} mb="xs">リマインド</Title>
      <Text size="xs" c="dimmed" mb="md">1ヶ月以上食べていない料理です</Text>
      {forgotten.length === 0 ? (
        <Text c="dimmed" ta="center" py="xl">1ヶ月以上食べていない料理はありません</Text>
      ) : (
        <ul className="space-y-2">
          {forgotten.map(meal => (
            <li key={meal.id} className="flex items-center justify-between bg-white rounded-xl shadow-sm px-4 py-3">
              <Text size="sm">{meal.name}</Text>
              <Text size="xs" fw={600} c="orange">{formatDaysAgo(daysSince(meal.date))}</Text>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
