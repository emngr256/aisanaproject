import { test } from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken, getGoogleOAuthUrl, AuthUser } from '../src/lib/auth';

test('signs and verifies user session token correctly', () => {
  const user: AuthUser = {
    id: 'google-sub-12345',
    name: 'Тестовый Пользователь',
    email: 'user@example.com',
    picture: 'https://lh3.googleusercontent.com/test-pic',
  };

  const token = signToken(user);
  assert.ok(typeof token === 'string' && token.includes('.'));

  const verified = verifyToken<AuthUser>(token);
  assert.deepEqual(verified, user);
});

test('rejects tampered or malformed tokens', () => {
  assert.equal(verifyToken(''), null);
  assert.equal(verifyToken('not-a-token'), null);
  assert.equal(verifyToken('a.b.c'), null);

  const user: AuthUser = { id: '1', name: 'User', email: 'test@mail.com' };
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
