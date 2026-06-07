import React, { useEffect, useState } from 'react';
import { AppShell, Group, Title } from '@mantine/core';
import './App.css';
import { getMeals } from './api/meals';
import { Meal, Tab } from './types';
import AddMeal from './components/AddMeal';
import MealList from './components/MealList';
import ForgottenMeals from './components/ForgottenMeals';
import ThisWeek from './components/ThisWeek';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'add', label: '登録', icon: '＋' },
  { id: 'thisweek', label: '今週', icon: '📅' },
  { id: 'list', label: '一覧', icon: '≡' },
  { id: 'forgotten', label: '忘れ物', icon: '！' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('thisweek');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMeals()
      .then(setMeals)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function handleAdded(meal: Meal) {
    setMeals(prev => [meal, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1)));
  }

  function handleDateSet(updated: Meal) {
    setMeals(prev => prev.map(m => m.id === updated.id ? updated : m));
  }

  const datedMeals = meals.filter(m => m.date);
  const undatedMeals = meals.filter(m => !m.date);

  return (
    <AppShell
      header={{ height: 56 }}
      footer={{ height: 64 }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" style={{ background: '#2d7a5a' }}>
          <Title order={4} c="white">我が家の献立</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Main className="bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-5 pb-8">
          {tab === 'add' && <AddMeal onAdded={handleAdded} />}
          {tab === 'thisweek' && (
            <ThisWeek
              meals={undatedMeals}
              loading={loading}
              error={error}
              onDateSet={handleDateSet}
            />
          )}
          {tab === 'list' && <MealList meals={datedMeals} loading={loading} error={error} />}
          {tab === 'forgotten' && <ForgottenMeals meals={datedMeals} loading={loading} error={error} />}
        </div>
      </AppShell.Main>

      <AppShell.Footer>
        <nav className="flex h-full border-t border-gray-200">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'flex-1 flex flex-col items-center justify-center gap-0.5 text-xs font-medium transition-colors',
                tab === t.id ? 'text-[#2d7a5a]' : 'text-gray-400',
              ].join(' ')}
            >
              <span className="text-xl leading-none">{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </nav>
      </AppShell.Footer>
    </AppShell>
  );
}
