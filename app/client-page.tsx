'use client';

import React, { useEffect, useState } from 'react';
import { Title, useMantineColorScheme } from '@mantine/core';
import {
  MdAddCircle, MdAddCircleOutline,
  MdRestaurantMenu, MdOutlineRestaurantMenu,
  MdLightbulb, MdOutlineLightbulb,
  MdWbSunny, MdNightlight,
} from 'react-icons/md';
import { getMeals } from '@/lib/meals-api';
import { isDarkInJapan } from '@/lib/sunset';
import type { Meal, Tab } from '@/types';
import AddMeal from '@/components/AddMeal';
import MealList from '@/components/MealList';
import ForgottenMeals from '@/components/ForgottenMeals';

const BRAND = '#F97316';

const TABS = [
  { id: 'add'       as Tab, label: '登録',      Active: MdAddCircle        as React.ElementType, Inactive: MdAddCircleOutline        as React.ElementType },
  { id: 'list'      as Tab, label: '一覧',      Active: MdRestaurantMenu   as React.ElementType, Inactive: MdOutlineRestaurantMenu   as React.ElementType },
  { id: 'forgotten' as Tab, label: 'リマインド', Active: MdLightbulb        as React.ElementType, Inactive: MdOutlineLightbulb        as React.ElementType },
];

export default function ClientPage() {
  const [tab, setTab] = useState<Tab>('add');
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  useEffect(() => {
    getMeals()
      .then(setMeals)
      .catch(err => setError((err as Error).message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    // Auto-detect based on Japan sunset if user has no manual preference
    const isManual = localStorage.getItem('kondate-manual-theme');
    if (!isManual) {
      setColorScheme(isDarkInJapan() ? 'dark' : 'light');
    }
  }, [setColorScheme]);

  function toggleDarkMode() {
    const next = isDark ? 'light' : 'dark';
    setColorScheme(next);
    localStorage.setItem('kondate-manual-theme', next);
  }

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

  const navBg = isDark ? 'rgba(30, 31, 34, 0.92)' : 'rgba(255, 255, 255, 0.92)';
  const navInactiveColor = isDark ? '#6B7280' : '#9CA3AF';

  return (
    <div style={{ background: 'var(--mantine-color-body)', minHeight: '100dvh' }}>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 200,
        background: BRAND,
        paddingTop: 'env(safe-area-inset-top)',
      }}>
        <div style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          paddingLeft: 16,
          paddingRight: 12,
          justifyContent: 'space-between',
        }}>
          <Title order={4} c="white">我が家の献立</Title>
          <button
            onClick={toggleDarkMode}
            aria-label={isDark ? 'ライトモードに切り替え' : 'ダークモードに切り替え'}
            style={{
              background: 'rgba(255,255,255,0.15)',
              border: 'none',
              borderRadius: 8,
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              transition: 'background 0.15s ease',
            }}
          >
            {isDark ? <MdWbSunny size={20} /> : <MdNightlight size={20} />}
          </button>
        </div>
      </header>

      <main style={{
        paddingTop: 'calc(56px + env(safe-area-inset-top))',
        paddingBottom: 'calc(120px + env(safe-area-inset-bottom))',
      }}>
        <div className="max-w-lg mx-auto px-4 py-5">
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
      </main>

      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        display: 'flex',
        justifyContent: 'center',
        paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
        paddingTop: 8,
        pointerEvents: 'none',
      }}>
        <nav style={{
          display: 'flex',
          gap: 4,
          background: navBg,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderRadius: 40,
          boxShadow: isDark
            ? '0 4px 24px rgba(0,0,0,0.5), 0 1px 4px rgba(0,0,0,0.3)'
            : '0 4px 24px rgba(0,0,0,0.12), 0 1px 4px rgba(0,0,0,0.06)',
          padding: '6px 6px',
          pointerEvents: 'auto',
        }}>
          {TABS.map(t => {
            const isActive = tab === t.id;
            const Icon = isActive ? t.Active : t.Inactive;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 2,
                  padding: '10px 20px',
                  borderRadius: 32,
                  border: 'none',
                  background: isActive ? BRAND : 'transparent',
                  color: isActive ? 'white' : navInactiveColor,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  minWidth: 68,
                }}
              >
                <Icon size={22} />
                <span style={{ fontSize: 10, fontWeight: 600, lineHeight: 1 }}>{t.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
