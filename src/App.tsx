import React, { useEffect, useState } from 'react';
import { AppShell, Group, Title } from '@mantine/core';
import './App.css';
import { getMeals } from './api/meals';
import { Meal, Tab } from './types';
import AddMeal from './components/AddMeal';
import MealList from './components/MealList';
import ForgottenMeals from './components/ForgottenMeals';

const TABS: { id: Tab; label: string; icon: string }[] = [
  { id: 'add', label: '登録', icon: '＋' },
  { id: 'list', label: '一覧', icon: '≡' },
  { id: 'forgotten', label: 'リマインド', icon: '！' },
];

export default function App() {
  const [tab, setTab] = useState<Tab>('add');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getMeals()
      .then(setMeals)
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  function update(updated: Meal) {
    setMeals(prev => prev.map(m => m.id === updated.id ? updated : m));
  }

  function handleAdded(meal: Meal) {
    setMeals(prev => [meal, ...prev]);
  }

  function handleDeleted(id: string) {
    setMeals(prev => prev.filter(m => m.id !== id));
  }

  const orderingMeals = meals.filter(m => !m.date && !m.isReady);
  const readyMeals    = meals.filter(m => !m.date && m.isReady);
  const datedMeals    = meals.filter(m => m.date);

  return (
    <AppShell header={{ height: 56 }} footer={{ height: 64 }}>
      <AppShell.Header>
        <Group h="100%" px="md" style={{ background: '#2d7a5a' }}>
          <Title order={4} c="white">我が家の献立</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Main className="bg-gray-50">
        <div className="max-w-lg mx-auto px-4 py-5 pb-8">
          {tab === 'add' && (
            <AddMeal
              onAdded={handleAdded}
              orderingMeals={orderingMeals}
              readyMeals={readyMeals}
              onComplete={update}
              onDateSet={update}
              onNameUpdated={update}
              onDeleted={handleDeleted}
            />
          )}
          {tab === 'list' && (
            <MealList meals={datedMeals} loading={loading} error={error} onReverted={update} onNameUpdated={update} />
          )}
          {tab === 'forgotten' && (
            <ForgottenMeals meals={datedMeals} loading={loading} error={error} />
          )}
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
