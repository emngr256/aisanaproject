'use client';
import { useEffect, useState } from 'react';
import {
  ShieldAlert,
  Database,
  Users,
  FileText,
  Activity,
  Sparkles,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Server,
  Zap,
} from 'lucide-react';
import { useJournal } from '@/lib/store';
import { tr } from '@/lib/i18n';
import { createEntryId } from '@/lib/entry-id';
import { localAnalyze } from '@/lib/local-ml';
import type { Entry } from '@/lib/analysis';

interface AdminData {
  stats: {
    totalUsers: number;
    totalEntries: number;
    recentUsers: Array<{
      id: string;
      email: string;
      name: string;
      picture?: string;
      createdAt: string;
      entriesCount: number;
    }>;
    dbStatus: 'connected' | 'offline' | 'not_configured';
    dbHost?: string;
    latencyMs?: number;
  };
  system: {
    nodeVersion: string;
    isRender: boolean;
    hasRustApi: boolean;
    hasGoogleAuth: boolean;
  };
}

export function AdminPanel({
  onNotification,
}: {
  onNotification?: (msg: string) => void;
}) {
  const [data, setData] = useState<AdminData | null>(null);
  const [loading, setLoading] = useState(false);
  const [dbPingResult, setDbPingResult] = useState<string | null>(null);
  const { samples, add, entries, remove } = useJournal();

  async function loadStats() {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadStats();
  }, []);

  function handleLoadSamples() {
    samples();
    onNotification?.(tr('Учебные примеры загружены'));
  }

  function handleClearSamples() {
    const sampleEntries = entries.filter((e) => e.sample);
    sampleEntries.forEach((e) => remove(e.id));
    onNotification?.(tr('Тестовые записи очищены'));
  }

  function handleCreateStressEntry() {
    const input = {
      text: 'Скоро экзамен по математическому анализу и защита курсового проекта. Не успеваю по графику, сплю мало, чувствую сильное напряжение и усталость.',
      mood: 1,
      sleep: 4.5,
      activity: 10,
      workload: 10,
    };
    const analysis = localAnalyze(input);
    const entry: Entry = {
      ...input,
      id: createEntryId(),
      analysis,
      clarifications: [],
      sample: false,
      createdAt: new Date().toISOString(),
    };
    add(entry);
    onNotification?.(tr('Тестовая запись добавлена'));
  }

  function handleCreateCalmEntry() {
    const input = {
      text: 'Сегодня всё успел по расписанию, погулял в парке и хорошо отдохнул перед завтрашними парами. Самочувствие отличное.',
      mood: 5,
      sleep: 8,
      activity: 45,
      workload: 4,
    };
    const analysis = localAnalyze(input);
    const entry: Entry = {
      ...input,
      id: createEntryId(),
      analysis,
      clarifications: [],
      sample: false,
      createdAt: new Date().toISOString(),
    };
    add(entry);
    onNotification?.(tr('Тестовая запись добавлена'));
  }

  return (
    <div className="admin-panel-container">
      {/* Header banner */}
      <section className="card admin-banner">
        <div className="admin-banner-info">
          <div className="admin-badge">
            <ShieldAlert size={16} />
            <span>{tr('Администратор')}</span>
          </div>
          <h2>{tr('Панель администратора')}</h2>
          <p>{tr('Управление и диагностика системы')}</p>
          <div className="admin-identity">
            <span className="admin-email">alan27945@gmail.com</span>
            <span className="admin-tag">Super Admin</span>
          </div>
        </div>
        <button
          type="button"
          className="secondary refresh-btn"
          onClick={loadStats}
          disabled={loading}
        >
          <RefreshCw size={15} className={loading ? 'spin' : ''} />
          <span>{loading ? 'Загрузка...' : 'Обновить'}</span>
        </button>
      </section>

      {/* Stats Grid */}
      <div className="stats-grid admin-stats-grid">
        <div className="card stat">
          <div className="stat-top">
            <span>{tr('Пользователи в БД')}</span>
            <span className="icon-box purple">
              <Users size={18} />
            </span>
          </div>
          <div className="stat-value">{data?.stats.totalUsers ?? '—'}</div>
          <div className="stat-foot">В таблице users (PostgreSQL)</div>
        </div>

        <div className="card stat">
          <div className="stat-top">
            <span>{tr('Записей в БД')}</span>
            <span className="icon-box blue">
              <FileText size={18} />
            </span>
          </div>
          <div className="stat-value">{data?.stats.totalEntries ?? '—'}</div>
          <div className="stat-foot">В таблице entries (PostgreSQL)</div>
        </div>

        <div className="card stat">
          <div className="stat-top">
            <span>{tr('Статус PostgreSQL')}</span>
            <span
              className={`icon-box ${
                data?.stats.dbStatus === 'connected' ? 'green' : 'peach'
              }`}
            >
              <Database size={18} />
            </span>
          </div>
          <div className="stat-value" style={{ fontSize: '20px' }}>
            {data?.stats.dbStatus === 'connected' ? (
              <span style={{ color: '#48bb78', display: 'flex', alignItems: 'center', gap: 6 }}>
                <CheckCircle2 size={20} /> {tr('Подключено')}
              </span>
            ) : (
              <span style={{ color: '#ed8936', display: 'flex', alignItems: 'center', gap: 6 }}>
                <XCircle size={20} /> {tr('Офлайн / Локально')}
              </span>
            )}
          </div>
          <div className="stat-foot">
            {data?.stats.latencyMs ? `${data.stats.latencyMs} ms latency` : 'Render Cloud VPC'}
          </div>
        </div>

        <div className="card stat">
          <div className="stat-top">
            <span>Окружение</span>
            <span className="icon-box green">
              <Server size={18} />
            </span>
          </div>
          <div className="stat-value" style={{ fontSize: '18px' }}>
            {data?.system.isRender ? 'Render Cloud' : 'Local Node.js'}
          </div>
          <div className="stat-foot">
            Node {data?.system.nodeVersion || 'v20'} · Next.js 16
          </div>
        </div>
      </div>

      {/* Developer & Test Tools */}
      <section className="card admin-tools-card">
        <div className="card-heading">
          <div>
            <h2>
              <Zap size={18} color="#9476b6" /> {tr('Тестовые функции администратора')}
            </h2>
            <p>Доступны только для вашего аккаунта alan27945@gmail.com</p>
          </div>
        </div>
        <div className="admin-actions-grid">
          <button type="button" className="secondary" onClick={handleLoadSamples}>
            <Sparkles size={16} />
            <span>{tr('Загрузить 7 тестовых записей')}</span>
          </button>

          <button type="button" className="secondary" onClick={handleClearSamples}>
            <Trash2 size={16} />
            <span>{tr('Очистить тестовые записи')}</span>
          </button>

          <button type="button" className="secondary" onClick={handleCreateStressEntry}>
            <Activity size={16} color="#e53e3e" />
            <span>{tr('Создать тестовую запись стресса (9/10)')}</span>
          </button>

          <button type="button" className="secondary" onClick={handleCreateCalmEntry}>
            <Activity size={16} color="#38a169" />
            <span>{tr('Создать спокойную тестовую запись (2/10)')}</span>
          </button>
        </div>
      </section>

      {/* Recent Users in DB */}
      <section className="card admin-users-card">
        <div className="card-heading">
          <div>
            <h2>
              <Users size={18} /> {tr('Недавние пользователи')}
            </h2>
            <p>Авторизованные через Google в базе данных PostgreSQL</p>
          </div>
        </div>
        <div className="admin-users-list">
          {data?.stats.recentUsers && data.stats.recentUsers.length > 0 ? (
            data.stats.recentUsers.map((u) => (
              <div key={u.id} className="admin-user-row">
                {u.picture ? (
                  <img src={u.picture} alt={u.name} className="avatar small avatar-img" />
                ) : (
                  <div className="avatar small">{u.name.charAt(0).toUpperCase()}</div>
                )}
                <div className="admin-user-info">
                  <strong>{u.name}</strong>
                  <span>{u.email}</span>
                </div>
                <div className="admin-user-meta">
                  <span className="entries-count-badge">
                    {tr('Записей:')} {u.entriesCount}
                  </span>
                  <small>{new Date(u.createdAt).toLocaleDateString()}</small>
                </div>
              </div>
            ))
          ) : (
            <p className="muted small-text" style={{ padding: '20px 24px' }}>
              Пользователей в базе данных пока нет. После первого входа через Google профиль появится здесь.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
