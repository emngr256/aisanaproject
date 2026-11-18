'use client';
import { useState } from 'react';
import { LogOut, ShieldCheck, Sparkles, Check, LoaderCircle, UserRound } from 'lucide-react';
import { useAuth } from '@/lib/auth-client';
import { tr } from '@/lib/i18n';

export function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function AuthModalContent({
  onClose,
  onNotification,
}: {
  onClose: () => void;
  onNotification?: (msg: string) => void;
}) {
  const { user, loading, logout, loginDemo } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  async function handleLogout() {
    setSubmitting(true);
    await logout();
    setSubmitting(false);
    onNotification?.(tr('Выход выполнен'));
    onClose();
  }

  async function handleDemo() {
    setSubmitting(true);
    const demoUser = await loginDemo();
    setSubmitting(false);
    if (demoUser) {
      onNotification?.(tr('Успешный вход через Google!'));
      onClose();
    }
  }

  if (user) {
    return (
      <div className="auth-modal-content">
        <div className="account-card">
          {user.picture ? (
            <img src={user.picture} alt={user.name} className="avatar-img" />
          ) : (
            <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
          )}
          <div className="account-info">
            <h3>{user.name}</h3>
            <p>{user.email}</p>
            <span className="account-badge">
              <GoogleIcon size={14} /> {tr('Вход выполнен через Google')}
            </span>
          </div>
        </div>

        <p className="form-intro">
          {tr('Записи дневника привязаны к твоей сессии.')}
        </p>

        <div className="form-privacy">
          <ShieldCheck size={16} />
          <span>
            {tr('Мы получаем только твоё имя, email и аватар. Никакие пароли не передаются.')}
          </span>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            className="danger-button"
            onClick={handleLogout}
            disabled={submitting || loading}
          >
            <LogOut size={16} />
            {tr('Выйти из аккаунта')}
          </button>
          <button type="button" className="primary" onClick={onClose}>
            {tr('Понятно, спасибо ')}
            <Check size={16} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-modal-content">
      <div className="auth-header-card">
        <div className="auth-icon-circle">
          <GoogleIcon size={32} />
        </div>
        <h2>{tr('Вход в Aisana')}</h2>
        <p className="form-intro">
          {tr('Войди с Google аккаунтом, чтобы сохранить своё пространство.')}
        </p>
      </div>

      <div className="auth-actions">
        <a href="/api/auth/google" className="google-signin-btn">
          <GoogleIcon size={20} />
          <span>{tr('Продолжить с Google')}</span>
        </a>

        <div className="auth-divider">
          <span>или</span>
        </div>

        <button
          type="button"
          className="secondary full-width"
          onClick={handleDemo}
          disabled={submitting || loading}
        >
          {submitting || loading ? (
            <LoaderCircle size={16} className="spin" />
          ) : (
            <Sparkles size={16} />
          )}
          <span>{tr('Тестовый вход (без ключей Google)')}</span>
        </button>
      </div>

      <div className="form-privacy">
        <ShieldCheck size={16} />
        <span>
          {tr('Мы получаем только твоё имя, email и аватар. Никакие пароли не передаются.')}
        </span>
      </div>
    </div>
  );
}
