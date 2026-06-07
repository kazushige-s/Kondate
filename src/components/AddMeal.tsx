import React, { useState } from 'react';
import { Paper, TextInput, Select, Button, Stack, Title, Text } from '@mantine/core';
import { addMeal } from '../api/meals';
import { Meal, Season } from '../types';

interface Props {
  onAdded: (meal: Meal) => void;
}

const SEASON_OPTIONS = [
  { value: '', label: '通年' },
  { value: '春', label: '春' },
  { value: '夏', label: '夏' },
  { value: '秋', label: '秋' },
  { value: '冬', label: '冬' },
];

export default function AddMeal({ onAdded }: Props) {
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
    <Paper shadow="xs" p="lg" radius="md">
      <Title order={5} mb="xs">今週の献立に追加</Title>
      <Text size="xs" c="dimmed" mb="md">登録すると「今週」タブに表示されます</Text>
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
          {success && <Text size="sm" c="teal" fw={600}>今週に追加しました！</Text>}
          <Button
            type="submit"
            loading={loading}
            disabled={!name.trim()}
            fullWidth
            style={{ background: '#2d7a5a' }}
          >
            追加する
          </Button>
        </Stack>
      </form>
    </Paper>
  );
}
