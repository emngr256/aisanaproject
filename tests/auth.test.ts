import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken, getGoogleOAuthUrl, isUserAdmin, AuthUser } from '../src/lib/auth';

test('signs and verifies user session token correctly', () => {
  const user: AuthUser = {
    id: 'google-sub-12345',
    name: 'Тестовый Пользователь',
    email: 'user@example.com',
    picture: 'https://lh3.googleusercontent.com/test-pic',
    isAdmin: false,
  };

  const token = signToken(user);
  assert.ok(typeof token === 'string' && token.includes('.'));

  const verified = verifyToken<AuthUser>(token);
  assert.deepEqual(verified, user);
});

test('recognizes alan27945@gmail.com as administrator', () => {
  assert.equal(isUserAdmin('alan27945@gmail.com'), true);
  assert.equal(isUserAdmin('ALAN27945@GMAIL.COM'), true);
  assert.equal(isUserAdmin('user@example.com'), false);
  assert.equal(isUserAdmin(null), false);

  const adminUser: AuthUser = {
    id: 'admin-1',
    name: 'Alan Admin',
    email: 'alan27945@gmail.com',
  };
  const token = signToken(adminUser);
  const verified = verifyToken<AuthUser>(token);
  assert.equal(verified?.isAdmin, true);
});

test('rejects tampered or malformed tokens', () => {
  assert.equal(verifyToken(''), null);
  assert.equal(verifyToken('not-a-token'), null);
  assert.equal(verifyToken('a.b.c'), null);

  const user: AuthUser = { id: '1', name: 'User', email: 'test@mail.com', isAdmin: false };
  const validToken = signToken(user);
  const [data] = validToken.split('.');

  // Tampered signature
  const fakeToken = `${data}.tamperedSignature`;
  assert.equal(verifyToken(fakeToken), null);
});

test('generates valid Google OAuth authorization URL', () => {
  process.env.GOOGLE_CLIENT_ID = 'test-client-id.apps.googleusercontent.com';
  const urlString = getGoogleOAuthUrl('https://aisana.example.com');
  const url = new URL(urlString);

  assert.equal(url.origin, 'https://accounts.google.com');
  assert.equal(url.pathname, '/o/oauth2/v2/auth');
  assert.equal(url.searchParams.get('client_id'), 'test-client-id.apps.googleusercontent.com');
  assert.equal(url.searchParams.get('redirect_uri'), 'https://aisana.example.com/api/auth/callback/google');
  assert.equal(url.searchParams.get('response_type'), 'code');
  assert.equal(url.searchParams.get('scope'), 'openid email profile');
});

test('throws friendly error if GOOGLE_CLIENT_ID is not configured', () => {
  delete process.env.GOOGLE_CLIENT_ID;
  assert.throws(() => {
    getGoogleOAuthUrl('https://aisana.example.com');
  }, /GOOGLE_CLIENT_ID_NOT_CONFIGURED/);
});
