import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createEntryId } from '../src/lib/entry-id';

const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

test('creates distinct journal IDs on HTTP where randomUUID is absent', () => {
  const httpCrypto = { getRandomValues: globalThis.crypto.getRandomValues.bind(globalThis.crypto) };
  const ids = Array.from({ length: 1000 }, () => createEntryId(httpCrypto));
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.every(id => uuidV4.test(id)));
});

test('creates a valid ID with the native secure-context API', () => {
  assert.match(createEntryId(), uuidV4);
});
