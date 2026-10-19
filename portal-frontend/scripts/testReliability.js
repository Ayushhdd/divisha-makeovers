import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { createServer } from 'vite';

// Load the real client modules with their Vite environment. All requests use
// an in-memory adapter; no production account, API or email is contacted.
const values = new Map();
globalThis.localStorage = {
  getItem: key => values.get(key) ?? null,
  setItem: (key, value) => values.set(key, String(value)),
  removeItem: key => values.delete(key),
};
globalThis.window = { location: { pathname: '/portal/divisha/login' } };
const vite = await createServer({
  root: fileURLToPath(new URL('../', import.meta.url)),
  server: { middlewareMode: true },
});
try {
  const { default: api } = await vite.ssrLoadModule('/src/api/axios.js');
  const { default: services, fetchServices } = await vite.ssrLoadModule('/src/store/serviceSlice.js');
  const { default: auth, loginUser } = await vite.ssrLoadModule('/src/store/authSlice.js');
  assert.equal(api.defaults.timeout, 90000);
  let requests = 0;
  const reject = (details) => {
    api.defaults.adapter = async config => {
      requests++;
      throw Object.assign(new Error('Simulated failure'), details, { config });
    };
  };
  for (const [details, message] of [
    [{ code: 'ECONNABORTED' }, /taking longer/],
    [{ code: 'ERR_NETWORK' }, /temporarily unavailable/],
    [{ response: { status: 503, data: '<html>Gateway unavailable</html>' } }, /temporarily unavailable/],
    [{ response: { status: 429, headers: { 'retry-after': '120' }, data: {} } }, /2 minute/],
  ]) {
    reject(details);
    const before = requests;
    await assert.rejects(api.post('/auth/login', {}), error => {
      assert.match(error.response.data.message, message);
      return true;
    });
    assert.equal(requests, before + 1, 'Failed submissions must not be automatically repeated');
  }
  let state = services(undefined, fetchServices.pending('older', {}));
  state = services(state, fetchServices.pending('newer', {}));
  state = services(state, fetchServices.fulfilled([{ _id: 'newer' }], 'newer', {}));
  state = services(state, fetchServices.fulfilled([{ _id: 'older' }], 'older', {}));
  assert.equal(state.list[0]._id, 'newer', 'A slow earlier search cannot overwrite newer results');
  state = services(state, fetchServices.pending('failure', {}));
  state = services(state, fetchServices.rejected(new Error('Network unavailable'), 'failure', {}));
  assert.equal(state.loading, false);
  assert.ok(state.error, 'Failed loads must produce a visible error');
  state = services(state, fetchServices.pending('retry', {}));
  assert.equal(state.error, null, 'A retry clears the previous error');
  reject({ code: 'ECONNABORTED' });
  let authState = auth(undefined, { type: 'init' });
  const dispatch = action => { authState = auth(authState, action); return action; };
  await loginUser({ email: 'test@example.invalid', password: 'test-only', adminOnly: false })(dispatch, () => ({}), undefined);
  assert.equal(authState.loading, false, 'A sign-in timeout must release the sign-in button');
  assert.match(authState.error, /taking longer/);
  console.log('PASS: bounded cold-start wait; timeout/network/503/429 messages; no automatic duplicate submissions; stale service search protection; recoverable loading and sign-in states.');
} finally {
  await vite.close();
  delete globalThis.window;
  delete globalThis.localStorage;
}
