import React, { useState, useMemo, useEffect } from 'react';
import { Title, Text, Button, Badge, Loader, Collapse } from '@mantine/core';
import { Meal, Season } from '../types';

interface Props {
  meals: Meal[];
  loading: boolean;
  error: string;
}

const SEASON_MONTHS: Record<Season, number[]> = {
  春: [3, 4, 5], 夏: [6, 7, 8], 秋: [9, 10, 11], 冬: [12, 1, 2],
};
const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土'];

function currentSeason(): Season | null {
  const month = new Date().getMonth() + 1;
  for (const [season, months] of Object.entries(SEASON_MONTHS)) {
    if (months.includes(month)) return season as Season;
  }
  return null;
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function daysSince(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  const then = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDaysAgo(days: number): string {
  if (days < 30) return `${days}日前`;
  return `約${Math.floor(days / 30)}ヶ月前`;
}

function formatMonthDay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  return `${m}月${d}日（${WEEKDAYS[new Date(y, m - 1, d).getDay()]}）`;
}

function SectionCard({ title, badge, defaultOpen = false, children }: {
  title: string;
  badge?: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 text-left"
      >
        <span className="font-bold text-gray-700 text-sm">{title}</span>
        <span className="flex items-center gap-2">
          {badge && <span className="text-xs text-gray-400">{badge}</span>}
          <span className="text-gray-400 text-xs">{open ? '▲' : '▼'}</span>
        </span>
      </button>
      <Collapse expanded={open}>
        <div className="border-t border-gray-100 px-4 py-3">
          {children}
        </div>
      </Collapse>
    </div>
  );
}

export default function ForgottenMeals({ meals, loading, error }: Props) {
  const [randomMeal, setRandomMeal] = useState<string | null>(null);

  const uniqueNames = useMemo(
    () => Array.from(new Set(meals.map(m => m.name))),
    [meals],
  );

  useEffect(() => {
    if (uniqueNames.length > 0 && randomMeal === null) reroll();
  }, [uniqueNames]); // eslint-disable-line react-hooks/exhaustive-deps

  function reroll() {
    if (uniqueNames.length === 0) return;
    setRandomMeal(uniqueNames[Math.floor(Math.random() * uniqueNames.length)]);
  }

  // 人気・不人気ランキング
  const { popularRanking, unpopularRanking } = useMemo(() => {
    const countByName = new Map<string, number>();
    for (const meal of meals) {
      countByName.set(meal.name, (countByName.get(meal.name) ?? 0) + 1);
    }
    const sorted = Array.from(countByName.entries()).sort((a, b) => b[1] - a[1]);
    return {
      popularRanking: sorted.slice(0, 10),
      unpopularRanking: [...sorted].sort((a, b) => a[1] - b[1]).slice(0, 10),
    };
  }, [meals]);

  // 1ヶ月前の1週間
  const lastMonthWeekMeals = useMemo(() => {
    const start = new Date();
    start.setMonth(start.getMonth() - 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 7);
    const startStr = toDateStr(start);
    const endStr = toDateStr(end);
    const byDate: Record<string, string[]> = {};
    for (const meal of meals
      .filter(m => m.date >= startStr && m.date < endStr)
      .sort((a, b) => a.date.localeCompare(b.date))) {
      if (!byDate[meal.date]) byDate[meal.date] = [];
      byDate[meal.date].push(meal.name);
    }
    return byDate;
  }, [meals]);

  // 1ヶ月以上食べていない
  const forgottenMeals = useMemo(() => {
    const season = currentSeason();
    const thresholdStr = toDateStr(new Date(new Date().setMonth(new Date().getMonth() - 1)));
    const latestByName = new Map<string, Meal>();
    for (const meal of meals) {
      const existing = latestByName.get(meal.name);
      if (!existing || meal.date > existing.date) latestByName.set(meal.name, meal);
    }
    return Array.from(latestByName.values())
      .filter(meal => {
        if (meal.season && meal.season !== season) return false;
        return meal.date < thresholdStr;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [meals]);

  if (loading) return <div className="flex justify-center py-16"><Loader color="orange" /></div>;
  if (error) return <Text c="red" ta="center" py="xl">{error}</Text>;

  const lastMonthDates = Object.keys(lastMonthWeekMeals);

  return (
    <div className="space-y-3">
      <Title order={5} mb="sm">リマインド</Title>

      {/* ランダム提案 */}
      <div className="bg-white rounded-xl shadow-sm px-4 py-5 text-center">
        <Text size="xs" c="dimmed" mb="xs">今日はこれはどうですか？</Text>
        {randomMeal ? (
          <>
            <Title order={3} mb="sm" style={{ color: '#F97316' }}>{randomMeal}</Title>
            <Button variant="light" color="orange" size="xs" onClick={reroll}>もう一度</Button>
          </>
        ) : (
          <Text c="dimmed" size="sm">献立データがありません</Text>
        )}
      </div>

      {/* 1ヶ月以上食べていない */}
      <SectionCard
        title="しばらく食べていない料理"
        badge={`${forgottenMeals.length}件`}
        defaultOpen
      >
        {forgottenMeals.length === 0 ? (
          <Text size="sm" c="dimmed">1ヶ月以上食べていない料理はありません</Text>
        ) : (
          <ul className="space-y-1">
            {forgottenMeals.map(meal => (
              <li key={meal.id} className="flex items-center justify-between py-1.5">
                <Text size="sm">{meal.name}</Text>
                <Text size="xs" fw={600} c="orange">{formatDaysAgo(daysSince(meal.date))}</Text>
              </li>
            ))}
          </ul>
        )}
      </SectionCard>

      {/* 1ヶ月前の1週間 */}
      <SectionCard
        title="1ヶ月前の献立"
        badge={lastMonthDates.length > 0 ? `${lastMonthDates.length}日分` : undefined}
      >
        {lastMonthDates.length === 0 ? (
          <Text size="sm" c="dimmed">この期間の献立はありません</Text>
        ) : (
          <div className="space-y-3">
            {lastMonthDates.map(date => (
              <div key={date}>
                <Text size="xs" fw={700} c="orange" mb={2}>{formatMonthDay(date)}</Text>
                <ul className="pl-2 space-y-0.5">
                  {lastMonthWeekMeals[date].map((name, i) => (
                    <li key={i}><Text size="sm">{name}</Text></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* 人気ランキング */}
      <SectionCard title="人気ランキング" badge="トップ10">
        {popularRanking.length === 0 ? (
          <Text size="sm" c="dimmed">データがありません</Text>
        ) : (
          <ol className="space-y-2">
            {popularRanking.map(([name, count], i) => (
              <li key={name} className="flex items-center gap-2">
                <span className={`text-xs font-bold w-5 text-center shrink-0 ${
                  i === 0 ? 'text-yellow-500' :
                  i === 1 ? 'text-gray-400' :
                  i === 2 ? 'text-orange-400' : 'text-gray-300'
                }`}>
                  {i + 1}
                </span>
                <Text size="sm" className="flex-1 min-w-0 truncate">{name}</Text>
                <Badge size="xs" color="orange" variant="light">{count}回</Badge>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>

      {/* 不人気ランキング */}
      <SectionCard title="不人気ランキング" badge="トップ10">
        {unpopularRanking.length === 0 ? (
          <Text size="sm" c="dimmed">データがありません</Text>
        ) : (
          <ol className="space-y-2">
            {unpopularRanking.map(([name, count], i) => (
              <li key={name} className="flex items-center gap-2">
                <span className="text-xs font-bold w-5 text-center shrink-0 text-gray-300">
                  {i + 1}
                </span>
                <Text size="sm" className="flex-1 min-w-0 truncate">{name}</Text>
                <Badge size="xs" color="gray" variant="light">{count}回</Badge>
              </li>
            ))}
          </ol>
        )}
      </SectionCard>
    </div>
  );
}
